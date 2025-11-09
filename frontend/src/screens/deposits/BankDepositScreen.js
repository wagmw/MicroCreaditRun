import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Pressable,
  Alert,
  Modal,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import api from "../../api/client";
import { formatCurrency } from "../../utils/currency";

const SMS_NOTIFICATION_NUMBER_KEY = "@sms_notification_number";

export default function BankDepositScreen({ navigation }) {
  const [payments, setPayments] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [selectedPayments, setSelectedPayments] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [depositing, setDepositing] = useState(false);
  const [showBankPicker, setShowBankPicker] = useState(false);

  // Set header options
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerStyle: {
        backgroundColor: colors.primary,
      },
      headerTintColor: colors.textLight,
      headerTitle: "Bank Deposits",
    });
  }, [navigation]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [paymentsResponse, bankAccountsResponse] = await Promise.all([
        api.get("/payments/unbanked"),
        api.get("/bank-accounts"),
      ]);
      setPayments(paymentsResponse.data);
      setBankAccounts(bankAccountsResponse.data);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      Alert.alert("Error", "Failed to load data. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setSelectedPayments(new Set());
    fetchData();
  };

  const togglePaymentSelection = (paymentId) => {
    const newSelection = new Set(selectedPayments);
    if (newSelection.has(paymentId)) {
      newSelection.delete(paymentId);
    } else {
      newSelection.add(paymentId);
    }
    setSelectedPayments(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedPayments.size === payments.length) {
      setSelectedPayments(new Set());
    } else {
      setSelectedPayments(new Set(payments.map((p) => p.id)));
    }
  };

  const calculateTotalAmount = () => {
    return payments
      .filter((p) => selectedPayments.has(p.id))
      .reduce((sum, payment) => sum + payment.amount, 0);
  };

  const handleDepositPress = () => {
    if (selectedPayments.size === 0) {
      Alert.alert(
        "No Selection",
        "Please select at least one payment to deposit."
      );
      return;
    }

    if (bankAccounts.length === 0) {
      Alert.alert(
        "No Bank Accounts",
        "Please add a bank account first in Settings > Bank Accounts."
      );
      return;
    }

    setShowBankPicker(true);
  };

  const handleBankAccountSelect = async (bankAccount) => {
    setShowBankPicker(false);

    const selectedCount = selectedPayments.size;
    const totalAmount = calculateTotalAmount();

    Alert.alert(
      "Confirm Deposit",
      `Deposit ${selectedCount} payment${
        selectedCount > 1 ? "s" : ""
      } (Rs. ${formatCurrency(totalAmount)}) to:\n\n${bankAccount.nickname}\n${
        bankAccount.bank
      }\nAccount: ${bankAccount.accountNumber}`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Confirm",
          onPress: () => performDeposit(bankAccount.id),
        },
      ]
    );
  };

  const performDeposit = async (bankAccountId) => {
    setDepositing(true);
    try {
      const paymentIds = Array.from(selectedPayments);

      // Get SMS notification number from storage
      const smsNumber = await AsyncStorage.getItem(SMS_NOTIFICATION_NUMBER_KEY);

      await api.post("/payments/deposit", {
        paymentIds,
        bankAccountId,
        smsNumber: smsNumber || null,
      });

      Alert.alert(
        "Success",
        `Successfully deposited ${paymentIds.length} payment${
          paymentIds.length > 1 ? "s" : ""
        } to the bank account.`,
        [
          {
            text: "OK",
            onPress: () => {
              // Just dismiss - stay on current screen with refreshed data
            },
          },
        ]
      );

      // Refresh the list after successful deposit
      fetchData();
      setSelectedPayments(new Set());
    } catch (error) {
      console.error("Failed to deposit payments:", error);
      Alert.alert(
        "Error",
        error.response?.data?.error ||
          "Failed to deposit payments. Please try again."
      );
    } finally {
      setDepositing(false);
    }
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

  const renderPaymentItem = ({ item }) => {
    const isSelected = selectedPayments.has(item.id);

    return (
      <Pressable
        style={styles.paymentCard}
        onPress={() => togglePaymentSelection(item.id)}
        android_ripple={null}
      >
        <View style={styles.paymentHeader}>
          <View style={styles.checkboxContainer}>
            <View
              style={[styles.checkbox, isSelected && styles.checkboxChecked]}
            >
              {isSelected && (
                <Icon name="check" size={16} color={colors.textLight} />
              )}
            </View>
          </View>

          <View style={styles.customerInfo}>
            <Text style={styles.customerName}>
              {item.Customer?.fullName || "Unknown"}
            </Text>
            {item.Loan?.loanId && (
              <Text style={styles.loanAmount}>Loan: {item.Loan?.loanId}</Text>
            )}
          </View>

          <View style={styles.amountContainer}>
            <Text style={styles.paymentAmount}>
              Rs. {formatCurrency(item.amount)}
            </Text>
          </View>
        </View>

        <View style={styles.paymentDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date:</Text>
            <Text style={styles.detailValue}>{formatDate(item.paidAt)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Time:</Text>
            <Text style={styles.detailValue}>{formatTime(item.paidAt)}</Text>
          </View>
          {item.note && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Note:</Text>
              <Text style={styles.detailValue}>{item.note}</Text>
            </View>
          )}
        </View>
      </Pressable>
    );
  };

  const renderBankAccountItem = (bankAccount) => (
    <TouchableOpacity
      key={bankAccount.id}
      style={styles.bankAccountCard}
      onPress={() => handleBankAccountSelect(bankAccount)}
    >
      <View style={styles.bankAccountIcon}>
        <Icon name="bank" size={32} color={colors.primary} />
      </View>
      <View style={styles.bankAccountInfo}>
        <Text style={styles.bankAccountNickname}>{bankAccount.nickname}</Text>
        <Text style={styles.bankAccountBank}>{bankAccount.bank}</Text>
        <Text style={styles.bankAccountDetails}>
          {bankAccount.accountName} • {bankAccount.accountNumber}
        </Text>
      </View>
      <Icon name="chevron-right" size={24} color={colors.textSecondary} />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading payments...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Controls */}
      <View style={styles.headerControls}>
        <TouchableOpacity
          style={styles.selectAllButton}
          onPress={toggleSelectAll}
        >
          <Icon
            name={
              selectedPayments.size === payments.length && payments.length > 0
                ? "checkbox-marked"
                : "checkbox-blank-outline"
            }
            size={24}
            color={colors.primary}
          />
          <Text style={styles.selectAllText}>
            {selectedPayments.size === payments.length && payments.length > 0
              ? "Deselect All"
              : "Select All"}
          </Text>
        </TouchableOpacity>

        <View style={styles.selectedCount}>
          <Text style={styles.selectedCountText}>
            {selectedPayments.size} / {payments.length} selected
          </Text>
        </View>
      </View>

      {/* Summary Bar */}
      {selectedPayments.size > 0 && (
        <View style={styles.summaryBar}>
          <View style={styles.summaryInfo}>
            <Text style={styles.summaryLabel}>Total Amount:</Text>
            <Text style={styles.summaryAmount}>
              Rs. {formatCurrency(calculateTotalAmount())}
            </Text>
          </View>
        </View>
      )}

      {/* Payments List */}
      <FlatList
        data={payments}
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
            <Icon name="cash-check" size={80} color={colors.textTertiary} />
            <Text style={styles.emptyText}>No Unbanked Payments</Text>
            <Text style={styles.emptySubtext}>
              All payments have been deposited to bank accounts.
            </Text>
          </View>
        }
      />

      {/* Deposit Button */}
      {payments.length > 0 && (
        <SafeAreaView style={styles.bottomBar} edges={["bottom"]}>
          <TouchableOpacity
            style={[
              styles.depositButton,
              selectedPayments.size === 0 && styles.depositButtonDisabled,
            ]}
            onPress={handleDepositPress}
            disabled={selectedPayments.size === 0 || depositing}
          >
            {depositing ? (
              <ActivityIndicator size="small" color={colors.textLight} />
            ) : (
              <>
                <Icon name="bank-transfer" size={24} color={colors.textLight} />
                <Text style={styles.depositButtonText}>
                  Deposit to Bank Account
                </Text>
              </>
            )}
          </TouchableOpacity>
        </SafeAreaView>
      )}

      {/* Bank Account Picker Modal */}
      <Modal
        visible={showBankPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowBankPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Bank Account</Text>
              <TouchableOpacity
                onPress={() => setShowBankPicker(false)}
                style={styles.modalCloseButton}
              >
                <Icon name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              {bankAccounts.map(renderBankAccountItem)}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  headerControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  selectAllButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  selectAllText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.primary,
  },
  selectedCount: {
    backgroundColor: colors.primary + "15",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  selectedCountText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.primary,
  },
  summaryBar: {
    backgroundColor: colors.success + "15",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  summaryInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  summaryAmount: {
    fontSize: 24,
    fontWeight: "800",
    color: "#059669",
  },
  listContainer: {
    padding: 12,
  },
  paymentCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    elevation: 1,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  paymentHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  checkboxContainer: {
    marginRight: 12,
    paddingTop: 2,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#9CA3AF",
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
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
    padding: 60,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.textSecondary,
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textTertiary,
    textAlign: "center",
  },
  bottomBar: {
    padding: 12,
    paddingBottom: 40,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    elevation: 8,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  depositButton: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    elevation: 3,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  depositButtonDisabled: {
    backgroundColor: "#9CA3AF",
    opacity: 0.6,
  },
  depositButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
    elevation: 10,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalContent: {
    padding: 16,
  },
  bankAccountCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 1,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  bankAccountIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary + "15",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  bankAccountInfo: {
    flex: 1,
  },
  bankAccountNickname: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  bankAccountBank: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
    marginBottom: 2,
  },
  bankAccountDetails: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});
