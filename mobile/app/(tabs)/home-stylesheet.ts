import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: 32,
  },
  header: {
    marginBottom: 28,
  },
  logoCircle: {
    width: 52,
    height: 52,
    borderRadius: 16,
  },
  headerText: {
    flex: 1,
  },
  greeting: {
    fontSize: 14,
    opacity: 0.6,
    marginBottom: 2,
  },
  title: {
    lineHeight: 30,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 28,
  },
  statCard: {
    flex: 1,
    padding: 14,
    alignItems: "center",
    gap: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 6,
  },
  statLabel: {
    fontSize: 11,
    textAlign: "center",
  },
  quickAddTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  quickAddHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  quickAddBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    marginRight: 10,
  },
  quickAddHeaderText: {
    flex: 1,
  },
  quickAddSubtitle: {
    fontSize: 12,
    marginTop: 2,
    opacity: 0.75,
  },
  quickAddAmountRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    minHeight: 52,
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 14,
  },
  quickAddAmountInput: {
    flex: 1,
    fontSize: 22,
    fontWeight: "700",
    paddingVertical: 0,
  },
  quickAddFormRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  quickAddIconButton: {
    width: 52,
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  recentSection: {
    marginTop: 18,
  },
  recentHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  recentHeaderTitle: {
    marginBottom: 0,
  },
  recentClearButton: {
    minWidth: 56,
    minHeight: 30,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  recentClearText: {
    fontSize: 12,
    fontWeight: "600",
  },
  recentActionDisabled: {
    opacity: 0.55,
  },
  recentEmptyRow: {
    minHeight: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  recentEmptyText: {
    fontSize: 13,
    opacity: 0.75,
  },
  recentRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 48,
  },
  recentIcon: {
    width: 32,
    height: 32,
    borderRadius: 9,
    marginRight: 10,
  },
  recentInfo: {
    flex: 1,
  },
  recentLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  recentTime: {
    fontSize: 12,
    marginTop: 1,
    opacity: 0.75,
  },
  recentAmount: {
    fontSize: 14,
    fontWeight: "600",
  },
  recentRemoveButton: {
    width: 30,
    height: 30,
    borderRadius: 8,
    borderWidth: 1,
    marginLeft: 10,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default function useHomeStyles() {
  return styles;
}
