import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { colors } from "../../theme/colors";
import api from "../../api/client";

export default function AddEditFundScreen({ route, navigation }) {
  const editingFund = route.params?.fund;
  const [amount, setAmount] = useState(
    editingFund ? String(editingFund.amount) : ""
  );
  const [bankAccountId, setBankAccountId] = useState(
    editingFund ? editingFund.bankAccountId : ""
  );
  const [date, setDate] = useState(
    editingFund ? editingFund.date : new Date().toISOString().slice(0, 10)
  );
  const [bankAccounts, setBankAccounts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBankAccounts();
  }, []);

  const fetchBankAccounts = async () => {
    try {
      const response = await api.get("/bank-accounts");
      setBankAccounts(response.data);
    } catch (error) {
      Alert.alert("Error", "Failed to load bank accounts");
    }
  };

  const handleSave = async () => {
    if (!amount || !bankAccountId) {
      Alert.alert(
        "Validation",
        "Please enter amount and select a bank account."
      );
      return;
    }
    setLoading(true);
    try {
      if (editingFund) {
        await api.put(`/funds/${editingFund.id}`, {
          amount: Number(amount),
          bankAccountId,
          date,
        });
      } else {
        await api.post("/funds", {
          amount: Number(amount),
          bankAccountId,
          date,
        });
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", "Failed to save fund entry");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Amount</Text>
      <TextInput
        style={styles.input}
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        placeholder="Enter amount"
      />
      <Text style={styles.label}>Bank Account</Text>
      <View style={styles.pickerWrapper}>
        <select
          style={styles.picker}
          value={bankAccountId}
          onChange={(e) => setBankAccountId(e.target.value)}
        >
          <option value="">Select Account</option>
          {bankAccounts.map((acc) => (
            <option key={acc.id} value={acc.id}>
              {acc.nickname} ({acc.accountNumber})
            </option>
          ))}
        </select>
      </View>
      <Text style={styles.label}>Date</Text>
      <TextInput
        style={styles.input}
        value={date}
        onChangeText={setDate}
        placeholder="YYYY-MM-DD"
      />
      <TouchableOpacity
        style={styles.saveBtn}
        onPress={handleSave}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveText}>
            {editingFund ? "Update" : "Add"} Fund
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 20 },
  label: {
    fontSize: 15,
    fontWeight: "600",
    marginTop: 18,
    marginBottom: 6,
    color: colors.textPrimary,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    fontSize: 16,
  },
  pickerWrapper: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 8,
  },
  picker: { width: "100%", padding: 12, fontSize: 16 },
  saveBtn: {
    backgroundColor: colors.primary,
    marginTop: 30,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
  },
  saveText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
