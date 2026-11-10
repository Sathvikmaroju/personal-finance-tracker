# P0-T05 Spec amendment inventory

Date: 2026-11-10.

Sources read: `docs/design/30_Mobile_Design_Change_List.md` section 9 (lines 1240-1276, 31 rows), `docs/design/32_Decisions_Log.md` (all 109 lines), and the target spec sections in `docs/shared/` and `docs/engineering/`. Line numbers come from the files as they stand today.

Reading notes:
- "r1" to "r31" in the last column are the row numbers of doc 30 section 9, counted top to bottom.
- Folder is always named: "design doc 32" and "engineering doc 32" are different documents.
- Doc 30 section 9 names some sections wrongly. User flow F-14 (balance check) is F-10 in `docs/shared/10_User_Flows.md`. Category merge F-19 is in doc 10, not doc 02. Undo in doc 12 is C-21 and C-18, not C-14. Docs 17, 20 and 03 live in `docs/engineering/`. Rows below cite the real location.
- "(no current text)" means the spec has no field or rule yet.

## 1. Amendment table

| # | Group | Decision IDs | Target doc (folder/file) | Section heading | Line(s) of current text | Current text (<=20 words, quoted) | Required change (one sentence, from the decision) | Source row |
|---|---|---|---|---|---|---|---|---|
| 1 | A | D-03, D-03a, D-03b, Q-12a, Q-12b | shared/02_Domain_Model.md | 1.6 Loan | 45 | "Disbursement is a `move` from the loan to an asset account and is never income." | Add the lending module (loans, repayments, optional simple interest) to the domain model, because lending is in v1. | r1 "Docs 02, 04, 05 and the v1.1 non-goals" |
| 2 | A | D-03, D-03a | shared/02_Domain_Model.md | 10. Outside | 138 | "investments, lending to a person, money sent elsewhere." | Lending to a person is now a lending loan, so the Outside definition must no longer list it. | r1 |
| 3 | A | D-03a | shared/02_Domain_Model.md | 12. Interest & charges | 158 | "Card interest and fees entered by the user; the declared interest portion of a loan repayment; loan balance-check drift." | Define a write-off as a separate loss line that is not in Spent. | r1 |
| 4 | A | D-03, Q-12a | engineering/04_Financial_Domain_Logic.md | 9. Transfers to and from `Outside` | 129 | "Lending ₹5,000 to a friend / `move` Bank → Outside, label "Loan to Ravi" / Not spending" | Replace this row with the lending-loan record, with optional simple interest at a yearly rate the user types. | r1 |
| 5 | A | D-03, D-03a, Q-12a, Q-12b | engineering/04_Financial_Domain_Logic.md | 7. Credit cards and loans (7.2 Loan) | 92-106 | "### 7.2 Loan" | Add lending rules: simple interest, write-off as a loss line, written-off loans stop counting and accruing, delete only if nothing was repaid. | r1 |
| 6 | A | D-03, D-03a | engineering/05_Financial_Invariants.md | INV-07 Loan principal is not income or spending | 45-48 | "Principal repayment is a `move`; only declared interest is spending." | Extend INV-07 to cover lending principal and the write-off loss line, which is not in Spent. | r1 |
| 7 | A | D-03b | shared/06_Metrics_Calculation_Engine.md | M-02 Money available | 20-24 | "excludes owed, archived and system accounts." | Show lent money as a separate "Owed to you" line, never inside "What you have" or Money available. | r1 (net-worth wording; D-03b) |
| 8 | A | D-03, D-03b | shared/01_Product_Master_Spec.md | 4. Non-goals | 28 | "Net worth · financial-health scores · investment valuation · external benchmarking · AI advice" | Reword the non-goals so lending and the "Owed to you" line do not conflict with "net worth". | r1 |
| 9 | A | D-03, D-03b | shared/PersonalFinance_Final_Requirements_v1.1.md | 2. Goals and non-goals | 41 | "**Non-goals.** Net worth · financial-health scores · investment valuation · external benchmarking" | Same non-goal rewording as row 8 for lending. | r1 |
| 10 | A | D-03 | shared/PersonalFinance_Final_Requirements_v1.1.md | 12. Loan model | 193-210 | "# 12. Loan model" | Add the lending loan model next to the borrowing loan model. | r1 |
| 11 | A | D-03 | shared/PersonalFinance_Final_Requirements_v1.1.md | 10. Transaction flows (examples table) | 184 | "Lending to a friend / Moved / Bank / Outside / Not spending" | Replace the Outside example with the lending-loan flow. | r1 |
| 12 | A | D-03 | shared/PersonalFinance_Final_Requirements_v1.1.md | 26. Acceptance-test suite (T-30) | 435 | "Lending ₹5,000 to a friend / `move` Bank→Outside; not spending" | Replace T-30 with a lending-loan test. | r1 |
| 13 | B | D-19 | shared/06_Metrics_Calculation_Engine.md | M-04 Spent | 35, 38 | "Includes `Not recorded` corrections in the total but shows them as a separate line." | Leave corrections out of both the actual and the typical in the comparison (M-04 counts them in Spent today). | r2 "Doc 06 M-04 and doc 07 (baseline)" |
| 14 | B | D-19 | shared/06_Metrics_Calculation_Engine.md | M-19 Change vs typical | 128 | "`actual − M-17` for completed periods; `actual_MTD − M-18(d)` for the current period." | Exclude corrections from the actual side as well as the baseline. | r2 |
| 15 | B | D-19 | shared/07_Analytics_Engine.md | 2. Qualifying month | 23 | "`Not recorded` corrections." | The baseline already excludes corrections; add that the actual side of a comparison excludes them too. | r2 |
| 16 | B | D-19 | shared/PersonalFinance_Final_Requirements_v1.1.md | 18. Baseline / typical-month methodology | 288 | "**Excluded from all baselines.** Transactions flagged `exclude_from_typical` · non-monthly commitments · `correction` records." | Add the actual side to the exclusion, as in row 15. | r2 |
| 17 | B | D-26 | shared/06_Metrics_Calculation_Engine.md | M-23 Category drift | 150-152 | "`share(c, P) − median{ share(c, m) : last 6 qualifying }`, in percentage points." | Define drift as the rupee difference from typical, not the percentage-point share change. | r3 "Doc 06 M-23" |
| 18 | B | D-26 | shared/08_Reporting_Specification.md | 6. R-05 Over time | 104 | "M-04, M-17, M-23 (P2 drift)." | Check that the R-05 metric list still fits the rupee-difference definition of M-23. | doc 32 only (D-26 consequence) |
| 19 | B | D-20 | shared/06_Metrics_Calculation_Engine.md | M-12 Promised | 83, 87 | "a matched occurrence is excluded (INV-08), so a bill already paid is not counted again." | Count a card-paid bill at the card's due date, do not count it again, and make Promised include card dues. | r4 "Doc 06 / Left to spend maths (M-12) and doc 07" |
| 20 | B | D-20, FX-07 | shared/06_Metrics_Calculation_Engine.md | M-13 Left to spend | 92 | "`M-02 − M-12 − preferences.buffer_paise`, **signed**" | Left to spend follows the new Promised rule; the screen shows "Card-paid bills count when the card is due". | r4 |
| 21 | B | D-20 | shared/07_Analytics_Engine.md | 7. Recurrence detection (commitment matching) | 85 | "never silently double-counted in *Promised* (INV-08)." | Add the card-due rule: a card-paid bill counts once, at the card's due date. | r4 |
| 22 | B | Q-3 | shared/06_Metrics_Calculation_Engine.md | M-25 Year-over-year | 158-160 | "**Minimum data:** 24 months." | Seasonal categories and year-to-date compare use at least ₹500, 25% and at least 2 samples; hidden until 24 months. | r14 "Doc 07 F-41 / M-25 / section 14 (seasons)" |
| 23 | B | Q-3 | shared/07_Analytics_Engine.md | 14. Progressive intelligence ladder (24 months row) | 157 | "October is usually your heaviest month — last year ₹64,000." | Add the seasonal thresholds (at least ₹500, 25%, at least 2 samples) and keep the 24-month gate. | r14 |
| 24 | B | Q-3 | shared/01_Product_Master_Spec.md | 11. Complete feature inventory (F-41) | 117 | "Seasonality / year-over-year (24 months) / P2" | Feature F-41 ships with the prototype rules from Q-3. | r14 |
| 25 | C | D-16, D-16a | engineering/03_Data_Model.md | 10. `preferences` | 167 | "`month_start_day` (1–28, default 1) · `theme` (`system,light,dark`)" | Add a year-start setting (January or April, default January). | r17 "Doc 03 preferences and doc 08 year views" |
| 26 | C | D-16, D-16a | engineering/17_Search_Filter_Spec.md | 2. Filters (Period row) | 21 | "This month · Last month · Choose month · Custom range" | Year views get the chips This year, Last year and 1 Year; April start labels read "FY 2026-27". | r17 |
| 27 | C | D-16, D-16a | shared/08_Reporting_Specification.md | year views | NOT FOUND | NOT FOUND (doc 08 has no year view; the period selector is at line 131) | Year views honour the year-start setting; monthly views still honour the month-start day. | r17 |
| 28 | C | D-15 | engineering/03_Data_Model.md | 10. `preferences` | 167 | "`month_start_day` (1–28, default 1)" | Period labels show the date range, for example "25 Jul - 24 Aug", when the start day is not 1. | r18 "Doc 03 `month_start_day` and period labels" |
| 29 | C | D-15 | shared/11_Screen_Specification.md | S-30 Preferences | 108 | "Decimals, month-start day (with a warning that report periods shift), theme, buffer amount" | Show the date-range label for a custom start day; the period-shift warning is an undecided gap (G-41). | r18 |
| 30 | C | D-05, D-05a, D-05b | engineering/03_Data_Model.md | 1. `accounts` | 9-22 | (no current text: the table has no private field) | Add a per-account private flag; private hides balance and amounts only. | r26 "Docs 03/04/11 (account fields and screens)" |
| 31 | C | D-05a | engineering/03_Data_Model.md | 10. `preferences` | 167 | (no current text) | Add a global "Hide all" switch; a hidden value is revealed only by turning the switch off. | r26 |
| 32 | C | D-05, D-05b | engineering/04_Financial_Domain_Logic.md | 11. Account lifecycle rules | 149-151 | "Create with mandatory starting balance → active → archive **only at zero balance** (EX-01)" | Add the masking rules: amounts show as dots on Home, lists, detail and reports; totals stay exact; search never matches masked amounts. | r26 |
| 33 | C | D-05, D-05a | shared/11_Screen_Specification.md | S-13 Create / edit account | 64 | "Fields: name, class (plain language — "Money I have" / "Money I owe"), subtype, icon, starting balance" | Add the private-account switch to the account screens. | r26 |
| 34 | C | D-28 | engineering/03_Data_Model.md | 10. `preferences` | 167 | "`notification_settings` (JSON)" | Reminders default off; permission is asked when first turned on; cap stays 4 a month. | r27 "Doc 11 S-30 and doc 03 `notification_settings`" |
| 35 | C | D-28 | shared/11_Screen_Specification.md | S-30 Preferences | 108 | "buffer amount, notification settings, show-notes-in-list." | State the default-off reminders and the permission prompt at first turn-on. | r27 |
| 36 | C | D-30a | engineering/03_Data_Model.md | 10. `preferences` | 167 | "`passcode_hash` (nullable, P1) · `biometric_enabled` (P1)" | The app stores no PIN, so the passcode field falls away. | doc 32 only (D-30a) |
| 37 | C | FX-17 | engineering/03_Data_Model.md | 1. `accounts` | 17 | "`due_day` / INTEGER / Yes / NULL / 1–31; only when `class='owed'`" | The card due day is required when a card is added and editable later; existing cards without one are prompted once. | doc 32 only (FX-17) |
| 38 | D | D-29, Q-11 | shared/09_Information_Architecture.md | 3. Tab contents (Reports S-15) | 83 | "A hub listing the six views with a one-line current answer as each card's subtitle" | Replace the six cards with the folded hub; "Where it goes" is reached from Overview. | r6 "Docs 09, 11, 12 (S-15 Reports hub)" |
| 39 | D | D-29, Q-11, P1-08a | shared/11_Screen_Specification.md | S-15 Reports hub | 72 | "Six cards, each with its title and a live one-line answer as subtitle" | Same as row 38; also add the direct link to "Where it goes". | r6 |
| 40 | D | D-29, Q-11 | shared/12_UI_Component_System.md | hub component | NOT FOUND | NOT FOUND (doc 12 has no hub component) | Doc 30 names doc 12 for the hub; no matching section exists, so confirm the intended target. | r6 |
| 41 | D | D-29, Q-11 | shared/11_Screen_Specification.md | S-22 Plan hub | 90 | "Two sections — Commitments (with total monthly load and next due) and Limits (with on-track count)." | Plan hub as built: Left to spend hero, The maths, regular bills link, limits. | r7 "Doc 11 S-22 (Plan hub)" |
| 42 | D | D-29, Q-11 | shared/09_Information_Architecture.md | 3. Tab contents (Plan S-22) | 85 | "Two sections: Commitments (regular bills) and Limits. Creation and editing live here." | Same Plan hub change as row 41. | r7 |
| 43 | D | D-27, D-29 | shared/11_Screen_Specification.md | S-42 Widget config | 144 | "Choose which figure the widget shows (Money available or Left to spend)" | The widget shows quick-add buttons by default; figures only after opt-in; Spent / Received / Moved shortcuts. | r8 "Doc 11 S-42 (widget) and doc 12" |
| 44 | D | D-27, D-29 | shared/12_UI_Component_System.md | widget component | NOT FOUND | NOT FOUND (doc 12 has no widget section) | Doc 30 names doc 12 for the widget; confirm the intended target. | r8 |
| 45 | D | D-29, Q-2, Q-8, Q-10 | shared/11_Screen_Specification.md | S-27 Backup & restore | 98-99 | "Last backup date, Back up now, Restore from file." | One "Your data" screen: Backup, CSV, PDF, Restore, Import, Erase everything (typed confirmation, backup prompt). | r9 "Doc 11 S-27 to S-29" |
| 46 | D | D-29, Q-2, Q-10 | shared/11_Screen_Specification.md | S-28 Export | 101-102 | "Scope (all / period), format CSV, destination." | Folds into the "Your data" screen and adds PDF. | r9 |
| 47 | D | D-29, Q-2, Q-10 | shared/11_Screen_Specification.md | S-29 Import | 104-105 | "File chooser → validation preview (new / skipped / invalid with row numbers and reasons) → confirm." | Folds into the "Your data" screen. | r9 |
| 48 | D | D-29 | shared/11_Screen_Specification.md | S-19 Settings | 84 | "About & limitations (states the six known limitations verbatim)." | Eight limitation rows as built, reworded to the decisions. | r10 "Doc 11 S-19 / v1.1 section 27" |
| 49 | D | D-29 | shared/PersonalFinance_Final_Requirements_v1.1.md | 27. Known limitations | 451-453 | "Stated in-app, not buried: single currency · money sent to untracked destinations is recorded at what was put in" | Same eight-row rewording as row 48. | r10 |
| 50 | D | D-08 | shared/09_Information_Architecture.md | 1. Tab bar diagram | 13, 19 | "├── [ + ]         Add sheet — floating, present on every tab" | FAB sits bottom-right with one meaning: add transaction. | r11 "Docs 09 and 12 (tab bar and FAB drawing)" |
| 51 | D | D-08 | shared/12_UI_Component_System.md | C-01 Tab bar | 10 | "5 items (Home, Transactions, Reports, Plan, Settings) + centred FAB." | The FAB is bottom-right, not centred. | r11 |
| 52 | D | D-08 | shared/12_UI_Component_System.md | C-02 Floating add button | 15-19 | "Circular, primary colour, plus glyph." | One meaning only; remove the "Add a regular bill" FAB variant. | r11 |
| 53 | D | D-14 | shared/09_Information_Architecture.md | 3. Tab contents (Settings S-19) | 87 | "Accounts · Categories · Payees (P1) · Balance check · Backup & restore · Export · Import" | Accounts moves under Home; Settings keeps account set-up only. | r12 "Docs 09 and 11 (information architecture, S-19 Settings)" |
| 54 | D | D-14 | shared/11_Screen_Specification.md | S-19 Settings | 84 | "Grouped list: Accounts · Categories · Payees (P1) · Balance check · Backup & restore" | Same as row 53. | r12 |
| 55 | D | Q-1 | shared/01_Product_Master_Spec.md | 11. Complete feature inventory (Removed list) | 121 | "budget carry-over · calendar heatmaps · dormant-subscription detection" | Carve out the daily spending calendar and month strips from the calendar-heatmap ban. | r13 "Doc 01 out of scope, doc 08 section 1, doc 29 line 84, v1.1 Removed" |
| 56 | D | Q-1 | shared/08_Reporting_Specification.md | 1. Reporting model (chart discipline) | 27 | "No pie chart as a primary view, no heatmaps, no decorative visuals." | Same carve-out. | r13 |
| 57 | D | Q-1 | design/29_Claude_Design_Handoff.md | Charts | 84 | "No pie chart as a primary view, no heatmaps, no donuts." | Same carve-out (design doc 29, not a spec doc). | r13 |
| 58 | D | Q-1 | shared/PersonalFinance_Final_Requirements_v1.1.md | 19. Reporting (chart discipline) and 25. Scope (Removed) | 311, 397 | "No pie charts as a primary view, no heatmaps, no decorative visuals." | Same carve-out in both v1.1 places. | r13 |
| 59 | D | D-12, FX-24 | shared/13_Design_System.md | 1. Typography | 13-14 | "`display` 40 ... Money available on Home / `figure-lg` 32 ... Report L1 answers" | Add type tokens 36 (report heroes) and 19 (stats); Home hero stays 40. | r15 "Doc 13 section 3" (type tokens are in section 1; doc 30 cites section 3) |
| 60 | D | D-04, P1-19a | shared/13_Design_System.md | 3. Colour tokens | 31-37 | "Restrained: one accent, three semantic signals, a neutral ramp." | Eight palette accents replace the single accent; add tokens --n500, --on-accent, --on-crit; Warm #95542A, Midnight #7F6220 in light mode. | r15 |
| 61 | D | D-31, D-04 | shared/13_Design_System.md | 11. Theme | 100-102 | "Light, dark, and system-following. Dark is a designed palette with equal contrast compliance." | Dark is grey #14171B only, with no true-black option. | r16 "Doc 13 section 11" |
| 62 | D | D-04 | shared/13_Design_System.md | 8. Accessibility contrast | 78-80 | "All text meets WCAG AA: ≥4.5:1 for body, ≥3:1 for `figure-lg` and above." | Verify AA for all 16 palette and theme pairs. | r31 "Doc 19 / 13 contrast" |
| 63 | D | D-04 | shared/19_Accessibility.md | 3. Contrast | 23 | "Both light and dark palettes (doc 13 §3) are verified against these ratios." | Verify AA for all 16 palette and theme pairs. | r31 |
| 64 | D | Q-6 | engineering/17_Search_Filter_Spec.md | 1. Search (fields searched) | 9 | "`payee.name` and `transaction.note`. Nothing else" | Search fields are payee, note and category name. | r19 "Doc 17 (search)" |
| 65 | D | D-25, D-05 | engineering/17_Search_Filter_Spec.md | 1. Search (amount search) | 13 | "searches the amount as an exact match in rupees **and** offers a "range around this" chip" | Amount search is a digit match (340 finds 340, 3,400, 340.50) with no range chip; masked private amounts never match. | r19 |
| 66 | D | Q-5, Q-5a | shared/12_UI_Component_System.md | C-05 Number keypad with calculator | 36-37 | "Evaluates a flat expression left-to-right with standard precedence" | Standard precedence (BODMAS), no brackets; the spec text contradicts itself and must say precedence only. | r20 "Doc 12 C-05 (calculator)" |
| 67 | D | D-02 | shared/12_UI_Component_System.md | C-21 Toast | 110 | "auto-dismiss at 5 s; queued, never stacked." | Undo has no timer and stays until the next action. | r21 "Doc 18 section 7, C-21, doc 12 C-14, doc 19 section 1" |
| 68 | D | D-02 | shared/12_UI_Component_System.md | C-18 Balance-check sheet (doc 30 says C-14) | 101 | "Includes an undo banner state." | Balance-check Undo has no timer either. | r21 |
| 69 | D | D-02, VB-6 | shared/18_States_Errors_Empty_States.md | 7. Entity states | 106 | "Toast with Undo for 5 seconds." | Remove the 5 s timer; clear Undo when any sheet or dialog opens. | r21 |
| 70 | D | D-02 | shared/19_Accessibility.md | 1. Touch and motor (section named by doc 30) | NOT FOUND | NOT FOUND (no undo text in section 1; undo appears at lines 52 and 91) | Undo wording in section 5 line 52 and section 10 line 91 must match the no-timer rule. | r21 |
| 71 | D | D-30a, D-10a | engineering/20_Security_Privacy.md | App lock | 43 | "Passcode (6 digits minimum) with optional biometric unlock via the platform API." | App lock is biometric with the phone's PIN or pattern as fallback; no app PIN. | r22 "Doc 20 line 43, S-41, F-26" |
| 72 | D | D-30a | shared/11_Screen_Specification.md | S-41 App lock | 141 | "Passcode entry on launch and after backgrounding; biometric option." | Same change as row 71. | r22 |
| 73 | D | D-30a, D-10a | shared/10_User_Flows.md | F-26 App lock | 173 | "Set a passcode, optionally enable biometrics." | Same change; add the "Turn on app lock" flow. | r22 |
| 74 | D | D-30b | engineering/20_Security_Privacy.md | Database encryption at rest | 26 | "**Database encryption at rest (P2).** SQLCipher-style page encryption" | No encrypt-at-rest toggle in v1. | r23 "Doc 20 and doc 01 F-43" |
| 75 | D | D-30b | shared/01_Product_Master_Spec.md | 11. Complete feature inventory (F-43) | 119 | "Database encryption at rest / P2" | Same change as row 74. | r23 |
| 76 | D | D-21, D-09 | shared/11_Screen_Specification.md | S-06 Date picker | 36 | "blocking dates beyond tomorrow. Quick options: Today, Yesterday." | Entries are for today and earlier only (no tomorrow). | r24 "Docs 11 S-02, 12, 10 F-01, 18 (dates)" |
| 77 | D | D-21, D-09 | shared/11_Screen_Specification.md | S-02 Add transaction | 20 | "collapsed "More" row (payee, note, date, account)" | Date and time both sit under More, optional. | r24 |
| 78 | D | D-21 | shared/12_UI_Component_System.md | C-09 Date picker | 60 | "future dates beyond tomorrow disabled with an explanation on attempt." | Disable all future dates. | r24 |
| 79 | D | D-21 | shared/10_User_Flows.md | F-03 Add a transaction (doc 30 says F-01) | 35 | "Future date beyond tomorrow → inline message." | Future dates are not allowed at all. | r24 |
| 80 | D | D-21 | shared/18_States_Errors_Empty_States.md | 5. Errors | 75 | "Future date beyond tomorrow / Inline on the date field" | Future dates are not allowed at all. | r24 |
| 81 | D | D-06, D-06a | shared/10_User_Flows.md | F-01 Onboarding | 10-13 | "1. Currency and format confirm ... 2. First account ... 3. Categories" | Steps are accounts, bills, record one expense; Skip on every step. | r25 "F-01 and S-31 (onboarding)" |
| 82 | D | D-06, D-06a | shared/11_Screen_Specification.md | S-31 Onboarding | 111 | "Three steps per F-01. Progress indicator; step 3 skippable." | Same steps as row 81; Skip on every step. | r25 |
| 83 | D | D-06, D-06a | shared/09_Information_Architecture.md | screen inventory (S-31) | 57 | "S-31 / Onboarding / Flow (3 steps)" | Update the step description. | r25 |
| 84 | D | D-22, D-23, D-24 | shared/11_Screen_Specification.md | S-08 Transaction detail | 48-49 | "Actions: Edit · Delete · Money came back · Mark as one-off (P1) · Split (P2)." | Edit keeps bill, split, group and refund links; warn before an amount change on linked rows. | r28 "Doc 11 S-08, doc 12, F-06, S-44" |
| 85 | D | D-23 | shared/10_User_Flows.md | F-06 Record a refund | 58 | "account credited (defaults to the parent's account) → date → save." | Original account by default, changeable; any date after the purchase. | r28 |
| 86 | D | D-24, P0-13/14a | shared/11_Screen_Specification.md | S-44 Split transaction | 150 | "Post-hoc only, opened from S-08." | Bill link on the first part only; "exclude from typical" on every part; deleting a part asks "all parts or only this part". | r28 |
| 87 | D | D-22 | shared/12_UI_Component_System.md | edit and refund components | NOT FOUND | NOT FOUND (doc 12 has no matching section) | Doc 30 names doc 12; confirm the intended target. | r28 |
| 88 | D | Q-14 | shared/10_User_Flows.md | F-19 Manage categories (doc 30 says doc 02) | 142 | "**merge** (reassigns all references atomically)" | Merge keeps the target limit, or takes the source's if the target has none; confirms; Undo restores category, limit and transactions. | r29 "Doc 02 F-19 (category merge)" |
| 89 | D | Q-14 | shared/18_States_Errors_Empty_States.md | 7. Entity states | 108 | "Merged category or payee. Toast confirming the count of reassigned transactions; not undoable" | Category merge is now undoable; payee merge is not covered by the decision. | r29 |
| 90 | D | D-10, D-10a, Q-8 | shared/11_Screen_Specification.md | new screens | NOT FOUND | NOT FOUND (new screens: "Turn on app lock", category rename, Duplicate to today, Lock now, Getting started, Record this payment now) | Add these screens and actions; S-20 / S-21 at line 87 covers categories without a rename flow. | r30 "Doc 11 (new screens)" |
| 91 | D | D-18 | shared/02_Domain_Model.md | 7. Balance check | 110-111 | "difference computed by class rule (INV-16) → resolved as *corrected* or *ignored*" | When the user owes less than recorded, record an adjustment entry that is neither Spent nor Received. | r5 "Doc 02 balance check and doc 10 F-14" |
| 92 | D | D-18 | shared/10_User_Flows.md | F-10 Balance check (doc 30 says F-14) | 88 | "*Fix it* writes a `correction` in `Not recorded`, except loan accounts" | Same adjustment-entry rule for owed accounts. | r5 |
| 93 | D | D-18 | engineering/04_Financial_Domain_Logic.md | 10. Balance check and correction | 143 | "Loan accounts → `out` in `Interest & charges` from the loan." | Same adjustment-entry rule; doc 30 does not name doc 04, but it holds the record rule. | r5 |
| 94 | D | D-18 | engineering/05_Financial_Invariants.md | INV-16 Balance-check sign | 96-99 | "owed: `diff = app − reported_owed`." | Check INV-16 and tests T-62 and T-63 against the new owed-less case. | r5 |

