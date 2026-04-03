import { RecentLogType } from "@/types/sale.types";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React, { memo } from "react";
import { Button, XStack, YStack, Paragraph } from "tamagui";
import { formatDateTime } from "@/lib/utils/sale";
import useCurrencySettings from "@/lib/context/currency-context";

function LogCard({
  log,
  onDelete,
  isDeleting = false,
}: {
  log: RecentLogType;
  onDelete: () => void;
  isDeleting?: boolean;
}) {
  const { formatStoredAmount } = useCurrencySettings();
  const actionType = log.actionType ?? "create";
  const signedPrefix = actionType === "delete" ? "-" : "+";
  const amountLabel = `${signedPrefix}${formatStoredAmount(Math.abs(log.amount))}`;
  const timestampLabel = formatDateTime(log.createdAt);

  const actionMeta =
    actionType === "update"
      ? {
          icon: "pencil-outline" as const,
          iconColor: "#3b82f6",
          iconBg: "#dbeafe",
          label: "Updated sale",
        }
      : actionType === "delete"
        ? {
            icon: "trash-can-outline" as const,
            iconColor: "#ef4444",
            iconBg: "#fee2e2",
            label: "Deleted sale",
          }
        : {
            icon: "arrow-top-right" as const,
            iconColor: "#22c55e",
            iconBg: "#d8f7e4",
            label: "Created sale",
          };

  return (
    <XStack
      style={{
        alignItems: "center",
        borderRadius: 16,
        backgroundColor: "#ffffff",
        borderColor: "#e7ebf3",
        borderWidth: 1,
        paddingVertical: 12,
        paddingHorizontal: 14,
      }}
      gap="$3"
    >
      <YStack
        style={{
          width: 38,
          height: 38,
          borderRadius: 19,
          backgroundColor: actionMeta.iconBg,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <MaterialCommunityIcons
          name={actionMeta.icon}
          size={18}
          color={actionMeta.iconColor}
        />
      </YStack>

      <YStack style={{ flex: 1 }} gap="$0.5">
        <Paragraph
          style={{ color: "#0f172a", fontWeight: "800", fontSize: 16 }}
        >
          {amountLabel}
        </Paragraph>
        <Paragraph style={{ color: "#6b7280", fontSize: 11 }}>
          {actionMeta.label} - {timestampLabel}
        </Paragraph>
      </YStack>

      <XStack style={{ justifyContent: "flex-end", alignItems: "center" }}>
        <Button
          unstyled
          chromeless
          disabled={isDeleting}
          onPress={onDelete}
          pressStyle={{ opacity: 0.65, background: "transparent" }}
          style={{
            width: 28,
            height: 28,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 14,
            backgroundColor: "transparent",
          }}
        >
          <MaterialCommunityIcons
            name="trash-can-outline"
            size={18}
            color="#ef4444"
          />
        </Button>
      </XStack>
    </XStack>
  );
}

export default memo(LogCard);
