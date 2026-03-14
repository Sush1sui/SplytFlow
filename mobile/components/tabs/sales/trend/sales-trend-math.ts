import { formatCompactMoney } from "../formatters";

export const getXAxisLabels = (labels: string[]) => {
  if (labels.length <= 2) return labels;
  const middleIndex = Math.floor((labels.length - 1) / 2);
  return [labels[0], labels[middleIndex], labels[labels.length - 1]];
};

export const getNiceBounds = (low: number, high: number) => {
  const safeLow = Math.max(0, low);
  const safeHigh = Math.max(safeLow, high);

  if (safeHigh <= 0) {
    return { min: 0, max: 1 };
  }

  if (Math.abs(safeHigh - safeLow) < 1e-6) {
    const buffer = Math.max(safeHigh * 0.15, 1);
    return {
      min: Math.max(0, safeLow - buffer),
      max: safeHigh + buffer,
    };
  }

  const spread = Math.max(safeHigh - safeLow, safeHigh * 0.2, 1);
  const rawMin = Math.max(0, safeLow - spread * 0.2);
  const rawMax = safeHigh + spread * 0.2;

  const magnitude = Math.pow(10, Math.floor(Math.log10(rawMax)));
  const step = Math.max(magnitude / 4, 0.5);
  const min = Math.max(0, Math.floor(rawMin / step) * step);
  const max = Math.ceil(rawMax / step) * step;

  return {
    min,
    max: max <= min ? min + step : max,
  };
};

export const formatAxisTick = (value: number) => {
  if (value >= 1000) {
    return formatCompactMoney(value);
  }

  if (value >= 100) {
    return value.toLocaleString(undefined, { maximumFractionDigits: 0 });
  }

  if (value >= 10) {
    return value.toLocaleString(undefined, { maximumFractionDigits: 1 });
  }

  return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
};
