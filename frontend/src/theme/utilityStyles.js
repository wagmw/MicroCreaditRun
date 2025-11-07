import { StyleSheet } from "react-native";
import { colors } from "./colors";

/**
 * Utility Styles
 * Common utility classes for spacing, alignment, and display
 */
export const utilityStyles = StyleSheet.create({
  // Flex utilities
  flex1: {
    flex: 1,
  },

  flexGrow: {
    flexGrow: 1,
  },

  flexShrink: {
    flexShrink: 1,
  },

  // Direction
  row: {
    flexDirection: "row",
  },

  column: {
    flexDirection: "column",
  },

  // Justify content
  justifyStart: {
    justifyContent: "flex-start",
  },

  justifyCenter: {
    justifyContent: "center",
  },

  justifyEnd: {
    justifyContent: "flex-end",
  },

  justifyBetween: {
    justifyContent: "space-between",
  },

  justifyAround: {
    justifyContent: "space-around",
  },

  // Align items
  alignStart: {
    alignItems: "flex-start",
  },

  alignCenter: {
    alignItems: "center",
  },

  alignEnd: {
    alignItems: "flex-end",
  },

  alignStretch: {
    alignItems: "stretch",
  },

  // Align self
  selfStart: {
    alignSelf: "flex-start",
  },

  selfCenter: {
    alignSelf: "center",
  },

  selfEnd: {
    alignSelf: "flex-end",
  },

  // Center (both axes)
  center: {
    justifyContent: "center",
    alignItems: "center",
  },

  // Margins
  m0: { margin: 0 },
  m4: { margin: 4 },
  m8: { margin: 8 },
  m12: { margin: 12 },
  m16: { margin: 16 },
  m20: { margin: 20 },
  m24: { margin: 24 },

  mt0: { marginTop: 0 },
  mt4: { marginTop: 4 },
  mt8: { marginTop: 8 },
  mt12: { marginTop: 12 },
  mt16: { marginTop: 16 },
  mt20: { marginTop: 20 },
  mt24: { marginTop: 24 },

  mb0: { marginBottom: 0 },
  mb4: { marginBottom: 4 },
  mb8: { marginBottom: 8 },
  mb12: { marginBottom: 12 },
  mb16: { marginBottom: 16 },
  mb20: { marginBottom: 20 },
  mb24: { marginBottom: 24 },

  ml0: { marginLeft: 0 },
  ml4: { marginLeft: 4 },
  ml8: { marginLeft: 8 },
  ml12: { marginLeft: 12 },
  ml16: { marginLeft: 16 },
  ml20: { marginLeft: 20 },

  mr0: { marginRight: 0 },
  mr4: { marginRight: 4 },
  mr8: { marginRight: 8 },
  mr12: { marginRight: 12 },
  mr16: { marginRight: 16 },
  mr20: { marginRight: 20 },

  mx8: { marginHorizontal: 8 },
  mx12: { marginHorizontal: 12 },
  mx16: { marginHorizontal: 16 },
  mx20: { marginHorizontal: 20 },

  my8: { marginVertical: 8 },
  my12: { marginVertical: 12 },
  my16: { marginVertical: 16 },
  my20: { marginVertical: 20 },

  // Padding
  p0: { padding: 0 },
  p4: { padding: 4 },
  p8: { padding: 8 },
  p12: { padding: 12 },
  p16: { padding: 16 },
  p20: { padding: 20 },
  p24: { padding: 24 },

  pt0: { paddingTop: 0 },
  pt4: { paddingTop: 4 },
  pt8: { paddingTop: 8 },
  pt12: { paddingTop: 12 },
  pt16: { paddingTop: 16 },
  pt20: { paddingTop: 20 },

  pb0: { paddingBottom: 0 },
  pb4: { paddingBottom: 4 },
  pb8: { paddingBottom: 8 },
  pb12: { paddingBottom: 12 },
  pb16: { paddingBottom: 16 },
  pb20: { paddingBottom: 20 },

  pl0: { paddingLeft: 0 },
  pl8: { paddingLeft: 8 },
  pl12: { paddingLeft: 12 },
  pl16: { paddingLeft: 16 },

  pr0: { paddingRight: 0 },
  pr8: { paddingRight: 8 },
  pr12: { paddingRight: 12 },
  pr16: { paddingRight: 16 },

  px8: { paddingHorizontal: 8 },
  px12: { paddingHorizontal: 12 },
  px16: { paddingHorizontal: 16 },
  px20: { paddingHorizontal: 20 },

  py8: { paddingVertical: 8 },
  py12: { paddingVertical: 12 },
  py16: { paddingVertical: 16 },
  py20: { paddingVertical: 20 },

  // Width/Height
  fullWidth: {
    width: "100%",
  },

  fullHeight: {
    height: "100%",
  },

  halfWidth: {
    width: "50%",
  },

  // Text alignment
  textLeft: {
    textAlign: "left",
  },

  textCenter: {
    textAlign: "center",
  },

  textRight: {
    textAlign: "right",
  },

  // Font weights
  fontNormal: {
    fontWeight: "400",
  },

  fontMedium: {
    fontWeight: "500",
  },

  fontSemibold: {
    fontWeight: "600",
  },

  fontBold: {
    fontWeight: "700",
  },

  // Background colors
  bgPrimary: {
    backgroundColor: colors.primary,
  },

  bgSuccess: {
    backgroundColor: colors.success,
  },

  bgWarning: {
    backgroundColor: colors.warning,
  },

  bgError: {
    backgroundColor: colors.error,
  },

  bgInfo: {
    backgroundColor: colors.info,
  },

  bgWhite: {
    backgroundColor: "#FFFFFF",
  },

  bgBackground: {
    backgroundColor: colors.background,
  },

  // Borders
  border: {
    borderWidth: 1,
    borderColor: colors.border,
  },

  borderTop: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  borderLeft: {
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
  },

  borderRight: {
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },

  // Border radius
  rounded: {
    borderRadius: 8,
  },

  roundedLg: {
    borderRadius: 12,
  },

  roundedFull: {
    borderRadius: 9999,
  },

  // Opacity
  opacity50: {
    opacity: 0.5,
  },

  opacity75: {
    opacity: 0.75,
  },

  // Overflow
  overflowHidden: {
    overflow: "hidden",
  },

  overflowVisible: {
    overflow: "visible",
  },

  // Position
  absolute: {
    position: "absolute",
  },

  relative: {
    position: "relative",
  },

  // Display
  hidden: {
    display: "none",
  },

  // Loading/Center container
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
});
