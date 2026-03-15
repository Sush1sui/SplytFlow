import { StyleSheet } from "react-native";

export default function useSplitRulesStyles() {
  return StyleSheet.create({
    scroll: {
      paddingBottom: 32,
      gap: 16,
    },
    headerWrap: {
      marginBottom: 4,
    },
    headerRow: {
      alignItems: "center",
    },
    logoCircle: {
      width: 46,
      height: 46,
      borderRadius: 13,
      marginRight: 12,
    },
    headerTextWrap: {
      flex: 1,
    },
    subtitle: {
      marginTop: 2,
      fontSize: 13,
      opacity: 0.78,
    },
    summaryCard: {
      gap: 12,
    },
    summaryGrid: {
      flexDirection: "row",
      gap: 10,
    },
    summaryBox: {
      flex: 1,
      borderRadius: 12,
      borderWidth: 1,
      paddingVertical: 10,
      paddingHorizontal: 12,
    },
    summaryLabel: {
      fontSize: 12,
      fontWeight: "600",
      marginBottom: 5,
      opacity: 0.78,
    },
    summaryValue: {
      fontSize: 20,
      fontWeight: "700",
    },
    summaryHint: {
      fontSize: 12,
      opacity: 0.72,
    },
    formCard: {
      gap: 6,
    },
    formTitle: {
      fontSize: 15,
      fontWeight: "700",
      marginBottom: 2,
    },
    actionsRow: {
      flexDirection: "row",
      gap: 10,
      marginTop: 2,
    },
    feedbackCard: {
      borderWidth: 1,
      borderRadius: 10,
      paddingVertical: 10,
      paddingHorizontal: 12,
      marginTop: 8,
    },
    feedbackText: {
      fontSize: 13,
      lineHeight: 19,
      fontWeight: "500",
    },
    listCard: {
      gap: 8,
    },
    correctionEntryCard: {
      gap: 10,
    },
    listHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8,
    },
    listTitle: {
      fontSize: 15,
      fontWeight: "700",
    },
    emptyWrap: {
      paddingVertical: 8,
    },
    emptyText: {
      fontSize: 13,
      opacity: 0.74,
    },
    ruleRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
      paddingVertical: 3,
    },
    ruleName: {
      fontSize: 15,
      fontWeight: "600",
      marginBottom: 2,
    },
    ruleValue: {
      fontSize: 13,
      opacity: 0.76,
    },
    ruleLeft: {
      flex: 1,
    },
    ruleRight: {
      flexDirection: "row",
      gap: 8,
      alignItems: "center",
    },
    actionChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      borderWidth: 1,
      borderRadius: 999,
      paddingVertical: 5,
      paddingHorizontal: 10,
    },
    actionText: {
      fontSize: 12,
      fontWeight: "600",
    },
    deleteAllChip: {
      borderColor: "rgba(239,68,68,0.38)",
      backgroundColor: "rgba(239,68,68,0.1)",
    },
    correctionCard: {
      gap: 8,
    },
    correctionHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8,
      marginBottom: 2,
    },
    manageLabelLike: {
      fontSize: 14,
      fontWeight: "600",
      marginBottom: 8,
      opacity: 0.8,
    },
    correctionDateSection: {
      gap: 8,
    },
    correctionDateHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8,
    },
    correctionDateButton: {
      minHeight: 52,
      borderRadius: 12,
      borderWidth: 1,
      paddingHorizontal: 14,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
    },
    correctionDateText: {
      fontSize: 15,
      fontWeight: "600",
      flex: 1,
    },
    correctionWindowCard: {
      borderWidth: 1,
      borderRadius: 10,
      paddingVertical: 10,
      paddingHorizontal: 12,
      gap: 4,
    },
    correctionWindowTitle: {
      fontSize: 12,
      fontWeight: "700",
      opacity: 0.82,
    },
    correctionWindowText: {
      fontSize: 13,
      lineHeight: 19,
      fontWeight: "500",
    },
    correctionRowsWrap: {
      gap: 8,
      marginTop: 4,
    },
    correctionRowsHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8,
    },
    correctionRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 8,
    },
    correctionNameCol: {
      flex: 1,
    },
    correctionValueCol: {
      width: 112,
    },
    correctionDeleteButton: {
      marginTop: 36,
      borderWidth: 1,
      borderColor: "rgba(239,68,68,0.38)",
      backgroundColor: "rgba(239,68,68,0.1)",
      borderRadius: 999,
      width: 32,
      height: 32,
      alignItems: "center",
      justifyContent: "center",
    },
    correctionSummaryRow: {
      marginTop: 2,
      marginBottom: 2,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    historyCard: {
      gap: 8,
      marginBottom: 12,
    },
    historyItem: {
      borderWidth: 1,
      borderColor: "rgba(148,163,184,0.22)",
      borderRadius: 10,
      paddingVertical: 10,
      paddingHorizontal: 12,
      gap: 5,
    },
    historyMetaRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8,
    },
    historyDate: {
      fontSize: 12,
      opacity: 0.8,
      flex: 1,
    },
    historySourceChip: {
      borderWidth: 1,
      borderRadius: 999,
      paddingVertical: 2,
      paddingHorizontal: 8,
    },
    historySourceText: {
      fontSize: 11,
      fontWeight: "700",
    },
    historySummary: {
      fontSize: 13,
      lineHeight: 18,
      fontWeight: "500",
    },
    historyReason: {
      fontSize: 12,
      opacity: 0.75,
    },
  });
}
