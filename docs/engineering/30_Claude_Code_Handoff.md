# 30 — Claude Code Handoff

**Purpose.** Everything needed to implement the application without inventing financial behaviour.

**Read these first, in order:** doc 25 (architecture) → doc 04 (financial logic) → doc 05 (invariants) → doc 03 (data model) → doc 26 (contracts) → doc 06 (metrics) → doc 28 (plan).

---

## 1. Non-negotiable instructions

> **Never invent financial behaviour.** If an event is not specified in doc 04, stop and flag it. Do not infer a rule from a similar case.
>
> **Never duplicate financial calculations in UI code.** No arithmetic producing a user-visible money figure may exist outside `domain/`. Not in a view model, not in a composable, not in a SQL expression.
>
> **Never silently change requirements.** If a requirement is contradictory or impossible, record it in `Requirements_Exceptions.md` with the exact requirement, the conflict, and a proposed resolution — then continue with the original until the exception is accepted.
>
> **Never add a dependency that violates offline-first.** No networking, analytics, crash-reporting, advertising, or attribution library. A CI check fails the build on any networking API reference.
>
> **Never replace a deterministic calculation with AI or heuristics.** Every rule in this pack is deterministic and testable. Recurrence detection, categorisation, and anomaly detection are specified as explicit algorithms, not as places to add a model.
>
> **When requirements appear ambiguous, refer to the canonical specification and flag the ambiguity rather than guessing.** A wrong guess in a finance app is indistinguishable from a bug to the user, and far harder to find.

## 2. Architecture

Four layers, dependencies pointing inward only: **presentation → application → domain ← data**. `domain/` imports nothing from any other module — no framework types, no database types, no platform APIs. This is enforced by a build-level module boundary check, not by convention. Full detail in doc 25.

## 3. Project structure

```
app/            screens, components, view models, navigation, theme, formatting
application/    services (use cases), transaction boundaries, event emission
domain/         entities, Money, validators, invariants, metrics, analytics   [zero dependencies]
data/           repositories, SQLite, DAOs, migrations, rollups, file I/O
portability/    backup, restore, CSV read/write
testfixtures/   deterministic generators for the doc 23 datasets
```

## 4. Domain model

Entities and their fields: doc 03. Conceptual meaning, lifecycle, and forbidden states: doc 02.

`Money` is a branded TypeScript type over an integer `number` of paise (doc 25 §2). **No fractional value may appear in the money path** (INV-15). The brand makes it a compile-time guarantee that raw numbers cannot enter the money path; every `Money` constructor and operation also asserts `Number.isSafeInteger` at runtime.

## 5. Data model

Doc 03 is the schema specification. Implement **every** CHECK constraint, foreign key, unique constraint, and index exactly as written. The constraints are what make invalid financial states unrepresentable; omitting one because the application layer "already checks it" defeats the design.

`PRAGMA foreign_keys = ON` at every connection open. WAL journaling. `synchronous = FULL` for money-affecting writes.

Three rules cannot be expressed in SQL and must live in the domain layer: cumulative refunds ≤ parent · `back_of_id` must reference an `out` · `Outside` may not appear on both sides of a move.

## 6. Financial logic

Doc 04 is canonical. Where any other document appears to conflict with it on how an event behaves, doc 04 governs.

Points most likely to be got wrong, each with a test:

| Rule | Detail | Test |
|---|---|---|
| Card payment | Always a `move`, never spending | T-04 |
| Loan repayment interest | `out` from the **paying** account | T-25 |
| Loan balance-check drift | `out` from the **loan** account, `Interest & charges` — **not** a `correction` | T-26 |
| Balance-check sign | Derived from account class, never raw subtraction | T-62 |
| Refund period | Lands in the receipt period, not the parent's | T-15 |
| Interest split | Two rows sharing a `group_id`, deleted as a unit | T-82 |
| Archive | Blocked at non-zero balance | T-81 |
| Corrections | In totals, out of shares and baselines | T-65 |

## 7. Invariants

Doc 05. Implement all 17 as runtime assertions in the domain layer. After every money-affecting commit, re-derive balances for touched accounts and assert INV-01. A failure rolls back the write, surfaces a plain-language error, and logs locally.

Assertions are active in debug builds and in the P0 release. They are cheap relative to their value.

## 8. Calculation engine

Doc 06. Every metric is a pure function returning `{value, basis, period, isEstimate, dataState, drillQuery}`.

`dataState = Insufficient(requirement)` must carry the **specific** unmet condition — never a generic flag. The UI renders that condition verbatim (doc 18 §3), so a vague requirement string becomes a vague user message.

**Never** substitute a zero for missing data. Kept % with zero income is `Insufficient`, not `0%`.

## 9. Analytics engine

Doc 07. Implement the qualifying-month rule exactly; it is the foundation of every comparison. Note the two guards that exist because the naive implementation fails:

