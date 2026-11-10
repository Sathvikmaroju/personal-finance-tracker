# Personal Finance Tracker — Final Requirements v1.1

**Status:** Canonical specification. Single source of truth for implementation.
**Audience:** Product · UX/UI · Frontend · Data engineering · QA · Data analysis

---

## Contradictions resolved during canonicalization

Fourteen genuine conflicts were found and resolved. Each resolution is applied consistently throughout this document; no alternative reading survives anywhere in the text.

| # | Contradiction | Resolution |
|---|---|---|
| C-01 | Scope said "P0: everything above" while separately listing several of those items as P1 | Scope rebuilt per capability (§25). Reporting splits: three views P0, three P1 |
| C-02 | Monthly Review appeared both as "not a seventh view" and as a standalone feature | Monthly Review is a **month-boundary mode of the *What changed* report**, P1. No seventh surface exists |
| C-03 | Invariant list headed "15" but containing 17; tests referenced "1–17" | **17 canonical invariants** (§8) |
| C-04 | `back` was specified with a *from* account that gains money | Per-kind field semantics defined exactly (§7). `back` credits `to_account_id`; `from_account_id` is null |
| C-05 | A move was described as a single row, but an invariant referred to "deleting one side" | A move is **one row**. Deleting it restores both balances atomically (INV-11) |
| C-06 | Loan balance-check drift was to become `Interest`, while all corrections were required to use `Not recorded` | Split by account class (§12, §15): loan drift → spending in `Interest & charges`; all other accounts → `correction` in `Not recorded` |
| C-07 | Deleting a parent with linked refunds was "cascade **or** blocked" | **Cascade on explicit confirmation** naming the linked records (§7) |
| C-08 | Concentration was a P0 metric while "concentration analysis" was P2 | Top-3 share is P0 inside *Where it goes*; drift analysis remains P2 |
| C-09 | Metrics dictionary presented P1 metrics as though universally available | Every metric carries a tier (§17) |
| C-10 | Limits appeared as both a report and a planning surface | Plan **creates and edits** limits; the Limits report **analyses** them. No duplication |
| C-11 | `exclude_from_typical` existed in the P0 schema with no P0 surface able to set it | Field is P0 (schema and CSV fidelity); the UI action that sets it is P1 (§9) |
| C-12 | `Outside` and `StartingBalance` held transactions but were implied exempt from the balance invariant | Both maintain internal balances satisfying INV-01; neither is ever displayed (§6) |
| C-13 | CSV round-trip integrity relied on account **names**, which are mutable | CSV carries both IDs and names; IDs are authoritative (§24) |
| C-14 | `start` records were "immutable", leaving no way to correct a typo at setup | Editable **only** while the account has no other transactions; thereafter corrected by balance check (§7) |

---

# 1. Product definition

An offline, manually maintained personal finance application that turns recorded money events into accurate balances, honest comparisons against the user's own history, and a small number of things worth knowing.

The product is simple on the surface, rigorous underneath, rich in reporting, and progressively more useful as history accumulates.

# 2. Goals and non-goals

**Goals.** Accurate balances and spending from day one · plain-language reporting with real analytical depth · honest comparison against the user's own past · detection of what changed and what is unusual · minimum possible entry effort · complete data ownership.

**Non-goals.** Net worth · financial-health scores · investment valuation · external benchmarking · AI advice · gamification · bank, card, or UPI integration · multi-currency · shared or group expenses · prescriptive financial recommendations.

# 3. User principles

1. **Correctness first.** A finance app that is wrong once is finished.
2. **Capture is sacred.** No feature may add a step to recording a transaction.
3. **Always say something true.** Never fabricate a comparison; always make the strongest true statement the data supports.
4. **Plain language only.** The user never encounters accounting or statistical vocabulary.
5. **Every number is traceable.** Any aggregate leads to the transactions behind it.
6. **Describe and compare; never prescribe.**

# 4. Product constraints

100% offline · all computation local · single currency (₹, Indian digit grouping) · manual entry only · no network calls of any kind · no external data, model, or service · Android-first mobile.

# 5. Core concepts

The user learns exactly five: **money out · money in · moving my own money · money coming back · bills that repeat.** Everything else is internal machinery, translated on display:

| Internal | Displayed as |
|---|---|
| Owed account, negative balance | "Card: ₹18,400 owed" |
| Move to an owed account | "Paid ₹18,400 toward your card" |
| Spending funded by credit | "You spent ₹3,000 at Amazon" |
| Move bank → cash | "Took out ₹5,000 cash" |
| `back` record | "₹1,000 came back from Amazon" |
| `correction` record | "₹700 spent but not recorded" |
| Trailing median baseline | "A typical month for you" |
| Below data threshold | "Once you've used this another month, I can compare" |
| Reliability state | "Your spending picture looks reliable" / "A few things may be missing" |

