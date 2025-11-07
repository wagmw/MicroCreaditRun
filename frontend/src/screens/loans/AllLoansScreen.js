import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Switch,
} from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import api from "../../api/client";

export default function AllLoansScreen({ navigation }) {
  const [loans, setLoans] = useState([]);
  const [filteredLoans, setFilteredLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Set header options
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerStyle: {
        backgroundColor: colors.primary,
      },
      headerTintColor: colors.textLight,
      headerTitle: "All Loans",
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ marginLeft: 15 }}
        >
          <Icon name="arrow-left" size={24} color={colors.textLight} />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  // Status filters - default: Active and Approved ON, Completed OFF
  const [showActive, setShowActive] = useState(true);
  const [showApproved, setShowApproved] = useState(true);
  const [showCompleted, setShowCompleted] = useState(false);

  const fetchAllLoans = async () => {
    try {
      // Build status filter array based on toggle states
      const statuses = [];
      if (showActive) statuses.push("ACTIVE");
      if (showApproved) statuses.push("APPROVED");
      if (showCompleted) statuses.push("COMPLETED");

      // If no status selected, fetch nothing
      if (statuses.length === 0) {
        setLoans([]);
        setFilteredLoans([]);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      // Fetch loans with status filter
      const statusParam = statuses.join(",");
      const response = await api.get(`/loans?status=${statusParam}`);
      setLoans(response.data);

      // Apply search filter if exists
      if (searchQuery.trim()) {
        applySearchFilter(response.data, searchQuery);
      } else {
        setFilteredLoans(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch loans:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAllLoans();
  }, [showActive, showApproved, showCompleted]);

  const applySearchFilter = (loansData, query) => {
    if (!query.trim()) {
      setFilteredLoans(loansData);
      return;
    }

    const lowercaseQuery = query.toLowerCase();
    const filtered = loansData.filter((loan) => {
      // Search by customer name
      const customerName = loan.applicant?.fullName?.toLowerCase() || "";
      // Search by amount
      const amount = loan.amount.toString();
      // Search by phone
      const phone = loan.applicant?.mobilePhone?.toLowerCase() || "";
      // Search by frequency
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
    fetchAllLoans();
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

  const renderLoanCard = ({ item }) => (
    <TouchableOpacity
      style={styles.loanCard}
      onPress={() => navigation.navigate("LoanDetails", { loanId: item.id })}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.customerName} numberOfLines={1}>
          {item.applicant?.fullName || "Unknown"}
        </Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) },
          ]}
        >
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>
      <View style={styles.cardContent}>
        <View style={styles.amountRow}>
          <Icon name="cash" size={18} color={colors.primary} />
          <Text style={styles.amount}>Rs. {item.amount.toLocaleString()}</Text>
        </View>
        <View style={styles.infoRow}>
          <Icon name="percent" size={16} color={colors.primary} />
          <Text style={styles.infoText}>{item.interest30}%</Text>
          <Icon
            name="calendar-clock"
            size={16}
            color={colors.primary}
            style={styles.iconSpacing}
          />
          <Text style={styles.infoText}>{getDurationText(item)}</Text>
          <Icon
            name="calendar-refresh"
            size={16}
            color={colors.primary}
            style={styles.iconSpacing}
          />
          <Text style={styles.infoText}>{item.frequency}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading loans...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchSection}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by customer, amount, phone, frequency..."
          value={searchQuery}
          onChangeText={handleSearch}
          placeholderTextColor={colors.textTertiary}
        />
      </View>

      {/* Status Filter Toggles */}
      <View style={styles.filterSection}>
        <View style={styles.filterRow}>
          <View style={styles.filterItem}>
            <Text style={styles.filterLabel}>Active</Text>
            <Switch
              value={showActive}
              onValueChange={setShowActive}
              trackColor={{ false: colors.border, true: colors.success }}
              thumbColor={showActive ? "#FFFFFF" : "#F4F3F4"}
            />
          </View>
          <View style={styles.filterItem}>
            <Text style={styles.filterLabel}>Approved</Text>
            <Switch
              value={showApproved}
              onValueChange={setShowApproved}
              trackColor={{ false: colors.border, true: colors.warning }}
              thumbColor={showApproved ? "#FFFFFF" : "#F4F3F4"}
            />
          </View>
          <View style={styles.filterItem}>
            <Text style={styles.filterLabel}>Completed</Text>
            <Switch
              value={showCompleted}
              onValueChange={setShowCompleted}
              trackColor={{ false: colors.border, true: colors.info }}
              thumbColor={showCompleted ? "#FFFFFF" : "#F4F3F4"}
            />
          </View>
        </View>
      </View>

      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerText}>All Loans</Text>
          <Text style={styles.headerSubtext}>
            {filteredLoans.length} loan{filteredLoans.length !== 1 ? "s" : ""}
            {searchQuery ? ` (filtered)` : ""}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate("AddLoan")}
        >
          <Text style={styles.addButtonText}>+ New Loan</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredLoans}
        renderItem={renderLoanCard}
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
              {searchQuery
                ? "No loans found matching your search"
                : "No loans found"}
            </Text>
          </View>
        }
      />
    </View>
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
  searchSection: {
    padding: 12,
    paddingBottom: 8,
    backgroundColor: colors.background,
  },
  searchInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.textPrimary,
  },
  filterSection: {
    backgroundColor: "#FFFFFF",
    padding: 12,
    paddingTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  filterItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  filterLabel: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: "600",
  },
  header: {
    backgroundColor: "#FFFFFF",
    padding: 12,
    paddingTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flex: 1,
  },
  headerText: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  headerSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 12,
    borderWidth: 2,
    borderColor: "#4A4A4A",
  },
  addButtonText: {
    color: colors.textLight,
    fontSize: 14,
    fontWeight: "600",
  },
  listContainer: {
    padding: 12,
  },
  loanCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 1,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    overflow: "hidden",
  },
  cardHeader: {
    backgroundColor: "#E8E8E8",
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  customerName: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  cardContent: {
    padding: 10,
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  amount: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: "400",
    marginLeft: 6,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  infoText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: "400",
    marginLeft: 4,
    marginRight: 8,
  },
  iconSpacing: {
    marginLeft: 8,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  statusText: {
    color: colors.textLight,
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
});
