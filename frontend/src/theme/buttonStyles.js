import { StyleSheet } from "react-native";
import { colors } from "./colors";

/**
 * Button Styles
 * Reusable button styles for consistent UI across the app
 */
export const buttonStyles = StyleSheet.create({
  // Primary action buttons
  primary: {
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
    borderWidth: 2,
    borderColor: "#4A4A4A",
  },

  primaryText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textLight,
  },

  // Success/secondary buttons
  success: {
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
    borderWidth: 2,
    borderColor: "#4A4A4A",
  },

  successText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textLight,
  },

  // Quick action button (one-third width)
  quickAction: {
    backgroundColor: colors.success,
    borderRadius: 10,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },

  quickActionText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.textLight,
  },

  // Navigation button (icon + text)
  navigation: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingVertical: 18,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },

  navigationText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textPrimary,
    marginTop: 6,
    textAlign: "center",
  },

  // Smaller navigation button for 4-column layout
  navigationSmall: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 6,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },

  navigationTextSmall: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.textPrimary,
    marginTop: 5,
    textAlign: "center",
  },

  // Header action button (small, inline)
  headerAction: {
    marginRight: 15,
    backgroundColor: "#FFFFFF",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
  },

  headerActionText: {
    color: "#2196F3",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
  },

  // Hamburger/Menu button
  hamburger: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    justifyContent: "center",
    alignItems: "center",
  },

  // Action button (small inline buttons in cards)
  action: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 6,
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    alignItems: "center",
    justifyContent: "center",
  },

  actionText: {
    fontSize: 12,
    fontWeight: "700",
  },
});
