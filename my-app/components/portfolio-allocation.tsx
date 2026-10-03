"use client";

import { usePortfolio } from "@/lib/use-portfolio";
import { AssetAllocationChart } from "@/components/asset-allocation-chart";

export function PortfolioAllocation({
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
        Loading asset allocation…
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-sm text-red-700">
        Failed to load asset allocation: {error}
      </div>
    );
  }

  if (data.allocation.length === 0) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-white p-8 text-sm text-zinc-500">
        No allocation data to display.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4">
      <AssetAllocationChart entries={data.allocation} />
    </div>
  );
}
