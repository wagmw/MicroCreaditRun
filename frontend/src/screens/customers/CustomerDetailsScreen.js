import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  Linking,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../../theme/colors";
import api from "../../api/client";
import { useLocalization } from "../../context/LocalizationContext";

export default function CustomerDetailsScreen({ route, navigation }) {
  const { t } = useLocalization();
  const { customerId } = route.params;
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  // Set navigation header title with translation
  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: t("customers.customerDetails"),
    });
  }, [navigation, t]);

  useEffect(() => {
    fetchCustomerDetails();
  }, [customerId]);

  // Refresh customer details when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      fetchCustomerDetails();
    });

    return unsubscribe;
  }, [navigation]);

  const fetchCustomerDetails = async () => {
    try {
      const response = await api.get(`/customers/${customerId}`);
      setCustomer(response.data);
    } catch (error) {
      console.error("Failed to fetch customer details:", error);
      Alert.alert(t("common.error"), t("messages.loadError"));
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handlePhoneCall = (phoneNumber) => {
    const phoneUrl = `tel:${phoneNumber}`;
    Linking.openURL(phoneUrl).catch((err) =>
      Alert.alert(t("common.error"), t("customers.unableToCall"))
    );
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const formatEnumValue = (value) => {
    if (!value) return "N/A";
    return value
      .split("_")
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(" ");
  };

  const handleDelete = () => {
    Alert.alert(
      t("common.delete") + " " + t("customers.title"),
      `${t("messages.confirmDelete")} ${customer.fullName}?`,
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.delete"),
          style: "destructive",
          onPress: async () => {
            try {
              const response = await api.delete(`/customers/${customerId}`);
              if (response.data.softDelete) {
                Alert.alert(
                  t("customers.customerHidden"),
                  t("customers.customerHiddenMessage"),
                  [{ text: t("common.ok"), onPress: () => navigation.goBack() }]
                );
              } else {
                Alert.alert(t("common.success"), t("messages.deleteSuccess"), [
                  { text: t("common.ok"), onPress: () => navigation.goBack() },
                ]);
              }
            } catch (error) {
              console.error("Error deleting customer:", error);
              Alert.alert(t("common.error"), t("messages.deleteError"));
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>{t("common.loading")}</Text>
      </View>
    );
  }

  if (!customer) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{t("customers.notFound")}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView>
        {/* Header Card */}
        <View style={styles.headerCard}>
          <View style={styles.photoSection}>
            {customer.photoUrl ? (
              <Image
                source={{
                  uri: customer.photoUrl.startsWith("http")
                    ? customer.photoUrl
                    : `${api.defaults.baseURL.replace("/api", "")}${
                        customer.photoUrl
                      }`,
                }}
                style={styles.customerPhoto}
              />
            ) : (
              <View style={styles.customerPhotoPlaceholder}>
                <Text style={styles.customerInitials}>
                  {getInitials(customer.fullName)}
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.customerName}>{customer.fullName}</Text>
          {customer.otherNames && (
            <Text style={styles.otherNames}>({customer.otherNames})</Text>
          )}

          {/* Status Badge */}
          <View
            style={[
              styles.statusBadge,
              customer.active ? styles.statusActive : styles.statusInactive,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: customer.active ? colors.success : colors.error },
              ]}
            >
              {customer.active
                ? `✓ ${t("customers.active")}`
                : `✗ ${t("customers.inactive")}`}
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity
              style={[styles.headerButton, styles.loansButton]}
              onPress={() =>
                navigation.navigate("CustomerLoans", {
                  customerId: customer.id,
                  customerName: customer.fullName,
                })
              }
            >
              <Text style={styles.loansButtonText}>
                {t("customers.viewLoans")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.headerButton, styles.editButton]}
              onPress={() =>
                navigation.navigate("EditCustomer", { customerId: customer.id })
              }
            >
              <Text style={styles.headerButtonText}>{t("common.edit")}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.headerButton, styles.deleteButton]}
              onPress={() => handleDelete()}
            >
              <Text style={styles.headerButtonText}>{t("common.delete")}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Personal Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            ⊞ {t("customers.personalInfo")}
          </Text>
          <View style={styles.sectionContent}>
            <DetailRow
              label={t("customers.nationalIdNo")}
              value={customer.nationalIdNo}
            />
            <DetailRow
              label={t("customers.dateOfBirth")}
              value={formatDate(customer.dateOfBirth)}
            />
            <DetailRow
              label={t("customers.gender")}
              value={formatEnumValue(customer.gender)}
            />
            <DetailRow
              label={t("customers.maritalStatus")}
              value={formatEnumValue(customer.maritalStatus)}
            />
            <DetailRow
              label={t("customers.ethnicity")}
              value={formatEnumValue(customer.ethnicity)}
            />
            <DetailRow
              label={t("customers.religion")}
              value={formatEnumValue(customer.religion)}
            />
            <DetailRow
              label={t("customers.occupation")}
              value={customer.occupation}
            />
          </View>
        </View>

        {/* Contact Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            ☎ {t("customers.contactInfo")}
          </Text>
          <View style={styles.sectionContent}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>
                {t("customers.mobilePhone")}
              </Text>
              <TouchableOpacity
                onPress={() => handlePhoneCall(customer.mobilePhone)}
                style={styles.phoneButton}
              >
                <Text style={styles.phoneLink}>☎ {customer.mobilePhone}</Text>
              </TouchableOpacity>
            </View>

            {customer.homePhone && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>
                  {t("customers.homePhone")}
                </Text>
                <TouchableOpacity
                  onPress={() => handlePhoneCall(customer.homePhone)}
                  style={styles.phoneButton}
                >
                  <Text style={styles.phoneLink}>☎ {customer.homePhone}</Text>
                </TouchableOpacity>
              </View>
            )}

            {customer.secondaryMobile && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>
                  {t("customers.secondaryMobile")}
                </Text>
                <TouchableOpacity
                  onPress={() => handlePhoneCall(customer.secondaryMobile)}
                  style={styles.phoneButton}
                >
                  <Text style={styles.phoneLink}>
                    ☎ {customer.secondaryMobile}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {customer.whatsappNumber && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>
                  {t("customers.whatsappNumber")}
                </Text>
                <TouchableOpacity
                  onPress={() => handlePhoneCall(customer.whatsappNumber)}
                  style={styles.phoneButton}
                >
                  <Text style={styles.phoneLink}>
                    ☎ {customer.whatsappNumber}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            <DetailRow
              label={t("customers.permanentAddress")}
              value={customer.permanentAddress}
              fullWidth
            />
          </View>
        </View>

        {/* Account Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            ⓘ {t("customers.accountInfo")}
          </Text>
          <View style={styles.sectionContent}>
            <DetailRow
              label={t("customers.createdDate")}
              value={formatDate(customer.createdAt)}
            />
            <DetailRow
              label={t("customers.lastUpdated")}
              value={formatDate(customer.updatedAt)}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const DetailRow = ({ label, value, valueStyle = {}, fullWidth = false }) => (
  <View style={[styles.detailRow, fullWidth && styles.detailRowColumn]}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text
      style={[styles.detailValue, valueStyle, fullWidth && { marginTop: 4 }]}
    >
      {value || "N/A"}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: colors.textSecondary,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
  },
  headerCard: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    alignItems: "center",
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  photoSection: {
    marginBottom: 12,
  },
  customerPhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: colors.primary,
  },
  customerPhotoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: colors.primaryDark,
  },
  customerInitials: {
    color: colors.textLight,
    fontSize: 36,
    fontWeight: "700",
  },
  customerName: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.textPrimary,
    textAlign: "center",
    marginBottom: 4,
  },
  otherNames: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 8,
    fontStyle: "italic",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    marginBottom: 12,
  },
  statusActive: {
    backgroundColor: "#E8F5E9",
  },
  statusInactive: {
    backgroundColor: "#FFEBEE",
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
  },
  actionButtonsRow: {
    flexDirection: "row",
    gap: 8,
  },
  headerButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 95,
    alignItems: "center",
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  loansButton: {
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.primaryDark,
  },
  loansButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  editButton: {
    backgroundColor: colors.success,
  },
  deleteButton: {
    backgroundColor: colors.error,
  },
  headerButtonText: {
    color: colors.textLight,
    fontSize: 14,
    fontWeight: "700",
  },
  section: {
    backgroundColor: "#FFFFFF",
    margin: 12,
    marginTop: 12,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: "rgba(0, 0, 0, 0.06)",
  },
  sectionContent: {
    gap: 10,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 2,
  },
  detailRowColumn: {
    flexDirection: "column",
    alignItems: "flex-start",
    paddingVertical: 2,
  },
  detailLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 13,
    color: colors.textPrimary,
    fontWeight: "600",
    flex: 1,
    textAlign: "right",
  },
  phoneButton: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
    backgroundColor: "rgba(75, 175, 80, 0.1)",
  },
  phoneLink: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: "600",
  },
});
