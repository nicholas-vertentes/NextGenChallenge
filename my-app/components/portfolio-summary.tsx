"use client";

import { usePortfolio } from "@/lib/use-portfolio";
import { PortfolioSummaryCard } from "@/components/portfolio-summary-card";

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
      <div className="rounded-lg border border-zinc-200 bg-white p-8 text-sm text-zinc-500">
        Loading summary…
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-sm text-red-700">
        Failed to load summary: {error}
      </div>
    );
  }

  const { portfolio } = data;

  return (
    <PortfolioSummaryCard
      totalMarketValue={portfolio.totalMarketValue}
      dayChangeAmount={portfolio.dayChangeAmount}
      dayChangePercent={portfolio.dayChangePercent}
      totalReturnSinceInception={portfolio.totalReturnSinceInception}
      currency={portfolio.currency}
    />
  );
}
