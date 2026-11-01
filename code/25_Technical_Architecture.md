# 25 — Technical Architecture

**The governing constraint:** the UI must never independently implement a financial calculation. There is exactly one implementation of every rule in doc 04 and every formula in doc 06, and it lives in the domain layer.

---

## 1. Layer model

```
┌─────────────────────────────────────────────┐
│ Presentation      screens, components,      │
│                   view models, navigation   │
│                   — no financial logic —    │
├─────────────────────────────────────────────┤
│ Application       use cases / services      │
│                   orchestration, atomicity  │
├─────────────────────────────────────────────┤
│ Domain            entities, invariants,     │
│                   financial rules, metrics, │
│                   analytics  — pure —       │
├─────────────────────────────────────────────┤
│ Data              repositories, SQLite,     │
│                   migrations, files         │
└─────────────────────────────────────────────┘
```

**Dependency rule.** Dependencies point inward only. The domain layer imports nothing from application, data, or presentation — no database types, no UI framework types, no platform APIs. It is plain code operating on plain values, which is what makes the 142 acceptance tests runnable without a device or a database.

## 2. Technology choices, and why

Chosen for the constraints this product actually has, not for popularity.

| Concern | Choice | Reason |
|---|---|---|
| Platform | Native Android first (Kotlin); the architecture is platform-agnostic below the presentation layer | Android is the target market; a shared domain layer keeps iOS open without paying cross-platform costs now |
| Database | **SQLite** with a typed access layer | ACID transactions, CHECK constraints, foreign keys, integer arithmetic — the four things doc 05 depends on. A document store would push integrity into application code |
| Money type | Domain `Money` value class over `Long` paise | Makes INV-15 a type-level guarantee rather than a convention |
| Async | Structured concurrency with a single-writer discipline | Prevents interleaved writes from breaking atomicity |
| State | Unidirectional: immutable state → view, events → application layer | Makes screen states (doc 18) representable and snapshot-testable in isolation |
| Navigation | Type-safe routes with one back stack per tab | Required by doc 09 §7 context preservation |
| DI | Constructor injection, manual or lightweight container | Keeps the domain free of framework annotations |

**Explicitly excluded:** any networking library, analytics SDK, crash-reporting SDK, advertising SDK, or dependency that opens a socket. A CI check fails the build if a networking API is referenced (doc 20 §8).

## 3. Domain layer

**Contents.** Entity types (`Account`, `Transaction`, `Category`, `Payee`, `Commitment`, `SpendingLimit`, `BalanceCheck`) as immutable values · the `Money` type · validation rules (doc 04 §12) · the invariant assertions (doc 05) · the metrics engine (doc 06) · the analytics engine (doc 07).

**Properties.** Pure, deterministic, no I/O, no clock access except an explicitly passed as-of date, no platform dependency. Every function is `(inputs) → output`.

**Key components.**

| Component | Responsibility |
|---|---|
| `TransactionValidator` | Enforces per-kind rules and impossible states before any write |
| `BalanceCalculator` | INV-01; derives balances from transactions |
| `MetricsEngine` | M-01…M-25, returning `{value, basis, period, isEstimate, dataState, drillQuery}` |
| `BaselineEngine` | Qualifying months, typical, MTD, ranges (doc 07 §2–4) |
| `AnomalyEngine` | M-21 with its three gates and eligibility rules |
| `MatchingEngine` | Commitment ↔ transaction matching (INV-08) |
| `ReliabilityEngine` | M-16 with precedence (EX-04) |
| `InvariantAsserter` | Post-write verification of INV-01…INV-17 |

**Rule.** If a number appears on screen, a domain function produced it. There is no arithmetic in a composable, a view model, or a SQL expression that computes a user-visible financial figure.

## 4. Application layer

Use cases orchestrate domain and data, own transaction boundaries, and expose the service contracts in doc 26.

| Service | Owns |
|---|---|
| `TransactionService` | Record, edit, delete, refund, group handling |
| `AccountService` | Create, archive (with the zero-balance rule), delete |
| `CategoryService` | CRUD, merge |
| `PayeeService` | Resolve, merge, usual-category maintenance |
| `CommitmentService` | CRUD, occurrence generation, matching, price history |
| `LimitService` | CRUD, eligibility |
| `BalanceCheckService` | Check, correct, undo |
| `ReportService` | Assembles report view models from metrics |
| `PortabilityService` | Backup, restore, CSV export, CSV import |
| `PreferencesService` | Settings, with recomputation triggers |

