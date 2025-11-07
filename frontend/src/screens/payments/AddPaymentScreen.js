import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { colors } from "../../theme/colors";
import api from "../../api/client";

export default function AddPaymentScreen({ navigation }) {
  const [customers, setCustomers] = useState([]);
  const [loans, setLoans] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [selectedLoanId, setSelectedLoanId] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCustomersAndLoans();
  }, []);

  const fetchCustomersAndLoans = async () => {
    try {
      // Fetch all active loans
      const loansResponse = await api.get("/loans?status=ACTIVE");
      const activeLoans = loansResponse.data;
      setLoans(activeLoans);

      // Extract unique customers from active loans
      const uniqueCustomers = [];
      const customerIds = new Set();

      activeLoans.forEach((loan) => {
        if (loan.applicant && !customerIds.has(loan.applicant.id)) {
          customerIds.add(loan.applicant.id);
          uniqueCustomers.push(loan.applicant);
        }
      });

      setCustomers(uniqueCustomers);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      Alert.alert("Error", "Failed to load customers and loans");
    } finally {
      setLoading(false);
    }
  };

  const getCustomerLoans = () => {
    if (!selectedCustomerId) return [];
    return loans.filter((loan) => loan.applicantId === selectedCustomerId);
  };

  const getSelectedLoan = () => {
    return loans.find((loan) => loan.id === selectedLoanId);
  };

  const calculateOutstanding = (loan) => {
    if (!loan) return 0;
    const principal = loan.amount;
    const interestAmount =
      (principal *
        loan.interest30 *
        (loan.durationMonths || loan.durationDays / 30)) /
      100;
    const total = principal + interestAmount;
    const paid = loan.payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
    return total - paid;
  };

  const handleSubmit = async () => {
    if (!selectedCustomerId) {
      Alert.alert("Error", "Please select a customer");
      return;
    }

    if (!selectedLoanId) {
      Alert.alert("Error", "Please select a loan");
      return;
    }

    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      Alert.alert("Error", "Please enter a valid payment amount");
      return;
    }

    const selectedLoan = getSelectedLoan();
    const outstanding = calculateOutstanding(selectedLoan);

    if (Number(amount) > outstanding) {
      Alert.alert(
        "Warning",
        `Payment amount (Rs. ${Number(
          amount
        ).toLocaleString()}) exceeds outstanding balance (Rs. ${outstanding.toLocaleString()}). Do you want to continue?`,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Continue", onPress: submitPayment },
        ]
      );
    } else {
      submitPayment();
    }
  };

  const submitPayment = async () => {
    setSubmitting(true);
    try {
      await api.post("/payments", {
        loanId: selectedLoanId,
        customerId: selectedCustomerId,
        amount: Number(amount),
        note: note.trim() || null,
      });

      Alert.alert("Success", "Payment recorded successfully", [
        {
          text: "OK",
          onPress: () => {
            // Reset form
            setSelectedCustomerId("");
            setSelectedLoanId("");
            setAmount("");
            setNote("");
            // Refresh data
            fetchCustomersAndLoans();
          },
        },
      ]);
    } catch (error) {
      console.error("Error recording payment:", error);
      Alert.alert(
        "Error",
        error.response?.data?.error || "Failed to record payment"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const customerLoans = getCustomerLoans();
  const selectedLoan = getSelectedLoan();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.form}>
        <Text style={styles.sectionTitle}>Payment Details</Text>

        <Text style={styles.label}>
          Customer <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedCustomerId}
            onValueChange={(value) => {
              setSelectedCustomerId(value);
              setSelectedLoanId(""); // Reset loan selection
            }}
            enabled={!submitting}
          >
            <Picker.Item label="Select Customer" value="" />
            {customers.map((customer) => (
              <Picker.Item
                key={customer.id}
                label={customer.fullName}
                value={customer.id}
              />
            ))}
          </Picker>
        </View>

        {selectedCustomerId && customerLoans.length > 0 && (
          <>
            <Text style={styles.label}>
              Loan <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedLoanId}
                onValueChange={setSelectedLoanId}
                enabled={!submitting}
              >
                <Picker.Item label="Select Loan" value="" />
                {customerLoans.map((loan) => (
                  <Picker.Item
                    key={loan.id}
                    label={`${
                      loan.loanId || "N/A"
                    } - Rs. ${loan.amount.toLocaleString()} - ${
                      loan.frequency
                    }`}
                    value={loan.id}
                  />
                ))}
              </Picker>
            </View>
          </>
        )}

        {selectedCustomerId && customerLoans.length === 0 && (
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              No active loans found for this customer
            </Text>
          </View>
        )}

        {selectedLoan && (
          <View style={styles.loanInfo}>
            <Text style={styles.loanInfoTitle}>Loan Information</Text>
            <View style={styles.loanInfoRow}>
              <Text style={styles.loanInfoLabel}>Principal:</Text>
              <Text style={styles.loanInfoValue}>
                Rs. {selectedLoan.amount.toLocaleString()}
              </Text>
            </View>
            <View style={styles.loanInfoRow}>
              <Text style={styles.loanInfoLabel}>Interest Rate:</Text>
              <Text style={styles.loanInfoValue}>
                {selectedLoan.interest30}% per 30 days
              </Text>
            </View>
            <View style={styles.loanInfoRow}>
              <Text style={styles.loanInfoLabel}>Frequency:</Text>
              <Text style={styles.loanInfoValue}>{selectedLoan.frequency}</Text>
            </View>
            <View style={styles.loanInfoRow}>
              <Text style={styles.loanInfoLabel}>Total Paid:</Text>
              <Text style={styles.loanInfoValue}>
                Rs.{" "}
                {(
                  selectedLoan.payments?.reduce(
                    (sum, p) => sum + p.amount,
                    0
                  ) || 0
                ).toLocaleString()}
              </Text>
            </View>
            <View style={[styles.loanInfoRow, styles.outstandingRow]}>
              <Text style={styles.loanInfoLabel}>Outstanding:</Text>
              <Text style={[styles.loanInfoValue, styles.outstandingValue]}>
                Rs. {calculateOutstanding(selectedLoan).toLocaleString()}
              </Text>
            </View>
          </View>
        )}

        {selectedLoanId && (
          <>
            <Text style={styles.label}>
              Payment Amount <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={amount}
              onChangeText={setAmount}
              placeholder="Enter amount"
              keyboardType="numeric"
              editable={!submitting}
            />

            <Text style={styles.label}>Note (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={note}
              onChangeText={setNote}
              placeholder="Add a note (optional)"
              multiline
              numberOfLines={3}
              editable={!submitting}
            />

            <TouchableOpacity
              style={[styles.submitButton, submitting && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              <Text style={styles.submitButtonText}>
                {submitting ? "Recording..." : "Record Payment"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => navigation.goBack()}
              disabled={submitting}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
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
  content: {
    padding: 20,
  },
  form: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 8,
    marginTop: 15,
  },
  required: {
    color: colors.error,
  },
  pickerContainer: {
    backgroundColor: colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.textPrimary,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  infoBox: {
    backgroundColor: colors.warning + "20",
    borderRadius: 8,
    padding: 15,
    marginTop: 15,
    borderWidth: 1,
    borderColor: colors.warning,
  },
  infoText: {
    color: colors.textPrimary,
    fontSize: 14,
    textAlign: "center",
  },
  loanInfo: {
    backgroundColor: colors.info + "10",
    borderRadius: 8,
    padding: 15,
    marginTop: 15,
    borderWidth: 1,
    borderColor: colors.info,
  },
  loanInfoTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 10,
  },
  loanInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  loanInfoLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  loanInfoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  outstandingRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: 8,
    paddingTop: 12,
  },
  outstandingValue: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.error,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    marginTop: 25,
    borderWidth: 2,
    borderColor: "#4A4A4A",
  },
  buttonDisabled: {
    backgroundColor: colors.textSecondary,
  },
  submitButtonText: {
    color: colors.textLight,
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    marginTop: 10,
    borderWidth: 2,
    borderColor: "#4A4A4A",
  },
  cancelButtonText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: "600",
  },
});
