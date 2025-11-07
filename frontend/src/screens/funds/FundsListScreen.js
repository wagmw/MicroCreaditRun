import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { colors } from "../../theme/colors";
import api from "../../api/client";

export default function FundsListScreen({ navigation }) {
  const [funds, setFunds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFunds();
  }, []);

  const fetchFunds = async () => {
    try {
      const response = await api.get("/funds");
      setFunds(response.data);
    } catch (error) {
      console.error("Failed to fetch funds:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderFund = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate("AddEditFund", { fund: item })}
    >
      <View style={styles.row}>
        <Text style={styles.amount}>Rs. {item.amount.toLocaleString()}</Text>
        <Text style={styles.date}>
          {new Date(item.date).toLocaleDateString()}
        </Text>
      </View>
      <Text style={styles.account}>
        {item.BankAccount?.nickname || "Unknown Account"}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={funds}
        renderItem={renderFund}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={<Text style={styles.empty}>No funds found.</Text>}
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("AddEditFund")}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
  },
  row: { flexDirection: "row", justifyContent: "space-between" },
  amount: { fontSize: 18, fontWeight: "700", color: colors.success },
  date: { fontSize: 14, color: colors.textSecondary },
  account: { fontSize: 13, color: colors.textPrimary, marginTop: 6 },
  empty: { textAlign: "center", color: colors.textSecondary, marginTop: 40 },
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
    elevation: 3,
  },
  fabText: { color: "#fff", fontSize: 32, fontWeight: "bold" },
});