**Atomicity.** Every use case that writes runs in one database transaction and, on commit, re-asserts invariants for touched entities and bumps `canonical_version` (doc 15 §4). A failed assertion rolls back the whole use case.

**Single writer.** All writes serialise through one queue. Concurrent reads are free; concurrent writes are not permitted, which removes an entire class of balance-corruption bugs at negligible cost given the interaction rate.

## 5. Data layer

**Repositories** expose domain types, never database rows. They own SQL, mapping, and index usage; nothing above them knows SQLite exists.

`AccountRepository` · `TransactionRepository` · `CategoryRepository` · `PayeeRepository` · `CommitmentRepository` · `LimitRepository` · `BalanceCheckRepository` · `RollupRepository` (cache, doc 15) · `PreferencesRepository` · `FileRepository` (backup, CSV).

**Migrations** are owned here and specified in doc 27. **The rollup cache** is a repository concern and is invisible above the data layer — the `MetricsEngine` receives the same inputs whether they came from a rollup or a scan, which is what makes the cache-equivalence test (doc 15 §9) meaningful.

## 6. Calculation and reporting engines

The reporting engine (application layer) composes metrics into the view models of doc 08. It performs **no arithmetic of its own** — it selects metrics, groups them into Answer / Explanation / Detail, and attaches each figure's `drillQuery`.

This is what guarantees the doc 08 §8 consistency rule: two reports showing the same metric for the same period cannot disagree, because both called the same function.

## 7. Presentation layer

Screens hold no financial logic. A view model requests a report or metric set from the application layer and maps it to display state, applying only the formatting utility (doc 13 §9).

**Formatting is centralised.** Currency rendering, Indian grouping, owed display, and estimate styling exist in exactly one place. A component that formats money itself is a review rejection.

**States** (doc 18) are modelled explicitly as a sealed hierarchy — `FirstUse`, `Empty`, `Partial(unmetCondition)`, `Complete(data)`, `Loading`, `Error(cause, recovery)` — so an unhandled state is a compile error rather than a blank screen.

## 8. Navigation

One back stack per tab, preserved across tab switches; sheets and modals layer above the current stack and return focus on dismissal. Internal routes only (doc 09 §6); no route accepts external input and none resolves a network resource.

## 9. Backup, import, export

`PortabilityService` coordinates; `FileRepository` performs I/O. Backup writes to a temporary file, verifies, then atomically renames. Restore stages into a separate database file, validates fully — including INV-01 for every account — and swaps only on success. Import validates every row in the domain layer before a single insert, then writes the confirmed batch in one transaction.

## 10. Testing architecture

| Level | Scope | Speed | Gate |
|---|---|---|---|
| Domain unit | Pure functions: validators, metrics, baselines, anomalies | Milliseconds, no device | Every commit |
| Invariant property | Randomised sequences of operations asserting INV-01…INV-17 hold throughout | Seconds | Every commit |
| Repository integration | Real SQLite, migrations, constraints | Seconds | Every build |
| Service integration | Use cases with atomicity and rollback | Seconds | Every build |
| Golden dataset | Doc 23 datasets against published expected values | Seconds | Every build |
| Snapshot | Every component state, every screen state | Seconds | Every build |
| UI flow | The critical journeys F-03, F-10, F-14, F-22 | Minutes | Nightly + release |
| Accessibility | Doc 19 §13 | Minutes | Nightly + release |
| Performance | Doc 21 §8 against D-14 | Minutes | Nightly + release |

The domain layer's purity is what makes the most important tests — the financial ones — fast enough to run on every commit. That is the practical payoff of the dependency rule.

## 11. Project structure

```
app/            presentation: screens, components, view models, navigation, theme
application/    services (use cases), transaction boundaries
domain/         entities, Money, validators, invariants, metrics, analytics  [no dependencies]
data/           repositories, SQLite, DAOs, migrations, rollups, file I/O
portability/    backup, restore, CSV read/write
testfixtures/   deterministic generators for doc 23 datasets
```

`domain/` has no dependency on any other module. This is enforced by a build-level module boundary check, not by convention.

## 12. Boundary rules (enforced at review and in CI)

1. No financial arithmetic outside `domain/`.
2. No SQL outside `data/`.
3. No platform or framework type inside `domain/`.
4. No repository called directly from `app/` — always through a service.
5. No money value formatted outside the formatting utility.
6. No derived value persisted except the rollup cache, which must be discardable without behaviour change.
7. No networking API referenced anywhere.
8. Every write path re-asserts invariants before commit.
