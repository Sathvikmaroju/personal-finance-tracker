# Phase 2A Fix List for Claude Design

Scope: fixes Claude Design must make to its phase 2A work and to the phase 1 work it builds on. Source file checked: `docs/design/prototype/Personal Finance App.dc.html` (export dated 2026-11-10).
This list only consolidates four verification reports and the decisions log. It adds no new findings and makes no new product decisions. Every decision a fix needs is recorded in `32_Decisions_Log.md` and is listed at the end of section 3.

## 1. Scope and how it was verified

Verification used two methods.
- Code reading by three verifiers: `mobile/verify2a_P0.md` (VP-n, items P0-01 to P0-17), `mobile/verify2a_followups_P1a.md` (VQ-n, phase 1 follow-ups and P1-01 to P1-15) and `mobile/verify2a_P1b.md` (VR-n, P1-16 to P1-30). Two of these also ran a node harness on the app logic.
- A Playwright run in the real prototype: `mobile/verify2a_browser.md` (VB-n and a runtime result for every VQ and VR item). Screenshots are in `mobile/shots2a/`.
- The verifier reports and screenshots above are working files, deleted 2026-11-10.

Limits: there was no real device. Text at 200% was simulated by script (not Android sp scaling). Device sizes were set by overriding the prototype's device prop. TalkBack, real touch gestures and real clock-based behaviour were not tested (see section 6).

Priority rule used: P0 = blank screen, wrong money figure, data loss, broken decided rule, or contrast fail on a decided requirement. P1 = other contradiction of a decision or of an Accept line. P2 = wording, polish, prototype-only. Evidence that was only simulated (200% text) is capped at P1.

Counts (computed from the tables below by script):

| Measure | Count |
|---|---|
| Fix ids in total | 51 (FX-01 to FX-51) |
| Active fixes | 50 (FX-31 is closed without change, see section 3) |
| P0 | 13 |
| P1 | 12 |
| P2 | 25 (26 before FX-31 was closed) |
| Confirmed in running UI (active fixes) | 34 |
| Confirmed by code reading only (active fixes) | 15 |
| Not reproduced | 1 (FX-34, from VR-11) |
| Source IDs mapped (VP 10, VQ 12, VR 14, VB 12) | 48 (46 to an active fix, 1 to a fix closed without change: VQ-10 to FX-31, 1 not an issue: VR-14) |
| Fixes with no VP/VQ/VR/VB ID (verification-table notes, FX-44 to FX-51, plus P1-08a, D-11a) | 10 |
| Decisions that need no fix (P1-19a, P1-06a) | 2 (section 3, "Accepted as is") |

## 2. Decisions that apply to these fixes

