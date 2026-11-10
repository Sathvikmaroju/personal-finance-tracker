# Decisions Log

Product-owner answers to the open decisions in `30_Mobile_Design_Change_List.md` (section 3) and the new questions in `31_Prototype_vs_Spec_Gaps.md` (section F). Stack is React Native, Android, offline, India/INR. Each entry lists the answer, the follow-ups answered, and what it changes. Items not listed here are still open.

Status key: DECIDED = answered by the product owner. Consequences marked [Certain], [Likely] or [Guessing] are the assistant's, not the owner's.

## Batch 1 (2026-11-01)

| ID | Decision | Answer | Consequence for the design |
|---|---|---|---|
| D-02 | Undo: 5 s toast vs no timed response | **No timer. Undo stays until the next action.** Also available for balance check. | [Certain] Toast must not auto-dismiss at 5 s. Affects P1-21, P1-36, P1-20, P0-05, P1-28. |
| D-03 | Is lending in v1? | **Keep the full lending module in v1.** | [Certain] Spec docs 02/04/05 and non-goals need amending. Loans, repayments, interest accrual, write-off stay. |
| D-03a | Write-off treatment | **Separate loss line, not in Spent.** | [Certain] Prototype currently adds write-off to Spent (+Rs 10,000): change it. Written-off loans must stop counting and stop accruing. |
| D-03b | Receivables in "What you have" | **No. Show a separate "Owed to you" line.** | [Certain] Prototype currently counts lent principal in "What you have": change it. |
| D-04 | Palettes | **Ship all 8** (switcher stays in Preferences). | [Certain] All 8 palettes x light/dark = 16 pairs must pass WCAG AA (doc 19). Ink currently 1.14:1 on white-on-accent. Dark-mode white-on-accent fails for 7 palettes (2.28-3.07:1). |
| D-05 | Private accounts | **Hide on screen only; always count in totals.** User chooses which accounts are private, can turn it on or off at any time. | [Certain] Home available must be exact (Rs 51,200 in the seed, not Rs 3,550). Fixes the FIN-2/FIN-3 findings. Search never matches masked amounts. |
| D-05a | Private: how to switch and reveal | **Toggle per account plus one global "hide all" switch.** | [Likely] Reveal method not specified yet: see open follow-up below. |
| D-05b | Private: what is hidden | **Balance and amounts only.** Account name and transactions stay visible. | [Certain] Amounts show as dots on Home, lists, detail and reports. |

### Open follow-ups from batch 1
- D-03: spec amendments (docs 02, 04, 05, v1.1 non-goals) must be listed once all lending questions are done (vocabulary: "principal", "write off", "receivable").

## Batch 2 and 3 (2026-11-01)

