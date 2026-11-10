# Requirements Exceptions

Contradictions or gaps found in `PersonalFinance_Final_Requirements_v1.1.md` while producing the specification pack. The canonical requirements remain frozen; nothing here was silently changed. Each entry states the requirement, the problem, the impact, and the minimum resolution used by the specification pack.

Severity: **BLOCKING** = implementation impossible without a decision · **CLARIFICATION** = requirement is correct but underspecified; the pack adopts a deterministic reading.

---

## EX-01 — Archiving an account with a non-zero balance destroys money · **BLOCKING**

**Requirements involved:** §11 ("Archived accounts retain history and balances") and §17 Money available ("Excludes owed, archived, and system accounts").

**Problem.** Both statements are individually reasonable and jointly incorrect. Archiving a bank account holding ₹5,000 removes it from *Money available* while the `start + Σin − Σout = balance` invariant (INV-01) still holds for that account. ₹5,000 silently vanishes from the user's total with no transaction explaining it, violating the explainability guarantee (§20).

**Resolution adopted.** An account may be archived only when its balance is zero. If it is non-zero, the archive flow requires the user first to move the remaining balance to another account (or to `Outside`). Archiving remains non-destructive to history. This adds no new concept and preserves both original statements.

**Traceability:** Domain 02 §Account lifecycle · Logic 04 §11 · Flow 10-F24 · Test T-79, T-81.

---

## EX-02 — The interest portion of a loan repayment has no defined source account · **BLOCKING**

**Requirements involved:** §12 ("System splits internally: principal portion reduces owed; interest portion is `out` in `Interest & charges`").

**Problem.** A `move` Bank → Loan of ₹12,000 with `interest_amount` ₹1,500 must produce two records. The requirement does not say which account the interest `out` is drawn from. Two readings exist: drawn from the paying account (Bank), or drawn from the loan account (increasing owed). They produce different balances — the first leaves Bank −12,000 / Loan −10,500; the second leaves Bank −12,000 / Loan −12,000 +1,500.

**Resolution adopted.** For a repayment, money physically leaves the paying account, so the interest `out` is drawn from the **paying account**: `move` Bank → Loan of ₹10,500 plus `out` from Bank of ₹1,500. Bank falls by ₹12,000 in total; owed falls by ₹10,500.

This is distinct from the balance-check case (§15), where interest has **accrued onto the loan** and no payment was made; there the `out` is drawn from the **loan account**, increasing owed. Both cases are specified in Logic 04 §7.

**Traceability:** Logic 04 §7 · Metrics 06 M-04 · Test T-25, T-26.

---

## EX-03 — Multi-record user actions have no grouping key · **BLOCKING**

**Requirements involved:** §12 (interest split), §7 (edit and delete rules).

**Problem.** A single user action — one EMI entry with interest — produces two transaction rows. The data model in §9 has no field linking them. Editing or deleting the EMI would orphan the interest record, breaking INV-11 (no record may reference a deleted record) and producing a loan balance that cannot be reconciled.

**Resolution adopted.** Add `group_id` (nullable UUID) to Transaction. Records created by one user action share a `group_id` and are edited and deleted as a unit. This is a structural necessity for an existing requirement, not a new feature, and is invisible to the user.

**Traceability:** Data 03 §Transaction · Logic 04 §7 · Test T-25, T-82.

---

## EX-04 — Reliability states can match simultaneously · **CLARIFICATION**

**Requirements involved:** §16 reliability table.

**Problem.** A user at day 20 with a days-recorded ratio below 0.5 satisfies both "Just starting" (< 30 days of history) and "Some gaps". The requirement gives no precedence, so two implementations would show different messages for identical data.

**Resolution adopted.** Strict precedence, evaluated in order: **Just starting → Some gaps → Reliable.** A user in their first 30 days is never told things may be missing, because nothing yet establishes what "missing" means.

**Traceability:** Analytics 07 §11 · Test T-83.

---

## EX-05 — Editing a correction desynchronises its balance check · **CLARIFICATION**

**Requirements involved:** §7 (`correction` — "Amount only" editable) and §9 (`BalanceCheck.difference`).

**Problem.** Editing a correction's amount leaves `BalanceCheck.difference` holding the original value, so the balance-check history no longer reconciles with the transactions it produced.

**Resolution adopted.** Editing a correction's amount updates the linked `BalanceCheck.difference` in the same atomic write. If the two ever diverge, the balance check is the record of what the user reported and the correction is authoritative for balances; a validation task flags divergence.

**Traceability:** Data 03 §BalanceCheck · Logic 04 §10 · Test T-84.

---

## EX-06 — `Outside` balance sign is undefined · **CLARIFICATION**

**Requirements involved:** §6 (`Outside` maintains an internal balance satisfying INV-01; summarised only as "₹X put in").

**Problem.** Money moved *to* `Outside` increases its internal balance under INV-01, so the "put in" figure is the account's balance. Money withdrawn from an untracked destination (T-29) reduces it, and net withdrawals could drive it negative — which has no user-facing meaning and no defined display.

**Resolution adopted.** `Outside` net balance is reported per label as `Σ in − Σ out`. Where the result is ≤ 0, the label is shown as "fully withdrawn" and no amount is displayed. `Outside` is never displayed in aggregate across labels, and never contributes to any total.

**Traceability:** Domain 02 §Outside · Metrics 06 M-22 · Test T-29, T-85.

---

## Summary

| ID | Severity | Status |
|---|---|---|
| EX-01 | BLOCKING | Resolved — archive requires zero balance |
| EX-02 | BLOCKING | Resolved — interest source defined per case |
| EX-03 | BLOCKING | Resolved — `group_id` added |
| EX-04 | CLARIFICATION | Resolved — precedence order fixed |
| EX-05 | CLARIFICATION | Resolved — atomic update rule |
| EX-06 | CLARIFICATION | Resolved — per-label net, no negative display |

No exception alters a product decision, adds a user-facing feature, or changes any P0/P1/P2 classification.
