import React, { Dispatch, SetStateAction } from "react";
import { Paragraph, XStack } from "tamagui";
import { ranges } from "@/constants/sales";
import AnalyticsFilterBadge from "./analytics-filter-badge";
import GrossNetCard from "./gross-net-card";
import GrossNetCardSkeleton from "./gross-net-card-skeleton";
import NetSplitsDonutChart from "./net-splits-donut-chart";
import NetSplitsDonutChartSkeleton from "./net-splits-donut-chart-skeleton";

type DonutData = {
  segments: { label: string; value: number; color: string }[];
  netSalesPercentage: number;
};

type SalesAnalyticsSectionProps = {
  isNarrow: boolean;
  font: (base: number, narrow: number, wide: number) => number;
  space: (base: number) => number;
  selectedRange: number;
  setSelectedRange: Dispatch<SetStateAction<number>>;
  isLoading: boolean;
  grossSales: number;
  netSales: number;
  grossChange: number | null;
  netChange: number | null;
  comparisonLabel: string;
  donutData: DonutData;
};

function SalesAnalyticsSection({
  isNarrow,
  font,
  space,
  selectedRange,
  setSelectedRange,
  isLoading,
  grossSales,
  netSales,
  grossChange,
  netChange,
  comparisonLabel,
  donutData,
}: SalesAnalyticsSectionProps) {
  return (
    <>
      <Paragraph
        style={{
          color: "#0f172a",
          fontSize: font(28, 22, 30),
          lineHeight: font(34, 28, 36),
          fontWeight: "800",
        }}
      >
        Analytics
      </Paragraph>

      <XStack style={{ marginTop: space(16), flexWrap: "wrap" }} gap="$2">
        {ranges.map((range, index) => (
          <AnalyticsFilterBadge
            key={index}
            index={index}
            range={range}
            selected={index === selectedRange}
            setSelectedRange={setSelectedRange}
          />
        ))}
      </XStack>

      {isLoading ? (
        <>
          <GrossNetCardSkeleton isNarrow={isNarrow} />
          <NetSplitsDonutChartSkeleton />
        </>
      ) : (
        <>
          <GrossNetCard
            isNarrow={isNarrow}
            grossSales={grossSales}
            netSales={netSales}
            grossChange={grossChange ?? 0}
            netChange={netChange ?? 0}
            comparisonLabel={comparisonLabel}
          />
          <NetSplitsDonutChart
            segments={donutData.segments}
            netSalesPercentage={donutData.netSalesPercentage}
          />
        </>
      )}
    </>
  );
}

export default React.memo(SalesAnalyticsSection);
