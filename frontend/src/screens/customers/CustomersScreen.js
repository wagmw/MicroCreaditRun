import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Image,
  Linking,
} from "react-native";
import api from "../../api/client";
import {
  colors,
  listStyles,
  formStyles,
  buttonStyles,
  utilityStyles,
} from "../../theme";

export default function CustomersScreen({ navigation }) {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchCustomers();

    // Add listener to refresh when screen comes into focus
    const unsubscribe = navigation.addListener("focus", () => {
      fetchCustomers();
    });

    return unsubscribe;
  }, [navigation]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await api.get("/customers");
      setCustomers(response.data);
      setFilteredCustomers(response.data);
    } catch (error) {
      console.error("Error fetching customers:", error);
      Alert.alert("Error", "Failed to load customers");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredCustomers(customers);
      return;
    }

    const lowercaseQuery = query.toLowerCase();
    const filtered = customers.filter((customer) => {
      const fullName = customer.fullName?.toLowerCase() || "";
      const mobilePhone = customer.mobilePhone?.toLowerCase() || "";
      const secondaryMobile = customer.secondaryMobile?.toLowerCase() || "";
      const whatsappNumber = customer.whatsappNumber?.toLowerCase() || "";
      const homePhone = customer.homePhone?.toLowerCase() || "";
      const address = customer.permanentAddress?.toLowerCase() || "";

      return (
        fullName.includes(lowercaseQuery) ||
        mobilePhone.includes(lowercaseQuery) ||
        secondaryMobile.includes(lowercaseQuery) ||
        whatsappNumber.includes(lowercaseQuery) ||
        homePhone.includes(lowercaseQuery) ||
        address.includes(lowercaseQuery)
      );
    });
    setFilteredCustomers(filtered);
  };

  const handleDelete = async (id, customerName) => {
    Alert.alert(
      "Delete Customer",
      `Are you sure you want to delete ${customerName}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await api.delete(`/customers/${id}`);
              if (response.data.softDelete) {
                Alert.alert(
                  "Customer Hidden",
                  "Customer has loans and has been hidden from view but kept in database for accounting purposes."
                );
              } else {
                Alert.alert("Success", "Customer deleted successfully");
              }
              fetchCustomers();
            } catch (error) {
              console.error("Error deleting customer:", error);
              Alert.alert("Error", "Failed to delete customer");
            }
          },
        },
      ]
    );
  };

  const getInitials = (fullName) => {
    const names = fullName.trim().split(" ");
    if (names.length === 1) {
      return names[0].substring(0, 2).toUpperCase();
    }
    return `${names[0].charAt(0)}${names[names.length - 1].charAt(
      0
    )}`.toUpperCase();
  };

  const getUniquePhoneNumbers = (customer) => {
    const phones = [
      customer.mobilePhone,
      customer.secondaryMobile,
      customer.whatsappNumber,
      customer.homePhone,
    ].filter((phone) => phone && phone.trim() !== "");

    // Get unique phone numbers
    const uniquePhones = [...new Set(phones)];
    return uniquePhones;
  };

  const handlePhoneCall = (phoneNumber) => {
    const phoneUrl = `tel:${phoneNumber}`;
    Linking.openURL(phoneUrl).catch((err) =>
      Alert.alert("Error", "Unable to make call")
    );
  };

  const renderCustomer = ({ item }) => (
    <TouchableOpacity
      style={listStyles.card}
      onPress={() =>
        navigation.navigate("CustomerDetails", {
          customerId: item.id,
        })
      }
      activeOpacity={0.7}
    >
      <View style={listStyles.cardHeader}>
        <Text style={listStyles.customerName}>{item.fullName}</Text>
        <TouchableOpacity
          style={[buttonStyles.action, utilityStyles.bgPrimary]}
          onPress={(e) => {
            e.stopPropagation();
            navigation.navigate("Loans", {
              customerId: item.id,
              customerName: item.fullName,
            });
          }}
        >
          <Text style={[buttonStyles.actionText, { color: "#FFFFFF" }]}>
            Loans
          </Text>
        </TouchableOpacity>
      </View>
      <View style={listStyles.cardContent}>
        <View style={listStyles.detailsRow}>
          <View style={listStyles.customerPhotoContainer}>
            {item.photoUrl ? (
              <Image
                source={{ uri: item.photoUrl }}
                style={listStyles.customerPhoto}
              />
            ) : (
              <View style={listStyles.customerPhotoPlaceholder}>
                <Text style={listStyles.customerInitials}>
                  {getInitials(item.fullName)}
                </Text>
              </View>
            )}
          </View>
          <View style={listStyles.customerInfo}>
            <View style={listStyles.phoneContainer}>
              {getUniquePhoneNumbers(item).map((phone, index) => (
                <View key={index} style={listStyles.phoneRow}>
                  <Text style={listStyles.phoneIcon}>☎</Text>
                  <TouchableOpacity
                    onPress={() => handlePhoneCall(phone)}
                    style={listStyles.phoneNumberButton}
                  >
                    <Text style={listStyles.customerPhone}>{phone}</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
            {item.permanentAddress && (
              <View style={listStyles.addressRow}>
                <Text style={listStyles.locationIcon}>●</Text>
                <Text style={listStyles.customerAddress}>
                  {item.permanentAddress}
                </Text>
              </View>
            )}
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
      </View>
    );
  }

  return (
    <View style={[utilityStyles.flex1, utilityStyles.bgBackground]}>
      <View
        style={[
          utilityStyles.p16,
          utilityStyles.pb8,
          utilityStyles.bgBackground,
        ]}
      >
        <TextInput
          style={formStyles.searchInput}
          placeholder="Search by name, phone, or address..."
          value={searchQuery}
          onChangeText={handleSearch}
          autoCapitalize="none"
        />
      </View>

      <FlatList
        data={filteredCustomers}
        renderItem={renderCustomer}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[utilityStyles.p12, utilityStyles.pt0]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchCustomers} />
        }
        ListEmptyComponent={
          <View style={listStyles.emptyContainer}>
            <Text style={listStyles.emptyText}>
              {searchQuery
                ? "No customers match your search"
                : "No customers found"}
            </Text>
          </View>
        }
      />
    </View>
  );
}

// All styles moved to theme modules (listStyles, formStyles, buttonStyles, utilityStyles)
