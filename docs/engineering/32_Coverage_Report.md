# 32 — Master Traceability & Coverage Report

Final cross-document audit of the specification pack.

---

## 1. Pack inventory

| # | Document | Purpose |
|---|---|---|
| 01 | Product Master Spec | Executive source; features, scope, dependencies, risks |
| 02 | Domain Model | Canonical concepts and terminology |
| 03 | Data Model | Production schema, constraints, indexes |
| 04 | Financial Domain Logic | Canonical event behaviour |
| 05 | Financial Invariants | 17 rules with rationale, maths, tests |
| 06 | Metrics & Calculation Engine | 25 metrics |
| 07 | Analytics Engine | Baselines, detection, progressive intelligence |
| 08 | Reporting Specification | 6 reports, 3 depths, drill-down |
| 09 | Information Architecture | Navigation, 45 screens, routes |
| 10 | User Flows | 27 flows |
| 11 | Screen Specification | Every screen with states |
| 12 | UI Component System | 30 components |
| 13 | Design System | Tokens, formatting, tone |
| 14 | Local Storage | Persistence, atomicity, recovery |
| 15 | Recomputation | Derived data and cache boundary |
| 16 | Data Portability | Backup, CSV, round-trip |
| 17 | Search / Filter / Sort | Query surfaces |
| 18 | States, Errors, Empty States | Every application state |
| 19 | Accessibility | WCAG AA conformance |
| 20 | Security & Privacy | Threat model and controls |
| 21 | Performance | Budgets by dataset size |
| 22 | Acceptance Test Suite | 142 tests |
| 23 | Test Data & Scenarios | 16 deterministic datasets |
| 24 | Requirements Traceability | Requirement → test matrix |
| 25 | Technical Architecture | Layers and boundaries |
| 26 | Domain Service Contracts | Interfaces |
| 27 | Database Migrations | Versioning and safety |
| 28 | Implementation Plan | 10 vertical-slice phases |
| 29 | Claude Design Handoff | Design source and boundaries |
| 30 | Claude Code Handoff | Engineering source and boundaries |
| 31 | Release Readiness | Production gates |
| 32 | Coverage Report | This document |
| — | Requirements_Exceptions | 6 logged contradictions |

**33 documents.**

## 2. Coverage counts

| Item | Total | P0 | P1 | P2 |
|---|---|---|---|---|
| Features | 43 | 23 | 14 | 6 |
| Screens | 45 | 33 | 10 | 2 |
| User flows | 27 | 24 | 3 | — |
| Domain entities | 12 | 12 | — | — |
| Metrics | 25 | 16 | 6 | 3 |
| Reports | 6 | 3 | 3 | — |
| Components | 30 | 30 | — | — |
| Invariants | 17 | 17 | — | — |
| Acceptance tests | 142 | 122 | 20 | — |
| Test datasets | 16 | 16 | — | — |

## 3. Requirement coverage

| Mapping | Covered | Gaps |
|---|---|---|
| Requirements → domain model | 43 / 43 | 0 |
| Requirements → data model | 43 / 43 | 0 |
| Requirements → financial logic | All money-affecting | 0 |
| Requirements → metrics | 25 / 25 traced | 0 |
| Requirements → reports | 6 / 6 | 0 |
| Requirements → screens | 45 / 45 | 0 |
| Requirements → flows | 27 / 27 | 0 |
| Requirements → tests | 43 / 43 features; 17 / 17 invariants | 0 |

**Requirements without implementation coverage: 0.**
**Tests without requirement coverage: 0.**
**Orphan P0 requirements: 0.**

Nine implementation artefacts exist without a direct product requirement; each is a structural necessity, justified in doc 24 §5 and logged where it originated from a contradiction.

## 4. Cross-document consistency audit

| Axis | Check | Result |
|---|---|---|
| Requirements ↔ domain | Every frozen concept present, none added | ✅ |
| Domain ↔ data | Every entity has a table; every table an entity | ✅ |
| Data ↔ logic | Per-kind CHECK constraints match doc 04 exactly | ✅ |
| Logic ↔ invariants | Every rule in doc 04 maps to an invariant or a constraint | ✅ |
| Invariants ↔ tests | 17 / 17 have named tests | ✅ |
| Logic ↔ metrics | Every metric's inputs are defined events | ✅ |
| Metrics ↔ analytics | Baselines consume only defined metrics | ✅ |
| Metrics ↔ reports | Every displayed figure is a doc 06 metric | ✅ |
| Reports ↔ IA | Six reports; Monthly Review is a mode, not a seventh surface | ✅ |
| IA ↔ screens | 45 in both; IDs consistent | ✅ |
| Screens ↔ components | Every screen composes catalogued components | ✅ |
| Screens ↔ states | Every screen declares applicable states | ✅ |
| Components ↔ design system | All tokens defined | ✅ |
| Architecture ↔ contracts | Every service in both | ✅ |
| Contracts ↔ tests | Every service operation has coverage | ✅ |
| Plan ↔ everything | Every phase maps to features, screens, tests | ✅ |
| Handoffs ↔ pack | Both reference only existing documents | ✅ |

### Canonical term check

One definition per concept, verified across all 33 documents:

