import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import api from "../../api/client";
import { formatCurrency } from "../../utils/currency";
import { useLocalization } from "../../context/LocalizationContext";

export default function DuePaymentsScreen({ navigation }) {
  const { t } = useLocalization();
  const [duePayments, setDuePayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDuePayments();
  }, []);

  const fetchDuePayments = async () => {
    try {
      // Fetch all active loans with their payment details
      const response = await api.get("/loans?status=ACTIVE");
      const loans = response.data;

      // Calculate due payments for each loan
      const dueList = [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (const loan of loans) {
        // Calculate total paid amount
        const totalPaid =
          loan.payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0;

        // Calculate total expected (principal + interest)
        const totalInterest =
          (loan.amount *
            loan.interest30 *
            (loan.durationDays || loan.durationMonths * 30 || 30)) /
          30 /
          100;
        const totalExpected = loan.amount + totalInterest;

        // Calculate remaining due
        const totalDue = totalExpected - totalPaid;

        if (totalDue > 0) {
          // Calculate expected payment per installment
          let totalInstallments = 1;
          if (loan.frequency === "DAILY") {
            totalInstallments = loan.durationDays || 30;
          } else if (loan.frequency === "WEEKLY") {
            totalInstallments = Math.ceil((loan.durationDays || 30) / 7);
          } else if (loan.frequency === "MONTHLY") {
            totalInstallments = loan.durationMonths || 1;
          }

          const installmentAmount = totalExpected / totalInstallments;
          const paidInstallments = Math.floor(totalPaid / installmentAmount);
          const remainingInstallments = totalInstallments - paidInstallments;

          // Calculate days since start
          const startDate = new Date(loan.startDate);
          const daysSinceStart = Math.floor(
            (today - startDate) / (1000 * 60 * 60 * 24)
          );

          // Determine if payment is due today
          let isDueToday = false;
          if (loan.frequency === "DAILY") {
            isDueToday = daysSinceStart >= paidInstallments;
          } else if (loan.frequency === "WEEKLY") {
            const weeksSinceStart = Math.floor(daysSinceStart / 7);
            isDueToday = weeksSinceStart >= paidInstallments;
          } else if (loan.frequency === "MONTHLY") {
            const monthsSinceStart = Math.floor(daysSinceStart / 30);
            isDueToday = monthsSinceStart >= paidInstallments;
          }

          // Calculate overdue installments
          let overdueCount = 0;
          if (loan.frequency === "DAILY") {
            overdueCount = Math.max(0, daysSinceStart - paidInstallments - 1);
          } else if (loan.frequency === "WEEKLY") {
            const weeksSinceStart = Math.floor(daysSinceStart / 7);
            overdueCount = Math.max(0, weeksSinceStart - paidInstallments - 1);
          } else if (loan.frequency === "MONTHLY") {
            const monthsSinceStart = Math.floor(daysSinceStart / 30);
            overdueCount = Math.max(0, monthsSinceStart - paidInstallments - 1);
          }

          dueList.push({
            loanId: loan.id,
            loanNumber: loan.loanId,
            customerName:
              loan.applicant?.fullName || loan.Customer?.fullName || "Unknown",
            customerPhone:
              loan.applicant?.mobilePhone || loan.Customer?.mobilePhone || "",
            loanAmount: loan.amount,
            totalDue: totalDue,
            installmentAmount: installmentAmount,
            remainingInstallments: remainingInstallments,
            isDueToday: isDueToday,
            overdueCount: overdueCount,
            frequency: loan.frequency,
          });
        }
      }

      // Sort by overdue count (highest first), then by due today
      dueList.sort((a, b) => {
        if (b.overdueCount !== a.overdueCount) {
          return b.overdueCount - a.overdueCount;
        }
        if (a.isDueToday !== b.isDueToday) {
          return a.isDueToday ? -1 : 1;
        }
        return b.totalDue - a.totalDue;
      });

      setDuePayments(dueList);
    } catch (error) {
      console.error("Failed to fetch due payments:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDuePayments();
  };

  const handleCallCustomer = (phone) => {
    // In a real app, this would trigger a phone call
    console.log("Calling:", phone);
  };

  const renderDuePayment = ({ item }) => (
    <View style={styles.paymentCard}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <Text style={styles.customerName}>{item.customerName}</Text>
          <Text style={styles.loanNumber}>
            {t("payments.loan")}: {item.loanNumber}
          </Text>
        </View>
        <View style={styles.headerRight}>
          {item.overdueCount > 0 && (
            <View style={styles.overdueBadge}>
              <Icon name="alert" size={16} color="#FFF" />
              <Text style={styles.overdueText}>
                {item.overdueCount} {t("payments.overdueLabel")}
              </Text>
            </View>
          )}
          {item.isDueToday && item.overdueCount === 0 && (
            <View style={styles.dueTodayBadge}>
              <Icon name="calendar-today" size={16} color="#FFF" />
              <Text style={styles.dueTodayText}>
                {t("payments.dueTodayLabel")}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Payment Details */}
      <View style={styles.cardContent}>
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Icon name="cash" size={20} color={colors.textSecondary} />
            <View style={styles.detailText}>
              <Text style={styles.detailLabel}>
                {t("payments.installmentAmount")}
              </Text>
              <Text style={styles.detailValue}>
                Rs. {formatCurrency(item.installmentAmount)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Icon name="calculator" size={20} color={colors.textSecondary} />
            <View style={styles.detailText}>
              <Text style={styles.detailLabel}>
                {t("payments.totalOutstanding")}
              </Text>
              <Text style={[styles.detailValue, { color: colors.error }]}>
                Rs. {formatCurrency(item.totalDue)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Icon
              name="calendar-multiple"
              size={20}
              color={colors.textSecondary}
            />
            <View style={styles.detailText}>
              <Text style={styles.detailLabel}>
                {t("payments.remainingInstallments")}
              </Text>
              <Text style={styles.detailValue}>
                {item.remainingInstallments} ({item.frequency})
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.cardActions}>
        {item.customerPhone && (
          <TouchableOpacity
            style={styles.callButton}
            onPress={() => handleCallCustomer(item.customerPhone)}
          >
            <Icon name="phone" size={18} color={colors.success} />
            <Text style={styles.callButtonText}>{item.customerPhone}</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.collectButton}
          onPress={() =>
            navigation.navigate("AddPayment", {
              loanId: item.loanId,
              customerId: item.customerName,
              preSelectedLoan: item.loanNumber,
            })
          }
        >
          <Icon name="cash-plus" size={18} color="#FFF" />
          <Text style={styles.collectButtonText}>
            {t("payments.collectPayment")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={["bottom"]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>
          {t("payments.loadingDuePayments")}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      {/* Summary Header */}
      <View style={styles.summaryHeader}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>{t("payments.totalLoans")}</Text>
          <Text style={styles.summaryValue}>{duePayments.length}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>{t("payments.overdue")}</Text>
          <Text style={[styles.summaryValue, { color: colors.error }]}>
            {duePayments.filter((p) => p.overdueCount > 0).length}
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>{t("payments.dueToday")}</Text>
          <Text style={[styles.summaryValue, { color: colors.warning }]}>
            {
              duePayments.filter((p) => p.isDueToday && p.overdueCount === 0)
                .length
            }
          </Text>
        </View>
      </View>

      {duePayments.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="check-circle" size={80} color={colors.success} />
          <Text style={styles.emptyTitle}>{t("payments.allCaughtUp")}</Text>
          <Text style={styles.emptySubtitle}>
            {t("payments.noPendingPayments")}
          </Text>
        </View>
      ) : (
        <FlatList
          data={duePayments}
          renderItem={renderDuePayment}
          keyExtractor={(item) => item.loanId}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
        />
      )}
    </SafeAreaView>
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
    marginTop: 12,
    fontSize: 14,
    color: colors.textSecondary,
  },
  summaryHeader: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 6,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  listContainer: {
    padding: 12,
  },
  paymentCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 10,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F3F5",
  },
  headerLeft: {
    flex: 1,
  },
  customerName: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 3,
  },
  loanNumber: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  headerRight: {
    marginLeft: 12,
  },
  overdueBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.error,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 4,
    gap: 4,
  },
  overdueText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#FFF",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  dueTodayBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.warning,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 4,
    gap: 4,
  },
  dueTodayText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#FFF",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  cardContent: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  detailRow: {
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  detailText: {
    marginLeft: 10,
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginBottom: 2,
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: "600",
  },
  cardActions: {
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#E9ECEF",
    gap: 8,
  },
  callButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: colors.success,
  },
  callButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.success,
    marginLeft: 6,
  },
  collectButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.primary,
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  collectButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
    marginLeft: 6,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.textPrimary,
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
  },
});
