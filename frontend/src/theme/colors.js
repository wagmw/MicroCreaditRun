import { useColorScheme } from "react-native";

// App color theme - Modern lending app design
const lightColors = {
  // Primary brand colors
  primary: "#F5B400", // Vibrant golden yellow (main actions, highlights)
  primaryDark: "#D69E00", // Darker yellow for pressed states
  primaryLight: "#FFCB3D", // Lighter yellow for hover states

  // Background colors
  background: "#F8F9FA", // Light grey background
  surface: "#FFFFFF", // White cards and surfaces
  surfaceSecondary: "#F5F6F7", // Secondary surface (subtle)

  // Text colors
  textPrimary: "#1A1D1F", // Almost black for headings
  textSecondary: "#6F767E", // Medium grey for secondary text
  textTertiary: "#9A9FA5", // Light grey for tertiary text
  textLight: "#FFFFFF", // White text on dark backgrounds

  // Border colors
  border: "#E8EAED", // Light grey border
  borderDark: "#D1D5DB", // Darker border for emphasis

  // Status colors
  success: "#10B981", // Green for active/success states
  successLight: "#D1FAE5", // Light green background
  warning: "#F59E0B", // Orange for warnings/attention
  warningLight: "#FEF3C7", // Light orange background
  error: "#EF4444", // Red for errors/danger
  errorLight: "#FEE2E2", // Light red background
  info: "#3B82F6", // Blue for informational states
  infoLight: "#DBEAFE", // Light blue background

  // Shadow
  shadow: "#1A1D1F", // Dark shadow color
  shadowLight: "rgba(26, 29, 31, 0.04)", // Very light shadow
};

// Use the same colors for both light and dark mode
export const colors = lightColors;
