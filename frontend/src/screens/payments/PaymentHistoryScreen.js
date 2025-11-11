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
import { SafeAreaView } from "react-native-safe-area-context";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { colors } from "../../theme/colors";
import api from "../../api/client";
import { formatCurrency } from "../../utils/currency";
import { useLocalization } from "../../context/LocalizationContext";

export default function PaymentHistoryScreen({ route, navigation }) {
  const { t } = useLocalization();
  const { loanId } = route.params;
  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [printing, setPrinting] = useState(false);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      title: t("payments.paymentHistory"),
    });
  }, [navigation, t]);

  useEffect(() => {
    fetchLoanAndPayments();
  }, [loanId]);

  const fetchLoanAndPayments = async () => {
    try {
      const response = await api.get(`/loans/${loanId}`);
      setLoan(response.data);
    } catch (error) {
      console.error("Failed to fetch loan payments:", error);
      Alert.alert(t("common.error"), t("payments.failedToLoadPaymentHistory"));
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatRs = (amount) => {
    return `Rs. ${formatCurrency(amount)}`;
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

  const calculateTotalPaidUpTo = (payments, currentIndex) => {
    return payments
      .slice(0, currentIndex + 1)
      .reduce((sum, payment) => sum + payment.amount, 0);
  };

  const generateHTMLContent = () => {
    if (!loan || !loan.payments || loan.payments.length === 0) return "";

    const totalAmount = calculateTotalAmount(loan);
    const totalPaid = loan.payments.reduce((sum, p) => sum + p.amount, 0);
    const outstanding = totalAmount - totalPaid;

    const paymentRows = [...loan.payments]
      .reverse()
      .map((payment, index) => {
        const totalPaidUpTo = calculateTotalPaidUpTo(
          [...loan.payments].reverse(),
          index
        );
        const outstandingAfter = totalAmount - totalPaidUpTo;

        return `
      <tr>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${
          index + 1
        }</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${formatDate(
          payment.paidAt
        )}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatRs(
          payment.amount
        )}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatRs(
          outstandingAfter
        )}</td>
      </tr>
    `;
      })
      .join("");

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              margin: 0;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #333;
              padding-bottom: 20px;
            }
            .company-name {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .document-title {
              font-size: 20px;
              color: #555;
              margin-top: 10px;
            }
            .info-section {
              margin-bottom: 20px;
              display: flex;
              justify-content: space-between;
              flex-wrap: wrap;
            }
            .info-block {
              width: 48%;
              margin-bottom: 15px;
            }
            .info-label {
              font-weight: bold;
              color: #333;
              margin-bottom: 5px;
            }
            .info-value {
              color: #666;
            }
            .summary-section {
              background-color: #f5f5f5;
              padding: 15px;
              border-radius: 5px;
              margin-bottom: 20px;
            }
            .summary-row {
              display: flex;
              justify-content: space-between;
              padding: 5px 0;
            }
            .summary-label {
              font-weight: bold;
            }
            .summary-value {
              font-weight: bold;
              color: #2196F3;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th {
              background-color: #2196F3;
              color: white;
              padding: 12px 8px;
              text-align: left;
              border: 1px solid #ddd;
            }
            td {
              padding: 8px;
              border: 1px solid #ddd;
            }
            tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 12px;
              color: #999;
              border-top: 1px solid #ddd;
              padding-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">${t("payments.companyName")}</div>
            <div class="document-title">${t(
              "payments.paymentHistoryTitle"
            )}</div>
          </div>

          <div class="info-section">
            <div class="info-block">
              <div class="info-label">${t("payments.customerName")}:</div>
              <div class="info-value">${loan.applicant?.fullName || "N/A"}</div>
            </div>
            <div class="info-block">
              <div class="info-label">${t("payments.mobileNumber")}:</div>
              <div class="info-value">${
                loan.applicant?.mobilePhone || "N/A"
              }</div>
            </div>
            <div class="info-block">
              <div class="info-label">${t("payments.loanId")}:</div>
              <div class="info-value">${loan.loanId || "N/A"}</div>
            </div>
            <div class="info-block">
              <div class="info-label">${t("payments.loanStatus")}:</div>
              <div class="info-value">${loan.status}</div>
            </div>
          </div>

          <div class="summary-section">
            <div class="summary-row">
              <span class="summary-label">${t(
                "payments.totalLoanAmount"
              )}:</span>
              <span class="summary-value">${formatRs(totalAmount)}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">${t("loans.totalPaid")}:</span>
              <span class="summary-value">${formatRs(totalPaid)}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">${t(
                "payments.outstandingBalance"
              )}:</span>
              <span class="summary-value">${formatRs(outstanding)}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">${t(
                "payments.numberOfPayments"
              )}:</span>
              <span class="summary-value">${loan.payments.length}</span>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="text-align: center;">${t("payments.no")}</th>
                <th>${t("payments.paymentDate")}</th>
                <th style="text-align: right;">${t("common.amount")}</th>
                <th style="text-align: right;">${t("loans.outstanding")}</th>
              </tr>
            </thead>
            <tbody>
              ${paymentRows}
            </tbody>
          </table>

          <div class="footer">
            <p>${t("payments.generatedOn")} ${new Date().toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      }
    )}</p>
            <p>${t("payments.computerGenerated")}</p>
          </div>
        </body>
      </html>
    `;
  };

  const handlePrint = async () => {
    try {
      setPrinting(true);
      const html = generateHTMLContent();

      await Print.printAsync({
        html,
        width: 595,
        height: 842,
      });
    } catch (error) {
      console.error("Failed to print:", error);
      Alert.alert(t("common.error"), t("payments.failedToPrintPaymentHistory"));
    } finally {
      setPrinting(false);
    }
  };

  const handleShare = async () => {
    try {
      setSharing(true);
      const html = generateHTMLContent();

      const { uri } = await Print.printToFileAsync({
        html,
        width: 595,
        height: 842,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert(t("common.ok"), t("payments.sharingNotAvailable"));
      }
    } catch (error) {
      console.error("Failed to share:", error);
      Alert.alert(t("common.error"), t("payments.failedToSharePaymentHistory"));
    } finally {
      setSharing(false);
    }
  };

  const renderPaymentCard = ({ item, index }) => {
    const totalPaid = calculateTotalPaidUpTo(loan.payments, index);
    const totalAmount = calculateTotalAmount(loan);
    const outstanding = totalAmount - totalPaid;

    return (
      <View style={styles.paymentCard}>
        <View style={styles.paymentHeader}>
          <View style={styles.paymentNumberBadge}>
            <Text style={styles.paymentNumberText}>
              #{loan.payments.length - index}
            </Text>
          </View>
          <Text style={styles.paymentDate}>{formatDate(item.paidAt)}</Text>
        </View>

        <View style={styles.paymentDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Payment Amount:</Text>
            <Text style={styles.paymentAmount}>
              Rs. {formatCurrency(item.amount)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Payment Method:</Text>
            <Text style={styles.detailValue}>
              {getPaymentMethodText(item.paymentMethod)}
            </Text>
          </View>

          <View style={[styles.detailRow, styles.summaryRow]}>
            <Text style={styles.summaryLabel}>Total Paid (Up to this):</Text>
            <Text style={styles.totalPaidValue}>
              Rs. {formatCurrency(totalPaid)}
            </Text>
          </View>

          <View style={[styles.detailRow, styles.summaryRow]}>
            <Text style={styles.summaryLabel}>Outstanding (After this):</Text>
            <Text
              style={[
                styles.outstandingValue,
                { color: outstanding > 0 ? colors.error : colors.success },
              ]}
            >
              Rs. {formatCurrency(outstanding)}
            </Text>
          </View>

          {item.note && (
            <View style={styles.noteSection}>
              <Text style={styles.noteLabel}>Note:</Text>
              <Text style={styles.noteText}>{item.note}</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>
          {t("payments.loadingPaymentHistory")}
        </Text>
      </View>
    );
  }

  if (!loan || !loan.payments || loan.payments.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>
          {t("payments.noPaymentHistoryFound")}
        </Text>
      </View>
    );
  }

  const totalAmount = calculateTotalAmount(loan);
  const totalPaid = loan.payments.reduce((sum, p) => sum + p.amount, 0);
  const outstanding = totalAmount - totalPaid;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>
            {t("payments.paymentSummary")}
          </Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              {t("payments.totalLoanAmount")}:
            </Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(totalAmount)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t("loans.totalPaid")}:</Text>
            <Text style={[styles.summaryValue, { color: colors.success }]}>
              {formatCurrency(totalPaid)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              {t("payments.outstandingBalance")}:
            </Text>
            <Text
              style={[
                styles.summaryValueHighlight,
                { color: outstanding > 0 ? colors.error : colors.success },
              ]}
            >
              {formatCurrency(outstanding)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              {t("payments.numberOfPayments")}:
            </Text>
            <Text style={styles.summaryValue}>{loan.payments.length}</Text>
          </View>
        </View>

        {/* Payment History Table */}
        <View style={styles.tableContainer}>
          <Text style={styles.sectionTitle}>
            {t("payments.paymentHistoryTitle")}
          </Text>

          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text
              style={[styles.tableHeaderCell, styles.colNo, styles.textCenter]}
            >
              {t("payments.no")}
            </Text>
            <Text style={[styles.tableHeaderCell, styles.colDate]}>
              {t("payments.date")}
            </Text>
            <Text
              style={[
                styles.tableHeaderCell,
                styles.colAmount,
                styles.textRight,
              ]}
            >
              {t("common.amount")}
            </Text>
            <Text
              style={[
                styles.tableHeaderCell,
                styles.colBalance,
                styles.textRight,
                { paddingRight: 4 },
              ]}
            >
              {t("payments.balance")}
            </Text>
          </View>

          {/* Table Rows */}
          <ScrollView style={styles.tableBody}>
            {[...loan.payments].reverse().map((payment, index) => {
              const totalPaidUpTo = calculateTotalPaidUpTo(
                [...loan.payments].reverse(),
                index
              );
              const outstandingAfter = totalAmount - totalPaidUpTo;

              return (
                <View
                  key={payment.id}
                  style={[
                    styles.tableRow,
                    index % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd,
                  ]}
                >
                  <Text
                    style={[styles.tableCell, styles.colNo, styles.textCenter]}
                  >
                    {index + 1}
                  </Text>
                  <Text style={[styles.tableCell, styles.colDate]}>
                    {formatDate(payment.paidAt)}
                  </Text>
                  <Text
                    style={[
                      styles.tableCell,
                      styles.colAmount,
                      styles.textRight,
                      styles.amountText,
                    ]}
                  >
                    {formatCurrency(payment.amount)}
                  </Text>
                  <Text
                    style={[
                      styles.tableCell,
                      styles.colBalance,
                      styles.textRight,
                      styles.balanceText,
                    ]}
                  >
                    {formatCurrency(outstandingAfter)}
                  </Text>
                </View>
              );
            })}
          </ScrollView>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <SafeAreaView style={styles.actionBarContainer} edges={["bottom"]}>
        <View style={styles.actionBar}>
          <TouchableOpacity
            style={[styles.actionButton, styles.printButton]}
            onPress={handlePrint}
            disabled={printing}
          >
            {printing ? (
              <ActivityIndicator color={colors.textLight} size="small" />
            ) : (
              <Text style={styles.actionButtonText}>{t("payments.print")}</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.shareButton]}
            onPress={handleShare}
            disabled={sharing}
          >
            {sharing ? (
              <ActivityIndicator color={colors.textLight} size="small" />
            ) : (
              <Text style={styles.actionButtonText}>
                {t("payments.sharePDF")}
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
  scrollView: {
    flex: 1,
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
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  summaryCard: {
    backgroundColor: "#FFFFFF",
    margin: 12,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  summaryValue: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: "600",
  },
  summaryValueHighlight: {
    fontSize: 16,
    fontWeight: "700",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 12,
  },
  tableContainer: {
    backgroundColor: "#FFFFFF",
    margin: 12,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: colors.primary,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 2,
    marginBottom: 2,
  },
  tableHeaderCell: {
    color: colors.textLight,
    fontSize: 12,
    fontWeight: "700",
    paddingHorizontal: 2,
  },
  tableBody: {
    maxHeight: 500,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tableRowEven: {
    backgroundColor: "#FFFFFF",
  },
  tableRowOdd: {
    backgroundColor: "#F9F9F9",
  },
  tableCell: {
    fontSize: 12,
    color: colors.textPrimary,
    paddingHorizontal: 2,
  },
  colNo: {
    width: "12%",
  },
  colDate: {
    width: "38%",
  },
  colAmount: {
    width: "25%",
  },
  colBalance: {
    width: "25%",
  },
  textCenter: {
    textAlign: "center",
  },
  textRight: {
    textAlign: "right",
  },
  amountText: {
    fontWeight: "700",
    color: colors.success,
  },
  balanceText: {
    fontWeight: "700",
    color: colors.error,
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
    flexDirection: "row",
    padding: 12,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#4A4A4A",
  },
  printButton: {
    backgroundColor: colors.primary,
  },
  shareButton: {
    backgroundColor: colors.info,
  },
  actionButtonText: {
    color: colors.textLight,
    fontSize: 16,
    fontWeight: "600",
  },
});
