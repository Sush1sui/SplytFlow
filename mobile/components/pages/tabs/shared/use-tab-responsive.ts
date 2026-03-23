import { useMemo } from "react";
import { useWindowDimensions } from "react-native";

const BASE_WIDTH = 390;
const MIN_WIDTH = 320;
const MAX_WIDTH = 430;
const FONT_FACTOR = 0.84;
const SPACE_FACTOR = 0.92;

export default function useTabResponsive() {
  const { width } = useWindowDimensions();

  return useMemo(() => {
    const clampedWidth = Math.max(MIN_WIDTH, Math.min(width, MAX_WIDTH));
    const scale = clampedWidth / BASE_WIDTH;

    const font = (size: number, min = 12, max = size * 1.1) => {
      const scaled = size * scale * FONT_FACTOR;
      return Math.max(min, Math.min(max, scaled));
    };

    const space = (size: number) => {
      return Math.round(size * scale * SPACE_FACTOR);
    };

    return {
      width,
      isNarrow: width < 360,
      scale,
      font,
      space,
    };
  }, [width]);
}
