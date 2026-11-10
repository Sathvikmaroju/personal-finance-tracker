# 02 — Domain Model

The conceptual financial model. Terminology here is canonical for the whole pack. Doc 03 realises it as storage; doc 04 defines its behaviour.

---

## 1. Account

**Meaning.** Anything that holds or owes money.
**Purpose.** Gives every transaction a place money came from or went to, and makes balances computable.
**Relationships.** 1 Account → many Transactions (as `from` or `to`). 1 Account → many BalanceChecks. 0..1 Account → many Commitments.
**Lifecycle.** Created with a mandatory starting balance (recorded as a `start` transaction) → active → archived (only when balance is zero, per EX-01) → deletable only if it has no transactions other than `start`.
**Invariants.** INV-01 (`starting + Σin − Σout = balance`, exactly, always).
**Allowed operations.** Create, rename, change icon, reorder, archive (balance zero), unarchive, delete (no transactions).
**Forbidden states.** Missing starting balance · a system account being archived, deleted or displayed as a balance · archived account selected for a new transaction · non-zero balance at archive.

### 1.1 Asset account

**Meaning.** Money the user has. Positive balance = money held; negative = overdrawn.
**Subtypes.** `cash`, `bank`, `upi_wallet`, `savings`.
**Display.** "Bank ₹42,500"; negative shown as "Bank −₹1,200 (overdrawn)".
**`counts_as_available`.** Applies to assets only; determines inclusion in *Money available* (M-02).

### 1.2 Owed account

**Meaning.** Money the user owes. Negative internal balance = amount owed; positive = prepaid / in credit.
**Subtypes.** `card`, `loan`.
**Display (canonical).** Absolute value with the word "owed": `balance = −488500` → **"You owe ₹4,88,500"**. The minus sign is never shown for an owed account. A positive balance displays as "₹2,400 in credit".
**Rule.** Available money and owed are never netted into a single figure.

### 1.3 Cash

An asset account of subtype `cash`. Distinctive only in that it is the account most exposed to unrecorded spending, which is why the balance check matters most here.

### 1.4 Bank

An asset account of subtype `bank`. Ordinary; no special behaviour.

### 1.5 Credit card

An owed account of subtype `card`. Purchases are spending at the moment of purchase and increase the amount owed. Payment is a `move` and is never spending. Fees and interest are `out` records drawn from the card, increasing owed. A positive balance means more was paid than recorded as spent, which is a signal that purchases are missing (F-31).

### 1.6 Loan

An owed account of subtype `loan`. Disbursement is a `move` from the loan to an asset account and is never income. Repayment is a `move` to the loan, optionally splitting a declared interest portion. Accrued interest discovered by balance check is spending drawn from the loan. Full details in doc 04 §7.

---

## 2. Transaction

**Meaning.** One recorded money event. The single ledger row for everything.
**Purpose.** The sole canonical fact from which every balance, total, report and insight is derived.
**Kinds.** `out`, `in`, `move`, `back`, `correction`, `start`. Amounts are always positive; direction is carried by kind plus account fields.
**Relationships.** Many → 1 Account (`from`), 0..1 Account (`to`), 0..1 Category, 0..1 Payee, 0..1 Commitment, 0..1 parent Transaction (`back_of`), 0..1 group (`group_id`, per EX-03).
**Lifecycle.** Created → editable → deletable, with per-kind restrictions (doc 04 §9–10). Edits and deletes trigger full recomputation and mark affected closed periods **revised**.
**Invariants.** INV-02 … INV-15.
**Forbidden states.** Listed exhaustively in doc 04 §8.

---

## 3. Category

**Meaning.** What money was spent on, or the source of income.
**Purpose.** Answers J-04 ("where did it go") and carries the essential/repeating defaults that make spending actionable.
**Relationships.** 1 Category → many Transactions, 0..many Commitments, 0..1 SpendingLimit (active).
**Lifecycle.** Seeded from the 12+2 default set → user may add, rename, re-icon, reorder → may be merged into another category (transactions reassigned) → deletable only when unused.
**Invariants.** A category with `repeating_default = true` may not hold a spending limit (limits are for flexible spending). System categories cannot be deleted or renamed.
**Forbidden states.** A transaction of kind `move` or `start` carrying a category · a `correction` carrying any category other than `Not recorded` · an `out`/`in` with no category.

---

## 4. Payee

**Meaning.** The counterparty of a transaction.
**Purpose.** Reduces entry effort, and is the key that makes recurrence detection, duplicate detection and payee-level drill-down possible — all from local data.
**Relationships.** 1 Payee → many Transactions; 0..1 usual Category; 0..many Commitments.
**Lifecycle.** Created silently from free text on first use → normalised (local case, whitespace and punctuation folding only, never an external database) → accumulates `times_used` → may be renamed or merged.
**Invariants.** `normalized_name` is unique. Payee is always optional on a transaction; no feature may make it mandatory.
**Forbidden states.** Two payees with the same `normalized_name`.

