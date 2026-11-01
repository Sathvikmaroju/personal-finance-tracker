# 04 — Financial Domain Logic

The canonical business-logic specification. Where any other document appears to conflict with this one on how a financial event behaves, this document governs. The UI must never reimplement any rule stated here (doc 25).

Notation: `Δfrom` / `Δto` are balance changes; **Spending**, **Income**, **Kept** are the derived aggregates (doc 06).

---

## 1. `out` — money spent

**Required.** amount, date, `from_account_id`, `category_id` (kind `out`), `essential`, `repeating`.
**Optional.** payee, note, time, `commitment_id`, `group_id`, `exclude_from_typical`.
**Validation.** Amount > 0 · account exists and is not archived or system · category kind is `out` · date ≤ tomorrow · `to_account_id` must be NULL.
**Effects.** `Δfrom = −amount` · Spending `+amount` · Income unchanged · Kept `−amount`.
**Reporting.** Appears in Spent, category share, must-pay or flexible, limit consumption, baselines (unless `exclude_from_typical`), and payee drill-down.
**Edit.** All fields. Changing to another kind nulls forbidden fields. Changing amount, date, category or account triggers recomputation of both the old and new affected periods.
**Delete.** Permitted. If linked `back` records exist, cascade on explicit confirmation naming them.

## 2. `in` — money received

**Required.** amount, date, `to_account_id`, `category_id` (kind `in`).
**Optional.** payee, note, time.
**Validation.** As above; `from_account_id` must be NULL.
**Effects.** `Δto = +amount` · Income `+amount` · Spending unchanged · Kept `+amount`.
**Reporting.** Appears in Received and in Kept %. Never in category spending shares.
**Edit / delete.** Unrestricted.

## 3. `move` — moving the user's own money

**Required.** amount, date, `from_account_id`, `to_account_id` (≠ from).
**Optional.** note, time, `outside_label`, `interest_amount` (loan repayments only), `group_id`.
**Validation.** Both accounts exist, neither archived · not the same account · `category_id` must be NULL · `Outside` may not be on both sides.
**Effects.** `Δfrom = −amount` · `Δto = +amount` · Spending, Income and Kept **all unchanged** (INV-02).
**Reporting.** Appears in no spending or income figure. Visible in the transactions list and in account histories. Moves to `Outside` are summarised per label as "₹X put in".
**Edit.** All fields. Changing either account recomputes both old and new account balances.
**Delete.** One row; both balances restore atomically (INV-11). If part of a group, the whole group deletes.

## 4. `back` — money coming back

