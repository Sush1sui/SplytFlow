export const SUPPORTED_CURRENCIES = [
  "USD",
  "EUR",
  "GBP",
  "AUD",
  "CAD",
  "JPY",
  "PHP",
  "SGD",
  "INR",
  "MYR",
  "THB",
  "IDR",
  "KRW",
  "CNY",
  "AED",
] as const;

export type SupportedCurrencyCode = (typeof SUPPORTED_CURRENCIES)[number];

export type CurrencyOption = {
  code: SupportedCurrencyCode;
  name: string;
};

const CURRENCY_NAME_MAP: Record<SupportedCurrencyCode, string> = {
  USD: "US Dollar",
  EUR: "Euro",
  GBP: "British Pound",
  AUD: "Australian Dollar",
  CAD: "Canadian Dollar",
  JPY: "Japanese Yen",
  PHP: "Philippine Peso",
  SGD: "Singapore Dollar",
  INR: "Indian Rupee",
  MYR: "Malaysian Ringgit",
  THB: "Thai Baht",
  IDR: "Indonesian Rupiah",
  KRW: "South Korean Won",
  CNY: "Chinese Yuan",
  AED: "UAE Dirham",
};

const CURRENCY_SYMBOL_MAP: Record<SupportedCurrencyCode, string> = {
  USD: "$",
  EUR: "\u20AC",
  GBP: "\u00A3",
  AUD: "A$",
  CAD: "C$",
  JPY: "\u00A5",
  PHP: "\u20B1",
  SGD: "S$",
  INR: "\u20B9",
  MYR: "RM",
  THB: "\u0E3F",
  IDR: "Rp",
  KRW: "\u20A9",
  CNY: "\u00A5",
  AED: "\u062F.\u0625",
};

export const CURRENCY_OPTIONS: CurrencyOption[] = SUPPORTED_CURRENCIES.map(
  (code) => ({
    code,
    name: CURRENCY_NAME_MAP[code],
  }),
);

export function isSupportedCurrency(
  code: string | null | undefined,
): code is SupportedCurrencyCode {
  if (!code) return false;
  return SUPPORTED_CURRENCIES.includes(code as SupportedCurrencyCode);
}

export function currencySymbol(code: string): string {
  if (isSupportedCurrency(code)) {
    return CURRENCY_SYMBOL_MAP[code];
  }

  try {
    const parts = new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: code,
      currencyDisplay: "narrowSymbol",
    }).formatToParts(0);

    const symbolPart = parts.find((part) => part.type === "currency");
    return symbolPart?.value ?? code;
  } catch {
    return code;
  }
}

export function currencyLabel(code: SupportedCurrencyCode): string {
  return `${code} - ${CURRENCY_NAME_MAP[code]}`;
}
