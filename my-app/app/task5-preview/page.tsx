import { PortfolioAllocation } from "@/components/portfolio-allocation";

export default async function Task5Preview(
  props: PageProps<"/task5-preview">,
) {
  const { scenario } = await props.searchParams;
  const normalizedScenario =
    typeof scenario === "string" ? scenario : undefined;

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <h1 className="text-xl font-semibold text-zinc-900">
        Task 5 preview{normalizedScenario ? ` — ${normalizedScenario}` : ""}
      </h1>
      <PortfolioAllocation accountId="P-9001" scenario={normalizedScenario} />
    </div>
  );
}
