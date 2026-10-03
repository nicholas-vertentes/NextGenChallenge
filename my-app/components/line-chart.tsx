"use client";

import { useMemo, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { formatCurrency } from "@/lib/format";
import { useElementSize } from "@/lib/use-element-size";

export type LineChartPoint = {
  date: string;
  value: number;
};

type LineChartProps = {
  points: LineChartPoint[];
  height?: number;
  formatValue?: (value: number) => string;
  ariaLabel?: string;
};

const compactCurrency = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
  notation: "compact",
  maximumFractionDigits: 1,
});

function parseLocalDate(date: string): Date {
  return new Date(`${date}T00:00:00`);
}

function niceNum(range: number, round: boolean): number {
  if (range <= 0) return 0;
  const exponent = Math.floor(Math.log10(range));
  const fraction = range / 10 ** exponent;
  let niceFraction: number;
  if (round) {
    if (fraction < 1.5) niceFraction = 1;
    else if (fraction < 3) niceFraction = 2;
    else if (fraction < 7) niceFraction = 5;
    else niceFraction = 10;
  } else {
    if (fraction <= 1) niceFraction = 1;
    else if (fraction <= 2) niceFraction = 2;
    else if (fraction <= 5) niceFraction = 5;
    else niceFraction = 10;
  }
  return niceFraction * 10 ** exponent;
}

function modalStepDays(points: LineChartPoint[]): number {
  if (points.length < 2) return 1;
  const counts = new Map<number, number>();
  for (let i = 1; i < points.length; i++) {
    const days = Math.round(
      (Date.parse(points[i].date) - Date.parse(points[i - 1].date)) /
        86_400_000,
    );
    if (days > 0) counts.set(days, (counts.get(days) ?? 0) + 1);
  }
  let best = 1;
  let bestCount = -1;
  for (const [days, count] of counts) {
    if (count > bestCount) {
      best = days;
      bestCount = count;
    }
  }
  return best;
}

function pickTickIndices(count: number, tickCount = 5): number[] {
  if (count <= 0) return [];
  if (count === 1) return [0];
  const indices: number[] = [];
  const seen = new Set<number>();
  for (let i = 0; i < tickCount; i++) {
    const idx = Math.round((i / (tickCount - 1)) * (count - 1));
    if (!seen.has(idx)) {
      seen.add(idx);
      indices.push(idx);
    }
  }
  return indices;
}

type PlotPoint = {
  date: string;
  value: number;
  x: number;
  y: number;
};

type ChartLayout = {
  plot: { left: number; right: number; top: number; bottom: number };
  plotWidth: number;
  plotHeight: number;
  points: PlotPoint[];
  segments: PlotPoint[][];
  yTicks: { value: number; y: number }[];
  xTicks: { date: string; x: number }[];
};