**Required.** amount, date, `to_account_id`, `back_of_id`.
**Optional.** note, time.
**Validation.** Parent exists and has kind `out` · `Σ back` against that parent (including this one) ≤ parent amount · `from_account_id` must be NULL · `category_id` must be NULL (the parent's category is inherited for reporting).
**Effects.** `Δto = +amount` · Spending `−amount`, attributed to the **parent's category** · Income unchanged · Kept `+amount`.
**Period rule.** The reduction lands in the period the money was received, not the parent's period (cash basis). If the parent's period is closed, that period is marked **revised**.
**Reporting.** Reduces the parent category's spend; the parent transaction displays as partially or fully refunded.
**Edit.** Amount and date; changing the parent is not permitted (delete and re-create instead).
**Delete.** Restores the parent's full amount.

## 5. `correction` — from a balance check

**Required.** amount, date, exactly one of `from_account_id` / `to_account_id`, `category_id = Not recorded`.
**Validation.** Produced only by the balance-check flow, never from the add sheet · exactly one account side set.
**Effects.** From side set → `Δfrom = −amount`, Spending `+amount`, Kept `−amount`. To side set → `Δto = +amount`, Income `+amount`, Kept `+amount`.
**Reporting.** In Spent, Received, Kept and Reliability. **Out of** category shares, limits, baselines and unusual-spending detection (INV-09). Always its own line item.
**Edit.** Amount only; updates the linked `BalanceCheck.difference_paise` atomically (EX-05).
**Delete.** Permitted; the linked balance check reverts to `outcome = ignored`.

## 6. `start` — starting balance

**Required.** amount, date, `to_account_id`, `from_account_id = StartingBalance`.
**Effects.** `Δto = +amount` · Spending, Income, Kept **all unchanged** (INV-10).
**Owed accounts.** The user enters the amount currently owed; the system records it so that the resulting balance is negative by that amount.
**Reporting.** Appears in no report. Visible on the account itself, dated.
**Edit.** Only while the account has no other transactions. Thereafter the balance check is the correction path.
**Delete.** Only together with its account.

---

## 7. Credit cards and loans

### 7.1 Credit card

| Event | Recording | Balance | Spending |
|---|---|---|---|
| Purchase ₹3,000 | `out` from Card | owed +3,000 | +3,000 |
| Full payment ₹3,000 | `move` Bank → Card | Bank −3,000, owed 0 | **0** |
| Partial payment ₹1,000 | `move` Bank → Card | owed 2,000 | 0 |
| Payment from another bank | `move` Bank B → Card | same | 0 |
| Payment from cash | `move` Cash → Card | same | 0 |
| Payment reversed | `move` Card → Bank | restores | 0 |
| Refund ₹1,000 | `back` to Card, linked | owed 2,000 | −1,000 in parent's category |
| Annual fee ₹500 | `out` from Card, `Interest & charges` | owed +500 | +500 |
| Interest ₹340 | `out` from Card, `Interest & charges` | owed +340 | +340 |
| Cash advance ₹5,000 | `move` Card → Cash | owed +5,000, cash +5,000 | **0** |
| Card A pays Card B | `move` Card A → Card B | total owed unchanged | 0 |
| Overpayment | `move` Bank → Card beyond owed | Card positive ("in credit") | 0 |

**Guarantee.** A ₹3,000 purchase followed by a ₹3,000 payment yields total spending of ₹3,000. Enforced by INV-03 and INV-04, tested by T-04.

**Card-in-credit signal (P1).** A positive card balance almost always means purchases were not recorded. Surface: "Your card shows ₹2,400 more paid than spent — some purchases may be missing."

### 7.2 Loan

| Event | Recording | Balance | Spending / Income |
|---|---|---|---|
| Disbursement ₹5,00,000 | `move` Loan → Bank | owed +5,00,000, Bank +5,00,000 | **Neither** (INV-07) |
| Repayment, interest 0 | `move` Bank → Loan | Bank −12,000, owed −12,000 | 0 |
| Repayment ₹12,000 incl. ₹1,500 interest | **Two records, one `group_id`:** `move` Bank → Loan ₹10,500 **and** `out` from **Bank** ₹1,500 in `Interest & charges` | Bank −12,000, owed −10,500 | Spending +1,500 |
| Fee charged to the loan | `out` from **Loan**, `Interest & charges` | owed +fee | Spending +fee |
| Balance check: user owes ₹2,300 more than app | `out` from **Loan**, `Interest & charges` | owed +2,300 | Spending +2,300 |
| Full repayment | `move` for the remaining balance | owed 0 | 0 |
| Opening balance | `start`, entered as amount owed | owed = amount | Neither |

**The interest-source rule (EX-02).** When the user *pays*, money leaves the paying account, so the interest `out` is drawn from the **paying account**. When interest is *discovered* by a balance check or charged as a fee, no payment occurred, so the `out` is drawn from the **loan account**, increasing what is owed. These are the only two cases; there is no third interpretation.

**Why loan drift is not a `correction`.** A loan has exactly one predictable payment stream, so a shortfall against the statement is interest and charges — genuine consumption belonging in category reporting. Every other account class produces `Not recorded` corrections, because their drift is unrecorded purchases of unknown composition.

---

## 8. Cash

| Event | Recording | Spending |
|---|---|---|
| ATM withdrawal ₹5,000 | `move` Bank → Cash | **0** |
| Spend ₹1,200 of that cash | `out` from Cash | +1,200 |
| Deposit own cash to bank | `move` Cash → Bank | 0 |
| Cash income banked | `in` to Bank | 0 (Income +) |

Total spending across a withdrawal and a subsequent ₹1,200 purchase is ₹1,200, never ₹6,200 (INV-05, T-19/T-20).

---

## 9. Transfers to and from `Outside`

| Event | Recording | Effect |
|---|---|---|
| ₹20,000 to an untracked investment | `move` Bank → Outside, label "Mutual fund" | Not spending; Kept unchanged |
| ₹50,000 withdrawn from it | `move` Outside → Bank | Not income |
| Lending ₹5,000 to a friend | `move` Bank → Outside, label "Loan to Ravi" | Not spending |

Reported per label as `Σ in − Σ out` shown as "₹X put in"; when ≤ 0, "fully withdrawn" with no amount (EX-06). Never valued, never aggregated into any total.

---

## 10. Balance check and correction

**Sign rule (INV-16), derived from account class, never raw subtraction:**
- asset: `difference = user_reported − app_balance`
- owed: `difference = app_balance − user_reported_owed`

Both collapse to: *more money gone than recorded → missed spending; more money present than recorded → missed income.*

**Resulting record.** Loan accounts → `out` in `Interest & charges` from the loan. All other accounts → `correction` in `Not recorded`.
**Undo.** Available until the next check on that account; restores the prior balance and sets `outcome = ignored`.
**Skipping.** Changes nothing; reliability degrades over time.

---

## 11. Account lifecycle rules

Create with mandatory starting balance → active → archive **only at zero balance** (EX-01); if non-zero, the flow requires moving the remainder first → unarchive at any time → delete only when no transactions other than `start` exist.

---

## 12. Impossible states (rejected by validation)

`back` without a valid `out` parent · cumulative `back` exceeding its parent · `move` where from = to · `essential` or `repeating` on any kind but `out` · category on `move` or `start` · missing category on `out`, `in` or `correction` · a `correction` with a category other than `Not recorded` · a `correction` with both or neither account side · any reference to a deleted record · `Outside` on both sides of a move · a spending limit on a repeating category · two active limits on one category · an occurrence matched to more than one transaction · archiving a non-zero-balance account · a transaction dated more than one day in the future.
