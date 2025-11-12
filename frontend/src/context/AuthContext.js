import React, { createContext, useState, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
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

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
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