# 6. Canonical financial and account model

**Two internal views, never mixed in one displayed figure.**
- **Spending view** — a purchase counts when it happens, regardless of when money leaves. Drives categories, limits, must-pay/flexible, kept.
- **Money view** — actual movement between accounts. Drives balances, owed, promised, left to spend.

**Account classes.**

| Class | Positive internal balance means | Negative internal balance means | Display |
|---|---|---|---|
| **asset** (cash, bank, upi_wallet, savings) | Money the user has | Overdrawn | "Bank ₹42,500" · negative shown as "Bank −₹1,200 (overdrawn)" |
| **owed** (card, loan) | Prepaid — the lender holds the user's money | Money the user owes | `balance = −488500` → **"You owe ₹4,88,500"** · positive shown as "Card ₹2,400 in credit" |

**Display rule (canonical, used everywhere):** owed balances are displayed as the absolute value with the word "owed". The minus sign is never shown to the user for an owed account. Available money and owed are **never netted into a single figure**.

**System accounts.** `StartingBalance` and `Outside` (untracked destinations). Both maintain internal balances satisfying INV-01. Neither is ever displayed as a balance, selectable as a normal account, archivable, or deletable. `Outside` may carry a user label per transaction and is summarised only as **"₹X put in"** — never as a balance or a valuation.

# 7. Canonical transaction model

Six kinds. Amounts are always positive integers in paise; direction is carried by the kind and the account fields, never by the sign.

| Kind | Required | Optional | Account rule | Balance effect | Spending | Income |
|---|---|---|---|---|---|---|
| `out` | amount, date, `from_account_id`, `category_id`, `essential`, `repeating` | payee, note, time, `commitment_id`, `exclude_from_typical` | from = any user account | from −amount | +amount | — |
| `in` | amount, date, `to_account_id`, `category_id` | payee, note, time | to = any user account | to +amount | — | +amount |
| `move` | amount, date, `from_account_id`, `to_account_id` | note, time, `outside_label`, `interest_amount` | both required, must differ | from −, to + | — (except declared interest, §12) | — |
| `back` | amount, date, `to_account_id`, `back_of_id` | note, time | to = any user account; `from_account_id` **must be null** | to +amount | −amount, in the parent's category | — |
| `correction` | amount, date, exactly one of `from_account_id` / `to_account_id`, category = `Not recorded` | note | any user account | from −amount, or to +amount | ±amount | ±amount |
| `start` | amount, date, `to_account_id` | — | from = `StartingBalance` | to +amount | — | — |

**Field semantics.** `from_account_id` is always the account money leaves; `to_account_id` is always the account money enters. `back` therefore uses only `to_account_id`.

**Impossible combinations (enforced, not merely documented).**
- `back` without a valid `out` parent · cumulative `back` against a parent exceeding the parent amount
- `move` where from = to, or where either account is missing
- `essential` or `repeating` set on any kind other than `out`
- `category_id` set on `move` or `start`; absent on `out`, `in`, `correction`
- `correction` with both account fields set, or neither
- any category other than `Not recorded` on a `correction`
- any reference to a deleted record

**Edit and delete rules.**

| Kind | Editable | Deletable | Notes |
|---|---|---|---|
| `out`, `in` | Yes | Yes | Changing kind nulls the fields the new kind forbids |
| `move` | Yes | Yes | One row; deletion restores both balances atomically |
| `back` | Yes | Yes | Deleting restores the parent's full amount |
| `correction` | Amount only | Yes | Undo available until the next check on that account |
| `start` | **Only while the account has no other transactions**; thereafter corrected by balance check | With the account only | Prevents silent restatement of history |

Deleting an `out` that has linked `back` records **cascades on explicit confirmation**, and the dialog names each linked record. Any edit or delete triggers full recomputation of every affected period, and affected closed periods are marked **revised**.

# 8. Invariants

Seventeen rules, enforced as runtime assertions and covered by the acceptance suite.

