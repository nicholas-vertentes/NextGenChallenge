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

/** Format a monetary value with an explicit sign (positive gets "+"). */
export function formatSignedCurrency(value: number, currency = "CAD"): string {
  const formatted = getCurrencyFormatter(currency).format(Math.abs(value));
  if (value > 0) return `+${formatted}`;
  if (value < 0) return `-${formatted}`;
  return formatted; // zero stays neutral ("$0.00")
}

/** Format a value already in percent units with an explicit sign: 0.61 -> "+0.61%". */
export function formatSignedPercent(value: number): string {
  const formatted = `${Math.abs(value).toFixed(2)}%`;
  if (value > 0) return `+${formatted}`;
  if (value < 0) return `-${formatted}`;
  return formatted;
}

/** Format a ratio as a percentage: 0.187 -> "18.70%". */
export function formatRatioPercent(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}
