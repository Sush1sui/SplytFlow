import { StyleSheet, useWindowDimensions } from "react-native";

export function useAuthStyles() {
  const { width } = useWindowDimensions();

  const isTablet = width >= 768;
  const isLargePhone = width >= 414;

  const hPad = isTablet ? 48 : 24;
  const titleSize = isTablet ? 40 : isLargePhone ? 36 : 30;
  const subtitleSize = isTablet ? 17 : 15;
  const logoSize = isTablet ? 88 : 72;
  const logoRadius = isTablet ? 28 : 22;

  return StyleSheet.create({
    container: {
      flex: 1,
    },
    inner: {
      flex: 1,
      width: "100%",
      alignItems: "center",
      maxWidth: isTablet ? 560 : undefined,
      alignSelf: "center",
    },
    scrollContent: {
      alignItems: "center",
      width: "100%",
      paddingHorizontal: hPad,
      paddingTop: 32,
      paddingBottom: 24,
    },
    header: {
      alignItems: "center",
      marginTop: isTablet ? 48 : 32,
      marginBottom: 12,
    },
    logoCircle: {
      width: logoSize,
      height: logoSize,
      borderRadius: logoRadius,
      marginBottom: 20,
      alignItems: "center",
      justifyContent: "center",
    },
    title: {
      marginBottom: 8,
      fontSize: titleSize,
      fontWeight: "700",
      textAlign: "center",
      letterSpacing: -0.5,
    },
    subtitle: {
      fontSize: subtitleSize,
      textAlign: "center",
      opacity: 0.65,
      lineHeight: subtitleSize * 1.55,
      maxWidth: 300,
    },
    cardContent: {
      marginTop: 4,
    },
    nameRow: {
      flexDirection: isLargePhone ? "row" : "column",
      gap: isLargePhone ? 12 : 0,
    },
    nameField: {
      flex: isLargePhone ? 1 : undefined,
    },
    footer: {
      marginTop: 24,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 6,
      paddingBottom: 40,
    },
    footerText: {
      fontSize: 14,
      opacity: 0.7,
    },
    link: {
      fontSize: 14,
      fontWeight: "600",
    },
    forgotPassword: {
      alignSelf: "flex-start",
      marginBottom: 24,
    },
    divider: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical: 24,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      opacity: 0.2,
    },
    dividerText: {
      marginHorizontal: 16,
      fontSize: 14,
      opacity: 0.5,
    },
  });
}
