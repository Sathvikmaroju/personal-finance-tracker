# 28 — Implementation Plan

Ten phases of **vertical slices** — each ends with software a person could actually use, not a layer waiting for another layer. Correctness infrastructure is built before features, because retrofitting invariants onto a working app is how finance products acquire permanent, undiagnosable drift.

---

## Phase 1 — Foundation
**Objective.** A running app with the domain layer, database, and correctness machinery in place, capable of recording one transaction end to end.
**Dependencies.** None.
**Scope.** Project structure and module boundaries (doc 25 §11) · `Money` type · entity types · SQLite schema v1 with all CHECK constraints, foreign keys, and indexes · repositories · `TransactionValidator` · `BalanceCalculator` · `InvariantAsserter` · single-writer transaction discipline · deterministic dataset generators (doc 23) · CI with the module-boundary and no-networking checks.
**Screens.** A developer harness only.
**Tests.** Domain unit tests · invariant property tests · T-86, T-91, T-93, T-94 · generator determinism.
**Done when.** A transaction can be written and read back, INV-01 is asserted after every write, and the boundary checks fail the build if violated.
**Risks.** Over-designing the domain layer before real screens exist — mitigated by keeping Phase 1 to what Phase 2 immediately consumes.

## Phase 2 — Accounts and capture
**Objective.** The product's core loop: create accounts, record money, see correct balances.
**Dependencies.** Phase 1.
**Scope.** F-01…F-07 · onboarding · all six transaction kinds · three-chip add sheet with calculator and smart defaults · payee memory · accounts and categories management · transaction list, detail, edit, delete.
**Screens.** S-01 (partial), S-02…S-13, S-19…S-21, S-31.
**Logic.** Doc 04 §1–6, §11.
**Tests.** T-01, T-02, T-19…T-22, T-71, T-77, T-78, T-96…T-103.
**Done when.** A person can track cash and bank money accurately for a week, in three taps per entry.
**Risks.** Add-flow latency — measured from this phase onward, with the doc 21 budget enforced in CI.

## Phase 3 — Financial correctness
**Objective.** Every event in doc 04 modelled correctly. This phase is the product's reason to exist.
**Dependencies.** Phase 2.
**Scope.** F-08…F-10, F-13 · owed accounts (cards, loans) · forced move classification · refunds and reimbursements via `back` · `Outside` destinations with labels · the loan interest split and its `group_id` · balance check with class-derived sign and undo · corrections and `Not recorded` · archive-at-zero (EX-01).
**Screens.** S-14, plus card/loan handling across S-02, S-08, S-11–S-13.
**Tests.** The whole of Group A (T-01…T-32), Group D (T-60…T-69), Group F (T-81…T-95).
**Done when.** A ₹3,000 card purchase followed by a ₹3,000 payment shows ₹3,000 of spending, and every scenario in datasets D-06, D-07, D-08 reconciles.
**Risks.** The loan interest-source rule (EX-02) is subtle; it gets dedicated review and its own test set.

## Phase 4 — Reporting foundation
**Objective.** The three P0 reports with full drill-down.
**Dependencies.** Phase 3.
**Scope.** F-15…F-19 · metrics M-01…M-16 · `ReportService` and view models · Answer/Explanation/Detail structure · drill-down as filter specification · Home's four elements · reliability sentence · all six screen states.
**Screens.** S-01 (complete), S-15…S-18, S-22, S-32, S-33.
**Tests.** T-33…T-35, T-44…T-47, T-49, T-70, T-72, Group C.
**Done when.** Every displayed aggregate drills to transactions that sum to it exactly, and no screen renders blank in any state.
**Risks.** Report/metric duplication — prevented by the rule that the reporting engine performs no arithmetic (doc 25 §6).

## Phase 5 — Planning
**Objective.** Commitments and limits, making *Promised* and *Left to spend* meaningful.
**Dependencies.** Phase 4.
**Scope.** F-11, F-12 · commitment CRUD, occurrence generation, matching (INV-08), overdue prompts, price history · limits with progress and pace, eligibility rules, suggested amounts · annual set-aside guidance.
**Screens.** S-23…S-26; Plan hub complete.
**Tests.** Group H, T-106…T-113.
**Done when.** Left to spend reflects real obligations, and a paid bill is never double-counted in Promised.