1. For every account: `starting + Σ in − Σ out = balance`, exactly, always. Applies to system accounts too.
2. A `move` changes no spending, no income, and no kept — only balances.
3. Paying a card or loan is always a `move`, never spending.
4. Credit purchases are spending **once**, at purchase; settlement is spending **zero**.
5. Cash withdrawal is a `move`; consumption is recognised when the cash is spent.
6. `back` reduces the parent's category spending, never increases income; cumulative `back` ≤ parent.
7. A loan payout is a `move` from an owed account, never income. Principal repayment is a `move`; only declared interest is spending.
8. A commitment occurrence is matched, overdue, or upcoming — never two of these.
9. `Not recorded` corrections count in totals, kept and reliability; never in category shares, limits, or baselines.
10. `start` records are never income and appear in no report.
11. No record may reference a deleted record. A `move` is one row; deleting it restores both balances atomically.
12. `essential` and `repeating` exist only on `out`.
13. Every displayed figure is labelled actual or estimate; the two are never summed unlabelled.
14. No derived value is stored; everything recomputes on read.
15. Integer paise only; no floating-point in the money path.
16. Balance-check sign is derived from account class, never raw subtraction.
17. Any comparison involving the current month is day-aligned.

# 9. Data model

**Account** — `id · name · icon · class {asset|owed} · subtype {cash, bank, upi_wallet, savings, card, loan} · counts_as_available (assets only) · due_day? · is_archived · sort_order · created_at`
Starting balance is required at creation and recorded as a `start` transaction. For owed accounts the prompt asks for the amount currently owed, with a statement hint; zero must be confirmed explicitly and is never a silent default.

**Category** — `id · name · icon · kind {in|out} · essential_default · repeating_default · is_system · sort_order`
Default set (12 out): Food & Groceries · Eating Out · Transport · Home & Rent · Bills & Utilities · Health · Shopping · Entertainment · Subscriptions · Family & Gifts · EMI & Loans · Other. Default in: Salary · Other Income.
System categories: `Not recorded`, `Interest & charges`.

**Payee** — `id · name · normalized_name · usual_category_id? · times_used · first_seen · last_seen`
Normalization is local case/whitespace/punctuation folding only.

**Transaction** — `id · kind · amount_paise · date · time? · from_account_id? · to_account_id? · category_id? · payee_id? · note? · essential? · repeating? · back_of_id? · commitment_id? · outside_label? · interest_amount? · exclude_from_typical (default false) · created_at · updated_at`
`exclude_from_typical` is present in P0 for schema and CSV fidelity; the UI action that sets it ships in P1.

**Commitment** — `id · name · payee_id? · category_id · account_id? · expected_amount · cadence {monthly, quarterly, annual, custom_days} · next_due · is_active · source {user_added, detected} · amount_history[]`

**SpendingLimit** — `id · category_id · amount · created_at` — monthly, flexible categories only, one active per category.

**BalanceCheck** — `id · account_id · checked_at · user_reported · app_balance · difference · outcome {corrected, ignored} · resulting_transaction_id?`

**Preferences** — `decimals · month_start_day · theme · passcode? · buffer_amount · notification_settings`

# 10. Transaction flows

**Recording.** Three action chips — `Spent` (preselected) · `Received` · `Moved` — then amount, then category, then save. Common expense: **three taps**. `Moved` replaces the category grid with a destination picker that includes "Somewhere else (not tracked)". Optional and secondary on every flow: payee (autocomplete after three characters), note, date, account override, essential override.

**Defaults.** Last-used account · today's date · the payee's usual category from its second use onward.

**Disambiguation matrix** — the action chip resolves every otherwise-ambiguous case:

| Event | Chip | From | To | Result |
|---|---|---|---|---|
| Deposit own cash | Moved | Cash | Bank | No income |
| Cash income banked | Received | — | Bank | Income recorded |
| Card bill payment | Moved | Bank | Card | No spending |
| EMI | Moved | Bank | Loan | Reduces owed |
| Lending to a friend | Moved | Bank | Outside | Not spending |
| Giving a gift | Spent | Bank | — | Spending |
| Card cash advance | Moved | Card | Cash | Increases owed, no spending |
| Cashback to card | Received | — | Card | Income, or linked as `back` |

# 11. Account flows

Create (name, class, subtype, icon, starting balance) → use → archive. Archived accounts retain history and balances, cannot be selected for new transactions, and are excluded from available-money totals. Deletion is permitted only for accounts with no transactions other than `start`.

# 12. Loan model

**One canonical treatment.**

| Event | Recording | Effect |
|---|---|---|
| Loan payout | `move` Loan → Bank | Owed increases; **not income** |
| Repayment (principal only) | `move` Bank → Loan | Owed decreases; no spending |
| Repayment including interest | `move` Bank → Loan with `interest_amount` > 0 | System splits internally: principal portion reduces owed; interest portion is `out` in `Interest & charges` |
| Fees | `out` from the loan account, category `Interest & charges` | Owed increases; spending increases |
| Partial repayment | Same as repayment | Proportionate |
| Full repayment | `move` for the remaining balance | Owed reaches zero; account archivable |
| Opening balance | `start` on the loan account, entered as the amount currently owed | No income, no spending |
| Balance check | See below | Drift becomes real spending |

