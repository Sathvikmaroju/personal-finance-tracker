# 15 — Recomputation & Derived Data

INV-14 states that no derived value is stored. This document defines how that is honoured while keeping the app fast, and draws the exact boundary within which caching is permitted.

**Governing rule.** Financial correctness has priority over optimisation. A cache may only ever be an accelerator for a value that is *also* derivable on demand, and any doubt about validity resolves by recomputing.

---

## 1. What is canonical and what is derived

**Canonical (stored):** transactions, accounts, categories, payees, commitments, occurrences, limits, balance checks, preferences.

**Derived (never authoritative in storage):** every account balance · every metric M-01 … M-25 · category shares · baselines and typical values · reliability state · limit progress and pace · commitment match status · insight eligibility · report contents.

## 2. Derivation model

All derived values are pure functions of canonical data plus an explicit as-of date (doc 06 §Calculation engine contract). The same inputs always produce the same outputs, which is what makes them safe to cache and trivial to test.

```
canonical rows ─> selectors ─> metrics ─> analytics ─> report view models ─> UI
                     ↑
              (cache layer sits here, keyed by canonical state)
```

## 3. When recomputation occurs

| Trigger | Scope |
|---|---|
| App start | Startup integrity: all account balances (doc 14 §8) |
| Screen mount / period change | The metrics that screen displays, for that period |
| Any transaction create, update, delete | Affected accounts, affected periods, dependent baselines |
| Account, category, limit, commitment change | Everything referencing it |
| Balance check resolution | The account and the period containing the correction |
| Restore, import, migration | Everything; all caches dropped |
| Preference change to `month_start_day` | Everything; all period boundaries shift |
| Preference change to `decimals` | Display only — **no** recomputation, and stored values are never altered |

## 4. Invalidation

Caches are keyed by `(scope, period, canonical_version)` where `canonical_version` is a monotonically increasing counter bumped inside the same database transaction as any money-affecting write. A stale cache is therefore impossible to read: the key cannot match.

**Cascade rules for a changed transaction:**

| Change | Invalidates |
|---|---|
| Amount | Both accounts' balances; that period's rollup; baselines containing that month; dependent insights |
| Date | Old and new period rollups; both months' baseline participation |
| Category | That period's category aggregates for both categories; limits; baselines for both |
| Account | Both old and new accounts' balances; account-filtered aggregates |
| Kind | Everything the record participates in, in both its old and new roles |
| `essential` / `repeating` | Must-pay/flexible split; limit eligibility; anomaly eligibility |
| Delete | As for the equivalent field changes, plus linked `back` and group records |

A change to any month's contents also re-evaluates whether that month still satisfies the **qualifying month** rules (doc 07 §2), because a deletion can drop a month below 10 transactions and thereby change every baseline that used it.

## 5. What may be cached

| Layer | Cacheable | Lifetime | Notes |
|---|---|---|---|
| Account balances | Yes, in memory | Until `canonical_version` bumps | Recomputed and asserted at startup regardless |
| **Monthly rollups** (per month: total spend, per-category spend, per-account spend, transaction count, income) | Yes, **persisted** | Keyed by month + `canonical_version` | The only persisted cache. Mandatory above 10k transactions for R-05 |
| Baselines / typical | Yes, in memory | Until any contributing month changes | Cheap to recompute from rollups |
| Report view models | Yes, in memory, per session | Until `canonical_version` bumps or period changes | — |
| Insight eligibility | Yes, in memory | Recomputed on period change | Cooldowns are canonical, stored in preferences |
| **Anything shown as a headline number** | Must be derivable on demand | — | A cache miss must never block or degrade correctness |

**Persisted rollups are a derived artefact, not a source of truth.** They carry the `canonical_version` they were built from; on mismatch they are discarded and rebuilt. They are excluded from backups and CSV exports, and are rebuilt after restore, import, or migration. If the rollup table were ever deleted entirely, the app would function identically, only slower — that is the test of whether a cache is legitimate.

## 6. Specific derivations

**Account balance.** `Σ(amount where to = A) − Σ(amount where from = A)` over all time. Never period-scoped, never stored, asserted after every write.

**Spent / Received / Kept.** Period aggregation with refunds netted and corrections included (doc 06 M-04…M-06). Built from monthly rollups where available.

**Typical / baselines.** Median over qualifying months, computed from monthly rollups. Recomputed whenever a contributing month's rollup changes or its qualifying status flips.

**Reliability.** Derived from days-with-records in the period, the latest unresolved balance-check drift, and days since the last entry. Cheap; computed on demand.

**Commitment match status.** Derived by the matching rule (doc 07 §7) rather than stored as a flag, **except** that a user's manual link is a canonical fact and is stored on the occurrence. Automatic matches are re-derived; manual links are respected and never overwritten.

**Limit progress and pace.** Pure functions of period spend, limit, and the day of period.

## 7. Propagation of edits and deletes

1. Write inside a database transaction; bump `canonical_version`.
2. Re-derive and assert balances for touched accounts (INV-01).
3. Recompute the affected months' rollups.
4. Re-evaluate qualifying status for those months; if changed, drop all baseline caches.
5. Mark any affected **closed** period as `revised` for that session, so reports and the Monthly Review can state "Past figures updated."
6. Emit a change event; mounted screens re-query.

Historical reports update automatically and silently in the data layer; the user-visible acknowledgement is the "revised" note, so a changed past month is never a surprise.

## 8. Performance boundary

| Dataset | Strategy |
|---|---|
| ≤ 10k transactions | Direct queries; rollups optional |
| 10k–50k | Persisted monthly rollups required for R-04, R-05 |
| 50k–100k | Rollups required for all report surfaces; transaction list virtualised and paged |
| > 100k | Same, plus background rollup rebuild after bulk import |

Targets in doc 21. Optimisation may never be achieved by storing a headline figure and trusting it.

## 9. Testing requirements

- **Idempotence.** Recomputing twice yields identical results (T-93).
- **Cache equivalence.** Every report renders identically with caches enabled and with the rollup table dropped — run as a mandatory CI comparison across the doc 23 datasets.
- **Cascade correctness.** Editing a three-month-old transaction updates that month, all baselines containing it, and all dependent insights (T-59).
- **Qualifying-status flip.** Deleting transactions to push a month below 10 removes it from baselines and changes typical accordingly (T-56).
- **Startup assertion.** Corrupting a balance out of band is detected at startup (doc 14 §9).
