import React, { memo, useMemo } from "react";
import { View, useWindowDimensions } from "react-native";

import { Card } from "@/components/ui/card";
import { ThemedText } from "@/components/themed-text";
import useTabsStyles from "@/app/(tabs)/tabs-stylesheet";
import useSalesStyles from "@/app/(tabs)/(sales)/sales-stylesheet";
import { useThemeColor } from "@/hooks/use-theme-color";

import { colorWithOpacity } from "../colors";
import { formatCompactMoney } from "../formatters";
import { SalesTrendContent } from "./sales-trend-content";
import { getNiceBounds, getXAxisLabels } from "./sales-trend-math";
import { SalesTrendSkeleton } from "./sales-trend-skeleton";
import type { TrendPoint } from "../types";

type SalesTrendCardProps = {
  loading: boolean;
  points: TrendPoint[];
};

function SalesTrendCardComponent({ loading, points }: SalesTrendCardProps) {
  const tint = useThemeColor({ light: "#0a7ea4", dark: "#5dc7ff" }, "tint");
  const downTint = useThemeColor({ light: "#c0392b", dark: "#ff8b7c" }, "tint");
  const iconColor = useThemeColor({}, "icon");
  const chartBackground = useThemeColor(
    { light: "#F6FAFC", dark: "#181C20" },
    "background",
  );
  const chartBorder = useThemeColor(
    { light: "#DCE6EC", dark: "#2B343C" },
    "icon",
  );
  const tabsStyles = useTabsStyles();
  const salesStyles = useSalesStyles();
  const { width: viewportWidth } = useWindowDimensions();
  const isCompact = viewportWidth < 390;

  const gridColor = colorWithOpacity(iconColor, 0.14);

  const labels = useMemo(() => points.map((point) => point.label), [points]);
  const values = useMemo(
    () => points.map((point) => Number(point.amount) || 0),
    [points],
  );
  const pointCount = values.length;

  const basePlotHeight = viewportWidth < 360 ? 130 : 154;
  const densityHeightAdjustment =
    pointCount <= 2 ? -16 : pointCount >= 9 ? 10 : 0;
  const plotHeight = Math.max(116, basePlotHeight + densityHeightAdjustment);
  const chartMinHeight = plotHeight + (isCompact ? 62 : 72);
  const yTickCount = pointCount <= 2 ? 3 : 4;

  const peak = useMemo(
    () => values.reduce((max, value) => Math.max(max, value), 0),
    [values],
  );
  const low = useMemo(
    () => values.reduce((min, value) => Math.min(min, value), values[0] ?? 0),
    [values],
  );

  const firstValue = values[0] ?? 0;
  const lastValue = values[values.length - 1] ?? 0;
  const hasComparisonPoint = values.length > 1;
  const delta = lastValue - firstValue;
  const isFlat = Math.abs(delta) < 1e-6;
  const canShowPercent = hasComparisonPoint && Math.abs(firstValue) > 1e-6;
  const deltaPct = canShowPercent ? (delta / firstValue) * 100 : null;
  const isUpTrend = delta >= 0;
  const trendLineColor = hasComparisonPoint
    ? isUpTrend
      ? tint
      : downTint
    : tint;
  const changeColor = hasComparisonPoint
    ? isUpTrend
      ? tint
      : downTint
    : iconColor;
  const signedDeltaLabel = `${isUpTrend ? "+" : "-"}${formatCompactMoney(
    Math.abs(delta),
  )}`;
  const changePercentLabel =
    deltaPct !== null
      ? `${isUpTrend ? "+" : ""}${deltaPct.toFixed(1)}%`
      : isFlat
        ? "No change"
        : isUpTrend
          ? "Trending up"
          : "Trending down";
  const changeValueLabel = isFlat
    ? "Same as start"
    : `${signedDeltaLabel} over this period`;

  const changeChipBg = isUpTrend
    ? colorWithOpacity(tint, 0.12)
    : colorWithOpacity(downTint, 0.13);
  const changeChipBorder = isUpTrend
    ? colorWithOpacity(tint, 0.36)
    : colorWithOpacity(downTint, 0.42);

  const { min: yMin, max: yMax } = useMemo(
    () => getNiceBounds(low, peak),
    [low, peak],
  );
  const yRange = Math.max(yMax - yMin, 1e-6);

  const tickValues = useMemo(() => {
    return Array.from({ length: yTickCount }, (_, index) => {
      const ratio = index / (yTickCount - 1);
      return yMax - ratio * yRange;
    });
  }, [yMax, yRange, yTickCount]);

  const xAxisLabels = useMemo(() => getXAxisLabels(labels), [labels]);

  return (
    <View style={salesStyles.sectionWrap}>
      <View style={salesStyles.trendHeaderRow}>
        <ThemedText style={[tabsStyles.sectionTitle, { color: iconColor }]}>
          TREND SNAPSHOT
        </ThemedText>
        <ThemedText style={[salesStyles.trendMeta, { color: iconColor }]}>
          Line chart
        </ThemedText>
      </View>

      <Card style={salesStyles.trendCard}>
        {loading ? (
          <SalesTrendSkeleton
            chartBackground={chartBackground}
            chartBorder={chartBorder}
            chartMinHeight={chartMinHeight}
          />
        ) : points.length === 0 ? (
          <View style={salesStyles.emptyRow}>
            <ThemedText style={[salesStyles.emptyText, { color: iconColor }]}>
              No trend data in this range
            </ThemedText>
          </View>
        ) : (
          <SalesTrendContent
            iconColor={iconColor}
            isCompact={isCompact}
            values={values}
            lastValue={lastValue}
            hasComparisonPoint={hasComparisonPoint}
            changeChipBg={changeChipBg}
            changeChipBorder={changeChipBorder}
            changeColor={changeColor}
            changePercentLabel={changePercentLabel}
            changeValueLabel={changeValueLabel}
            chartBackground={chartBackground}
            chartBorder={chartBorder}
            chartMinHeight={chartMinHeight}
            tickValues={tickValues}
            plotHeight={plotHeight}
            yMin={yMin}
            yRange={yRange}
            trendLineColor={trendLineColor}
            isUpTrend={isUpTrend}
            gridColor={gridColor}
            xAxisLabels={xAxisLabels}
            peak={peak}
            low={low}
          />
        )}
      </Card>
    </View>
  );
}

export const SalesTrendCard = memo(SalesTrendCardComponent);
