import React, { memo } from "react";
import { View } from "react-native";

import useSalesStyles from "@/app/(tabs)/(sales)/sales-stylesheet";
import { Skeleton } from "@/components/ui";

type SalesTrendSkeletonProps = {
  chartBackground: string;
  chartBorder: string;
  chartMinHeight: number;
};

function SalesTrendSkeletonComponent({
  chartBackground,
  chartBorder,
  chartMinHeight,
}: SalesTrendSkeletonProps) {
  const salesStyles = useSalesStyles();

  return (
    <>
      <View style={salesStyles.trendMetricsRow}>
        <View style={{ flex: 1, gap: 8 }}>
          <Skeleton width={54} height={10} borderRadius={6} />
          <Skeleton width={110} height={22} borderRadius={8} />
        </View>
        <View style={{ width: 124, gap: 7 }}>
          <Skeleton width={76} height={14} borderRadius={7} />
          <Skeleton width={112} height={11} borderRadius={6} />
        </View>
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
            <Skeleton width={30} height={8} borderRadius={5} />
            <Skeleton width={30} height={8} borderRadius={5} />
            <Skeleton width={30} height={8} borderRadius={5} />
            <Skeleton width={30} height={8} borderRadius={5} />
          </View>

          <View style={{ flex: 1, gap: 12, justifyContent: "center" }}>
            <Skeleton width="100%" height={2} borderRadius={2} />
            <Skeleton width="100%" height={2} borderRadius={2} />
            <Skeleton width="100%" height={2} borderRadius={2} />
            <Skeleton width="100%" height={2} borderRadius={2} />
            <Skeleton width="100%" height={3} borderRadius={3} />
          </View>
        </View>

        <View style={salesStyles.trendXAxisRow}>
          <Skeleton width={34} height={9} borderRadius={6} />
          <Skeleton width={34} height={9} borderRadius={6} />
          <Skeleton width={34} height={9} borderRadius={6} />
        </View>
      </View>

      <View style={{ marginTop: 10, gap: 6 }}>
        <Skeleton width={144} height={10} borderRadius={6} />
      </View>
    </>
  );
}

export const SalesTrendSkeleton = memo(SalesTrendSkeletonComponent);
