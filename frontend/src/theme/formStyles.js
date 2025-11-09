import { StyleSheet } from "react-native";
import { colors } from "./colors";

/**
 * Form Styles
 * Reusable form input and label styles for consistent form UI
 */
export const formStyles = StyleSheet.create({
  // Form container
  form: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },

  formSection: {
    marginBottom: 20,
  },

  // Labels
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 8,
    marginTop: 15,
  },

  labelSmall: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 6,
  },

  required: {
    color: colors.error,
  },

  hint: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    fontStyle: "italic",
  },

  // Text inputs
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    color: colors.textPrimary,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },

  inputFocused: {
    borderColor: colors.primary,
    borderWidth: 2,
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },

  inputError: {
    borderColor: colors.error,
    borderWidth: 2,
    shadowOpacity: 0.1,
  },

  inputDisabled: {
    backgroundColor: colors.surfaceSecondary,
    color: colors.textSecondary,
  },

  textArea: {
    height: 80,
    textAlignVertical: "top",
    paddingTop: 12,
  },

  // Search input
  searchInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    color: colors.textPrimary,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },

  searchSection: {
    padding: 15,
    paddingBottom: 10,
    backgroundColor: colors.background,
  },

  // Picker/Dropdown
  pickerContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
    overflow: "hidden",
  },

  pickerContainerError: {
    borderColor: colors.error,
    borderWidth: 2,
  },

  // Photo upload
  photoButton: {
    alignItems: "center",
    marginBottom: 10,
  },

  photoPreview: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: colors.primary,
  },

  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: colors.borderDark,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
  },

  photoPlaceholderText: {
    fontSize: 40,
    color: colors.textSecondary,
  },

  photoPlaceholderSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 5,
  },

  // Submit/Cancel buttons
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    marginTop: 25,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },

  submitButtonDisabled: {
    backgroundColor: colors.textSecondary,
  },

  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },

  cancelButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    marginTop: 10,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },

  cancelButtonText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: "600",
  },

  // Error message
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: 4,
  },

  successText: {
    color: colors.success,
    fontSize: 12,
    marginTop: 4,
  },
});
