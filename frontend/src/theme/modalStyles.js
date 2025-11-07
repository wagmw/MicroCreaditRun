import { StyleSheet } from "react-native";
import { colors } from "./colors";

/**
 * Modal and Overlay Styles
 * Styles for modals, pickers, and overlay components
 */
export const modalStyles = StyleSheet.create({
  // Modal overlay
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  overlayDark: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },

  // Modal container
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    width: "90%",
    maxWidth: 400,
    elevation: 5,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },

  containerLarge: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 24,
    width: "95%",
    maxHeight: "80%",
    elevation: 5,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },

  // Modal header
  header: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.textPrimary,
    marginBottom: 4,
  },

  headerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },

  // Modal content
  content: {
    marginBottom: 20,
  },

  contentScrollable: {
    maxHeight: 400,
  },

  // Modal footer (buttons)
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 8,
  },

  footerColumn: {
    flexDirection: "column",
    gap: 10,
    marginTop: 8,
  },

  // Close button (X)
  closeButton: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
  },

  closeButtonIcon: {
    fontSize: 20,
    color: colors.textSecondary,
  },

  // Action buttons in modal
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#4A4A4A",
  },

  secondaryButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.border,
  },

  dangerButton: {
    backgroundColor: colors.error,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#4A4A4A",
  },

  primaryButtonText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },

  secondaryButtonText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },

  dangerButtonText: {
    color: colors.textLight,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },

  // Picker modal specific
  pickerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },

  pickerContainer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    maxHeight: "70%",
  },

  pickerHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  pickerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textPrimary,
  },

  pickerDoneButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },

  pickerDoneText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "600",
  },

  // Picker item
  pickerItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  pickerItemSelected: {
    backgroundColor: colors.primaryLight,
  },

  pickerItemText: {
    fontSize: 16,
    color: colors.textPrimary,
  },

  pickerItemTextSelected: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: "600",
  },

  // Bottom sheet style
  bottomSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },

  bottomSheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },

  // Loading overlay
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },

  loadingContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    minWidth: 120,
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.textSecondary,
  },
});
