# Decision Log

This log records architectural and implementation decisions for the wealth
management portfolio dashboard. Append only — never delete or rewrite old
entries. If a decision changes, add a new entry that supersedes the old one
and reference its ID.

---

## D-001: Scaffold the base app shell (framework, layout, data source)
- Task: 1. Scaffold the Base App Shell
- Date: 2026-10-03
- Status: accepted
- Context: Build the dashboard from scratch per `frontend/REQUIREMENTS.md`.
  The challenge instructs building in `frontend/solution/`, but an existing
  Next.js 16.3.8 scaffold already lives in `my-app/` with its own AGENTS.md.
- Decision: Build in the existing `my-app/` Next.js app rather than creating
  `frontend/solution/`. Use a persistent app shell composed of a left sidebar
  plus a top header, with the page content rendered into a single `<main>`
  region. For later tasks, fetch data from the challenge mock server at
  `http://localhost:4000`.
- Alternatives considered:
  - `frontend/solution/` (new app): matches challenge instructions but requires
    re-scaffolding and porting the AGENTS.md workflow. Not chosen.
  - Top header nav only: simpler but less room as navigation grows. Not chosen.
  - Local `src/mocks/` data files (per AGENTS.md): self-contained but requires
    hand-building every edge-case dataset. Not chosen.
  - `docs/TASKS.md` + `docs/DECISIONS.md`: duplicating the spec into
    `docs/TASKS.md` was rejected; `frontend/REQUIREMENTS.md` stays canonical.
- Reasoning: Reusing the scaffold is fastest and already satisfies the
  "App runs locally" requirement. Sidebar + header is the conventional
  wealth-dashboard layout and reserves a place for the future currency toggle
  and account selector in the header. The mock server's `?scenario=` datasets
  map 1:1 to the spec's edge cases, so it is the most reliable data source.
- Decided by: agent recommendation I approved (answers provided via design
  questions).
- Assumptions:
  - `my-app/` is the frontend track's solution location.
  - `LayoutProps<"/">` (globally available in Next.js 16.3.8) is used for the
    root layout's props.
  - The shell is a client component (`"use client"`) so shared UI state
    (currency, account, sort, date range) can be added later without a
    refactor.
  - The workspace-level "build" task (msbuild) is unrelated and unused; build
    and lint run via `npm run build` / `npm run lint` inside `my-app/`.
- Edge cases:
  | Case (from spec or discovered) | How it's handled | Where (file) | Verified how |
  | --- | --- | --- | --- |
  | Persistent layout with only one working nav link | Sidebar renders a single `Link` to `/`; list structure allows adding links later | `components/sidebar.tsx` | Manual: click "Portfolio Overview" stays on `/` with no error |
  | Must not hardcode content later tasks will replace | Overview page shows only a heading and a labelled, empty summary placeholder (no fake numbers) | `app/page.tsx` | Manual visual check |
  | No console errors on load | Fresh dev server; DevTools + terminal checked for errors/warnings | `app/*`, `components/*` | `npm run dev` then inspect console |

---

## D-002: Holdings table (client fetch, sortable columns, scroll)
- Task: 3. Holdings Table
- Date: 2026-10-03
- Status: accepted
- Context: Render a sortable holdings table for P-9001 using the mock API.
  The spec requires sortable market value / weight % / gain-loss columns and
  gain/loss visual distinction; the mock provides scenario datasets for the
  edge cases. Task 2 (summary card) is not yet built, so the overview page
  still holds a placeholder summary.
- Decision: Fetch client-side with a `usePortfolio(accountId, scenario?)` hook
  returning `{ status, data, error }`. Render via a client `HoldingsTable`
  (all six columns sortable, toggling asc/desc, default weight% desc) inside a
  scrollable container with a sticky header. Thread an optional dev
  `?scenario=` query param from the page to the fetch URL for edge-case
  verification. Money/percent/number formatting lives in `lib/format.ts`
  (`Intl.NumberFormat`); gain/loss is green/red/neutral by sign (zero neutral).
- Alternatives considered:
  - Server component fetch (page passes holdings to client table): idiomatic
    but Task 8 (account selector) needs client re-fetch, so it would be
    refactored later. Not chosen.
  - Pagination: keeps the page short but adds state/controls. Not chosen;
    a scrollable table is simpler and sufficient for 60 rows.
  - Virtualization: adds a dependency (needs approval) and is overkill for 60
    rows. Not chosen.
  - Sort only the 3 required columns: meets the minimum; all-column sorting
    chosen for consistent UX.
  - Manual code edits for scenario verification: works but the query param is
    cleaner and persists for future tasks' verification.
- Reasoning: Client-side fetching avoids a Task 8 refactor and matches the
  mock's `delayMs`/`fail` scenarios (loading/error states). Scroll + sticky
  header handles 60 rows with no extra dependency or state. All-column sorting
  is a small, consistent UX win. The scenario query param lets every edge case
  be verified in the browser without editing code.
- Decided by: agent recommendation I approved (answers provided via design
  questions).
- Assumptions:
  - API base URL hardcoded to `http://localhost:4000` in `lib/use-portfolio.ts`
    (could move to `NEXT_PUBLIC_API_BASE_URL` later).
  - All monetary fields are native CAD; no currency conversion yet (Task 7).
  - `weightPercent` is already in percent (41.57 = 41.57%); `formatPercent`
    does NOT multiply by 100. Decimal-ratio fields (`totalReturnSinceInception`,
    `dividendYield`) will need a separate helper in later tasks.
  - Default sort is weight% descending (largest holding first).
  - Task 2 summary card and Task 9 row-click are out of scope; the summary
    placeholder remains and table rows are not clickable yet.
