import { StyleSheet } from "react-native";
import { colors } from "./colors";

/**
 * List Styles
 * Reusable list, card, and row styles for consistent list UI
 */
export const listStyles = StyleSheet.create({
  // List containers
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  listContainer: {
    padding: 12,
    paddingTop: 0,
  },

  listContent: {
    padding: 12,
  },

  // Cards
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 10,
    elevation: 1,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    overflow: "hidden",
  },

  cardLarge: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },

  // Card sections
  cardHeader: {
    backgroundColor: "#F8F9FA",
    paddingVertical: 8,
    paddingHorizontal: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.06)",
  },

  cardHeaderLight: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  cardContent: {
    padding: 10,
  },

  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: 12,
    backgroundColor: colors.background,
  },

  // Rows
  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  rowStart: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "flex-start",
  },

  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 6,
  },

  // Detail labels and values
  detailLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: "500",
  },

  detailValue: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: "600",
  },

  detailValueLarge: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: "700",
  },

  // Section headers
  sectionHeader: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  sectionHeaderText: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 4,
  },

  sectionHeaderSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
  },

  // Separator
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 8,
  },

  separatorThick: {
    height: 2,
    backgroundColor: colors.border,
    marginVertical: 12,
  },

  // Empty state
  emptyContainer: {
    padding: 40,
    alignItems: "center",
  },

  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
  },

  emptyIcon: {
    fontSize: 48,
    color: colors.textTertiary,
    marginBottom: 12,
  },

  // Customer-specific
  customerName: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textPrimary,
    flex: 1,
    marginRight: 8,
  },

  customerInfo: {
    flex: 1,
  },

  customerPhone: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: "600",
  },

  customerAddress: {
    fontSize: 12,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 16,
  },

  customerPhotoContainer: {
    flexShrink: 0,
    marginRight: 10,
  },

  customerPhoto: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: colors.primary,
  },

  customerPhotoPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.primaryDark,
  },

  customerInitials: {
    color: colors.textLight,
    fontSize: 18,
    fontWeight: "700",
  },

  // Icons
  icon: {
    fontSize: 12,
    color: colors.textSecondary,
    marginRight: 4,
  },

  iconLarge: {
    fontSize: 16,
    color: colors.textSecondary,
    marginRight: 6,
  },

  // Phone/Contact
  phoneContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 6,
  },

  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(75, 175, 80, 0.08)",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 5,
  },

  phoneNumberButton: {
    paddingVertical: 1,
  },

  phoneIcon: {
    fontSize: 12,
    marginRight: 3,
  },

  locationIcon: {
    fontSize: 14,
    marginRight: 5,
    marginTop: 1,
    color: "#2196F3",
  },

  addressRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  detailsRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
});
