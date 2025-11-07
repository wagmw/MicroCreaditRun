import { StyleSheet } from "react-native";
import { colors } from "./colors";

/**
 * Dashboard Styles
 * Styles specific to the dashboard/home screen
 */
export const dashboardStyles = StyleSheet.create({
  // Main container
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },

  scrollContent: {
    padding: 16,
  },

  // Quick actions section
  quickActionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },

  // Navigation buttons
  navButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  // Menu grid (for menu buttons)
  menuGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 30,
    marginTop: 10,
  },

  menuButton: {
    width: "31%",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    minHeight: 120,
    borderWidth: 2,
    borderColor: "#4A4A4A",
  },

  menuButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
    textAlign: "center",
  },

  // Summary section
  summarySection: {
    marginTop: 10,
    marginBottom: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 14,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    fontSize: 13,
  },

  // Outstanding section
  outstandingSection: {
    marginBottom: 20,
    backgroundColor: "#4A4A4A",
    borderRadius: 12,
    padding: 12,
    elevation: 3,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },

  outstandingCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    elevation: 1,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },

  outstandingLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "600",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  outstandingValue: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: 4,
  },

  outstandingHint: {
    fontSize: 11,
    color: colors.textSecondary,
    fontStyle: "italic",
  },

  // Stats loading
  statsLoading: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },

  // Stats grid
  statsGrid: {
    // Container for stat cards
  },

  // Attention badge (for overdue items)
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

  // Placeholder for empty states
  placeholderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
    padding: 40,
  },

  placeholderTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 8,
  },

  placeholderSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
});
