import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { colors } from "../../theme/colors";
import { useAuth } from "../../context/AuthContext";

export default function SettingsScreen() {
  const { user, userType } = useAuth();

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
        { label: "Build", value: "2025.11.05" },
      ],
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
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
});
