# Quantitative Finance Modelling & Interactive Analyst Academy

Approved design · 16 October 2026 · Milestone 2 released and verified 18 October 2026

This document preserves the approved MVP specification and release gates. Current implementation, validation and outstanding issues are recorded in [the progress log](docs/PROGRESS_LOG.md). At initial planning, workspace inspection found Python coursework and reports but no existing web application; the application now exists in this separate project folder. Extend it and preserve the coursework.

## 1. MVP requirements and boundaries

Deliver a publicly accessible, responsive website with two connected areas: a Modelling Lab and an Analyst Academy. The functional public beta is complete after milestones 1–3, not after the initial visual shell.

| Beta area | Required functionality |
| --- | --- |
| Options | European calls/puts using Black–Scholes–Merton; European/American calls/puts using CRR binomial trees; European valuation using Monte Carlo; BSM Greeks; expiry payoff and P/L |
| Simulation | Seeded geometric Brownian motion, configurable paths and horizon, sampled path chart, terminal histogram, percentile bands, pricing standard error and confidence interval |
| Fixed income | Plain fixed-coupon and zero-coupon bonds on coupon dates; price, YTM, Macaulay/modified duration, convexity, parallel yield shocks |
| Scenarios | Base plus up to five temporary comparisons; instrument-specific favourable/adverse presets and custom shocks; valuation changes, sensitivity grid, comparison chart |
| Academy | Three pathways, nine complete lessons, worked examples, quizzes, three modelling assignments, tool links, curated external video resources |
| Transparency | Explicit units, assumptions, method/version, convergence diagnostics, error messages and distinction between hypothetical inputs and simulated outputs |

No accounts, profiles, payments, visitor-facing AI, database, analytics trackers, saved scenarios, or persisted quiz history. No localStorage, sessionStorage, IndexedDB, cookies or URL query parameters for modelling/learning state. Keep state in memory across navigation in the same tab; reset on reload. Include a visible Reset session action. Static files may be cached normally; they must not contain visitor state.

All beta examples are hypothetical. No live market feeds or historical market observations in the beta. Do not imply that simulated paths predict markets or that risk-neutral probabilities are forecasts. Site-level educational-use notice plus model-specific limitations. Avoid claims of trading recommendations.

Out of beta: portfolio optimisation/VaR/ES, empirical time series, forecasting, curve bootstrapping, irregular bond schedules, accrued interest, callable bonds, stochastic rates, American Monte Carlo, exotic derivatives and discrete cash dividends. These are explicitly staged in milestone 4.

## 2. Recommended architecture

Use React, strict TypeScript and Vite for a static client application, with modular CSS/design tokens, Apache ECharts loaded only on modelling routes, and a small in-memory React context/reducer. Use Vitest for numerical/unit tests and Playwright for browser acceptance tests. Pin compatible versions and commit a lockfile at implementation; no dependencies are installed by this proposal.

Use a dedicated Web Worker for simulation and larger tree/scenario batches. Main-thread analytic calculations stay synchronous. Send typed messages with request IDs, progress, cancellation and structured errors; discard responses from superseded requests. Retain the last successful output with a clear stale-results label while inputs are edited. Never silently associate an old calculation with new inputs.

Static content is authored as typed lesson data and Markdown where helpful. No CMS or content database. Keep formulas, exercises and video references version-controlled and reviewed with code. Routes: Home, Lab catalogue, Options, Simulation, Bonds, Scenarios, Academy, Lesson, Methodology. Course links use lesson/model IDs only; preset parameters move through in-memory navigation state.

Suggested source layout:

```text
src/app/                 navigation, layout, session state
src/components/          inputs, results, tables, charts, video player
src/quant/core/          validation, units, distributions, PRNG, solvers
src/quant/options/       BSM, Greeks, CRR, payoff
src/quant/fixed-income/  cash flows, price, yield, sensitivities
src/quant/simulation/    GBM, estimators, streaming statistics
src/quant/scenarios/     shocks, immutable snapshots, sensitivity grids
src/workers/             compute protocol and execution
src/content/             lessons, questions, video registry, model notes
tests/                   unit, reference fixtures, integration, browser
docs/                    conventions, decisions, validation and releases
```