**Interest approximation and its correction.** `interest_amount` defaults to zero, so a loan balance falls slightly faster than reality. This is corrected by the balance check: **for loan accounts only, drift is recorded as an `out` in `Interest & charges`, not as a `correction`.** The rationale is deterministic — a loan has exactly one predictable payment stream, so a shortfall against the statement is interest and charges, which is genuine consumption and belongs in category reporting. All other account classes produce `correction` records in `Not recorded`, because their drift is unrecorded purchases of unknown composition.

This is the single canonical relationship between `Interest & charges`, `correction`, `Not recorded`, and loan reconciliation. No other interpretation is permitted.

# 13. Refund model

Money returning to the user is recorded as `back`, always linked to the original `out`, and reached from that transaction ("mark money came back") rather than from the add sheet. It reduces spending in the parent's category, in the **period the money was received**, and never increases income. Cumulative `back` may not exceed the parent. A refund arriving months later reduces spending in the month of receipt and marks the parent's month as revised.

Reimbursements from another person and cashback linked to a specific purchase use the same mechanism. Unlinked, non-attributable rewards are `in` records.

# 14. Transfer model

A `move` is one row with two accounts. It changes balances only — never spending, income, or kept. It covers: between own accounts, cash withdrawal, cash deposit, card and loan payments, cash advances, and money sent to `Outside`. Source and destination must differ. Moves to `Outside` may carry a label and are reported as "put in", never valued.

# 15. Balance-check and reconciliation model

**Trigger.** Monthly per liquid account, after fourteen days with no entries, or on demand. Rate-limited to one prompt per account per day. Never blocking; skipping is silent and changes no data.

**Flow.** The app states its figure → the user enters theirs → the app states the difference in plain words → one tap to fix. For owed accounts the prompt asks for the amount currently owed.

**Sign rule (INV-16).** Derived from account class, never raw subtraction:
- asset: `difference = user_reported − app_balance`
- owed: `difference = app_balance − user_reported_owed`

Both collapse to: **more money gone than recorded → missed spending; more money present than recorded → missed income.**

**Resulting record.**
- Loan accounts → `out` in `Interest & charges` (§12).
- All other accounts → `correction` in `Not recorded`.

**Analytics treatment of `correction`.** Included in spent, received, kept and reliability. Excluded from category shares, limits, baselines, and unusual-spending detection. Displayed as its own line item, never folded into a category.

**Behaviour.** Skipping: nothing changes, reliability degrades over time. Wrong balance entered: undo restores the prior state until the next check on that account. Frequent checks: permitted, rate-limited. Never checking: all facts remain exact; reliability shows "some gaps may exist" and comparisons weaken.

# 16. Data completeness model

**Reliability** combines the days-recorded ratio for the period with the most recent balance-check drift. Three user-facing states, expressed as one sentence and never as a percentage:

| State | Condition | Message |
|---|---|---|
| Just starting | < 30 days of history | "Keep adding expenses — I'll start spotting patterns soon" |
| Some gaps | Days-recorded ratio < 0.5, or unresolved drift > 15% of period spending, or 14+ days since the last entry | "A few things may be missing — check your balance?" |
| Reliable | Otherwise | "Your spending picture looks reliable" |

**Governing rule.** Facts (balances, totals, category sums) are always exact and always shown. Comparisons require qualifying months (§18). Estimates are labelled. The only hard suppression in the product is unusual-spending detection, because a false accusation of overspending is worse than silence.

# 17. Metrics dictionary

Basis: **S** = spending view, **M** = money view. All periods use the configured month-start day. Every metric drills to the transactions that sum to it, except where noted in §20.