## Phase 6 — Advanced analytics
**Objective.** The intelligence layer, unlocked honestly.
**Dependencies.** Phase 5 plus enough history in test datasets.
**Scope.** F-24…F-32, F-37 · baseline engine with qualifying months · day-aligned comparisons · What changed with the waterfall · Over time · Regular bills report · recurrence detection · unusual spending with three gates and the MAD floor · price-change alerts · card-in-credit signal · insight gates and cooldowns · Monthly Review mode · one-off flagging.
**Screens.** S-34…S-39.
**Tests.** T-36…T-43, T-48, T-56, T-87, T-88, T-111…T-113.
**Done when.** D-04 excludes its two sub-threshold months from baselines, D-08's corrections stay out of baselines, and stable rent never raises an anomaly.
**Risks.** False positives destroying trust — every gate is tested against the doc 23 datasets before this phase closes.

## Phase 7 — Data portability
**Objective.** The user owns their data, verifiably.
**Dependencies.** Phase 3 (stable schema); ideally after Phase 6 so exports cover everything.
**Scope.** F-20, F-21 · backup with atomic write and verification · staged, validated restore · CSV export with the fixed column set and injection escaping · CSV import with ID-only resolution, preview, and skip-on-collision · reference sheets · migration framework and the chain test.
**Screens.** S-27…S-29.
**Tests.** Group I (T-114…T-123), T-73…T-75, Group J.
**Done when.** Round-trip identity holds on every doc 23 dataset and D-16's every defect is caught and reported by row.

## Phase 8 — Accessibility, security, performance
**Objective.** Meet the non-functional bar as a gate, not an afterthought.
**Dependencies.** Phases 2–7.
**Scope.** Full doc 19 conformance · app lock (F-34) · permission handling in context · diagnostics sanitisation · rollup cache with the equivalence test · list virtualisation · startup budget · benchmark suite over D-14.
**Screens.** S-41; accessibility work across all screens.
**Tests.** Groups K and L; cache-equivalence; doc 20 verification.
**Done when.** F-03 is completable by screen reader, every chart has a table alternative, and add/save latency meets budget at 10k.
**Risks.** Accessibility retrofitted late is expensive — mitigated by labelling and state modelling from Phase 2, with this phase verifying rather than introducing.

## Phase 9 — Polish
**Objective.** The product feels calm and finished.
**Dependencies.** Phase 8.
**Scope.** F-33 widget · F-35 duplicate prompt · F-36 catch-up entry · empty and insufficient-state copy review · the language lint (T-80) across every string · motion and reduce-motion · dark theme verification · icon set completion.
**Screens.** S-42, S-43; refinement throughout.
**Tests.** T-76, T-80, snapshot coverage of every state.
**Done when.** No user-visible string contains accounting or statistical vocabulary, and every state renders deliberately.

## Phase 10 — Release readiness
**Objective.** Ship.
**Dependencies.** All.
**Scope.** Doc 31 checklist · device matrix testing · migration rehearsal from every released version · store assets and privacy declaration matching doc 20 exactly · the in-app limitations statement · final coverage report.
**Tests.** All 122 P0 and 20 P1 tests green; nightly suites stable for a week.
**Done when.** Every gate in doc 31 passes.

---

## Phase dependency graph

```
P1 Foundation
 └─ P2 Accounts + capture
     └─ P3 Financial correctness   ← the critical path
         ├─ P4 Reporting
         │   └─ P5 Planning
         │       └─ P6 Advanced analytics
         └─ P7 Portability (parallel with P4–P6 once schema is stable)
             └─ P8 Accessibility / security / performance
                 └─ P9 Polish
                     └─ P10 Release
```

## First shippable release

**Phases 1–5, 7, 8 constitute the P0 release** — every P0 feature, all 17 invariants, three reports, planning, portability, and the non-functional bar. Phase 6 (P1 analytics) and Phase 9 follow.

Cutting order under pressure, worst option last: Phase 9 polish → Phase 6 analytics → the Limits report (F-17) → the commitments *report* while keeping the commitments *entity*. **Nothing in Phases 1, 3, 7, or 8 may be cut** — those are correctness, ownership, and access, and a product that compromises them is not worth shipping.

## Cross-cutting practices

Every phase maintains: green P0 tests before merge · invariant assertions active in debug builds · the doc 23 datasets as the only test data · no new dependency without an offline audit · every artefact traceable to doc 24 or logged in `Requirements_Exceptions.md`.