| Decision | Rule (from `32_Decisions_Log.md`) | Fix that depends on it |
|---|---|---|
| P1-08a | Add a direct link to "Where it goes" on Overview or the Reports hub. | FX-15 |
| P1-12a | A card due counts as paid only if a payment is within 20% of the amount due, in the window 5 days before to 7 days after the due day. | FX-06 |
| P0-15c | `unusual()` uses the same months-with-spending median as everything else. Home and the category screen then agree. | FX-05 |
| D-11a | Add a scroll cue (partly visible row or a fade) to the add sheet at 320 x 568 so users see "Paid from" and "More". | FX-16 |
| P1-19a | Darker Warm (#95542A) and Midnight (#7F6220) light accents are accepted. | No fix. Keep them. |
| P1-06a | Accounts in two places until P1-51 (phase 2B) is an accepted interim state. | No fix. Do not touch. |
| VB-6 | Clear the Undo toast when any sheet or dialog opens. Opening a sheet counts as the "next action" for D-02. | FX-03 |
| D-11 (revised) | Minimum 360 x 640 dp. 320 dp wide must not break. Text up to 200%. Tablet column max 560 dp. | FX-16, FX-25, FX-26, FX-38 |
| D-02 | No timer on Undo. It stays until the next action. | FX-03 |
| D-04 | All 8 palettes x light/dark (16 pairs) pass WCAG AA. | FX-02 |
| D-05 | Private accounts hide on screen only and always count in totals. | FX-07 |
| FX-07 | Keep Left to spend as computed (Rs 44,302 on the seed). Show "Card-paid bills count when the card is due". The user can change a card's due day in Edit account. | FX-07 |
| FX-10 | Erase clears accounts, bills, limits and transactions, then shows the empty first-run state. | FX-10 |
| FX-11 | Fix the sample data for "First week only" and "Nothing recorded yet". No logic change. | FX-11 |
| FX-17 | A card's due day is required when the card is added and editable later. No "Not set". The picker accepts any day (D-10). Existing cards without one are prompted once. | FX-17 |
| FX-24 | Home hero 40 px. Report heroes `--type-hero` 36. Stats `--type-stat` 19. Apply the tokens. | FX-24 |
| FX-28 | With zero accounts show no Left to spend and an "Add an account" prompt. | FX-28 |
| FX-31 | Keep the current "All other categories" wording. | None. Closed without change. |
| FX-45 | Totals are exact and rows round for display. A Rs 1 difference is expected when paise are off. | FX-45 (Accept wording only) |
| D-07 | Full value below Rs 1 crore. No "Rs 0k" labels. | FX-13 |
| D-12 | Type tokens 36 (hero) and 19 (stat). | FX-24 |
| D-19 | Corrections stay out of both actual and typical. | FX-04 |
| D-20 | A card-paid bill counts at the card's due date and is not counted again. | FX-06, FX-07, FX-17 |
| D-21 | Today and earlier only. | FX-30 |
| D-22 | Every row is editable and links are always preserved. | FX-09, FX-19 |
| D-27 | Widget shows no figures by default. The user opts in. | FX-12 |
| Q-2 | Erase everything ships with a typed confirmation and a backup prompt. | FX-10 |
| Q-4 | Bill match: within 7 days of the due date and within 20% of the amount. | FX-08, FX-18 |
| Q-9 | A detected bill opens a pre-filled editor. Nothing in history changes until Save. | FX-21 |

## 3. The fix list

All fixes below follow decisions in 32_Decisions_Log.md; no open owner decisions remain for these fixes.

Status key: C-UI = Confirmed in running UI. C-CODE = Confirmed by code reading only. NR = Not reproduced. In the Status column the full words are used.
Screenshot names are the real files in `mobile/shots2a/` (working files, deleted 2026-11-10).

### P0

| ID | Sources | Screen | What is wrong | Required fix (instruction to Claude Design) | Acceptance check | Status | Screenshot |
|---|---|---|---|---|---|---|---|
| FX-01 | VQ-1, P1-06 | Home insight "See the transactions"; Account > "See all in Transactions" | The `txlist` drill-down screen is blank. Stack is `home > txlist{categoryId:eating_out}`; phone text is only "Transactions" plus the tab bar. No rows, no filter chips. Same for Cash account. The changelog says it showed 16 rows. Cause by code: `screenVals` sets `at.tx` only for route `tx` (line 4330). | Set `at.tx = r.n === 'tx' \|\| r.n === 'txlist'` in `screenVals`, so `txlist` renders the transaction list (lines 3026 and 4388 already assume this). | Home > Eating Out insight > "See the transactions" shows 16 rows, "16 transactions . 12,171 spent" and filter chips. Account Cash > "See all in Transactions" shows its rows. Back returns. The Transactions tab's own filter is unchanged. | Confirmed in running UI | VQ-1.png |
| FX-02 | VR-1, VQ-7 | Undo toast (every screen) | Undo text `var(--acc500)` on `var(--n900)` fails 4.5:1 in 13 of 16 palette/theme pairs. Measured in browser: ink light 1.46, ink dark 1.58, slate light 2.91, sage dark 2.95, midnight dark 3.00, emerald dark 3.05, warm dark 3.21, sophisticated light 3.41, berry light 3.82, slate dark 3.92, sage light 4.08, emerald light 4.40, berry dark 4.40. Undo is the only recovery control (D-02). Breaks D-04 and the P1-19 Accept. | Give the toast Undo a text token built for the dark toast surface (for example `--n0` with an underline or pill, or a new on-inverse-accent token, or `--acc100`). Re-run the full 16-pair audit and include the toast. | Undo text on the toast background is at least 4.5:1 in all 16 pairs (measure computed colour in the browser). | Confirmed in running UI | VR-1.png |
| FX-03 | VB-6, P1-21 | Any bottom sheet opened soon after an action (checked: "Delete this part?", "Change a linked amount?") | The Undo toast has no timer and sits over the sheet. On "Delete this part?" it covers 37 of 56 px of "Delete only this part" (with its warning subtitle) and 19 of 56 px of "Delete all 2 parts". Playwright could not click the buttons ("data-toast intercepts pointer events"). The Undo also belongs to an unrelated earlier action. | Per the VB-6 decision: clear the Undo toast whenever any sheet or dialog opens. Opening a sheet counts as the "next action" (D-02). Undo is no longer offered after that. | After any action that shows the Undo toast, open Delete part, Change linked amount, Merge and the add sheet: the toast is gone, no button is covered, and Playwright can click every sheet button. | Confirmed in running UI | VB-toast-over-delete-sheet.png, VB-toast-over-sheet.png |
| FX-04 | VQ-3, VP-6, VB-5 | Overview month hero, multi-month comparison, Reports hub, What changed, Home | Not one baseline path. Overview hero uses `(sp - corr) - tmtd` (line 3292); multi-month uses `spent()` incl. corrections (line 3300). Home, hub, What changed and the Home insight use `spentCmp`. After "Mark as a one-off" on Chai Corner Rs 1,790: Home "Rs 3,212 more than a typical month"; What changed "+Rs 3,212"; Overview "Rs 5,002 more ... by this day" (unchanged); hub row "Eating Out is Rs 7,819 above" while the What changed screen says Rs 6,029. Harness gap Rs 2,611. | Use `spentCmp(r)` at line 3292 and the `baselineSpend` sums at line 3300, so one function gives the actual and the typical everywhere (P1-13, D-19). Use the same function for the hub line and the screen it opens. | After marking one entry as a one-off, Home, Overview, What changed and the hub show the same gap. The Eating Out figure on the hub row equals the one on What changed. | Confirmed in running UI | VQ-3.png |
| FX-05 | VQ-4, VP-8, P0-15b, P0-15c | Home unusual card, What changed, category screen | `unusual()` takes median and MAD over all qualifying months, zeros included (lines 1921-1923, 1929). Shopping month-to-date `2771, 0, 3640, 2972, 6612, 3117`: unusual path median Rs 3,044.50, months-with-spending median Rs 3,117. Entertainment `0, 331, 0, 0, 1033, 0` gives 0, Rs 372.50 and "typical Rs 165.50": three typicals for one category. | Per decision P0-15c: use the same months-with-spending median everywhere. Use `catSpendMonths` for `hist` in `unusual()`. Note: spec M-21 needs amending (owner's task, not yours). | One category shows one typical figure on Home, What changed and the category screen. Entertainment shows Rs 372.50 on all three. | Confirmed in running UI | none |
| FX-06 | VQ-5, P1-12, P1-12a | Left to spend, card dues (Plan, Home) | `cardDues` treats ANY move to the card in the window as "paid" (lines 1805-1808). Card due day 20, Rs 30,000 owed: Left to spend Rs 14,302, bills Rs 34,898. After a Rs 500 Moved payment: bills Rs 4,898, Left to spend Rs 43,802. A Rs 500 payment cleared a Rs 30,000 due. Also: a payment 5 days before a due on day 1 to 5 falls in the previous period and is missed. | Per decision P1-12a: count a due as paid only when a payment within 20% of the amount owed falls in the window 5 days before to 7 days after the due day. Search the window across the period border. Count the rest, not zero. | Card due 20th, Rs 30,000 owed, Rs 500 payment: the due is not cleared (Left to spend does not jump to Rs 43,802). A payment within 20% of the amount owed clears it. A payment on day 29 of the previous month for a due on day 3 is found. | Confirmed in running UI | VQ-5.png |
| FX-07 | VP-1, P0-09, P1-12 | Home Left to spend, Plan "left" bills | Seed Left to spend is Rs 44,302, not the Rs 43,653 in the P0-09 Accept. `promised()` excludes card-paid bills from the plain total (line 1813) and counts them only in a card due. Card due 8 Aug is past and Streamly (Rs 649, card, due 24 Aug) is due later, so Rs 649 falls out of Promised for the whole month. Plan prints "5 left" next to an amount that covers 4 bills (line 3568). | Per decision FX-07 (log, follows D-20): keep Left to spend as computed (Rs 44,302 on the seed). Show the rule on screen: "Card-paid bills count when the card is due". The user can change a card's due day in Edit account. Make the Plan "N left" count and the Plan amount describe the same set of bills. | Plan "N left" equals the number of bills inside the amount shown. Left to spend on the seed is Rs 44,302 (available minus Promised minus Rs 2,000), the explain sheet lists every line, and the text "Card-paid bills count when the card is due" is visible on screen. A card's due day can be changed in Edit account. | Confirmed in running UI (figures Rs 4,898 and Rs 44,302). The Plan count mismatch is by code reading only. | none |
| FX-08 | VP-2, Q-4, P0-11 | Bill auto-match | `autoMatch` is confined to the calendar period of the payment date (lines 1781-1788). Rent due 1 Sep paid 28 Aug (4 days early) gives no match. Phone due 28 Aug paid 3 Sep (6 days late) gives no match. The Aug phone bill then shows overdue and Sep rent upcoming although both were paid. | Also test the due dates of the previous and next period and pick the nearest within 7 days and 20%. | Rent due 1 Sep paid on 28 Aug is matched. Phone due 28 Aug paid on 3 Sep is matched. 8 days and 20.08% still do not match. | Confirmed by code reading only | none |
| FX-09 | VP-4, D-22 | Transaction detail > Duplicate to today | `Object.assign({}, t, {...})` (line 4571) copies `commitmentId`, `groupId`, `splitOf`, `backOf`. Duplicating the Aug EMI gives 3 rows in group G8, and deleting the original now deletes the copy and the interest too. Duplicating Rent gives a second `c_rent` row. | Strip `commitmentId`, `groupId`, `splitOf`, `backOf` and `loanId` from the copy (keep `excludeFromTypical` if wanted). | Duplicate the EMI: the copy has no group; deleting the original removes only the original and its interest. Duplicate Rent: no second linked row for the bill. | Confirmed by code reading only | none |
| FX-10 | VB-4, VP-5, Q-2, P0-04 | Settings > Your data > Erase everything | Copy says "Every transaction, account, bill and limit on this device is removed". Code clears only `txs` (line 2523). After Erase: transactions 0, accounts 7, bills 8, limits 5, categories 18 remain. Home shows Left to spend -Rs 56,898 with Money Rs 0. No typed confirmation and no backup prompt (Q-2 asked for both). | Per decision FX-10 and Q-2: Erase clears accounts, bills, limits and transactions, as the copy says, then shows the empty first-run state. Keep or add the typed confirmation and the backup prompt per Q-2. | After Erase: transactions, accounts, bills and limits are all 0 and the empty first-run state shows. Left to spend is not negative with no money (see FX-28). A typed confirmation and a backup prompt appear before the erase runs. | Confirmed in running UI | P0-04_erase_home.png |
| FX-11 | VB-1 | Home, Accounts, Plan on "First week only" and "Nothing recorded yet" datasets (and after Erase) | Money available -Rs 1,22,697, Left to spend -Rs 1,86,543, Salary bank -Rs 1,29,425 on First week. Nothing recorded: -Rs 1,18,132 and -Rs 1,78,380. `S_bank` start entry Rs 1,27,425 is applied as a negative balance. | Per decision FX-11: fix the sample data for "First week only" and "Nothing recorded yet" so balances are sensible. No logic change. Re-test both from a fresh load. | On both datasets Home, Accounts and Plan show no negative balance and no negative Left to spend (no -Rs 1,86,543) caused by the start entry. The app logic is unchanged. | Confirmed in running UI | VB-1_firstweek_home.png |
| FX-12 | VR-2, P1-26, D-27 | Widget screen preview | `showFigures` is `widgetBalance === true \|\| widgetSpent === true` (line 3976), and both figures print together. With both toggles Off: no figures. With only "Spent this month" On: preview shows "Money available Rs 51,200" and "Spent Rs 83,072". The toggle does not control its own figure. | Show the balance only when `widgetBalance` is true and Spent only when `widgetSpent` is true. Hide the figures block only when both are off. | Only "Spent this month" On shows Spent and no Money available. Only "Money available" On shows the balance and no Spent. Both Off shows no figures. | Confirmed in running UI | VR-2.png |
| FX-13 | VR-12, D-07 | Category screen monthly column labels | Label is `'Rs ' + Math.round(m.amt/100000) + 'k'` (line 3549). Entertainment labels: "Rs 0k, Rs 0k, Rs 0k, Rs 1k, Rs 0k, Rs 0k" (Mar to Aug). This is the bug D-07 names. | Use `this.money(m.amt)` for the label, or hide labels that do not fit. | Entertainment columns show full amounts (for example Rs 331, Rs 1,033) or no label. No "Rs 0k" appears. | Confirmed in running UI | VR-12.png |

### P1

| ID | Sources | Screen | What is wrong | Required fix | Acceptance check | Status | Screenshot |
|---|---|---|---|---|---|---|---|
| FX-14 | VQ-2, P1-06 | Reports > What changed > "See the transactions" | The button calls `this.drill([]); this.setFilter({categoryId, period:'this'})` (line 3489). `drill([])` adds nothing, so the stack stays `reports > r04` and the screen does not change. `state.filter.categoryId` goes from null to `eating_out`, so the Transactions tab opens pre-filtered ("16 transactions . Rs 12,171 spent"). The changelog claim that the Transactions tab keeps its own filter is false for this button. | Use `this.drill([{ n: 'txlist', filter: { categoryId: un[0].id, period: 'this' } }])`, as `seeTx` does (line 4591). | Tap the button: the app opens a transaction list for Eating Out this period. The Transactions tab's own filter is unchanged. Depends on FX-01. | Confirmed in running UI | VQ-2.png |
| FX-15 | P1-08, P1-08a | Reports hub or Overview | R-02 "Where it goes" needs 4 taps (Reports > Overview > multi-month chip > Period breakdown row). The month view of Overview has no link to R-02. The Accept needs 3 taps. | Per decision P1-08a: add a direct link to "Where it goes" on Overview or on the Reports hub. | "Where it goes" opens in 3 taps or fewer from the Home tab. | Confirmed by code reading only | none |
| FX-16 | D-11a, D-11 revised | Add sheet at 320 x 568 | At 320 x 568 the app area is 320 x 504. Kinds, amount and 3 categories + All show. "Paid from" and "More" are below the fold. Body scrolls 228/163 with no scroll cue. No horizontal overflow (320/320). | Per decision D-11a: add a scroll cue (a partly visible row or a fade) so users can see "Paid from" and "More" below the fold. | At 320 x 568 a cue is visible, scrolling reaches "Paid from" and "More", and there is no horizontal overflow. At 360 x 640 nothing changes (it already fits). | Confirmed in running UI | D-11_320x568.png |
| FX-17 | VQ-6, P1-58, D-20 | Card without a due day; "Add an account first" sheet | A card with no `dueDay` (option "Not set" says it is left out of Left to spend) or with a recurring move is skipped by `cardDues` (line 1802), and `plain` excludes all card bills (line 1813). Rs 30,000 owed on such a card leaves Left to spend at Rs 44,302 and bills at Rs 4,898. A card made through "Add an account first" has no due day. | Per decision FX-17 (with D-10, D-20): a card's due day is required when the card is added (including from "Add an account first"). It stays editable later in Edit account. Remove the "Not set" option from the card due-day picker. The picker must accept any day (D-10), not only presets. Existing cards without a due day are prompted once to set one. | A card cannot be saved without a due day, and the picker has no "Not set" and accepts any day 1 to 31. A card created from "Add an account first" has a due day, so its owed amount and bills are not dropped from Left to spend. An existing card without a due day is prompted once. | Confirmed in running UI | VQ-6.png |
| FX-18 | VP-3, Q-4 | "Record this payment now" and bill presets | `a.commitmentId` is trusted without checking that the month is unpaid (lines 2149, 4169, 2590). Two "Record this payment now" saves in August give 2 linked rows for `c_net`. Promised and history double up. | Warn "already paid this month", or do not link the second row. | Save "Record this payment now" twice in one month: the second row is not linked, or a warning is shown. Promised counts the bill once. | Confirmed by code reading only | none |
| FX-19 | VP-10, D-22, P0-13 | "Delete this part?" sheet | The part-delete sheet (lines 2505-2511) names only the part and the total. "Delete all" and "Only this part" can also remove refunds or a grouped interest row. The single-row sheet lists every linked record (lines 2513-2520). Spec C-07 asks the sheet to name every linked record. | List the linked refunds and interest rows that "Delete all" and "Delete only this part" would remove, like the single-row delete sheet does. | For a part that has a refund or an EMI interest row, the sheet names each linked record. | Confirmed by code reading only | none |
| FX-20 | VR-9, P1-16 | Comparison gate (`qualMonths`) | After P1-16 `qualMonths()` counts a partial first period with 10 or more entries as complete. Entries cut to start 20 Jul (history 28 days): `qualMonths()` = 1 (a 12-day part month counts as complete) while `canCompare` is false. | Exclude the period that contains `firstDate()` from `qualMonths()` unless it starts on or before that date. | History from the 20th with month start 1: `qualMonths()` does not count the part month. | Confirmed in running UI | none |
| FX-21 | VR-10, Q-9, P1-28 | Plan > Regular bills > "Looks like a regular bill" | `draftCommitment` is not cleared on Back. Add a monthly "Cloudbox" pattern, open it (editor opens with `detected:true`), go Back, tap the FAB "Add a regular bill": the editor opens pre-filled with Cloudbox, Rs 799, Subscriptions, day 10. Add then links old history. | Clear `draftCommitment` on leaving `newcommitment`, or when opening it from the FAB. | After Back from a detected bill, the Plan FAB opens an empty editor with `detected:false`. | Confirmed in running UI | VR-10.png |
| FX-22 | VR-3, P1-18 | Drifting categories, Seasonal categories | A decrease uses `--pos` green for amount and dot (lines 4200-4201, 4256-4257). Measured: "-Rs 983" (Food & Groceries) is rgb(44,120,87) = `--pos`; increases are amber rgb(147,96,25). Seasons "Eating Out -Rs 1,502" is the same green. The P1-18 Accept says "less than typical renders neutral". | Use `--n800` (and a neutral dot such as `--n500`) when `diff <= 0`, as What changed does (line 3493). | Decreases on both screens use the neutral colour. Increases stay amber. | Confirmed in running UI | VR-3.png |
| FX-23 | VR-4, VR-5, P1-20 | Trend chart columns, category monthly columns, heatmap | Hit boxes under 48. At 396 wide the 6 trend columns are 45 x 150; at 360 they are 39 x 150. Category monthly columns 43 x 150 at 360. Heatmap cells 43 x 48 (36 cells) at 360. Home figure buttons and heatmap cells have 0 dp gap, not 8 (lines 115-118). The changelog says "48 dp for 6 points or fewer" and "no control under 48 apart from the trend columns". Both are wrong. | Make columns at least 48 dp wide (limit points to what fits, compute from measured width, make them scroll at 48 dp each, or extend the hit area). Fix the 0 dp gaps. Correct the changelog wording. | At 360 x 576 and 396 x 812 no `button`, `input` or `[role]` on the audited screens is under 48 x 48. | Confirmed in running UI | VR-4.png |
| FX-24 | VR-8, D-12 | Home hero, type tokens | `--type-hero` (36px) and `--type-stat` (19px) are defined but never used with `var(--type-*)`. Home hero computes to 40px (line 113). D-12 says hero is 36. | Per decision FX-24: the Home hero stays 40 px. Report heroes use `var(--type-hero)` (36). Stats use `var(--type-stat)` (19). Apply the tokens where they are used. | The Home hero computes to 40 px. Report hero figures compute to 36 px and stat figures to 19 px. These sizes come from `var(--type-hero)` and `var(--type-stat)`, not literals. | Confirmed in running UI | none |
| FX-25 | VB-7, P1-09, D-11 | Tab bar and Transactions at 200% text | At 200% (simulated): tab labels run together ("HomeTransactionsReportsPlanSettings"), the FAB sits over the list, the sticky summary stays at top 39 while the app bar is taller (constants 39 and 61 px) and "30 transactions . 53,072 spent" is half hidden. The P1-09 claim passes only at 100%. | Let tab labels wrap or truncate. Make the sticky offset follow the measured app bar height instead of the constants 39 and 61. | At 200% text the tab labels are separate and readable, the summary is fully visible, and the FAB does not hide list content. Confirm on a real device (the test was simulated). | Confirmed in running UI | P1-09_200pct.png |

### P2

| ID | Sources | Screen | What is wrong | Required fix | Acceptance check | Status | Screenshot |
|---|---|---|---|---|---|---|---|
| FX-26 | VB-3, P1-01, D-11 | Add sheet at 360 x 640, blocked Save | Save with no category: the amber error line sits at y 272-330, the keypad starts at y 296, body scrolls 294/235. Only a sliver of the alert shows. Focus moves to the first category tile but the message is out of view. | Scroll the error into view, or show it above the keypad, or put the reason in the visible Save button text ("Choose a category" is already the aria-label). | At 360 x 640 after a blocked Save the reason is fully visible without scrolling. | Confirmed in running UI | D-11_360x640_error.png |
| FX-27 | VB-2 | Home on "Nothing recorded yet" | Insight "Streamly went up to Rs 649. It was Rs 499 until 24 Jul. That is Rs 1,800 more over a year" appears with zero transactions. | Gate price-change insights on recorded payments. | With zero transactions no price-change insight shows. | Confirmed in running UI | VB-2_empty_home.png |
| FX-28 | VB-11 | Home with zero accounts | Left to spend is -Rs 2,000 ("I don't know your bills yet") with no money recorded. The buffer makes it negative. | Per decision FX-28: with zero accounts show no Left to spend. Show an "Add an account" prompt instead of the -Rs 2,000 buffer figure. | With zero accounts Home shows no Left to spend figure and shows an "Add an account" prompt. | Confirmed in running UI | none |
| FX-29 | VQ-8, P1-02 | Transaction > Edit > x with nothing changed | Pressing x on an untouched Edit sheet shows "Discard this entry? What you typed has not been saved." because `digits` is pre-filled (lines 2327, 4453). | Compare against the loaded values (dirty flag) before prompting. | Open Fibernet > Edit > x with no change: the sheet closes with no prompt. After a change the prompt appears. | Confirmed in running UI | VQ-8.png |
| FX-30 | VQ-9, P1-03, P1-04, D-21 | Add sheet calculator and time picker | (a) Typing `34.` shows Rs 34.00 and the live region reads "Amount Rs 34.00", no sign of the dot. (b) `100/0` then `=` gives Rs 100.00 with no message. (c) `99999999x99999999` then `=` shows Rs 9,99,99,99,80,00,00,000.00 (no cap). (d) At 3:59 pm today, 11:30 PM offers "Set 11:30 pm" (time later than now today). | Cap calculated results to 9 or 12 digits. Show the raw typed text while editing. Say why a divide by 0 was ignored. Do not allow a time later than now today (the report lists this under the same row). | Each of (a) to (d) behaves as described in the fix. | Confirmed in running UI | none |
| FX-32 | VR-6, P1-24 | Colour palette sheet and other single-choice lists | The 8 option rows have no `role`, `aria-checked`, `aria-selected` or `aria-current`, and no radiogroup. The choice shows only by bold and a CSS check. Same pattern for month start, lock delay, account and category pickers. | Give option rows `role="radio" aria-checked` inside a `radiogroup`, like the other segments. | The palette sheet rows have `role=radio` with `aria-checked` and a radiogroup parent. | Confirmed in running UI | none |
| FX-33 | VR-7, P1-22 | Trend chart x-axis, 12 points | Labels use `justify-content:space-between`. For Two years, Overview, 1 Year: labels Sep, Nov, Jan, Mar, May, Jul, Aug sit at x = 526, 569, 611, 654, 698, 739, 779; the points sit at about 517, 566, 616, 665, 714, 763, 789. Drift grows to about 24 px. | Position labels at the same left % as their points. | Each x label is centred under its point at 12 points. | Confirmed in running UI | VR-7.png |
| FX-34 | VR-11, P1-30 | Needs-months copy and gates | The gate uses literals (`enoughBaseline()` has `>= 3` at line 1602, `compareLine` has `2` at lines 4578 and 4580) instead of `BASELINE_MONTHS`. `needMonthsLine()` could say "0 more complete months" while history is under 30 days. The copy "comparisons start after N more months" at one month of data is also wrong because a vs-last-month line starts earlier. The UI run could not produce the "0 more" case. | Derive the gates from `BASELINE_MONTHS`. When `monthsToGo()` is 0 but `canCompare()` is false, name the day condition. | Changing `BASELINE_MONTHS` changes both the copy and the behaviour. No "0 more complete months" string is possible. | Not reproduced | none |
| FX-35 | VR-13 | "So far" bar fill | `var(--n300)` is not defined in any palette (lines 14-29). `getComputedStyle(app).getPropertyValue('--n300')` is the empty string; `--n200` is #DCE0E6. The fill is invalid and shows no colour (line 4246). | Use `--n200` or define `--n300`. | The "so far" bar has a visible fill in all 16 pairs. | Confirmed in running UI | none |
| FX-36 | VB-8 | Lock screen | While the lock screen shows, the app beneath still has 53 buttons in the DOM, none `inert` or `aria-hidden`, and `innerText` reads the Home figures. | Mark the app content `inert` / `aria-hidden` while locked, to prove the intent. | While locked, the app content has `inert` or `aria-hidden` and is not reachable by keyboard. | Confirmed in running UI | P0-17_locked.png |
| FX-37 | VB-9 | Delete part sheet | Text reads "Rs 600 Eating Out is one of 2 parts of a Rs 1,605 payment at Cafe Nine on Today." | Use "today" in lower case, or "on 16 Aug". | The sheet reads "on 16 Aug" or "today". | Confirmed in running UI | VB-toast-over-delete-sheet.png |
| FX-38 | VB-10, D-11 | Add sheet category tiles | Tile labels truncate at 360 ("Food & Gr...", "All catego...") and at 320. | Shorten to "More" or "All", or allow two lines. | No tile label is cut at 360 x 640. | Confirmed in running UI | D-11_360x640.png |
| FX-39 | VB-12 | Dataset switch (Tweaks, prototype only) | Switching dataset after changing data keeps new categories, accounts and bill edits but resets transactions. A merged category then left 12 transactions pointing to a deleted category (a second "Other" row, Rs 3,548 in Overview). The report says this is an `applyDataset` artefact, not a merge bug. | Reset every collection in `applyDataset`. | After a dataset switch no orphaned category ids exist. | Confirmed in running UI | none |
| FX-40 | VP-7, P0-16 | Home unusual card > "Mark as a one-off" | The changelog says it "now also clears an unusual card". It marks the single largest row in the category. On the default seed the card stays (Eating Out is still Rs 7,819 above its usual range after removing that row). The user taps and sees only a toast. | Say what was marked (name the row, per P1-55 "choose the transaction"), or word the toast so it is clear the card may stay. Correct the changelog claim. | The toast names the marked row and does not imply the card will clear. | Confirmed by code reading only | none |
| FX-41 | VP-9 | Id generation (prototype) | Ids use `Date.now()` (lines 2141, 2154, 4566, 4571, 2993). Two saves in the same millisecond share an id (frozen-clock harness: both `U1700000000000`). Not reachable by hand. | Add a design note that a real build needs unique ids. | The design note exists. | Confirmed by code reading only | none |
| FX-42 | VQ-11 | Changelog wording and doc 30 figures | The changelog sentence "Spent is still Rs 53,072" is wrong. With the "Office canteen" rows removed Aug Spent is Rs 51,272; with them Rs 53,072 (difference Rs 1,800). The prototype side panel says "323 seeded transactions" while the state holds 327 (the panel showed 322, 323, 326 and 889 on different loads). | Correct the changelog wording. Correct the side-panel count. (The change list re-quote is in section 4 and is the owner's edit.) | The changelog says Spent rose by Rs 1,800 to Rs 53,072. The side panel count matches the state. | Confirmed in running UI | none |
| FX-43 | VQ-12, P1-10 | Changelog note on reliability | The changelog says "History cut at 1 Aug: 'A few things may be missing'". With entries before 1 Aug removed (16 days, `canCompare` false) Home says "Just starting - after a month of recording I can start comparing". A cut at 1 Jul (47 days) gives "Your spending picture looks reliable". "A few things may be missing" never appears for these cuts. | Re-test and fix the changelog note. | The changelog names a cut that really produces that sentence. | Confirmed in running UI | none |
| FX-44 | P0-02 row note | Payee save vs fill | Payee match on fill is case-insensitive (line 2919) but the save-time update is case-sensitive (line 2169), so "fresh mart" creates a duplicate payee row. | Make the save-time match case-insensitive. | Saving "fresh mart" when "Fresh Mart" exists does not create a second payee row. | Confirmed by code reading only | none |
| FX-45 | P0-06 row note | Money display with paise off or on | With paise off, each row and total is rounded separately, so rows can differ from the total by Rs 1 (0.40 + 0.40 shows Rs 0 + Rs 0 against Rs 1). With paise on, whole-rupee amounts print without ".00", so one list can mix Rs 1,060 and Rs 199.99. The Accept says rounded display is identical in rows and totals. | Per decision FX-45: totals are exact and rows round for display. No code change. Reword the P0-06 Accept to say that a Rs 1 difference between rows and the total is expected when paise are off. With paise on, whole-rupee amounts print without ".00" (existing behaviour; no fix row says otherwise). | The P0-06 Accept says a Rs 1 difference between rows and the total is expected when paise are off. The code is unchanged. | Confirmed by code reading only | none |
| FX-46 | P0-13 row note | Delete the bill-linked first part of a split | Deleting the bill-linked first part leaves the other part unlinked, so Rent shows overdue while Rs 3,000 remains. The sheet does not say this. | State in the sheet what happens to the bill link. | The delete sheet tells the user the bill will show unpaid. | Confirmed by code reading only | none |
| FX-47 | P1-10 row note | Home reliability | When there are gaps, Home shows the sentence, a button, and the same fact as an insight card (line 4612): three signals for one fact. `showReliability` (line 4679) is now unused. | The report gives no fix. Verifier note only; consider showing the fact once. | One gaps signal on Home. | Confirmed by code reading only | none |
| FX-48 | P1-02 row note | Sheet handle | The swipe handle hit area is only about 18 px tall (line 568). The swipe works with a mouse drag of 96 px. | The report gives no fix. Verifier note only; consider a larger hit area. | Handle hit area is not 18 px tall. | Confirmed by code reading only | none |
| FX-49 | P0-05 row note | Category merge targets | Only 5 merge targets are listed (line 4122 `slice(0,5)`, old behaviour). | The report gives no fix (it notes this is old behaviour). Verifier note only. | Decide whether 5 targets is intended. | Confirmed by code reading only | none |
| FX-50 | P1-58 row note | Archived account and edit fallback | `hasAcc` returns false for an archived account, so editing an old transaction on an archived account opens "Add an account first". `editTx` (line 4455) still falls back to `'bank'` when `t.from` is empty. | Treat an archived account as present when editing an old transaction. Review the `'bank'` fallback. | Editing a transaction on an archived account opens the edit sheet. | Confirmed by code reading only | none |
| FX-51 | P1-28 row note | Detected bill link query | The link query is by payee only (line 3658). The "N payments" in the note counts all `out` rows with that payee, including ones detection excluded. It ignores the 7-day and 20% rule. | Use the same match rule as `autoMatch` when linking history and counting payments. | The count and the links equal the payments the rule would match. | Confirmed by code reading only | none |

### Closed without change

| ID | Sources | Screen | Reason |
|---|---|---|---|
| FX-31 | VQ-10, P1-13 | What changed, "All other categories" row | Decision FX-31 (log): the owner chose to keep the current wording. No change requested. The verifier's concern (the remainder hides the gap between a median of totals and a sum of medians) is accepted as is. |

### Accepted as is (no fix)

| Decision | Rule | Action |
|---|---|---|
| P1-19a | Darker Warm (#95542A) and Midnight (#7F6220) light accents are accepted. | No fix. Keep them. |
| P1-06a | Accounts in two places until P1-51 (phase 2B) is an accepted interim state. | No fix. Do not touch. |

### Decisions made for these fixes

| FX | Decision | Answer (from `32_Decisions_Log.md`) |
|---|---|---|
| FX-03 (VB-6) | Undo toast covering sheet buttons | Clear the Undo toast when any sheet or dialog opens. |
| FX-05 (P0-15c) | Baseline for `unusual()` | Use the same months-with-spending median everywhere. |
| FX-06 (P1-12a) | When a card due counts as paid | A payment within 20% of the amount due, 5 days before to 7 days after the due day. |
| FX-07 | Left to spend with card-paid bills | Keep Rs 44,302. Show the rule "Card-paid bills count when the card is due". The user can change a card's due day in Edit account. |
| FX-10 | Erase everything | Clear accounts, bills, limits and transactions, then show the empty first-run state. |
| FX-11 | Early-stage sample data | Fix the sample data so balances are sensible. No logic change. |
| FX-15 (P1-08a) | Path to "Where it goes" | Add a direct link on Overview or the Reports hub. |
| FX-16 (D-11a) | Add sheet at 320 x 568 | Add a scroll cue (partly visible row or a fade). |
| FX-17 | Credit card due day | Required when the card is added. Editable later in Edit account. Remove "Not set". Picker accepts any day (D-10). Existing cards without one are prompted once. |
| FX-24 | Type sizes in use | Home hero 40. Report heroes `--type-hero` 36. Stats `--type-stat` 19. Apply the tokens. |
| FX-28 | Left to spend with zero accounts | No Left to spend. Show an "Add an account" prompt. |
| FX-31 | "All other categories" row | Keep the current wording. No change (see "Closed without change"). |
| FX-45 | Paise rounding rule | Totals are exact and rows round for display. Reword the P0-06 Accept. No code change. |

## 4. Stale figures in the change list

Do not edit `30_Mobile_Design_Change_List.md` from this list. The new sample data (Office canteen rows, card due day 8, EMI as a recurring move) made these figures wrong.

| Old value in doc 30 | New value | Where in doc 30 | Evidence |
|---|---|---|---|
| Left to spend Rs 43,653 (51,200 - 5,547 - 2,000) | Rs 44,302 (51,200 - 4,898 - 2,000) | Line 49 (P0-09 table row), line 197 (P0-09 Accept) | VP-1, browser P0-09 and P1-12 rows. Line 195 quotes Rs 43,653 as old-state history. |
| Promised: Rs 649 on Home, Rs 5,547 in total | Bills still to come Rs 4,898; `promisedAll` Rs 5,547 is no longer what Left to spend uses | Line 378 (P1-12 Status) | VP-1 |
| Last 3 Months Spent Rs 1,82,164 | Rs 1,87,564 | Line 204 (P0-10 Status), line 206 (P0-10 Accept) | VP verifier P0-10; browser Rs 1,87,763.99 including a Rs 199.99 test entry. |
| Net +Rs 1,57,278 ("You earned Rs 1,57,278 more than you spent") | +Rs 1,51,878 | Lines 204, 206; also line 1053 (finance verifier note) | VP verifier P0-10; browser +Rs 1,51,678.01 with the test entry. Income Rs 3,39,442 is unchanged. The gap is Rs 5,400 (12 canteen rows of Rs 450). |
| August Spent Rs 51,272 (Overview "Money spent") | Rs 53,072 (+Rs 1,800 for 4 canteen rows) | Line 396 (P1-14 Status) | VQ-11, browser. |
| "Where it goes of Rs 50,572 spent" and "Spent Rs 50,872 after a Rs 400 refund" | Not re-measured. [Likely] Rs 52,372 and Rs 52,672 (the phase 2A changelog already gives Rs 52,672 after the refund). | Line 396 | Changelog P1-14 row; derived, not measured. |
| Eating Out "Rs 6,059 ... 6 months" against "Typical Rs 2,552" | Rs 12,171 spent by day 16 against typical Rs 4,352 (6 months) | Line 387 (P1-13 Status) | Browser P0-15a row, VQ-11. |
| What moved +7,819 +1,280 +574 -433 = +Rs 9,240 against headline +Rs 5,702 (Rs 3,538 unexplained, no "other" row) | Eight rows: +7,819, +1,280, -1,200, -650, +574.50, -433.50, -280.50, All other -2,107.50 = +Rs 5,002; Overview headline "Rs 5,002 more than a typical month by this day" | Line 387 | Browser P1-13 row. |
| Side panel "323 seeded transactions" (prototype text, not doc 30) | State holds 327; panel showed 322, 323, 326 and 889 on different loads | Prototype side panel | Browser VQ-11 row. |

Still valid (checked in the new data): Food & Groceries Rs 5,825 spent against a month-to-date median of Rs 4,545 (line 249); Income Rs 3,39,442 for Last 3 Months; Money available Rs 51,200.

## 5. Claimed Done but not fully done

| Changelog row (status claimed) | What the verifiers found | Fix |
|---|---|---|
| Phase 2A P1-06 (Done) | `txlist` is blank (VQ-1); What changed button is a no-op and changes the Transactions tab filter (VQ-2). The claimed "16 rows" and "Transactions tab kept its filter" are false for these paths. | FX-01, FX-14 |
| Phase 2A P1-12 (Done) | A Rs 500 payment cleared a Rs 30,000 due (VQ-5). Cards without a due day drop their dues (VQ-6). A card-paid bill after the card's due day drops out (VP-1). | FX-06, FX-17, FX-07 |
| Phase 2A P1-13 (Done) | Overview hero and multi-month use another baseline than Home (VQ-3, VP-6). "All other" row is a plug (VQ-10). | FX-04 (FX-31 closed without change) |
| Phase 2A P0-15a (Done) | Wording "Spent is still Rs 53,072" is wrong (VQ-11). | FX-42 |
| Phase 2A P0-15b (Done) | `unusual()` still uses all months (VQ-4, VP-8). Now decided as P0-15c. | FX-05 |
| Phase 2A P1-10 (Done) | The test note "A few things may be missing" cannot happen for a 1 Aug cut (VQ-12). | FX-43 |
| Phase 2A P1-08 (Partly) | Stated honestly. Decision P1-08a now requires the direct link. | FX-15 |
| Phase 2A P1-16 (Done) | Side effect: a part month counts as complete (VR-9). | FX-20 |
| Phase 2A P1-18 (Done) | Drifting and Seasonal screens still colour decreases green (VR-3). | FX-22 |
| Phase 2A P1-19 (Done) | Toast Undo fails 4.5:1 in 13 of 16 pairs (VR-1). Type tokens unused and Home hero is 40 px (VR-8). | FX-02, FX-24 |
| Phase 2A P1-20 (Partly) | "48 dp for 6 points or fewer" is false (VR-4). Heatmap 43 x 48 and category columns 43 x 150 at 360 (VR-5). The claim "no control under 48 apart from the trend columns" is wrong. | FX-23 |
| Phase 2A P1-21 and P1-21 extension (Done) | Undo contrast (VR-1). The toast covers sheet buttons (VB-6). | FX-02, FX-03 |
| Phase 2A P1-22 (Partly) | 12-point labels drift up to 24 px (VR-7). | FX-33 |
| Phase 2A P1-24 (Done) | Single-choice lists have no radio roles (VR-6). The false-values print was refuted (no problem). | FX-32 |
| Phase 2A P1-26 (Done) | Toggles do not control their own figure (VR-2). | FX-12 |
| Phase 2A P1-28 (Done) | `draftCommitment` is not cleared on Back (VR-10). | FX-21 |
| Phase 2A P1-30 (Done) | Gate literals (VR-11, not reproduced in the UI). | FX-34 |
| Phase 2A P1-02 (Done) | Untouched Edit shows a Discard prompt (VQ-8). | FX-29 |
| Phase 2A P1-03 and P1-04 (Done) | Calculator and time edges (VQ-9). | FX-30 |
| Phase 2A P1-09 (Done) | Passes at 100%. At 200% (simulated) the summary is cut and tab labels run together (VB-7). | FX-25 |
| Phase 2A P1-58 (Done) | A card made by "Add an account first" has no due day (VQ-6). | FX-17 |
| Phase 2A D-11 revised (Done) | 360 x 640 fits with no scrolling, but the blocked-Save message is hidden (VB-3) and tile labels truncate (VB-10). No scroll cue at 320 x 568 (D-11a). | FX-26, FX-38, FX-16 |
| Phase 1 P0-04 (Done) | "Erase everything now resets every tab stack and lands on Home's empty state" holds, but Erase clears only transactions (VP-5, VB-4). Early datasets show negative balances (VB-1) and a stale insight (VB-2). | FX-10, FX-11, FX-27 |
| Phase 1 P0-09 (Done) | The Accept figure Rs 43,653 is not what the app shows (VP-1). | FX-07 |
| Phase 1 P0-10 (Done) | The Accept figures Rs 1,82,164 and +Rs 1,57,278 are stale (new data). | Section 4 |
| Phase 1 P0-11 (Done) | Match fails across a month end (VP-2). A second "Record this payment now" double-links (VP-3). | FX-08, FX-18 |
| Phase 1 P0-12 to P0-14 (Done) | Duplicate to today copies link fields (VP-4). Part-delete sheet does not name linked refunds or interest (VP-10). | FX-09, FX-19 |
| Phase 1 P0-16 (Done) | "Mark as a one-off now also clears an unusual card" is false on the default seed (VP-7). | FX-40 |
| Phase 1 P0-17 (Done) | The 15-minute choice cannot be simulated. App content behind the lock is reachable (VB-8). | FX-36 |

## 6. Verified OK and not tested

### Verified OK (confirmed in both code and the running UI unless noted)

| Item | Evidence |
|---|---|
| P0-02 / P0-03 | Type 340, tap Eating Out, Save: 2 non-digit taps (396 x 812). New category "Pets" returns to the add sheet with Rs 340.00 and Pets selected. |
| P0-05 | Merge Shopping into Eating Out: confirm sheet, toast, Undo restores 12 transactions and the Rs 5,000 limit. Unique ids for "Trip 1" and "Trip 2". |
| P0-06 | 199.99 shows the same in toast, row, detail and totals. No "-Rs 0". |
| P0-08 | Found-money Rs 500: Received up Rs 500, Spent unchanged (cash check). The mirror case was not run. |
| P0-09 | Money available Rs 51,200 and the explainer rows add up (Rs 51,700 after the test entry). |
| P0-11 | "Fibernet" Rs 1,199: matched, bills Rs 4,898 to Rs 3,699, Left to spend unchanged at Rs 44,802. City Power (24% off) and Cellone (12 days) are not matched. |
| P0-12 / P0-13 / P0-14 | Bill-linked edit keeps links; EMI edit keeps one move and one interest row; delete-one-part sheet and Undo work; EMI delete removes both rows. |
| P0-15 | Home shows "Eating Out ... Rs 12,171 ... typical Rs 4,352" by default. |
| P0-17 | Lock delays, 59 s and 61 s, cancel, wrong finger and fallback all work. Cold start locks. |
| P1-02 | Mouse drag of 96 px on the handle closes the add sheet. |
| P1-12 | Seed Bills still to come Rs 4,898, Left to spend Rs 44,302. A card due on the 20th with Rs 30,000 owed is counted once. |
| P1-13 | "What moved" rows add to +Rs 5,002. |
| P1-16 | Month start 1, 5, 15, 25: calendar total equals `spent()` (5,307,200; 2,875,400; 336,500; 7,315,400 paise). |
| D-11 | 360 x 640 fits with no scrolling and no horizontal overflow. Landscape pins Save. The simulated 200% add sheet keeps keypad and Save pinned. 320 x 568 has no overflow (cue missing, FX-16). |
| ARIA false values | Tabs, chips, radios and switches print `aria-*="false"`. Refuted as a concern. |
| Console | No JS exception on 11 page loads. 122 known template and favicon errors only. No error on empty datasets or after Erase. |

### Not tested

- TalkBack and VoiceOver output, toast live-region behaviour, real touch swipe, real Android sp scaling.
- Real device scaling. 130% text on the add sheet. The seven earlier D-11 claims at 412 x 828.
- P1-15 day-8 case (the clock is fixed at 16 Aug).
- P1-13 T-40 (a yearly-bill payment in a qualifying month): the seed has none.
- P0-16 "each of the 5 kinds": only 2 kinds are eligible on the seed.
- P0-17 15-minute delay: the simulator has only 59 s and 61 s buttons.
- P0-07 (16-pair contrast on-accent in the browser), P0-08 mirror (T-60), P0-10 6-month, 1-year and private-off equality, P0-12 split, refund and correction edits, P0-13 split of a refunded purchase, a bill payment and a one-off, "split of a bill payment" bill-link rule: not run. They are unverified, not passing.
- Phase 1 accent values for Warm and Midnight (needs the phase 1 file).
- Contrast of tokens other than the toast Undo, in the browser (the code-reading table matches the browser to two decimals for the toast only).
- P0-02 "median of at most 3 non-digit taps" at 360 x 640 (3-tile grid), not run.
- P0-01 130% text and the arithmetic margin at 360 x 640 (about 3 px by code; the browser run passed).

## 7. Traceability

Every VP, VQ, VR and VB ID from the four reports.

| Source ID | Maps to | Note |
|---|---|---|
| VP-1 | FX-07 | |
| VP-2 | FX-08 | |
| VP-3 | FX-18 | |
| VP-4 | FX-09 | |
| VP-5 | FX-10 | Merged with VB-4 |
| VP-6 | FX-04 | Merged with VQ-3 |
| VP-7 | FX-40 | |
| VP-8 | FX-05 | Merged with VQ-4 |
| VP-9 | FX-41 | |
| VP-10 | FX-19 | |
| VQ-1 | FX-01 | |
| VQ-2 | FX-14 | |
| VQ-3 | FX-04 | Merged with VP-6, VB-5 |
| VQ-4 | FX-05 | Merged with VP-8 |
| VQ-5 | FX-06 | With decision P1-12a |
| VQ-6 | FX-17 | |
| VQ-7 | FX-02 | Same as VR-1 |
| VQ-8 | FX-29 | |
| VQ-9 | FX-30 | |
| VQ-10 | FX-31 | Closed without change (owner kept the wording) |
| VQ-11 | FX-42 | Stale figures in section 4 |
| VQ-12 | FX-43 | |
| VR-1 | FX-02 | |
| VR-2 | FX-12 | |
| VR-3 | FX-22 | |
| VR-4 | FX-23 | |
| VR-5 | FX-23 | |
| VR-6 | FX-32 | |
| VR-7 | FX-33 | |
| VR-8 | FX-24 | |
| VR-9 | FX-20 | |
| VR-10 | FX-21 | |
| VR-11 | FX-34 | Not reproduced in the UI. Code finding stays. |
| VR-12 | FX-13 | |
| VR-13 | FX-35 | |
| VR-14 | not an issue for this list | The report itself says no change for this item; month-start work is tracked under P1-52 and P1-53. Side check passed (grid equals Spent). |
| VB-1 | FX-11 | |
| VB-2 | FX-27 | |
| VB-3 | FX-26 | |
| VB-4 | FX-10 | Merged with VP-5 |
| VB-5 | FX-04 | Same root cause as VQ-3 |
| VB-6 | FX-03 | Decision recorded in the log |
| VB-7 | FX-25 | |
| VB-8 | FX-36 | |
| VB-9 | FX-37 | |
| VB-10 | FX-38 | |
| VB-11 | FX-28 | |
| VB-12 | FX-39 | Prototype-only artefact |

### Every fix id

All 51 FX ids with their sources. FX-31 is closed without change.

| Fix | Sources | Screen |
|---|---|---|
| FX-01 | VQ-1, P1-06 | Home insight "See the transactions"; Account > "See all in Transactions" |
| FX-02 | VR-1, VQ-7 | Undo toast (every screen) |
| FX-03 | VB-6, P1-21 | Any bottom sheet opened soon after an action (checked: "Delete this part?", "Change a linked amount?") |
| FX-04 | VQ-3, VP-6, VB-5 | Overview month hero, multi-month comparison, Reports hub, What changed, Home |
| FX-05 | VQ-4, VP-8, P0-15b, P0-15c | Home unusual card, What changed, category screen |
| FX-06 | VQ-5, P1-12, P1-12a | Left to spend, card dues (Plan, Home) |
| FX-07 | VP-1, P0-09, P1-12 | Home Left to spend, Plan "left" bills |
| FX-07 | Left to spend with card-paid bills | Keep Rs 44,302. Show the rule "Card-paid bills count when the card is due". The user can change a card's due day in Edit account. |
| FX-08 | VP-2, Q-4, P0-11 | Bill auto-match |
| FX-09 | VP-4, D-22 | Transaction detail > Duplicate to today |
| FX-10 | VB-4, VP-5, Q-2, P0-04 | Settings > Your data > Erase everything |
| FX-10 | Erase everything | Clear accounts, bills, limits and transactions, then show the empty first-run state. |
| FX-11 | VB-1 | Home, Accounts, Plan on "First week only" and "Nothing recorded yet" datasets (and after Erase) |
| FX-11 | Early-stage sample data | Fix the sample data so balances are sensible. No logic change. |
| FX-12 | VR-2, P1-26, D-27 | Widget screen preview |
| FX-13 | VR-12, D-07 | Category screen monthly column labels |
| FX-14 | VQ-2, P1-06 | Reports > What changed > "See the transactions" |
| FX-15 | P1-08, P1-08a | Reports hub or Overview |
| FX-16 | D-11a, D-11 revised | Add sheet at 320 x 568 |
| FX-17 | VQ-6, P1-58, D-20 | Card without a due day; "Add an account first" sheet |
| FX-17 | Credit card due day | Required when the card is added. Editable later in Edit account. Remove "Not set". Picker accepts any day (D-10). Existing cards without one are prompted once. |
| FX-18 | VP-3, Q-4 | "Record this payment now" and bill presets |
| FX-19 | VP-10, D-22, P0-13 | "Delete this part?" sheet |
| FX-20 | VR-9, P1-16 | Comparison gate (`qualMonths`) |
| FX-21 | VR-10, Q-9, P1-28 | Plan > Regular bills > "Looks like a regular bill" |
| FX-22 | VR-3, P1-18 | Drifting categories, Seasonal categories |
| FX-23 | VR-4, VR-5, P1-20 | Trend chart columns, category monthly columns, heatmap |
| FX-24 | VR-8, D-12 | Home hero, type tokens |
| FX-24 | Type sizes in use | Home hero 40. Report heroes `--type-hero` 36. Stats `--type-stat` 19. Apply the tokens. |
| FX-25 | VB-7, P1-09, D-11 | Tab bar and Transactions at 200% text |
| FX-26 | VB-3, P1-01, D-11 | Add sheet at 360 x 640, blocked Save |
| FX-27 | VB-2 | Home on "Nothing recorded yet" |
| FX-28 | VB-11 | Home with zero accounts |
| FX-28 | Left to spend with zero accounts | No Left to spend. Show an "Add an account" prompt. |
| FX-29 | VQ-8, P1-02 | Transaction > Edit > x with nothing changed |
| FX-30 | VQ-9, P1-03, P1-04, D-21 | Add sheet calculator and time picker |
| FX-31 | VQ-10, P1-13 | What changed, "All other categories" row |
| FX-31 | "All other categories" row | Keep the current wording. No change (see "Closed without change"). |
| FX-31 | VQ-10, P1-13 | What changed, All other categories row (closed without change) |
| FX-32 | VR-6, P1-24 | Colour palette sheet and other single-choice lists |
| FX-33 | VR-7, P1-22 | Trend chart x-axis, 12 points |
| FX-34 | VR-11, P1-30 | Needs-months copy and gates |
| FX-35 | VR-13 | "So far" bar fill |
| FX-36 | VB-8 | Lock screen |
| FX-37 | VB-9 | Delete part sheet |
| FX-38 | VB-10, D-11 | Add sheet category tiles |
| FX-39 | VB-12 | Dataset switch (Tweaks, prototype only) |
| FX-40 | VP-7, P0-16 | Home unusual card > "Mark as a one-off" |
| FX-41 | VP-9 | Id generation (prototype) |
| FX-42 | VQ-11 | Changelog wording and doc 30 figures |
| FX-43 | VQ-12, P1-10 | Changelog note on reliability |
| FX-44 | P0-02 row note | Payee save vs fill |
| FX-45 | P0-06 row note | Money display with paise off or on |
| FX-45 | Paise rounding rule | Totals are exact and rows round for display. Reword the P0-06 Accept. No code change. |
| FX-46 | P0-13 row note | Delete the bill-linked first part of a split |
| FX-47 | P1-10 row note | Home reliability |
| FX-48 | P1-02 row note | Sheet handle |
| FX-49 | P0-05 row note | Category merge targets |
| FX-50 | P1-58 row note | Archived account and edit fallback |
| FX-51 | P1-28 row note | Detected bill link query |
