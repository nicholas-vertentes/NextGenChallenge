"use client";

import { usePortfolio } from "@/lib/use-portfolio";
import { HoldingsTable } from "@/components/holdings-table";

export function PortfolioHoldings({
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
        Loading holdings…
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-sm text-red-700">
        Failed to load holdings: {error}
      </div>
    );
  }

  return <HoldingsTable holdings={data.holdings} />;
}
