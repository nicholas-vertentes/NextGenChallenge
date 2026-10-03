"use client";

import { usePortfolio } from "@/lib/use-portfolio";
import { LineChart } from "@/components/line-chart";

export function PortfolioChart({
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
        Loading portfolio value…
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-sm text-red-700">
        Failed to load portfolio value: {error}
      </div>
    );
  }

  if (data.performanceHistory.length === 0) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-white p-8 text-sm text-zinc-500">
        No performance history to display.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4">
      <LineChart
        points={data.performanceHistory.map((point) => ({
          date: point.date,
          value: point.marketValue,
        }))}
        ariaLabel="Portfolio market value over time"
      />
    </div>
  );
}
