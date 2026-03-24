import { RecentLogType } from "@/types/sale.types";
import { log } from "console";
import React, { memo } from "react";
import { XStack, YStack, Paragraph } from "tamagui";

function LogCard({
  log,
  currency = "$",
}: {
  log: RecentLogType;
  currency: string;
}) {
  return (
    <XStack
      key={log.id}
      style={{
        alignItems: "center",
        borderRadius: 14,
        backgroundColor: "#ffffff",
        borderColor: "#e5eaf3",
        borderWidth: 1,
        padding: 12,
      }}
      gap="$3"
    >
      <YStack style={{ flex: 1 }}>
        <Paragraph style={{ color: "#6b7280", fontSize: 13 }}>
          {new Date(log.createdAt).toLocaleString()}
        </Paragraph>
      </YStack>

      <Paragraph style={{ color: "#0f172a", fontWeight: "800", fontSize: 16 }}>
        {currency}
        {log.amount.toFixed(2)}
      </Paragraph>
    </XStack>
  );
}

export default memo(LogCard);
