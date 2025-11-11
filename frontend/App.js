import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import {
  LocalizationProvider,
  useLocalization,
} from "./src/context/LocalizationContext";
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
import DuePaymentsScreen from "./src/screens/payments/DuePaymentsScreen";
import SettingsScreen from "./src/screens/settings/SettingsScreen";
import BankAccountsScreen from "./src/screens/settings/BankAccountsScreen";
import BankDepositScreen from "./src/screens/deposits/BankDepositScreen";
import FundsListScreen from "./src/screens/funds/FundsListScreen";
import AddEditFundScreen from "./src/screens/funds/AddEditFundScreen";
import BusinessOverviewScreen from "./src/screens/overview/BusinessOverviewScreen";
import ExpensesScreen from "./src/screens/expenses/ExpensesScreen";
import {
  colors,
  commonStyles,
  buttonStyles,
  cardStyles,
  navigationStyles,
  dashboardStyles,
} from "./src/theme";
import api from "./src/api/client";
import { formatCurrency } from "./src/utils/currency";
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
  Pressable,
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
  const { t } = useLocalization();
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
      {/* Title Image */}
      <View
        style={{
          alignItems: "center",
          paddingVertical: 20,
          backgroundColor: colors.background,
        }}
      >
        <Image
          source={require("./assets/title.png")}
          style={{ width: 280, height: 100 }}
          resizeMode="contain"
        />
      </View>

      {/* Quick Action Buttons - Row 1 */}
      <View style={[dashboardStyles.quickActionsRow, { marginBottom: 10 }]}>
        <TouchableOpacity
          style={[
            buttonStyles.quickAction,
            { backgroundColor: colors.success },
          ]}
          onPress={() => navigation.navigate("AddPayment")}
        >
          <Icon
            name="cash-plus"
            size={28}
            color={colors.textLight}
            style={{ marginRight: 8 }}
          />
          <Text style={buttonStyles.quickActionText}>
            {t("home.addPayment")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            buttonStyles.quickAction,
            { backgroundColor: colors.warning },
          ]}
          onPress={() => navigation.navigate("DuePayments")}
        >
          <Icon
            name="calendar-clock"
            size={28}
            color={colors.textLight}
            style={{ marginRight: 8 }}
          />
          <Text style={buttonStyles.quickActionText}>
            {t("home.duePayments")}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Quick Action Buttons - Row 2 */}
      <View style={[dashboardStyles.quickActionsRow, { marginBottom: 20 }]}>
        <TouchableOpacity
          style={[buttonStyles.quickAction, { backgroundColor: "#9C27B0" }]}
          onPress={() => navigation.navigate("BankDeposits")}
        >
          <Icon
            name="bank-transfer"
            size={28}
            color={colors.textLight}
            style={{ marginRight: 8 }}
          />
          <Text style={buttonStyles.quickActionText}>
            {t("home.bankDeposit")}
          </Text>
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
          <Text style={buttonStyles.quickActionText}>{t("home.newLoan")}</Text>
        </TouchableOpacity>
      </View>

      {/* Navigation Buttons Row - 4 buttons with smaller width */}
      <View style={[dashboardStyles.navButtonsRow, { marginBottom: 8 }]}>
        <TouchableOpacity
          style={[buttonStyles.navigationSmall, { marginRight: 6 }]}
          onPress={() => navigation.navigate("Loans")}
        >
          <Icon name="file-document-outline" size={28} color={colors.primary} />
          <Text style={buttonStyles.navigationTextSmall}>{t("nav.loans")}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[buttonStyles.navigationSmall, { marginRight: 6 }]}
          onPress={() => navigation.navigate("Customers")}
        >
          <Icon name="account-group-outline" size={28} color={colors.primary} />
          <Text style={buttonStyles.navigationTextSmall}>
            {t("nav.customers")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[buttonStyles.navigationSmall, { marginRight: 6 }]}
          onPress={() => navigation.navigate("PaymentsList")}
        >
          <Icon name="wallet-outline" size={28} color={colors.primary} />
          <Text style={buttonStyles.navigationTextSmall}>
            {t("nav.payments")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={buttonStyles.navigationSmall}
          onPress={() => navigation.navigate("Expenses")}
        >
          <Icon name="receipt" size={28} color={colors.primary} />
          <Text style={buttonStyles.navigationTextSmall}>
            {t("nav.expenses")}
          </Text>
        </TouchableOpacity>
      </View>

      {/* System Summary Section */}
      <View style={dashboardStyles.summarySection}>
        <Text style={dashboardStyles.sectionTitle}>
          {t("home.systemSummary")}
        </Text>

        {loading ? (
          <View style={dashboardStyles.statsLoading}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : stats ? (
          <View style={dashboardStyles.statsGrid}>
            {/* Row 1: Overdue Payments Count, Today Installments, Active Loan Count */}
            <View style={{ flexDirection: "row", marginBottom: 10 }}>
              <View style={[cardStyles.stat, { marginRight: 10 }]}>
                <Text style={cardStyles.statTitle}>
                  {t("home.dueLoansCount")}
                </Text>
                <Text style={cardStyles.statValue}>
                  {stats.overduePayments}
                </Text>
              </View>
              <View style={[cardStyles.stat, { marginRight: 10 }]}>
                <Text style={cardStyles.statTitle}>
                  {t("home.todayInstallments")}
                </Text>
                <Text style={cardStyles.statValue}>
                  {stats.todayExpectedPayments || 0}
                </Text>
              </View>
              <View style={cardStyles.stat}>
                <Text style={cardStyles.statTitle}>
                  {t("home.activeLoanCount")}
                </Text>
                <Text style={cardStyles.statValue}>{stats.activeLoans}</Text>
              </View>
            </View>

            {/* Row 2: To Be Banked (Full Width) */}
            <View style={{ flexDirection: "row" }}>
              <View style={cardStyles.stat}>
                <Text style={cardStyles.statTitle}>{t("home.toBeBanked")}</Text>
                <Text style={cardStyles.statValue}>
                  {formatCurrency(stats.pendingDeposit)}
                </Text>
              </View>
            </View>
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
                navigation.navigate("BusinessOverview");
              }}
            >
              <Icon
                name="chart-line"
                size={24}
                color={colors.primary}
                style={navigationStyles.drawerItemIcon}
              />
              <Text style={navigationStyles.drawerItemText}>
                Business Overview
              </Text>
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

// Home Screen Wrapper (no longer needs its own hamburger menu - using global menu)
function HomeScreenWrapper({ navigation, userType }) {
  return (
    <View style={{ flex: 1 }}>
      <HomeScreen userType={userType} navigation={navigation} />
    </View>
  );
}

function AppNavigator({ navigationRef }) {
  const { user, loading, userType, logout } = useAuth();
  const { t } = useLocalization();
  const [menuVisible, setMenuVisible] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const slideAnim = React.useRef(new Animated.Value(-300)).current;

  React.useEffect(() => {
    if (menuVisible) {
      setIsMenuVisible(true);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -300,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setIsMenuVisible(false);
      });
    }
  }, [menuVisible]);

  if (loading) {
    return <LoadingScreen />;
  }

  const handleMenuItemPress = (screen) => {
    setMenuVisible(false);
    if (screen === "Logout") {
      logout();
    } else if (navigationRef?.current) {
      navigationRef.current.navigate(screen);
    }
  };

  return (
    <>
      <Stack.Navigator
        screenOptions={({ navigation }) => ({
          headerStyle: {
            backgroundColor: "#384043",
          },
          headerTintColor: colors.textLight,
          headerTitleStyle: {
            fontWeight: "600",
          },
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => setMenuVisible(true)}
              style={{ marginLeft: 15, padding: 5 }}
            >
              <Icon name="menu" size={28} color={colors.textLight} />
            </TouchableOpacity>
          ),
        })}
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
              }}
            >
              {({ navigation }) => (
                <HomeScreenWrapper
                  navigation={navigation}
                  userType={userType}
                />
              )}
            </Stack.Screen>
            <Stack.Screen
              name="BusinessOverview"
              component={BusinessOverviewScreen}
              options={{
                headerShown: true,
                title: "Business Overview",
              }}
            />
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
              options={({ navigation }) => ({
                headerShown: true,
                title: t("loans.createNewLoan"),
              })}
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
              name="DuePayments"
              component={DuePaymentsScreen}
              options={({ navigation }) => ({
                headerShown: true,
                title: t("payments.duePaymentsTitle"),
              })}
            />
            <Stack.Screen
              name="Settings"
              component={SettingsScreen}
              options={{
                headerShown: true,
                title: "Settings",
              }}
            />
            <Stack.Screen
              name="BankAccounts"
              component={BankAccountsScreen}
              options={{
                headerShown: true,
                title: "Bank Accounts",
              }}
            />
            <Stack.Screen
              name="BankDeposits"
              component={BankDepositScreen}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="Expenses"
              component={ExpensesScreen}
              options={{
                headerShown: false,
              }}
            />
          </>
        )}
      </Stack.Navigator>

      {/* Global Side Menu */}
      {user && isMenuVisible && (
        <Modal
          visible={isMenuVisible}
          transparent={true}
          animationType="none"
          onRequestClose={() => setMenuVisible(false)}
        >
          <View style={navigationStyles.drawerOverlay}>
            <TouchableOpacity
              style={{ flex: 1 }}
              activeOpacity={1}
              onPress={() => setMenuVisible(false)}
            />
            <Animated.View
              style={[
                navigationStyles.drawerContainer,
                {
                  left: 0,
                  right: undefined,
                  transform: [{ translateX: slideAnim }],
                },
              ]}
            >
              <View style={navigationStyles.drawerHeader}>
                <Text style={navigationStyles.drawerHeaderText}>
                  {t("nav.menu")}
                </Text>
                <Text style={navigationStyles.drawerSubheader}>
                  {t("nav.welcome")}, {userType}
                </Text>
              </View>

              <ScrollView style={navigationStyles.drawerContent}>
                <TouchableOpacity
                  style={navigationStyles.drawerItem}
                  onPress={() => handleMenuItemPress("Home")}
                >
                  <Icon
                    name="home"
                    size={24}
                    color={colors.primary}
                    style={navigationStyles.drawerItemIcon}
                  />
                  <Text style={navigationStyles.drawerItemText}>
                    {t("nav.home")}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={navigationStyles.drawerItem}
                  onPress={() => handleMenuItemPress("Customers")}
                >
                  <Icon
                    name="account-group"
                    size={24}
                    color={colors.primary}
                    style={navigationStyles.drawerItemIcon}
                  />
                  <Text style={navigationStyles.drawerItemText}>
                    {t("nav.customers")}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={navigationStyles.drawerItem}
                  onPress={() => handleMenuItemPress("Loans")}
                >
                  <Icon
                    name="cash-multiple"
                    size={24}
                    color={colors.primary}
                    style={navigationStyles.drawerItemIcon}
                  />
                  <Text style={navigationStyles.drawerItemText}>
                    {t("nav.loans")}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={navigationStyles.drawerItem}
                  onPress={() => handleMenuItemPress("PaymentsList")}
                >
                  <Icon
                    name="credit-card"
                    size={24}
                    color={colors.primary}
                    style={navigationStyles.drawerItemIcon}
                  />
                  <Text style={navigationStyles.drawerItemText}>
                    {t("nav.payments")}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={navigationStyles.drawerItem}
                  onPress={() => handleMenuItemPress("Expenses")}
                >
                  <Icon
                    name="receipt"
                    size={24}
                    color={colors.primary}
                    style={navigationStyles.drawerItemIcon}
                  />
                  <Text style={navigationStyles.drawerItemText}>
                    {t("nav.expenses")}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={navigationStyles.drawerItem}
                  onPress={() => handleMenuItemPress("BankDeposits")}
                >
                  <Icon
                    name="bank"
                    size={24}
                    color={colors.primary}
                    style={navigationStyles.drawerItemIcon}
                  />
                  <Text style={navigationStyles.drawerItemText}>
                    {t("nav.bankDeposits")}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={navigationStyles.drawerItem}
                  onPress={() => handleMenuItemPress("BankAccounts")}
                >
                  <Icon
                    name="bank-outline"
                    size={24}
                    color={colors.primary}
                    style={navigationStyles.drawerItemIcon}
                  />
                  <Text style={navigationStyles.drawerItemText}>
                    {t("nav.bankAccounts")}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={navigationStyles.drawerItem}
                  onPress={() => handleMenuItemPress("FundsList")}
                >
                  <Icon
                    name="wallet"
                    size={24}
                    color={colors.primary}
                    style={navigationStyles.drawerItemIcon}
                  />
                  <Text style={navigationStyles.drawerItemText}>
                    {t("nav.funds")}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={navigationStyles.drawerItem}
                  onPress={() => handleMenuItemPress("BusinessOverview")}
                >
                  <Icon
                    name="chart-line"
                    size={24}
                    color={colors.primary}
                    style={navigationStyles.drawerItemIcon}
                  />
                  <Text style={navigationStyles.drawerItemText}>
                    {t("nav.businessOverview")}
                  </Text>
                </TouchableOpacity>

                <View style={navigationStyles.drawerDivider} />

                <TouchableOpacity
                  style={navigationStyles.drawerItem}
                  onPress={() => handleMenuItemPress("Settings")}
                >
                  <Icon
                    name="cog"
                    size={24}
                    color={colors.primary}
                    style={navigationStyles.drawerItemIcon}
                  />
                  <Text style={navigationStyles.drawerItemText}>
                    {t("nav.settings")}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={navigationStyles.drawerItem}
                  onPress={() => {
                    setMenuVisible(false);
                    logout();
                  }}
                >
                  <Icon
                    name="logout"
                    size={24}
                    color={colors.error}
                    style={navigationStyles.drawerItemIcon}
                  />
                  <Text style={navigationStyles.drawerItemText}>
                    {t("settings.logout")}
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </Animated.View>
          </View>
        </Modal>
      )}
    </>
  );
}

export default function App() {
  const navigationRef = React.useRef(null);

  return (
    <LocalizationProvider>
      <AuthProvider>
        <NavigationContainer ref={navigationRef}>
          <AppNavigator navigationRef={navigationRef} />
        </NavigationContainer>
      </AuthProvider>
    </LocalizationProvider>
  );
}

// All styles have been moved to organized theme files:
// - buttonStyles: Button-related styles
// - cardStyles: Card and container styles
// - navigationStyles: Navigation, drawer, and header styles
// - dashboardStyles: Dashboard-specific styles
// Import from './src/theme' to access all styles
