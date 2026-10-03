# Task 5 — Asset Allocation Chart: Plan

- Task: 5. Asset Allocation Chart (`frontend/REQUIREMENTS.md`)
- Date: 2026-10-03
- Status: plan (pending design confirmation)
- Parallel-workflow note: this task creates **new files only**. It must not
  modify `app/page.tsx`, `docs/DECISIONS.md`, or any `task-3` files while
  `task-3` is in flight.

---

## 1. Goal

Show how the portfolio is distributed across asset classes using a pie or
donut chart, with one segment per asset class, each labeled with its name and
percentage of the total, and visually distinct colors.

## 2. Real data shape (from the mock)

The endpoint `GET /portfolios/P-9001` returns an `allocation` array. Default
scenario (verified against `http://localhost:4000/portfolios/P-9001`):

```json
[
  { "assetClass": "Equity", "value": 31050 },
  { "assetClass": "Fixed Income", "value": 21630 },
  { "assetClass": "Cash", "value": 8000 },
  { "assetClass": "Alternatives", "value": 5000 }
]
```

- Total = `31050 + 21630 + 8000 + 5000 = 65680`, which equals
  `portfolio.totalMarketValue` in the default dataset.
- Expected percentages (rounded to 1 decimal): Equity 47.3%, Fixed Income
  32.9%, Cash 12.2%, Alternatives 7.6%.
- The type already exists in `lib/types.ts` and is reused as-is:
  ```ts
  export type AllocationEntry = { assetClass: string; value: number };
  ```
- `lib/use-portfolio.ts` already returns `data.allocation` in its
  `PortfolioResponse`, so Task 5 needs no new fetch logic — it reuses the same
  hook and pattern as Task 3's `PortfolioHoldings`.

## 3. Design decisions (open questions → recommended defaults)

Per `AGENTS.md`, ask design questions before building. Recommendations below;
"use your defaults" means proceed with these.

**Q1 — Chart rendering approach**
- A. Hand-rolled SVG donut (no new dependency). **Recommended.**
- B. Recharts / Chart.js donut (adds a dependency; `AGENTS.md` requires asking
  first).
- C. CSS `conic-gradient` (cheap, but hard to label `<1%` slices and no arc
  math for tooltips).

Recommendation: **A** — a donut is simple arc geometry; it avoids dependency
review and gives full control over tiny-slice labeling and accessibility.

**Q2 — Pie vs donut**
- Donut with the total market value in the center (**recommended**); pie is
  acceptable but wastes the center.

**Q3 — How to label tiny slices**
- Always render an HTML legend (name + value + %). Add on-slice % labels only
  when the arc is above a threshold (~3%) to avoid illegible overlapping text.
  `<1%` slices stay visible via the legend (**recommended**).

**Q4 — Percentage source**
- Compute percentages from `sum(allocation[].value)` (**recommended**), not
  `portfolio.totalMarketValue`, so the chart is self-consistent even if the
  two ever diverge.

**Q5 — Colors**
- Fixed palette keyed by asset-class name (Equity = emerald, Fixed Income =
  sky, Cash = amber, Alternatives = violet), plus a deterministic HSL fallback
  by index for unknown classes in other scenarios. **Recommended.**

**Q6 — Segment order**
- Keep API order (matches the fixed palette and the holdings table's weight
  grouping). Optionally sort descending by value for readability.

## 4. Proposed files (all new — no existing file touched)

| File | Purpose |
| --- | --- |
| `my-app/components/asset-allocation-chart.tsx` | Presentational donut + legend. Props: `{ entries: AllocationEntry[] }`. Client component (`"use client"`) so hover tooltips work. Reuses `formatCurrency` / `formatPercent` from `lib/format.ts`. |
| `my-app/components/portfolio-allocation.tsx` | Data wrapper mirroring `PortfolioHoldings`: calls `usePortfolio(accountId, scenario)` and renders `AssetAllocationChart` with `data.allocation`; owns loading / error / empty states. |
| `my-app/docs/DECISIONS.md` | Append `D-0XX` entry **only when the task is built** (append-only; not now). |

Integration note: wiring `<PortfolioAllocation>` into `app/page.tsx` is a
one-line insertion to be done on the Task 5 branch **after** `task-3` merges,
so `page.tsx` is not touched during parallel work.

## 5. Component contract / algorithm

1. Compute `total = entries.reduce((s, e) => s + e.value, 0)`.
2. If `entries.length === 0 || total <= 0`, render the empty state.
3. Walk entries cumulatively to produce start/end angles; render one SVG arc
   per entry (donut: filled ring with a center hole; single 100% slice renders
   as a full ring — special-case so it doesn't draw a degenerate zero arc).
4. Legend rows: color swatch, `assetClass`, `formatCurrency(value)`, and
   percentage with one decimal (never "0%" for a non-zero tiny slice).
5. Accessibility: `role="img"` with a summary `aria-label`
   (e.g. "Equity 47.3%, Fixed Income 32.9%, …"); per-slice `<title>` for
   tooltips; legend is real HTML text.
6. No attempt to force percentages to sum to 100 — display rounded values
   (spec explicitly says not to correct rounding).

## 6. Edge cases → handling

| Case (spec / discovered) | How it's handled | Where | Verify how |
| --- | --- | --- | --- |
| Single asset class (100%) | One full-ring segment; legend shows 100% | `asset-allocation-chart.tsx` | `?scenario=single-class` |
| Tiny allocation (<1%) | Always in legend with name/value/%; on-slice label suppressed below threshold | `asset-allocation-chart.tsx` | `?scenario=tiny-allocation` |
| Empty / zero allocation | "No allocation data" empty state, no broken chart | `portfolio-allocation.tsx` | `?scenario=empty` |
| Percentages not summing to 100 (rounding) | Not corrected; rounded to 1 decimal | `asset-allocation-chart.tsx` | default (4 classes) |
| Large portfolio (60 holdings) | Allocation groups by assetClass, so still a few slices | `asset-allocation-chart.tsx` | `?scenario=large` |
| Loading / error | Reuse `usePortfolio` status states | `portfolio-allocation.tsx` | `?delayMs=2000`, `?fail=true` |

## 7. Definition of Done checklist

- [ ] Donut renders with all 4 default categories visible and labeled (name + %).
- [ ] Segments are color-coded and legible at desktop width.
- [ ] Tooltip / legend shows exact value per segment.
- [ ] Single-class scenario renders without breaking.
- [ ] Tiny-allocation scenario keeps the small slice visible/labeled.
- [ ] Empty scenario shows a graceful empty state.
- [ ] No console errors or warnings on load.
- [ ] Decision log entry appended (after build).
- [ ] Chat summary: what was built, decisions made, open questions.

## 8. Assumptions

- `allocation` values are native CAD (per `support/PORTFOLIO-API.md`); the
  currency toggle in Task 7 will convert at display time, so this component
  should render CAD now and accept a currency/format source later without a
  refactor.
- Allocation entries can be fewer than the four asset classes seen in the
  default dataset (e.g. single-class scenario), so colors/percentages must not
  assume exactly four.
- The mock does not filter allocation by date; the whole-portfolio allocation
  is shown (date-range task applies to the performance chart only).
