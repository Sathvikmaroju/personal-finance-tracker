# 05 — Financial Invariants

Seventeen rules that must never break. Each is implemented as a runtime assertion in the domain layer (doc 25), enforced by schema constraints where expressible (doc 03), and covered by named tests (doc 22).

An invariant violation is a **fatal correctness event**: the write is rolled back, the user sees a plain-language error, and the failure is recorded locally in the diagnostics log (never transmitted).

---

### INV-01 — Balance identity
**Rule.** For every account, including system accounts: `starting + Σ inflows − Σ outflows = balance`, exactly, at all times.
**Rationale.** The foundation of every other number. If balances can drift, nothing else can be trusted.
**Expression.** `balance(A) = Σ{t.amount : t.to_account=A} − Σ{t.amount : t.from_account=A}` (the `start` record is an inflow from `StartingBalance`).
**Tests.** T-01, T-02, T-03, T-19, T-86.

### INV-02 — Moves are not spending
**Rule.** A `move` changes no spending, no income, and no kept — only balances.
**Rationale.** Moving your own money is not consumption. Violating this makes disciplined savers look like heavy spenders.
**Expression.** `kind='move' ⟹ ΔSpending = ΔIncome = ΔKept = 0`.
**Tests.** T-06 (savings), T-19, T-21, T-28, T-30.

### INV-03 — Debt settlement is a move
**Rule.** Paying a card or loan is always a `move`, never spending.
**Rationale.** The consumption already happened at purchase. Recording it again is the single most common double-count in personal finance apps.
**Expression.** `to_account.class='owed' ∧ from_account.class='asset' ⟹ kind='move'` (enforced, not merely suggested).
**Tests.** T-04, T-05, T-09, T-10, T-24.

### INV-04 — Credit consumption counts once
**Rule.** A purchase on an owed account is spending once, at purchase; settlement is spending zero.
**Rationale.** Guarantees the headline correctness promise: ₹3,000 spent stays ₹3,000.
**Expression.** `Spending(purchase) = amount ∧ Spending(settlement) = 0`.
**Tests.** T-03 + T-04 in sequence.

### INV-05 — Cash withdrawal is not consumption
**Rule.** Withdrawing cash is a `move`; consumption is recognised only when the cash is spent.
**Rationale.** Prevents counting ₹5,000 withdrawn plus ₹1,200 spent as ₹6,200.
**Expression.** `Σ Spending(withdrawal, subsequent cash spends) = Σ cash spends`.
**Tests.** T-19, T-20.

### INV-06 — Money back reduces spending, never increases income
**Rule.** A `back` reduces the parent's category spending; cumulative `back` ≤ parent amount.
**Rationale.** Recording refunds as income inflates both income and Kept %, corrupting the most diagnostic ratio in the product.
**Expression.** `ΔSpending = −amount` in `parent.category`; `ΔIncome = 0`; `Σ back(parent) ≤ parent.amount`.
**Tests.** T-06, T-07, T-08, T-31.

### INV-07 — Loan principal is not income or spending
**Rule.** A loan payout is a `move` from an owed account, never income. Principal repayment is a `move`; only declared interest is spending.
**Rationale.** Recording a ₹5,00,000 disbursement as income would report a spectacular month while obligations exploded.
**Expression.** `disbursement ⟹ ΔIncome = 0 ∧ Δowed = +amount`; `repayment ⟹ ΔSpending = interest_amount`.
**Tests.** T-23, T-24, T-25, T-27.

### INV-08 — One occurrence, one state
**Rule.** A commitment occurrence is matched, overdue, or upcoming — never two of these, and never matched to more than one transaction.
**Rationale.** Prevents a bill being both forecast and actual, which would double-count it in *Promised*.
**Expression.** `status ∈ {upcoming, matched, overdue, skipped}`, mutually exclusive; `|matched_transaction| ≤ 1`.
**Tests.** T-87, T-88.

