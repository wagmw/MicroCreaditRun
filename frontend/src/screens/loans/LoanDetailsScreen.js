import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { colors } from "../../theme/colors";
import { cardStyles } from "../../theme/cardStyles";
import { statusStyles } from "../../theme/statusStyles";
import { buttonStyles } from "../../theme/buttonStyles";
import api from "../../api/client";

export default function LoanDetailsScreen({ route, navigation }) {
  const { loanId } = route.params;
  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLoanDetails();
  }, [loanId]);

  const fetchLoanDetails = async () => {
    try {
      const response = await api.get(`/loans/${loanId}`);
      setLoan(response.data);
    } catch (error) {
      console.error("Failed to fetch loan details:", error);
      Alert.alert("Error", "Failed to load loan details");
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

  const calculateTotalAmount = (loan) => {
    const principal = loan.amount;
    const interestAmount =
      (principal *
        loan.interest30 *
        (loan.durationMonths || loan.durationDays / 30)) /
      100;
    return principal + interestAmount;
  };

  const calculateTotalPaid = (loan) => {
    if (!loan.payments || loan.payments.length === 0) return 0;
    return loan.payments.reduce((sum, payment) => sum + payment.amount, 0);
  };

  const calculateOutstanding = (loan) => {
    const total = calculateTotalAmount(loan);
    const paid = calculateTotalPaid(loan);
    return total - paid;
  };

  const getDurationText = (loan) => {
    if (loan.durationMonths) {
      return `${loan.durationMonths} month${
        loan.durationMonths > 1 ? "s" : ""
      }`;
    } else if (loan.durationDays) {
      return `${loan.durationDays} day${loan.durationDays > 1 ? "s" : ""}`;
    }
    return "Open-ended";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "ACTIVE":
        return colors.success;
      case "COMPLETED":
        return colors.info;
      case "APPLIED":
        return colors.warning;
      case "DEFAULTED":
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusText = (status) => {
    return status.charAt(0) + status.slice(1).toLowerCase();
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading loan details...</Text>
      </View>
    );
  }

  if (!loan) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Loan not found</Text>
      </View>
    );
  }

  const DetailRow = ({ label, value, highlight = false }) => (
    <View style={styles.detailRow}>
      <Text
        style={[styles.detailLabel, highlight && styles.detailLabelHighlight]}
      >
        {label}
      </Text>
      <Text
        style={[styles.detailValue, highlight && styles.detailValueHighlight]}
      >
        {value}
      </Text>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Card with Loan Amount */}
      <View style={styles.headerCard}>
        <View style={styles.headerTop}>
          {loan.loanId && (
            <Text style={styles.loanIdText}>ID: {loan.loanId}</Text>
          )}
          <View
            style={[
              statusStyles.badgeLarge,
              { backgroundColor: getStatusColor(loan.status) },
            ]}
          >
            <Text style={statusStyles.badgeTextLarge}>
              {getStatusText(loan.status)}
            </Text>
          </View>
        </View>
        <Text style={styles.amountValue}>
          Rs. {loan.amount.toLocaleString()}
        </Text>
      </View>
      {/* Loan Information & Financial Summary - Combined */}
      <View style={[styles.softCard, styles.section]}>
        <Text style={styles.sectionTitle}>Loan Details</Text>
        <View style={styles.loanDetailsGrid}>
          <View style={styles.squareBox}>
            <Text style={styles.squareLabel}>Duration</Text>
            <Text style={styles.squareValue}>{getDurationText(loan)}</Text>
          </View>
          <View style={styles.squareBox}>
            <Text style={styles.squareLabel}>Interest</Text>
            <Text style={styles.squareValue}>{loan.interest30}%</Text>
          </View>
          <View style={styles.squareBox}>
            <Text style={styles.squareLabel}>Frequency</Text>
            <Text style={styles.squareValue}>{loan.frequency || "N/A"}</Text>
          </View>
          <View style={styles.squareBox}>
            <Text style={styles.squareLabel}>Start Date</Text>
            <Text style={styles.squareValue}>
              {new Date(loan.startDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </Text>
          </View>
        </View>

        <View style={styles.financialDivider} />

        <View style={styles.financialCompact}>
          <View style={styles.financialRow}>
            <Text style={styles.financialLabel}>Principal</Text>
            <Text style={styles.financialValue}>
              Rs. {loan.amount.toLocaleString()}
            </Text>
          </View>
          <View style={styles.financialRow}>
            <Text style={styles.financialLabel}>Total with Interest</Text>
            <Text style={styles.financialValue}>
              Rs. {calculateTotalAmount(loan).toLocaleString()}
            </Text>
          </View>
          <View style={styles.financialRow}>
            <Text style={styles.financialLabel}>Total Paid</Text>
            <Text style={[styles.financialValue, { color: colors.success }]}>
              Rs. {calculateTotalPaid(loan).toLocaleString()}
            </Text>
          </View>
          {loan.status === "ACTIVE" && (
            <View style={[styles.financialRow, styles.outstandingRow]}>
              <Text style={styles.outstandingLabel}>Outstanding</Text>
              <Text
                style={[
                  styles.outstandingValue,
                  {
                    color:
                      calculateOutstanding(loan) > 0
                        ? colors.error
                        : colors.success,
                  },
                ]}
              >
                Rs. {calculateOutstanding(loan).toLocaleString()}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Guarantors Information */}
      {loan.LoanGuarantor && loan.LoanGuarantor.length > 0 && (
        <View style={[styles.softCard, styles.section]}>
          <Text style={styles.sectionTitle}>
            Guarantors ({loan.LoanGuarantor.length})
          </Text>
          {loan.LoanGuarantor.map((guarantor, index) => (
            <View key={index} style={styles.guarantorItem}>
              <View style={styles.sectionContent}>
                <DetailRow
                  label="Name"
                  value={guarantor.Customer?.fullName || "N/A"}
                />
                <DetailRow
                  label="Mobile"
                  value={guarantor.Customer?.mobilePhone || "N/A"}
                />
              </View>
              {guarantor.Customer && (
                <TouchableOpacity
                  style={[buttonStyles.secondary, styles.actionButton]}
                  onPress={() =>
                    navigation.navigate("CustomerDetails", {
                      customerId: guarantor.customerId,
                    })
                  }
                >
                  <Text style={buttonStyles.secondaryText}>View Details</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
      )}
      {/* Actions */}
      <View style={[styles.softCard, styles.section]}>
        <Text style={styles.sectionTitle}>Actions</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.actionBtnPrimary]}
            onPress={() =>
              navigation.navigate("PaymentPlan", { loanId: loan.id })
            }
          >
            <Text style={styles.actionBtnText}>Payment Plan</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionBtn,
              loan.payments && loan.payments.length > 0
                ? styles.actionBtnInfo
                : styles.actionBtnDisabled,
            ]}
            onPress={() => {
              if (loan.payments && loan.payments.length > 0) {
                navigation.navigate("PaymentHistory", { loanId: loan.id });
              }
            }}
            disabled={!loan.payments || loan.payments.length === 0}
          >
            <Text
              style={[
                styles.actionBtnText,
                (!loan.payments || loan.payments.length === 0) &&
                  styles.actionBtnTextDisabled,
              ]}
            >
              History
              {loan.payments && loan.payments.length > 0
                ? ` (${loan.payments.length})`
                : ""}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      {/* Customer Information */}
      {loan.applicant && (
        <View style={[styles.softCard, styles.section]}>
          <View style={styles.customerHeader}>
            <View style={styles.customerInfo}>
              <Text style={styles.customerName}>{loan.applicant.fullName}</Text>
              <Text style={styles.customerPhone}>
                {loan.applicant.mobilePhone}
              </Text>
              {loan.applicant.nationalIdNo && (
                <Text style={styles.customerNIC}>
                  ID: {loan.applicant.nationalIdNo}
                </Text>
              )}
            </View>
            <TouchableOpacity
              style={styles.viewCustomerBtn}
              onPress={() =>
                navigation.navigate("CustomerDetails", {
                  customerId: loan.applicantId,
                })
              }
            >
              <Text style={styles.viewCustomerBtnText}>View Details →</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      {/* Timeline */}
      <View style={[styles.softCard, styles.section]}>
        <Text style={styles.sectionTitle}>Timeline</Text>
        <View style={styles.timelineCompact}>
          <View style={styles.timelineItem}>
            <Text style={styles.timelineLabel}>Created</Text>
            <Text style={styles.timelineValue}>
              {formatDate(loan.createdAt)}
            </Text>
          </View>
          <View style={styles.timelineDivider} />
          <View style={styles.timelineItem}>
            <Text style={styles.timelineLabel}>Updated</Text>
            <Text style={styles.timelineValue}>
              {formatDate(loan.updatedAt)}
            </Text>
          </View>
        </View>
      </View>
      {/* Bottom spacing */}
      <View style={styles.bottomSpacing} />
    </ScrollView>
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
  errorText: {
    fontSize: 16,
    color: colors.error,
  },
  headerCard: {
    backgroundColor: colors.primary,
    padding: 18,
    marginBottom: 12,
    elevation: 3,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  loanIdText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textLight,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  amountValue: {
    fontSize: 36,
    fontWeight: "700",
    color: colors.textLight,
  },
  softCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.06)",
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  section: {
    marginHorizontal: 12,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 14,
  },
  sectionContent: {
    gap: 10,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  detailLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: "500",
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: "600",
    flex: 1.2,
    textAlign: "right",
  },
  detailLabelHighlight: {
    fontWeight: "600",
    color: colors.textPrimary,
  },
  detailValueHighlight: {
    fontSize: 15,
    fontWeight: "700",
  },
  loanDetailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  squareBox: {
    width: "48%",
    backgroundColor: "rgba(0, 0, 0, 0.04)",
    padding: 14,
    borderRadius: 10,
    minHeight: 75,
    justifyContent: "center",
  },
  squareLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: "600",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  squareValue: {
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: "700",
    lineHeight: 20,
  },
  financialDivider: {
    height: 1,
    backgroundColor: "rgba(0, 0, 0, 0.08)",
    marginVertical: 16,
  },
  financialCompact: {
    gap: 10,
  },
  financialRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  financialLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  financialValue: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: "700",
  },
  outstandingRow: {
    marginTop: 6,
    paddingTop: 14,
    borderTopWidth: 2,
    borderTopColor: colors.border,
  },
  outstandingLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  outstandingValue: {
    fontSize: 20,
    fontWeight: "700",
  },
  guarantorItem: {
    marginBottom: 16,
  },
  actionButton: {
    marginTop: 12,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#4A4A4A",
  },
  actionBtnPrimary: {
    backgroundColor: colors.primary,
  },
  actionBtnInfo: {
    backgroundColor: colors.info,
  },
  actionBtnDisabled: {
    backgroundColor: colors.disabled,
    borderColor: colors.border,
    opacity: 0.6,
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textLight,
    textAlign: "center",
  },
  actionBtnTextDisabled: {
    color: colors.textSecondary,
  },
  customerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  customerPhone: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  customerNIC: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  viewCustomerBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: colors.primary,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#4A4A4A",
  },
  viewCustomerBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textLight,
  },
  timelineCompact: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  timelineItem: {
    flex: 1,
  },
  timelineLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: "500",
    marginBottom: 4,
  },
  timelineValue: {
    fontSize: 13,
    color: colors.textPrimary,
    fontWeight: "600",
  },
  timelineDivider: {
    width: 1,
    height: 30,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
  },
  bottomSpacing: {
    height: 20,
  },
});
