const clampAlpha = (alpha: number) => Math.max(0, Math.min(1, alpha));

const parseHexColor = (value: string) => {
  const hex = value.replace("#", "").trim();

  if (hex.length === 3) {
    const r = parseInt(hex[0] + hex[0], 16);
    const g = parseInt(hex[1] + hex[1], 16);
    const b = parseInt(hex[2] + hex[2], 16);
    return { r, g, b };
  }

  if (hex.length === 6 || hex.length === 8) {
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return { r, g, b };
  }

  return null;
};

const parseRgbColor = (value: string) => {
  const match = value.match(/^rgba?\(([^)]+)\)$/i);
  if (!match) return null;

  const parts = match[1]
    .split(",")
    .map((part) => Number.parseFloat(part.trim()))
    .filter((part) => Number.isFinite(part));

  if (parts.length < 3) return null;

  const r = Math.max(0, Math.min(255, parts[0]));
  const g = Math.max(0, Math.min(255, parts[1]));
  const b = Math.max(0, Math.min(255, parts[2]));
  return { r, g, b };
};

export const colorWithOpacity = (color: string, alpha: number) => {
  const normalized = (color || "").trim();
  const clamped = clampAlpha(alpha);

  const hex = parseHexColor(normalized);
  if (hex) {
    return `rgba(${hex.r}, ${hex.g}, ${hex.b}, ${clamped})`;
  }

  const rgb = parseRgbColor(normalized);
  if (rgb) {
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${clamped})`;
  }

  return color;
};
