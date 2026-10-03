import type { PortfolioSummary } from "@/lib/types";
import {
  formatCurrency,
  formatRatioAsPercent,
  formatSignedCurrency,
  formatSignedPercent,
} from "@/lib/format";

type Tone = "positive" | "negative" | "neutral";

const TONE_CLASS: Record<Tone, string> = {
  positive: "text-emerald-600",
  negative: "text-red-600",
  neutral: "text-zinc-500",
};

const TONE_ICON: Record<Tone, string> = {
  positive: "▲",
  negative: "▼",
  neutral: "–",
};

function toneOf(value: number): Tone {
  if (value > 0) return "positive";
  if (value < 0) return "negative";
  return "neutral";
}

export type PortfolioSummaryCardProps = Pick<
  PortfolioSummary,
  | "totalMarketValue"
  | "dayChangeAmount"
  | "dayChangePercent"
  | "totalReturnSinceInception"
> & {
  currency?: string;
};

export function PortfolioSummaryCard({
  totalMarketValue,
  dayChangeAmount,
  dayChangePercent,
  totalReturnSinceInception,
  currency = "CAD",
}: PortfolioSummaryCardProps) {
  const dayTone = toneOf(dayChangeAmount);
  const returnTone = toneOf(totalReturnSinceInception);

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-6">
      <dl className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        <div>
          <dt className="text-sm font-medium text-zinc-500">
            Total Market Value ({currency})
          </dt>
          <dd className="mt-1 text-2xl font-semibold tracking-tight tabular-nums text-zinc-900">
            {formatCurrency(totalMarketValue, currency)}
          </dd>
        </div>

        <div>
          <dt className="text-sm font-medium text-zinc-500">Today&apos;s Change</dt>
          <dd
            className={`mt-1 flex flex-wrap items-baseline gap-x-2 text-2xl font-semibold tracking-tight tabular-nums ${TONE_CLASS[dayTone]}`}
          >
            <span aria-hidden="true" className="text-base">
              {TONE_ICON[dayTone]}
            </span>
            <span>{formatSignedCurrency(dayChangeAmount, currency)}</span>
            <span className="text-base font-medium">
              ({formatSignedPercent(dayChangePercent)})
            </span>
          </dd>
        </div>

        <div>
          <dt className="text-sm font-medium text-zinc-500">
            Total Return Since Inception
          </dt>
          <dd
            className={`mt-1 text-2xl font-semibold tracking-tight tabular-nums ${TONE_CLASS[returnTone]}`}
          >
            {formatRatioAsPercent(totalReturnSinceInception)}
          </dd>
        </div>
      </dl>
    </div>
  );
}
