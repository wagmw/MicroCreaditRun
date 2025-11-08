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
    borderRadius: 16,
    padding: 16,
    elevation: 1,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    marginBottom: 12,
  },

  // Card with border
  bordered: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    elevation: 1,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    marginBottom: 12,
  },

  // Elevated card (more shadow)
  elevated: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    marginBottom: 12,
  },

  // Subtle card (light shadow)
  subtle: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
    elevation: 1,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
  },

  // Stat card (for dashboard statistics)
  stat: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    flex: 1,
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.08)",
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
