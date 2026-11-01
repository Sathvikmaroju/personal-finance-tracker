# 06 — Metrics & Calculation Engine

Every production metric. No metric exists outside this document; the UI renders these and nothing else. Basis: **S** = spending view (recognised at purchase), **M** = money view (actual movement). Period boundaries use `preferences.month_start_day`.

All metrics return a typed result: `{ value, basis, period, isEstimate, dataState, drillQuery }` where `dataState ∈ {ok, insufficient, suppressed}`. A metric that cannot be computed returns `insufficient` with the specific unmet condition — never a zero, never a blank.

---

## M-01 · Account balance
**User-facing:** "Bank ₹42,500" / "You owe ₹4,88,500"
**Basis:** M · **Tier:** P0
**Formula:** `Σ{amount : to_account = A} − Σ{amount : from_account = A}`
**Inputs:** all transactions touching A, all time (never period-scoped).
**Minimum data:** none — exact from day 1.
**Missing data:** not possible; the balance is definitionally complete relative to what is recorded.
**Edge cases:** negative asset balance → "overdrawn"; positive owed balance → "in credit".
**Example:** start 50,000; out 3,000; move-in 2,000 → 49,000.
**Drill-down:** account → transaction list, sorted by date, running balance shown.

## M-02 · Money available
**User-facing:** "You have ₹51,200" · **M · P0**
**Formula:** `Σ M-01(A) for A where class='asset' ∧ counts_as_available ∧ ¬is_archived ∧ ¬is_system`
**Edge cases:** excludes owed, archived and system accounts. Because archiving requires a zero balance (EX-01), no money can vanish from this total.
**Drill-down:** list of contributing accounts with balances summing exactly to the total.

## M-03 · Owed
**User-facing:** "You owe ₹18,400" · **M · P0**
**Formula:** `Σ |M-01(A)| for A where class='owed' ∧ M-01(A) < 0`
**Edge cases:** accounts in credit are excluded here and reported separately as "in credit".
**Rule:** never netted against M-02 into a single figure.
**Drill-down:** per-account owed, then transactions.

## M-04 · Spent
**User-facing:** "Spent this month ₹48,200" · **S · P0**
**Formula:** `Σ{amount : kind='out' ∧ date ∈ P} − Σ{amount : kind='back' ∧ date ∈ P} + Σ{correction spending in P}`
**Filters:** period; optionally account, category, payee.
**Minimum data:** none.
**Edge cases:** may be **negative** in a heavy-refund month — displayed with the explanation "more came back than went out this month". Includes `Not recorded` corrections in the total but shows them as a separate line.
**Example:** out 50,000; back 2,000; correction 200 → 48,200.
**Drill-down:** Spent → categories → payees → transactions, each level summing exactly.

## M-05 · Received
**User-facing:** "Received ₹1,00,000" · **S · P0**
**Formula:** `Σ{amount : kind='in' ∧ date ∈ P} + Σ{correction income in P}`
**Excludes:** moves, loan disbursements, `start` records (INV-07, INV-10).
**Drill-down:** income categories → transactions.

## M-06 · Kept
**User-facing:** "You kept ₹51,800" · **S · P0**
**Formula:** `M-05 − M-04`
**Edge cases:** negative when spending exceeds income — shown as "You spent ₹X more than came in".
**Drill-down:** to M-04 and M-05.

## M-07 · Kept %
**User-facing:** "You kept 52% of what came in" · **S · P0**
**Formula:** `M-06 ÷ M-05`
**Minimum data:** one month **and** `M-05 > 0`.
**Missing data:** `M-05 = 0` → `insufficient`, displayed as "no income recorded this month". **Never 0%.**
**Edge cases:** may exceed 100% in a refund-heavy month; may be negative. Both are displayed with a one-line explanation. Loan principal repayment counts as spending, which understates true wealth accumulation — disclosed in the metric's explainer.

## M-08 · Must-pay
**User-facing:** "Must-pay ₹31,000" · **S · P0**
**Formula:** `Σ{amount : kind='out' ∧ essential=true ∧ date ∈ P}` (net of linked `back`)
**Caveat shown on tap:** classification is the user's own judgement and is editable.

## M-09 · Flexible
**User-facing:** "Flexible ₹17,200" · **S · P0**
**Formula:** `Σ{amount : kind='out' ∧ essential=false ∧ date ∈ P}` (net of linked `back`)

## M-10 · Category share
**User-facing:** "Eating Out — 18% of your spending" · **S · P0**
**Formula:** `spend(category, P) ÷ (M-04(P) − corrections(P))`
**Note:** the denominator excludes `Not recorded` so shares always sum to 100% across real categories (INV-09).
**Drill-down:** category → payees → transactions.

## M-11 · Top-3 share
**User-facing:** "Three categories account for 68% of your spending" · **S · P0**
**Formula:** `Σ top 3 category spends ÷ (M-04 − corrections)`
**Interpretation:** descriptive only, never judged. High concentration in rent is neither good nor bad.

## M-12 · Promised
**User-facing:** "Already promised ₹14,300" · **M · P0**
**Formula:** `Σ{occurrence.expected_amount : status ∈ {upcoming, overdue} ∧ due_date ≤ horizon} + Σ{owed balance due ≤ horizon}`
**Horizon:** end of the current period, or `due_day` where set on an owed account.
**Minimum data:** at least one commitment or owed balance.
**Missing data:** none entered → `insufficient`, displayed as "I don't know your bills yet — add them for a better picture". **Never assumed zero.**
**Edge case:** a matched occurrence is excluded (INV-08), so a bill already paid is not counted again.
**Drill-down:** list of upcoming and overdue items with dates.

