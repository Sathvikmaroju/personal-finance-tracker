# 11 — Screen Specification

All 45 screens. Every screen defines its six states (doc 18 governs state semantics). Accessibility requirements per screen supplement doc 19. Components referenced are defined in doc 12.

---

## S-01 · Home · P0
**Purpose / question.** "How am I doing right now?"
**Entry** App launch, Home tab. **Exit** Any drill-down, add sheet.
**Layout (top to bottom).** Money available (large) with Owed on a separate line · Left to spend with a chevron to its breakdown · Spent this month with comparison · reliability sentence when not "Reliable" · at most one insight card · Monthly Review card in week 1 (P1).
**Hierarchy.** Money available is the largest element; everything else is secondary. Nothing competes for the same visual weight.
**Data / calculations.** M-02, M-03, M-13, M-04, M-19, M-16.
**Actions.** Tap any number to drill · FAB to add · dismiss insight.
**States.** *First use:* "Add your first expense to see where your money goes" with the balance already correct. *Empty:* balances shown, spending zero, no comparison. *Partial:* comparison replaced by "Once you've used this another month, I can compare." *Full:* all elements. *Error:* if the database is unreadable, a recovery screen (doc 18). *Loading:* skeleton for ≤300 ms, then content.
**Accessibility.** Money available is announced as a single label ("You have fifty-one thousand two hundred rupees"). Owed is announced separately and never merged. Insight cards are a labelled region with a dismiss action.

## S-02 · Add transaction · P0
**Purpose.** Record a money event in three taps.
**Entry** FAB, widget, deep link. **Exit** Save or dismiss.
**Layout.** Chips `Spent | Received | Moved` (Spent preselected) → amount display with calculator strip → contextual selector (category grid for Spent/Received; from/to account rows for Moved) → collapsed "More" row (payee, note, date, account) → Save.
**Calculations.** Live expression evaluation for the calculator; no financial logic — the sheet submits an intent to the domain layer.
**Actions.** Switch chip (resets forbidden fields) · pick category · expand More · Save.
**States.** *First use:* a one-line hint under the chips explaining the three actions, shown twice then retired. *Invalid:* Save disabled while the amount is zero. *Error:* validation inline, never a dialog. *Confirmation:* toast with Undo.
**Accessibility.** The amount field takes focus on open with the numeric keypad; every chip and category tile has a text label, not an icon alone; touch targets ≥48 dp.

## S-03 · Account picker · P0
Bottom sheet listing non-archived, non-system accounts grouped by class, each showing its current balance. For Moved, includes "Somewhere else (not tracked)". *Empty:* routes to account creation. Accessibility: single-select list semantics with the balance in the accessible label.

## S-04 · Category picker · P0
Icon-and-label grid, ordered by recent-and-frequent use, filtered to the correct `kind`. Search field appears above 12 categories. *Empty:* impossible after onboarding; falls back to defaults.

## S-05 · Payee input · P0
Inline text field with an autocomplete list after 3 characters, ranked by `times_used`. Selecting a payee with a `usual_category_id` sets the category if none is chosen. Free text creates a new payee silently on save.

## S-06 · Date picker · P0
Calendar modal, defaulting to today, blocking dates beyond tomorrow. Quick options: Today, Yesterday.

## S-07 · Transactions list · P0
**Question.** "What exactly happened?"
**Layout.** Period header (sticky) · day-grouped rows with per-day totals · row shows category icon, payee or category name, note snippet if enabled, account, amount signed by kind.
**Data.** Filtered transaction query; totals per day.
**Actions.** Tap → S-08 · search/filter → S-10 · pull to refresh recomputes.
**States.** *First use / empty:* "Your transactions will appear here." *Filtered empty:* "No transactions match. Clear filters?" *Full:* virtualised list.
**Performance.** Virtualised; pages of 50; targets in doc 21.
**Accessibility.** Each row announces kind, amount, category, date. Signed amounts are distinguished by prefix text, never by colour alone.

## S-08 · Transaction detail · P0
Shows every field, the account effect in plain language ("Bank went down by ₹3,000"), linked records (refunds, group members, matched commitment), and the audit dates. Actions: Edit · Delete · Money came back · Mark as one-off (P1) · Split (P2).
*States:* refunded transactions show remaining refundable amount; grouped records show their sibling.

## S-09 · Edit transaction · P0
Same sheet as S-02, pre-filled. Changing kind warns which fields will be cleared. Saving recomputes; if a closed period is affected, a toast notes "Past figures updated."

## S-10 · Filter & search · P0
Free text over payee and note; chips for period, account, category, kind; amount range. Applied filters shown as removable chips above the list with a result count.

## S-11 · Accounts list · P0
Grouped by class. Assets show balances and sum to Money available exactly; owed accounts show amounts owed. Actions: add, reorder, open, archive. *Empty:* impossible post-onboarding.

## S-12 · Account detail · P0
Balance with a running-balance transaction history, last balance check date, and actions: Balance check · Edit · Archive · Delete. *States:* archived accounts are read-only with a banner and an Unarchive action.

## S-13 · Create / edit account · P0
Fields: name, class (plain language — "Money I have" / "Money I owe"), subtype, icon, starting balance (owed: "How much do you owe right now?"). Starting balance is editable only while no other transactions exist; otherwise the field is replaced by a link to the balance check.