| Metric | Tier | Basis | Formula | Min data | Fallback / edge cases |
|---|---|---|---|---|---|
| Account balance | P0 | M | `starting + Σin − Σout` | day 1 | Exact always; owed displayed per §6 |
| Money available | P0 | M | `Σ balances where class=asset AND counts_as_available` | day 1 | Excludes owed, archived, and system accounts |
| Owed | P0 | M | `Σ abs(balance) where class=owed AND balance<0` | day 1 | Positive owed balance shown separately as "in credit" |
| Spent | P0 | S | `Σ out − Σ back` in period | day 1 | May be negative in a heavy-refund month; shown with explanation |
| Received | P0 | S | `Σ in` in period | day 1 | Excludes moves, loan payouts, `start` |
| Kept | P0 | S | `Received − Spent` | 1 month | — |
| Kept % | P0 | S | `Kept ÷ Received` | 1 month, Received > 0 | Received = 0 → "no income recorded this month"; never "0%". May exceed 100% |
| Must-pay | P0 | S | `Σ out where essential` | day 1 | — |
| Flexible | P0 | S | `Σ out where NOT essential` | day 1 | — |
| Category share | P0 | S | `category spend ÷ Spent` | day 1 | Excludes `Not recorded` |
| Top-3 share | P0 | S | share of the three largest categories | 1 month | Descriptive only; never judged |
| Promised | P0 | M | `Σ unmatched occurrences due ≤ horizon + Σ owed due ≤ horizon` | commitments entered | None entered → stated plainly, never assumed zero |
| Left to spend | P0 | M | `Available − Promised − buffer`, **signed** | day 1 | Shortfall displayed, never floored at zero |
| Limit progress | P0 | S | `spent ÷ limit` | on creation | Flexible categories only |
| Limit pace | P0 | S | `(spent ÷ limit) ÷ (days elapsed ÷ days in month)` | day 5 | Before day 5, progress only |
| Reliability | P0 | — | §16 | day 1 | Always one sentence |
| Typical (full period) | P1 | S | median over qualifying months (§18) | 3 qualifying months | < 3 → "vs last month" (2) or level only (1) |
| Typical MTD(d) | P1 | S | median of day-1-to-d spend over qualifying months | 3 qualifying months | As above |
| Change vs typical | P1 | S | `actual − typical`, day-aligned when current | 3 qualifying months | Suppressed below threshold |
| Regular bills | P1 | S | `Σ matched commitment amounts` | commitments entered | Unmatched appear as overdue, not spending |
| Unusual spending | P1 | S | flexible, non-repeating category where `spend > median + 3 × max(MAD, 0.1 × median)` **and** ≥30% **and** ≥₹500 | 6 qualifying months, ≥4 with non-zero spend, MAD/median ≤ 0.5 | Silent otherwise |

# 18. Baseline / typical-month methodology

**Qualifying month.** A month enters a baseline only if all hold: fully elapsed (never the current month) · ≥10 recorded transactions · unresolved balance-check drift ≤15% of that month's spending (no check performed is not disqualifying) · not manually excluded.

**Baselines.** Overall typical = median of the last 6 qualifying months, minimum 3. Category typical = median over qualifying months with non-zero spend in that category, minimum 3 such months.

**Excluded from all baselines.** Transactions flagged `exclude_from_typical` · non-monthly commitments · `correction` records.

**Current-month comparison (INV-17).** Always month-to-date against the same day-of-month across baseline months: `typical_MTD(d) = median over qualifying months of spend from day 1 to day d`. Completed months compare full to full. The UI states which is in use.

**Irregular guard.** If `MAD ÷ median > 0.5` for a subject, the product shows a **range** ("your food spending usually runs ₹4,000–₹9,000") instead of a point comparison, and unusual-spending detection is disabled for that subject.

**Below threshold.** Fewer than 3 qualifying months → no "typical" language anywhere. Two months → "vs last month". One month → level reporting only.

# 19. Reporting specification

Six views in one Reports area. Every view follows **Answer → Explanation → Detail**, and every number drills to transactions.

| View | Tier | Answer | Explanation | Detail | Action |
|---|---|---|---|---|---|
| **This month** | P0 | Spent, kept, day-aligned comparison when available | Categories by size, each with its own change | Transactions per category | Set a limit |
| **Where it goes** | P0 | Top three categories as a share of spending | Full breakdown, must-pay vs flexible | Transactions | Reclassify essential |
| **Limits** | P0 | How many limits are on track | Per-limit progress and pace | Transactions | Adjust limit |
| **What changed** | P1 | Change vs typical | Waterfall of the largest increases and decreases in ₹ | Transactions behind each bar | Mark one-off |
| **Over time** | P1 | Direction across 3 / 6 / 12 months | Per-category lines with the typical band | Month → transactions | Set a limit |
| **Regular bills** | P1 | Total monthly commitment load | Each bill, amount, due date, price changes | Matched transactions | Edit or cancel |

**Monthly Review (P1)** is a **month-boundary mode of *What changed***, not a separate surface. At the start of a month, a Home card opens *What changed* scoped to the just-closed month with a narrative header and a single closing action. No seventh reporting surface exists.

**Chart discipline.** Bars for comparison, lines for direction, waterfall for explanation, progress for limits. No pie charts as a primary view, no heatmaps, no decorative visuals.

# 20. Analytics and insight specification

**Insight gates (all four must pass).** Materiality — relative and absolute thresholds both met · Confidence — baseline requirements met · Novelty — outside the cooldown for that subject · Budget — at most one card on Home, three active in Reports, four notifications per month.