## 2. Decisions in doc 32 that change a spec but are missing from doc 30 section 9

- **D-13** (sign on every money row): `shared/13_Design_System.md` section 9 line 91 ("Owed amounts: absolute value plus "owed" — **never** a minus sign") must allow a sign on every money row, with colour never the only signal.
- **D-11, D-11 revised, D-11a** (minimum 360 x 640 dp, 320 dp must not break, 200% text, tablet column max 560 dp, landscape): `shared/19_Accessibility.md` section 2 line 15 and `shared/13_Design_System.md` section 2 line 27.
- **D-30a** (no app PIN): `engineering/03_Data_Model.md` line 167 `passcode_hash` (row 36); `shared/PersonalFinance_Final_Requirements_v1.1.md` line 168 "passcode?" in the preferences list.
- **P0-17a** (lock delay default 1 minute; choices immediately, 1, 5, 15): `engineering/20_Security_Privacy.md` line 43 lists only "immediately / 1 min / 5 min".
- **P0-15c** (one months-with-spending median for the unusual check): `shared/06_Metrics_Calculation_Engine.md` M-21 lines 137-141 and `shared/07_Analytics_Engine.md` section 8 lines 87-100. Doc 32 says "Spec M-21 needs amending".
- **P1-12a** (a card due counts as paid when a payment is within 20% of the amount, 5 days before to 7 days after the due day): `shared/06_Metrics_Calculation_Engine.md` M-12 line 83 and `shared/07_Analytics_Engine.md` line 85.
- **FX-28** (no Left to spend with zero accounts; show "Add an account"): `shared/06_Metrics_Calculation_Engine.md` M-13 lines 90-95.
- **FX-45** (totals exact, rows round for display): `shared/13_Design_System.md` section 9 line 89 ("display rounds only at render, never in intermediate arithmetic") and the "summing exactly" drill-down rule (doc 06 M-04 line 40).
- **FX-17** (card due day required): `shared/10_User_Flows.md` F-02 lines 20-24 and `shared/11_Screen_Specification.md` S-13 line 64 (data model is row 37).
- **Q-9** (accepting a detected regular bill opens a pre-filled editor with Dismiss): `shared/10_User_Flows.md` F-11 line 95 ("confirming a detected suggestion (P1)").
- **Q-13** ("Mark as a one-off" lets the user pick the transaction): `shared/12_UI_Component_System.md` C-15 lines 89-92 already says "not useful" suppresses the type; only the one-off picker is new.
- **P0-13/14a** (deleting one part of a split asks "all parts or only this part"): in row 86 only; no doc 30 row names it.
- **D-02 / VB-6** (clear the Undo toast when a sheet or dialog opens): in row 69; doc 30 r21 covers only the timer.
- **No amendment needed:** Q-4 and Q-7 match the spec (doc 07 section 7 line 85); D-07 matches doc 13 section 9 line 92; D-17 (no tax tagging) matches the spec; P0-15b matches doc 07 line 34.

