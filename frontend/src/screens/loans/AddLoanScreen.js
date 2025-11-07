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
import { Picker } from "@react-native-picker/picker";
import api from "../../api/client";
import { colors } from "../../theme/colors";

const FREQUENCY_OPTIONS = [
  { label: "Select Frequency", value: "" },
  { label: "Daily", value: "DAILY" },
  { label: "Weekly", value: "WEEKLY" },
  { label: "Monthly", value: "MONTHLY" },
];

export default function AddLoanScreen({ navigation, route }) {
  const preselectedCustomerId = route?.params?.customerId;
  const preselectedCustomerName = route?.params?.customerName;

  const [formData, setFormData] = useState({
    applicantId: preselectedCustomerId || "",
    amount: "",
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
        if (
          loan.status === "ACTIVE" ||
          loan.status === "APPROVED" ||
          loan.status === "APPLIED"
        ) {
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
      console.error("Failed to fetch customers:", error);
      Alert.alert("Error", "Failed to load customers");
    } finally {
      setLoadingCustomers(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const addGuarantor = () => {
    if (!selectedGuarantorId) {
      Alert.alert("Error", "Please select a guarantor");
      return;
    }
    if (selectedGuarantorId === formData.applicantId) {
      Alert.alert("Error", "Guarantor cannot be the same as applicant");
      return;
    }
    if (formData.guarantorIds.includes(selectedGuarantorId)) {
      Alert.alert("Error", "This guarantor is already added");
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
        (loan) =>
          loan.status === "ACTIVE" ||
          loan.status === "APPROVED" ||
          loan.status === "APPLIED"
      );

      return activeLoans.length > 0;
    } catch (error) {
      console.error("Failed to check customer loans:", error);
      return false;
    }
  };

  const validateForm = () => {
    if (!formData.applicantId) {
      Alert.alert("Error", "Please select a customer");
      return false;
    }
    if (!formData.amount || Number(formData.amount) <= 0) {
      Alert.alert("Error", "Please enter a valid loan amount");
      return false;
    }
    if (!formData.interest30 || Number(formData.interest30) < 0) {
      Alert.alert("Error", "Please enter a valid interest rate");
      return false;
    }
    if (!formData.frequency) {
      Alert.alert("Error", "Please select a payment frequency");
      return false;
    }
    if (!formData.startDate) {
      Alert.alert("Error", "Please enter a start date");
      return false;
    }
    if (!formData.durationMonths && !formData.durationDays) {
      Alert.alert("Error", "Please enter either duration in months or days");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Check if customer has active loans
      const hasActiveLoans = await checkCustomerActiveLoans(
        formData.applicantId
      );

      if (hasActiveLoans) {
        const customerName = getCustomerName(formData.applicantId);
        Alert.alert(
          "Active Loan Exists",
          `${customerName} already has an active loan. Please complete all existing loans before creating a new one.`,
          [{ text: "OK" }]
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

      Alert.alert("Success", "Loan application created successfully", [
        {
          text: "OK",
          onPress: () => {
            navigation.goBack();
          },
        },
      ]);
    } catch (error) {
      console.error("Failed to create loan:", error);
      Alert.alert(
        "Error",
        error.response?.data?.error || "Failed to create loan application"
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
        <Text style={styles.loadingText}>Loading customers...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.form}>
          {/* Customer Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Customer <Text style={styles.required}>*</Text>
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
                    <Picker.Item label="Select Customer" value="" />
                    {availableCustomers.map((customer) => (
                      <Picker.Item
                        key={customer.id}
                        label={customer.fullName}
                        value={customer.id}
                      />
                    ))}
                  </Picker>
                </View>
                {availableCustomers.length === 0 && (
                  <Text style={styles.noCustomersText}>
                    No customers available. All customers have active loans.
                  </Text>
                )}
                {availableCustomers.length > 0 && (
                  <Text style={styles.hint}>
                    Only showing customers without active loans
                  </Text>
                )}
              </>
            )}
          </View>

          {/* Loan Amount */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Loan Amount (Rs.) <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 50000"
              keyboardType="numeric"
              value={formData.amount}
              onChangeText={(value) => handleChange("amount", value)}
            />
          </View>

          {/* Interest Rate */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Interest Rate (% per 30 days){" "}
              <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 5"
              keyboardType="numeric"
              value={formData.interest30}
              onChangeText={(value) => handleChange("interest30", value)}
            />
          </View>

          {/* Frequency */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Payment Frequency <Text style={styles.required}>*</Text>
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
              Start Date <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              value={formData.startDate}
              onChangeText={(value) => handleChange("startDate", value)}
            />
            <Text style={styles.hint}>Format: YYYY-MM-DD</Text>
          </View>

          {/* Duration in Months */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Duration (Months)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 12"
              keyboardType="numeric"
              value={formData.durationMonths}
              onChangeText={(value) => handleChange("durationMonths", value)}
            />
            <Text style={styles.hint}>Leave empty if using days instead</Text>
          </View>

          {/* Duration in Days */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Duration (Days)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 365"
              keyboardType="numeric"
              value={formData.durationDays}
              onChangeText={(value) => handleChange("durationDays", value)}
            />
            <Text style={styles.hint}>Leave empty if using months instead</Text>
          </View>

          {/* Guarantors Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Guarantors (Optional)</Text>

            {/* Add Guarantor */}
            <View style={styles.guarantorAddSection}>
              <View style={[styles.pickerContainer, { flex: 1 }]}>
                <Picker
                  selectedValue={selectedGuarantorId}
                  onValueChange={setSelectedGuarantorId}
                  style={styles.picker}
                >
                  <Picker.Item label="Select Guarantor" value="" />
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
                <Text style={styles.addGuarantorButtonText}>Add</Text>
              </TouchableOpacity>
            </View>

            {/* Guarantor List */}
            {formData.guarantorIds.length > 0 && (
              <View style={styles.guarantorList}>
                {formData.guarantorIds.map((guarantorId) => (
                  <View key={guarantorId} style={styles.guarantorItem}>
                    <Text style={styles.guarantorName}>
                      {getCustomerName(guarantorId)}
                    </Text>
                    <TouchableOpacity
                      onPress={() => removeGuarantor(guarantorId)}
                    >
                      <Text style={styles.removeButton}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              loading && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.textLight} />
            ) : (
              <Text style={styles.submitButtonText}>
                Create Loan Application
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#FFFFFF",
    color: colors.textPrimary,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
  },
  picker: {
    height: 50,
  },
  preselectedContainer: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    backgroundColor: colors.background,
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
  },
  addGuarantorButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    height: 50,
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#4A4A4A",
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
    backgroundColor: colors.background,
    borderRadius: 8,
    marginBottom: 8,
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
    marginTop: 10,
    borderWidth: 2,
    borderColor: "#4A4A4A",
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: colors.textLight,
    fontSize: 16,
    fontWeight: "600",
  },
});