**Insight types (all P1).** Unusual spending · commitment price change (never presented as unusual spending) · limit pace warning · card-in-credit signal ("your card shows ₹2,400 more paid than spent — some purchases may be missing") · reliability prompt · one positive acknowledgement per month.

**Actions on every insight.** See the transactions · set a limit · mark as a one-off (sets `exclude_from_typical`) · not useful (suppresses that type).

**Explainability guarantee.** Every aggregate resolves to a transaction list summing to it exactly, along the path Home → Report → Category → Payee → Transaction. Four figures are structurally exempt and must therefore always appear as **separate line items**, never folded into a category:

| Figure | Why exempt | How it is explained |
|---|---|---|
| `Not recorded` corrections | No underlying transactions exist by definition | "₹700 was spent but not recorded — found on 12 March" |
| Estimates | Forward-looking, never summed with actuals (INV-13) | Labelled, with the inputs shown on tap |
| Starting balances | Not income or spending (INV-10) | Shown on the account, dated, excluded from all reports |
| `Outside` movements | Not spending; not valued | "₹20,000 put in" with the user's label and the transactions listed |

Unusual-spending drill-down additionally shows this month's figure, the typical figure, the months used, and any excluded one-offs.

# 21. UX specification

**Home** — exactly four elements: money available (with owed on a separate line, never netted) · left to spend · spent this month with its comparison when available · at most one insight card.

**Navigation** — Home · Transactions · Reports · Plan · Settings. Any aggregate anywhere is tappable to its transactions; back returns to the point of origin, never to a tab root.

**Add sheet** — as specified in §10. Three taps for a common expense, four for a move.

**Transactions** — full list with filters (period, category, account, payee, kind) and search across payee and note. All drill-downs land here.

**Plan** — commitments and spending limits: creation, editing, due dates, price history.

**Settings** — accounts, categories, balance check, backup, export, import, preferences.

**Language rule.** No user-visible string may contain accounting or statistical vocabulary. Enforced by an automated banned-terms lint test (T-80).

# 22. Screen and state requirements

Every screen defines six states. No screen ever renders blank.

| State | Behaviour |
|---|---|
| First use | Explains what the screen will show once data exists: "Add a few expenses to start seeing where your money goes" |
| No data | Same as first use, with a direct action |
| Partial data | Strongest true statement available: "Once you've used this another month, I can compare" |
| Complete | Full view |
| Error | Plain-language cause and a recovery action |
| Unreconciled | "A few things may be missing — check your balance?" |

# 23. Offline requirements

Every capability computes from local rows alone. No feature may issue a network call, reference an external dataset, invoke a remote model, or require an account.

| Capability | Local input | Local computation | Output |
|---|---|---|---|
| Balances, totals, shares | Transactions, accounts | Aggregation | Exact figures |
| Payee memory | Local payee frequency table | Ranking | Category prefill |
| Baselines, typical | Historical transactions | Median / MAD | Comparisons |
| Unusual spending | Historical transactions | Robust thresholds | Insight cards |
| Recurrence detection | Payee + interval history | Interval matching | Suggested commitments |
| Duplicate detection | Recent transactions | Field matching | Soft prompt |
| Backup, CSV | Local database | Serialisation | Local file |

# 24. Backup, export, import

**Backup** — complete, lossless, restorable, versioned with `schema_version`, `app_version`, `created_at`. The recovery path. Written to user-selected local storage.

**CSV** — human-readable and **re-importable**, with columns: `id, date, kind, amount_paise, from_account_id, from_account_name, to_account_id, to_account_name, category_id, category_name, payee_id, payee_name, note, essential, repeating, back_of_id, commitment_id, outside_label, interest_amount, exclude_from_typical, created_at, updated_at`. **IDs are authoritative; names are informational.**

**Import** — additive with ID collision detection: matching IDs are skipped, never duplicated; new IDs are inserted; a summary is shown. Export → import → export must produce identical data (T-73).

Both are free. Data portability is part of the ownership model, never a paid feature.

# 25. Scope

### P0 — first trustworthy release
Three-chip add flow with calculator, smart defaults, and payee autocomplete · asset and owed accounts with required starting balances · all six transaction kinds · refunds via `back` · moves including `Outside` · loan model (§12) · 12 default categories with essential defaults · commitments entered by the user, with due dates · spending limits with progress and pace · **balance check** including the loan rule · reliability sentence · metrics tiered P0 in §17 · **This month**, **Where it goes**, **Limits** reports with full drill-down · transactions list with filters and search · Home with its four elements · all six screen states · backup, restore, CSV export and import · ₹ formatting, decimals, month-start day · offline operation · all 17 invariants enforced · P0 acceptance tests passing.

