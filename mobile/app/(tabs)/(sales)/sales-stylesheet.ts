import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: 32,
  },
  headerWrap: {
    marginBottom: 20,
  },
  headerMainRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  headerRow: {
    alignItems: "flex-start",
    flex: 1,
  },
  logoCircle: {
    width: 48,
    height: 48,
    borderRadius: 14,
  },
  headerTextWrap: {
    flex: 1,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 3,
    opacity: 0.8,
  },
  headerManageButton: {
    minHeight: 34,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
  },
  headerManageText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  presetSection: {
    marginBottom: 16,
  },
  presetRow: {
    flexDirection: "row",
    gap: 6,
    paddingRight: 8,
  },
  presetChip: {
    minHeight: 32,
    borderRadius: 9,
    borderWidth: 1,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  presetChipSelected: {
    borderWidth: 1.4,
    paddingHorizontal: 13,
  },
  presetChipCollapsed: {
    minWidth: 40,
    paddingHorizontal: 10,
  },
  presetChipLabel: {
    fontSize: 12,
    fontWeight: "500",
    letterSpacing: 0.2,
  },
  presetChipLabelSelected: {
    fontWeight: "700",
    letterSpacing: 0.35,
  },
  sectionWrap: {
    marginBottom: 18,
  },
  kpiRowScroll: {
    marginHorizontal: -4,
  },
  kpiRowContent: {
    paddingHorizontal: 4,
    gap: 10,
  },
  kpiCard: {
    width: 188,
    minHeight: 112,
    padding: 16,
    gap: 8,
  },
  kpiHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  kpiIcon: {
    width: 28,
    height: 28,
    borderRadius: 9,
  },
  kpiLabel: {
    fontSize: 12,
  },
  kpiValue: {
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 24,
  },
  trendCard: {
    padding: 14,
  },
  trendMetricsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    gap: 10,
  },
  trendMetricsRowCompact: {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 8,
  },
  trendMetricLabel: {
    fontSize: 11,
    opacity: 0.72,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  trendMetricValue: {
    marginTop: 2,
    fontSize: 18,
    fontWeight: "700",
  },
  trendChangeChip: {
    borderRadius: 11,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 7,
    alignItems: "flex-end",
  },
  trendChangeChipCompact: {
    alignSelf: "stretch",
    alignItems: "flex-start",
  },
  trendChangeText: {
    fontSize: 13,
    fontWeight: "700",
  },
  trendChangeSubtext: {
    marginTop: 2,
    fontSize: 11,
    opacity: 0.9,
  },
  trendHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 10,
  },
  trendHeaderRowCompact: {
    flexDirection: "column",
    alignItems: "flex-start",
  },
  trendToggleRow: {
    flexDirection: "row",
    gap: 6,
  },
  trendToggleButton: {
    minHeight: 28,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    justifyContent: "center",
  },
  trendToggleText: {
    fontSize: 11,
    fontWeight: "600",
  },
  trendGranularityRow: {
    gap: 8,
    paddingRight: 6,
    marginTop: 10,
    marginBottom: 12,
  },
  trendGranularityChip: {
    minHeight: 28,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    justifyContent: "center",
  },
  trendGranularityText: {
    fontSize: 11,
    fontWeight: "600",
  },
  trendChartWrap: {
    marginTop: 2,
    minHeight: 210,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(140,140,140,0.18)",
    padding: 10,
    overflow: "hidden",
  },
  trendPlotRow: {
    flexDirection: "row",
    alignItems: "stretch",
    minHeight: 150,
  },
  trendYAxisColumn: {
    width: 44,
    justifyContent: "space-between",
    paddingVertical: 2,
  },
  trendSvgWrap: {
    flex: 1,
  },
  trendYAxisLabel: {
    fontSize: 9,
    opacity: 0.85,
    width: 36,
    textAlign: "right",
    marginRight: 8,
  },
  trendXAxisRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
    paddingHorizontal: 8,
  },
  trendXAxisLabel: {
    fontSize: 10,
    opacity: 0.78,
  },
  trendMeta: {
    marginTop: 10,
    fontSize: 12,
  },
  splitCard: {
    padding: 14,
  },
  splitTopStats: {
    flexDirection: "row",
    gap: 10,
  },
  splitStatBox: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(140,140,140,0.22)",
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  splitStatLabel: {
    fontSize: 12,
  },
  splitStatValue: {
    marginTop: 2,
    fontSize: 18,
    fontWeight: "700",
  },
  splitMeta: {
    marginTop: 12,
    marginBottom: 10,
    fontSize: 12,
  },
  emptyRowCompact: {
    minHeight: 40,
    justifyContent: "center",
  },
  splitList: {
    gap: 10,
  },
  splitRow: {
    gap: 6,
  },
  splitRowHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  splitName: {
    fontSize: 13,
    fontWeight: "600",
  },
  splitPct: {
    fontSize: 12,
  },
  splitBarTrack: {
    height: 8,
    borderRadius: 999,
    overflow: "hidden",
  },
  splitBarFill: {
    height: "100%",
    borderRadius: 999,
  },
  splitHistoryWrap: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(140,140,140,0.2)",
    paddingTop: 10,
    gap: 8,
  },
  splitHistoryTitle: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  splitHistoryItem: {
    borderWidth: 1,
    borderColor: "rgba(140,140,140,0.22)",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    gap: 4,
  },
  splitHistoryDate: {
    fontSize: 12,
    opacity: 0.82,
  },
  splitHistorySummary: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "500",
  },
  historyCard: {
    padding: 14,
  },
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 46,
  },
  historyIcon: {
    width: 32,
    height: 32,
    borderRadius: 9,
    marginRight: 10,
  },
  historyInfo: {
    flex: 1,
  },
  historyLabel: {
    fontSize: 13,
    fontWeight: "500",
  },
  historyDate: {
    marginTop: 1,
    fontSize: 12,
    opacity: 0.78,
  },
  historyAmount: {
    fontSize: 14,
    fontWeight: "600",
  },
  emptyRow: {
    minHeight: 56,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 13,
    opacity: 0.75,
  },
  errorCard: {
    padding: 14,
    marginBottom: 14,
  },
  errorText: {
    fontSize: 13,
  },
  manageCard: {
    padding: 16,
    gap: 8,
  },
  manageLabel: {
    fontSize: 12,
    opacity: 0.82,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  manageDateButton: {
    minHeight: 44,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  manageDateText: {
    fontSize: 14,
    fontWeight: "600",
  },
  manageCurrentValue: {
    fontSize: 12,
    opacity: 0.84,
  },
  manageActionsRow: {
    marginTop: 8,
    gap: 10,
  },
  manageFeedbackCard: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 10,
    marginTop: 10,
  },
  manageFeedbackText: {
    fontSize: 12,
    fontWeight: "600",
  },
});

export default function useSalesStyles() {
  return styles;
}
