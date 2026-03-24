import { RecentLogType } from "@/types/sale.types";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import React, { memo } from "react";
import { Button, XStack, YStack, Paragraph } from "tamagui";

function LogCard({
  log,
  currency = "$",
  onDelete,
  isDeleting = false,
}: {
  log: RecentLogType;
  currency: string;
  onDelete: () => void;
  isDeleting?: boolean;
}) {
  const amountLabel = `${log.amount >= 0 ? "+" : "-"}${currency}${Math.abs(log.amount).toFixed(2)}`;
  const timestampLabel = new Date(
    log.updatedAt ?? log.createdAt,
  ).toLocaleString();

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
          backgroundColor: "#d8f7e4",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <MaterialCommunityIcons
          name={log.amount >= 0 ? "arrow-top-right" : "arrow-bottom-right"}
          size={18}
          color={log.amount >= 0 ? "#22c55e" : "#ef4444"}
        />
      </YStack>

      <YStack style={{ flex: 1 }} gap="$0.5">
        <Paragraph
          style={{ color: "#0f172a", fontWeight: "800", fontSize: 16 }}
        >
          {amountLabel}
        </Paragraph>
        <Paragraph style={{ color: "#6b7280", fontSize: 11 }}>
          {timestampLabel}
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