### P1 — follows P0
Recurrence detection · **What changed** (including Monthly Review mode) · **Over time** · **Regular bills** · unusual spending and the full insight set · commitment price-change alerts · card-in-credit signal · `exclude_from_typical` UI action · widget quick-add · passcode and biometric lock · duplicate prompt · catch-up entry mode.

### P2 — future
Post-hoc split transactions · category drift analysis · flexible-vs-income growth at 12 months · seasonality and year-over-year at 24 months · PDF export · database encryption at rest.

### Removed
Net worth · financial-health score · tags · subcategories · funds and goals as a separate concept · weekly and custom budget periods · budget carry-over · calendar heatmaps · dormant-subscription detection · shared expenses · multi-currency · investment valuation · gamification · peer comparison · receipt OCR · SMS parsing · AI advice.

# 26. Acceptance-test suite

80 tests. Format: starting state → action → expected internal → expected user-visible → expected analytics. Pass condition: all three expectations hold and invariants 1–17 remain true. Tier marks which release must pass each test.

### A. Transaction correctness (T-01 … T-32) — all P0
| ID | Scenario | Expected |
|---|---|---|
| T-01 | ₹3,000 cash purchase | Cash −3,000; "Spent ₹3,000"; spending 3,000 |
| T-02 | ₹3,000 bank purchase | Bank −3,000; spending 3,000 |
| T-03 | ₹3,000 card purchase | Owed 3,000; available unchanged; spending 3,000 |
| T-04 | T-03 then ₹3,000 card payment | `move` Bank→Card; owed 0; **spending still 3,000, not 6,000** |
| T-05 | T-03 then ₹1,000 partial payment | Owed 2,000; spending unchanged |
| T-06 | T-03 then ₹1,000 refund | `back` to card; owed 2,000; spending 2,000; income 0 |
| T-07 | Full ₹3,000 refund | Category nets 0; not income |
| T-08 | Refund exceeding parent | Blocked with explanation |
| T-09 | Card payment from a different bank | `move`; no spending |
| T-10 | Card payment from cash | `move` Cash→Card; no spending |
| T-11 | Card payment reversed | `move` Card→Bank; balances restore |
| T-12 | Card annual fee ₹500 | `out` from card; owed +500; spending 500 |
| T-13 | Card interest ₹340 | `out`, `Interest & charges`; spending 340 |
| T-14 | Card cash advance ₹5,000 | `move` Card→Cash; owed +5,000; **no spending** |
| T-15 | New card, ₹18,400 owed at setup | `start`; owed 18,400; no income, no spending |
| T-16 | Card opening balance unknown | Setup requires explicit confirmation of zero; statement hint shown |
| T-17 | Card A pays Card B | `move`; total owed unchanged; no spending |
| T-18 | Payment recorded, purchases not | Card balance positive → in-credit signal (P1 surface; P0 records correctly) |
| T-19 | ₹5,000 ATM withdrawal | `move` Bank→Cash; no spending |
| T-20 | ₹1,200 spent from that cash | Total from T-19+T-20 = 1,200, not 6,200 |
| T-21 | Own cash deposited to bank | Chip `Moved`; no income |
| T-22 | Cash income banked | Chip `Received`; **income recorded** |
| T-23 | ₹5,00,000 loan received | `move` Loan→Bank; owed 5,00,000; **not income** |
| T-24 | ₹12,000 EMI, interest 0 | `move` Bank→Loan; owed −12,000; spending 0 |
| T-25 | ₹12,000 EMI, interest ₹1,500 | Principal 10,500 as `move`; 1,500 `out` in `Interest & charges`; owed −10,500 |
| T-26 | Loan balance check shows ₹2,300 more owed than app | **`out` of 2,300 in `Interest & charges`** (not a `correction`); owed matches statement; included in category shares |
| T-27 | Early full repayment | `move` for the remainder; owed 0; account archivable |
| T-28 | ₹20,000 to untracked investment | `move` Bank→Outside with label; **not spending** |
| T-29 | ₹50,000 withdrawn from investment | `move` Outside→Bank; **not income** |
| T-30 | Lending ₹5,000 to a friend | `move` Bank→Outside; not spending |
| T-31 | ₹4,000 dinner, ₹2,000 reimbursed | `back`; nets 2,000; **not income** |
| T-32 | Delete an `out` that has a `back` | Confirmation names the linked record, then cascades; no orphan remains |

