# Quant Finance · Lab & Academy

An anonymous, browser-only quantitative finance learning workspace. European BSM/Greeks, European and American CRR, regular bonds/YTM, seeded Monte Carlo and temporary scenarios connect to nine lessons, 27 knowledge checks and three practical assignments. Learning and modelling activity stays in memory.

Milestone 4A adds a portfolio lab for aligned pasted returns, covariance/correlation, diversification, empirical VaR/expected shortfall and temporary stress comparisons. Its default data is explicitly synthetic. See `docs/M4A_SPEC.md` and `docs/MILESTONE_4A.md` for conventions, validation and limits.

## Run locally

Use Node.js 22 or 24 LTS and npm. This release was tested with the bundled Node 24 runtime; the machine's Node 23 is outside Vitest 4's supported range. `.npmrc` enables the legacy peer resolver because both locally installed npm versions crashed in their default optional-peer resolution; the selected Vite/Vitest compatibility ranges were checked.

```sh
npm ci
npm run dev
```

Open the printed local URL. Build with `npm run build`; serve the output with `npm run preview`. The application requires static-host SPA fallback to `index.html` for deep links.

## Checks

```sh
npm run typecheck
npm test
npm run test:e2e
npm run build
```

Browser tests use installed Google Chrome and launch the local app when no server is already running. For a clean CI host, install Chrome or change the Playwright channel and install its matching browser. Set BROWSER_CHANNEL=msedge for Edge, or BROWSER_ENGINE=firefox/webkit for installed Playwright engines. Keep numerical fixtures independent of production code. See `docs/NUMERICAL_CONVENTIONS.md` and the milestone reports, including `docs/MILESTONE_3.md`, for actual results and limitations.

## Architecture and privacy

- React + TypeScript, Vite static build; no runtime API, database or authentication.
- Session reducer holds inputs, quiz answers and completion in memory. Reload and Reset session clear state.
- Pure `src/quant` functions contain calculations and validated model contracts.
- `src/workers` carries request IDs and structured results/errors. One active job per client; cancellation terminates its worker and prevents stale completion.
- Lessons, assignments and video metadata live separately in `src/content`. Embedded players appear when their lesson opens, without autoplay; provider cookies/storage may apply.
- No visitor state in URLs, localStorage, sessionStorage, IndexedDB, cookies or telemetry. The public host sets visitor/security cookies and may retain access logs; these are separate from application modelling and learning state.
- Simulations and trees run in terminable Web Workers. ECharts is loaded only when modelling results need charts; it is absent from the initial page bundle.

## Deployment

Production dependency licences and notices are included at `/THIRD_PARTY_NOTICES.txt` in the deployed build; regenerate this file from installed package licences when production dependencies change.

The existing Sites project ID is retained in `.openai/hosting.json`. Static build output is `dist/`. Use the Sites source/version workflow; do not create a second Site. Credentials must remain ephemeral and must never be committed. Public access must be verified without owner authentication. No paid service is required by this codebase.

## Development decisions

Before starting or resuming, read [AGENTS.md](AGENTS.md), the [progress log](docs/PROGRESS_LOG.md), and the [delegation log](docs/DELEGATION_LOG.md). The progress log tracks completed work, dated checks, release identity, outstanding issues and the next action.

The approved `IMPLEMENTATION_PLAN.md` defines scope and release gates. Extend the current modules rather than creating duplicate engines. Each new model must return units, assumptions, version and diagnostics; show limits before exposing price outputs. AI agents are development tools only, not visitor-facing features.
