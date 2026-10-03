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
