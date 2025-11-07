# Theme Structure Documentation

This document describes the organized theme structure for the MicroCreditRun frontend application.

## Overview

All styles have been extracted from individual component files into a centralized, organized theme system located in `src/theme/`. This improves maintainability, consistency, and reusability across the application.

## File Structure

```
src/theme/
├── index.js              # Central export point for all theme modules
├── colors.js             # Color palette and theming
├── commonStyles.js       # Common/shared styles and legacy exports
├── buttonStyles.js       # All button-related styles
├── cardStyles.js         # Card and container styles
├── navigationStyles.js   # Navigation, drawer, and header styles
├── dashboardStyles.js    # Dashboard-specific styles
├── formStyles.js         # Form inputs, labels, and validation styles
├── listStyles.js         # List items, cards, rows, and sections
├── statusStyles.js       # Badges, indicators, and status displays
├── modalStyles.js        # Modal, overlay, and picker styles
└── utilityStyles.js      # Spacing, alignment, and utility classes
```

## Usage

### Import All Theme Modules

```javascript
import {
  colors,
  commonStyles,
  buttonStyles,
  cardStyles,
  navigationStyles,
  dashboardStyles,
} from "./src/theme";
```

### Import Specific Modules

```javascript
import { colors } from "./src/theme";
import { buttonStyles } from "./src/theme";
```

## Style Categories

### 1. **buttonStyles.js**

Button-related styles for consistent UI across the app.

**Available Styles:**

- `buttonStyles.primary` - Primary action buttons
- `buttonStyles.primaryText` - Primary button text
- `buttonStyles.success` - Success/secondary buttons
- `buttonStyles.successText` - Success button text
- `buttonStyles.quickAction` - Quick action buttons (half width)
- `buttonStyles.quickActionText` - Quick action button text
- `buttonStyles.navigation` - Navigation buttons with icons
- `buttonStyles.navigationText` - Navigation button text
- `buttonStyles.headerAction` - Small inline header buttons
- `buttonStyles.headerActionText` - Header action button text
- `buttonStyles.hamburger` - Hamburger/menu buttons

**Example:**

```javascript
<TouchableOpacity style={buttonStyles.primary}>
  <Text style={buttonStyles.primaryText}>Submit</Text>
</TouchableOpacity>
```

### 2. **cardStyles.js**

Card and container styles for consistent layouts.

**Available Styles:**

- `cardStyles.basic` - Basic card with shadow
- `cardStyles.bordered` - Card with border
- `cardStyles.elevated` - Card with more shadow
- `cardStyles.subtle` - Card with light shadow
- `cardStyles.stat` - Stat cards for dashboard
- `cardStyles.statTitle` - Stat card title text
- `cardStyles.statValue` - Stat card value text

**Example:**

```javascript
<View style={cardStyles.stat}>
  <Text style={cardStyles.statTitle}>Active Loans</Text>
  <Text style={cardStyles.statValue}>25</Text>
</View>
```

### 3. **navigationStyles.js**

Styles for headers, drawers, tabs, and navigation elements.

**Available Styles:**

- `navigationStyles.headerTitleContainer` - Header title container
- `navigationStyles.headerTitle` - Header title text
- `navigationStyles.headerSubtitle` - Header subtitle text
- `navigationStyles.headerImage` - Header image/logo
- `navigationStyles.drawerOverlay` - Drawer overlay background
- `navigationStyles.drawerContainer` - Drawer container
- `navigationStyles.drawerHeader` - Drawer header section
- `navigationStyles.drawerHeaderText` - Drawer header text
- `navigationStyles.drawerSubheader` - Drawer subheader text
- `navigationStyles.drawerContent` - Drawer content area
- `navigationStyles.drawerItem` - Drawer menu item
- `navigationStyles.drawerItemIcon` - Drawer item icon
- `navigationStyles.drawerItemText` - Drawer item text
- `navigationStyles.drawerDivider` - Drawer divider
- `navigationStyles.menuOverlay` - Menu dropdown overlay
- `navigationStyles.menuContainer` - Menu dropdown container
- `navigationStyles.menuHeader` - Menu header
- `navigationStyles.menuHeaderText` - Menu header text
- `navigationStyles.menuItem` - Menu item
- `navigationStyles.menuItemIcon` - Menu item icon
- `navigationStyles.menuItemText` - Menu item text
- `navigationStyles.menuDivider` - Menu divider

**Example:**

```javascript
<View style={navigationStyles.drawerContainer}>
  <View style={navigationStyles.drawerHeader}>
    <Text style={navigationStyles.drawerHeaderText}>Menu</Text>
  </View>
</View>
```

### 4. **dashboardStyles.js**

Dashboard/home screen specific styles.

**Available Styles:**

