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
import { formatCurrency } from "../../utils/currency";
import { useLocalization } from "../../context/LocalizationContext";

export default function AddPaymentScreen({ navigation, route }) {
  const { t } = useLocalization();
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

      // Auto-select if coming from Due Payments screen
      if (route?.params?.loanId) {
        const preSelectedLoan = activeLoans.find(
          (loan) => loan.id === route.params.loanId
        );
        if (preSelectedLoan) {
          setSelectedLoanId(preSelectedLoan.id);
          setSelectedCustomerId(preSelectedLoan.applicantId);
        }
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
      Alert.alert(t("common.error"), t("payments.failedToLoadCustomersLoans"));
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
      Alert.alert(t("common.error"), t("payments.pleaseSelectCustomer"));
      return;
    }

    if (!selectedLoanId) {
      Alert.alert(t("common.error"), t("payments.pleaseSelectLoan"));
      return;
    }

    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      Alert.alert(t("common.error"), t("payments.pleaseEnterValidAmount"));
      return;
    }

    const selectedLoan = getSelectedLoan();
    const outstanding = calculateOutstanding(selectedLoan);

    if (Number(amount) > outstanding) {
      const message = `Payment amount (Rs. ${formatCurrency(
        Number(amount)
      )}) exceeds outstanding balance (Rs. ${formatCurrency(
        outstanding
      )}). Do you want to continue?`;

      Alert.alert(t("common.error"), message, [
        { text: t("common.cancel"), style: "cancel" },
        { text: t("payments.continue"), onPress: submitPayment },
      ]);
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

      Alert.alert(t("common.success"), t("payments.paymentRecordedSuccess"), [
        {
          text: t("payments.viewPaymentHistory"),
          onPress: () => {
            // Navigate to payment history for this loan
            navigation.navigate("PaymentHistory", {
              loanId: selectedLoanId,
            });
          },
        },
      ]);
    } catch (error) {
      console.error("Error recording payment:", error);
      Alert.alert(
        t("common.error"),
        error.response?.data?.error || t("payments.failedToRecordPayment")
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>{t("common.loading")}</Text>
      </View>
    );
  }

  const customerLoans = getCustomerLoans();
  const selectedLoan = getSelectedLoan();

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.form}>
          <Text style={styles.sectionTitle}>
            {t("payments.paymentDetails")}
          </Text>

          <Text style={styles.label}>
            {t("payments.customer")} <Text style={styles.required}>*</Text>
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
              <Picker.Item label={t("payments.selectCustomer")} value="" />
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
                {t("payments.loan")} <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={selectedLoanId}
                  onValueChange={setSelectedLoanId}
                  enabled={!submitting}
                >
                  <Picker.Item label={t("payments.selectLoan")} value="" />
                  {customerLoans.map((loan) => (
                    <Picker.Item
                      key={loan.id}
                      label={`${loan.loanId || "N/A"} - Rs. ${formatCurrency(
                        loan.amount
                      )} - ${loan.frequency}`}
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
                {t("loans.noLoansForCustomer")}
              </Text>
            </View>
          )}

          {selectedLoan && (
            <View style={styles.loanInfo}>
              <Text style={styles.loanInfoTitle}>
                {t("payments.loanInformation")}
              </Text>
              <View style={styles.loanInfoRow}>
                <Text style={styles.loanInfoLabel}>
                  {t("loans.principal")}:
                </Text>
                <Text style={styles.loanInfoValue}>
                  Rs. {formatCurrency(selectedLoan.amount)}
                </Text>
              </View>
              <View style={styles.loanInfoRow}>
                <Text style={styles.loanInfoLabel}>
                  {t("loans.interestRate")}:
                </Text>
                <Text style={styles.loanInfoValue}>
                  {selectedLoan.interest30}% {t("payments.perThirtyDays")}
                </Text>
              </View>
              <View style={styles.loanInfoRow}>
                <Text style={styles.loanInfoLabel}>
                  {t("loans.frequency")}:
                </Text>
                <Text style={styles.loanInfoValue}>
                  {selectedLoan.frequency}
                </Text>
              </View>
              <View style={styles.loanInfoRow}>
                <Text style={styles.loanInfoLabel}>
                  {t("loans.totalPaid")}:
                </Text>
                <Text style={styles.loanInfoValue}>
                  Rs.{" "}
                  {formatCurrency(
                    selectedLoan.payments?.reduce(
                      (sum, p) => sum + p.amount,
                      0
                    ) || 0
                  )}
                </Text>
              </View>
              <View style={[styles.loanInfoRow, styles.outstandingRow]}>
                <Text style={styles.loanInfoLabel}>
                  {t("loans.outstanding")}:
                </Text>
                <Text style={[styles.loanInfoValue, styles.outstandingValue]}>
                  Rs. {formatCurrency(calculateOutstanding(selectedLoan))}
                </Text>
              </View>
            </View>
          )}

          {selectedLoanId && (
            <>
              <Text style={styles.label}>
                {t("payments.paymentAmount")}{" "}
                <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={amount}
                onChangeText={setAmount}
                placeholder={t("payments.enterPaymentAmount")}
                keyboardType="numeric"
                editable={!submitting}
              />

              <Text style={styles.label}>
                {t("payments.paymentNote")} ({t("common.optional")})
              </Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={note}
                onChangeText={setNote}
                placeholder={t("payments.enterPaymentNote")}
                multiline
                numberOfLines={3}
                editable={!submitting}
              />
            </>
          )}
        </View>
      </ScrollView>

      {selectedLoanId && (
        <View style={styles.actionBarContainer}>
          <View style={styles.actionBar}>
            <TouchableOpacity
              style={[styles.submitButton, submitting && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              <Text style={styles.submitButtonText}>
                {submitting
                  ? t("payments.recording")
                  : t("payments.recordPayment")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => navigation.goBack()}
              disabled={submitting}
            >
              <Text style={styles.cancelButtonText}>{t("common.cancel")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
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
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
    overflow: "hidden",
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
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
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
  },
  buttonDisabled: {
    backgroundColor: colors.textSecondary,
    opacity: 0.7,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  cancelButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
  },
  cancelButtonText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "600",
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
    flexDirection: "column",
    padding: 12,
    gap: 12,
  },
});
