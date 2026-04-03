import React, { Dispatch, SetStateAction } from "react";
import { Button, Paragraph, XStack } from "tamagui";
import { ranges } from "@/constants/sales";
import AnalyticsFilterBadge from "./analytics-filter-badge";
import NetSplitsDonutChart from "./net-splits-donut-chart";
import NetSplitsDonutChartSkeleton from "./net-splits-donut-chart-skeleton";
import WeeklyInsightsPanel from "./weekly-insights-panel";
import WeeklyInsightsPanelSkeleton from "./weekly-insights-panel-skeleton";

type DonutData = {
  segments: { label: string; value: number; color: string }[];
  netSalesPercentage: number;
};

type RangeInsights = {
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

type SalesAnalyticsSectionProps = {
  isNarrow: boolean;
  font: (base: number, narrow: number, wide: number) => number;
  space: (base: number) => number;
  selectedRange: number;
  setSelectedRange: Dispatch<SetStateAction<number>>;
  isLoading: boolean;
  exportingCsv: boolean;
  onExportCsv: () => void;
  donutData: DonutData;
  rangeInsights: RangeInsights;
};

function SalesAnalyticsSection({
  isNarrow,
  font,
  space,
  selectedRange,
  setSelectedRange,
  isLoading,
  exportingCsv,
  onExportCsv,
  donutData,
  rangeInsights,
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

      <XStack style={{ marginTop: space(12), justifyContent: "flex-end" }}>
        <Button
          disabled={isLoading || exportingCsv}
          onPress={onExportCsv}
          style={{
            borderRadius: 10,
            height: 36,
            paddingHorizontal: 14,
            backgroundColor: "#dfe4ff",
            borderColor: "#dfe4ff",
            opacity: isLoading || exportingCsv ? 0.65 : 1,
          }}
        >
          <Paragraph style={{ color: "#4f46e5", fontWeight: "800" }}>
            {exportingCsv ? "Downloading..." : "Download CSV"}
          </Paragraph>
        </Button>
      </XStack>

      {isLoading ? (
        <>
          <WeeklyInsightsPanelSkeleton isNarrow={isNarrow} />
          <NetSplitsDonutChartSkeleton />
        </>
      ) : (
        <>
          <WeeklyInsightsPanel
            isNarrow={isNarrow}
            rangeLabel={rangeInsights.rangeLabel}
            comparisonLabel={rangeInsights.comparisonLabel}
            grossSales={rangeInsights.grossSales}
            netSales={rangeInsights.netSales}
            grossChange={rangeInsights.grossChange}
            netChange={rangeInsights.netChange}
            totalSplitPct={rangeInsights.totalSplitPct}
            anomalyFlags={rangeInsights.anomalyFlags}
            whatChangedText={rangeInsights.whatChangedText}
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
