import { Spacing, Typography, BorderRadius } from "@/constants/Theme";
import { StyleSheet } from "react-native";

const costAllocationGeneralStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing["2xl"],
  },
  header: {
    marginBottom: Spacing.lg,
    marginTop: Spacing["2xl"],
    paddingHorizontal: Spacing.xs,
  },
  title: {
    fontSize: Typography.size["2xl"],
    fontWeight: Typography.weight.bold,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.size.base,
  },
  summaryCard: {
    marginBottom: Spacing.lg,
    alignItems: "center",
  },
  cardTitle: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.medium,
    marginBottom: Spacing.xs,
  },
  summaryAmount: {
    fontSize: Typography.size["3xl"],
    fontWeight: Typography.weight.bold,
    marginVertical: Spacing.xs,
  },
  summaryLabel: {
    fontSize: Typography.size.sm,
  },
  loadingCard: {
    alignItems: "center",
    paddingVertical: Spacing["2xl"],
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: Typography.size.base,
  },
  errorCard: {
    alignItems: "center",
    paddingVertical: Spacing["2xl"],
  },
  errorTitle: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.semibold,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  errorText: {
    fontSize: Typography.size.base,
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  retryButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  retryButtonText: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semibold,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.lg,
    minHeight: 48,
  },
  addButtonText: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semibold,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.semibold,
    marginBottom: Spacing.md,
  },
  configCard: {
    marginBottom: Spacing.md,
  },
  configHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  configInfo: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  configName: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.semibold,
    flex: 1,
  },
  configPercentage: {
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.bold,
  },
  progressBarContainer: {
    marginBottom: Spacing.md,
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  configActions: {
    flexDirection: "row",
    gap: Spacing.md,
    justifyContent: "flex-end",
  },
  actionIcon: {
    padding: Spacing.xs,
  },
  emptyCard: {
    marginTop: Spacing.xl,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: Spacing["2xl"],
  },
  emptyTitle: {
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.semibold,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  emptyText: {
    fontSize: Typography.size.base,
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  emptyButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  emptyButtonText: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semibold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.bold,
  },
  modalBody: {
    padding: Spacing.lg,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semibold,
    marginBottom: Spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: Typography.size.base,
  },
  colorOptions: {
    flexDirection: "row",
    gap: Spacing.md,
    flexWrap: "wrap",
  },
  colorOption: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  colorOptionSelected: {
    borderWidth: 3,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalFooter: {
    flexDirection: "row",
    gap: Spacing.md,
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  modalButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  cancelButton: {
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semibold,
  },
  saveButton: {},
  saveButtonText: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semibold,
  },
});

export { costAllocationGeneralStyles };
