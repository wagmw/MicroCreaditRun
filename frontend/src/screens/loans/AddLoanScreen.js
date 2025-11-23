import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Picker } from "@react-native-picker/picker";
import api from "../../api/client";
import { formatCurrency } from "../../utils/currency";
import { colors } from "../../theme/colors";
import { useLocalization } from "../../context/LocalizationContext";

import logger from "../../utils/logger";
export default function AddLoanScreen({ navigation, route }) {
  const { t } = useLocalization();

  const FREQUENCY_OPTIONS = [
    { label: t("loans.selectFrequency"), value: "" },
    { label: t("loans.daily"), value: "DAILY" },
    { label: t("loans.weekly"), value: "WEEKLY" },
    { label: t("loans.monthly"), value: "MONTHLY" },
  ];
  const preselectedCustomerId = route?.params?.customerId;
  const preselectedCustomerName = route?.params?.customerName;
  const isRenewal = route?.params?.isRenewal || false;
  const oldLoanId = route?.params?.oldLoanId;
  const oldLoanNumber = route?.params?.oldLoanNumber;
  const outstandingAmount = route?.params?.outstandingAmount || 0;
  const newCapital = route?.params?.newCapital || 0;
  const totalLoanAmount = route?.params?.totalLoanAmount || 0;

  const [formData, setFormData] = useState({
    applicantId: preselectedCustomerId || "",
    amount: isRenewal ? totalLoanAmount.toString() : "",
    interest30: "",
    startDate: new Date().toISOString().split("T")[0],
    durationMonths: "",
    durationDays: "",
    frequency: "",
    guarantorIds: [],
  });
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [allCustomers, setAllCustomers] = useState([]);
  const [availableCustomers, setAvailableCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [selectedGuarantorId, setSelectedGuarantorId] = useState("");

  useEffect(() => {
    fetchCustomersAndLoans();
  }, []);

  const fetchCustomersAndLoans = async () => {
    try {
      // Fetch both customers and loans
      const [customersResponse, loansResponse] = await Promise.all([
        api.get("/customers"),
        api.get("/loans"),
      ]);

      const allCustomersData = customersResponse.data;
      const allLoans = loansResponse.data;

      // Find customers with active loans
      const customersWithActiveLoans = new Set();
      allLoans.forEach((loan) => {
        if (loan.status === "ACTIVE") {
          customersWithActiveLoans.add(loan.applicantId);
        }
      });

      // Filter customers without active loans
      const customersWithoutActiveLoans = allCustomersData.filter(
        (customer) => !customersWithActiveLoans.has(customer.id)
      );

      setAllCustomers(allCustomersData);
      setCustomers(allCustomersData); // Keep all customers for guarantor list
      setAvailableCustomers(customersWithoutActiveLoans);
    } catch (error) {
      logger.error("Failed to fetch customers:", error);
      Alert.alert(t("common.error"), t("loans.errorFailedToLoadCustomers"));
    } finally {
      setLoadingCustomers(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const addGuarantor = () => {
    if (!selectedGuarantorId) {
      Alert.alert(t("common.error"), t("loans.errorSelectGuarantor"));
      return;
    }
    if (selectedGuarantorId === formData.applicantId) {
      Alert.alert(t("common.error"), t("loans.errorGuarantorSameAsApplicant"));
      return;
    }
    if (formData.guarantorIds.includes(selectedGuarantorId)) {
      Alert.alert(t("common.error"), t("loans.errorGuarantorAlreadyAdded"));
      return;
    }
    setFormData({
      ...formData,
      guarantorIds: [...formData.guarantorIds, selectedGuarantorId],
    });
    setSelectedGuarantorId("");
  };

  const removeGuarantor = (guarantorId) => {
    setFormData({
      ...formData,
      guarantorIds: formData.guarantorIds.filter((id) => id !== guarantorId),
    });
  };

  const checkCustomerActiveLoans = async (customerId) => {
    try {
      const response = await api.get(`/loans/customer/${customerId}`);
      const customerLoans = response.data;

      // Check if customer has any active loans
      const activeLoans = customerLoans.filter(
        (loan) => loan.status === "ACTIVE"
      );

      return activeLoans.length > 0;
    } catch (error) {
      logger.error("Failed to check customer loans:", error);
      return false;
    }
  };

  const validateForm = () => {
    if (!formData.applicantId) {
      Alert.alert(t("common.error"), t("loans.errorSelectCustomer"));
      return false;
    }
    if (!formData.amount || Number(formData.amount) <= 0) {
      Alert.alert(t("common.error"), t("loans.errorValidLoanAmount"));
      return false;
    }
    if (!formData.interest30 || Number(formData.interest30) < 0) {
      Alert.alert(t("common.error"), t("loans.errorValidInterestRate"));
      return false;
    }
    if (!formData.frequency) {
      Alert.alert(t("common.error"), t("loans.errorSelectFrequency"));
      return false;
    }
    if (!formData.startDate) {
      Alert.alert(t("common.error"), t("loans.errorEnterStartDate"));
      return false;
    }
    if (!formData.durationMonths && !formData.durationDays) {
      Alert.alert(t("common.error"), t("loans.errorEnterDuration"));
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (isRenewal) {
        // Renewal flow: settle old loan and create new loan in a transaction
        const loanData = {
          applicantId: formData.applicantId,
          amount: Number(formData.amount),
          interest30: Number(formData.interest30),
          startDate: formData.startDate,
          durationMonths: formData.durationMonths
            ? Number(formData.durationMonths)
            : null,
          durationDays: formData.durationDays
            ? Number(formData.durationDays)
            : null,
          frequency: formData.frequency,
          guarantorIds: formData.guarantorIds,
          oldLoanId: oldLoanId,
          outstandingAmount: outstandingAmount,
        };

        const response = await api.post(`/loans/${oldLoanId}/renew`, loanData);

        Alert.alert(
          t("loans.loanRenewedSuccess"),
          t("loans.loanRenewedMessage", { oldLoanNumber }),
          [
            {
              text: t("loans.viewLoans"),
              onPress: () => {
                // Navigate to customer's loan list
                navigation.navigate("Loans", {
                  customerId: formData.applicantId,
                  customerName:
                    preselectedCustomerName ||
                    getCustomerName(formData.applicantId),
                });
              },
            },
          ]
        );
      } else {
        // Regular loan creation flow
        // Check if customer has active loans
        const hasActiveLoans = await checkCustomerActiveLoans(
          formData.applicantId
        );

        if (hasActiveLoans) {
          const customerName = getCustomerName(formData.applicantId);
          Alert.alert(
            t("loans.activeLoanExists"),
            t("loans.activeLoanExistsMessage", { customerName }),
            [{ text: t("common.ok") }]
          );
          setLoading(false);
          return;
        }

        const loanData = {
          applicantId: formData.applicantId,
          amount: Number(formData.amount),
          interest30: Number(formData.interest30),
          startDate: formData.startDate,
          durationMonths: formData.durationMonths
            ? Number(formData.durationMonths)
            : null,
          durationDays: formData.durationDays
            ? Number(formData.durationDays)
            : null,
          frequency: formData.frequency,
          guarantorIds: formData.guarantorIds,
        };

        const response = await api.post("/loans/apply", loanData);

        Alert.alert(t("common.success"), t("loans.loanCreatedSuccess"), [
          {
            text: t("common.ok"),
            onPress: () => {
              navigation.navigate("Loans", { refresh: true });
            },
          },
        ]);
      }
    } catch (error) {
      logger.error("Failed to create loan:", error);
      Alert.alert(
        t("common.error"),
        error.response?.data?.error || t("loans.errorFailedToCreateLoan")
      );
    } finally {
      setLoading(false);
    }
  };

  const getCustomerName = (customerId) => {
    const customer = customers.find((c) => c.id === customerId);
    return customer ? customer.fullName : "Unknown";
  };

  if (loadingCustomers) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>{t("loans.loadingCustomers")}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex1}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.form}>
            {/* Renewal Banner */}
            {isRenewal && (
              <View style={styles.renewalBanner}>
                <Text style={styles.renewalBannerTitle}>
                  {t("loans.renewingLoan", { loanNumber: oldLoanNumber })}
                </Text>
                <View style={styles.renewalDetailsBox}>
                  <View style={styles.renewalRow}>
                    <Text style={styles.renewalLabel}>
                      {t("loans.previousOutstanding")}:
                    </Text>
                    <Text style={styles.renewalValue}>
                      Rs. {formatCurrency(outstandingAmount)}
                    </Text>
                  </View>
                  <View style={styles.renewalRow}>
                    <Text style={styles.renewalLabel}>
                      {t("loans.newCapitalAdded")}:
                    </Text>
                    <Text style={styles.renewalValue}>
                      Rs. {formatCurrency(newCapital)}
                    </Text>
                  </View>
                  <View style={[styles.renewalRow, styles.renewalTotalRow]}>
                    <Text style={styles.renewalTotalLabel}>
                      {t("loans.newLoanTotal")}:
                    </Text>
                    <Text style={styles.renewalTotalValue}>
                      Rs. {formatCurrency(totalLoanAmount)}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Customer Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {t("loans.customer")} <Text style={styles.required}>*</Text>
              </Text>
              {preselectedCustomerId ? (
                <View style={styles.preselectedContainer}>
                  <Text style={styles.preselectedText}>
                    {preselectedCustomerName ||
                      getCustomerName(preselectedCustomerId)}
                  </Text>
                </View>
              ) : (
                <>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={formData.applicantId}
                      onValueChange={(value) =>
                        handleChange("applicantId", value)
                      }
                      style={styles.picker}
                    >
                      <Picker.Item label={t("loans.selectCustomer")} value="" />
                      {availableCustomers.map((customer) => (
                        <Picker.Item
                          key={customer.id}
                          label={customer.fullName}
                          value={customer.id}
                        />
                      ))}
                    </Picker>
                  </View>
                </>
              )}
            </View>

            {/* Loan Amount */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {t("loans.loanAmount")} (Rs.){" "}
                <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, isRenewal && styles.inputReadonly]}
                placeholder={t("loans.enterLoanAmount")}
                keyboardType="numeric"
                value={formData.amount}
                onChangeText={(value) => handleChange("amount", value)}
                editable={!isRenewal}
              />
            </View>

            {/* Interest Rate */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {t("loans.interestPer30Days")}{" "}
                <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder={t("loans.enterInterestRate")}
                keyboardType="numeric"
                value={formData.interest30}
                onChangeText={(value) => handleChange("interest30", value)}
              />
            </View>

            {/* Frequency */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {t("loans.frequency")} <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.frequency}
                  onValueChange={(value) => handleChange("frequency", value)}
                  style={styles.picker}
                >
                  {FREQUENCY_OPTIONS.map((option) => (
                    <Picker.Item
                      key={option.value}
                      label={option.label}
                      value={option.value}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Start Date */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {t("loans.startDate")} <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder={t("loans.enterStartDate")}
                value={formData.startDate}
                onChangeText={(value) => handleChange("startDate", value)}
              />
            </View>

            {/* Duration in Months */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t("loans.durationInMonths")}</Text>
              <TextInput
                style={styles.input}
                placeholder={t("loans.enterDurationMonths")}
                keyboardType="numeric"
                value={formData.durationMonths}
                onChangeText={(value) => handleChange("durationMonths", value)}
              />
            </View>

            {/* Duration in Days */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t("loans.durationInDays")}</Text>
              <TextInput
                style={styles.input}
                placeholder={t("loans.enterDurationDays")}
                keyboardType="numeric"
                value={formData.durationDays}
                onChangeText={(value) => handleChange("durationDays", value)}
              />
            </View>

            {/* Guarantors Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {t("loans.guarantorsOptional")}
              </Text>

              {/* Add Guarantor */}
              <View style={styles.guarantorAddSection}>
                <View style={[styles.pickerContainer, { flex: 1 }]}>
                  <Picker
                    selectedValue={selectedGuarantorId}
                    onValueChange={setSelectedGuarantorId}
                    style={styles.picker}
                  >
                    <Picker.Item label={t("loans.selectGuarantor")} value="" />
                    {customers
                      .filter((c) => c.id !== formData.applicantId)
                      .map((customer) => (
                        <Picker.Item
                          key={customer.id}
                          label={customer.fullName}
                          value={customer.id}
                        />
                      ))}
                  </Picker>
                </View>
                <TouchableOpacity
                  style={styles.addGuarantorButton}
                  onPress={addGuarantor}
                >
                  <Text style={styles.addGuarantorButtonText}>
                    {t("loans.addGuarantor")}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Guarantor List */}
              {formData.guarantorIds.length > 0 ? (
                <View style={styles.guarantorList}>
                  {formData.guarantorIds.map((guarantorId) => (
                    <View key={guarantorId} style={styles.guarantorItem}>
                      <Text style={styles.guarantorName}>
                        {getCustomerName(guarantorId)}
                      </Text>
                      <TouchableOpacity
                        onPress={() => removeGuarantor(guarantorId)}
                      >
                        <Text style={styles.removeButton}>
                          {t("loans.remove")}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={styles.hint}>{t("loans.noGuarantorsAdded")}</Text>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <SafeAreaView style={styles.actionBarContainer} edges={["bottom"]}>
        <View style={styles.actionBar}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              loading && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>
                {loading ? t("loans.creating") : t("loans.createLoan")}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

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
  scrollContent: {
    padding: 16,
  },
  form: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    elevation: 1,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 8,
  },
  required: {
    color: colors.error,
  },
  input: {
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    backgroundColor: "#FFFFFF",
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
    color: colors.textPrimary,
  },
  pickerContainer: {
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
    overflow: "hidden",
  },
  picker: {
    height: 50,
  },
  preselectedContainer: {
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    padding: 14,
    backgroundColor: "#FFFFFF",
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  preselectedText: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: "600",
  },
  hint: {
    fontSize: 12,
    color: colors.textTertiary,
    marginTop: 4,
  },
  noCustomersText: {
    fontSize: 14,
    color: colors.error,
    marginTop: 8,
    fontStyle: "italic",
  },
  section: {
    marginTop: 10,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 12,
  },
  guarantorAddSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  addGuarantorButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    height: 50,
    justifyContent: "center",
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  addGuarantorButtonText: {
    color: colors.textLight,
    fontSize: 14,
    fontWeight: "600",
  },
  guarantorList: {
    marginTop: 12,
  },
  guarantorItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  guarantorName: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: "500",
  },
  removeButton: {
    color: colors.error,
    fontSize: 14,
    fontWeight: "600",
  },
  submitButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: colors.textLight,
    fontSize: 16,
    fontWeight: "600",
  },
  renewalBanner: {
    backgroundColor: "#E3F2FD",
    padding: 16,
    borderRadius: 10,
    marginBottom: 20,
    borderLeftWidth: 5,
    borderLeftColor: "#1976D2",
  },
  renewalBannerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0D47A1",
    marginBottom: 12,
  },
  renewalDetailsBox: {
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  renewalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  renewalLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  renewalValue: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: "600",
  },
  renewalTotalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: 6,
    paddingTop: 10,
  },
  renewalTotalLabel: {
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: "700",
  },
  renewalTotalValue: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: "700",
  },
  renewalNote: {
    fontSize: 12,
    color: "#1565C0",
    fontStyle: "italic",
    lineHeight: 16,
  },
  inputReadonly: {
    backgroundColor: "#F5F5F5",
    color: colors.textSecondary,
  },
  readonlyNote: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    fontStyle: "italic",
  },
  flex1: {
    flex: 1,
  },
  actionBarContainer: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    elevation: 4,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionBar: {
    padding: 12,
  },
});