`Money available` · `Owed` · `Spent` · `Received` · `Kept` · `Kept %` · `Must-pay` · `Flexible` · `Promised` · `Left to spend` · `Typical` · `Regular bills` · `Not recorded` · `Interest & charges` · `Outside` · `Balance check` · `Correction` · `Qualifying month` · `Commitment` · `Spending limit`.

Transaction kinds are exactly `out`, `in`, `move`, `back`, `correction`, `start` everywhere. Account classes are exactly `asset` and `owed`. No document uses "transfer", "liability", "expense offset", "reconciliation adjustment", or "anomaly" as a user-facing term.

### Conflicts found and resolved during the audit

| Conflict | Resolution |
|---|---|
| Loan drift categorised as `Interest & charges` (doc 04) vs. all corrections using `Not recorded` (invariant 9) | Split by account class; stated identically in docs 02, 04, 05, 15, 22 |
| Interest source ambiguous for repayment vs. accrual | EX-02; the two cases are now distinguished everywhere |
| Multi-row actions had no grouping key | EX-03; `group_id` added to docs 03, 04, 14, 16, 22 |
| Reliability states could match simultaneously | EX-04; precedence fixed in docs 07, 18 |
| Archiving could destroy money | EX-01; archive-at-zero in docs 02, 04, 10, 18, 22 |
| `Outside` sign undefined | EX-06; per-label net rule in docs 02, 06, 22 |

All six are logged in `Requirements_Exceptions.md`. None changes a product decision, adds a user-facing feature, or alters a priority.

## 5. Final quality gate

| Question | Answer |
|---|---|
| **Product** — can the complete product be understood from the pack? | Yes. Doc 01 gives scope and dependencies; every feature traces to a job, a screen, a flow, and a test. |
| **UX** — can Claude Design work without inventing product behaviour? | Yes. 45 screens, 27 flows, 30 components, a token system, per-state copy, and an explicit list of what must not change (doc 29 §15). |
| **Engineering** — can Claude Code implement without inventing financial rules? | Yes. Doc 04 governs every event, doc 05 every invariant, doc 26 every interface, doc 03 every constraint. Ambiguity is to be flagged, not guessed (doc 30 §1). |
| **Data** — can the schema represent every supported real-world event? | Yes. All events in doc 04 map to the six kinds; the war-room cases in doc 22 Group A are all representable, including card credit, cash advances, loan interest, and untracked destinations. |
| **Analytics** — can every report be reproduced deterministically from local data? | Yes. Metrics are pure functions of canonical rows plus an as-of date; the cache-equivalence test proves no report depends on cached state. |
| **QA** — can every important financial behaviour be tested? | Yes. 142 tests over 16 deterministic datasets with independently computed expected values. |
| **Offline** — can everything operate without internet? | Yes. Audited feature by feature (doc 10 §—, doc 23 §—, doc 20 §8); enforced by a CI check and a manifest with no networking permission. |
| **User** — can an ordinary person use it without understanding accounting? | Yes by design: five concepts, a full translation layer, and an automated banned-terms lint. Empirically unproven until prototype testing. |
| **Future** — can the data model evolve without destroying user data? | Yes. Forward-only migrations, safety backups, balance-fingerprint validation, and a permanent obligation that every released backup remains restorable. |

## 6. Remaining ambiguities

**Technical: 0.** Every interface, constraint, formula, and state is specified. Two items are explicitly deferred as engineering design tasks within stated boundaries — the rollup caching implementation (doc 15 §5 fixes the boundary) and the P2 encryption key strategy (doc 20 §2 fixes the requirement).

**Financial: 0.** Every event in the war rooms has one canonical treatment. Two accepted approximations are disclosed in-app rather than hidden: loan interest is approximate until a balance check, and untracked destinations are recorded at what was put in and never valued.

**Requirements exceptions outstanding: 0.** All six are resolved and applied.

## 7. Behavioural risks — carried forward, deliberately unsolved

These cannot be resolved by specification, and no feature was added to pretend otherwise.

| Risk | Validation |
|---|---|
| **Manual-entry sustainability** | Prototype with real users. If people will not log consistently, this invalidates the product concept, not the specification. |
| **Balance-check adoption** | Prototype over 60 days; it is the only error-detection mechanism in the system. |
| **Essential vs flexible accuracy** | Prototype; measure the override rate. |

---

# Specification Status: **READY**

| Measure | Value |
|---|---|
| Documents completed | **33** (32 specified + Requirements_Exceptions) |
| Requirements covered | **43 / 43** features; **17 / 17** invariants; **0** orphans |
| Screens specified | **45** (33 P0 · 10 P1 · 2 P2) |
| User flows specified | **27** |
| Domain entities specified | **12** |
| Metrics specified | **25** (16 P0 · 6 P1 · 3 P2) |
| Reports specified | **6** (3 P0 · 3 P1), Monthly Review as a mode |
| Components specified | **30** |
| Acceptance tests specified | **142** (122 P0 · 20 P1) |
| Test datasets specified | **16** |
| Technical ambiguities remaining | **0** |
| Financial ambiguities remaining | **0** |
| Requirements exceptions remaining | **0** unresolved (6 logged and applied) |
| Behavioural risks remaining | **3**, all marked for prototype validation |

**READY** means the product is specified well enough to proceed to design and implementation without reopening the product-definition phase.

**Next phase:** Claude Design (doc 29) → prototype → real-user validation of the three behavioural risks → Claude Code (doc 30) → implementation per doc 28.
