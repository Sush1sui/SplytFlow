import React from "react";
import { Router } from "expo-router";
import { Button, Paragraph, XStack, YStack } from "tamagui";
import { SaleRow } from "@/types/sale.types";
import { Skeleton, SkeletonGroup } from "@/components/skeleton";
import SaleHistoryRow from "./sale-history-row";
import {
  viewAllBtnStyle,
  addRecordBtnStyle,
  historyRowStyle,
} from "./sales-screen.styles";

// ─── Internal skeleton ────────────────────────────────────────────────────────

function HistoryPreviewSkeleton() {
  return (
    <SkeletonGroup>
      <YStack gap="$2.5">
        {Array.from({ length: 3 }).map((_, index) => (
          <YStack
            key={`history-loading-row-${index}`}
            style={historyRowStyle}
            gap="$2"
          >
            <Skeleton width={130} height={14} borderRadius={7} />
            <Skeleton width={180} height={12} borderRadius={6} />
          </YStack>
        ))}
      </YStack>
    </SkeletonGroup>
  );
}

// ─── Internal list ────────────────────────────────────────────────────────────

function HistoryPreview({
  rows,
  loading,
  onEdit,
  onDelete,
  disabled,
}: {
  rows: SaleRow[];
  loading: boolean;
  onEdit: (sale: SaleRow) => void;
  onDelete: (sale: SaleRow) => void;
  disabled: boolean;
}) {
  if (loading) return <HistoryPreviewSkeleton />;
  if (rows.length === 0) {
    return (
      <Paragraph style={{ color: "#64748b", fontSize: 13 }}>
        No recent sales yet.
      </Paragraph>
    );
  }
  return (
    <YStack gap="$2.5">
      {rows.map((sale) => (
        <SaleHistoryRow
          key={sale.id}
          sale={sale}
          onEdit={() => onEdit(sale)}
          onDelete={() => onDelete(sale)}
          disabled={disabled}
        />
      ))}
    </YStack>
  );
}

// ─── Exported section ─────────────────────────────────────────────────────────

type SalesHistorySectionProps = {
  font: (base: number, narrow: number, wide: number) => number;
  space: (base: number) => number;
  router: Router;
  historyRows: SaleRow[];
  historyLoading: boolean;
  mutating: boolean;
  modalVisible: boolean;
  onOpenModal: (sale?: SaleRow) => void;
  onDelete: (sale: SaleRow) => void;
};

function SalesHistorySection({
  font,
  space,
  router,
  historyRows,
  historyLoading,
  mutating,
  modalVisible,
  onOpenModal,
  onDelete,
}: SalesHistorySectionProps) {
  return (
    <YStack style={{ marginTop: space(22) }} gap="$3">
      <XStack style={{ alignItems: "center", justifyContent: "space-between" }}>
        <Paragraph
          style={{
            color: "#0f172a",
            fontWeight: "800",
            fontSize: font(20, 16, 22),
          }}
        >
          Sales History
        </Paragraph>

        <XStack style={{ alignItems: "center" }} gap="$2">
          <Button
            chromeless
            unstyled
            onPress={() => router.push("/(tabs)/(sales)/sale-history-page")}
            pressStyle={{ opacity: 0.7, background: "transparent" }}
            style={viewAllBtnStyle}
          >
            <Paragraph style={{ color: "#4f46e5", fontWeight: "700" }}>
              View All
            </Paragraph>
          </Button>

          <Button
            onPress={() => onOpenModal()}
            disabled={modalVisible || mutating}
            style={addRecordBtnStyle}
          >
            <Paragraph style={{ color: "#4f46e5", fontWeight: "800" }}>
              + Add Record
            </Paragraph>
          </Button>
        </XStack>
      </XStack>

      <HistoryPreview
        rows={historyRows}
        loading={historyLoading}
        onEdit={onOpenModal}
        onDelete={onDelete}
        disabled={mutating}
      />
    </YStack>
  );
}

export default React.memo(SalesHistorySection);