### INV-09 — Corrections are counted but quarantined
**Rule.** `Not recorded` corrections count in Spent, Received, Kept and Reliability; never in category shares, limits, baselines or unusual-spending detection.
**Rationale.** Unexplained money must remain visible and countable without contaminating category analysis with unknowable composition.
**Expression.** `category = Not recorded ⟹ ∈ {Spent, Received, Kept, Reliability} ∧ ∉ {shares, limits, baselines, anomaly}`.
**Tests.** T-35, T-64, T-65.

### INV-10 — Starting balances are inert
**Rule.** `start` records are never income, never spending, and appear in no report.
**Rationale.** Opening balances are a statement of position, not an event.
**Expression.** `kind='start' ⟹ ΔSpending = ΔIncome = 0`.
**Tests.** T-15, T-89.

### INV-11 — No orphans; moves are atomic
**Rule.** No record may reference a deleted record. A `move` is one row; deleting it restores both balances atomically.
**Rationale.** Orphaned refunds produce negative category totals and Kept % above 100% with no explanation.
**Expression.** `∀t: t.back_of_id ⟹ ∃ parent`; deletion of a grouped record deletes the whole `group_id` set.
**Tests.** T-32, T-82, T-90.

### INV-12 — Classification flags belong to spending only
**Rule.** `essential` and `repeating` are non-null if and only if `kind='out'`.
**Rationale.** "Essential income" and "fixed transfer" are impossible states that would otherwise appear the moment a user changes a record's kind.
**Expression.** `(essential IS NOT NULL) ⟺ (kind='out')`.
**Tests.** T-77, T-91.

### INV-13 — Actuals and estimates never merge
**Rule.** Every displayed figure is labelled actual or estimate; the two are never summed into one unlabelled number.
**Rationale.** Blending a known total with a projection destroys the user's ability to judge reliability.
**Tests.** T-49, T-92.

### INV-14 — Nothing derived is stored
**Rule.** No derived value is persisted; everything recomputes on read (subject to the invalidation-safe cache in doc 15).
**Rationale.** Prevents the classic failure where editing a three-month-old record leaves totals silently stale.
**Tests.** T-59, T-93.

### INV-15 — Integer money only
**Rule.** All amounts are integer paise; no floating-point type appears in the money path.
**Rationale.** Float accumulation produces cent-level drift that eventually breaks INV-01.
**Tests.** T-94 (sum 10,000 random amounts, compare to exact integer total).

### INV-16 — Balance-check sign comes from account class
**Rule.** Sign is derived from account class, never raw subtraction.
**Rationale.** Applying asset logic to an owed account records phantom *income* wherever spending is missing — a silent, systematic corruption.
**Expression.** asset: `diff = reported − app`; owed: `diff = app − reported_owed`.
**Tests.** T-60, T-61, T-62, T-63.

### INV-17 — Current-month comparisons are day-aligned
**Rule.** Any comparison involving the current month compares month-to-date against the same day-of-month across baseline months.
**Rationale.** Comparing a partial month to a full baseline would tell every user they are under-spending for the first three weeks of every month.
**Expression.** `typical_MTD(d) = median{ Σ spend(day 1..d) : qualifying months }`.
**Tests.** T-38, T-95.

---

## Enforcement matrix

| Invariant | Schema CHECK | Domain assertion | Test |
|---|---|---|---|
| INV-01 | — | Yes (post-write) | T-86 |
| INV-02 | Partial (`category IS NULL`) | Yes | T-06 |
| INV-03 | — | Yes (forced classification) | T-04 |
| INV-04 | — | Yes | T-03/04 |
| INV-05 | — | Yes | T-20 |
| INV-06 | Partial (`back_of_id`) | Yes (cumulative sum) | T-08 |
| INV-07 | — | Yes | T-23 |
| INV-08 | Unique (commitment, due_date) | Yes | T-87 |
| INV-09 | CHECK on category | Yes | T-65 |
| INV-10 | CHECK on kind | Yes | T-89 |
| INV-11 | FK constraints | Yes | T-32 |
| INV-12 | CHECK | Yes | T-91 |
| INV-13 | — | Presentation contract | T-92 |
| INV-14 | — | Architecture (doc 15) | T-93 |
| INV-15 | INTEGER column type | Yes | T-94 |
| INV-16 | — | Yes | T-62 |
| INV-17 | — | Yes | T-38 |