Deploy the static output through available Sites tooling with public access explicitly configured and verified anonymously. The tool surface supports Sites creation, source/version management, access updates and deployment; account eligibility and successful public publication are not yet verified. Sites begins private, so its initial URL is not a completed public deliverable. Cloudflare Pages is the portable fallback if Sites cannot satisfy anonymous access or pricing requirements. Do not create hosting resources before design approval.

Browser computation avoids input transmission, calculation hosting fees and server queues. IEEE-754 double precision is sufficient for the bounded models when stable algorithms and tolerances are used. The trade-off is visitor-device performance, memory and browser variation. Python is justified only as an independent development reference, using SciPy/QuantLib where available; it is not a runtime dependency.

A future stateless Python service would be considered only after measured browser limits for advanced models. It adds deployment cost, abuse/rate controls, latency, input transmission and logging/privacy obligations. It does not automatically improve precision. No such service is included in the approved-by-default architecture.

## 3. Modular quantitative design

Each model exposes an ID/version, parameter schema, unit metadata, validation, calculation entry point and assumptions. Results contain values, units, method, warnings and diagnostics, rather than unlabelled numbers. Engines are pure functions without React, browser storage or network dependencies; simulations accept an explicit random generator.

UI percentages become decimals exactly once at the boundary. Time is in years, prices in a selected display currency with no FX conversion, and price/Greeks are per underlying unit. No implicit option contract multiplier. Annual option rates and dividend yields are continuously compounded; volatility is annualised. Bond YTM is nominal annual, compounded at the coupon frequency. Show these conventions next to inputs.

**BSM:** positive spot and strike; nonnegative volatility and time; finite rates; continuous dividend yield. Implement expiry and zero-volatility limits before division/log operations. Formula: C = S exp(-qT) N(d1) - K exp(-rT) N(d2), with corresponding put formula and dividend-adjusted parity. Use a tested normal CDF. Display delta/gamma per unit, vega/rho per one percentage-point change, theta per calendar day (annual theta divided by 365). Mark undefined Greeks at expiry/payoff kinks rather than showing fabricated finite values.

**CRR:** u = exp(sigma sqrt(dt)), d = 1/u, p = (exp((r-q)dt)-d)/(u-d). Reject invalid probabilities with an actionable message; never clip p. Early exercise compares continuation with intrinsic value at every node. Use O(N) memory backward induction. Handle zero volatility separately with deterministic exercise-grid valuation. Expose steps, compare N with 2N, and disclose that American exercise is approximated on a discrete grid. European values converge to BSM; do not assume monotonic convergence or impose American-call equality when negative rates invalidate the usual conditions.

**Bonds:** regular positive cash flows, positive redemption and an integer number of coupon periods; frequency 1, 2 or 4. Value on a coupon date immediately after coupon payment so accrued interest is zero. P = sum CF_k/(1+y/m)^k, requiring 1+y/m > 0. Use bracketed bisection/Brent-style solving for YTM with a bounded iteration count, expandable bracket and explicit nonconvergence. Never substitute a guessed yield. Duration/convexity use analytic cash-flow derivatives and are verified with central finite differences. Distinguish exact repricing from the duration/convexity approximation.

Initial UI operating limits: spot/strike 0.01–1,000,000; option time 0–30 years; volatility 0–200%; rates -20%–100%; continuous dividend yield 0–100%; CRR 25–2,000 steps. These are software limits, not market claims, and do not guarantee a valid CRR probability for every combination. Bond maturity 1–120 periods, face 1–1,000,000, coupon 0–100%, YTM -20%–100%. Validate intermediate finiteness and reject overflow/unsupported combinations. Permit zero time and zero volatility via their explicit limiting cases.

## 4. Simulation, scenarios and stress testing

Valuation mode uses risk-neutral drift r-q and discounts payoff by exp(-rT). Exploratory mode accepts a user-assumed price drift mu and labels it as a hypothetical physical-measure assumption. It does not price options using mu. Exact GBM transitions use S(t+dt) = S(t) exp((b-sigma²/2)dt + sigma sqrt(dt) Z).

