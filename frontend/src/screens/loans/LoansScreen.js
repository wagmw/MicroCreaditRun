import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  colors,
  listStyles,
  statusStyles,
  buttonStyles,
  utilityStyles,
} from "../../theme";
import api from "../../api/client";
import { formatCurrency } from "../../utils/currency";
import { useLocalization } from "../../context/LocalizationContext";

import logger from "../../utils/logger";
export default function LoansScreen({ route, navigation }) {
  const { t } = useLocalization();
  const { customerId, customerName, refresh } = route.params || {};
  const [loans, setLoans] = useState([]);
  const [filteredLoans, setFilteredLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Status filters - only for All Loans view
  const [showActive, setShowActive] = useState(true);
  const [showSettled, setShowSettled] = useState(true);
  const [showCompleted, setShowCompleted] = useState(false);
  const [showRenewed, setShowRenewed] = useState(false);

  const isCustomerView = !!customerId;

  // Set navigation header title with translation
  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: isCustomerView
        ? `${t("loans.loansFor")} ${customerName}`
        : t("loans.title"),
    });
  }, [navigation, t, isCustomerView, customerName]);

  useEffect(() => {
    if (refresh) {
      fetchLoans();
    }
  }, [refresh]);

  const fetchLoans = async () => {
    try {
      let response;
      if (isCustomerView) {
        // Fetch loans for specific customer
        response = await api.get(`/loans/customer/${customerId}`);
        const allLoans = response.data;
        setLoans(allLoans);

        // Apply status filter for customer view
        const filtered = allLoans.filter((loan) => {
          if (showActive && loan.status === "ACTIVE") return true;
          if (showSettled && loan.status === "SETTLED") return true;
          if (showCompleted && loan.status === "COMPLETED") return true;
          if (showRenewed && loan.status === "RENEWED") return true;
          return false;
        });
        setFilteredLoans(filtered);
      } else {
        // Fetch all loans with status filter
        const statuses = [];
        if (showActive) statuses.push("ACTIVE");
        if (showSettled) statuses.push("SETTLED");
        if (showCompleted) statuses.push("COMPLETED");
        if (showRenewed) statuses.push("RENEWED");

        if (statuses.length === 0) {
          setLoans([]);
          setFilteredLoans([]);
          setLoading(false);
          setRefreshing(false);
          return;
        }

        const statusParam = statuses.join(",");
        response = await api.get(`/loans?status=${statusParam}`);
        setLoans(response.data);

        // Apply search filter if exists
        if (searchQuery.trim()) {
          applySearchFilter(response.data, searchQuery);
        } else {
          setFilteredLoans(response.data);
        }
      }
    } catch (error) {
      logger.error("Failed to fetch loans:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, [customerId, showActive, showSettled, showCompleted, showRenewed]);

  const applySearchFilter = (loansData, query) => {
    if (!query.trim()) {
      setFilteredLoans(loansData);
      return;
    }

    const lowercaseQuery = query.toLowerCase();
    const filtered = loansData.filter((loan) => {
      const customerName = loan.applicant?.fullName?.toLowerCase() || "";
      const amount = loan.amount.toString();
      const phone = loan.applicant?.mobilePhone?.toLowerCase() || "";
      const frequency = loan.frequency.toLowerCase();

      return (
        customerName.includes(lowercaseQuery) ||
        amount.includes(lowercaseQuery) ||
        phone.includes(lowercaseQuery) ||
        frequency.includes(lowercaseQuery)
      );
    });

    setFilteredLoans(filtered);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    applySearchFilter(loans, query);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchLoans();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
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
      return `${loan.durationMonths} ${
        loan.durationMonths > 1 ? t("loans.monthPlural") : t("loans.month")
      }`;
    } else if (loan.durationDays) {
      return `${loan.durationDays} ${
        loan.durationDays > 1 ? t("loans.dayPlural") : t("loans.day")
      }`;
    }
    return t("loans.openEnded");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "ACTIVE":
        return colors.success;
      case "COMPLETED":
        return colors.info;
      case "SETTLED":
        return colors.warning;
      case "RENEWED":
        return "#9C27B0"; // Purple
      case "DEFAULTED":
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusText = (status) => {
    return status.charAt(0) + status.slice(1).toLowerCase();
  };

  const renderLoanCard = ({ item }) => (
    <TouchableOpacity
      style={listStyles.card}
      onPress={() => navigation.navigate("LoanDetails", { loanId: item.id })}
      activeOpacity={0.7}
    >
      <View style={listStyles.cardHeader}>
        <View style={{ flex: 1 }}>
          {!isCustomerView && item.applicant && (
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 3,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "700",
                  color: colors.textPrimary,
                  flex: 1,
                  marginRight: 8,
                }}
              >
                {item.applicant.fullName}
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                {item.loanId && (
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: "700",
                      color: colors.textPrimary,
                    }}
                  >
                    ID: {item.loanId}
                  </Text>
                )}
                <View
                  style={[
                    statusStyles.badge,
                    { backgroundColor: getStatusColor(item.status) },
                  ]}
                >
                  <Text style={statusStyles.badgeText}>
                    {getStatusText(item.status)}
                  </Text>
                </View>
              </View>
            </View>
          )}
          {isCustomerView && item.loanId && (
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 3,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "700",
                  color: colors.textPrimary,
                  flex: 1,
                  marginRight: 8,
                }}
              >
                Rs. {formatCurrency(item.amount)}
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: "700",
                    color: colors.textPrimary,
                  }}
                >
                  ID: {item.loanId}
                </Text>
                <View
                  style={[
                    statusStyles.badge,
                    { backgroundColor: getStatusColor(item.status) },
                  ]}
                >
                  <Text style={statusStyles.badgeText}>
                    {getStatusText(item.status)}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>
      </View>

      <View style={listStyles.cardContent}>
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          <View style={{ flex: 1, minWidth: "45%" }}>
            <Text
              style={{
                fontSize: 10,
                color: colors.textSecondary,
                marginBottom: 1,
              }}
            >
              {t("loans.amount")}
            </Text>
            <Text style={{ fontSize: 12, fontWeight: "600" }}>
              Rs. {formatCurrency(item.amount)}
            </Text>
          </View>
          <View style={{ flex: 1, minWidth: "45%" }}>
            <Text
              style={{
                fontSize: 10,
                color: colors.textSecondary,
                marginBottom: 1,
              }}
            >
              {t("loans.interestRate")}
            </Text>
            <Text style={{ fontSize: 12, fontWeight: "600" }}>
              {item.interest30}% / 30d
            </Text>
          </View>
          <View style={{ flex: 1, minWidth: "45%" }}>
            <Text
              style={{
                fontSize: 10,
                color: colors.textSecondary,
                marginBottom: 1,
              }}
            >
              {t("loans.duration")}
            </Text>
            <Text style={{ fontSize: 12, fontWeight: "600" }}>
              {getDurationText(item)}
            </Text>
          </View>
          <View style={{ flex: 1, minWidth: "45%" }}>
            <Text
              style={{
                fontSize: 10,
                color: colors.textSecondary,
                marginBottom: 1,
              }}
            >
              {t("loans.frequency")}
            </Text>
            <Text style={{ fontSize: 12, fontWeight: "600" }}>
              {item.frequency}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View
        style={[
          utilityStyles.flex1,
          utilityStyles.justifyCenter,
          utilityStyles.alignCenter,
          utilityStyles.bgBackground,
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text
          style={[
            utilityStyles.mt8,
            utilityStyles.text16,
            utilityStyles.textSecondary,
          ]}
        >
          {t("common.loading")}
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[utilityStyles.flex1, utilityStyles.bgBackground]}
      edges={["bottom"]}
    >
      {/* Search Bar - only for All Loans view */}
      {!isCustomerView && (
        <View style={{ padding: 12, paddingBottom: 8 }}>
          <TextInput
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 8,
              padding: 12,
              fontSize: 14,
              borderWidth: 1,
              borderColor: colors.border,
            }}
            placeholder={t("loans.searchPlaceholder")}
            value={searchQuery}
            onChangeText={handleSearch}
            placeholderTextColor={colors.textTertiary}
          />
        </View>
      )}
      {/* Status Filter - for both views */}
      <View
        style={{
          backgroundColor: "#FFFFFF",
          paddingHorizontal: 12,
          paddingVertical: 10,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        {/* Filter Grid - Two Rows */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 6,
          }}
        >
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: showActive ? "#F0FDF4" : "#F8FAFC",
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 8,
              borderWidth: 1.5,
              borderColor: showActive ? colors.success : "#E2E8F0",
              marginRight: 6,
            }}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: "600",
                color: showActive ? colors.success : colors.textSecondary,
              }}
            >
              {t("loans.active")}
            </Text>
            <Switch
              value={showActive}
              onValueChange={setShowActive}
              trackColor={{ false: "#D1D5DB", true: colors.success }}
              thumbColor="#FFFFFF"
              style={{ transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }] }}
            />
          </View>
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: showSettled ? "#FFFBEB" : "#F8FAFC",
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 8,
              borderWidth: 1.5,
              borderColor: showSettled ? colors.warning : "#E2E8F0",
            }}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: "600",
                color: showSettled ? colors.warning : colors.textSecondary,
              }}
            >
              {t("loans.settled")}
            </Text>
            <Switch
              value={showSettled}
              onValueChange={setShowSettled}
              trackColor={{ false: "#D1D5DB", true: colors.warning }}
              thumbColor="#FFFFFF"
              style={{ transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }] }}
            />
          </View>
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: showCompleted ? "#EFF6FF" : "#F8FAFC",
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 8,
              borderWidth: 1.5,
              borderColor: showCompleted ? colors.info : "#E2E8F0",
              marginRight: 6,
            }}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: "600",
                color: showCompleted ? colors.info : colors.textSecondary,
              }}
            >
              {t("loans.completed")}
            </Text>
            <Switch
              value={showCompleted}
              onValueChange={setShowCompleted}
              trackColor={{ false: "#D1D5DB", true: colors.info }}
              thumbColor="#FFFFFF"
              style={{ transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }] }}
            />
          </View>
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: showRenewed ? "#FFF7ED" : "#F8FAFC",
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 8,
              borderWidth: 1.5,
              borderColor: showRenewed ? colors.primary : "#E2E8F0",
            }}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: "600",
                color: showRenewed ? colors.primary : colors.textSecondary,
              }}
            >
              {t("loans.renewed")}
            </Text>
            <Switch
              value={showRenewed}
              onValueChange={setShowRenewed}
              trackColor={{ false: "#D1D5DB", true: colors.primary }}
              thumbColor="#FFFFFF"
              style={{ transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }] }}
            />
          </View>
        </View>
      </View>

      {/* Header */}
      <View
        style={{
          backgroundColor: "#FFFFFF",
          padding: 14,
          paddingTop: isCustomerView ? 14 : 10,
          borderBottomWidth: 1,
          borderBottomColor: "rgba(0, 0, 0, 0.06)",
          elevation: 1,
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 3,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "700",
              color: colors.textPrimary,
              marginBottom: 4,
            }}
          >
            {isCustomerView
              ? `${t("loans.loansFor")} ${customerName}`
              : t("loans.allLoans")}
          </Text>
          <Text style={{ fontSize: 13, color: colors.textSecondary }}>
            {filteredLoans.length}{" "}
            {filteredLoans.length !== 1
              ? t("loans.loansPlural")
              : t("loans.loan")}
            {searchQuery ? ` ${t("loans.filtered")}` : ""}
          </Text>
        </View>
        {!isCustomerView && (
          <TouchableOpacity
            style={{
              backgroundColor: colors.primary,
              paddingVertical: 8,
              paddingHorizontal: 14,
              borderRadius: 10,
              elevation: 1,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
            }}
            onPress={() => navigation.navigate("AddLoan")}
          >
            <Text
              style={{
                color: colors.textLight,
                fontSize: 13,
                fontWeight: "700",
              }}
            >
              + {t("loans.new")}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        data={filteredLoans}
        renderItem={renderLoanCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[utilityStyles.p12, { paddingBottom: 20 }]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={listStyles.emptyContainer}>
            <Text style={listStyles.emptyText}>
              {searchQuery
                ? t("loans.noLoansMatch")
                : isCustomerView
                ? t("loans.noLoansForCustomer")
                : t("loans.noLoansFound")}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

// All styles moved to theme modules (listStyles, statusStyles, buttonStyles, utilityStyles)
