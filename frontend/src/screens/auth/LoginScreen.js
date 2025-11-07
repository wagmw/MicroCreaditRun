import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useAuth } from "../../context/AuthContext";
import { colors, formStyles, utilityStyles } from "../../theme";

export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("Error", "Please enter both username and password");
      return;
    }

    setIsLoading(true);
    try {
      const result = await login(username, password);
      if (!result.success) {
        Alert.alert("Login Failed", result.error);
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[utilityStyles.flex1, utilityStyles.bgBackground]}
    >
      <StatusBar style="dark" />
      <View
        style={[
          utilityStyles.flex1,
          utilityStyles.justifyCenter,
          utilityStyles.px20,
        ]}
      >
        <Image
          source={require("../../../assets/icon.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <TextInput
          style={[formStyles.input, utilityStyles.mb12]}
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          editable={!isLoading}
        />

        <TextInput
          style={[formStyles.input, utilityStyles.mb12]}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!isLoading}
        />

        <TouchableOpacity
          style={[
            formStyles.submitButton,
            isLoading && formStyles.submitButtonDisabled,
            utilityStyles.mt8,
          ]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={formStyles.submitButtonText}>Login</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = {
  logo: {
    width: 200,
    height: 150,
    alignSelf: "center",
    marginBottom: 20,
  },
};
