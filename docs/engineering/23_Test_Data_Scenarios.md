# 23 — Test Data & Scenario Library

Deterministic synthetic datasets. Every dataset is generated from a fixed seed and a fixed anchor date, so results are reproducible across machines and builds. Amounts are in paise internally and quoted in rupees here.

**Anchor date for all datasets: 2026-08-16.** Generators derive every date relative to this anchor, so "3 months of history" always means the same three months.
**Seed:** `pf-tracker-v1`. The same seed must produce byte-identical databases on every run — this is itself a test (T-93 depends on it).

---

## D-01 · New user
**Shape.** 1 bank account (₹45,000 start), 6 transactions over 3 days, no income yet.
**Purpose.** Day-1 and first-week states. Verifies that facts are exact and comparisons absent.
**Exercises.** T-50, T-51, T-70, empty and partial states across every screen.
**Expected.** Balances exact; no typical; no projection; reliability = "Just starting".

## D-02 · Typical user, 14 months
**Shape.** Bank (₹1,20,000 start), Cash (₹3,000), UPI wallet (₹2,000), one card. ~90 transactions/month, salary ₹95,000 monthly on the 1st, rent ₹22,000, 4 commitments, occasional refunds. ~1,260 transactions.
**Purpose.** The primary regression dataset — the "normal" against which everything else is contrast.
**Exercises.** All six reports, typical baselines, day-aligned comparisons, limits, Monthly Review, drill-down reconciliation.
**Expected.** Typical ≈ ₹58,000/month; Kept % ≈ 38%; all qualifying months qualify.

## D-03 · Heavy spender, 24 months
**Shape.** 5 accounts, 3 cards, ~300 transactions/month, high dining and shopping variance. ~7,200 transactions.
**Purpose.** Seasonality (P2), 24-month windows, performance at realistic upper-normal volume.
**Exercises.** T-140, R-05 over 24 months, year-over-year, unusual spending with genuine signal.

## D-04 · Low-volume user, 12 months
**Shape.** 1 bank account, ~12 transactions/month — deliberately at the boundary of the ≥10 qualifying-month rule. Two months fall to 8 transactions.
**Purpose.** The qualifying-month rule and its consequences.
**Exercises.** T-56 (month excluded, typical shifts), sparse-category suppression T-42.
**Expected.** 10 of 12 months qualify; typical computed from those 10; the excluded months are named in the explanation panel.

## D-05 · Irregular income (freelancer), 18 months
**Shape.** Income arriving 1–3 times monthly at ₹0–₹2,40,000, CV > 0.5. Two months with zero income.
**Purpose.** The income-volatility path.
**Exercises.** T-45 (Kept % suppressed at zero income), T-58, range display instead of point comparison, M-16.
**Expected.** Kept % suppressed in the two zero-income months, never shown as 0%; spending reporting unaffected.

## D-06 · Credit-card user, 12 months
**Shape.** Bank + 2 cards. Every month: 20–30 card purchases, one full bill payment, occasional partial payment, 3 refunds, one annual fee, two interest charges, one cash advance, one month of overpayment leaving the card in credit.
**Purpose.** The complete card war room in one dataset.
**Exercises.** T-03…T-18, and the headline guarantee — total spending must equal purchases only, never purchases plus payments.
**Expected assertion.** `Σ Spent = Σ card purchases + Σ fees + Σ interest − Σ refunds`, with bill payments contributing exactly zero.

## D-07 · Loan user, 18 months
**Shape.** ₹5,00,000 personal loan disbursed month 1. Monthly EMI ₹12,000: months 1–6 with `interest_amount = 0`, months 7–18 with declared interest. Two loan balance checks producing `Interest & charges` corrections. One partial prepayment.
**Purpose.** The loan model end to end, including the interest-source rule (EX-02) and drift correction.
**Exercises.** T-23…T-27, T-82.
**Expected.** Disbursement contributes zero income; owed decreases only by principal; drift lands in `Interest & charges` and appears in category shares.

## D-08 · Cash-heavy user, 12 months
**Shape.** Bank + Cash. Weekly ATM withdrawals, ~60% of spending in cash, monthly balance checks with drift between −₹200 and −₹1,400.
**Purpose.** The correction mechanism at realistic frequency.
**Exercises.** T-19, T-20, T-60…T-69, `Not recorded` treatment.
**Expected.** `Not recorded` is a visible line item every month, never folded into categories, never in baselines; category shares still sum to 100%.

