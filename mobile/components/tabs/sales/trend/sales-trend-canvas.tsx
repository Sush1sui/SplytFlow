import React, { memo, useCallback, useMemo, useRef, useState } from "react";
import { LayoutChangeEvent, View } from "react-native";
import Svg, {
  Circle,
  Defs,
  Line,
  LinearGradient,
  Polygon,
  Polyline,
  Stop,
} from "react-native-svg";

import useSalesStyles from "@/app/(tabs)/(sales)/sales-stylesheet";

import { colorWithOpacity } from "../colors";

type SalesTrendCanvasProps = {
  values: number[];
  tickValues: number[];
  plotHeight: number;
  yMin: number;
  yRange: number;
  trendLineColor: string;
  isUpTrend: boolean;
  iconColor: string;
  gridColor: string;
};

function SalesTrendCanvasComponent({
  values,
  tickValues,
  plotHeight,
  yMin,
  yRange,
  trendLineColor,
  isUpTrend,
  iconColor,
  gridColor,
}: SalesTrendCanvasProps) {
  const salesStyles = useSalesStyles();
  const [plotWidth, setPlotWidth] = useState(0);
  const gradientIdRef = useRef(
    `salesTrendGradient_${Math.random().toString(36).slice(2, 10)}`,
  );

  const handlePlotLayout = (event: LayoutChangeEvent) => {
    const width = Math.max(120, Math.floor(event.nativeEvent.layout.width));
    setPlotWidth((prev) => (prev === width ? prev : width));
  };

  const getX = useCallback(
    (index: number) => {
      if (values.length <= 1) return plotWidth / 2;
      return (index / (values.length - 1)) * plotWidth;
    },
    [plotWidth, values.length],
  );

  const getY = useCallback(
    (value: number) => {
      const ratio = (value - yMin) / yRange;
      return plotHeight - ratio * plotHeight;
    },
    [plotHeight, yMin, yRange],
  );

  const linePoints = useMemo(
    () =>
      values.map((value, index) => `${getX(index)},${getY(value)}`).join(" "),
    [getX, getY, values],
  );

  const areaFillPoints = useMemo(() => {
    if (values.length <= 1 || !plotWidth) return "";
    return `0,${plotHeight} ${linePoints} ${plotWidth},${plotHeight}`;
  }, [linePoints, plotHeight, plotWidth, values.length]);

  return (
    <View style={salesStyles.trendSvgWrap} onLayout={handlePlotLayout}>
      {plotWidth > 0 ? (
        <Svg width={plotWidth} height={plotHeight}>
          <Defs>
            <LinearGradient
              id={gradientIdRef.current}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <Stop
                offset="0"
                stopColor={trendLineColor}
                stopOpacity={isUpTrend ? 0.24 : 0.2}
              />
              <Stop offset="1" stopColor={trendLineColor} stopOpacity={0.02} />
            </LinearGradient>
          </Defs>

          {tickValues.map((_, index) => {
            const ratio = index / (tickValues.length - 1);
            const y = ratio * plotHeight;
            return (
              <Line
                key={`grid_h_${index}`}
                x1={0}
                y1={y}
                x2={plotWidth}
                y2={y}
                stroke={gridColor}
                strokeWidth={1}
              />
            );
          })}

          {[0, 0.5, 1].map((ratio) => {
            const x = ratio * plotWidth;
            return (
              <Line
                key={`grid_v_${ratio}`}
                x1={x}
                y1={0}
                x2={x}
                y2={plotHeight}
                stroke={colorWithOpacity(iconColor, 0.08)}
                strokeWidth={1}
              />
            );
          })}

          {values.length > 1 ? (
            <Polygon
              points={areaFillPoints}
              fill={`url(#${gradientIdRef.current})`}
            />
          ) : null}

          <Polyline
            points={linePoints}
            fill="none"
            stroke={trendLineColor}
            strokeWidth={2.8}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {values.map((value, index) => (
            <Circle
              key={`dot_${index}`}
              cx={getX(index)}
              cy={getY(value)}
              r={index === values.length - 1 ? 4.8 : 3}
              fill={
                index === values.length - 1
                  ? trendLineColor
                  : colorWithOpacity(trendLineColor, 0.78)
              }
            />
          ))}
        </Svg>
      ) : null}
    </View>
  );
}

export const SalesTrendCanvas = memo(SalesTrendCanvasComponent);
