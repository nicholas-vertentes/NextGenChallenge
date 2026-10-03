"use client";

import { usePortfolio } from "@/lib/use-portfolio";
import {
  formatCurrency,
  formatRatioPercent,
  formatSignedCurrency,
  formatSignedPercent,
} from "@/lib/format";

type Tone = "positive" | "negative" | "neutral";

function toneOf(value: number): Tone {
  if (value > 0) return "positive";
  if (value < 0) return "negative";
  return "neutral";
}

const TONE_TEXT: Record<Tone, string> = {
  positive: "text-emerald-600",
  negative: "text-red-600",
  neutral: "text-zinc-500",
};

export function PortfolioSummary({
  accountId,
  scenario,
}: {
  accountId: string;
  scenario?: string;
}) {
  const { status, data, error } = usePortfolio(accountId, scenario);

  if (status === "loading") {
    return (
      <div className="rounded-lg border border-zinc-200 bg-white p-6 text-sm text-zinc-500">
        Loading summary…
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        Failed to load summary: {error}
      </div>
    );
  }

  const { portfolio } = data;
  const dayTone = toneOf(portfolio.dayChangeAmount);
  const returnTone = toneOf(portfolio.totalReturnSinceInception);

  return (
    <div className="grid grid-cols-1 gap-4 rounded-lg border border-zinc-200 bg-white p-6 sm:grid-cols-3">
      <div>
        <p className="text-sm text-zinc-500">Total Market Value</p>
        <p className="mt-1 text-3xl font-semibold text-zinc-900">
          {formatCurrency(portfolio.totalMarketValue, portfolio.currency)}
        </p>
      </div>

      <div>
        <p className="text-sm text-zinc-500">Day Change</p>
        <p className={`mt-1 text-3xl font-semibold ${TONE_TEXT[dayTone]}`}>
          {formatSignedCurrency(portfolio.dayChangeAmount, portfolio.currency)}
        </p>
        <p className={`text-sm font-medium ${TONE_TEXT[dayTone]}`}>
          {formatSignedPercent(portfolio.dayChangePercent)}
        </p>
      </div>

      <div>
        <p className="text-sm text-zinc-500">Total Return Since Inception</p>
        <p className={`mt-1 text-3xl font-semibold ${TONE_TEXT[returnTone]}`}>
          {formatRatioPercent(portfolio.totalReturnSinceInception)}
        </p>
      </div>
    </div>
  );
}
