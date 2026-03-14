import { StyleSheet } from "react-native";

export default function useSalesStyles() {
  return StyleSheet.create({
    scroll: {
      paddingBottom: 32,
    },
    header: {
      marginBottom: 28,
    },
    logoCircle: {
      width: 48,
      height: 48,
      borderRadius: 14,
    },
    summaryRow: {
      flexDirection: "row",
      gap: 12,
      marginBottom: 28,
    },
    summaryCard: {
      flex: 1,
      padding: 16,
      gap: 6,
    },
    summaryIconWrap: {
      width: 34,
      height: 34,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
    },
    summaryValue: {
      fontSize: 22,
      fontWeight: "700",
    },
    summaryLabel: {
      fontSize: 12,
    },
    saleItem: {
      flexDirection: "row",
      alignItems: "center",
    },
    saleIcon: {
      width: 36,
      height: 36,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    saleInfo: {
      flex: 1,
    },
    saleName: {
      fontSize: 14,
      fontWeight: "500",
    },
    saleDate: {
      fontSize: 12,
      marginTop: 2,
    },
    saleAmount: {
      fontSize: 15,
      fontWeight: "600",
    },
  });
}
