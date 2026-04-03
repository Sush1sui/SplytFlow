import React from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Paragraph, Text, XStack, YStack } from "tamagui";
import { SNAPSHOT_COLORS } from "@/constants/sales";

type WeeklyInsightsPanelProps = {
  isNarrow: boolean;
  rangeLabel: string;
  comparisonLabel: string;
  grossSales: number;
  netSales: number;
  grossChange: number;
  netChange: number;
  totalSplitPct: number;
  anomalyFlags: string[];
  whatChangedText: string;
};

function formatCurrency(value: number): string {
  return `$${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatPercent(value: number, comparisonLabel: string): string {
  const rounded = Math.round(value * 10) / 10;
  const sign = rounded > 0 ? "+" : "";
  return `${sign}${rounded}% ${comparisonLabel}`;
}

function changeColor(value: number): string {
  return value >= 0 ? SNAPSHOT_COLORS.positive : SNAPSHOT_COLORS.negative;
}

function splitPctColor(value: number): string {
  if (value >= 55) return SNAPSHOT_COLORS.negative;
  if (value >= 35) return SNAPSHOT_COLORS.warning;
  return SNAPSHOT_COLORS.positive;
}

const HIGHLIGHT_TOKEN_REGEX =
  /(\$[\d,]+(?:\.\d{2})?|[+-]?\d+(?:\.\d+)?%|\b(?:increased|rose|jumped)\b|\b(?:decreased|fell|dropped)\b|\b(?:gross|net)\b)/gi;

function highlightStyle(
  token: string,
): { color: string; fontWeight: "700" } | null {
  const lower = token.toLowerCase();

  if (/^\$/.test(token))
    return { color: SNAPSHOT_COLORS.money, fontWeight: "700" };
  if (/%$/.test(token)) {
    if (token.startsWith("+")) {
      return { color: SNAPSHOT_COLORS.positive, fontWeight: "700" };
    }

    if (token.startsWith("-")) {
      return { color: SNAPSHOT_COLORS.negative, fontWeight: "700" };
    }

    return { color: SNAPSHOT_COLORS.percent, fontWeight: "700" };
  }

  if (lower === "increased" || lower === "rose" || lower === "jumped") {
    return { color: SNAPSHOT_COLORS.positive, fontWeight: "700" };
  }

  if (lower === "decreased" || lower === "fell" || lower === "dropped") {
    return { color: SNAPSHOT_COLORS.negative, fontWeight: "700" };
  }

  if (lower === "gross") {
    return { color: SNAPSHOT_COLORS.grossToken, fontWeight: "700" };
  }

  if (lower === "net") {
    return { color: SNAPSHOT_COLORS.netToken, fontWeight: "700" };
  }

  return null;
}

function renderHighlightedText(text: string) {
  const parts = text
    .split(HIGHLIGHT_TOKEN_REGEX)
    .filter((part) => part.length > 0);

  return parts.map((part, index) => {
    const style = highlightStyle(part);

    if (!style) {
      return <Text key={`${part}-${index}`}>{part}</Text>;
    }

    return (
      <Text key={`${part}-${index}`} style={style}>
        {part}
      </Text>
    );
  });
}

export default function WeeklyInsightsPanel({
  isNarrow,
  rangeLabel,
  comparisonLabel,
  grossSales,
  netSales,
  grossChange,
  netChange,
  totalSplitPct,
  anomalyFlags,
  whatChangedText,
}: WeeklyInsightsPanelProps) {
  const roundedSplitPct = Math.round(totalSplitPct * 10) / 10;

  return (
    <YStack
      style={{
        marginTop: 14,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#e2e8f0",
        backgroundColor: "#ffffff",
        padding: 14,
      }}
      gap="$3"
    >
      <Paragraph
        style={{
          color: SNAPSHOT_COLORS.title,
          fontWeight: "800",
          fontSize: 18,
        }}
      >
        Range Snapshot
      </Paragraph>

      <XStack style={{ flexDirection: isNarrow ? "column" : "row" }} gap="$2.5">
        <YStack
          style={{
            flex: 1,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#e2e8f0",
            backgroundColor: "#f8fafc",
            padding: 12,
          }}
        >
          <Paragraph style={{ color: "#64748b", fontSize: 12 }}>
            Gross ({rangeLabel})
          </Paragraph>
          <Paragraph
            style={{ color: "#0f172a", fontWeight: "800", fontSize: 22 }}
          >
            {formatCurrency(grossSales)}
          </Paragraph>
          <Paragraph
            style={{
              color: changeColor(grossChange),
              fontWeight: "600",
              fontSize: 12,
            }}
          >
            {formatPercent(grossChange, comparisonLabel)}
          </Paragraph>
        </YStack>

        <YStack
          style={{
            flex: 1,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#e2e8f0",
            backgroundColor: "#f8fafc",
            padding: 12,
          }}
        >
          <Paragraph style={{ color: "#64748b", fontSize: 12 }}>
            Net ({rangeLabel})
          </Paragraph>
          <Paragraph
            style={{ color: "#4f46e5", fontWeight: "800", fontSize: 22 }}
          >
            {formatCurrency(netSales)}
          </Paragraph>
          <Paragraph
            style={{
              color: changeColor(netChange),
              fontWeight: "600",
              fontSize: 12,
            }}
          >
            {formatPercent(netChange, comparisonLabel)}
          </Paragraph>
        </YStack>
      </XStack>

      <YStack
        style={{
          borderRadius: 12,
          borderWidth: 1,
          borderColor: "#e2e8f0",
          backgroundColor: "#f8fafc",
          padding: 12,
        }}
        gap="$1.5"
      >
        <Paragraph
          style={{ color: "#0f172a", fontWeight: "700", fontSize: 13 }}
        >
          What changed
        </Paragraph>
        <Paragraph style={{ color: "#475569", fontSize: 13, lineHeight: 20 }}>
          {renderHighlightedText(whatChangedText)}
        </Paragraph>
        <Paragraph style={{ color: SNAPSHOT_COLORS.label, fontSize: 12 }}>
          Active split total:{" "}
          <Text
            style={{
              color: splitPctColor(roundedSplitPct),
              fontWeight: "700",
            }}
          >
            {roundedSplitPct}%
          </Text>
        </Paragraph>
      </YStack>

      <YStack gap="$1.5">
        <Paragraph
          style={{ color: "#0f172a", fontWeight: "700", fontSize: 13 }}
        >
          Anomaly flags
        </Paragraph>

        {anomalyFlags.length === 0 ? (
          <Paragraph style={{ color: SNAPSHOT_COLORS.subtle, fontSize: 13 }}>
            No unusual movement detected for this selected range.
          </Paragraph>
        ) : (
          anomalyFlags.map((flag) => (
            <XStack key={flag} style={{ alignItems: "center" }} gap="$2">
              <MaterialCommunityIcons
                name="alert-circle-outline"
                size={16}
                color="#b45309"
              />
              <Paragraph style={{ color: "#475569", fontSize: 13, flex: 1 }}>
                {renderHighlightedText(flag)}
              </Paragraph>
            </XStack>
          ))
        )}
      </YStack>
    </YStack>
  );
}
