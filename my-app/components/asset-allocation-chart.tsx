"use client";

import type { AllocationEntry } from "@/lib/types";
import { formatCurrency, formatPercent } from "@/lib/format";

type Segment = {
  assetClass: string;
  value: number;
  color: string;
  percent: number; // 0–100, share of total
  offset: number; // cumulative percent before this segment
};

const SIZE = 200;
const CENTER = 100;
const OUTER_RADIUS = 80;
const INNER_RADIUS = 50;
const RING_RADIUS = (OUTER_RADIUS + INNER_RADIUS) / 2;
const RING_WIDTH = OUTER_RADIUS - INNER_RADIUS;

const ASSET_CLASS_COLORS: Record<string, string> = {
  Equity: "#10b981", // emerald-500
  "Fixed Income": "#0ea5e9", // sky-500
  Cash: "#f59e0b", // amber-500
  Alternatives: "#8b5cf6", // violet-500
};

const compactCurrency = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
  notation: "compact",
  maximumFractionDigits: 1,
});

function colorFor(assetClass: string, index: number): string {
  return (
    ASSET_CLASS_COLORS[assetClass] ??
    `hsl(${Math.round((index * 137.508 + 210) % 360)} 65% 45%)`
  );
}

function buildSegments(entries: AllocationEntry[]): Segment[] {
  const positive = entries.filter((entry) => entry.value > 0);
  const total = positive.reduce((sum, entry) => sum + entry.value, 0);
  if (total <= 0) return [];

  let cumulative = 0;
  return positive.map((entry, index) => {
    const percent = (entry.value / total) * 100;
    const segment: Segment = {
      assetClass: entry.assetClass,
      value: entry.value,
      color: colorFor(entry.assetClass, index),
      percent,
      offset: cumulative,
    };
    cumulative += percent;
    return segment;
  });
}

export function AssetAllocationChart({
  entries,
}: {
  entries: AllocationEntry[];
}) {
  const segments = buildSegments(entries);
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);

  if (segments.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-8 text-center text-sm text-zinc-500">
        No allocation data to display.
      </div>
    );
  }

  const summary = segments
    .map((segment) => `${segment.assetClass} ${formatPercent(segment.percent)}`)
    .join(", ");

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-center">
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        role="img"
        aria-label={`Asset allocation: ${summary}`}
        className="shrink-0"
      >
        <g transform={`rotate(-90 ${CENTER} ${CENTER})`}>
          {segments.map((segment) => (
            <circle
              key={segment.assetClass}
              cx={CENTER}
              cy={CENTER}
              r={RING_RADIUS}
              fill="none"
              stroke={segment.color}
              strokeWidth={RING_WIDTH}
              pathLength={100}
              strokeDasharray={`${segment.percent} ${100 - segment.percent}`}
              strokeDashoffset={-segment.offset}
            >
              <title>
                {`${segment.assetClass} — ${formatPercent(segment.percent)} (${formatCurrency(segment.value)})`}
              </title>
            </circle>
          ))}
        </g>
        <text
          x={CENTER}
          y={CENTER - 6}
          textAnchor="middle"
          className="fill-zinc-900"
          fontSize={16}
          fontWeight={600}
        >
          {compactCurrency.format(total)}
        </text>
        <text
          x={CENTER}
          y={CENTER + 14}
          textAnchor="middle"
          className="fill-zinc-500"
          fontSize={10}
        >
          Total
        </text>
      </svg>

      <ul className="w-full space-y-2 sm:w-auto sm:min-w-64">
        {segments.map((segment) => (
          <li
            key={segment.assetClass}
            className="flex items-center justify-between gap-3"
          >
            <span className="flex min-w-0 items-center gap-2">
              <span
                aria-hidden="true"
                className="h-3 w-3 shrink-0 rounded-full"
                style={{ backgroundColor: segment.color }}
              />
              <span className="truncate text-sm text-zinc-700">
                {segment.assetClass}
              </span>
            </span>
            <span className="shrink-0 text-right text-sm text-zinc-500">
              {formatPercent(segment.percent)} · {formatCurrency(segment.value)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
