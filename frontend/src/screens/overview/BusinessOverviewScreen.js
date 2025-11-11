import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import api from "../../api/client";
import { formatCurrency } from "../../utils/currency";
import { useLocalization } from "../../context/LocalizationContext";

const { width } = Dimensions.get("window");

export default function BusinessOverviewScreen({ navigation }) {
  const { t } = useLocalization();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totalInvested, setTotalInvested] = useState(0);
  const [profit, setProfit] = useState(0);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: t("businessOverview.title"),
    });
  }, [navigation, t]);

  const fetchDashboardStats = async () => {
    try {
      const response = await api.get("/dashboard/stats");
      setStats(response.data);
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchFundsTotal = async () => {
    try {
      const resp = await api.get("/funds/summary/total");
      const total = resp.data?.totalAmount || 0;
      setTotalInvested(total);
    } catch (error) {
      console.error("Failed to fetch funds total:", error);
    }
  };

  // Calculate profit whenever stats or totalInvested changes
  // Profit = Outstanding - Invested - Expenses
  useEffect(() => {
    if (stats && stats.totalToBeCollected !== undefined) {
      const totalExpenses = stats.totalExpenses || 0;
      const calculatedProfit =
        (stats.totalToBeCollected || 0) - totalInvested - totalExpenses;
      setProfit(calculatedProfit);
    }
  }, [stats, totalInvested]);

  useEffect(() => {
    fetchDashboardStats();
    fetchFundsTotal();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardStats();
    fetchFundsTotal();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>
          {t("businessOverview.loadingOverview")}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
    >
      {/* Header Section */}
      <View style={styles.header}>
        <Icon name="chart-line" size={40} color={colors.primary} />
        <Text style={styles.headerTitle}>{t("businessOverview.title")}</Text>
        <Text style={styles.headerSubtitle}>
          {t("businessOverview.subtitle")}
        </Text>
      </View>

      {stats ? (
        <>
          {/* Financial Summary Cards */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t("businessOverview.financialSummary")}
            </Text>

            <View style={styles.cardRow}>
              <View style={[styles.card, styles.cardPrimary]}>
                <View style={styles.cardIcon}>
                  <Icon name="cash-multiple" size={28} color={colors.primary} />
                </View>
                <Text style={styles.cardLabel}>
                  {t("businessOverview.outstandingBalance")}
                </Text>
                <Text style={styles.cardValue}>
                  Rs. {formatCurrency(stats.totalToBeCollected || 0)}
                </Text>
                <Text style={styles.cardHint}>
                  {t("businessOverview.fromAllActiveLoans")}
                </Text>
              </View>

              <View style={[styles.card, styles.cardSuccess]}>
                <View style={styles.cardIcon}>
                  <Icon name="bank" size={28} color={colors.success} />
                </View>
                <Text style={styles.cardLabel}>
                  {t("businessOverview.totalFundInvested")}
                </Text>
                <Text style={styles.cardValue}>
                  Rs. {formatCurrency(totalInvested)}
                </Text>
                <Text style={styles.cardHint}>
                  {t("businessOverview.capitalDeployed")}
                </Text>
              </View>
            </View>

            {/* Expenses Card */}
            {stats.totalExpenses > 0 && (
              <View
                style={[
                  styles.card,
                  styles.cardFull,
                  styles.expenseCard,
                  { marginBottom: 12 },
                ]}
              >
                <View style={styles.cardIcon}>
                  <Icon name="receipt" size={28} color={colors.error} />
                </View>
                <Text style={styles.cardLabel}>
                  {t("businessOverview.totalExpenses")}
                </Text>
                <Text style={[styles.cardValue, { color: colors.error }]}>
                  Rs. {formatCurrency(stats.totalExpenses || 0)}
                </Text>
                <Text style={styles.cardHint}>
                  {t("businessOverview.operationalExpenses")}
                </Text>
              </View>
            )}

            {/* Profit Card - Full Width */}
            <View style={[styles.card, styles.cardFull, styles.profitCard]}>
              <View style={styles.profitHeader}>
                <View style={styles.cardIcon}>
                  <Icon
                    name="trending-up"
                    size={32}
                    color={profit >= 0 ? colors.success : colors.error}
                  />
                </View>
                <View style={styles.profitContent}>
                  <Text style={styles.profitLabel}>
                    {t("businessOverview.currentProfit")}
                  </Text>
                  <Text
                    style={[
                      styles.profitValue,
                      { color: profit >= 0 ? colors.success : colors.error },
                    ]}
                  >
                    Rs. {formatCurrency(profit || 0)}
                  </Text>
                  <Text style={styles.profitHint}>
                    {t("businessOverview.profitFormula")}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Business Metrics */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t("businessOverview.businessMetrics")}
            </Text>

            <View style={styles.metricsGrid}>
              <View style={styles.metricCard}>
                <Icon name="file-document" size={24} color={colors.primary} />
                <Text style={styles.metricValue}>{stats.activeLoans}</Text>
                <Text style={styles.metricLabel}>
                  {t("businessOverview.activeLoans")}
                </Text>
              </View>

              <View style={styles.metricCard}>
                <Icon name="check-circle" size={24} color={colors.success} />
                <Text style={styles.metricValue}>{stats.completedLoans}</Text>
                <Text style={styles.metricLabel}>
                  {t("businessOverview.completed")}
                </Text>
              </View>

              <View style={styles.metricCard}>
                <Icon name="account-group" size={24} color={colors.primary} />
                <Text style={styles.metricValue}>{stats.customers}</Text>
                <Text style={styles.metricLabel}>
                  {t("businessOverview.customers")}
                </Text>
              </View>

              <View style={styles.metricCard}>
                <Icon
                  name="alert-circle"
                  size={24}
                  color={
                    stats.overduePayments > 0
                      ? colors.error
                      : colors.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.metricValue,
                    stats.overduePayments > 0 && { color: colors.error },
                  ]}
                >
                  {stats.overduePayments}
                </Text>
                <Text style={styles.metricLabel}>
                  {t("businessOverview.overdue")}
                </Text>
              </View>
            </View>
          </View>

          {/* Operations Summary */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t("businessOverview.operations")}
            </Text>

            <View style={styles.operationCard}>
              <View style={styles.operationRow}>
                <View style={styles.operationIcon}>
                  <Icon name="bank-transfer" size={24} color={colors.primary} />
                </View>
                <View style={styles.operationContent}>
                  <Text style={styles.operationLabel}>
                    {t("businessOverview.pendingDeposits")}
                  </Text>
                  <Text style={styles.operationHint}>
                    {t("businessOverview.pendingDepositsHint")}
                  </Text>
                </View>
                <Text style={styles.operationValue}>
                  Rs. {formatCurrency(stats.pendingDeposit)}
                </Text>
              </View>
            </View>
          </View>

          {/* Summary Footer */}
          <View style={styles.footer}>
            <Icon name="information" size={16} color={colors.textSecondary} />
            <Text style={styles.footerText}>
              {t("businessOverview.pullToRefresh")} •{" "}
              {t("businessOverview.lastUpdated")}:{" "}
              {new Date().toLocaleTimeString()}
            </Text>
          </View>
        </>
      ) : (
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={48} color={colors.error} />
          <Text style={styles.errorText}>
            {t("businessOverview.failedToLoad")}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 12,
    color: colors.textSecondary,
    fontSize: 14,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
    paddingVertical: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.textPrimary,
    marginTop: 12,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 6,
    textAlign: "center",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 16,
    paddingLeft: 4,
  },
  cardRow: {
    flexDirection: "row",
    marginBottom: 12,
    gap: 12,
  },
  card: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  cardFull: {
    flex: 1,
    width: "100%",
  },
  cardPrimary: {
    // No colored border - flat modern design
  },
  cardSuccess: {
    // No colored border - flat modern design
  },
  profitCard: {
    // No colored border - flat modern design
    backgroundColor: "#fff",
  },
  expenseCard: {
    backgroundColor: "#fff",
  },
  cardIcon: {
    marginBottom: 12,
  },
  cardLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 8,
    fontWeight: "500",
  },
  cardValue: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  cardHint: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 4,
  },
  profitHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  profitContent: {
    flex: 1,
  },
  profitLabel: {
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: 6,
    fontWeight: "500",
  },
  profitValue: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 4,
  },
  profitHint: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 4,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  metricCard: {
    width: (width - 40 - 12) / 2,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.textPrimary,
    marginVertical: 8,
  },
  metricLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: "center",
    fontWeight: "500",
  },
  operationCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  operationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  operationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary + "15",
    justifyContent: "center",
    alignItems: "center",
  },
  operationContent: {
    flex: 1,
  },
  operationLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  operationHint: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  operationValue: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.primary,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    gap: 8,
    paddingVertical: 12,
  },
  footerText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  errorContainer: {
    alignItems: "center",
    marginTop: 60,
  },
  errorText: {
    fontSize: 16,
    color: colors.error,
    marginTop: 12,
  },
});
