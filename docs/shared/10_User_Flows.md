# 10 — Complete User Flows

Format for every flow: **Trigger → Preconditions → Steps → System behaviour → Success → Error → Edge cases → Exit.**
Financial effects reference doc 04; screens reference doc 09.

---

## F-01 · Onboarding · P0
**Trigger** First launch. **Preconditions** Empty database.
**Steps** (3 screens, skippable after step 2)
1. Currency and format confirm — ₹, Indian grouping, decimals. One tap to accept.
2. First account: name, type, current balance. Required — the app cannot be correct without it.
3. Categories: the 12+2 defaults are pre-selected; the user may deselect or add.
**System** Seeds default categories and system accounts; writes a `start` transaction for the account; sets `schema_version`.
**Success** Lands on Home with exact balances and an empty-state prompt to add the first expense.
**Error** Invalid balance → inline validation, never a blocking dialog.
**Edge cases** Skipping step 3 seeds all defaults. An owed account at step 2 asks for the amount currently owed with a statement hint; zero must be confirmed explicitly.
**Exit** Home (S-01).

## F-02 · Add account · P0
**Trigger** Settings → Accounts → +, or onboarding.
**Steps** Name → class (money I have / money I owe) → subtype → icon → starting balance → save.
**System** Creates account and a `start` transaction (INV-10).
**Error** Duplicate active name → inline. Missing balance → blocks save.
**Edge cases** Owed accounts: prompt reads "How much do you owe right now?"; `counts_as_available` is forced to false.
**Exit** Accounts list with the new account visible.

## F-03 · Record an expense · P0 — **the critical flow**
**Trigger** FAB, widget, or `/add`.
**Preconditions** ≥1 account.
**Steps** Sheet opens with **Spent** preselected and the amount keypad focused → type amount (calculator accepted) → tap category → **Save**. Three taps.
**System** Creates `out` from the default account (last used), dated today, with `essential`/`repeating` inherited from the category. Balance, Spent, Kept recompute.
**Optional, never blocking** payee (autocomplete after 3 chars, sets category on second use), note, date, account override, essential override.
**Success** Sheet dismisses, a toast confirms with an Undo action, and the origin screen updates.
**Error** Amount zero or empty → Save disabled. Future date beyond tomorrow → inline message.
**Edge cases** Duplicate within 5 minutes on the same amount + payee + account → soft prompt, never blocking (P1). No accounts → the sheet routes to F-02 first.
**Exit** Origin screen.

## F-04 · Record income · P0
**Trigger** FAB → **Received** chip.
**Steps** Amount → income category → save. Destination defaults to the last-used asset account.
**System** Creates `in`; Received and Kept recompute.
**Edge cases** Cash income later banked is `Received` to Bank, or `Received` to Cash then a separate `Moved` — both are correct and produce identical totals.
**Exit** Origin.

## F-05 · Move money · P0
**Trigger** FAB → **Moved** chip.
**Steps** Amount → from account → to account (list includes "Somewhere else (not tracked)") → save. Four taps.
**System** Creates `move`; no spending, no income (INV-02). If the destination is `Outside`, prompts for an optional label.
**Success** Both balances update; a one-line explanation appears the first two times ("Moving your own money isn't spending").
**Error** Same account both sides → blocked with an inline message.
**Edge cases** Destination is an owed account → confirmation copy reads "Paid ₹X toward your card".
**Exit** Origin.

## F-06 · Record a refund · P0
**Trigger** Transaction detail → "Money came back".
**Preconditions** Parent is an `out`.
**Steps** Amount (defaults to the parent's full amount) → account credited (defaults to the parent's account) → date → save.
**System** Creates `back` linked to the parent; spending reduces in the parent's category in the **receipt** period.
**Error** Amount exceeding the remaining refundable balance → blocked, showing what remains.
**Edge cases** Refund months later → the parent's period is marked **revised** and the monthly review notes it. Reimbursement from a person uses the identical flow.
**Exit** Parent transaction detail, now showing "partially refunded".