European valuation samples the exact terminal distribution, avoiding unnecessary path discretisation. Separately generate illustrative paths using a distinct deterministic random stream, so changing chart resolution does not change the option price. Show that plotted paths are a sample, not all simulation paths. Offer path counts 1,000–100,000 (default 10,000), unsigned 32-bit seed, horizon 0–10 years, and 12–252 display steps. Show at most 100 paths; aggregate without retaining an N-by-steps matrix. Bound worker jobs and allow cancellation/restart.

Specify and version the PRNG and normal transform (for example xoshiro128** with documented nonzero seed expansion and Box–Muller). Guarantee repeatability for the same engine version, mode, seed and inputs within numerical tolerance across supported browsers; do not promise bit-identical transcendentals across platforms. Use Welford statistics. Beta starts with plain independent Monte Carlo. If antithetics are later added, compute standard errors from independent pair means, not the individual correlated payoffs.

Report discounted payoff mean, sample standard deviation, standard error, approximate 95% estimator interval, path count and seed. Zero time or zero volatility uses the deterministic branch with zero sampling error. Separately show terminal-price percentiles and a 5th–95th percentile outcome band. A confidence interval for the estimated price is not a prediction interval for market prices. Warn when rare positive payoffs make an apparent zero standard error unreliable. Show BSM difference and convergence at nested sample counts without claiming every larger sample must be closer.

Scenarios are immutable in-memory snapshots of inputs and results, with an editable label and removable rows. Base/favourable/adverse presets explain their shocks; favourable is position-dependent, not a universal market direction. Inputs support relative spot shocks, additive volatility percentage-point shocks, additive interest-rate basis-point shocks and elapsed days reducing maturity. Clamp neither volatility nor negative maturity silently: require valid scenarios or explicitly stop at expiry. Dividend yield can be changed as an assumption. Bond shocks use additive YTM basis points in beta; curve twists belong to milestone 4.

Show exact value, absolute change and percentage change versus base; show percentage as unavailable for zero base value. P/L at expiry means payoff minus entered premium, excluding financing and fees, and clearly identifies long/short position. Sensitivity grid: 7-by-7 spot/volatility for options, plus maturity/rate slices; bond yield curve of prices and duration approximation. Use common random numbers for Monte Carlo scenario differences and calculate uncertainty on paired payoff differences. Analytic/tree models remain the default for fast scenario grids.

## 5. Interactive Academy specification

| Pathway | Lessons | Practical assignment |
| --- | --- | --- |
| Finance foundations | Compounding and discounting; returns and volatility; bond price/yield/duration | Reprice a bond after a 100 bp yield shock and compare the approximation |
| Options and hedging | Payoff versus P/L; European pricing and assumptions; American exercise and Greeks | Compare BSM/CRR and explain delta/vega responses |
| Simulation and risk | Randomness/GBM/seeds; Monte Carlo valuation and uncertainty; scenario/stress interpretation | Repeat a seeded valuation, increase paths, explain uncertainty versus model risk |

Each of nine lessons has learning objectives, prerequisite links, definitions/conventions, an original text explanation, one fully worked numerical example, a linked interactive lab preset, three knowledge-check questions with explanations, limitations and references. Three pathway assignments have a rubric and revealable worked solution. Accessible numeric entry and single-choice quizzes give immediate feedback in memory. Session progress is labelled temporary and resets on reload. No account requirement, persistent badges or certificates.

Course-to-lab navigation passes presets through session memory. Lab-to-lesson navigation preserves the active session. Direct lesson URLs load without needing prior progress; lessons remain useful when video is blocked or unavailable. Reserve advanced pathway topics visibly in the roadmap rather than publishing empty lessons as completed courses.

## 6. Embedded video architecture

Keep a separate resource registry: resource ID, provider, provider video ID, title, creator, original URL, optional start time, language/caption information when verified, embedding status and last-checked date. Lessons reference resource IDs and may list multiple resources.

Implement a provider adapter interface that validates IDs/allowlisted URLs, builds provider-approved embed URLs and describes fallback behavior. YouTube is the initial implemented provider; unsupported providers render attributed source links. Add other providers only with documented supported embed rules and tests. No arbitrary HTML/iframe injection from lesson data.

