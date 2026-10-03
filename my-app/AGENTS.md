# AGENTS.md

## Project
Wealth management portfolio dashboard, built from scratch in `my-app/` (Next.js 16
App Router, React 19, TypeScript strict, Tailwind CSS v4). The spec is in
`../frontend/REQUIREMENTS.md` (10 tasks).

Data is fetched from the supplied mock API at `http://localhost:4000` (start it with
`node ../frontend/mock-server.mjs`). Routes, field units, and test datasets are
documented in `../support/PORTFOLIO-API.md`.

## Workflow: plan, then build, then record

### 1. Planning (before writing any code for a task)
- Read the task's Goal, Expected Behaviour, Edge Cases, and Definition of Done.
- Do NOT start coding yet. First ask me design questions, then wait for answers.
- Ask only about decisions that are genuinely open or hard to reverse, such as:
  library choices (charts, tables, state), layout approach, where state lives,
  how data flows between components, modal vs. panel vs. page.
- Format every question as: the question, 2-3 options with trade-offs, and your
  recommended default. Batch all questions into one message, max ~5.
- Skip questions the spec already answers. If I say "use your defaults", proceed
  with your recommendations and log them as such.
- When a later task changes an earlier decision (e.g. currency toggle affecting
  the summary card), flag it during planning instead of discovering it mid-build.

### 2. Building
- Build only the task in scope. Don't refactor unrelated components.
- Don't hardcode content that later tasks will make dynamic.
- Document every assumption about mock data or missing backend behavior.

### 3. Recording (required before a task counts as done)
Append an entry to `docs/DECISIONS.md` using the template below.
Never delete or rewrite old entries. If a decision changes, add a new entry
that supersedes the old one and reference its ID.

## Decision log template (`docs/DECISIONS.md`)

```
## D-014: <short title>
- Task: <number and name>
- Date: <YYYY-MM-DD>
- Status: accepted | superseded by D-0XX
- Context: what problem or constraint prompted this
- Decision: what we chose
- Alternatives considered: each option and why it was not chosen
- Reasoning: why this one wins, including trade-offs we accepted
- Decided by: me | agent default | agent recommendation I approved
- Assumptions: mock data shapes, rates, anything not in the spec
- Edge cases:
  | Case (from spec or discovered) | How it's handled | Where (file) | Verified how |
```

Every edge case listed in the task spec must appear in the table, including
ones handled by "nothing special needed". Add any edge cases you discover yourself.

## Definition of done (per task)
1. Spec's Definition of Done items all met.
2. Edge cases verified with the mock API's scenario datasets (e.g. `?scenario=empty`,
   `large`, `zero`, `negative`, `single-account`, `tiny-allocation`, `gaps`).
   See `../support/PORTFOLIO-API.md` for the full list.
3. No console errors or warnings on load.
4. Decision log entry written.
5. Summarize in chat: what was built, decisions made, open questions.

## Project conventions
- Money: format with `Intl.NumberFormat`; never format by hand.
- Percentages and currency formatting live in one shared utility, not per component.
- Currency conversion is applied at the display layer from a single source,
  never per component, so values can't be converted inconsistently.
- All monetary fields from the API are native CAD; apply the exchange rate
  (`{ CADtoUSD: 0.73 }`) only at display time.
- Percentage units are mixed per field: `dayChangePercent` and `weightPercent` are
  already percent (2.4 = 2.4%), while `totalReturnSinceInception` and `dividendYield`
  are decimals (0.187 = 18.7%). Format by field, never a blanket ×100.
- Positive, negative, and zero values must each have a distinct, tested visual state.
- Shared UI state (selected account, date range, sort order, currency) must
  survive other state changes and must not trigger a page reload.
- TypeScript strict; avoid `any`.

## Commands
- Install: `npm install`
- Mock API: `node ../frontend/mock-server.mjs` (serves `http://localhost:4000`)
- Dev: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint`
- Typecheck: `npx tsc --noEmit`
- No test runner is configured yet; verify edge cases via the mock API scenarios.

## Boundaries
- Ask before adding a dependency, and log the choice in the decision log.
- Don't modify `docs/TASKS.md`.
- Never edit existing decision log entries (append only).

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