export function LineChart({
  points,
  height = 320,
  formatValue = (value) => formatCurrency(value),
  ariaLabel = "Line chart",
}: LineChartProps) {
  const { ref, width } = useElementSize<HTMLDivElement>();
  const [hover, setHover] = useState<PlotPoint | null>(null);

  const sorted = useMemo(
    () => [...points].sort((a, b) => a.date.localeCompare(b.date)),
    [points],
  );

  const layout: ChartLayout | null = useMemo(() => {
    if (width <= 0 || sorted.length === 0) return null;

    const plot = { left: 60, right: 16, top: 16, bottom: 32 };
    const plotWidth = Math.max(0, width - plot.left - plot.right);
    const plotHeight = Math.max(0, height - plot.top - plot.bottom);

    let min = Infinity;
    let max = -Infinity;
    for (const p of sorted) {
      if (p.value < min) min = p.value;
      if (p.value > max) max = p.value;
    }

    const span = max - min;
    const paddedMin =
      span === 0
        ? min - Math.max(Math.abs(min) * 0.05, 1)
        : min - span * 0.05;
    const paddedMax =
      span === 0
        ? max + Math.max(Math.abs(max) * 0.05, 1)
        : max + span * 0.05;
    const range = niceNum(paddedMax - paddedMin, false);
    const step = niceNum(range / 4, true);
    const yMin = Math.floor(paddedMin / step) * step;
    const yMax = Math.ceil(paddedMax / step) * step;

    const yFor = (value: number) =>
      plot.top + ((yMax - value) / (yMax - yMin || 1)) * plotHeight;

    const firstMs = Date.parse(sorted[0].date);
    const lastMs = Date.parse(sorted[sorted.length - 1].date);
    const xSpan = lastMs - firstMs;
    const xPad = xSpan > 0 ? xSpan * 0.02 : 86_400_000;
    const xMin = firstMs - xPad;
    const xMax = lastMs + xPad;
    const xFor = (date: string) => {
      if (xSpan <= 0) return plot.left + plotWidth / 2;
      const ms = Date.parse(date);
      return plot.left + ((ms - xMin) / (xMax - xMin)) * plotWidth;
    };

    const plotPoints: PlotPoint[] = sorted.map((p) => ({
      date: p.date,
      value: p.value,
      x: xFor(p.date),
      y: yFor(p.value),
    }));

    const stepDays = modalStepDays(sorted);
    const segments: PlotPoint[][] = [];
    let current: PlotPoint[] = [];
    for (let i = 0; i < plotPoints.length; i++) {
      if (i > 0) {
        const days = Math.round(
          (Date.parse(sorted[i].date) - Date.parse(sorted[i - 1].date)) /
            86_400_000,
        );
        if (days > stepDays) {
          segments.push(current);
          current = [];
        }
      }
      current.push(plotPoints[i]);
    }
    if (current.length > 0) segments.push(current);

    const yTicks: { value: number; y: number }[] = [];
    for (let v = yMin; v <= yMax + step * 1e-6; v += step) {
      yTicks.push({ value: Number(v.toFixed(10)), y: yFor(v) });
    }

    const xTicks = pickTickIndices(sorted.length).map((i) => ({
      date: sorted[i].date,
      x: plotPoints[i].x,
    }));

    return {
      plot,
      plotWidth,
      plotHeight,
      points: plotPoints,
      segments,
      yTicks,
      xTicks,
    };
  }, [width, height, sorted]);

  function handlePointer(event: ReactPointerEvent<SVGSVGElement>) {
    if (!layout) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const px = event.clientX - rect.left;
    let best = layout.points[0];
    let bestDist = Infinity;
    for (const pt of layout.points) {
      const dist = Math.abs(pt.x - px);
      if (dist < bestDist) {
        bestDist = dist;
        best = pt;
      }
    }
    setHover(best);
  }

  const xTickFormat = useMemo(() => {
    if (sorted.length < 2) {
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
      });
    }
    const spanDays = Math.round(
      (Date.parse(sorted[sorted.length - 1].date) -
        Date.parse(sorted[0].date)) /
        86_400_000,
    );
    return new Intl.DateTimeFormat(
      "en-US",
      spanDays > 540
        ? { month: "short", year: "numeric" }
        : { month: "short", day: "numeric" },
    );
  }, [sorted]);

  const tooltipDateFormat = useMemo(
    () =>
      new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    [],
  );

  const tooltipLeft = hover
    ? Math.min(Math.max(hover.x, 60), Math.max(60, width - 60))
    : 0;
  const tooltipTop = hover ? Math.max(hover.y - 12, 8) : 0;

  return (
    <div ref={ref} className="relative w-full" style={{ height }}>
      {layout && (
        <>
          <svg
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            role="img"
            aria-label={ariaLabel}
            onPointerMove={handlePointer}
            onPointerDown={handlePointer}
            onPointerLeave={() => setHover(null)}
          >
            {/* gridlines + y-axis labels */}
            {layout.yTicks.map((tick) => (
              <g key={`y-${tick.value}`}>
                <line
                  x1={layout.plot.left}
                  x2={layout.plot.left + layout.plotWidth}
                  y1={tick.y}
                  y2={tick.y}
                  stroke="#e4e4e7"
                  strokeWidth={1}
                />
                <text
                  x={layout.plot.left - 8}
                  y={tick.y + 4}
                  textAnchor="end"
                  className="fill-zinc-500"
                  fontSize={11}
                >
                  {compactCurrency.format(tick.value)}
                </text>
              </g>
            ))}

            {/* x-axis labels */}
            {layout.xTicks.map((tick) => (
              <text
                key={`x-${tick.date}`}
                x={tick.x}
                y={height - 8}
                textAnchor="middle"
                className="fill-zinc-500"
                fontSize={11}
              >
                {xTickFormat.format(parseLocalDate(tick.date))}
              </text>
            ))}

            {/* line segments (broken across data gaps) */}
            {layout.segments.map((segment, i) => (
              <polyline
                key={`segment-${i}`}
                points={segment.map((p) => `${p.x},${p.y}`).join(" ")}
                fill="none"
                className="stroke-blue-600"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}

            {/* point markers for small datasets */}
            {sorted.length <= 60 &&
              layout.points.map((p) => (
                <circle
                  key={`dot-${p.date}`}
                  cx={p.x}
                  cy={p.y}
                  r={3}
                  className="fill-blue-600"
                />
              ))}

            {/* hover crosshair + marker */}
            {hover && (
              <g>
                <line
                  x1={hover.x}
                  x2={hover.x}
                  y1={layout.plot.top}
                  y2={layout.plot.top + layout.plotHeight}
                  stroke="#a1a1aa"
                  strokeWidth={1}
                  strokeDasharray="4 4"
                />
                <circle
                  cx={hover.x}
                  cy={hover.y}
                  r={4}
                  className="fill-blue-600"
                  stroke="#ffffff"
                  strokeWidth={2}
                />
              </g>
            )}
          </svg>

          {hover && (
            <div
              className="pointer-events-none absolute z-10 rounded-md bg-zinc-900 px-2.5 py-1.5 text-xs text-white shadow"
              style={{
                left: tooltipLeft,
                top: tooltipTop,
                transform: "translate(-50%, -100%)",
              }}
            >
              <div className="font-medium">
                {tooltipDateFormat.format(parseLocalDate(hover.date))}
              </div>
              <div className="text-zinc-300">{formatValue(hover.value)}</div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
