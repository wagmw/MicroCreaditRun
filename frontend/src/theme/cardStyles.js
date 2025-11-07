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
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 12,
  },

  // Card with border
  bordered: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#4A4A4A",
  },

  // Elevated card (more shadow)
  elevated: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    elevation: 3,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    marginBottom: 12,
  },

  // Subtle card (light shadow)
  subtle: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    elevation: 1,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },

  // Stat card (for dashboard statistics)
  stat: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    flex: 1,
    elevation: 1,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },

  statTitle: {
    fontSize: 12,
    color: colors.textTertiary,
    fontWeight: "500",
    marginBottom: 6,
    letterSpacing: 0.2,
  },

  statValue: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.textPrimary,
    lineHeight: 32,
  },
});
