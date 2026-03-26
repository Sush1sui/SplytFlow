import React from "react";
import { YStack, Paragraph } from "tamagui";
import SalesDonutChart from "./sales-donut-chart";

type Segment = {
  label: string;
  value: number;
  color: string;
};

export default function NetSplitsDonutChart({
  space,
  font,
  segments,
  netSalesPercentage,
}: {
  space: (value: number) => number;
  font: (value: number, narrowValue?: number, wideValue?: number) => number;
  segments: Segment[];
  netSalesPercentage: number;
}) {
  return (
    <YStack
      style={{
        marginTop: space(18),
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "#e2e8f0",
        backgroundColor: "#ffffff",
        padding: space(16),
      }}
      gap="$3"
    >
      <Paragraph
        style={{
          color: "#0f172a",
          fontWeight: "800",
          fontSize: font(18, 15, 20),
          textAlign: "center",
        }}
      >
        Net Sales & Splits Distribution
      </Paragraph>
      <SalesDonutChart
        segments={segments}
        centerPercentage={netSalesPercentage}
      />
    </YStack>
  );
}
