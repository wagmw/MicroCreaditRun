import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Picker } from "@react-native-picker/picker";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import api from "../../api/client";
import { useLocalization } from "../../context/LocalizationContext";

import logger from "../../utils/logger";
export default function AddEditFundScreen({ route, navigation }) {
  const { t } = useLocalization();
  const editingFund = route.params?.fund;
  const [amount, setAmount] = useState(
    editingFund ? String(editingFund.amount) : ""
  );
  const [note, setNote] = useState(editingFund ? editingFund.note || "" : "");
  const [bankAccountId, setBankAccountId] = useState(
    editingFund ? String(editingFund.bankAccountId) : ""
  );
  const [date, setDate] = useState(
    editingFund
      ? new Date(editingFund.date).toISOString().slice(0, 10)
      : new Date().toISOString().slice(0, 10)
  );
  const [bankAccounts, setBankAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingAccounts, setLoadingAccounts] = useState(true);

  useEffect(() => {
    fetchBankAccounts();
  }, []);

  const fetchBankAccounts = async () => {
    try {
      const response = await api.get("/bank-accounts");
      setBankAccounts(response.data);
      if (response.data.length === 0) {
        Alert.alert(
          t("funds.noBankAccountsTitle"),
          t("funds.noBankAccountsMessage"),
          [
            {
              text: t("common.ok"),
              onPress: () => navigation.goBack(),
            },
          ]
        );
      }
    } catch (error) {
      logger.error("Failed to load bank accounts:", error);
      Alert.alert(t("common.error"), t("funds.loadBankAccountsError"));
    } finally {
      setLoadingAccounts(false);
    }
  };

  const validateInputs = () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      Alert.alert(t("funds.validationError"), t("funds.invalidAmount"));
      return false;
    }
    if (!bankAccountId) {
      Alert.alert(
        t("funds.validationError"),
        t("funds.selectBankAccountError")
      );
      return false;
    }
    if (!date) {
      Alert.alert(t("funds.validationError"), t("funds.enterDateError"));
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateInputs()) return;

    setLoading(true);
    try {
      const payload = {
        amount: Number(amount),
        bankAccountId: bankAccountId,
        date,
        note: note || null,
      };

      if (editingFund) {
        await api.put(`/funds/${editingFund.id}`, payload);
        Alert.alert(t("common.success"), t("funds.fundUpdatedSuccess"));
      } else {
        await api.post("/funds", payload);
        Alert.alert(t("common.success"), t("funds.fundAddedSuccess"));
      }
      navigation.goBack();
    } catch (error) {
      logger.error("Failed to save fund:", error);
      Alert.alert(
        t("common.error"),
        error.response?.data?.message || t("funds.saveError")
      );
    } finally {
      setLoading(false);
    }
  };

  if (loadingAccounts) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>{t("funds.loadingBankAccounts")}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.infoCard}>
          <Icon name="information" size={20} color={colors.primary} />
          <Text style={styles.infoText}>{t("funds.infoMessage")}</Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>
            {t("funds.amountLabel")}{" "}
            <Text style={styles.required}>{t("funds.required")}</Text>
          </Text>
          <View style={styles.inputContainer}>
            <Text
              style={{
                fontSize: 16,
                color: colors.textSecondary,
                fontWeight: "600",
              }}
            >
              Rs
            </Text>
            <TextInput
              style={styles.input}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholder={t("funds.amountPlaceholder")}
              placeholderTextColor={colors.textSecondary}
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>
            {t("funds.bankAccountLabel")}{" "}
            <Text style={styles.required}>{t("funds.required")}</Text>
          </Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={bankAccountId}
              onValueChange={(itemValue) => setBankAccountId(itemValue)}
              style={styles.picker}
            >
              <Picker.Item
                label={t("funds.selectBankAccountPlaceholder")}
                value=""
              />
              {bankAccounts.map((acc) => (
                <Picker.Item
                  key={acc.id}
                  label={`${acc.nickname} (${acc.accountNumber})`}
                  value={String(acc.id)}
                />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>
            {t("funds.dateLabel")}{" "}
            <Text style={styles.required}>{t("funds.required")}</Text>
          </Text>
          <View style={styles.inputContainer}>
            <Icon name="calendar" size={20} color={colors.textSecondary} />
            <TextInput
              style={styles.input}
              value={date}
              onChangeText={setDate}
              placeholder={t("funds.datePlaceholder")}
              placeholderTextColor={colors.textSecondary}
            />
          </View>
          <Text style={styles.hint}>{t("funds.dateHint")}</Text>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>{t("funds.noteLabel")}</Text>
          <View style={[styles.inputContainer, { paddingVertical: 6 }]}>
            <TextInput
              style={styles.input}
              value={note}
              onChangeText={setNote}
              placeholder={t("funds.notePlaceholder")}
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, loading && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Icon
                name={editingFund ? "content-save" : "plus-circle"}
                size={20}
                color="#fff"
              />
              <Text style={styles.saveText}>
                {editingFund ? t("funds.updateFund") : t("funds.addFund")}
              </Text>
            </>
          )}
        </TouchableOpacity>

        {editingFund && (
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelText}>{t("funds.cancel")}</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
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
  infoCard: {
    flexDirection: "row",
    backgroundColor: colors.primary + "15",
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: "center",
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: colors.textPrimary,
    lineHeight: 18,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 8,
    color: colors.textPrimary,
  },
  required: {
    color: colors.error,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    paddingHorizontal: 12,
    gap: 10,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: colors.textPrimary,
  },
  pickerWrapper: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    overflow: "hidden",
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  picker: {
    width: "100%",
    height: Platform.OS === "ios" ? 120 : 50,
  },
  hint: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    marginLeft: 2,
  },
  saveBtn: {
    backgroundColor: colors.primary,
    marginTop: 30,
    borderRadius: 8,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  cancelBtn: {
    marginTop: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  cancelText: {
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: "600",
  },
});
