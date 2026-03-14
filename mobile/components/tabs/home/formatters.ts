export const formatAmount = (value: number) =>
  value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export const formatSaleTime = (dateValue: string) => {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "--:--";

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const sanitizeSaleAmountInput = (value: string) => {
  const sanitized = value.replace(/[^0-9.]/g, "");
  const [whole = "", ...decimalParts] = sanitized.split(".");
  const normalized =
    decimalParts.length > 0 ? `${whole}.${decimalParts.join("")}` : whole;

  if (normalized.includes(".")) {
    const [intPart, decPart = ""] = normalized.split(".");
    return `${intPart}.${decPart.slice(0, 2)}`;
  }

  return normalized;
};
