import React, { useState, useEffect, useRef } from "react";
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

import logger from "../../utils/logger";
export default function PaymentPlanScreen({ route, navigation }) {
  const { t } = useLocalization();
  const { loanId } = route.params;
  const [loan, setLoan] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [printing, setPrinting] = useState(false);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      title: t("payments.paymentPlan"),
    });
  }, [navigation, t]);

  useEffect(() => {
    fetchLoanAndSchedule();
  }, [loanId]);

  const fetchLoanAndSchedule = async () => {
    try {
      const response = await api.get(`/loans/${loanId}`);
      const loanData = response.data;
      setLoan(loanData);

      // Generate payment schedule
      const generatedSchedule = generatePaymentSchedule(loanData);
      setSchedule(generatedSchedule);
    } catch (error) {
      logger.error("Failed to fetch loan details:", error);
      Alert.alert(t("common.error"), t("payments.failedToLoadPaymentPlan"));
    } finally {
      setLoading(false);
    }
  };

  const generatePaymentSchedule = (loan) => {
    const schedule = [];
    const principal = loan.amount;
    const interest30 = loan.interest30;
    const durationMonths =
      loan.durationMonths || Math.ceil(loan.durationDays / 30);
    const frequency = loan.frequency;
    const startDate = new Date(loan.startDate);

    // Calculate total amount including interest
    const totalInterest = (principal * interest30 * durationMonths) / 100;
    const totalAmount = principal + totalInterest;

    // Calculate number of installments based on frequency
    let numberOfInstallments;
    let daysBetweenPayments;

    if (frequency === "MONTHLY") {
      numberOfInstallments = durationMonths;
      daysBetweenPayments = 30;
    } else if (frequency === "WEEKLY") {
      numberOfInstallments = Math.ceil((durationMonths * 30) / 7);
      daysBetweenPayments = 7;
    } else if (frequency === "DAILY") {
      numberOfInstallments = durationMonths * 30;
      daysBetweenPayments = 1;
    }

    const installmentAmount = totalAmount / numberOfInstallments;

    // Generate schedule
    let remainingBalance = totalAmount;
    for (let i = 0; i < numberOfInstallments; i++) {
      const paymentDate = new Date(startDate);
      paymentDate.setDate(paymentDate.getDate() + i * daysBetweenPayments);

      remainingBalance -= installmentAmount;

      schedule.push({
        installmentNumber: i + 1,
        dueDate: paymentDate,
        installmentAmount: installmentAmount,
        principalPortion: principal / numberOfInstallments,
        interestPortion: totalInterest / numberOfInstallments,
        remainingBalance: Math.max(0, remainingBalance),
      });
    }

    return schedule;
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatRs = (amount) => {
    return `Rs. ${formatCurrency(amount)}`;
  };

  const generateHTMLContent = () => {
    if (!loan || !schedule.length) return "";

    const totalAmount =
      loan.amount +
      (loan.amount *
        loan.interest30 *
        (loan.durationMonths || Math.ceil(loan.durationDays / 30))) /
        100;
    const installmentAmount = schedule[0].installmentAmount;
    const durationInMonths =
      loan.durationMonths || Math.ceil(loan.durationDays / 30);

    const scheduleRows = schedule
      .map(
        (item) => `
      <tr>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${
          item.installmentNumber
        }</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${formatDate(
          item.dueDate
        )}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatRs(
          item.installmentAmount
        )}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${formatRs(
          item.remainingBalance
        )}</td>
      </tr>
    `
      )
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
            @media print {
              body {
                padding: 10px;
              }
              .no-print {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">${t("payments.companyName")}</div>
            <div class="document-title">${t("payments.loanPaymentPlan")}</div>
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
              <div class="info-label">${t("payments.loanDate")}:</div>
              <div class="info-value">${formatDate(
                new Date(loan.startDate)
              )}</div>
            </div>
            <div class="info-block">
              <div class="info-label">${t("payments.loanStatus")}:</div>
              <div class="info-value">${loan.status}</div>
            </div>
          </div>

          <div class="summary-section">
            <div class="summary-row">
              <span class="summary-label">${t(
                "payments.principalAmount"
              )}:</span>
              <span class="summary-value">${formatRs(loan.amount)}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">${t("payments.interestRate")}:</span>
              <span class="summary-value">${loan.interest30}% ${t(
      "payments.perThirtyDays"
    )}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">${t("payments.duration")}:</span>
              <span class="summary-value">${durationInMonths} ${t(
      "payments.months"
    )}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">${t(
                "payments.paymentFrequency"
              )}:</span>
              <span class="summary-value">${loan.frequency}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">${t(
                "payments.totalAmountWithInterest"
              )}:</span>
              <span class="summary-value">${formatRs(totalAmount)}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">${t(
                "payments.installmentAmount"
              )}:</span>
              <span class="summary-value">${formatRs(installmentAmount)}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">${t(
                "payments.numberOfInstallments"
              )}:</span>
              <span class="summary-value">${schedule.length}</span>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="text-align: center;">${t("payments.no")}</th>
                <th>${t("payments.dueDate")}</th>
                <th style="text-align: right;">${t("payments.payment")}</th>
                <th style="text-align: right;">${t("payments.balance")}</th>
              </tr>
            </thead>
            <tbody>
              ${scheduleRows}
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

      // For web/Android, print directly with A4 paper size
      await Print.printAsync({
        html,
        width: 595, // A4 width in points (210mm)
        height: 842, // A4 height in points (297mm)
      });
    } catch (error) {
      logger.error("Failed to print:", error);
      Alert.alert(t("common.error"), t("payments.failedToPrint"));
    } finally {
      setPrinting(false);
    }
  };

  const handleShare = async () => {
    try {
      setSharing(true);
      const html = generateHTMLContent();

      // Create PDF with A4 paper size
      const { uri } = await Print.printToFileAsync({
        html,
        width: 595, // A4 width in points (210mm)
        height: 842, // A4 height in points (297mm)
      });

      // Share the PDF
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert(t("common.ok"), t("payments.sharingNotAvailable"));
      }
    } catch (error) {
      logger.error("Failed to share:", error);
      Alert.alert(t("common.error"), t("payments.failedToShare"));
    } finally {
      setSharing(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>
          {t("payments.loadingPaymentPlan")}
        </Text>
      </View>
    );
  }

  if (!loan || !schedule.length) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>
          {t("payments.paymentPlanNotAvailable")}
        </Text>
      </View>
    );
  }

  const totalAmount =
    loan.amount +
    (loan.amount *
      loan.interest30 *
      (loan.durationMonths || Math.ceil(loan.durationDays / 30))) /
      100;

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
              {t("payments.principalAmount")}:
            </Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(loan.amount)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              {t("payments.totalAmount")}:
            </Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(totalAmount)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              {t("payments.perInstallment")}:
            </Text>
            <Text style={styles.summaryValueHighlight}>
              {formatCurrency(schedule[0].installmentAmount)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              {t("payments.numberOfPayments")}:
            </Text>
            <Text style={styles.summaryValue}>{schedule.length}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{t("payments.frequency")}:</Text>
            <Text style={styles.summaryValue}>{loan.frequency}</Text>
          </View>
        </View>

        {/* Payment Schedule Table */}
        <View style={styles.tableContainer}>
          <Text style={styles.sectionTitle}>
            {t("payments.paymentSchedule")}
          </Text>

          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.colNo]}>
              {t("payments.no")}
            </Text>
            <Text style={[styles.tableHeaderCell, styles.colDate]}>
              {t("payments.dueDate")}
            </Text>
            <Text style={[styles.tableHeaderCell, styles.colPayment]}>
              {t("payments.payment")}
            </Text>
            <Text style={[styles.tableHeaderCell, styles.colBalance]}>
              {t("payments.balance")}
            </Text>
          </View>

          {/* Table Rows */}
          <ScrollView
            style={styles.tableBody}
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            {schedule.map((item, index) => (
              <View
                key={item.installmentNumber}
                style={[
                  styles.tableRow,
                  index % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd,
                ]}
              >
                <Text
                  style={[styles.tableCell, styles.colNo, styles.textCenter]}
                >
                  {item.installmentNumber}
                </Text>
                <Text style={[styles.tableCell, styles.colDate]}>
                  {formatDate(item.dueDate)}
                </Text>
                <Text
                  style={[
                    styles.tableCell,
                    styles.colPayment,
                    styles.textRight,
                  ]}
                >
                  {formatCurrency(item.installmentAmount)}
                </Text>
                <Text
                  style={[
                    styles.tableCell,
                    styles.colBalance,
                    styles.textRight,
                    styles.balanceText,
                  ]}
                >
                  {formatCurrency(item.remainingBalance)}
                </Text>
              </View>
            ))}
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
  errorText: {
    fontSize: 16,
    color: colors.error,
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
    color: colors.primary,
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
    paddingVertical: 12,
    paddingHorizontal: 4,
    marginBottom: 2,
  },
  tableHeaderCell: {
    color: colors.textLight,
    fontSize: 12,
    fontWeight: "700",
    paddingHorizontal: 4,
  },
  tableBody: {
    flexGrow: 0,
    flexShrink: 1,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 4,
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
    paddingHorizontal: 4,
  },
  colNo: {
    width: "12%",
  },
  colDate: {
    width: "38%",
  },
  colPayment: {
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
  balanceText: {
    fontWeight: "700",
    color: colors.primary,
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