Use responsive 16:9 layout, descriptive iframe title, keyboard controls, no autoplay and directly visible embedded players (user-approved revision, 18 October 2026). Provide title, creator and original-source link alongside the player. Opening a lesson with a video contacts its external provider and may invoke provider storage; disclose this rather than claiming the whole browsing experience has zero third-party tracking. No lesson/scenario inputs are sent to video providers.

Always keep an Open original source link visible. Handle documented player errors and loading timeout with a readable fallback; cross-origin restrictions prevent perfect detection of all embed failures. Use the documented referrer/origin settings: an overly restrictive referrer policy can break YouTube playback. Do not obscure required branding, download media or rehost it. Curate and verify at least one relevant resource per pathway before milestone 3 release; no invented IDs or unverified creator attribution. Test blocked/private/deleted videos using fixtures rather than relying on unstable live failures.

## 7. Development routing and resource controls

Development orchestration tools are available in this session and a single bounded reviewer was invoked for this proposal. Up to four agents including the coordinator are supported, but normally use only the coordinator and one independent worker. This is a development capability, not a website feature.

| Task class | Risk/reasoning/context | Proposed allocation | Verification |
| --- | --- | --- | --- |
| Architecture, new numerical methods, difficult defects | High financial/technical risk; deep reasoning; focused design plus engine context; higher resource use | Strong current model; Astra for a bounded difficult design or independent numerical review when justified | Independent references, edge/property tests and human-readable decisions |
| UI integration, worker protocol, course system | Medium coding complexity; moderate context and consumption | Capable general coding model such as Sol | Unit/integration/browser tests |
| Formatting, routine docs, bounded visual fixes | Low risk; short context and low consumption | Efficient model such as Luna when an independent task is large enough to justify delegation | Targeted review and functional check |

The tool interface advertises Astra, Sol and Luna overrides for newly spawned agents; request acceptance/account capacity must still be confirmed at invocation. No silent parent-model switching is assumed. If a parent-model change is needed, the user selects it in the app. Agent model overrides can be requested autonomously within the authorised development task; unavailable choices fall back with disclosure. No API keys or API calls are required for the site. No paid services, credit purchases or API expenditure without explicit approval.

Classify each implementation task before delegation; provide only contracts, relevant files, acceptance tests and a bounded objective. Delegate independent numerical review or separate content work, not tightly coupled overlapping edits. Coordinator owns integration and release. Maintain a short README, architecture decisions, numerical conventions, benchmark fixtures and milestone checklist to reduce repeated context and research. Run targeted checks after edits and the full release suite once per milestone candidate; widen only when failures warrant it.

## 8. Cost assessment

| Item | Initial recommendation and cost implication |
| --- | --- |
| Application runtime | No database, compute server, paid data feed or AI API: planned recurring service spend $0 |
| Sites hosting | Prefer available integration if public anonymous publishing is eligible; official docs describe inclusion during public beta for eligible plans, not a permanent free guarantee |
| Portable hosting fallback | Cloudflare Pages static assets are documented as free/unlimited requests; build/platform limits and account terms still apply |
| Domain | Use provided host URL initially: $0 domain purchase; optional custom domain needs a current quote and approval |
| Development | Existing ChatGPT/Codex allowance is consumed; existing subscription cost is not assumed to be zero or known |
| Extra AI usage | Additional credits and API-key billing are distinct from included usage; no amount committed and no API key requested |
| Testing/maintenance | Local open-source tooling first; human/AI review time, lesson/video upkeep and dependency updates remain real ongoing effort |

These are architecture budgets, not a guaranteed hosting quotation or estimate of model tokens. Recheck provider terms before deployment. Cost depends mainly on development/review effort; browser computations do not create per-visitor AI or calculation-server fees. Estimate effort after milestone 1 establishes measured delivery speed rather than promising an unsupported calendar deadline.

## 9. Incremental roadmap and release gates