## F-07 · Credit-card lifecycle · P0
**Purchase** F-03 with the card as the account → owed increases, spending recorded once.
**Pay the bill** F-05, Bank → Card → owed decreases, **no spending** (INV-03).
**Partial payment** Same, smaller amount.
**Fee or interest** F-03 from the card, category `Interest & charges`.
**Cash advance** F-05, Card → Cash.
**Refund** F-06 crediting the card.
**Edge cases** Overpayment leaves the card in credit and (P1) raises the card-in-credit signal. Card A paying Card B is a `move`; total owed is unchanged.

## F-08 · Loan lifecycle · P0
**Disbursement** F-05, Loan → Bank. Never income (INV-07).
**Repayment** F-05, Bank → Loan, with an optional "interest included" field (default 0). If > 0, the system writes two records sharing a `group_id`: a `move` for the principal and an `out` from the **paying account** for the interest (EX-02).
**Fee charged to the loan** F-03 from the loan account, `Interest & charges`.
**Payoff** F-05 for the remaining balance; the account becomes archivable.
**Balance check** F-10; drift becomes an `out` from the **loan** in `Interest & charges`.
**Edge cases** Editing or deleting a repayment with interest acts on the whole group (EX-03).

## F-09 · Cash lifecycle · P0
Withdrawal → F-05 Bank → Cash. Spending cash → F-03 from Cash. Depositing → F-05 Cash → Bank. Total spending equals only what was spent, never the withdrawal (INV-05).

## F-10 · Balance check · P0
**Trigger** Monthly prompt per liquid account, 14 days without entries, or Settings → Balance check, or account detail.
**Preconditions** Account exists.
**Steps** App states its figure → user types the real balance ("How much do you owe right now?" for owed accounts) → app states the difference in plain words → **Fix it** or **Skip**.
**System** Computes the difference by class rule (INV-16). *Fix it* writes a `correction` in `Not recorded`, except loan accounts which write an `out` in `Interest & charges`. Records a `BalanceCheck` row.
**Success** Balance now matches; reliability improves; an undo affordance persists until the next check on that account.
**Error** Non-numeric input → inline. No difference → "That matches — nothing to fix."
**Edge cases** Wrong figure entered → Undo restores the prior state and sets `outcome = ignored`. Skipping alters no data. Rate-limited to one prompt per account per day.
**Exit** Origin.

## F-11 · Create a commitment · P0
**Trigger** Plan → Commitments → +, or confirming a detected suggestion (P1).
**Steps** Name → category → expected amount → cadence → next due date → optional payee and account → save.
**System** Generates occurrences up to a 12-month horizon; *Promised* and *Left to spend* update.
**Edge cases** Annual cadence displays set-aside guidance. Detected suggestions arrive pre-filled and require confirmation — never auto-created.
**Exit** Commitments list.

## F-12 · Match, overdue, and price change · P0/P1
**System** On each new `out`, attempts to match an occurrence: same payee (or category if none), within ±7 days of due date, within ±20% of expected amount. Match sets `status = matched`.
**Unmatched past due** → `overdue`, prompting "Did you pay your rent? Link it."
**Amount change** → appends to history and (P1) raises a price-change notice, never an unusual-spending alert.

