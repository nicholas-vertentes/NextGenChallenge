import { PortfolioHoldings } from "@/components/portfolio-holdings";
import { PortfolioAllocation } from "@/components/portfolio-allocation";
import { PortfolioChart } from "@/components/portfolio-chart";

export default async function Home(props: PageProps<"/">) {
  const { scenario } = await props.searchParams;
  const normalizedScenario =
    typeof scenario === "string" ? scenario : undefined;

  return (
    <div className="flex h-full flex-col">
      <h2 className="text-2xl font-semibold text-zinc-900">
        Portfolio Overview
      </h2>

      {/* Summary region: future tasks populate this with dynamic data. */}
      <section
        aria-label="Portfolio summary"
        className="mt-6 rounded-lg border border-dashed border-zinc-300 bg-white p-6 text-sm text-zinc-500"
      >
        Portfolio summary will appear here.
      </section>

      <section
        aria-label="Asset allocation"
        className="mt-6 flex flex-col gap-3"
      >
        <h3 className="text-lg font-semibold text-zinc-900">Asset Allocation</h3>
        <PortfolioAllocation accountId="P-9001" scenario={normalizedScenario} />
      </section>

      <section aria-label="Portfolio value" className="mt-6 flex flex-col gap-3">
        <h3 className="text-lg font-semibold text-zinc-900">Portfolio Value</h3>
        <PortfolioChart accountId="P-9001" scenario={normalizedScenario} />
      </section>

      <section aria-label="Holdings" className="mt-6 flex flex-col gap-3">
        <h3 className="text-lg font-semibold text-zinc-900">Holdings</h3>
        <PortfolioHoldings accountId="P-9001" scenario={normalizedScenario} />
      </section>
    </div>
  );
}
