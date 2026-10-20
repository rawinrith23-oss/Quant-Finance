# Project development instructions

## Before starting or resuming

Read `IMPLEMENTATION_PLAN.md` (approved requirements, architecture, milestones and acceptance criteria), `README.md`, `docs/PROGRESS_LOG.md`, `docs/DELEGATION_LOG.md`, `docs/NUMERICAL_CONVENTIONS.md`, and the relevant milestone verification report. Read any more specific agent instructions before editing their directories.

Inspect the current code, Git status and relevant tests before making changes. After an interruption or usage limit, reconcile the records with the working tree; do not repeat completed work or assume that a prior test/deployment is current. Preserve unrelated user changes.

## Preserve the approved product

- Extend existing modules and completed functionality. Keep the approved static React/TypeScript architecture and dark Vestox-inspired design.
- Anonymous access only: no accounts, authentication, profiles, payments, visitor-facing AI, visitor database or analytics trackers.
- Keep modelling inputs, scenarios, results, quiz history and progress in memory only. No browser storage, cookies, URL parameter persistence or server storage for visitor activity.
- Keep financial engines independent of UI and storage. Validate inputs, units, conventions and numerical boundaries; use independent reference fixtures. Label assumptions, hypothetical inputs, simulations and limitations honestly.
- Follow milestone scope and acceptance gates. Obtain explicit approval for paid external services and material changes to approved scope/architecture.

## Delegation and resource use

Delegate only when independent work materially helps. Record each task in `docs/DELEGATION_LOG.md`: purpose, scope, actual model where tool metadata makes it available, verification source, result and integration checks. Distinguish requested models from verified models. If unavailable, write unknown; never infer a cheaper or premium model from task complexity or inherited settings. AI delegation is for development only. Distinguish subscription usage from API expenditure; do not invent cost estimates for completed calls.

## Verification and handoff

Run checks appropriate to changes and preserve numerical correctness. Record failures and remaining limitations as well as passes. Do not present historical checks as newly run. A local build is not a public release: record source version, deployment result and anonymous verification before claiming publication.

Before ending each development milestone, update `docs/PROGRESS_LOG.md` with completed work, outstanding issues, dated validation results and the next recommended action. Update it at meaningful interruption/handoff points too. Keep milestone reports and the delegation log consistent. Never place credentials in records or source control.
