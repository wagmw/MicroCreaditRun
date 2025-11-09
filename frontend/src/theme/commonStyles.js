import { StyleSheet } from "react-native";
import { colors } from "./colors";
import { buttonStyles } from "./buttonStyles";
import { cardStyles } from "./cardStyles";
import { navigationStyles } from "./navigationStyles";
import { dashboardStyles } from "./dashboardStyles";
import { formStyles } from "./formStyles";
import { listStyles } from "./listStyles";
import { statusStyles } from "./statusStyles";
import { modalStyles } from "./modalStyles";
import { utilityStyles } from "./utilityStyles";

/**
 * Common Styles
 * Central export point for all theme styles
 * Import this file to access all style categories
 */

// Core common styles
export const commonStyles = StyleSheet.create({
  // Container styles
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 20,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  // Button styles (legacy - prefer buttonStyles)
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textLight,
  },
  secondaryButton: {
    backgroundColor: colors.success,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },

  // Card styles (legacy - prefer cardStyles)
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 12,
  },
  cardWithBorder: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    elevation: 0,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    marginBottom: 12,
    borderWidth: 0,
  },

  // Text styles
  heading: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 8,
  },
  subheading: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 8,
  },
  body: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  bodySecondary: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  caption: {
    fontSize: 12,
    color: colors.textTertiary,
  },

  // Section styles
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 12,
  },

  // Loading styles
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },

  // Badge styles
  badge: {
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: "flex-start",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textLight,
  },

  // Modal/Drawer overlay
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },

  // Shadow elevation styles
  shadow: {
    elevation: 3,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  shadowLight: {
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
});

// Reusable layout styles
export const layoutStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rowCenter: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  column: {
    flexDirection: "column",
  },
});

// Re-export all style modules for convenience
export {
  buttonStyles,
  cardStyles,
  navigationStyles,
  dashboardStyles,
  formStyles,
  listStyles,
  statusStyles,
  modalStyles,
  utilityStyles,
};
