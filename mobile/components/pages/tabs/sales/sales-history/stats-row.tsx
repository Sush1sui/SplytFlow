import React from "react";
import { Paragraph, XStack } from "tamagui";
import useCurrencySettings from "@/lib/context/currency-context";

type StatsRowProps = {
  recordCount: number;
  totalAmount: number;
};

export default function StatsRow({ recordCount, totalAmount }: StatsRowProps) {
  const { formatStoredAmount } = useCurrencySettings();

  return (
    <XStack
      style={{
        marginTop: 18,
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Paragraph style={{ color: "#64748b", fontSize: 18 }}>
        {recordCount} Records
      </Paragraph>
      <Paragraph style={{ color: "#4f46e5", fontWeight: "700", fontSize: 18 }}>
        Total: {formatStoredAmount(totalAmount)}
      </Paragraph>
    </XStack>
  );
}