## M-13 · Left to spend
**User-facing:** "Left to spend ₹28,600" · **M · P0**
**Formula:** `M-02 − M-12 − preferences.buffer_paise`, **signed**
**Edge cases:** negative values are displayed as a shortfall with the contributing commitments listed — **never floored at zero**.
**Missing data:** with no commitments known, computed from M-02 and buffer alone, and labelled as such.
**Drill-down:** a breakdown panel showing available, promised, buffer, and the result.

## M-14 · Limit progress
**User-facing:** progress bar + "₹4,200 of ₹6,000" · **S · P0**
**Formula:** `spend(category, P) ÷ limit.amount`
**Applies to:** flexible (non-repeating) categories only.
**Edge cases:** over 100% shown calmly as an amount over, not an alarm.

## M-15 · Limit pace
**User-facing:** "Spending faster than usual for this point in the month" · **S · P0**
**Formula:** `(spend ÷ limit) ÷ (days_elapsed ÷ days_in_period)`
**Minimum data:** day 5 of the period.
**Before then:** progress only, no pace.
**Interpretation:** > 1 means ahead of a linear pace. Valid only because limits apply to flexible spending; fixed obligations live in commitments.

## M-16 · Reliability
**User-facing:** one sentence — see doc 07 §11 · **— · P0**
**Formula:** state machine over days-recorded ratio, unresolved drift, and days since last entry, with strict precedence Just starting → Some gaps → Reliable (EX-04).
**Never displayed as a percentage.**

## M-17 · Typical (full period)
**User-facing:** "A typical month for you is about ₹47,000" · **S · P1**
**Formula:** `median{ M-04(m) : m ∈ qualifying months, last 6 }`
**Minimum data:** 3 qualifying months (doc 07 §2).
**Fallback:** 2 months → "vs last month"; 1 month → level only. No "typical" language below 3.

## M-18 · Typical MTD(d)
**User-facing:** "a typical month is around ₹16,900 by this point" · **S · P1**
**Formula:** `median{ Σ spend(day 1..d, m) : m ∈ qualifying months }`
**Used for:** every comparison involving the current month (INV-17).

## M-19 · Change vs typical
**User-facing:** "₹4,200 more than a typical month" · **S · P1**
**Formula:** `actual − M-17` for completed periods; `actual_MTD − M-18(d)` for the current period.
**Suppression:** below 3 qualifying months.
**Drill-down:** the What changed waterfall.

## M-20 · Regular bills
**User-facing:** "Regular bills ₹22,400" · **S · P1**
**Formula:** `Σ{amount : transaction matched to a commitment occurrence ∧ date ∈ P}`
**Edge case:** unmatched occurrences appear as overdue, not as spending.

## M-21 · Unusual spending
**User-facing:** "Eating Out was ₹2,100 more than usual" · **S · P1**
**Formula:** flag category c where `spend(c,P) > median(c) + 3 × max(MAD(c), 0.1 × median(c))` **and** `spend(c,P) ≥ 1.30 × median(c)` **and** `spend(c,P) − median(c) ≥ 50000 paise`
**Eligibility:** flexible, non-repeating categories only; ≥6 qualifying months with ≥4 non-zero; `MAD ÷ median ≤ 0.5`.
**Suppression:** silent otherwise — the only hard suppression in the product.
**Drill-down:** must show this month's figure, the typical figure, the months used, and any excluded one-offs.

## M-22 · Outside net (per label)
**User-facing:** "Mutual fund — ₹2,40,000 put in" · **M · P0**
**Formula:** `Σ{to Outside, label L} − Σ{from Outside, label L}`
**Edge case:** result ≤ 0 → "fully withdrawn", no amount shown (EX-06).
**Never** a balance, a valuation, or part of any total.

## M-23 · Category drift · **S · P2**
**Formula:** `share(c, P) − median{ share(c, m) : last 6 qualifying }`, in percentage points.
**Suppression:** categories below an absolute floor of ₹500 monthly median.

## M-24 · Flexible-vs-income growth · **S · P2**
**Formula:** `growth(M-09, 12m) − growth(M-05, 12m)` using trailing medians.
**Minimum data:** 12 qualifying months.

## M-25 · Year-over-year · **S · P2**
**Formula:** `M-04(month m, year y) vs M-04(month m, year y−1)`.
**Minimum data:** 24 months.

---

## Calculation engine contract

1. **Single source.** All metrics are computed in the domain layer. The UI receives values, never formulas (doc 25).
2. **Purity.** Every metric is a pure function of `(transactions, accounts, categories, commitments, limits, preferences, period)`.
3. **Integer arithmetic.** Sums and differences in paise. Division for ratios produces a rational rendered at display precision; intermediate values are never rounded.
4. **Determinism.** Given identical inputs, output is byte-identical. No randomness, no wall-clock dependency other than the explicitly passed "as-of" date.
5. **Explainability.** Every metric exposes `drillQuery` — a filter specification that returns exactly the transactions summing to it, or `null` for the four structurally exempt figures (corrections, estimates, starting balances, Outside movements) documented in doc 08 §9.
