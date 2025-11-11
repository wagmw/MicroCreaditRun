import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../../theme/colors";
import api from "../../api/client";
import { formatCurrency } from "../../utils/currency";
import { useLocalization } from "../../context/LocalizationContext";

export default function PaymentsListScreen({ navigation }) {
  const { t } = useLocalization();
  // Fetch payments from API
  const fetchPayments = async () => {
    try {
      const response = await api.get("/payments/all");
      setPayments(response.data);
    } catch (error) {
      console.error("Failed to fetch payments:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filter states
  const [showToday, setShowToday] = useState(true);
  const [showUnbanked, setShowUnbanked] = useState(true);
  const [showActiveLoansOnly, setShowActiveLoansOnly] = useState(true);

  // Set header options
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerStyle: {
        backgroundColor: colors.primary,
      },
      headerTintColor: colors.textLight,
      headerTitle: t("payments.title"),
    });
  }, [navigation, t]);

  useEffect(() => {
    fetchPayments();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [payments, showToday, showUnbanked, showActiveLoansOnly]);

  const applyFilters = () => {
    let filtered = [...payments];

    // Filter by active loans first if enabled
    if (showActiveLoansOnly) {
      filtered = filtered.filter((payment) => {
        return payment.Loan && payment.Loan.status === "ACTIVE";
      });
    }

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Apply filters based on toggle states
    if (showToday && showUnbanked) {
      // Both selected: Show today's unbanked payments
      filtered = filtered.filter((payment) => {
        const paymentDate = new Date(payment.paidAt);
        const isToday = paymentDate >= today && paymentDate < tomorrow;
        return isToday && !payment.banked;
      });
    } else if (showToday) {
      // Only today: Show all payments from today
      filtered = filtered.filter((payment) => {
        const paymentDate = new Date(payment.paidAt);
        return paymentDate >= today && paymentDate < tomorrow;
      });
    } else if (showUnbanked) {
      // Only unbanked: Show all unbanked payments
      filtered = filtered.filter((payment) => !payment.banked);
    } else {
      // Neither selected: Show all payments
      filtered = payments;
    }

    // Sort by most recent first
    filtered.sort((a, b) => new Date(b.paidAt) - new Date(a.paidAt));

    setFilteredPayments(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchPayments();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateTotalAmount = () => {
    return filteredPayments.reduce((sum, payment) => sum + payment.amount, 0);
  };

  const renderPaymentItem = ({ item }) => (
    <View style={styles.paymentCard}>
      <View style={styles.paymentHeader}>
        <View style={styles.customerInfo}>
          <Text style={styles.customerName}>
            {item.Customer?.fullName || "Unknown"}
          </Text>
          <Text style={styles.loanAmount}>
            {t("payments.loan")}: Rs.{" "}
            {item.Loan?.amount ? formatCurrency(item.Loan.amount) : "N/A"}
          </Text>
        </View>
        <View style={styles.amountContainer}>
          <Text style={styles.paymentAmount}>
            Rs. {formatCurrency(item.amount)}
          </Text>
          {!item.banked ? (
            <View style={styles.unbankedBadge}>
              <Text style={styles.unbankedText}>{t("payments.unbanked")}</Text>
            </View>
          ) : item.BankAccount ? (
            <View style={styles.bankedBadge}>
              <Text style={styles.bankedText}>{item.BankAccount.nickname}</Text>
            </View>
          ) : null}
        </View>
      </View>

      <View style={styles.paymentDetails}>
        <View style={[styles.detailRow, { marginBottom: 4 }]}>
          <Text style={styles.detailLabel}>{t("common.date")}:</Text>
          <Text style={styles.detailValue}>{formatDate(item.paidAt)}</Text>
        </View>
        <View style={[styles.detailRow, { marginBottom: 4 }]}>
          <Text style={styles.detailLabel}>{t("payments.time")}:</Text>
          <Text style={styles.detailValue}>{formatTime(item.paidAt)}</Text>
        </View>
        {item.note && (
          <View style={[styles.detailRow, { marginBottom: 4 }]}>
            <Text style={styles.detailLabel}>{t("common.note")}:</Text>
            <Text style={styles.detailValue}>{item.note}</Text>
          </View>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>{t("payments.loadingPayments")}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      {/* Filter Toggles */}
      <View style={styles.filterSection}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginRight: 12,
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: "600", marginRight: 6 }}>
              {t("payments.activeLoans")}
            </Text>
            <Switch
              value={showActiveLoansOnly}
              onValueChange={setShowActiveLoansOnly}
              trackColor={{ false: colors.border, true: "#FF6B6B" }}
              thumbColor={showActiveLoansOnly ? "#FFFFFF" : "#F4F3F4"}
            />
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginRight: 12,
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: "600", marginRight: 6 }}>
              {t("payments.today")}
            </Text>
            <Switch
              value={showToday}
              onValueChange={setShowToday}
              trackColor={{ false: colors.border, true: colors.success }}
              thumbColor={showToday ? "#FFFFFF" : "#F4F3F4"}
            />
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: "600", marginRight: 6 }}>
              {t("payments.unbanked")}
            </Text>
            <Switch
              value={showUnbanked}
              onValueChange={setShowUnbanked}
              trackColor={{ false: colors.border, true: colors.warning }}
              thumbColor={showUnbanked ? "#FFFFFF" : "#F4F3F4"}
            />
          </View>
        </View>
      </View>

      {/* Summary Bar */}
      <View style={styles.summaryBar}>
        <Text style={styles.summaryText}>
          {filteredPayments.length}{" "}
          {filteredPayments.length !== 1
            ? t("payments.paymentsCountPlural")
            : t("payments.paymentsCount")}
        </Text>
        <Text style={styles.summaryTotal}>
          {t("common.total")}: Rs. {formatCurrency(calculateTotalAmount())}
        </Text>
      </View>

      {/* Payments List */}
      <FlatList
        data={filteredPayments}
        renderItem={renderPaymentItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {t("payments.noPaymentsFound")}
            </Text>
            <Text style={styles.emptySubtext}>
              {showToday && showUnbanked
                ? t("payments.noUnbankedPaymentsToday")
                : showToday
                ? t("payments.noPaymentsToday")
                : showUnbanked
                ? t("payments.allPaymentsBanked")
                : t("payments.noPaymentsAvailable")}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
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
  filterSection: {
    padding: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  summaryBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    backgroundColor: colors.info + "15",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  summaryText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  summaryTotal: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.primary,
  },
  listContainer: {
    padding: 12,
  },
  paymentCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 1,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  paymentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  customerInfo: {
    flex: 1,
    marginRight: 10,
  },
  customerName: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 3,
  },
  loanAmount: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  amountContainer: {
    alignItems: "flex-end",
  },
  paymentAmount: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.success,
    marginBottom: 4,
  },
  unbankedBadge: {
    backgroundColor: colors.warning,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  unbankedText: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.textLight,
    textTransform: "uppercase",
  },
  bankedBadge: {
    backgroundColor: colors.success,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  bankedText: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.textLight,
  },
  paymentDetails: {},
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  emptyContainer: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textTertiary,
    textAlign: "center",
  },
});