| ID | Decision | Answer | Consequence for the design |
|---|---|---|---|
| D-05a | Private: how to reveal a hidden value | **Reveal only by turning the account's private switch off** (or the global "hide all" switch off). | [Certain] No tap-to-reveal, no biometric prompt. [Likely] Fast to build; slower for users who peek often. |
| D-06 | Onboarding steps | **Prototype steps: accounts, bills, record one expense.** | [Certain] Spec flow F-01 and screen S-31 need amending (they list format, first account, categories). |
| D-06a | Where Skip appears | **Skip on every step.** | [Certain] The app must work with no accounts, bills or entries; every empty state needs a real design. |
| D-07 | Amount abbreviation | **Full value everywhere below Rs 1 crore.** | [Certain] Matches doc 13 section 9. Fix the broken "Rs 0k" chart label (UX-44 / FIN-27). |
| D-08 | Add button (FAB) | **Bottom-right, one meaning: add transaction.** | [Certain] Remove the "Add a regular bill" variant of the FAB. Spec tab-bar drawing needs amending. |
| D-09 | Time of day | **Date and time both under "More", optional.** | [Likely] Helps fix the add sheet overflow (793 vs 691 px, Save below the fold). Keep the clock picker only if time stays. |
| D-10 | Stub flows that need real design | **Category rename; preset-only amounts (starting balance, bill edit, due day); passcode set-up.** Account naming ("(yours)") NOT selected: stays as is. | [Certain] Passcode set-up needs create, confirm and change screens. |
| D-12 | Type sizes (36 hero, 19 stats vs doc 13's 32/40) | **Add 36 and 19 to the type tokens.** | [Certain] Doc 13 section 3 must be amended. |
| D-13 | Sign prefix on money rows | **Every money row shows + or minus.** | [Certain] Fix the wrong minus on a Moved row detail (VFIN-4). Colour is never the only signal. |
| D-14 | Where "how much money I have" lives | **Move Accounts under Home.** | [Certain] Settings keeps account set-up only. Removes the cross-tab jump from Home and its Back bug. Affects P1-06. |
| D-15 | Period name with a custom start day | **Show the date range, e.g. 25 Jul - 24 Aug.** | [Likely] Longer labels: check at 320 dp and 200% text. Affects P1-16. |
| D-16 | Financial year in year views | **User chooses the year start; default Jan to Dec.** Details (which start months, fate of the rolling "1 Year" chip) are in the next batch. | [Certain] Prototype has no FY view today. |
| D-17 | Tax tagging | **None. Leave it to CSV export (spec).** | [Certain] Interest stays a normal expense. No tags or tax flags. |
| D-18 | Balance check when you owe LESS than recorded | **An adjustment entry; not Spent and not Received.** | [Certain] Fixes the case the spec does not define. Related to FIN-25 / P1-36. |
| D-19 | Corrections vs "typical" | **Leave corrections out of both sides** (actual and baseline). | [Certain] Departs from spec M-04, which counts a correction in Spent: doc 06 needs amending. Fixes the lopsided comparison (FIN-17, P0-15, P1-13). |
| D-16a | Year start choices and the "1 Year" chip | **January or April only; default January; keep "1 Year" too.** Chips: This year, Last year, 1 Year. April start labels read "FY 2026-27". | [Certain] Monthly views still honour the month-start day (D-15). Affects P1-16, P2-14. |
| D-20 | Card-paid bills in Promised / Left to spend | **Count at the card's due date; do not count the bill again.** | [Certain] Promised must include card dues (today it omits them). Affects P1-12. |
| D-21 | Future dates on an entry | **Today and earlier only.** | [Certain] Matches the prototype. Spec (allows tomorrow) needs amending. Affects P1-04. |
| D-22 | Edit on refund, correction, grouped rows | **Everything editable; links always preserved.** | [Certain] Fixes TL-2 (P0-12): edit must keep bill, split, group and refund links. Linked rows warn before an amount change. |
| D-23 | Refund account and date | **Original account by default, changeable; any date after the purchase.** | [Certain] Matches requirements v1.1 "refund months later". Affects P1-43. |
| D-24 | Split-part inheritance | **Bill link on the first part only; "exclude from typical" on every part.** | [Certain] Fixes TL-3 (P0-13): the bill link is copied to every part today. |
| D-25 | Amount search | **Digit match as built** (searching 340 finds 340, 3,400, 340.50). | [Certain] Doc 17 (exact match plus range chip) needs amending. Masked private amounts are never matched (D-05). Affects P1-41. |
| D-26 | Drift definition | **Rupee difference from typical, as built.** | [Certain] Doc 06 metric M-23 (share change in percentage points) needs amending. Affects P1-17. |
| D-27 | Widget default content | **No figures by default; user opts in.** Default shows quick-add buttons only. | [Certain] Prototype widget shows a balance; change the default. Affects P1-26, P2-10. |
| D-28 | Reminders default | **Off until the user turns them on; ask notification permission at that moment.** Cap stays at 4 a month. | [Certain] Prototype defaults to on; change it. Affects P1-39. |
| D-30a | App lock method | **Biometric with the phone's own PIN or pattern as fallback. The app stores no PIN.** | [Certain] Removes the fixed 1234 and any app-PIN screens. CONFLICTS with D-10 (passcode set-up screen): see open items. Doc 20 line 43 (6-digit PIN) needs amending. Affects P0-17. |
| D-30b | Encrypt the file at rest | **Not in v1; remove the toggle.** | [Certain] Matches the spec's P2. |
| D-10a | Passcode set-up (resolves D-10 vs D-30a) | **A "Turn on app lock" flow; no PIN screens.** | [Certain] Replaces the passcode set-up item from D-10. The flow checks the phone has a screen lock or biometric and asks to confirm once. Needs a "phone has no lock set" state. |
| D-31 | OLED true-black variant | **Designed dark grey only (#14171B).** | [Certain] No true-black option. Affects P1-40. |
| D-29 | Default winner for spec vs prototype differences | **Prototype wins; the spec docs get amended.** (Confirmed after re-asking, because the first answer followed a wrong claim by the assistant.) Covers Reports hub, Plan hub, limitations text, widget screen, PDF/export sheets, "Your data" screen. | [Certain] Also settles Q-8, Q-10, Q-11. The change list must name each doc to amend (docs 09, 11, 12 and the S-15, S-22, S-27 to S-29, S-42 screens). |
| Q-1 | Daily spending calendar | **Ship it; amend the spec.** | [Certain] Spec ban on calendar heatmaps needs a carve-out. Fix near-invisible future-day cells (1.15-1.22:1). |
| Q-2 | "Erase everything" | **Ship it, with a typed confirmation and a backup prompt.** | [Certain] Fix the blank-app bug after erase (VUX-1): show a proper empty state. Spec screens S-27 to S-29 need amending. |
| Q-3 | Seasonal categories and year-to-date compare | **Ship both with the prototype rules** (at least Rs 500, 25%, at least 2 samples). | [Certain] Spec needs amending. Stays hidden until 24 months of history. |
| Q-4 | Bill matching rule | **Automatic: within 7 days of the due date and within 20% of the amount** (spec doc 07 section 7). | [Certain] Prototype has no window and never matches new payments (FIN-4, TL-13): fix, including the "Record this payment now" button. Affects P0-06 / P0-14 and related. |
| Q-5 | Calculator precedence | **Standard maths (BODMAS).** 340+120x2 = 580. | [Certain] Matches spec doc 12 C-05. Prototype goes left to right (920): fix. Brackets support: asked next. |
| Q-6 | Text search fields | **Payee, note and category name.** | [Certain] Doc 17 (payee and note only) needs amending. With D-25 (digit match). Masked private amounts never match (D-05). |
| Q-7 | Limit pace warning thresholds | **Spec: 25% ahead of pace and Rs 300 over, only after day 10.** | [Certain] Prototype uses 1.15 / 0.85: change. Affects the limit rows (FIN pace items). |
| Q-9 | Accepting a detected regular bill | **Open a pre-filled bill editor to review, with Dismiss.** | [Certain] Prototype adds in one tap and re-tags history: change. Nothing in history changes until Save. |
| Q-5a | Brackets in the amount box | **No brackets.** x and / before + and - only. | [Certain] Keypad stays small. |
| Q-12a | Loan interest | **Optional simple interest; the user types the yearly rate.** | [Certain] Prototype offers only 0%, 12% and 20% of the payment: change. |
| Q-12b | Deleting a loan | **Delete only if nothing was repaid; otherwise mark settled or archive.** | [Certain] Prototype deletes the loan and its linked transactions with no list: change. |
| Q-13 | "Not useful" on an insight | **Delegated to the assistant. Decided: hide that insight type from now on (spec type-level suppression); "Mark as a one-off" lets the user pick the transaction.** | [Likely] Revisit if you want only the single insight hidden. |
| Q-14 | Category merge and the limit | **Delegated to the assistant. Decided: the merged category keeps the target's limit, or takes the source's if the target has none; merge asks for confirmation; Undo restores category, limit and transactions.** | [Certain] Prototype silently deletes the source limit and Undo leaves 12 orphaned transactions (VUX-2, FIN-26). |
| Q-8, Q-10, Q-11 | Add prototype-only actions to the spec; PDF/export and "Your data" screens; Reports hub, What changed, Plan hub, Regular bills layouts | **Settled by D-29: the prototype wins; the spec docs get amended.** | [Certain] Spec screens affected: S-15, S-22, S-27 to S-29, S-42 and the actions in G-13 to G-17. |
| D-11 | Smallest screen and text size | **Delegated to the assistant; "clear on any Android phone or tablet".** Decided: min 320 x 568 dp portrait; text scale up to 200%; tablets (600 dp and wider) show the phone layout in a centred column, max 560 dp wide; landscape must not break. No separate tablet layout. | [Likely] The 2.0x tab-bar failure and Save-below-fold items become P0-level acceptance tests. Revisit if a real tablet layout is wanted. |

## Phase 1 follow-ups (2026-11-02, after Claude Design applied the P0 items)

| ID | Decision | Answer | Consequence |
|---|---|---|---|
| D-11 (revised) | Smallest screen | **Minimum raised to 360 x 640 dp.** 320 dp wide must still not break (no clipped or hidden controls). Replaces the earlier 320 x 568 decision. | [Certain] At 320 x 568 the add sheet had to hide its title row and cut "Paid from" by about 20 px. Text scale up to 200% and tablet column (max 560 dp) unchanged. |
| P0-15a | Unusual-spending card with month-to-date comparison | **Keep month-to-date logic; adjust the sample data so the card shows on Home by default.** | [Certain] Logic stays like-for-like. Only the seed data changes. |
| P0-15b | Zero-spend months in a category median | **Exclude them: the median is over months that had spending in that category.** | [Certain] Matches "qualifying months" in doc 07. Claude Design left this undone (the Change line did not ask); it is now an explicit request. |
| P0-13/14a | Deleting one part of a split | **Ask: delete all parts or only this part.** | [Certain] Replaces "always delete every part". The single-part option must warn that the split total changes. |
| P0-17a | App lock delay | **Default 1 minute; choices: immediately, 1, 5, 15 minutes** (as built). | [Certain] Matches what Claude Design implemented. |
| P0-11 (doc fix) | Accept line | Left to spend **stays the same** after a matched bill payment (available and Promised both fall by the payment). Test date must be today or earlier (D-21). | [Certain] Corrected in the change list. The earlier "rises" and "on the 19th" were errors in the doc. |

## Phase 2A follow-ups (2026-11-10, after independent verification)

| ID | Decision | Answer | Consequence |
|---|---|---|---|
| P1-08a | Path to "Where it goes" | **Add a direct link on Overview or the Reports hub.** | [Certain] Meets the 3-tap Accept line. |
| P1-12a | When a card due counts as paid | **A payment within 20% of the amount due, in the same window (5 days before to 7 days after the due day).** | [Certain] Fixes VQ-5: a Rs 500 payment cleared a Rs 30,000 due. Mirrors the bill-match rule (7 days, 20%). |
| P0-15c | Baseline for the unusual-spending check | **Use the same months-with-spending median everywhere.** | [Certain] `unusual()` stops using all months. Spec M-21 needs amending. Home and the category screen then agree. |
| D-11a | Add sheet at 320 x 568 | **Add a scroll cue** (a partly visible row or a fade) so users can see "Paid from" and "More" below the fold. | [Certain] 360 x 640 already fits with no scrolling (verified). 320 dp wide must not break. |
| P1-19a | Darker Warm and Midnight accents (light mode) | **Accepted.** Warm #95542A, Midnight #7F6220. | [Certain] Add the new tokens (--n500, --on-accent, --on-crit, --type-hero 36, --type-stat 19) to doc 13. |
| P1-06a | Accounts in two places until P1-51 | **Accepted as an interim state.** | [Certain] P1-51 (phase 2B) finishes the move. |
| VB-6 | Undo toast covering sheet buttons | **Clear the Undo toast when any sheet or dialog opens.** | [Certain] Opening a sheet counts as "the next action" for D-02. Undo is no longer offered after that. |
| FX-07 | Left to spend with card-paid bills | **Keep Rs 44,302; show the rule on screen** ("Card-paid bills count when the card is due"). The user can change a card's due day in Edit account. | [Certain] Follows D-20. Seed Left to spend becomes Rs 44,302 (was Rs 43,653 in the change list). |
| FX-10 | Erase everything | **Clear everything, as the copy says** (accounts, bills, limits, transactions). | [Certain] After erase the app shows the empty first-run state (Q-2: typed confirmation, backup prompt). |
| FX-11 | Early-stage sample data | **Fix the sample data so balances are sensible; no logic change.** | [Certain] Prototype-only fix for "First week only" and "Nothing recorded" (negative balances, Left to spend -Rs 1,86,543). |
| FX-17 | Credit card due day | **Required when a card is added; editable later in Edit account.** | [Certain] Remove the "Not set" option from the card due-day picker. Existing cards without one are prompted once. Per D-10 the picker should accept any day, not only presets. |
| FX-24 | Type sizes in use | **Home hero 40; report heroes 36; stats 19; apply the tokens** (--type-hero 36, --type-stat 19 are defined but unused today). | [Certain] Matches doc 13 for Home and D-12 for reports. |
| FX-28 | Left to spend with zero accounts | **No Left to spend; show "Add an account" instead.** | [Certain] Replaces the -Rs 2,000 buffer figure. |
| FX-31 | "All other categories" row on What changed | **Keep the current wording.** | [Certain] No change requested. The verifier's concern (remainder hides the median gap) is accepted as is. |
| FX-45 | Paise rounding rule | **Totals are exact; rows round for display.** Reword the P0-06 Accept to say so. | [Certain] A Rs 1 difference between rows and total is expected when paise are off. |

## Lending follow-ups (2026-11-10, build Phase 0, task T06)

These answers settle gaps G-04 to G-09, G-18 and G-19 and the D-03 vocabulary.

| ID | Decision | Answer | Consequence |
|---|---|---|---|
| L-01 | How lending is modelled (G-18) | **A separate system "Money lent" account, as in the prototype.** Each loan is a record per borrower. Lending is a Move from the paying account to this account. | [Certain] Amends doc 04 (lending was a Move to Outside), docs 02/03 (new account class and a `loans` table), T-30. The account's balance is the outstanding amount lent and appears only in "Owed to you" (D-03b), never in "What you have" (G-19 resolved). |
| L-02 | Interest and repayments (G-05) | **Keep the prototype rules.** Simple interest = amount still owed x yearly rate x days / 365, never compounded. Repayments settle interest first, then the amount lent. Repayments are capped at what is owed. Interest counts as Received only when it is repaid. A repaid amount lent is never income. | [Certain] The rate is typed by the user (Q-12a). G-08 resolved: a system income category for interest earned is needed. |
| L-03 | Interest rounding | **Show to the paisa; round only that.** The calculation keeps the exact value; the shown and stored figure is the nearest paisa. Nothing is rounded to rupees. | [Certain] INV-15 holds (whole paise in every stored amount). [Guessing] Tie rule: half up. It is the assistant's call; confirm in the group A amendment review. |
| L-04 | Day count | **Always 365 days, leap years included. Interest starts the day after the lending date; the repayment day counts.** | [Certain] Example: lent 1 March, repaid 31 March = 30 days. |
| L-05 | Statuses (G-06) | **Keep the prototype set:** Active, Partially repaid, Fully repaid, Overdue, Written off, and the optional "Expected back by" date. Overdue = the date has passed and money is still owed. | [Certain] "Written off" is shown to users as "Won't get back" (L-07). |
| L-06 | Write-off (G-07, D-03a) | **Only the whole remainder; the loss is the amount lent still owed, not the unpaid interest.** It shows as its own line in Overview for the month of the write-off. It is not in Spent, Received or Kept. | [Certain] The loan closes, stops counting in every total, and stops accruing interest. Unpaid interest is dropped. Earlier repayments stay. No partial write-off. |
| L-07 | Lending vocabulary (D-03 open terms) | **Plain set:** principal → "Amount lent" (or "Still owed" for what is left); write off → "Won't get back"; receivable → "Owed to you". | [Certain] Closes the D-03 vocabulary question. "Net worth" stays banned in copy (P1-33). |
| L-08 | Undo a write-off | **Undo until the next action (D-02), and "Reopen loan" on the loan detail later.** | [Certain] Reopening restores the outstanding amount and resumes interest from the reopen date. [Guessing] Interest for the written-off period is not charged; confirm in the group A review. |
| L-09 | Where "Owed to you" appears | **On Home, as a line under Money available, and in Accounts. Tapping it lists the loans.** | [Certain] It is never added into Money available or "What you have" (D-03b). |

Already decided elsewhere and unchanged: delete only when nothing was repaid, otherwise "Mark settled" or "Archive" (Q-12b, G-09); an "already lent earlier" path that creates an opening amount owed with no account movement, plus a lending-date picker (P1-33).

## Other Phase 0 follow-ups (2026-11-10, after the amendment inventory)

| ID | Decision | Answer | Consequence |
|---|---|---|---|
| D-18a | Record for "owe less than recorded" | **The existing `correction` kind, category "Not recorded", counted in no total** (not Spent, Received, Kept or baselines). Undo works as for other balance checks. | [Certain] No new record kind. Docs 02, 04 and 06 get the rule. |
| D-19a | Corrections in the Spent total | **Only comparisons exclude corrections.** M-04 keeps corrections as a separate line, as specified. "vs typical", baselines, anomalies and shares exclude them. | [Certain] Doc 06 M-04 formula stays. Doc 07 and the comparison metrics get the exclusion. |
| P-01 | Amendments with no existing spec section; wrong references in design doc 30 §9 | **Add new marked sections in the right spec doc, and add a short "corrected references" note to design doc 30 §9.** | [Certain] Locations are in `docs/build/tasks/P0-T05-inventory.md`. |

## Status after the walk-through

- All decisions D-02 to D-31 and questions Q-1 to Q-14 are answered or settled by D-29.
- Two decisions were delegated to the assistant (D-11, Q-13, Q-14); marked above and open to revision.
- Spec amendments implied by the answers (list for the change list): docs 02, 04, 05 and v1.1 non-goals (lending in v1); 06 (M-04 corrections, M-23 drift); 07 (baseline); 09, 11, 12 (hub, Plan hub, widget, export and Your data screens, FAB position, calendar carve-out); 13 (type tokens 36 and 19, 8 palettes); 17 (search fields and digit match); 19/20 (Undo with no timer, lock method, no encryption in v1, future dates today-only); F-01 and S-31 (onboarding).
- Not yet done: fold these decisions into `30_Mobile_Design_Change_List.md` (remove the decisions section, update blocked-by fields, add new change items from the answers).
