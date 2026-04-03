import React, { memo } from "react";
import { YStack, Paragraph, XStack } from "tamagui";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

function HomeSaleCard({
  totalSales,
  netSales,
  salesChangePercent,
  currency = "$",
}: {
  totalSales: number;
  netSales: number;
  salesChangePercent: number;
  currency: string;
}) {
  const totalSalesLabel = `${currency}${totalSales.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
  const netSalesLabel = `${currency}${netSales.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  return (
    <YStack
      style={{
        marginTop: 20,
        borderRadius: 20,
        padding: 18,
        backgroundColor: "#4f46e5",
        shadowColor: "#4f46e5",
        shadowOpacity: 0.28,
        shadowOffset: { width: 0, height: 8 },
        shadowRadius: 18,
        elevation: 8,
      }}
      gap="$3"
    >
      <Paragraph style={{ color: "#dbe4ff", fontWeight: "700", fontSize: 16 }}>
        Total Sales Today
      </Paragraph>
      <Paragraph
        style={{
          color: "#ffffff",
          fontSize: 36,
          lineHeight: 40,
          fontWeight: "900",
        }}
      >
        {totalSalesLabel}
      </Paragraph>
      <YStack
        style={{ height: 1, backgroundColor: "rgba(255,255,255,0.25)" }}
      />

      <XStack style={{ justifyContent: "space-between", alignItems: "center" }}>
        <YStack>
          <Paragraph style={{ color: "#dbe4ff", fontSize: 13 }}>
            Net Sales (After Splits)
          </Paragraph>
          <Paragraph
            style={{ color: "#ffffff", fontSize: 24, fontWeight: "800" }}
          >
            {netSalesLabel}
          </Paragraph>
        </YStack>

        <XStack
          style={{
            borderRadius: 999,
            paddingHorizontal: 10,
            paddingVertical: 5,
            backgroundColor: "#5d55ee",
            alignItems: "center",
          }}
          gap="$1"
        >
          {salesChangePercent !== 0 && (
            <MaterialCommunityIcons
              name={
                salesChangePercent > 0 ? "arrow-top-right" : "arrow-bottom-left"
              }
              size={14}
              color={
                salesChangePercent > 0
                  ? "#9ff3c7"
                  : salesChangePercent < 0
                    ? "#fca5a5"
                    : "#a1a1aa"
              }
            />
          )}
          <Paragraph
            style={{
              color:
                salesChangePercent > 0
                  ? "#9ff3c7"
                  : salesChangePercent < 0
                    ? "#fca5a5"
                    : "#a1a1aa",
              fontWeight: "700",
              fontSize: 12,
            }}
          >
            {salesChangePercent > 0 ? "+" : ""}
            {Number.isInteger(salesChangePercent)
              ? salesChangePercent.toFixed(0)
              : salesChangePercent.toFixed(1)}
            % (1d ago)
          </Paragraph>
        </XStack>
      </XStack>
    </YStack>
  );
}

export default memo(HomeSaleCard);