### B. Reporting and analytics (T-33 … T-49)
T-33 (P0) spending drills category → payee → transaction with sums matching at each level · T-34 (P0) category total equals its transaction list · T-35 (P0) `Not recorded` appears as its own line and is excluded from category shares · T-36 (P1) waterfall increases minus decreases equals total change · T-37 (P1) typical absent at 2 qualifying months, present at 3 · T-38 (P1) current-month comparison is day-aligned · T-39 (P1) one-off flag removes a transaction from future baselines · T-40 (P1) annual commitment excluded from monthly baselines · T-41 (P1) rent ₹18,000 → ₹18,500 raises a price change, not unusual spending · T-42 (P1) sparse category (2 of 6 months) raises no unusual-spending alert · T-43 (P1) MAD/median > 0.5 shows a range, not a point comparison · T-44 (P0) limit pace suppressed before day 5 · T-45 (P0) kept % suppressed at zero income · T-46 (P0) kept % exceeds 100% in a refund-heavy month and is explained · T-47 (P0) top-3 share equals the sum of the three largest categories ÷ spent · T-48 (P1) unusual-spending drill-down shows baseline months and exclusions · T-49 (P0) estimates are never summed with actuals.

### C. Data completeness (T-50 … T-59) — all P0
T-50 day 1 shows exact balances and spending, no comparison · T-51 five days shows distribution, no projection · T-52 two weeks shows month-to-date only · T-53 one month shows level, no typical · T-54 two months shows vs-last-month · T-55 three qualifying months unlocks typical · T-56 a month with 8 transactions is excluded from baselines · T-57 14 days without entries triggers the reliability prompt · T-58 a month with no income falls back to spending-only reporting · T-59 30 backdated entries recompute affected periods and mark them revised.

### D. Balance check (T-60 … T-69) — all P0
T-60 asset, actual < app → missed-spending correction · T-61 asset, actual > app → missed-income correction · T-62 owed, user owes more than app → missed spending · T-63 owed, user owes less → missed income · T-64 correction included in spent and kept · T-65 correction excluded from category shares, limits and baselines · T-66 wrong balance entered → undo restores the prior state · T-67 skipping never blocks and never alters data · T-68 repeated checks are rate-limited to one prompt per account per day · T-69 correction explains itself without drilling to transactions.

### E. UX and state (T-70 … T-80)
T-70 (P0) every screen has a non-blank first-use state · T-71 (P0) a common expense completes in three taps · T-72 (P0) back from a drill-down returns to origin, not tab root · T-73 (P0) CSV export → import → export round-trips identically · T-74 (P0) re-import skips existing IDs without duplicating · T-75 (P0) backup restore is lossless · T-76 (P1) duplicate prompt appears only within five minutes on matching amount, payee and account · T-77 (P0) changing kind from `out` to `move` nulls category and flags · T-78 (P0) self-transfer blocked · T-79 (P0) archived account is unselectable for new entries but retains history · T-80 (P0) no user-visible string contains banned accounting or statistical terms.

# 27. Known limitations

Stated in-app, not buried: single currency · money sent to untracked destinations is recorded at what was put in and never valued · loan interest is approximate until a balance check · comparisons require three qualifying months · seasonality is unavailable before two years of history · completeness depends on the user, which is what the balance check exists for.

# 28. Remaining behavioural risks

These cannot be resolved through requirements and must be validated by prototype with real users. No further features are to be added in an attempt to solve them.

| Risk | Nature | Validation |
|---|---|---|
| **Manual-entry sustainability** | If people do not log, nothing else matters. No specification can make them | Prototype. Failure invalidates the product concept, not this specification |
| **Balance-check adoption** | It is the only error-detection mechanism in the system | Prototype: measure completion rate over 60 days |
| **Essential vs flexible classification** | A user judgement, not a fact; defaults may not match intent | Prototype: measure override rate |

---

**Requirements status: FINAL**

- **Final P0 scope:** capture and the three-chip model · asset and owed accounts · six transaction kinds · loan model · refunds · moves and `Outside` · commitments (user-entered) · spending limits · balance check · reliability · 16 P0 metrics · three reports with full drill-down · transactions list · Home · all screen states · backup, CSV export and import · offline operation · 17 invariants.
- **Final P1 scope:** recurrence detection · What changed with Monthly Review mode · Over time · Regular bills · unusual spending and the insight set · price-change alerts · card-in-credit signal · one-off flagging UI · widget · passcode and biometrics · duplicate prompt · catch-up entry.
- **Final P2 scope:** split transactions · drift analysis · 12-month growth comparison · seasonality at 24 months · PDF export · encryption at rest.
- **Acceptance tests:** 80 (61 P0, 19 P1).
- **Unresolved P0 issues:** 0.
- **Unresolved P1 specification issues:** 0.
- **Remaining behavioural risks:** 3, all marked for prototype validation.

Next phase: data model → user flows → screen/UI specification → prototype → real-user validation → implementation.