## 3. Open: needs the owner

Do not resolve these here.

1. **Lending vocabulary (D-03).** "principal", "write off" and "receivable" are not agreed (design doc 32 lines 21-22). Ask before any UI copy or spec wording uses them.
2. **Lending repayment rules.** No decision says how a lending repayment is recorded, how it splits principal and interest, or what happens to interest after a partial repayment.
3. **Simple interest basis.** Q-12a gives "optional simple interest; the user types the yearly rate". Day count and start date are not defined.
4. **Write-off rules.** D-03a says "separate loss line, not in Spent" and that written-off loans stop counting and accruing. Where the loss line appears (Home, reports, Kept) and whether a write-off can be undone are not defined.
5. **"Owed to you" scope (D-03b).** Whether it appears in Money available drill-down, reports or Home is not stated.
6. **Settle or archive a loan (Q-12b).** The state names, and whether an archived lending loan still shows in "Owed to you", are not defined.
7. **Adjustment entry (D-18).** The record kind, category and Undo behaviour are not named. Existing kinds are `out`, `in`, `move`, `back`, `correction`, `start`.
8. **Corrections in the Spent total (D-19).** The decision leaves corrections out of both sides of the comparison. It does not say whether M-04 itself, Kept and category shares keep them.
9. **Fourteen undecided gaps** in the project `CLAUDE.md` (G-30, G-32, G-33, G-35, G-38, G-40, G-41, G-43, G-45, G-46, G-47, G-60, G-61, G-65). Rows 26 (G-65 filter set), 29 (G-41 period-shift warning) and 86 touch these; stop and ask before building them.
10. **Wrong references in doc 30 section 9.** It names "doc 10 F-14", "doc 02 F-19", "doc 12 C-14", "doc 19 section 1" and "doc 13 section 3" for rules that live elsewhere (see Reading notes). Ask whether doc 30 should be corrected.
11. **No target found** for the doc 12 hub, widget and edit/refund components, the doc 11 new screens, the doc 08 year views and the doc 19 section 1 undo text (rows 27, 40, 44, 70, 87, 90). The owner must say where each amendment goes.
12. **Delegated decisions** D-11, Q-13 and Q-14 are marked "open to revision" in design doc 32 line 107.
13. **Design doc 33** (prototype defects) was not read for this inventory.

## 4. Counts

Rows per group: A = 12, B = 12, C = 13, D = 57. Total = 94.

Doc 30 section 9 rows covered: 31 of 31 (r1 to r31 each appear in the Source row column at least once).

NOT FOUND rows: 6 (rows 27, 40, 44, 70, 87, 90).

Decisions in design doc 32 not in section 9: 13 items (section 2).
