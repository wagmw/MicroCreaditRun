import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import api from "../../api/client";
import { formatCurrency } from "../../utils/currency";
import { useLocalization } from "../../context/LocalizationContext";

import logger from "../../utils/logger";
export default function ExpensesScreen({ navigation }) {
  const { t } = useLocalization();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  });

  // Set header options
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerStyle: {
        backgroundColor: colors.primary,
      },
      headerTintColor: colors.textLight,
      headerTitle: t("expenses.title"),
      headerRight: () => (
        <TouchableOpacity
          onPress={() => openModal()}
          style={{ marginRight: 15 }}
        >
          <Icon name="plus-circle" size={28} color={colors.textLight} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, t]);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const response = await api.get("/expenses");
      setExpenses(response.data);
    } catch (error) {
      logger.error("Failed to fetch expenses:", error);
      Alert.alert(t("common.error"), t("messages.loadError"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchExpenses();
  };

  const openModal = (expense = null) => {
    if (expense) {
      setEditingExpense(expense);
      setFormData({
        amount: expense.amount.toString(),
        description: expense.description,
        date: expense.date.split("T")[0],
      });
    } else {
      setEditingExpense(null);
      setFormData({
        amount: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
      });
    }
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingExpense(null);
    setFormData({
      amount: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
    });
  };

  const handleSave = async () => {
    // Validation
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      Alert.alert(
        t("expenses.invalidAmount"),
        t("expenses.invalidAmountMessage")
      );
      return;
    }

    if (!formData.description.trim()) {
      Alert.alert(
        t("expenses.invalidDescription"),
        t("expenses.invalidDescriptionMessage")
      );
      return;
    }

    if (!formData.date) {
      Alert.alert(t("expenses.invalidDate"), t("expenses.invalidDateMessage"));
      return;
    }

    try {
      if (editingExpense) {
        // Update existing expense
        await api.put(`/expenses/${editingExpense.id}`, {
          amount: parseFloat(formData.amount),
          description: formData.description.trim(),
          date: formData.date,
        });
        Alert.alert(t("common.success"), t("expenses.expenseUpdatedSuccess"));
      } else {
        // Create new expense
        await api.post("/expenses", {
          amount: parseFloat(formData.amount),
          description: formData.description.trim(),
          date: formData.date,
        });
        Alert.alert(t("common.success"), t("expenses.expenseAddedSuccess"));
      }
      closeModal();
      fetchExpenses();
    } catch (error) {
      logger.error("Failed to save expense:", error);
      Alert.alert(
        t("common.error"),
        error.response?.data?.error || t("expenses.failedToSave")
      );
    }
  };

  const handleDelete = (expense) => {
    if (expense.claimed) {
      Alert.alert(
        t("expenses.cannotDelete"),
        t("expenses.cannotDeleteMessage")
      );
      return;
    }

    Alert.alert(
      t("expenses.deleteExpense"),
      t("expenses.deleteConfirmMessage", {
        amount: formatCurrency(expense.amount),
        description: expense.description,
      }),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.delete"),
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/expenses/${expense.id}`);
              Alert.alert(
                t("common.success"),
                t("expenses.expenseDeletedSuccess")
              );
              fetchExpenses();
            } catch (error) {
              logger.error("Failed to delete expense:", error);
              Alert.alert(
                t("common.error"),
                error.response?.data?.error || t("expenses.failedToDelete")
              );
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const calculateTotals = () => {
    const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const claimed = expenses
      .filter((exp) => exp.claimed)
      .reduce((sum, exp) => sum + exp.amount, 0);
    const unclaimed = expenses
      .filter((exp) => !exp.claimed)
      .reduce((sum, exp) => sum + exp.amount, 0);
    return { total, claimed, unclaimed };
  };

  const renderExpenseItem = ({ item }) => {
    return (
      <View style={styles.expenseCard}>
        <View style={styles.expenseHeader}>
          <View style={styles.expenseInfo}>
            <Text style={styles.expenseDescription}>{item.description}</Text>
            <Text style={styles.expenseDate}>{formatDate(item.date)}</Text>
          </View>

          <View style={styles.expenseAmountContainer}>
            <Text style={styles.expenseAmount}>
              Rs. {formatCurrency(item.amount)}
            </Text>
            {item.claimed && (
              <View style={styles.claimedBadge}>
                <Text style={styles.claimedText}>
                  {t("expenses.claimedBadge")}
                </Text>
              </View>
            )}
          </View>
        </View>

        {!item.claimed && (
          <View style={styles.expenseActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.editButton]}
              onPress={() => openModal(item)}
            >
              <Icon name="pencil" size={18} color={colors.primary} />
              <Text style={styles.editButtonText}>{t("common.edit")}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => handleDelete(item)}
            >
              <Icon name="delete" size={18} color={colors.error} />
              <Text style={styles.deleteButtonText}>{t("common.delete")}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const totals = calculateTotals();

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>{t("common.loading")}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        <View style={[styles.summaryCard, styles.totalCard]}>
          <Text style={styles.summaryLabel}>{t("expenses.totalExpenses")}</Text>
          <Text style={styles.summaryValue}>
            Rs. {formatCurrency(totals.total)}
          </Text>
        </View>

        <View style={[styles.summaryCard, styles.claimedCard]}>
          <Text style={styles.summaryLabel}>{t("expenses.claimed")}</Text>
          <Text style={styles.summaryValue}>
            Rs. {formatCurrency(totals.claimed)}
          </Text>
        </View>

        <View style={[styles.summaryCard, styles.unclaimedCard]}>
          <Text style={styles.summaryLabel}>{t("expenses.unclaimed")}</Text>
          <Text style={styles.summaryValue}>
            Rs. {formatCurrency(totals.unclaimed)}
          </Text>
        </View>
      </View>

      {/* Expenses List */}
      <FlatList
        data={expenses}
        renderItem={renderExpenseItem}
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
            <Icon name="receipt" size={80} color={colors.textTertiary} />
            <Text style={styles.emptyText}>{t("expenses.noExpenses")}</Text>
            <Text style={styles.emptySubtext}>
              {t("expenses.noExpensesMessage")}
            </Text>
          </View>
        }
      />

      {/* Add/Edit Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingExpense
                  ? t("expenses.editExpense")
                  : t("expenses.addExpense")}
              </Text>
              <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                <Icon name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <Text style={styles.label}>{t("common.amount")} (Rs.)</Text>
              <TextInput
                style={styles.input}
                value={formData.amount}
                onChangeText={(value) =>
                  setFormData({ ...formData, amount: value })
                }
                keyboardType="numeric"
                placeholder={t("expenses.enterAmount")}
                placeholderTextColor={colors.textSecondary}
              />

              <Text style={styles.label}>{t("common.description")}</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(value) =>
                  setFormData({ ...formData, description: value })
                }
                placeholder={t("expenses.enterDescription")}
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={3}
              />

              <Text style={styles.label}>{t("common.date")}</Text>
              <TextInput
                style={styles.input}
                value={formData.date}
                onChangeText={(value) =>
                  setFormData({ ...formData, date: value })
                }
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.textSecondary}
              />
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={closeModal}
              >
                <Text style={styles.cancelButtonText}>
                  {t("common.cancel")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSave}
              >
                <Text style={styles.saveButtonText}>
                  {editingExpense ? t("common.update") : t("common.save")}
                </Text>
              </TouchableOpacity>
            </View>
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
  summaryContainer: {
    flexDirection: "row",
    padding: 12,
    gap: 10,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    borderWidth: 2,
  },
  totalCard: {
    borderColor: colors.primary,
  },
  claimedCard: {
    borderColor: colors.success,
  },
  unclaimedCard: {
    borderColor: colors.warning,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.textSecondary,
    marginBottom: 6,
    textAlign: "center",
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  listContainer: {
    padding: 12,
  },
  expenseCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    elevation: 1,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  expenseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  expenseInfo: {
    flex: 1,
    marginRight: 10,
  },
  expenseDescription: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  expenseDate: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  expenseAmountContainer: {
    alignItems: "flex-end",
  },
  expenseAmount: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.error,
    marginBottom: 4,
  },
  claimedBadge: {
    backgroundColor: colors.success + "20",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  claimedText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.success,
  },
  expenseActions: {
    flexDirection: "row",
    gap: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  editButton: {
    backgroundColor: colors.primary + "15",
    borderWidth: 1,
    borderColor: colors.primary,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
  },
  deleteButton: {
    backgroundColor: colors.error + "15",
    borderWidth: 1,
    borderColor: colors.error,
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.error,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
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
  closeButton: {
    padding: 4,
  },
  modalContent: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: colors.textPrimary,
    backgroundColor: "#FFFFFF",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  modalFooter: {
    flexDirection: "row",
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: colors.background,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textLight,
  },
});
