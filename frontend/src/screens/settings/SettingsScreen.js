import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors } from "../../theme/colors";
import { useAuth } from "../../context/AuthContext";
import { useLocalization } from "../../context/LocalizationContext";

const SMS_NOTIFICATION_NUMBER_KEY = "@sms_notification_number";

export default function SettingsScreen({ navigation }) {
  const {
    user,
    userType,
    checkBiometricSupport,
    isBiometricEnabled,
    disableBiometric,
  } = useAuth();
  const { language, changeLanguage, t } = useLocalization();
  const [smsNumber, setSmsNumber] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [tempSmsNumber, setTempSmsNumber] = useState("");
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [biometricSupported, setBiometricSupported] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: t("settings.title"),
    });
  }, [navigation, t]);

  useEffect(() => {
    loadSmsNumber();
    checkBiometric();
  }, []);

  const checkBiometric = async () => {
    const supported = await checkBiometricSupport();
    const enabled = await isBiometricEnabled();
    setBiometricSupported(supported);
    setBiometricEnabled(enabled);
  };

  const loadSmsNumber = async () => {
    try {
      const savedNumber = await AsyncStorage.getItem(
        SMS_NOTIFICATION_NUMBER_KEY
      );
      if (savedNumber) {
        setSmsNumber(savedNumber);
        setTempSmsNumber(savedNumber);
      }
    } catch (error) {
      console.error("Failed to load SMS number:", error);
    }
  };

  const saveSmsNumber = async () => {
    try {
      await AsyncStorage.setItem(SMS_NOTIFICATION_NUMBER_KEY, tempSmsNumber);
      setSmsNumber(tempSmsNumber);
      setIsEditing(false);
      Alert.alert(t("common.success"), t("messages.saveSuccess"));
    } catch (error) {
      console.error("Failed to save SMS number:", error);
      Alert.alert(t("common.error"), t("messages.saveError"));
    }
  };

  const handleEditPress = () => {
    setTempSmsNumber(smsNumber);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setTempSmsNumber(smsNumber);
    setIsEditing(false);
  };

  const handleLanguageChange = async (lang) => {
    await changeLanguage(lang);
    setShowLanguageModal(false);
    Alert.alert(
      t("settings.languageChanged"),
      t("settings.languageChangedMessage")
    );
  };

  const handleDisableBiometric = async () => {
    Alert.alert(
      t("settings.disableBiometric"),
      t("settings.disableBiometricMessage"),
      [
        {
          text: t("common.cancel"),
          style: "cancel",
        },
        {
          text: t("common.yes"),
          style: "destructive",
          onPress: async () => {
            const result = await disableBiometric();
            if (result.success) {
              setBiometricEnabled(false);
              Alert.alert(t("common.success"), t("settings.biometricDisabled"));
            } else {
              Alert.alert(t("common.error"), t("messages.saveError"));
            }
          },
        },
      ]
    );
  };

  const settingsSections = [
    {
      title: t("settings.account"),
      items: [
        { label: t("settings.username"), value: user?.username || "N/A" },
        { label: t("settings.userType"), value: userType || "N/A" },
      ],
    },
    {
      title: t("settings.appInfo"),
      items: [
        { label: t("settings.version"), value: "1.0.0" },
        { label: t("settings.build"), value: "2025.11.09" },
      ],
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Language Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("settings.languageDesc")}</Text>
          <TouchableOpacity
            style={styles.card}
            onPress={() => setShowLanguageModal(true)}
          >
            <View style={styles.settingItem}>
              <View style={styles.iconAndText}>
                <View style={styles.iconContainer}>
                  <Text style={styles.iconText}>🌐</Text>
                </View>
                <View>
                  <Text style={styles.settingLabel}>
                    {t("settings.language")}
                  </Text>
                  <Text style={styles.settingSubtitle}>
                    {language === "si" ? "සිංහල" : "English"}
                  </Text>
                </View>
              </View>
              <Text style={styles.chevron}>›</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Biometric Security Settings */}
        {biometricSupported && biometricEnabled && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("settings.security")}</Text>
            <View style={styles.card}>
              <View style={styles.smsCardHeader}>
                <View style={styles.smsIconContainer}>
                  <Text style={styles.smsIcon}>🔒</Text>
                </View>
                <View style={styles.smsInfo}>
                  <Text style={styles.smsLabel}>
                    {t("settings.biometricLogin")}
                  </Text>
                  <Text style={styles.smsValue}>
                    {t("settings.biometricEnabled")}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.editButton, { backgroundColor: "#EF4444" }]}
                  onPress={handleDisableBiometric}
                >
                  <Text style={styles.editButtonText}>
                    {t("common.disable")}
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.hintContainer}>
                <Text style={styles.hintText}>
                  {t("settings.biometricHint")}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* SMS Notification Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t("settings.notifications")}</Text>
          <View style={styles.card}>
            {!isEditing ? (
              <>
                <View style={styles.smsCardHeader}>
                  <View style={styles.smsIconContainer}>
                    <Text style={styles.smsIcon}>📱</Text>
                  </View>
                  <View style={styles.smsInfo}>
                    <Text style={styles.smsLabel}>
                      {t("settings.bankDepositSMS")}
                    </Text>
                    <Text style={styles.smsValue}>
                      {smsNumber || t("settings.notConfigured")}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={handleEditPress}
                  >
                    <Text style={styles.editButtonText}>
                      {smsNumber ? t("common.edit") : t("common.add")}
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.hintContainer}>
                  <Text style={styles.hintText}>{t("settings.smsHint")}</Text>
                </View>
              </>
            ) : (
              <View style={styles.editModeContainer}>
                <Text style={styles.editModeTitle}>
                  {t("settings.editSMSTitle")}
                </Text>
                <TextInput
                  style={styles.input}
                  value={tempSmsNumber}
                  onChangeText={setTempSmsNumber}
                  placeholder={t("settings.smsPlaceholder")}
                  keyboardType="phone-pad"
                  autoFocus
                />
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={[styles.button, styles.saveButton]}
                    onPress={saveSmsNumber}
                  >
                    <Text style={styles.buttonText}>{t("common.save")}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={handleCancelEdit}
                  >
                    <Text style={[styles.buttonText, styles.cancelButtonText]}>
                      {t("common.cancel")}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Existing Sections */}
        {settingsSections.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.card}>
              {section.items.map((item, itemIndex) => (
                <View
                  key={itemIndex}
                  style={[
                    styles.settingItem,
                    itemIndex < section.items.length - 1 && styles.borderBottom,
                  ]}
                >
                  <Text style={styles.settingLabel}>{item.label}</Text>
                  <Text style={styles.settingValue}>{item.value}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>

      {/* Language Selection Modal */}
      <Modal
        visible={showLanguageModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {t("settings.selectLanguage")}
            </Text>

            <TouchableOpacity
              style={[
                styles.languageOption,
                language === "en" && styles.selectedLanguage,
              ]}
              onPress={() => handleLanguageChange("en")}
            >
              <Text style={styles.languageFlag}>🇬🇧</Text>
              <Text
                style={[
                  styles.languageText,
                  language === "en" && styles.selectedLanguageText,
                ]}
              >
                {t("settings.english")}
              </Text>
              {language === "en" && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.languageOption,
                language === "si" && styles.selectedLanguage,
              ]}
              onPress={() => handleLanguageChange("si")}
            >
              <Text style={styles.languageFlag}>🇱🇰</Text>
              <Text
                style={[
                  styles.languageText,
                  language === "si" && styles.selectedLanguageText,
                ]}
              >
                {t("settings.sinhala")}
              </Text>
              {language === "si" && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowLanguageModal(false)}
            >
              <Text style={styles.modalCancelText}>{t("common.cancel")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    elevation: 1,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingLabel: {
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: "500",
  },
  settingValue: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  borderTop: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  valueContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  editButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
  },
  editButtonText: {
    color: colors.textLight,
    fontSize: 13,
    fontWeight: "600",
  },
  editContainer: {
    flex: 1,
    marginLeft: 12,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    marginBottom: 8,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: "center",
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  cancelButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  buttonText: {
    color: colors.textLight,
    fontSize: 14,
    fontWeight: "600",
  },
  cancelButtonText: {
    color: colors.textPrimary,
  },
  hintText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: "italic",
    lineHeight: 18,
  },
  smsCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  smsIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
  },
  smsIcon: {
    fontSize: 24,
  },
  smsInfo: {
    flex: 1,
  },
  smsLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  smsValue: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  hintContainer: {
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  editModeContainer: {
    padding: 16,
  },
  editModeTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 12,
  },
  iconAndText: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
  },
  iconText: {
    fontSize: 24,
  },
  settingSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  chevron: {
    fontSize: 28,
    color: colors.textSecondary,
    fontWeight: "300",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 20,
    textAlign: "center",
  },
  languageOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: "transparent",
    backgroundColor: "#F8FAFC",
  },
  selectedLanguage: {
    borderColor: colors.primary,
    backgroundColor: "#EFF6FF",
  },
  languageFlag: {
    fontSize: 32,
    marginRight: 12,
  },
  languageText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    color: colors.textPrimary,
  },
  selectedLanguageText: {
    fontWeight: "700",
    color: colors.primary,
  },
  checkmark: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.primary,
  },
  modalCancelButton: {
    marginTop: 12,
    padding: 14,
    backgroundColor: "#F1F5F9",
    borderRadius: 10,
    alignItems: "center",
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textSecondary,
  },
});