- `dashboardStyles.container` - Main dashboard container
- `dashboardStyles.scrollContent` - Scroll view content
- `dashboardStyles.quickActionsRow` - Quick actions row
- `dashboardStyles.navButtonsRow` - Navigation buttons row
- `dashboardStyles.menuGrid` - Menu grid layout
- `dashboardStyles.menuButton` - Menu button
- `dashboardStyles.menuButtonText` - Menu button text
- `dashboardStyles.summarySection` - Summary section container
- `dashboardStyles.sectionTitle` - Section title text
- `dashboardStyles.outstandingSection` - Outstanding section
- `dashboardStyles.outstandingCard` - Outstanding card
- `dashboardStyles.outstandingLabel` - Outstanding label
- `dashboardStyles.outstandingValue` - Outstanding value
- `dashboardStyles.outstandingHint` - Outstanding hint text
- `dashboardStyles.statsLoading` - Stats loading container
- `dashboardStyles.statsGrid` - Stats grid container
- `dashboardStyles.attentionBadge` - Attention badge
- `dashboardStyles.attentionText` - Attention badge text
- `dashboardStyles.placeholderContainer` - Empty state container
- `dashboardStyles.placeholderTitle` - Empty state title
- `dashboardStyles.placeholderSubtitle` - Empty state subtitle

**Example:**

```javascript
<View style={dashboardStyles.summarySection}>
  <Text style={dashboardStyles.sectionTitle}>Summary</Text>
  {/* content */}
</View>
```

### 5. **commonStyles.js**

Common styles used throughout the app, plus legacy exports.

**Available Styles:**

- Container styles: `container`, `scrollContent`, `centerContent`
- Text styles: `heading`, `subheading`, `body`, `bodySecondary`, `caption`
- Section styles: `section`, `sectionTitle`
- Loading: `loadingContainer`
- Divider: `divider`
- Badge: `badge`, `badgeText`
- Overlay: `overlay`
- Shadow: `shadow`, `shadowLight`
- Layout helpers: `layoutStyles.row`, `layoutStyles.rowBetween`, `layoutStyles.rowCenter`, `layoutStyles.column`

**Legacy button/card styles** are still available for backward compatibility:

- `commonStyles.primaryButton`, `primaryButtonText`
- `commonStyles.secondaryButton`
- `commonStyles.card`, `cardWithBorder`

### 6. **colors.js**

Color palette for the entire application.

**Available Colors:**

- Primary: `colors.primary`, `primaryDark`, `primaryLight`
- Background: `colors.background`, `surface`, `surfaceSecondary`
- Text: `colors.textPrimary`, `textSecondary`, `textTertiary`, `textLight`
- Border: `colors.border`, `borderDark`
- Status: `colors.success`, `successLight`, `warning`, `warningLight`, `error`, `errorLight`, `info`, `infoLight`
- Shadow: `colors.shadow`, `shadowLight`

## Migration Guide

### For Existing Components

If you have inline styles in your components, follow these steps:

1. **Identify style categories**: Group your styles by type (buttons, cards, navigation, etc.)

2. **Check existing theme files**: Look for matching styles in the theme files

3. **Use existing styles**: If a matching style exists, use it directly

4. **Add new styles**: If needed, add new styles to the appropriate theme file

5. **Import and replace**: Update your imports and replace inline styles

### Example Migration

**Before:**

```javascript
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#2196F3",
    padding: 16,
    borderRadius: 12,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});

// Usage
<TouchableOpacity style={styles.button}>
  <Text style={styles.buttonText}>Click Me</Text>
</TouchableOpacity>;
```

**After:**

```javascript
import { buttonStyles } from "./src/theme";

// Usage
<TouchableOpacity style={buttonStyles.primary}>
  <Text style={buttonStyles.primaryText}>Click Me</Text>
</TouchableOpacity>;
```

## Benefits

1. **Consistency**: All components use the same style definitions
2. **Maintainability**: Styles are organized and easy to find
3. **Reusability**: No duplicate style definitions
4. **Discoverability**: Clear categorization makes it easy to find what you need
5. **Scalability**: Easy to add new styles in the right place
6. **Type Safety**: Can add TypeScript definitions in the future
7. **Theme Support**: Easier to implement dark mode or theme switching

## Best Practices

1. **Use existing styles first**: Always check if a suitable style exists before creating inline styles
2. **Keep styles organized**: Add new styles to the appropriate category file
3. **Avoid inline styles**: Prefer theme styles over inline StyleSheet.create()
4. **Use style composition**: Combine theme styles with inline style objects when needed
5. **Document new styles**: Add comments to explain complex or specific styles
6. **Follow naming conventions**: Use descriptive names that indicate purpose

## Future Enhancements

- Add TypeScript type definitions for all style objects
- Implement dark mode support
- Create responsive breakpoint utilities
- Add animation/transition presets
- Create form-specific styles module
- Add accessibility-focused style variants
