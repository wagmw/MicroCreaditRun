import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import api from "../../api/client";

export default function FundsListScreen({ navigation }) {
  const [funds, setFunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      fetchFunds();
    });
    return unsubscribe;
  }, [navigation]);

  const fetchFunds = async () => {
    try {
      const response = await api.get("/funds");
      setFunds(response.data);

      // Calculate total
      const total = response.data.reduce((sum, fund) => sum + fund.amount, 0);
      setTotalAmount(total);
    } catch (error) {
      console.error("Failed to fetch funds:", error);
      Alert.alert("Error", "Failed to load funds");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchFunds();
  }, []);

  const handleDelete = async (fundId) => {
    Alert.alert(
      "Delete Fund",
      "Are you sure you want to delete this fund entry?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/funds/${fundId}`);
              setFunds(funds.filter((f) => f.id !== fundId));
              Alert.alert("Success", "Fund deleted successfully");
            } catch (error) {
              Alert.alert("Error", "Failed to delete fund");
            }
          },
        },
      ]
    );
  };

  const renderFund = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate("AddEditFund", { fund: item })}
      onLongPress={() => handleDelete(item.id)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.leftSection}>
          <View style={styles.iconCircle}>
            <Icon name="wallet" size={18} color={colors.primary} />
          </View>
          <View style={styles.mainInfo}>
            <Text style={styles.amount}>
              Rs. {item.amount.toLocaleString()}
            </Text>
            <View style={styles.accountRow}>
              <Icon name="bank" size={12} color={colors.textSecondary} />
              <Text style={styles.account}>
                {item.BankAccount?.nickname || "Unknown"}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.rightSection}>
          <Text style={styles.date}>
            {new Date(item.date).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
            })}
          </Text>
        </View>
      </View>
      {item.note && (
        <View style={styles.noteContainer}>
          <Text style={styles.note} numberOfLines={1} ellipsizeMode="tail">
            {item.note}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading funds...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      {/* Total Summary Header */}
      <View style={styles.summaryHeader}>
        <View style={styles.summaryContent}>
          <Icon name="wallet" size={32} color={colors.primary} />
          <View style={styles.summaryTextContainer}>
            <Text style={styles.summaryLabel}>Total Funds Invested</Text>
            <Text style={styles.summaryValue}>
              Rs. {totalAmount.toLocaleString()}
            </Text>
            <Text style={styles.summarySubtext}>
              {funds.length} fund {funds.length !== 1 ? "entries" : "entry"}
            </Text>
          </View>
        </View>
      </View>

      <FlatList
        data={funds}
        renderItem={renderFund}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
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
            <Icon name="cash-remove" size={64} color={colors.textSecondary} />
            <Text style={styles.empty}>No funds found</Text>
            <Text style={styles.emptySubtext}>
              Tap the + button to add funds
            </Text>
          </View>
        }
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("AddEditFund")}
      >
        <Icon name="plus" size={28} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: {
    marginTop: 12,
    color: colors.textSecondary,
    fontSize: 14,
  },
  listContent: { padding: 12, paddingBottom: 100 },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
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
    alignItems: "center",
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
  },
  mainInfo: {
    flex: 1,
  },
  amount: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.success,
    marginBottom: 4,
  },
  rightSection: {
    alignItems: "flex-end",
    marginLeft: 8,
  },
  date: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: "600",
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  accountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  account: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  noteContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  note: {
    color: colors.textSecondary,
    fontSize: 12,
    fontStyle: "italic",
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 80,
    paddingHorizontal: 40,
  },
  empty: {
    textAlign: "center",
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
  },
  emptySubtext: {
    textAlign: "center",
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 8,
  },
  fab: {
    position: "absolute",
    right: 24,
    bottom: 32,
    backgroundColor: colors.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  summaryHeader: {
    backgroundColor: "#fff",
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  summaryContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  summaryTextContainer: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: "600",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.success,
    marginBottom: 4,
  },
  summarySubtext: {
    fontSize: 13,
    color: colors.textSecondary,
  },
});