| Milestone | Deliverables | Numerical checks | Functional acceptance |
| --- | --- | --- | --- |
| 1 Foundation | Approved conventions, app shell/navigation/design tokens, typed engine interfaces, worker contract, static content schemas, one representative lesson | Rate/unit conversion round trips; normal CDF fixtures; seeded generator known-answer fixtures; validation boundaries | Clean install/build/typecheck; route/deep-link loading; keyboard navigation; invalid-input messages; session reset and storage checks |
| 2 Modelling beta | BSM/Greeks, CRR, bond calculator, seeded MC, scenarios, sensitivity/payoff/distribution charts | Benchmarks and properties below; worker/main parity; convergence diagnostics; scenario identity and paired differences | Every input affects correct outputs; no stale results; cancellation/progress; charts/tables agree; reset deletes snapshots; responsive layouts |
| 3 Learning/public beta | Nine lessons, 27 questions, three assignments, video component/registry, at least three verified video resources, integrated course navigation, public release | All worked examples and numeric quiz answers checked independently against fixtures; teaching conventions match engines | Quiz feedback and reload reset; working lab links; blocked-video fallback; public deep links without sign-in; privacy/accessibility/browser release checks |
| 4A Portfolio/risk | Manual returns or explicitly synthetic fixtures, covariance/correlation, weighted return/volatility, diversification, historical VaR/ES | Known two-asset covariance case; sample conventions; PSD checks; explicit loss sign/tail quantile/ES weighting; shared missing-date policy | Editable weights/data validation; risk horizon/confidence labels; scenario repricing and bounded performance |
| 4B Optimisation/curves | Long-only constrained minimum variance and efficient frontier; entered zero curves, interpolation, twist shocks; basic forward-rate/swap valuation | Feasibility/KKT residuals; compare independent solver; discount-factor identities; par swap NPV near zero; no extrapolation without disclosure | Infeasible cases explained; weights reconcile; curve basis/compounding visible; stress tables remain coherent |
| 4C Advanced learning/models | Correlated simulations, risk factors, elementary time-series forecasting, advanced lessons; consider stochastic rates only with a separate specification | Correlation recovery; time-series chronological splits/no leakage; baseline forecast comparison; process moments/reference engines | Clear in/out-of-sample labels, model limitations, reproducible scenarios and device workload limits |

Milestone 4 is a sequence of separately scoped increments, not a promise to implement every advanced model together. Before each increment, freeze its numerical conventions and concrete fixtures. No advanced feature is promoted as released until its own acceptance record passes.

## 10. Measurable verification and acceptance

Numerical tests must not generate their expected values by calling the production implementation. Store independently generated fixture values with formula/reference, source/tool version, parameters, units and tolerance. Python reference scripts are development-only and do not share production calculation code.

Initial acceptance benchmarks:

- BSM S=K=100, r=0.05, q=0, sigma=0.20, T=1: call 10.4505835721856; put 5.5735260222570; absolute error <= 1e-6 currency units. Confirm fixtures independently during implementation rather than treating this document as the sole oracle.
- Dividend-adjusted put–call parity and arbitrage bounds on a parameter grid: tolerance 1e-8 × max(1,S,K); analytic Greeks match central differences within 1e-4 relative plus 1e-6 absolute in smooth, nondegenerate cases. Test zero time, zero volatility, negative rates and deep ITM/OTM separately.
- CRR canonical European case at 2,000 steps within 0.01 of BSM. Compare N/2N and adjacent step counts without requiring monotonicity. American value >= matching European and intrinsic values within numerical tolerance; non-dividend American call equals European tree under nonnegative rates. Add independent American put/dividend fixtures before release.
- Annual coupon bond: face 100, coupon 5%, maturity five periods, YTM 5% gives price 100 within 1e-10. A one-year zero at 5% gives 95.2380952380952. YTM round-trip reprices within 1e-8 × max(1,price). Central finite-difference duration/convexity agree within documented stable-region tolerances (initial targets 1e-5 and 1e-3 relative respectively).
- For that five-year bond, direct cash-flow sums independently checked during planning give Macaulay duration 4.54595050416236 years, modified duration 4.329476670630819 and convexity 23.93598749790724 years squared; future engine fixtures must match within 1e-8. This arithmetic check is not an application test.
- Seeded MC repeated runs reproduce within 1e-12 relative on one supported engine; browser cross-checks use declared floating-point tolerances. Fixed canonical seed fixtures agree with BSM within four estimated standard errors plus 1e-3. Do not demand that every random 95% interval contains the exact price. Across a fixed suite of independent seeds verify expected moments and aggregate RMSE reduction (approximately half when quadrupling paths, using a broad preregistered acceptance band). Rare payoff cases require warnings and separate tests.
- Zero shocks reproduce base values; changing chart sampling cannot change MC valuation; common-random-number scenario comparisons match direct paired estimates. Impossible inputs produce no NaN/Infinity results or silent corrections.

