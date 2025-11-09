import { StyleSheet } from "react-native";
import { colors } from "./colors";

/**
 * Card Styles
 * Reusable card and container styles for consistent UI
 */
export const cardStyles = StyleSheet.create({
  // Basic card
  basic: {
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

  // Card with border
  bordered: {
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

  // Elevated card (more shadow)
  elevated: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    elevation: 0,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    marginBottom: 12,
    borderWidth: 0,
  },

  // Subtle card (light shadow)
  subtle: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    elevation: 0,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    borderWidth: 0,
  },

  // Stat card (for dashboard statistics)
  stat: {
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 16,
    flex: 1,
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  statTitle: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: "600",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  statValue: {
    fontSize: 20,
    color: colors.textPrimary,
    fontWeight: "700",
  },
});
