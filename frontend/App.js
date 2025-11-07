import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import LoginScreen from "./src/screens/auth/LoginScreen";
import CustomersScreen from "./src/screens/customers/CustomersScreen";
import CustomerFormScreen from "./src/screens/customers/CustomerFormScreen";
import CustomerDetailsScreen from "./src/screens/customers/CustomerDetailsScreen";
import LoansScreen from "./src/screens/loans/LoansScreen";
import AddLoanScreen from "./src/screens/loans/AddLoanScreen";
import LoanDetailsScreen from "./src/screens/loans/LoanDetailsScreen";
import PaymentPlanScreen from "./src/screens/payments/PaymentPlanScreen";
import PaymentHistoryScreen from "./src/screens/payments/PaymentHistoryScreen";
import AddPaymentScreen from "./src/screens/payments/AddPaymentScreen";
import PaymentsListScreen from "./src/screens/payments/PaymentsListScreen";
import SettingsScreen from "./src/screens/settings/SettingsScreen";
import BankAccountsScreen from "./src/screens/settings/BankAccountsScreen";
import BankDepositScreen from "./src/screens/deposits/BankDepositScreen";
import FundsListScreen from "./src/screens/funds/FundsListScreen";
import AddEditFundScreen from "./src/screens/funds/AddEditFundScreen";
import {
  colors,
  commonStyles,
  buttonStyles,
  cardStyles,
  navigationStyles,
  dashboardStyles,
} from "./src/theme";
import api from "./src/api/client";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import {
  ActivityIndicator,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Modal,
  Animated,
  Image,
} from "react-native";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function LoadingScreen() {
  return (
    <View style={commonStyles.loadingContainer}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

function HomeScreen({ userType, navigation }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardStats = async () => {
    try {
      const response = await api.get("/dashboard/stats");
      setStats(response.data);
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardStats();
  };

  return (
    <ScrollView
      style={dashboardStyles.container}
      contentContainerStyle={dashboardStyles.scrollContent}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
    >
      {/* Quick Action Buttons */}
      <View style={dashboardStyles.quickActionsRow}>
        <TouchableOpacity
          style={buttonStyles.quickAction}
          onPress={() => navigation.navigate("AddPayment")}
        >
          <Icon
            name="cash-plus"
            size={28}
            color={colors.textLight}
            style={{ marginRight: 8 }}
          />
          <Text style={buttonStyles.quickActionText}>Add Payment</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            buttonStyles.quickAction,
            { backgroundColor: colors.primary },
          ]}
          onPress={() => navigation.navigate("AddLoan")}
        >
          <Icon
            name="cash-multiple"
            size={28}
            color={colors.textLight}
            style={{ marginRight: 8 }}
          />
          <Text style={buttonStyles.quickActionText}>New Loan</Text>
        </TouchableOpacity>
      </View>

      {/* Navigation Buttons Row */}
      <View style={dashboardStyles.navButtonsRow}>
        <TouchableOpacity
          style={[buttonStyles.navigation, { marginRight: 8 }]}
          onPress={() => navigation.navigate("Loans")}
        >
          <Icon name="file-document-outline" size={32} color={colors.primary} />
          <Text style={buttonStyles.navigationText}>Loans</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[buttonStyles.navigation, { marginRight: 8 }]}
          onPress={() => navigation.navigate("Customers")}
        >
          <Icon name="account-group-outline" size={32} color={colors.primary} />
          <Text style={buttonStyles.navigationText}>Customers</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[buttonStyles.navigation, { marginRight: 8 }]}
          onPress={() => navigation.navigate("PaymentsList")}
        >
          <Icon name="wallet-outline" size={32} color={colors.primary} />
          <Text style={buttonStyles.navigationText}>Payments</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={buttonStyles.navigation}
          onPress={() => navigation.navigate("BankDeposits")}
        >
          <Icon name="bank-transfer" size={32} color={colors.primary} />
          <Text style={buttonStyles.navigationText}>Deposit</Text>
        </TouchableOpacity>
      </View>

      {/* System Summary Section */}
      <View style={dashboardStyles.summarySection}>
        <Text style={dashboardStyles.sectionTitle}>System Summary</Text>

        {loading ? (
          <View style={dashboardStyles.statsLoading}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : stats ? (
          <View style={dashboardStyles.statsGrid}>
            {/* Row 1: Active Loans, Today's Expected, Completed Loans */}
            <View style={{ flexDirection: "row", marginBottom: 10 }}>
              <View style={[cardStyles.stat, { marginRight: 10 }]}>
                <Text style={cardStyles.statTitle}>Active Loan Count</Text>
                <Text style={cardStyles.statValue}>{stats.activeLoans}</Text>
              </View>
              <View style={[cardStyles.stat, { marginRight: 10 }]}>
                <Text style={cardStyles.statTitle}>Total Due Installments</Text>
                <Text style={cardStyles.statValue}>
                  {stats.todayExpectedPayments || 0}
                </Text>
              </View>
              <View style={cardStyles.stat}>
                <Text style={cardStyles.statTitle}>Completed Loan Count</Text>
                <Text style={cardStyles.statValue}>{stats.completedLoans}</Text>
              </View>
            </View>

            {/* Row 2: Overdue Payments, Pending for Bank Deposit */}
            <View style={{ flexDirection: "row" }}>
              <View style={[cardStyles.stat, { marginRight: 10 }]}>
                <Text style={cardStyles.statTitle}>Overdue Payments</Text>
                <Text style={cardStyles.statValue}>
                  {stats.overduePayments}
                </Text>
                {stats.overduePayments > 0 && (
                  <View style={dashboardStyles.attentionBadge}>
                    <Text style={dashboardStyles.attentionText}>Attention</Text>
                  </View>
                )}
              </View>
              <View style={cardStyles.stat}>
                <Text style={cardStyles.statTitle}>Pending Deposit</Text>
                <Text style={cardStyles.statValue}>
                  Rs. {stats.pendingDeposit.toLocaleString()}
                </Text>
              </View>
            </View>
          </View>
        ) : null}
      </View>

      {/* Total Outstanding Section */}
      <View style={dashboardStyles.outstandingSection}>
        <Text style={dashboardStyles.sectionTitle}>Outstanding Balance</Text>

        {loading ? (
          <View style={dashboardStyles.statsLoading}>
            <ActivityIndicator size="large" color={colors.textLight} />
          </View>
        ) : stats ? (
          <View style={dashboardStyles.outstandingCard}>
            <Text style={dashboardStyles.outstandingLabel}>
              Total to be Collected
            </Text>
            <Text style={dashboardStyles.outstandingValue}>
              Rs. {(stats.totalToBeCollected || 0).toLocaleString()}
            </Text>
            <Text style={dashboardStyles.outstandingHint}>
              From all active loans
            </Text>
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
}

// Side Drawer Component for More Menu
function SideDrawer({ visible, onClose, navigation, userType, logout }) {
  const [isVisible, setIsVisible] = React.useState(visible);
  const slideAnim = React.useRef(new Animated.Value(300)).current;

  React.useEffect(() => {
    if (visible) {
      setIsVisible(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 300,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setIsVisible(false);
      });
    }
  }, [visible]);

  if (!isVisible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={navigationStyles.drawerOverlay}>
        <TouchableOpacity
          style={{ flex: 1 }}
          activeOpacity={1}
          onPress={onClose}
        />
        <Animated.View
          style={[
            navigationStyles.drawerContainer,
            { transform: [{ translateX: slideAnim }] },
          ]}
        >
          <View style={navigationStyles.drawerHeader}>
            <Text style={navigationStyles.drawerHeaderText}>Menu</Text>
            <Text style={navigationStyles.drawerSubheader}>
              Welcome, {userType}
            </Text>
          </View>

          <ScrollView style={navigationStyles.drawerContent}>

            <TouchableOpacity
              style={navigationStyles.drawerItem}
              onPress={() => {
                onClose();
                navigation.navigate("FundsList");
              }}
            >
              <Icon
                name="cash"
                size={24}
                color={colors.success}
                style={navigationStyles.drawerItemIcon}
              />
              <Text style={navigationStyles.drawerItemText}>Funds</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={navigationStyles.drawerItem}
              onPress={() => {
                onClose();
                navigation.navigate("BankAccounts");
              }}
            >
              <Icon
                name="bank-outline"
                size={24}
                color={colors.primary}
                style={navigationStyles.drawerItemIcon}
              />
              <Text style={navigationStyles.drawerItemText}>Bank Accounts</Text>
            </TouchableOpacity>

            <View style={navigationStyles.drawerDivider} />

            <TouchableOpacity
              style={navigationStyles.drawerItem}
              onPress={() => {
                onClose();
                navigation.navigate("Settings");
              }}
            >
              <Icon
                name="cog"
                size={24}
                color={colors.primary}
                style={navigationStyles.drawerItemIcon}
              />
              <Text style={navigationStyles.drawerItemText}>Settings</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={navigationStyles.drawerItem}
              onPress={() => {
                onClose();
                logout();
              }}
            >
              <Icon
                name="logout"
                size={24}
                color={colors.error}
                style={navigationStyles.drawerItemIcon}
              />
              <Text style={navigationStyles.drawerItemText}>Logout</Text>
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

// Home Screen Wrapper with Hamburger Menu
function HomeScreenWrapper({ navigation, userType }) {
  const { logout } = useAuth();
  const [drawerVisible, setDrawerVisible] = React.useState(false);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => setDrawerVisible(true)}
          style={buttonStyles.hamburger}
        >
          <Icon name="menu" size={28} color={colors.textLight} />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  return (
    <View style={{ flex: 1 }}>
      <HomeScreen userType={userType} navigation={navigation} />
      <SideDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        navigation={navigation}
        userType={userType}
        logout={logout}
      />
    </View>
  );
}

function AppNavigator() {
  const { user, loading, userType, logout } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.textLight,
        headerTitleStyle: {
          fontWeight: "600",
        },
      }}
    >
      {!user ? (
        <Stack.Screen
          name="Login"
          const { user, loading, userType, logout } = useAuth();

          if (loading) {
            return <LoadingScreen />;
          }

          return (
            <Stack.Navigator
              screenOptions={{
                headerStyle: {
                  backgroundColor: colors.primary,
                },
                headerTintColor: colors.textLight,
                headerTitleStyle: {
                  fontWeight: "600",
                },
              }}
            >
              {!user ? (
                <Stack.Screen
                  name="Login"
                  component={LoginScreen}
                  options={{
                    headerShown: false,
                    gestureEnabled: false,
                  }}
                />
              ) : (
                <>
                  <Stack.Screen
                    name="Home"
                    options={{
                      headerShown: true,
                      title: "",
                      headerTitle: () => (
                        <Image
                          source={require("./assets/icon.png")}
                          style={navigationStyles.headerImage}
                          resizeMode="contain"
                        />
                      ),
                    }}
                  >
                    {({ navigation }) => (
                      <HomeScreenWrapper navigation={navigation} userType={userType} />
                    )}
                  </Stack.Screen>
                  <Stack.Screen
                    name="FundsList"
                    component={FundsListScreen}
                    options={{
                      headerShown: true,
                      title: "Funds",
                    }}
                  />
                  <Stack.Screen
                    name="AddEditFund"
                    component={AddEditFundScreen}
                    options={({ route }) => ({
                      headerShown: true,
                      title: route?.params?.fund ? "Edit Fund" : "Add Fund",
                    })}
                  />
                  <Stack.Screen
                    name="Customers"
                    component={CustomersScreen}
                    options={({ navigation }) => ({
                      headerShown: true,
                      title: "Customers",
                      headerRight: () => (
                        <TouchableOpacity
                          onPress={() => navigation.navigate("AddCustomer")}
                          style={buttonStyles.headerAction}
                        >
                          <Icon name="account-plus" size={18} color="#2196F3" />
                          <Text style={buttonStyles.headerActionText}>Add</Text>
                        </TouchableOpacity>
                      ),
                    })}
                  />
                  <Stack.Screen
                    name="AddCustomer"
                    component={CustomerFormScreen}
                    options={{
                      headerShown: true,
                      title: "Add Customer",
                    }}
                  />
                  <Stack.Screen
                    name="EditCustomer"
                    component={CustomerFormScreen}
                    options={{
                      headerShown: true,
                      title: "Edit Customer",
                    }}
                  />
                  <Stack.Screen
                    name="CustomerDetails"
                    component={CustomerDetailsScreen}
                    options={{
                      headerShown: true,
                      title: "Customer Details",
                    }}
                  />
                  <Stack.Screen
                    name="CustomerLoans"
                    component={LoansScreen}
                    options={{
                      headerShown: true,
                      title: "Customer Loans",
                    }}
                  />
                  <Stack.Screen
                    name="AddLoan"
                    component={AddLoanScreen}
                    options={{
                      headerShown: true,
                      title: "Create New Loan",
                    }}
                  />
                  <Stack.Screen
                    name="LoanDetails"
                    component={LoanDetailsScreen}
                    options={{
                      headerShown: true,
                      title: "Loan Details",
                    }}
                  />
                  <Stack.Screen
                    name="PaymentPlan"
                    component={PaymentPlanScreen}
                    options={{
                      headerShown: true,
                      title: "Payment Plan",
                    }}
                  />
                  <Stack.Screen
                    name="PaymentHistory"
                    component={PaymentHistoryScreen}
                    options={{
                      headerShown: true,
                      title: "Payment History",
                    }}
                  />
                  <Stack.Screen
                    name="AddPayment"
                    component={AddPaymentScreen}
                    options={{
                      headerShown: true,
                      title: "Add Payment",
                    }}
                  />
                  <Stack.Screen
                    name="Loans"
                    component={LoansScreen}
                    options={{
                      headerShown: true,
                      title: "Loans",
                    }}
                  />
                  <Stack.Screen
                    name="PaymentsList"
                    component={PaymentsListScreen}
                    options={{
                      headerShown: false,
                    }}
                  />
                  <Stack.Screen
                    name="Settings"
                    component={SettingsScreen}
                    options={{
                      headerShown: true,
                      title: "Settings",
                    }}
                  />
                  <Stack.Screen name="BankAccounts" component={BankAccountsScreen} />
                  <Stack.Screen
                    name="BankDeposits"
                    component={BankDepositScreen}
                    options={{
                      headerShown: false,
                    }}
                  />
                </>
              )}
            </Stack.Navigator>
          );
          />
          <Stack.Screen
            name="PaymentsList"
            component={PaymentsListScreen}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{
              headerShown: true,
              title: "Settings",
            }}
          />
          <Stack.Screen name="BankAccounts" component={BankAccountsScreen} />
          <Stack.Screen
            name="BankDeposits"
            component={BankDepositScreen}
            options={{
              headerShown: false,
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}

// All styles have been moved to organized theme files:
// - buttonStyles: Button-related styles
// - cardStyles: Card and container styles
// - navigationStyles: Navigation, drawer, and header styles
// - dashboardStyles: Dashboard-specific styles
// Import from './src/theme' to access all styles
