import { StyleSheet } from "react-native";

export default function useOTPStyles(isTablet: boolean, textColor: string) {
  const otpStyles = StyleSheet.create({
    otpContainer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 24,
    },
    digitInput: {
      borderWidth: 2,
      borderRadius: 12,
      overflow: "hidden",
    },
    resendContainer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginTop: 20,
      gap: 6,
    },
    resendText: {
      fontSize: 14,
      opacity: 0.7,
    },
    resendLink: {
      fontSize: 14,
      fontWeight: "600",
    },
    backButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
  });

  return otpStyles;
}