## S-14 · Balance check · P0
**Layout.** "I think your Wallet has ₹2,400." → input "What does it actually have?" → difference stated in plain words → **Fix it** / **Skip**.
**States.** *Match:* "That matches — nothing to fix." *Difference:* "₹500 was spent but not recorded. Add it?" *Undo available:* banner until the next check. *Loan account:* copy names interest ("₹2,300 of interest and charges since you last checked").
**Accessibility.** The difference sentence is the accessible summary; no reliance on colour.

## S-15 · Reports hub · P0
Six cards, each with its title and a live one-line answer as subtitle, so the hub is informative rather than a menu. P1/P2 views that lack data show their unmet condition inline and remain tappable.

## S-16 · This month (R-01) · P0
Per doc 08 §2. L1 summary block, L2 category list with shares, L3 on tap. Period selector in the header. `Not recorded` always the final row, visually distinct, excluded from shares.

## S-17 · Where it goes (R-02) · P0
Per doc 08 §3. Top-3 share headline, must-pay/flexible stacked bar, ranked category list with a toggle.

## S-18 · Limits (R-03) · P0
Per doc 08 §4. Progress bars with a pace marker; over-limit shown calmly as an amount over.

## S-19 · Settings · P0
Grouped list: Accounts · Categories · Payees (P1) · Balance check · Backup & restore · Export · Import · Preferences · App lock (P1) · About & limitations (states the six known limitations verbatim).

## S-20 / S-21 · Categories list and editor · P0
List with drag-reorder and usage counts; editor covers name, icon, kind, essential and repeating defaults. Merge and delete (unused only) available. System categories are read-only.

## S-22 · Plan hub · P0
Two sections — Commitments (with total monthly load and next due) and Limits (with on-track count). *Empty:* each section explains its value and offers a one-tap create.

## S-23 / S-24 · Commitments list and editor · P0
List shows name, amount, cadence, next due, and status. Editor covers name, category, amount, cadence, next due, optional payee and account. Annual commitments display set-aside guidance. Overdue occurrences offer "Link a payment".

## S-25 / S-26 · Limits list and editor · P0
List shows category, limit, spent, remaining. Editor suggests an amount from the user's median once ≥3 qualifying months exist, and blocks repeating categories with an explanation.

## S-27 · Backup & restore · P0
Last backup date, Back up now, Restore from file. Restore shows the file's date, transaction count and schema version, and warns that current data will be replaced.

## S-28 · Export · P0
Scope (all / period), format CSV, destination. Explains that the file contains all data in readable form.

## S-29 · Import · P0
File chooser → validation preview (new / skipped / invalid with row numbers and reasons) → confirm. Proceeding with a valid subset is permitted.

## S-30 · Preferences · P0
Decimals, month-start day (with a warning that report periods shift), theme, buffer amount, notification settings, show-notes-in-list.

## S-31 · Onboarding · P0
Three steps per F-01. Progress indicator; step 3 skippable. No account creation, no network, no permissions requested beyond storage at the moment of first backup.

## S-32 · Category drill-down · P0
Category total for the period, its share, its trend sparkline (P1), payee breakdown, and the transaction list. Every level sums exactly.

## S-33 · Payee drill-down · P0
Payee total for the period, transaction count, typical amount, category split, and the transaction list.

## S-34 · What changed (R-04) · P1
Per doc 08 §5. Waterfall with tappable bars. *Insufficient:* reachable, explains the unmet condition.

## S-35 · Monthly Review · P1
Mode of S-34: narrative header, the seven-part sequence, and a single pre-filled closing action. Dismissible; does not reappear within the period.

## S-36 · Over time (R-05) · P1
Per doc 08 §6. Window selector, trend lines with typical band, per-category sparkline rows.

## S-37 · Regular bills (R-06) · P1
Per doc 08 §7. Table plus due-date calendar strip; detected suggestions appear as a distinct, confirmable section.

## S-38 · Insight detail · P1
Signal, explanation with the qualifying months used and any exclusions, impact, and the four actions (see transactions, set a limit, mark one-off, not useful).

## S-39 · Detected commitment review · P1
Pre-filled commitment editor labelled as a suggestion, with the evidence shown ("3 payments to Netflix, monthly, ₹199–₹199"). Confirm or dismiss; never auto-created.

## S-40 · Payees list · P1
Frequency-ranked list with rename, merge, and usual-category assignment.

## S-41 · App lock · P1
Passcode entry on launch and after backgrounding; biometric option. Setup states plainly that a forgotten passcode cannot be recovered, because there is no server.

## S-42 · Widget config · P1
Choose which figure the widget shows (Money available or Left to spend) and whether the quick-add opens preset to Spent.

## S-43 · Catch-up entry · P1
Mode of S-02: the sheet remains open after save, retaining the date, with a running count of what has been added in the session.

## S-44 · Split transaction · P2
Post-hoc only, opened from S-08. Allocates the parent amount across categories; the sum must equal the parent exactly before saving. Never appears in the add flow.

## S-45 · Diagnostics · P2
Local-only view of invariant-assertion failures, database size, and recomputation timings. Never transmitted; exportable as a text file for support.

---

## Screen-state coverage matrix

Every screen implements all applicable states from doc 18. Screens with no asynchronous work (pickers, editors) omit *Loading*. Screens that display no aggregates (preferences, onboarding) omit *Partial data*. All screens implement *First use*, *Error*, and *Confirmation* where a destructive action exists.

## Instrumentation (local only)

For prototype validation, the app may record locally — never transmitted — time-to-save in the add flow, balance-check completion, insight dismissal, and drill-down depth. Recording is opt-in, visible in Settings, and exportable by the user.
