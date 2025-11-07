import React, { useState, useEffect, useLayoutEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import api from "../../api/client";

export default function BankAccountsScreen({ navigation }) {
  const [bankAccounts, setBankAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentAccount, setCurrentAccount] = useState(null);
  const [formData, setFormData] = useState({
    nickname: "",
    accountName: "",
    accountNumber: "",
    bank: "",
    branch: "",
  });
  const [saving, setSaving] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerStyle: {
        backgroundColor: colors.primary,
      },
      headerTintColor: colors.textLight,
      headerTitle: "Bank Accounts",
      headerRight: () => (
        <TouchableOpacity
          onPress={handleAddNew}
          style={{
            marginRight: 15,
            backgroundColor: "#FFFFFF",
            paddingVertical: 6,
            paddingHorizontal: 12,
            borderRadius: 6,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Icon name="bank-plus" size={18} color="#2196F3" />
          <Text
            style={{
              color: "#2196F3",
              fontSize: 14,
              fontWeight: "600",
              marginLeft: 4,
            }}
          >
            Add
          </Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  useEffect(() => {
    fetchBankAccounts();
  }, []);

  const fetchBankAccounts = async () => {
    try {
      const response = await api.get("/bank-accounts");
      setBankAccounts(response.data);
    } catch (error) {
      console.error("Failed to fetch bank accounts:", error);
      Alert.alert("Error", "Failed to load bank accounts");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchBankAccounts();
  };

  const handleAddNew = () => {
    setEditMode(false);
    setCurrentAccount(null);
    setFormData({
      nickname: "",
      accountName: "",
      accountNumber: "",
      bank: "",
      branch: "",
    });
    setModalVisible(true);
  };

  const handleEdit = (account) => {
    setEditMode(true);
    setCurrentAccount(account);
    setFormData({
      nickname: account.nickname,
      accountName: account.accountName,
      accountNumber: account.accountNumber,
      bank: account.bank,
      branch: account.branch,
    });
    setModalVisible(true);
  };

  const handleDelete = (account) => {
    Alert.alert(
      "Delete Bank Account",
      `Are you sure you want to delete ${account.accountName}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => confirmDelete(account.id),
        },
      ]
    );
  };

  const confirmDelete = async (id) => {
    try {
      await api.delete(`/bank-accounts/${id}`);
      Alert.alert("Success", "Bank account deleted successfully");
      fetchBankAccounts();
    } catch (error) {
      console.error("Failed to delete bank account:", error);
      Alert.alert("Error", "Failed to delete bank account");
    }
  };

  const handleSave = async () => {
    // Validation
    if (
      !formData.nickname ||
      !formData.accountName ||
      !formData.accountNumber ||
      !formData.bank ||
      !formData.branch
    ) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setSaving(true);
    try {
      if (editMode) {
        await api.put(`/bank-accounts/${currentAccount.id}`, formData);
        Alert.alert("Success", "Bank account updated successfully");
      } else {
        await api.post("/bank-accounts", formData);
        Alert.alert("Success", "Bank account added successfully");
      }
      setModalVisible(false);
      fetchBankAccounts();
    } catch (error) {
      console.error("Failed to save bank account:", error);
      Alert.alert("Error", "Failed to save bank account");
    } finally {
      setSaving(false);
    }
  };

  const renderBankAccount = ({ item }) => (
    <View style={styles.accountCard}>
      <View style={styles.cardTitle}>
        <Icon name="bank" size={20} color={colors.primary} />
        <Text style={styles.nickname}>{item.nickname}</Text>
      </View>

      <View style={styles.accountInfo}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Account Name:</Text>
          <Text style={styles.infoValue}>{item.accountName}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Account Number:</Text>
          <Text style={styles.infoValue}>{item.accountNumber}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Bank:</Text>
          <Text style={styles.infoValue}>{item.bank}</Text>
        </View>
        <View style={[styles.infoRow, styles.lastInfoRow]}>
          <Text style={styles.infoLabel}>Branch:</Text>
          <Text style={styles.infoValue}>{item.branch}</Text>
        </View>
      </View>

      <View style={styles.accountActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleEdit(item)}
        >
          <Icon name="pencil" size={20} color={colors.textLight} />
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDelete(item)}
        >
          <Icon name="delete" size={20} color={colors.error} />
          <Text style={[styles.actionButtonText, styles.deleteText]}>
            Delete
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {bankAccounts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="bank-off" size={80} color={colors.textSecondary} />
          <Text style={styles.emptyTitle}>No Bank Accounts</Text>
          <Text style={styles.emptySubtitle}>
            Add a bank account to start managing deposits
          </Text>
          <TouchableOpacity style={styles.addButton} onPress={handleAddNew}>
            <Icon name="plus" size={24} color={colors.textLight} />
            <Text style={styles.addButtonText}>Add Bank Account</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={bankAccounts}
          renderItem={renderBankAccount}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
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

      {/* Add/Edit Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editMode ? "Edit Bank Account" : "Add Bank Account"}
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Icon name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nickname *</Text>
                <Text style={styles.labelHint}>
                  Short name to identify this account
                </Text>
                <TextInput
                  style={styles.input}
                  value={formData.nickname}
                  onChangeText={(text) =>
                    setFormData({ ...formData, nickname: text })
                  }
                  placeholder="e.g., Main Account, Savings"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Account Name *</Text>
                <Text style={styles.labelHint}>
                  Official account holder name
                </Text>
                <TextInput
                  style={styles.input}
                  value={formData.accountName}
                  onChangeText={(text) =>
                    setFormData({ ...formData, accountName: text })
                  }
                  placeholder="Enter account name"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Account Number *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.accountNumber}
                  onChangeText={(text) =>
                    setFormData({ ...formData, accountNumber: text })
                  }
                  placeholder="Enter account number"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Bank *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.bank}
                  onChangeText={(text) =>
                    setFormData({ ...formData, bank: text })
                  }
                  placeholder="Enter bank name"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Branch *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.branch}
                  onChangeText={(text) =>
                    setFormData({ ...formData, branch: text })
                  }
                  placeholder="Enter branch name"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              <TouchableOpacity
                style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color={colors.textLight} />
                ) : (
                  <>
                    <Icon
                      name="content-save"
                      size={20}
                      color={colors.textLight}
                      style={{ marginRight: 8 }}
                    />
                    <Text style={styles.saveButtonText}>
                      {editMode ? "Update" : "Save"}
                    </Text>
                  </>
                )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  listContent: {
    padding: 16,
  },
  accountCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: "hidden",
  },
  cardTitle: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8E8E8",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  nickname: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
    marginLeft: 10,
    flex: 1,
  },
  accountInfo: {
    padding: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  lastInfoRow: {
    borderBottomWidth: 0,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
    flex: 0.4,
  },
  infoValue: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: "500",
    flex: 0.6,
    textAlign: "right",
  },
  accountActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingTop: 12,
    paddingBottom: 12,
    paddingRight: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: colors.primary,
    marginLeft: 8,
    borderWidth: 2,
    borderColor: "#4A4A4A",
  },
  deleteButton: {
    backgroundColor: "#FFEBEE",
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textLight,
    marginLeft: 6,
  },
  deleteText: {
    color: colors.error,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.textPrimary,
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 30,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    elevation: 3,
    borderWidth: 2,
    borderColor: "#4A4A4A",
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textLight,
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
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
  formContainer: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 4,
  },
  labelHint: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
    fontStyle: "italic",
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.textPrimary,
    backgroundColor: "#FFFFFF",
  },
  saveButton: {
    backgroundColor: colors.primary,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginTop: 10,
    borderWidth: 2,
    borderColor: "#4A4A4A",
  },
  saveButtonDisabled: {
    backgroundColor: colors.textSecondary,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textLight,
  },
});
