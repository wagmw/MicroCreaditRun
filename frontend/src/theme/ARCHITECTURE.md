# Complete Style Architecture Documentation

## 📋 Table of Contents

1. [Overview](#overview)
2. [File Structure](#file-structure)
3. [Style Module Reference](#style-module-reference)
4. [Quick Start Guide](#quick-start-guide)
5. [Performance Optimization](#performance-optimization)

## Overview

The MicroCreditRun app now uses a comprehensive, organized style architecture that separates styles into logical, reusable modules. This design improves:

- **Performance**: Styles are defined once and reused across components
- **Maintainability**: Easy to find and update specific styles
- **Consistency**: Ensures uniform UI across the entire app
- **Developer Experience**: Clear naming and organization

## File Structure

```
src/theme/
├── index.js              # Central export (import from here!)
├── colors.js             # Color palette
├── buttonStyles.js       # Button styles
├── cardStyles.js         # Card/container styles
├── navigationStyles.js   # Headers, drawers, menus
├── dashboardStyles.js    # Dashboard-specific
├── formStyles.js         # ⭐ NEW: Forms, inputs, labels
├── listStyles.js         # ⭐ NEW: Lists, cards, rows
├── statusStyles.js       # ⭐ NEW: Badges, indicators
├── modalStyles.js        # ⭐ NEW: Modals, overlays
├── utilityStyles.js      # ⭐ NEW: Spacing, alignment
└── commonStyles.js       # Common + re-exports all
```

## Style Module Reference

### 🎨 Core Modules

#### **colors.js**

Central color palette for the entire app.

```javascript
import { colors } from "./src/theme";

colors.primary; // #F5B400 - Golden yellow
colors.success; // #10B981 - Green
colors.warning; // #F59E0B - Orange
colors.error; // #EF4444 - Red
colors.textPrimary; // #1A1D1F - Almost black
colors.textSecondary; // #6F767E - Grey
```

#### **buttonStyles.js**

All button-related styles.

```javascript
import { buttonStyles } from "./src/theme";

buttonStyles.primary; // Primary action button
buttonStyles.primaryText; // Primary button text
buttonStyles.success; // Success/secondary button
buttonStyles.quickAction; // Quick action (half width)
buttonStyles.navigation; // Icon + text nav button
buttonStyles.headerAction; // Small header button
buttonStyles.hamburger; // Menu button
```

#### **cardStyles.js**

Card and container styles.

```javascript
import { cardStyles } from "./src/theme";

cardStyles.basic; // Basic card
cardStyles.bordered; // Card with border
cardStyles.elevated; // Card with more shadow
cardStyles.stat; // Dashboard stat card
cardStyles.statTitle; // Stat title text
cardStyles.statValue; // Stat value text
```

### 📝 Form Module

#### **formStyles.js** ⭐ NEW

Complete form styling system.

```javascript
import { formStyles } from "./src/theme";

// Container
formStyles.form; // Form container
formStyles.formSection; // Form section

// Labels
formStyles.label; // Standard label
formStyles.labelSmall; // Smaller label
formStyles.required; // Required asterisk (*)
formStyles.hint; // Hint text

// Inputs
formStyles.input; // Text input
formStyles.inputFocused; // Focused state
formStyles.inputError; // Error state
formStyles.inputDisabled; // Disabled state
formStyles.textArea; // Multi-line input
formStyles.searchInput; // Search input
formStyles.searchSection; // Search section container

// Pickers
formStyles.pickerContainer; // Dropdown container
formStyles.pickerContainerError; // Error state

// Photo Upload
formStyles.photoButton; // Photo button
formStyles.photoPreview; // Photo preview image
formStyles.photoPlaceholder; // Photo placeholder
formStyles.photoPlaceholderText; // Icon
formStyles.photoPlaceholderSubtext; // Text

// Buttons
formStyles.submitButton; // Submit button
formStyles.submitButtonDisabled; // Disabled submit
formStyles.submitButtonText; // Submit text
formStyles.cancelButton; // Cancel button
formStyles.cancelButtonText; // Cancel text

// Messages
formStyles.errorText; // Error message
formStyles.successText; // Success message
```

**Example Usage:**

```javascript
<View style={formStyles.form}>
  <Text style={formStyles.label}>
    Full Name <Text style={formStyles.required}>*</Text>
  </Text>
  <TextInput style={formStyles.input} placeholder="Enter name" />
  <Text style={formStyles.hint}>Enter your legal name</Text>

  <TouchableOpacity style={formStyles.submitButton}>
    <Text style={formStyles.submitButtonText}>Submit</Text>
  </TouchableOpacity>
</View>
```

### 📋 List Module

#### **listStyles.js** ⭐ NEW

List, card, and row styles for all list-based screens.

```javascript
import { listStyles } from "./src/theme";

// Containers
listStyles.container; // Main list container
listStyles.listContainer; // FlatList container
listStyles.listContent; // List content style

// Cards
listStyles.card; // List item card
listStyles.cardLarge; // Larger card variant
listStyles.cardHeader; // Card header section
listStyles.cardHeaderLight; // Light header
listStyles.cardContent; // Card content area
listStyles.cardFooter; // Card footer

// Rows
listStyles.row; // Horizontal row
listStyles.rowBetween; // Space-between row
listStyles.rowStart; // Flex-start row
listStyles.detailRow; // Detail info row
listStyles.infoRow; // Info display row

// Labels & Values
listStyles.detailLabel; // Detail label text
listStyles.detailValue; // Detail value text
listStyles.detailValueLarge; // Larger value text

// Section Headers
listStyles.sectionHeader; // Section header container
listStyles.sectionHeaderText; // Section title
listStyles.sectionHeaderSubtext; // Section subtitle

// Separators
listStyles.separator; // Thin separator
listStyles.separatorThick; // Thick separator

// Empty State
listStyles.emptyContainer; // Empty state container
listStyles.emptyText; // Empty state text
listStyles.emptyIcon; // Empty state icon

// Customer-Specific
listStyles.customerName; // Customer name text
listStyles.customerInfo; // Customer info container
listStyles.customerPhone; // Phone number (clickable)
listStyles.customerAddress; // Address text
listStyles.customerPhoto; // Customer photo
listStyles.customerPhotoPlaceholder; // Photo placeholder
listStyles.customerInitials; // Initials in placeholder

// Icons & Contact
listStyles.icon; // Small icon
listStyles.iconLarge; // Large icon
listStyles.phoneContainer; // Phone numbers container
listStyles.phoneRow; // Phone row
listStyles.addressRow; // Address row
```

**Example Usage:**

```javascript
<FlatList
  data={items}
  contentContainerStyle={listStyles.listContainer}
  renderItem={({ item }) => (
    <TouchableOpacity style={listStyles.card}>
      <View style={listStyles.cardHeader}>
        <Text style={listStyles.customerName}>{item.name}</Text>
      </View>
      <View style={listStyles.cardContent}>
        <View style={listStyles.detailRow}>
          <Text style={listStyles.detailLabel}>Phone:</Text>
          <Text style={listStyles.detailValue}>{item.phone}</Text>
        </View>
      </View>
    </TouchableOpacity>
  )}
  ListEmptyComponent={
    <View style={listStyles.emptyContainer}>
      <Text style={listStyles.emptyText}>No items found</Text>
    </View>
  }
/>
```

### 🏷️ Status Module

#### **statusStyles.js** ⭐ NEW

Badges, indicators, and status displays.

```javascript
import { statusStyles } from "./src/theme";

// Badges
statusStyles.badge; // Basic badge
statusStyles.badgeLarge; // Large badge
statusStyles.badgeSuccess; // Success badge (green)
statusStyles.badgeWarning; // Warning badge (orange)
statusStyles.badgeError; // Error badge (red)
statusStyles.badgeInfo; // Info badge (blue)
statusStyles.badgePrimary; // Primary badge (yellow)
statusStyles.badgeText; // Badge text
statusStyles.badgeTextLarge; // Large badge text

// Status Dots
statusStyles.statusDot; // Small status dot
statusStyles.statusDotLarge; // Large status dot
statusStyles.statusDotActive; // Green dot
statusStyles.statusDotWarning; // Orange dot
statusStyles.statusDotError; // Red dot
statusStyles.statusDotInfo; // Blue dot

// Status Text (without badge)
statusStyles.statusText; // Status text
statusStyles.statusTextActive; // Green text
statusStyles.statusTextWarning; // Orange text
statusStyles.statusTextError; // Red text
statusStyles.statusTextInfo; // Blue text

// Progress Bars
statusStyles.progressBar; // Progress bar container
statusStyles.progressFill; // Progress fill
statusStyles.progressBarLarge; // Large progress bar
statusStyles.progressFillLarge; // Large progress fill

// Selection
statusStyles.checkmark; // Checked state
statusStyles.checkmarkUnchecked; // Unchecked state

// Amount Colors
statusStyles.amountPositive; // Green amount
statusStyles.amountNegative; // Red amount
statusStyles.amountNeutral; // Default amount

// Attention
statusStyles.attentionBadge; // Attention badge
statusStyles.attentionText; // Attention text

// Loan-Specific
statusStyles.loanAmount; // Loan amount display
statusStyles.loanId; // Loan ID display
statusStyles.outstandingHigh; // High outstanding (red)
statusStyles.outstandingMedium; // Medium outstanding (orange)
statusStyles.outstandingLow; // Low outstanding (green)
```

**Example Usage:**

```javascript
<View style={[statusStyles.badge, statusStyles.badgeSuccess]}>
  <Text style={statusStyles.badgeText}>ACTIVE</Text>
</View>

<View style={[statusStyles.badge, statusStyles.badgeWarning]}>
  <View style={statusStyles.statusDotWarning} />
  <Text style={statusStyles.badgeText}>PENDING</Text>
</View>

<Text style={statusStyles.outstandingHigh}>
  Rs. {amount.toLocaleString()}
</Text>
```

### 🪟 Modal Module

#### **modalStyles.js** ⭐ NEW

Modal, overlay, and picker styles.

```javascript
import { modalStyles } from "./src/theme";

// Overlays
modalStyles.overlay; // Standard overlay
modalStyles.overlayDark; // Dark overlay

// Modal Container
modalStyles.container; // Standard modal
modalStyles.containerLarge; // Large modal

// Modal Sections
modalStyles.header; // Modal header
modalStyles.headerTitle; // Header title
modalStyles.headerSubtitle; // Header subtitle
modalStyles.content; // Modal content
modalStyles.contentScrollable; // Scrollable content
modalStyles.footer; // Modal footer (buttons)
modalStyles.footerColumn; // Vertical footer

// Close Button
modalStyles.closeButton; // Close (X) button
modalStyles.closeButtonIcon; // X icon

// Action Buttons
modalStyles.primaryButton; // Primary action
modalStyles.secondaryButton; // Secondary action
modalStyles.dangerButton; // Danger action
modalStyles.primaryButtonText; // Primary button text
modalStyles.secondaryButtonText; // Secondary button text
modalStyles.dangerButtonText; // Danger button text

// Picker (Bottom Sheet)
modalStyles.pickerOverlay; // Picker overlay
modalStyles.pickerContainer; // Picker container
modalStyles.pickerHeader; // Picker header
modalStyles.pickerTitle; // Picker title
modalStyles.pickerDoneButton; // Done button
modalStyles.pickerDoneText; // Done text
modalStyles.pickerItem; // Picker item
modalStyles.pickerItemSelected; // Selected item
modalStyles.pickerItemText; // Item text
modalStyles.pickerItemTextSelected; // Selected text

// Bottom Sheet
modalStyles.bottomSheet; // Bottom sheet
modalStyles.bottomSheetHandle; // Drag handle

// Loading Overlay
modalStyles.loadingOverlay; // Loading overlay
modalStyles.loadingContainer; // Loading container
modalStyles.loadingText; // Loading text
```

**Example Usage:**

```javascript
<Modal visible={visible} transparent animationType="fade">
  <View style={modalStyles.overlay}>
    <View style={modalStyles.container}>
      <View style={modalStyles.header}>
        <Text style={modalStyles.headerTitle}>Confirm Action</Text>
        <Text style={modalStyles.headerSubtitle}>Are you sure?</Text>
      </View>

      <View style={modalStyles.content}>
        <Text>This action cannot be undone.</Text>
      </View>

      <View style={modalStyles.footer}>
        <TouchableOpacity style={modalStyles.secondaryButton}>
          <Text style={modalStyles.secondaryButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={modalStyles.primaryButton}>
          <Text style={modalStyles.primaryButtonText}>Confirm</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>
```

### 🔧 Utility Module

#### **utilityStyles.js** ⭐ NEW

Utility classes for spacing, alignment, and common patterns.

```javascript
import { utilityStyles } from "./src/theme";

// Flex
utilityStyles.flex1;
utilityStyles.row;
utilityStyles.column;

// Justify Content
utilityStyles.justifyStart;
utilityStyles.justifyCenter;
utilityStyles.justifyEnd;
utilityStyles.justifyBetween;

// Align Items
utilityStyles.alignStart;
utilityStyles.alignCenter;
utilityStyles.alignEnd;
utilityStyles.center; // Both axes

// Margins
utilityStyles.m8, m12, m16, m20, m24;
utilityStyles.mt8, mt12, mt16, mt20, mt24;
utilityStyles.mb8, mb12, mb16, mb20, mb24;
utilityStyles.ml8, ml12, ml16, ml20;
utilityStyles.mr8, mr12, mr16, mr20;
utilityStyles.mx8, mx12, mx16, mx20;
utilityStyles.my8, my12, my16, my20;

// Padding
utilityStyles.p8, p12, p16, p20, p24;
utilityStyles.pt8, pt12, pt16, pt20;
utilityStyles.pb8, pb12, pb16, pb20;
utilityStyles.px8, px12, px16, px20;
utilityStyles.py8, py12, py16, py20;

// Width/Height
utilityStyles.fullWidth;
utilityStyles.fullHeight;
utilityStyles.halfWidth;

// Text Alignment
utilityStyles.textLeft;
utilityStyles.textCenter;
utilityStyles.textRight;

// Font Weights
utilityStyles.fontNormal;
utilityStyles.fontMedium;
utilityStyles.fontSemibold;
utilityStyles.fontBold;

// Backgrounds
utilityStyles.bgPrimary;
utilityStyles.bgSuccess;
utilityStyles.bgWarning;
utilityStyles.bgError;
utilityStyles.bgWhite;

// Borders
utilityStyles.border;
utilityStyles.borderTop;
utilityStyles.borderBottom;
utilityStyles.rounded;
utilityStyles.roundedLg;
utilityStyles.roundedFull;

// Common Containers
utilityStyles.centerContainer;
utilityStyles.loadingContainer;
```

**Example Usage:**

```javascript
<View
  style={[utilityStyles.row, utilityStyles.justifyBetween, utilityStyles.p16]}
>
  <Text style={[utilityStyles.fontBold, utilityStyles.textLeft]}>Label</Text>
  <Text style={utilityStyles.textRight}>Value</Text>
</View>
```

## Quick Start Guide

### 1. Import the Theme

```javascript
import {
  colors,
  formStyles,
  listStyles,
  statusStyles,
  buttonStyles,
  utilityStyles,
} from "./src/theme";
```

### 2. Replace Inline Styles

**Before:**

```javascript
const styles = StyleSheet.create({
  input: {
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E8EAED",
  },
});
```

**After:**

```javascript
<TextInput style={formStyles.input} />
```

### 3. Combine Styles When Needed

```javascript
<View style={[listStyles.card, utilityStyles.mb16]}>
  {/* content */}
</View>

<Text style={[statusStyles.statusText, statusStyles.statusTextActive]}>
  Active
</Text>
```

## Performance Optimization

### ✅ Benefits

1. **Reduced Memory**: Styles defined once, reused everywhere
2. **Faster Rendering**: No StyleSheet.create() in render cycles
3. **Smaller Bundle**: Eliminated duplicate style definitions
4. **Better Caching**: React Native can optimize style objects better

### 📊 Performance Metrics

- **Before**: ~300 lines of styles per screen file
- **After**: Import 1-2 lines, use shared styles
- **Reduction**: ~70-80% less style code in components
- **Reusability**: Same styles across 10+ screens

### 🎯 Best Practices

1. **Use theme styles first** - Check if style exists before creating new
2. **Combine when needed** - Use arrays: `[themeStyle, { custom: value }]`
3. **Avoid inline objects** - Creates new object on every render
4. **Leverage utilities** - Use utilityStyles for spacing/alignment
5. **Keep components clean** - Focus on logic, not styling

### ⚡ Quick Wins

Replace this pattern:

```javascript
// ❌ Creates new style object every render
<View style={{ padding: 16, marginTop: 8 }}>
```

With this:

```javascript
// ✅ Reuses cached style objects
<View style={[utilityStyles.p16, utilityStyles.mt8]}>
```

## Migration Checklist

- [ ] Import theme modules at top of file
- [ ] Replace form inputs with formStyles
- [ ] Replace list cards with listStyles
- [ ] Replace status badges with statusStyles
- [ ] Replace modals with modalStyles
- [ ] Use utilityStyles for spacing
- [ ] Remove old StyleSheet.create() at bottom
- [ ] Test component renders correctly
- [ ] Verify no visual regressions

## Summary

The new style architecture provides:

- **11 organized style modules** covering all use cases
- **200+ reusable style definitions**
- **Consistent UI** across entire app
- **Better performance** through style reuse
- **Improved developer experience** with clear organization

Import from `'./src/theme'` and start building! 🚀
