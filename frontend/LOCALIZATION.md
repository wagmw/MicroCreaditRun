# Localization Setup Guide

## 🌐 Overview

The app now supports bilingual functionality with English and Sinhala languages. Users can switch between languages from the Settings screen, and their preference is saved persistently.

## 📂 Files Created

### 1. Translation Files

- `frontend/src/localization/en.js` - English translations
- `frontend/src/localization/si.js` - Sinhala translations

Both files contain ~200+ translation keys organized by feature:

- common (buttons, actions)
- auth (login, logout)
- nav (navigation labels)
- home (dashboard)
- customers
- loans
- payments
- expenses
- bankDeposits
- bankAccounts
- funds
- businessOverview
- settings
- messages (success/error messages)
- status (loan/payment statuses)

### 2. LocalizationContext

- `frontend/src/context/LocalizationContext.js`
- Provides language state, switching function, and translation helper
- Persists language selection to AsyncStorage

### 3. App Integration

- `frontend/App.js` - Wrapped with LocalizationProvider
- `frontend/src/screens/settings/SettingsScreen.js` - Language selector added

## 🔧 How to Use in Screens

### Step 1: Import the hook

```javascript
import { useLocalization } from "../../context/LocalizationContext";
```

### Step 2: Use in component

```javascript
export default function YourScreen() {
  const { t } = useLocalization();

  return (
    <View>
      <Text>{t("common.save")}</Text>
      <Text>{t("loans.title")}</Text>
    </View>
  );
}
```

## 📝 Translation Key Format

Use dot notation to access nested keys:

- `t('common.save')` → "Save" / "සුරකින්න"
- `t('loans.loanAmount')` → "Loan Amount" / "ණය මුදල"
- `t('settings.language')` → "Language" / "භාෂාව"

## 🎯 Example Screen Updates

### Example 1: HomeScreen Quick Action Buttons

**Before:**

```javascript
<Text style={buttonStyles.quickActionText}>Add Payment</Text>
<Text style={buttonStyles.quickActionText}>Due Payments</Text>
<Text style={buttonStyles.quickActionText}>Bank Deposit</Text>
<Text style={buttonStyles.quickActionText}>New Loan</Text>
```

**After:**

```javascript
const { t } = useLocalization();

<Text style={buttonStyles.quickActionText}>{t('home.addPayment')}</Text>
<Text style={buttonStyles.quickActionText}>{t('home.duePayments')}</Text>
<Text style={buttonStyles.quickActionText}>{t('home.bankDeposit')}</Text>
<Text style={buttonStyles.quickActionText}>{t('home.newLoan')}</Text>
```

### Example 2: System Summary Stats

**Before:**

```javascript
<Text style={dashboardStyles.statLabel}>Due Loans Count</Text>
<Text style={dashboardStyles.statLabel}>Today Installments</Text>
<Text style={dashboardStyles.statLabel}>Active Loan Count</Text>
<Text style={dashboardStyles.statLabel}>To be Banked (Rs.)</Text>
```

**After:**

```javascript
<Text style={dashboardStyles.statLabel}>{t('home.dueLoansCount')}</Text>
<Text style={dashboardStyles.statLabel}>{t('home.todayInstallments')}</Text>
<Text style={dashboardStyles.statLabel}>{t('home.activeLoanCount')}</Text>
<Text style={dashboardStyles.statLabel}>{t('home.toBeBanked')}</Text>
```

### Example 3: Navigation Buttons

**Before:**

```javascript
<Text style={buttonStyles.navigationTextSmall}>Loans</Text>
<Text style={buttonStyles.navigationTextSmall}>Customers</Text>
<Text style={buttonStyles.navigationTextSmall}>Payments</Text>
<Text style={buttonStyles.navigationTextSmall}>Expenses</Text>
```

**After:**

```javascript
<Text style={buttonStyles.navigationTextSmall}>{t('nav.loans')}</Text>
<Text style={buttonStyles.navigationTextSmall}>{t('nav.customers')}</Text>
<Text style={buttonStyles.navigationTextSmall}>{t('nav.payments')}</Text>
<Text style={buttonStyles.navigationTextSmall}>{t('nav.expenses')}</Text>
```

### Example 4: Form Labels in Customer Screen

**Before:**

```javascript
<Text style={styles.label}>Full Name</Text>
<Text style={styles.label}>Mobile Phone</Text>
<Text style={styles.label}>National ID No.</Text>
<Text style={styles.label}>Date of Birth</Text>
```

**After:**

```javascript
<Text style={styles.label}>{t('customers.fullName')}</Text>
<Text style={styles.label}>{t('customers.mobilePhone')}</Text>
<Text style={styles.label}>{t('customers.nationalIdNo')}</Text>
<Text style={styles.label}>{t('customers.dateOfBirth')}</Text>
```

### Example 5: Buttons and Actions

**Before:**

```javascript
<Text style={buttonStyles.buttonText}>Save</Text>
<Text style={buttonStyles.buttonText}>Cancel</Text>
<Text style={buttonStyles.buttonText}>Delete</Text>
<Text style={buttonStyles.buttonText}>Add</Text>
```

