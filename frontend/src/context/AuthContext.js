import React, { createContext, useState, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as LocalAuthentication from "expo-local-authentication";
import api from "../api/client";

const AuthContext = createContext(null);

export const UserTypes = {
  COLLECTOR: "COLLECTOR",
  MANAGER: "MANAGER",
  ADMIN: "ADMIN",
};

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    user: null,
    loading: true,
    userType: null,
  });

  React.useEffect(() => {
    checkToken();
  }, []);

  const checkToken = async () => {
    try {
      const [token, userData] = await Promise.all([
        AsyncStorage.getItem("userToken"),
        AsyncStorage.getItem("userData"),
      ]);

      if (!token || !userData) {
        setAuthState((state) => ({ ...state, loading: false }));
        return;
      }

      try {
        const parsedUser = JSON.parse(userData);
        if (parsedUser && typeof parsedUser === "object" && parsedUser.type) {
          setAuthState({
            user: parsedUser,
            loading: false,
            userType: parsedUser.type,
          });
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        } else {
          await AsyncStorage.multiRemove(["userToken", "userData"]);
          setAuthState({ user: null, loading: false, userType: null });
        }
      } catch (parseError) {
        await AsyncStorage.multiRemove(["userToken", "userData"]);
        setAuthState({ user: null, loading: false, userType: null });
      }
    } catch (e) {
      console.error("Error restoring token", e);
      setAuthState({ user: null, loading: false, userType: null });
    }
  };

  const login = async (username, password) => {
    try {
      console.log("Attempting login with:", {
        username,
        passwordLength: password?.length,
      });
      console.log("API URL:", api.defaults.baseURL);

      const response = await api.post("/auth/login", {
        username: username.trim(),
        password: password.trim(),
      });

      console.log("Login response:", response.data);
      const { token, user: userData } = response.data;

      if (
        !userData?.type ||
        !Object.values(UserTypes).includes(userData.type)
      ) {
        throw new Error("Invalid user data or type received from server");
      }

      const userToStore = {
        ...userData,
        type: String(userData.type), // Ensure type is string
      };

      // Save token and user data atomically
      await Promise.all([
        AsyncStorage.setItem("userToken", String(token)),
        AsyncStorage.setItem("userData", JSON.stringify(userToStore)),
      ]);

      // Set auth header for future requests
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      setAuthState({
        user: userToStore,
        loading: false,
        userType: userToStore.type,
      });

      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      return {
        success: false,
        error: error.response?.data?.message || error.message || "Login failed",
      };
    }
  };

  const logout = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem("userToken"),
        AsyncStorage.removeItem("userData"),
        // Don't remove biometric settings on logout
        // AsyncStorage.removeItem("biometricEnabled"),
        // AsyncStorage.removeItem("biometricUsername"),
        // AsyncStorage.removeItem("biometricPassword"),
      ]);
      delete api.defaults.headers.common["Authorization"];
      setAuthState({
        user: null,
        loading: false,
        userType: null,
      });
    } catch (e) {
      console.error("Error logging out:", e);
    }
  };

  const checkBiometricSupport = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      console.log("Biometric Hardware:", compatible);
      console.log("Biometric Enrolled:", enrolled);
      return compatible && enrolled;
    } catch (error) {
      console.error("Error checking biometric support:", error);
      return false;
    }
  };

  const enableBiometric = async (username, password) => {
    try {
      await AsyncStorage.multiSet([
        ["biometricEnabled", "true"],
        ["biometricUsername", username],
        ["biometricPassword", password],
      ]);
      return { success: true };
    } catch (error) {
      console.error("Error enabling biometric:", error);
      return { success: false, error: error.message };
    }
  };

  const disableBiometric = async () => {
    try {
      await AsyncStorage.multiRemove([
        "biometricEnabled",
        "biometricUsername",
        "biometricPassword",
      ]);
      return { success: true };
    } catch (error) {
      console.error("Error disabling biometric:", error);
      return { success: false, error: error.message };
    }
  };

  const isBiometricEnabled = async () => {
    try {
      const enabled = await AsyncStorage.getItem("biometricEnabled");
      return enabled === "true";
    } catch (error) {
      console.error("Error checking biometric status:", error);
      return false;
    }
  };

  const authenticateWithBiometric = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Authenticate to login",
        cancelLabel: "Cancel",
        disableDeviceFallback: false,
      });

      if (result.success) {
        const [username, password] = await Promise.all([
          AsyncStorage.getItem("biometricUsername"),
          AsyncStorage.getItem("biometricPassword"),
        ]);

        if (username && password) {
          return await login(username, password);
        } else {
          return {
            success: false,
            error: "Biometric credentials not found",
          };
        }
      } else {
        return {
          success: false,
          error: "Biometric authentication failed",
        };
      }
    } catch (error) {
      console.error("Error authenticating with biometric:", error);
      return { success: false, error: error.message };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
        checkBiometricSupport,
        enableBiometric,
        disableBiometric,
        isBiometricEnabled,
        authenticateWithBiometric,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
