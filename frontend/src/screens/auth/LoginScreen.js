import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Image,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { useLocalization } from "../../context/LocalizationContext";
import { colors, formStyles, utilityStyles } from "../../theme";

export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [biometricSupported, setBiometricSupported] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const {
    login,
    checkBiometricSupport,
    isBiometricEnabled,
    authenticateWithBiometric,
    enableBiometric,
  } = useAuth();
  const { t } = useLocalization();

  useEffect(() => {
    checkBiometric();
  }, []);

  const checkBiometric = async () => {
    const supported = await checkBiometricSupport();
    const enabled = await isBiometricEnabled();
    setBiometricSupported(supported);
    setBiometricEnabled(enabled);
  };

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
      } else {
        // If login successful and biometric is supported but not enabled, ask to enable
        if (biometricSupported && !biometricEnabled) {
          Alert.alert(
            t("auth.enableBiometric"),
            t("auth.enableBiometricMessage"),
            [
              {
                text: t("common.no"),
                style: "cancel",
              },
              {
                text: t("common.yes"),
                onPress: async () => {
                  await enableBiometric(username, password);
                  setBiometricEnabled(true);
                },
              },
            ]
          );
        }
      }
    } catch (error) {
      Alert.alert(t("auth.error"), t("auth.generalError"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    setIsLoading(true);
    try {
      const result = await authenticateWithBiometric();
      if (!result.success) {
        Alert.alert(t("auth.biometricFailed"), result.error);
      }
    } catch (error) {
      Alert.alert(t("auth.error"), t("auth.generalError"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={[utilityStyles.flex1, { backgroundColor: "#ffbf00" }]}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View>
          <Image
            source={require("../../../assets/banner.png")}
            style={styles.logo}
            resizeMode="contain"
          />

          <Text style={styles.label}>{t("auth.username")}</Text>
          <TextInput
            style={[formStyles.input, utilityStyles.mb12, styles.inputOverride]}
            placeholder={t("auth.username")}
            placeholderTextColor="#9CA3AF"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isLoading}
          />

          <Text style={styles.label}>{t("auth.password")}</Text>
          <TextInput
            style={[formStyles.input, utilityStyles.mb12, styles.inputOverride]}
            placeholder={t("auth.password")}
            placeholderTextColor="#9CA3AF"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCorrect={false}
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

          {biometricSupported && (
            <TouchableOpacity
              style={[styles.biometricButton, isLoading && { opacity: 0.5 }]}
              onPress={handleBiometricLogin}
              disabled={isLoading || !biometricEnabled}
            >
              <MaterialCommunityIcons
                name="fingerprint"
                size={48}
                color={biometricEnabled ? "#384043" : "#9CA3AF"}
              />
              <Text
                style={[
                  styles.biometricText,
                  !biometricEnabled && { color: "#9CA3AF" },
                ]}
              >
                {biometricEnabled
                  ? t("auth.loginWithFingerprint")
                  : "Setup fingerprint login first"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = {
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  logo: {
    width: 250,
    height: 250,
    alignSelf: "center",
    marginBottom: -20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#384043",
    marginBottom: 8,
    marginLeft: 4,
  },
  inputOverride: {
    minHeight: 50,
    backgroundColor: "#FFFFFF",
    color: "#000000",
  },
  biometricButton: {
    marginTop: 24,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "rgba(56, 64, 67, 0.3)",
  },
  biometricText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#384043",
    marginTop: 8,
  },
  debugInfo: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#384043",
  },
  debugText: {
    fontSize: 12,
    color: "#384043",
    marginVertical: 2,
  },
  enableBiometricButton: {
    marginTop: 8,
    backgroundColor: "#384043",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  enableBiometricText: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "600",
  },
};
