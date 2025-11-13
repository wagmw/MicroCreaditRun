import { StyleSheet } from "react-native";
import { colors } from "./colors";

/**
 * Navigation Styles
 * Styles for headers, drawers, tabs, and navigation elements
 */
export const navigationStyles = StyleSheet.create({
  // Header styles
  headerTitleContainer: {
    flexDirection: "column",
    alignItems: "center",
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.textLight,
  },

  headerSubtitle: {
    fontSize: 12,
    color: colors.textLight,
    opacity: 0.9,
    marginTop: 2,
  },

  headerImage: {
    width: 160,
    height: 50,
  },

  // Drawer/Side menu overlay
  drawerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-start",
  },

  drawerContainer: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 280,
    backgroundColor: "#FFFFFF",
    shadowColor: colors.shadow,
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },

  drawerHeader: {
    backgroundColor: colors.primary,
    padding: 24,
    paddingTop: 50,
  },

  drawerHeaderText: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.textLight,
    marginBottom: 4,
  },

  drawerSubheader: {
    fontSize: 14,
    color: colors.textLight,
    opacity: 0.9,
  },

  drawerContent: {
    flex: 1,
  },

  drawerItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  drawerItemIcon: {
    marginRight: 16,
    width: 30,
  },

  drawerItemText: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: "500",
  },

  drawerDivider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 12,
    marginHorizontal: 16,
  },

  // Menu overlay (dropdown style)
  menuOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
  },

  menuContainer: {
    backgroundColor: "#FFFFFF",
    marginTop: 60,
    marginRight: 10,
    borderRadius: 12,
    minWidth: 250,
    maxWidth: 300,
    maxHeight: 500,
    elevation: 5,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },

  menuHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: colors.primary,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },

  menuTitle: {
    fontSize: 18,
    color: colors.textLight,
    fontWeight: "700",
  },

  menuHeaderText: {
    fontSize: 14,
    color: colors.textLight,
    fontWeight: "600",
  },

  menuList: {
    maxHeight: 400,
  },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 12,
  },

  menuItemIcon: {
    fontSize: 20,
    marginRight: 12,
  },

  menuItemText: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: "500",
  },

  menuDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 4,
    marginHorizontal: 12,
  },

  // Tab header
  tabHeader: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    paddingTop: 24,
    alignItems: "center",
  },

  tabHeaderTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.textLight,
  },
});
