import { StyleSheet } from "react-native";
import { colors } from "./colors";

/**
 * Status Styles
 * Badge, indicator, and status-related styles
 */
export const statusStyles = StyleSheet.create({
  // Status badges
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignSelf: "flex-start",
  },

  badgeLarge: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
  },

  badgeSuccess: {
    backgroundColor: colors.success,
  },

  badgeWarning: {
    backgroundColor: colors.warning,
  },

  badgeError: {
    backgroundColor: colors.error,
  },

  badgeInfo: {
    backgroundColor: colors.info,
  },

  badgePrimary: {
    backgroundColor: colors.primary,
  },

  badgeText: {
    color: colors.textLight,
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
  },

  badgeTextLarge: {
    color: colors.textLight,
    fontSize: 12,
    fontWeight: "600",
  },

  // Status indicators (dots)
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },

  statusDotLarge: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },

  statusDotActive: {
    backgroundColor: colors.success,
  },

  statusDotWarning: {
    backgroundColor: colors.warning,
  },

  statusDotError: {
    backgroundColor: colors.error,
  },

  statusDotInfo: {
    backgroundColor: colors.info,
  },

  // Status text (without badge)
  statusText: {
    fontSize: 13,
    fontWeight: "600",
  },

  statusTextActive: {
    color: colors.success,
  },

  statusTextWarning: {
    color: colors.warning,
  },

  statusTextError: {
    color: colors.error,
  },

  statusTextInfo: {
    color: colors.info,
  },

  statusTextPrimary: {
    color: colors.primary,
  },

  // Progress indicators
  progressBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    backgroundColor: colors.success,
    borderRadius: 4,
  },

  progressBarLarge: {
    height: 12,
    backgroundColor: colors.border,
    borderRadius: 6,
    overflow: "hidden",
  },

  progressFillLarge: {
    height: "100%",
    backgroundColor: colors.success,
    borderRadius: 6,
  },

  // Checkmark/Selection indicator
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.success,
    justifyContent: "center",
    alignItems: "center",
  },

  checkmarkUnchecked: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
  },

  // Amount displays with colors
  amountPositive: {
    color: colors.success,
    fontWeight: "700",
  },

  amountNegative: {
    color: colors.error,
    fontWeight: "700",
  },

  amountNeutral: {
    color: colors.textPrimary,
    fontWeight: "700",
  },

  // Attention/Alert badges
  attentionBadge: {
    backgroundColor: colors.warning,
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 14,
    alignSelf: "flex-start",
    marginTop: 8,
  },

  attentionText: {
    color: colors.textLight,
    fontSize: 12,
    fontWeight: "600",
  },

  // Loan-specific status
  loanAmount: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.textPrimary,
  },

  loanId: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.primary,
    marginBottom: 4,
  },

  // Outstanding balance indicators
  outstandingHigh: {
    color: colors.error,
    fontSize: 16,
    fontWeight: "700",
  },

  outstandingMedium: {
    color: colors.warning,
    fontSize: 16,
    fontWeight: "700",
  },

  outstandingLow: {
    color: colors.success,
    fontSize: 16,
    fontWeight: "700",
  },
});