## F-13 · Create a limit · P0
**Trigger** Plan → Limits → +, or from a report action.
**Steps** Category (flexible only) → amount (suggested from the user's own median once available) → save.
**Error** Repeating category → blocked with an explanation pointing to commitments.
**Exit** Limits list.

## F-14 · Review reports · P0
**Trigger** Reports tab, or drilling from Home.
**Steps** Hub → view → L1 answer → expand L2 → tap into L3 transactions.
**Edge cases** Views needing history are reachable and explain the specific unmet condition; they are never hidden or blank.
**Exit** Back preserves scroll and filter state.

## F-15 · Monthly Review · P1
**Trigger** Home card in the first week of a period, once ≥1 prior qualifying month exists.
**Steps** Narrative sequence (doc 07 §12) → closing action "Set next month's limits", pre-filled from the user's medians.
**Edge cases** One prior month → runs without the typical comparison. Dismissed card does not reappear that period.
**Exit** Home, or the limits flow.

## F-16 · Search and filter · P0
**Trigger** Transactions → search icon.
**Steps** Free text over payee and note; filter chips for period, account, category, kind; amount range.
**System** Applies filters cumulatively; result count is always shown.
**Edge cases** No results → "No transactions match. Clear filters?" with a one-tap reset.
**Exit** Filters persist within the session.

## F-17 · Edit a transaction · P0
**Trigger** Transaction detail → Edit.
**System** Recomputes all affected periods; closed periods touched are marked **revised**. Changing kind nulls fields the new kind forbids. Grouped records edit as a unit.
**Edge cases** Editing a `start` is permitted only while the account has no other transactions; otherwise the user is directed to the balance check. Editing a correction's amount updates its balance check atomically (EX-05).

## F-18 · Delete a transaction · P0
**Trigger** Transaction detail → Delete.
**System** Confirmation names any linked records ("This also deletes 1 refund"). Cascades on confirm. A `move` restores both balances atomically. A grouped record deletes its whole group.
**Edge cases** Deleting a correction reverts its balance check to `ignored`.

## F-19 · Manage categories · P0
Create, rename, re-icon, reorder, set essential/repeating defaults, **merge** (reassigns all references atomically), delete (only when unused).
**Edge cases** System categories cannot be renamed or deleted. Changing `essential_default` does not retroactively alter existing transactions; the user is told so and offered a bulk update for the current period only.

## F-20 · Manage payees · P1
List by frequency; rename; merge (reassigns transactions); set usual category. Deleting a payee sets `payee_id = NULL` on its transactions.

## F-21 · Backup · P0
**Trigger** Settings → Backup, or scheduled reminder.
**Steps** Choose local destination → write versioned file → confirm.
**Error** Insufficient storage or permission denied → plain-language message with a retry.
**Edge cases** Interrupted write leaves no partial file (write to temp, then atomic rename).

## F-22 · Restore · P0
**Steps** Choose file → app shows its date, transaction count, and schema version → warn that current data will be **replaced** → confirm → restore → restart into Home.
**Error** Corrupt or incompatible file → refuses, naming the reason; the existing database is never touched until validation passes.

## F-23 · Export and import CSV · P0
**Export** Settings → Export → choose scope (all, or a period) → write file.
**Import** Choose file → validate → preview summary (new / skipped / invalid rows) → confirm → additive merge by ID.
**Error** Invalid rows are listed with row numbers and reasons; the user may proceed with the valid subset.
**Edge cases** Re-importing an export produces no duplicates (ID collision detection). Round-trip fidelity is guaranteed (T-73).

## F-24 · Archive or delete an account · P0
**Archive** Requires a zero balance (EX-01). If non-zero, the flow offers "Move the remaining ₹X to…" and completes the archive afterwards.
**Delete** Permitted only when no transactions exist other than `start`.
**Edge cases** Archived accounts remain in historical reports and are excluded from Money available and from new-entry pickers.

## F-25 · Preferences · P0
Decimals, month-start day, theme, buffer amount, notification settings. Changing month-start day recomputes all period boundaries and warns that report periods will shift.

## F-26 · App lock · P1
Set a passcode, optionally enable biometrics. Lock on launch and after backgrounding beyond a threshold. Forgotten passcode has no recovery path — stated plainly at setup, because there is no server to authenticate against.

## F-27 · Catch-up entry · P1
**Trigger** Returning after ≥7 days without entries, or Settings.
**Steps** The add sheet stays open after each save, retaining the chosen date, so a week of transactions can be entered in sequence.
**Exit** Explicit close; a summary shows what was added.
