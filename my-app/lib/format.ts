const currencyFormatters: Record<string, Intl.NumberFormat> = {};

function getCurrencyFormatter(currency: string): Intl.NumberFormat {
  if (!currencyFormatters[currency]) {
    currencyFormatters[currency] = new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency,
    });
  }
  return currencyFormatters[currency];
}

/** Format a monetary value using Intl.NumberFormat (defaults to CAD). */
export function formatCurrency(value: number, currency = "CAD"): string {
  return getCurrencyFormatter(currency).format(value);
}

const signedCurrencyFormatters: Record<string, Intl.NumberFormat> = {};

function getSignedCurrencyFormatter(currency: string): Intl.NumberFormat {
  if (!signedCurrencyFormatters[currency]) {
    signedCurrencyFormatters[currency] = new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency,
      signDisplay: "exceptZero",
    });
  }
  return signedCurrencyFormatters[currency];
}

/**
 * Format a change amount with an explicit sign: 1520.44 -> "+$1,520.44".
 * Zero stays unsigned ("$0.00") so it reads as neutral.
 */
export function formatSignedCurrency(value: number, currency = "CAD"): string {
  return getSignedCurrencyFormatter(currency).format(value);
}

/** Format a plain number (e.g. quantity) with thousands separators. */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-CA").format(value);
}

/**
 * Format a value that is already expressed in percent (e.g. weightPercent,
 * dayChangePercent): 41.57 -> "41.57%". Does NOT multiply by 100.
 */
export function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}

/**
 * Signed variant of formatPercent for change values: 0.32 -> "+0.32%".
 * Zero stays unsigned ("0.00%").
 */
export function formatSignedPercent(value: number): string {
  return `${value > 0 ? "+" : ""}${value.toFixed(2)}%`;
}

const ratioPercentFormatter = new Intl.NumberFormat("en-CA", {
  style: "percent",
  minimumFractionDigits: 1,
  maximumFractionDigits: 2,
});

/**
 * Format a decimal ratio as a percentage (e.g. totalReturnSinceInception,
 * dividendYield): 0.187 -> "18.7%". Multiplies by 100.
 */
export function formatRatioAsPercent(value: number): string {
  return ratioPercentFormatter.format(value);
}
