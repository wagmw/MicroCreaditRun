import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors } from "../../theme/colors";
import { useAuth } from "../../context/AuthContext";

const SMS_NOTIFICATION_NUMBER_KEY = "@sms_notification_number";

export default function SettingsScreen() {
  const { user, userType } = useAuth();
  const [smsNumber, setSmsNumber] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [tempSmsNumber, setTempSmsNumber] = useState("");

  useEffect(() => {
    loadSmsNumber();
  }, []);

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
      Alert.alert("Success", "SMS notification number saved successfully");
    } catch (error) {
      console.error("Failed to save SMS number:", error);
      Alert.alert("Error", "Failed to save SMS number");
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

  const settingsSections = [
    {
      title: "Account",
      items: [
        { label: "Username", value: user?.username || "N/A" },
        { label: "User Type", value: userType || "N/A" },
      ],
    },
    {
      title: "App Information",
      items: [
        { label: "Version", value: "1.0.0" },
        { label: "Build", value: "2025.11.09" },
      ],
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* SMS Notification Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.card}>
            {!isEditing ? (
              <>
                <View style={styles.smsCardHeader}>
                  <View style={styles.smsIconContainer}>
                    <Text style={styles.smsIcon}>📱</Text>
                  </View>
                  <View style={styles.smsInfo}>
                    <Text style={styles.smsLabel}>Bank Deposit SMS Number</Text>
                    <Text style={styles.smsValue}>
                      {smsNumber || "Not configured"}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={handleEditPress}
                  >
                    <Text style={styles.editButtonText}>
                      {smsNumber ? "Edit" : "Add"}
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.hintContainer}>
                  <Text style={styles.hintText}>
                    💡 Receive SMS notifications when bank deposits are made
                  </Text>
                </View>
              </>
            ) : (
              <View style={styles.editModeContainer}>
                <Text style={styles.editModeTitle}>
                  Edit SMS Notification Number
                </Text>
                <TextInput
                  style={styles.input}
                  value={tempSmsNumber}
                  onChangeText={setTempSmsNumber}
                  placeholder="Enter phone number (e.g., +94771234567)"
                  keyboardType="phone-pad"
                  autoFocus
                />
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={[styles.button, styles.saveButton]}
                    onPress={saveSmsNumber}
                  >
                    <Text style={styles.buttonText}>Save</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={handleCancelEdit}
                  >
                    <Text style={[styles.buttonText, styles.cancelButtonText]}>
                      Cancel
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
});
