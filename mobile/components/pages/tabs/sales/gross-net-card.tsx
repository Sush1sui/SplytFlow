import React from "react";
import { XStack, YStack, Paragraph } from "tamagui";

export default function GrossNetCard({
  space,
  font,
  isNarrow,
  grossSales,
  netSales,
  grossChange,
  netChange,
  comparisonLabel,
}: {
  space: (value: number) => number;
  font: (value: number, narrowValue?: number, wideValue?: number) => number;
  isNarrow: boolean;
  grossSales: number;
  netSales: number;
  grossChange: number;
  netChange: number;
  comparisonLabel: string;
}) {
  const formatUSD = (value: number) =>
    `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const formatPercent = (value: number) => {
    const rounded = Math.round(value * 10) / 10;
    const sign = rounded > 0 ? "+" : "";
    return `${sign}${rounded}% ${comparisonLabel}`;
  };

  return (
    <XStack
      style={{
        marginTop: space(16),
        flexDirection: isNarrow ? "column" : "row",
      }}
      gap="$3"
    >
      <YStack
        style={{
          flex: 1,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: "#e2e8f0",
          backgroundColor: "#ffffff",
          padding: space(14),
        }}
      >
        <Paragraph style={{ color: "#64748b", fontSize: font(13, 12, 14) }}>
          Gross Sales
        </Paragraph>
        <Paragraph
          style={{
            color: "#0f172a",
            fontSize: font(26, 20, 28),
            fontWeight: "800",
          }}
        >
          {formatUSD(grossSales)}
        </Paragraph>
        <Paragraph
          style={{
            color: grossChange >= 0 ? "#16a34a" : "#dc2626",
            fontWeight: "600",
            fontSize: font(13, 12, 14),
          }}
        >
          {formatPercent(grossChange)}
        </Paragraph>
      </YStack>

      <YStack
        style={{
          flex: 1,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: "#e2e8f0",
          backgroundColor: "#ffffff",
          padding: space(14),
        }}
      >
        <Paragraph style={{ color: "#64748b", fontSize: font(13, 12, 14) }}>
          Net Sales
        </Paragraph>
        <Paragraph
          style={{
            color: "#4f46e5",
            fontSize: font(26, 20, 28),
            fontWeight: "800",
          }}
        >
          {formatUSD(netSales)}
        </Paragraph>
        <Paragraph
          style={{
            color: netChange >= 0 ? "#16a34a" : "#dc2626",
            fontWeight: "600",
            fontSize: font(13, 12, 14),
          }}
        >
          {formatPercent(netChange)}
        </Paragraph>
      </YStack>
    </XStack>
  );
}
