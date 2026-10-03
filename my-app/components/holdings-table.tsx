"use client";

import { useMemo, useState } from "react";
import type { Holding } from "@/lib/types";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";

type SortColumn =
  | "ticker"
  | "quantity"
  | "price"
  | "marketValue"
  | "weightPercent"
  | "gainLoss";

type SortDirection = "asc" | "desc";

const COLUMNS: { key: SortColumn; label: string; align: "left" | "right" }[] = [
  { key: "ticker", label: "Ticker / Name", align: "left" },
  { key: "quantity", label: "Quantity", align: "right" },
  { key: "price", label: "Price", align: "right" },
  { key: "marketValue", label: "Market Value", align: "right" },
  { key: "weightPercent", label: "Weight %", align: "right" },
  { key: "gainLoss", label: "Gain / Loss", align: "right" },
];

function compare(a: Holding, b: Holding, column: SortColumn): number {
  if (column === "ticker") {
    return a.ticker.localeCompare(b.ticker);
  }
  return (a[column] as number) - (b[column] as number);
}

export function HoldingsTable({ holdings }: { holdings: Holding[] }) {
  const [sortColumn, setSortColumn] = useState<SortColumn>("weightPercent");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const sorted = useMemo(() => {
    const copy = [...holdings];
    copy.sort((a, b) => {
      const result = compare(a, b, sortColumn);
      return sortDirection === "asc" ? result : -result;
    });
    return copy;
  }, [holdings, sortColumn, sortDirection]);

  function handleSort(column: SortColumn) {
    if (column === sortColumn) {
      setSortDirection((dir) => (dir === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortDirection("desc");
    }
  }

  if (holdings.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-8 text-center text-sm text-zinc-500">
        No holdings to display
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
      <div className="max-h-[28rem] overflow-y-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 z-10 bg-zinc-100">
            <tr>
              {COLUMNS.map((col) => {
                const isActive = col.key === sortColumn;
                return (
                  <th
                    key={col.key}
                    scope="col"
                    aria-sort={
                      isActive
                        ? sortDirection === "asc"
                          ? "ascending"
                          : "descending"
                        : "none"
                    }
                    className={`px-4 py-3 font-semibold text-zinc-600 ${
                      col.align === "right" ? "text-right" : "text-left"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleSort(col.key)}
                      className={`flex w-full items-center gap-1 hover:text-zinc-900 ${
                        col.align === "right" ? "justify-end" : "justify-start"
                      }`}
                    >
                      {col.label}
                      <span aria-hidden="true" className="w-3 text-xs">
                        {isActive ? (sortDirection === "asc" ? "↑" : "↓") : ""}
                      </span>
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {sorted.map((holding) => (
              <tr key={holding.ticker} className="hover:bg-zinc-50">
                <td className="px-4 py-3">
                  <span className="font-semibold text-zinc-900">
                    {holding.ticker}
                  </span>
                  <span className="block text-xs text-zinc-500">
                    {holding.name}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-zinc-700">
                  {formatNumber(holding.quantity)}
                </td>
                <td className="px-4 py-3 text-right text-zinc-700">
                  {formatCurrency(holding.price)}
                </td>
                <td className="px-4 py-3 text-right text-zinc-700">
                  {formatCurrency(holding.marketValue)}
                </td>
                <td className="px-4 py-3 text-right text-zinc-700">
                  {formatPercent(holding.weightPercent)}
                </td>
                <td
                  className={`px-4 py-3 text-right font-medium ${
                    holding.gainLoss > 0
                      ? "text-emerald-600"
                      : holding.gainLoss < 0
                        ? "text-red-600"
                        : "text-zinc-500"
                  }`}
                >
                  {formatCurrency(holding.gainLoss)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