- Edge cases:
  | Case (from spec or discovered) | How it's handled | Where (file) | Verified how |
  | --- | --- | --- | --- |
  | Empty holdings array | Renders "No holdings to display" instead of an empty table | `components/holdings-table.tsx` | `/?scenario=empty` |
  | Large number of rows (50+) | Scrollable container with sticky header; 60 rows render without lag | `components/holdings-table.tsx` | `/?scenario=large` |
  | Weight % not summing to 100 due to rounding | No correction applied; values shown as-is | `components/holdings-table.tsx` | Visual check of P-9001 weights (sum ≈ 100) |
  | Gain/loss positive vs negative vs zero | green / red / neutral styling by sign; CASH (0) neutral | `components/holdings-table.tsx` | P-9001: AAPL/ALT green, BND/TSLA red, CASH neutral |
  | Repeated sort clicks toggle asc/desc | Header click toggles direction; new column starts desc | `components/holdings-table.tsx` | Manual: click each header twice |
  | Fewer rows than columns (2-3 holdings) | Table renders normally with 2 rows | `components/holdings-table.tsx` | `/?scenario=few-holdings` |

---

## D-003: Portfolio summary card (container/presentational split, sign styling)
- Task: 2. Portfolio Summary Card
- Date: 2026-10-03
- Status: accepted
- Context: The overview page still showed a dashed "Portfolio summary will
  appear here" placeholder (D-001). The summary needs total market value,
  day change as both amount and percent, and total return since inception,
  with positive / negative / zero visually distinguished.
- Decision: Mirror the Task 3 structure: a client container
  `PortfolioSummary` fetches through the existing `usePortfolio` hook and owns
  the loading / error states, and a presentational `PortfolioSummaryCard`
  receives the four figures plus `currency` as props and holds no state.
  Three stats in a responsive `<dl>` grid (1 / 2 / 3 columns). Sign styling
  reuses the holdings table's palette: emerald for positive, red for negative,
  zinc for zero, plus a ▲ / ▼ / – icon on the day change. Three new helpers in
  `lib/format.ts`: `formatSignedCurrency`, `formatSignedPercent`, and
  `formatRatioAsPercent`.
- Alternatives considered:
  - Lift the fetch into a shared parent and pass data to both the summary and
    the holdings table: avoids the duplicate request, but restructures working
    Task 3 code now instead of when Tasks 7/8 force it. Not chosen.
  - Pass the whole `PortfolioSummary` object as one prop: fewer props, but the
    card would depend on API-shaped data rather than plain display values.
    Not chosen.
  - Sign the total return as well (`+18.7%`): consistent with the day change,
    but the spec example shows `18.7%`. Not chosen; colour alone marks it.
  - Hand-written `+`/`-` prefixes on currency: `Intl` `signDisplay:
    "exceptZero"` keeps formatting in one place per the money convention.
- Reasoning: The container/presentational split matches the existing pattern,
  keeps the card trivially reusable and re-renderable from props, and leaves
  the Task 7 currency conversion a single place to plug into (the container).
  Known trade-off: the summary and the holdings table each fetch the same
  portfolio URL, so the page issues two identical requests. Accepted for now
  because Tasks 7 and 8 will centralize account/currency state anyway; a
  superseding entry should record that change.
- Decided by: agent recommendation (no design questions asked; the task brief
  specified props-driven, reusable, and the existing conventions covered the
  rest).
- Assumptions:
  - `dayChangePercent` is already a percent (0.61 = 0.61%) while
    `totalReturnSinceInception` is a decimal ratio (0.187 = 18.7%), per
    `support/PORTFOLIO-API.md`. Formatted per field, never a blanket ×100.
  - Values stay native CAD; the currency code is shown in the
    "Total Market Value (CAD)" label and comes from the API, so the Task 7
    toggle only needs to change the props.
  - Zero renders unsigned (`$0.00`, `0.00%`) so it does not read as a gain.
- Edge cases:
  | Case (from spec or discovered) | How it's handled | Where (file) | Verified how |
  | --- | --- | --- | --- |
  | Zero day change must be neutral | `toneOf` returns neutral at exactly 0; zinc text and a `–` icon; no sign | `components/portfolio-summary-card.tsx` | `/?scenario=zero` shows `– $0.00 (0.00%)` in zinc |
  | Positive day change | emerald text, `▲`, `+$397.25 (+0.61%)` | `components/portfolio-summary-card.tsx` | `/?scenario=default` |
  | Negative day change | red text, `▼`, `-$1,340.41 (-2.00%)`, return `-8.7%` | `components/portfolio-summary-card.tsx` | `/?scenario=negative` |
  | Very large numbers stay legible | `Intl` thousands separators, `tabular-nums`, `text-2xl`, grid drops to 2 columns below `xl` | `components/portfolio-summary-card.tsx` | `/?scenario=large-value`: `$65,680,000,000.00`, measured `scrollWidth - clientWidth === 0` at 900px and 1440px |
  | Negative total market value | Not handled; spec says unrealistic | — | — |
  | Re-render when input data changes | Card is props-only with no internal state; container re-fetches on `accountId`/`scenario` change | `components/portfolio-summary.tsx` | Switching `?scenario=` updates all three figures without reload |
  | Empty portfolio (no holdings) | Summary renders zeros, neutral styling, layout intact | `components/portfolio-summary-card.tsx` | `/?scenario=empty` |
  | Request still in flight / failed | Container shows "Loading summary…" / "Failed to load summary: …", matching the holdings states | `components/portfolio-summary.tsx` | Observed on load; mock `fail=true` reuses the Task 3 error path |
