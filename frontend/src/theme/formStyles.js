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
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.textPrimary,
  },

  inputFocused: {
    borderColor: colors.primary,
    borderWidth: 2,
  },

  inputError: {
    borderColor: colors.error,
    borderWidth: 2,
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
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.textPrimary,
  },

  searchSection: {
    padding: 15,
    paddingBottom: 10,
    backgroundColor: colors.background,
  },

  // Picker/Dropdown
  pickerContainer: {
    backgroundColor: colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
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
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.border,
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
    borderWidth: 2,
    borderColor: "#4A4A4A",
  },

  submitButtonDisabled: {
    backgroundColor: colors.textSecondary,
  },

  submitButtonText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: "600",
  },

  cancelButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    marginTop: 10,
    borderWidth: 2,
    borderColor: "#4A4A4A",
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