Release acceptance targets (measure and record, do not assume):

- All deterministic numerical, integration and browser tests pass; no unresolved numerical correctness defects. Statistical tests use fixed seed suites and documented tolerances to avoid flaky retries.
- Anonymous visitors can open all routes and use all released tools, including a direct lesson/model URL after refresh. Verify deployment in a clean browser without owner credentials.
- Storage/network tests confirm no modelling input, result, seed, quiz answer or progress goes into storage, URLs, telemetry or outgoing requests. No analytics. Hosting may still keep ordinary access logs; this does not justify collecting modelling payloads. Video requests occur on lessons containing embedded resources; no autoplay. This supersedes the activation gate by explicit user request on 18 October 2026.
- Every chart has labelled axes/units, readable tooltips and equivalent summary/table information. All controls have labels, visible focus and keyboard access; screen-reader checks and contrast checks target WCAG 2.2 AA for the delivered flows.
- Layouts work at 360 px, 768 px and 1440 px without page overflow. Test current desktop Chrome/Edge/Firefox, plus a mobile/WebKit path where tooling permits; explicitly report untested environments.
- Initial non-chart bundle target <= 250 KB gzip. Analytic interactions target <100 ms; default 10,000-path terminal MC <2 seconds on a documented reference laptop. Worker jobs expose progress, cancellation <500 ms and no compute-related main-thread task >100 ms. Benchmark on an actual mobile device or report its absence; adjust limits rather than claim universal speed.
- Browser back/forward navigation, repeated calculation, rapid edits, cancel/restart, expiry, invalid input, unavailable videos and reload reset all have tested outcomes.
- Production build, dependency/license review, source-link review and public smoke test pass. Set appropriate CSP/frame allowlists and security headers without breaking provider embed requirements. Keep a known-good deployment version and document rollback. Publish a concise validation record listing tests actually run, limitations and engine version.

## Decisions proposed for approval

Approve the browser-only React/TypeScript architecture and milestones 1–3 as the initial functional beta; hypothetical data only; limited regular bonds; nine lessons; Sites public hosting if eligible, otherwise a portable static host; free host URL initially. Working project name remains Quant Finance Lab & Analyst Academy and can be changed without architectural impact.

Still to resolve during implementation: confirmed public-host entitlement, chosen compatible dependency versions, actual device performance caps, curated video availability, and independently generated American-option fixtures. None requires an account system, paid service or runtime backend. Paid hosting/domain/API choices require explicit approval if they become necessary.

Design approval authorises starting milestone 1 and progressing through the agreed milestone tests. The original proposal itself did not implement or deploy software; subsequent Milestone 1 implementation, tests and public release are recorded in [the progress log](docs/PROGRESS_LOG.md).

## Primary references consulted

- [Vite guide](https://vite.dev/guide/) — frontend build tooling.
- [Options Industry Council: Black–Scholes formula](https://www.optionseducation.org/advancedconcepts/black-scholes-formula) — model inputs and applicability; not a numerical fixture source.
- [SciPy normal distribution](https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.norm.html) — independent distribution reference tooling.
- [YouTube embed parameters](https://developers.google.com/youtube/player_parameters) and [IFrame API](https://developers.google.com/youtube/iframe_api_reference) — embed and error handling requirements.
- [Cloudflare Pages pricing](https://developers.cloudflare.com/pages/functions/pricing/) — static hosting request cost.
- [OpenAI Codex/Work pricing](https://learn.chatgpt.com/docs/pricing) — included usage, API-key billing distinction and Sites beta eligibility.
- [GPT-6 Astra documentation](https://developers.openai.com/api/docs/models/gpt-6-astra) — model documentation; actual orchestration capability also checked against this session's tool interface.

Provider facts were checked on 16 October 2026 and must be rechecked when committing spending or publishing. Detailed numerical reference fixtures and lesson citations are implementation deliverables, not completed research claims.
