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