## D-09 · Refund-heavy month
**Shape.** D-02 plus one month with ₹42,000 of refunds against ₹38,000 of spending.
**Purpose.** The negative-spend and >100% Kept % edge cases.
**Exercises.** T-46, M-04 negative path.
**Expected.** Spent is negative for that month with a plain explanation; Kept % exceeds 100% and is explained, not suppressed and not treated as an error.

## D-10 · Multi-account complexity
**Shape.** 9 accounts — 3 bank, cash, 2 UPI wallets, savings, 2 cards — with frequent inter-account movement including card-to-card transfers and moves to `Outside` under three labels.
**Purpose.** Move semantics at scale; proving movement never becomes spending.
**Exercises.** T-17, T-28…T-30, T-85.
**Expected assertion.** `Σ Spent` is identical whether or not any move exists in the dataset.

## D-11 · Missing transactions
**Shape.** D-02 with 18% of transactions randomly removed and no balance checks performed.
**Purpose.** The unreliable-data path.
**Exercises.** T-57, reliability = "Some gaps", weakened comparisons.
**Expected.** Every fact remains exact and shown; the reliability sentence appears; unusual spending still requires qualifying months; nothing is fabricated.

## D-12 · Gap then catch-up
**Shape.** D-02 with a 3-week gap, then 40 backdated entries added on one day.
**Purpose.** Backdating, revision marking, and recomputation cascades.
**Exercises.** T-59, revised-period marking, qualifying-status flips.
**Expected.** Affected closed periods marked revised; baselines recomputed; a month may newly qualify.

## D-13 · Long history
**Shape.** 5 years, ~1,000 transactions/year, all features exercised. ~5,200 transactions.
**Purpose.** Long-window reporting and migration realism.
**Exercises.** 24-month windows, migration tests T-122.

## D-14 · Performance datasets
**Shape.** Four generated volumes — **1k, 10k, 50k, 100k** transactions — with the same account and category structure as D-02, scaled by density rather than by adding entity types.
**Purpose.** The doc 21 benchmark suite.
**Exercises.** T-137…T-142, cache-equivalence checks.

## D-15 · Migration corpus
**Shape.** A stored backup file for every released schema version, each generated from D-02.
**Purpose.** Forward-migration verification.
**Exercises.** T-118, T-119, T-122.
**Expected.** Every account balance after migration is exactly equal to its value before.

## D-16 · Malformed import corpus
**Shape.** A set of CSV files, each with one deliberate defect: unknown account ID, renamed account with a valid ID, partial group, refund exceeding its parent, refund preceding its parent in file order, invalid kind, negative amount, future date, missing header, newer schema version, a field beginning with `=`.
**Purpose.** Import validation.
**Exercises.** T-114…T-117, T-123.
**Expected.** Each defect is reported by row number with a plain-language reason; no invalid row is ever inserted; valid rows in the same file may still be imported.

---

## Generator requirements

1. **Deterministic.** Fixed seed and anchor date; identical output every run, verified by hashing the resulting database.
2. **Financially valid.** Every generated dataset satisfies INV-01…INV-17 at rest. A generator that can produce an invalid dataset is itself a defect — this makes the generator a second, independent check on the domain rules.
3. **Expected values published.** Each dataset ships a manifest of its own expected metrics (Spent, Received, Kept, Kept %, typical, top-3 share, per-account balances) computed independently of the application's engine, so tests compare against an external truth rather than against the code under test.
4. **Realistic distributions.** Amounts follow plausible right-skewed distributions; payees repeat with realistic frequency; commitments land within their ±7-day and ±20% matching windows in most months and outside them occasionally, so the overdue path is exercised naturally.
5. **Composable.** Datasets are assembled from the same primitives, so a new scenario is a configuration rather than new generator code.
6. **Documented anomalies.** Where a dataset deliberately contains a defect (D-11, D-16), the manifest names it, so a test failure is never mistaken for bad test data.

## Coverage matrix

| Area | Datasets |
|---|---|
| Day-1 / early states | D-01 |
| Core reporting | D-02, D-03 |
| Qualifying months | D-04, D-12 |
| Irregular income | D-05 |
| Credit cards | D-06, D-10 |
| Loans | D-07 |
| Cash and corrections | D-08, D-11 |
| Refunds and edge signs | D-09 |
| Moves and Outside | D-10 |
| Completeness and reliability | D-11, D-12 |
| Long-window analytics | D-03, D-13 |
| Performance | D-14 |
| Migration | D-15, D-13 |
| Import validation | D-16 |

Every acceptance test in doc 22 names the dataset it runs against; no test constructs its own data inline except the trivial preconditions in Group A.