- **MAD floor** at `max(MAD, 0.1 × median)` — without it, a perfectly stable category like rent triggers false anomalies forever.
- **≥4 non-zero months** — without it, a sparse category with median 0 flags any spend at all.

Unusual spending is the **only** hard suppression in the product. Everything else degrades to a weaker true statement.

## 10. Service contracts

Doc 26. Every mutating operation returns `Result<T, DomainError>`, is atomic, and re-asserts invariants before commit. Errors carry a plain-language message suitable for direct display and a machine rule for tests.

## 11. Persistence

Doc 14. Single-writer discipline for all writes. Every user action that produces multiple rows is one database transaction. Post-write assertion is mandatory. Startup runs integrity check, foreign-key check, and balance derivation.

## 12. Recomputation

Doc 15. **No derived value is persisted** except the monthly rollup cache, which is keyed by `canonical_version` and must be discardable without any behaviour change. The cache-equivalence test — every report identical with rollups dropped — is mandatory in CI.

## 13. Migrations

Doc 27. Forward-only. Automatic safety backup before migrating. Validate after every step. Compare balance fingerprints before and after; a single paise of drift aborts and restores. Never mutate historical money values.

## 14. Screens and components

Screen implementation map: doc 11 (45 screens with IDs). Component map: doc 12 (30 components). Navigation: doc 09.

States are a sealed hierarchy — `FirstUse`, `Empty`, `Partial(unmetCondition)`, `Complete(data)`, `Loading`, `Error(cause, recovery)` — so an unhandled state is a compile error, not a blank screen.

Formatting lives in exactly one utility (doc 13 §9). A component that formats currency itself is a review rejection.

## 15. Error handling

Doc 18 §5. Plain-language cause plus a recovery action, always. No error codes in user copy; codes go to the local diagnostics log. Never a raw exception, never a silent failure, never an "OK"-only dialog for a destructive outcome.

**No log line, diagnostic entry, or error message written to disk may contain an amount, a payee name, or a note** (doc 20 §3). Reference record IDs only.

## 16. Backup, import, export

Doc 16. Backup: temp file → verify → atomic rename. Restore: stage → validate fully including INV-01 → swap. CSV: fixed column order, IDs authoritative and names informational, skip-on-ID-collision, refuse partial groups, escape leading `=`, `+`, `-`, `@` on export.

Round-trip identity (T-73) and no-duplicate re-import (T-74) are mandatory CI tests.

## 17. Performance

Doc 21. Two budgets carry a CI regression gate: **add-sheet open** and **save**. Capture is the product's survival constraint; a regression there blocks the build.

Optimise the add flow, monthly rollups, list virtualisation, and indexes. Do not optimise report generation below 10k transactions, search below 10k, or portability operations. Never optimise by storing a headline figure or skipping the post-write assertion.

## 18. Accessibility

Doc 19. Labels on every interactive element, 48 dp targets, text to 200% with amounts never truncating, no meaning by colour alone, Money available and Owed announced separately, table alternative on every chart, reduce-motion honoured.

Automated accessibility scans run on every screen in CI.

## 19. Security and privacy

Doc 20. No networking permission in the manifest. No analytics, crash-reporting, or advertising SDK. Private app storage. Parameterised queries only. Permissions requested in context at the moment of use — never at launch, and never SMS, contacts, location, camera, or network.

## 20. Testing

Doc 22 (142 tests) against doc 23 (deterministic datasets, fixed seed `pf-tracker-v1`, anchor 2026-08-16).

| Suite | Frequency |
|---|---|
| Domain unit + invariant property + Groups A, F, J | Every commit |
| Groups B–E, G–I, snapshots, repository and service integration | Every build |
| Groups K, L, UI flows | Nightly and release |

A failure in Group A or F blocks merge. Any P0 failure blocks release.

Tests compare against each dataset's **independently computed** expected-value manifest, not against the engine's own output.

## 21. Build configuration

Debug builds: invariant assertions on, diagnostics screen available, dataset seeding available.
Release builds: assertions on for INV-01 and INV-06 (cheap and highest-value), diagnostics available in Settings, no seeding.
CI gates: module-boundary check · no-networking check · banned-terms lint (T-80) · accessibility scan · performance regression · cache equivalence · migration chain.

## 22. Implementation order

Doc 28. Ten phases of vertical slices. Correctness infrastructure precedes features because retrofitting invariants is how finance apps acquire permanent drift.

Phases 1, 3, 7, and 8 may not be cut under schedule pressure — they are correctness, ownership, and access.

## 23. When you find a problem

1. Identify the exact requirement and document.
2. Explain precisely why it is contradictory, impossible, or incorrect.
3. Propose the minimum resolution.
4. Record it in `Requirements_Exceptions.md`.
5. **Continue with the original requirement** unless the contradiction makes implementation impossible.

Six exceptions already exist and are documented. That process is how the specification stays trustworthy — use it rather than working around a problem quietly.
