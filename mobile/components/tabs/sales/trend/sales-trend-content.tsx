import React, { memo } from "react";
import { View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import useSalesStyles from "@/app/(tabs)/(sales)/sales-stylesheet";

import { formatCompactMoney } from "../formatters";
import { SalesTrendCanvas } from "./sales-trend-canvas";
import { formatAxisTick } from "./sales-trend-math";

type SalesTrendContentProps = {
  iconColor: string;
  isCompact: boolean;
  values: number[];
  firstValue: number;
  lastValue: number;
  hasComparisonPoint: boolean;
  changeChipBg: string;
  changeChipBorder: string;
  changeColor: string;
  changePercentLabel: string;
  changeValueLabel: string;
  chartBackground: string;
  chartBorder: string;
  chartMinHeight: number;
  tickValues: number[];
  plotHeight: number;
  yMin: number;
  yRange: number;
  trendLineColor: string;
  isUpTrend: boolean;
  gridColor: string;
  xAxisLabels: string[];
  peak: number;
  low: number;
};

function SalesTrendContentComponent({
  iconColor,
  isCompact,
  values,
  firstValue,
  lastValue,
  hasComparisonPoint,
  changeChipBg,
  changeChipBorder,
  changeColor,
  changePercentLabel,
  changeValueLabel,
  chartBackground,
  chartBorder,
  chartMinHeight,
  tickValues,
  plotHeight,
  yMin,
  yRange,
  trendLineColor,
  isUpTrend,
  gridColor,
  xAxisLabels,
  peak,
  low,
}: SalesTrendContentProps) {
  const salesStyles = useSalesStyles();

  return (
    <>
      <View
        style={[
          salesStyles.trendMetricsRow,
          isCompact && salesStyles.trendMetricsRowCompact,
        ]}
      >
        <View>
          <ThemedText
            style={[salesStyles.trendMetricLabel, { color: iconColor }]}
          >
            Latest
          </ThemedText>
          <ThemedText
            style={[salesStyles.trendMetricValue, { color: iconColor }]}
          >
            {formatCompactMoney(lastValue)}
          </ThemedText>

          <ThemedText
            style={[
              salesStyles.trendMetricLabel,
              { color: iconColor, marginTop: 8 },
            ]}
          >
            Start of range
          </ThemedText>
          <ThemedText
            style={[salesStyles.trendMetricValue, { color: iconColor }]}
          >
            {formatCompactMoney(firstValue)}
          </ThemedText>
        </View>

        {hasComparisonPoint ? (
          <View
            style={[
              salesStyles.trendChangeChip,
              isCompact && salesStyles.trendChangeChipCompact,
              {
                backgroundColor: changeChipBg,
                borderColor: changeChipBorder,
              },
            ]}
          >
            <ThemedText
              style={[salesStyles.trendChangeText, { color: changeColor }]}
            >
              {changePercentLabel}
            </ThemedText>
            <ThemedText
              style={[salesStyles.trendChangeSubtext, { color: changeColor }]}
            >
              {changeValueLabel}
            </ThemedText>
          </View>
        ) : (
          <View
            style={[
              salesStyles.trendChangeChip,
              isCompact && salesStyles.trendChangeChipCompact,
              {
                backgroundColor: "transparent",
                borderColor: `${iconColor}22`,
              },
            ]}
          >
            <ThemedText
              style={[salesStyles.trendChangeText, { color: iconColor }]}
            >
              No change yet
            </ThemedText>
            <ThemedText
              style={[salesStyles.trendChangeSubtext, { color: iconColor }]}
            >
              Need at least 2 points in this range
            </ThemedText>
          </View>
        )}
      </View>

      <View
        style={[
          salesStyles.trendChartWrap,
          {
            backgroundColor: chartBackground,
            borderColor: chartBorder,
            minHeight: chartMinHeight,
          },
        ]}
      >
        <View style={salesStyles.trendPlotRow}>
          <View style={salesStyles.trendYAxisColumn}>
            {tickValues.map((tick, index) => (
              <ThemedText
                key={`${tick}_${index}`}
                style={[salesStyles.trendYAxisLabel, { color: iconColor }]}
              >
                {formatAxisTick(tick)}
              </ThemedText>
            ))}
          </View>

          <SalesTrendCanvas
            values={values}
            tickValues={tickValues}
            plotHeight={plotHeight}
            yMin={yMin}
            yRange={yRange}
            trendLineColor={trendLineColor}
            isUpTrend={isUpTrend}
            iconColor={iconColor}
            gridColor={gridColor}
          />
        </View>

        <View
          style={[
            salesStyles.trendXAxisRow,
            xAxisLabels.length === 1 && { justifyContent: "center" },
          ]}
        >
          {xAxisLabels.map((label, index) => (
            <ThemedText
              key={`${label}_${index}`}
              style={[salesStyles.trendXAxisLabel, { color: iconColor }]}
            >
              {label}
            </ThemedText>
          ))}
        </View>
      </View>

      <ThemedText style={[salesStyles.trendMeta, { color: iconColor }]}>
        High: {formatCompactMoney(peak)} Low: {formatCompactMoney(low)}
      </ThemedText>
    </>
  );
}

export const SalesTrendContent = memo(SalesTrendContentComponent);
