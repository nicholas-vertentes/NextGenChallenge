# URL Parameters

The dashboard reads query-string parameters from the page URL. They control
which portfolio is shown and which test dataset is fetched from the mock API.

| Parameter | Type | Default | Purpose |
| --- | --- | --- | --- |
| `accountId` | string | `P-9001` | Select the portfolio/account to display |
| `scenario` | string | *(none — normal data)* | Select a test dataset from the mock API |

Combine parameters with `&`, for example:

```text
http://localhost:3000/?scenario=negative
http://localhost:3000/?accountId=P-9002
http://localhost:3000/?accountId=P-9002&scenario=large
```

## `accountId`

Identifies the portfolio. Pass the selected account's ID; the mock API uses
the same ID for `/accounts` and `/portfolios/:id`.

| Value | Meaning |
| --- | --- |
| `P-9001` | **Default.** Taxable Brokerage — five holdings across four asset classes |
| `P-9002` | Traditional IRA — a second, smaller portfolio |

Any other value is forwarded to the mock API, which returns `404` with an
`{ error, message }` body. The UI then shows its error state.

## `scenario`

Selects one of the mock's test datasets. Omit the parameter (or pass no
`scenario`) to use the normal dataset.

| Scenario | What to check |
| --- | --- |
| `default` | Two accounts; first has five holdings across four asset classes |
| `empty` | No holdings; zero-value summary |
| `large` | 60 holdings and working details for each |
| `zero` | Neutral day change and total return |
| `negative` | Negative day changes and total return |
| `large-value` | Very large values remain readable |
| `single-account` | Only `P-9001` is available (`P-9002` returns 404) |
| `single-class` | Equity only |
| `tiny-allocation` | Equity below 1% |
| `few-holdings` | Two holdings, fewer than three movers |
| `all-gainers` | Every holding has a positive day change |
| `all-losers` | Every holding has a negative day change |
| `one-point` | Single-point chart history |
| `two-points` | Two-point chart history |
| `gaps` | Missing dates in the history |
| `short-history` | Only the last 60 days |

The full list is defined in `support/portfolio-data.mjs` and is also available
from the mock API at `GET /scenarios`.

## Mock API-only parameters

The mock API (`http://localhost:4000`) also accepts `delayMs` and `fail`.
These are **not** threaded through the app's URL yet — the app only forwards
`scenario`. You can still exercise them directly against the API:

```text
http://localhost:4000/portfolios/P-9001?scenario=large&delayMs=2000
http://localhost:4000/portfolios/P-9001?fail=true
```

| Parameter | Values | Purpose |
| --- | --- | --- |
| `delayMs` | `0`–`10000` | Add latency to exercise loading states |
| `fail` | `true` | Return HTTP `503` to exercise error states |

## Implementation notes

- `app/page.tsx` (a server component) reads the params via `searchParams`,
  normalizes them, and passes them to each dashboard section.
- `lib/use-portfolio.ts` (a client hook) appends `?scenario=...` to the fetch
  URL and re-fetches whenever `accountId` or `scenario` changes.
- Data comes from `http://localhost:4000`; see `support/PORTFOLIO-API.md` for
  the response shape, field units, and route list.