**After:**

```javascript
<Text style={buttonStyles.buttonText}>{t('common.save')}</Text>
<Text style={buttonStyles.buttonText}>{t('common.cancel')}</Text>
<Text style={buttonStyles.buttonText}>{t('common.delete')}</Text>
<Text style={buttonStyles.buttonText}>{t('common.add')}</Text>
```

### Example 6: Alert Messages

**Before:**

```javascript
Alert.alert("Success", "Loan created successfully");
Alert.alert("Error", "Failed to save loan");
Alert.alert("Confirm", "Are you sure you want to delete this customer?");
```

**After:**

```javascript
Alert.alert(t("common.success"), t("messages.saveSuccess"));
Alert.alert(t("common.error"), t("messages.saveError"));
Alert.alert(t("common.confirm"), t("messages.confirmDelete"));
```

## 🗂️ Screens That Need Updates

### Priority 1 (Core Navigation & Actions)

1. ✅ **App.js** - HomeScreen (navigation buttons, stats labels)
2. **CustomersScreen** - Title, search placeholder, add button
3. **CustomerFormScreen** - All form labels
4. **LoansScreen** - Title, filter tabs, loan card labels
5. **AddLoanScreen** - All form labels
6. **LoanDetailsScreen** - All labels, buttons (settle, renew)
7. **PaymentsListScreen** - Title, filter tabs
8. **AddPaymentScreen** - All form labels

### Priority 2 (Secondary Screens)

9. **ExpensesScreen** - Title, summary labels, form fields
10. **BankDepositScreen** - Title, section labels, buttons
11. **DuePaymentsScreen** - Title, payment cards
12. **PaymentPlanScreen** - Title, plan table headers
13. **PaymentHistoryScreen** - Title, history labels

### Priority 3 (Settings & Additional)

14. **BusinessOverviewScreen** - All stat labels, section titles
15. **BankAccountsScreen** - Title, form labels
16. **FundsListScreen** - Title, summary labels
17. **CustomerDetailsScreen** - All detail labels

## 📱 Testing Checklist

1. ✅ Open Settings screen
2. ✅ Tap on Language option
3. ✅ Select Sinhala (සිංහල)
4. ✅ Verify alert appears in Sinhala
5. Navigate through each screen and verify text changes
6. Close and reopen app - language should persist
7. Switch back to English and verify all screens update

## 🔑 Available Translation Keys

### Common Actions

- `common.save`, `common.cancel`, `common.delete`, `common.edit`, `common.add`
- `common.confirm`, `common.back`, `common.next`, `common.done`
- `common.loading`, `common.error`, `common.success`
- `common.amount`, `common.date`, `common.description`, `common.total`, `common.status`

### Navigation

- `nav.home`, `nav.loans`, `nav.customers`, `nav.payments`, `nav.expenses`
- `nav.settings`, `nav.businessOverview`, `nav.funds`, `nav.bankAccounts`

### Status Values

- `status.active`, `status.completed`, `status.settled`, `status.renewed`, `status.defaulted`

### Messages

- `messages.saveSuccess`, `messages.saveError`, `messages.deleteSuccess`, `messages.deleteError`
- `messages.updateSuccess`, `messages.updateError`, `messages.loadError`, `messages.networkError`

## 💡 Best Practices

1. **Use descriptive key names**: `customers.fullName` instead of `form.field1`
2. **Group related keys**: Keep all loan-related keys under `loans.*`
3. **Reuse common strings**: Use `common.*` for buttons, actions that appear across screens
4. **Test both languages**: Ensure translations fit within UI constraints
5. **Add missing keys**: If a key doesn't exist, add it to both `en.js` and `si.js`

## 🚀 Quick Implementation Pattern

For any screen:

```javascript
// 1. Import the hook
import { useLocalization } from "../../context/LocalizationContext";

// 2. Use in component
export default function YourScreen() {
  const { t } = useLocalization();

  // 3. Replace all hardcoded text
  return (
    <View>
      <Text>{t("section.keyName")}</Text>
    </View>
  );
}
```

## 📞 Language Switching

Users can switch languages by:

1. Go to Settings screen (from bottom tab navigation)
2. Tap on "Language" / "භාෂාව" option at the top
3. Select English (🇬🇧) or සිංහල (🇱🇰)
4. Confirmation alert appears
5. Language changes immediately across all screens
6. Preference saved to AsyncStorage for persistence

## ✅ Current Status

- ✅ Localization infrastructure complete
- ✅ English translation file (200+ keys)
- ✅ Sinhala translation file (200+ keys)
- ✅ LocalizationContext with AsyncStorage
- ✅ Language selector in Settings screen
- ⏳ Screen updates pending (need to replace hardcoded text with `t()` calls)

## 🔄 Next Steps

Replace all hardcoded English text in screens with translation function calls. Start with HomeScreen, then move through Priority 1, Priority 2, and Priority 3 screens systematically.
