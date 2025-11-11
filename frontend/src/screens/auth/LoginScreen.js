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
import { useLocalization } from "../../context/LocalizationContext";
import { colors, formStyles, utilityStyles } from "../../theme";

export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { t } = useLocalization();

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert(t("auth.error"), t("auth.validationError"));
      return;
    }

    setIsLoading(true);
    try {
      const result = await login(username, password);
      if (!result.success) {
        Alert.alert(t("auth.loginFailed"), result.error);
      }
    } catch (error) {
      Alert.alert(t("auth.error"), t("auth.generalError"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[utilityStyles.flex1, { backgroundColor: "#ffde00" }]}
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

        <Text style={styles.label}>{t("auth.username")}</Text>
        <TextInput
          style={[formStyles.input, utilityStyles.mb12]}
          placeholder={t("auth.username")}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          editable={!isLoading}
        />

        <Text style={styles.label}>{t("auth.password")}</Text>
        <TextInput
          style={[formStyles.input, utilityStyles.mb12]}
          placeholder={t("auth.password")}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!isLoading}
        />

        <TouchableOpacity
          style={[
            formStyles.submitButton,
            { backgroundColor: "#384043" },
            isLoading && formStyles.submitButtonDisabled,
            utilityStyles.mt8,
          ]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={formStyles.submitButtonText}>
              {t("auth.loginButton")}
            </Text>
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
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#384043",
    marginBottom: 8,
    marginLeft: 4,
  },
};