---

## 5. Commitment

**Meaning.** A bill or obligation the user expects to repeat.
**Purpose.** Answers J-07 and J-10, and supplies *Promised*, which makes *Left to spend* meaningful.
**Relationships.** 1 Commitment → many occurrences; each occurrence matches 0..1 Transaction. 1 Commitment → 1 Category, 0..1 Payee, 0..1 Account.
**Lifecycle.** Created by the user (P0) or suggested by detection and confirmed (P1) → active, generating occurrences by cadence → amount changes append to history and raise a price-change alert (P1) → deactivated when cancelled, retaining history.
**Invariants.** INV-08 — an occurrence is matched, overdue, or upcoming; never two of these. Non-monthly commitments are excluded from monthly baselines.
**Forbidden states.** One occurrence matched to more than one transaction · an active commitment with no next due date.

---

## 6. Spending limit

**Meaning.** A monthly ceiling the user sets on a flexible category.
**Purpose.** Answers J-09.
**Relationships.** 1 Limit → 1 Category.
**Lifecycle.** Created → tracked within each month → editable → deletable.
**Invariants.** Flexible (non-repeating) categories only; one active limit per category.
**Forbidden states.** A limit on a repeating category · two active limits on one category · a limit of zero or negative amount.

---

## 7. Balance check

**Meaning.** The user telling the app what an account's real balance is.
**Purpose.** The only error-detection mechanism in a 100% manual system. Answers J-13.
**Relationships.** Many → 1 Account; 0..1 resulting Transaction.
**Lifecycle.** Prompted or user-initiated → user reports a balance → difference computed by class rule (INV-16) → resolved as *corrected* or *ignored* → undoable until the next check on that account.
**Invariants.** Sign is derived from account class, never raw subtraction. Editing the resulting transaction's amount updates the stored difference (EX-05).
**Forbidden states.** A check whose resulting transaction has been deleted while `outcome = corrected` · more than one prompt per account per day.

---

## 8. Correction

**Meaning.** The transaction that a balance check produces when money is unaccounted for.
**Purpose.** Makes an invisible data gap into a visible, quantified number.
**Category.** Always `Not recorded`, with one exception: loan accounts, where the drift is recorded instead as spending in `Interest & charges` (doc 04 §7).
**Analytics treatment.** Included in Spent, Received, Kept and Reliability. Excluded from category shares, limits, baselines and unusual-spending detection (INV-09). Always displayed as its own line item, never folded into a category.
**Forbidden states.** A correction with a category other than `Not recorded` · both account fields set, or neither.

---

## 9. Starting balance

**Meaning.** What an account held (or owed) at the moment the user began tracking it.
**Purpose.** Makes balances correct from day one without pretending history exists.
**Representation.** A `start` transaction from the system `StartingBalance` account.
**Invariants.** INV-10 — never income, never spending, appears in no report.
**Lifecycle.** Editable only while the account has no other transactions; thereafter corrected by balance check.

---

## 10. Outside

**Meaning.** The system account representing any destination the user does not track — investments, lending to a person, money sent elsewhere.
**Purpose.** Prevents the most damaging misclassification available: recording an investment as spending, which would punish good financial behaviour.
**Representation.** Moves to and from `Outside` carry an optional user label.
**Display.** Never a balance and never a valuation. Reported per label as `Σ in − Σ out`, shown as "₹X put in". Where the net is ≤ 0, shown as "fully withdrawn" with no amount (EX-06).
**Invariants.** Satisfies INV-01 internally; contributes to no total; never selectable as a normal account.

---

## 11. Not recorded

**Meaning.** The system category holding balance-check corrections.
**Purpose.** Keeps unexplained money visible and countable without contaminating category analysis.
**Treatment.** In totals, kept and reliability; out of shares, limits and baselines. Explainable ("₹700 was spent but not recorded — found on 12 March") but not decomposable into transactions, which is why it must always be a separate line item.

---

## 12. Interest & charges

**Meaning.** The system category for genuine cost-of-borrowing consumption.
**Purpose.** Distinguishes real interest and fees — which are spending and belong in category reporting — from unexplained gaps.
**Populated by.** Card interest and fees entered by the user; the declared interest portion of a loan repayment; loan balance-check drift.
**Treatment.** A normal spending category in every respect: included in shares, trends and totals. Not eligible for a spending limit (it is a repeating obligation).

---

## Concept relationship summary

```
Account ──< Transaction >── Category
   │            │  │  └──< Payee
   │            │  └───── back_of (self-reference)
   │            └──────── Commitment ──> Category, Payee, Account
   └──< BalanceCheck ──> Transaction (correction)
Category ──0..1── SpendingLimit
System accounts: StartingBalance, Outside
System categories: Not recorded, Interest & charges
```
