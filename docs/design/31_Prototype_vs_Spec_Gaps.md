# 31 Prototype vs Spec Gaps

## 1. Header

- **Purpose:** List the features, screens, flows and rules that exist in the mobile prototype and are not stated in the written spec.
- **Baseline:** All 34 spec docs (`README.md`, `docs/shared/*.md`, `docs/engineering/*.md`, `docs/design/29_*.md`). Doc 30 and `design/mobile/` are not baseline.
- **Method:** Four region scans (A, B, C and the screenshot transcript). Each prototype feature was grep-checked against the 34 docs. This file only merges the scan outputs. It adds no new finding and drops none.
- **Prototype:** `design/mobile/Personal Finance App.dc.html`, 3,927 lines (working file, deleted 2026-11-10. The latest prototype is `docs/design/prototype/`).
- **Date:** 2026-11-01.
- **Scope:** Features, screens, flows and rules. No copy or pixel detail.
- **Limits:**
  - Region A: template lines 40-831 are generic. The real screen content is built in JS later in the file.
  - Sheet bodies at lines 1966-2266 were only partly checked.
  - The scans are model code-reading. Nobody ran the prototype in a browser for this list.
  - Suggested action is "Decide" in every row, because no source scan states a recommendation.
- **Cross-references:** D-xx = decisions table in `30_Mobile_Design_Change_List.md` section 3. "new" = no D-xx or change item covers it. No row names a P?-?? item because the sources do not map gaps to change items except through D-xx.

## 2. Summary

| Class | Merged rows (G-) | Source rows merged (non-IN-SPEC) |
|---|---|---|
| A. NOT IN SPEC | 17 | |
| B. CONTRADICTS SPEC | 12 | |
| C. PARTIAL | 37 | |
| D. Prototype-only scaffolding | 2 | |
| Total | 68 | 100 |

Source rows are counted as unique GA/GB/GC/U IDs that are not IN SPEC. Class A, B and C keep the class of the scan that found the feature. Where scans disagree, the row says so. IN SPEC rows: see section 9.

## 3. Section A. In the prototype, NOT in the spec

| ID | Feature | What it does for the user | Proto lines | Source IDs | Search terms used | Decision / change item | Suggested action |
|---|---|---|---|---|---|---|---|
| G-01 | Colour palette picker: 8 named palettes (sage, warm, sophisticated, emerald, midnight, berry, ink, slate), each with light and dark | User recolours the whole app. Doc 13 §3 fixes one accent (teal #2F6F5E); doc 13 §11 offers only light/dark/system | 14-29, 41, 646-648, 851, 1973-1986, 3159, 3180 | GA-1, GB-2, GC-9 | palette, accent, swatch, hue, midnight, visual identity, theme | D-04, D-31 | Decide |
| G-02 | Time of day on a transaction: "When" row with date plus time, and an analog drag-dial clock sheet (hour/minute, AM/PM) | User sets the exact time of each entry. Scan B classed it PARTIAL: the data model has an optional `time`, but no doc specifies a time control | 551-562, 728-753, 1810-1909, 2315 | GA-2, GB-23 | time of day, time picker, clock, analog, hh:mm, occurred_at | D-09 | Decide |
| G-03 | Private accounts: per-account "Keep this balance private" flag. The balance is hidden everywhere except Accounts. Money available, Left to spend, widget, reports and promised bills are computed without it. Income into it is masked ("₹•••••") and transaction amounts are masked | User hides an account from Home, Plan, Reports and the widget | 880, 1202-1221, 1325-1326, 1510-1512, 1925-1939, 1205-1214, 1926-1934, 2660-2663, 2870-2871, 2979, 3259, 3270, 3352-3354, 3366-3370, 3579-3580, 3648, 3665, 3899 | GA-3, GB-1, GC-7 | private account, hide balance, hidden, mask, conceal, exclude from available, isPrivate, is_private, starred. Only "private storage" (doc 20) found | D-05 | Decide |
| G-04 | Add-a-loan form for money lent: borrower, amount, "From" account, interest-free or interest-bearing with annual rate (presets 6/10/12/18/24 or custom), optional due date (1m/3m/6m/1y), notes | A whole entry form for tracking money lent to a person | 3013-3045, 1240-1275 | GC-6, GB-7 | borrower, lend, lent, Money lent, receivable. Spec lending = a `move` to Outside with a label (FR line 184, T-30, doc 04 line 129) | D-03 | Decide |
| G-05 | Interest and repayment rules for lent loans: simple interest = principal x rate x days / 365 on outstanding principal, never compounds. Repayments settle interest first, then principal. Repayments are capped at what is owed. Interest counts as income only once repaid. Principal repaid is never income. Hub shows "Total receivable" | User logs repayments and sees interest owed to them grow daily | 1240-1275, 1284-1309, 2218-2267, 3004, 3008, 3053, 3061-3068, 2255 | GB-7, GC-1, GC-3 | simple interest, accru, principal, receivable, repayment, interest first, income + interest. Spec "interest" and "repayment" cover only loans the user OWES (02 §Loan account, 10 F-05, 10 F-08) | D-03 | Decide |
| G-06 | Loan status set (Active, Partially repaid, Fully repaid, Overdue, Written off) and optional "Expected back by" date that flags overdue. Hub shows "X of that is overdue" | Each lent loan shows a status dot and an overdue flag | 2993-3000, 3018-3019, 3037, 3055, 1240-1275 | GC-2, GB-7 | overdue (only commitments), expected back, due date, borrower | D-03 | Decide |
| G-07 | Loan write-off: the outstanding principal becomes an `out` transaction in the system category "Lending write-off", so it counts as spending. The loan closes | A write-off creates a spending transaction and changes spending totals. Spec says lending is "Not spending" (FR §12, T-30) | 863, 1299-1305, 1301, 2260-2263, 3075 | GA-4, GB-6, GC-4 | write off, written off, writeoff, forgive, bad debt, lost. Zero hits in all 34 docs | D-03 | Decide |
| G-08 | System category "Interest earned" (income) flagged system, so lending can create interest income | Lent-money interest appears as income in reports. Spec system categories are only `Interest & charges` and `Not recorded` (docs 02 §12, 03) | 862-863 | GA-4 | interest earned, interest income, lending | D-03 | Decide |
| G-09 | Delete a loan, only when it has no repayments. The amount returns to the source account | Offered only on untouched loans | 3076, 2264-2266, 1240-1275 | GC-5, GB-7 | delete (spec F-18/F-24 cover transactions and accounts only) | D-03 | Decide |
| G-10 | "Erase everything" (Settings > Your data > Danger) clears all transactions on the device after a confirm sheet | One-tap wipe of all data. Not in S-27, S-28 or S-29 | 1966, 3186 | GB-3, GC-8 | erase, wipe, delete all, delete everything, reset app. Only "restore" and "no recovery" exist | new | Decide |
| G-11 | Seasonal categories: a category is seasonal when the median of the same calendar month differs from its overall median by at least ₹500 and at least 25%, with at least 2 same-month samples. Bill-linked categories are excluded | Shows "heavier than usual in this month of the year" per category. Spec has F-41, M-25 (YoY, 24 months) and the line "October is usually your heaviest month" (07 §14), with no thresholds | 1417-1438 | GB-4 | seasonal, seasonality, season | new | Decide |
| G-12 | Year-to-date comparison: this January-to-today against last year over the same span, with a "history starts in X" fallback | A year-so-far versus last-year figure | 1439-1447 | GB-5 | ytd, year to date, year-to-date | new | Decide |
| G-13 | The add FAB changes to "Add a regular bill" on the Regular bills screen | The primary button changes meaning by screen. Spec: FAB is always "add transaction" (09, 29) | 2389 | GB-8 | fab, floating, add a regular bill | D-08 | Decide |
| G-14 | "Record this payment now" on a bill sheet opens the add keypad pre-filled with amount, category, payee and account | One-tap logging of a due bill. Spec has only "Link a payment" for overdue items (11 S-21) and auto-matching (10 F-12) | 2029-2033 | GB-9 | record payment, link a payment, pre-filled | new | Decide |
| G-15 | "Duplicate to today" action on transaction detail | One-tap copy of any transaction dated today. In the spec "duplicate" means import de-dup or the duplicate-entry warning only | 3694, 3809-3813 | GC-10 | duplicate, copy, clone, repeat transaction | new | Decide |
| G-16 | "Lock now" button on the App lock screen | User locks the app manually. Spec covers lock on launch and after backgrounding only | 3287 | GC-11 | lock now, S-41, F-26 | new | Decide |
| G-17 | "Getting started" entry in Settings that replays the first-run setup | Onboarding can be reopened later. F-01 and S-31 are first-launch only | 2965, 3202-3232 | GC-12 | replay, re-run, rerun, onboarding | D-06 (content of steps) | Decide |

## 4. Section B. Contradicts the spec

| ID | Feature | What it does for the user | Spec doc and section quoted | Proto lines | Source IDs | Search terms used | Decision / change item | Suggested action |
|---|---|---|---|---|---|---|---|---|
| G-18 | Lending modelled as a separate "Money lent" asset account (subtype "Money lent", `isLoans`, `avail:false`) with a `loans` list, instead of a `move` to Outside | Lent money gets its own balance, screens, totals and statuses | Doc 04: "Lending ₹5,000 to a friend = move Bank to Outside, label 'Loan to Ravi', not spending". FR v1.1 T-30 and §12 say the same. Doc 02 §Outside: lending to a person is untracked; EX-06: Outside is "never a balance". Doc 03: system accounts are only `StartingBalance` and `Outside` | 860, 865, 1228-1309, 2194, 2974, 2983, 2991-3079, 3209 | GA-6, GB-10, GC-13 | lending, loan to, Outside, receivable, isLoans | D-03 | Decide |
| G-19 | Outstanding lent principal and "Total you are owed" counted in "What you have" and the Accounts total | Account totals include money held by other people | Doc 02 §10 Outside "contributes to no total"; doc 06 M-02 sums asset accounts only; doc 01 line 121 removes net worth | 2981, 2986, 3004 | GC-14 | Outside, net worth, M-02 | D-03 | Decide |
| G-20 | Daily spending calendar: month grid with a spend amount per day, shaded by amount (heatmap), per-month mini-calendar strips, "tap a month to see day by day" drill-down, and a day-grid weekday table | Reports show a per-day spend view. Scan B notes the grid has amounts and no shading (borderline). Scan A classed the day-grid table PARTIAL (GA-11). See screenshots 7 and 8 | Doc 01 §Out of scope: "calendar heatmaps (never to be added)". Doc 08 §1: "no heatmaps, no decorative visuals". Doc 29 line 84: no heatmaps. FR v1.1 §Removed repeats it. Only calendar allowed: due-dates strip (08 §7, R-06) | 349-413, 1448-1473, 2562-2594, 2685-2686 | GA-7, GA-11, GB-16, GB-U3, GC-15 | heatmap, calendar, day grid, per-day, totals per day | new | Decide |
| G-21 | Passcode length is 4 digits (4 dots on the lock screen; passcode check in JS expects exactly 4) | Weaker lock than specified. Scan A flagged the dot count as "verify"; scan B confirmed 4 digits in JS | Doc 20 §App lock: "Passcode (6 digits minimum)" | 805-809, 1748-1750 | GA-8, GB-11, U-2 | passcode, 6 digits, S-41 | D-30 | Decide |
| G-22 | Transaction date picker blocks every date after today. Quick options: Today, Yesterday | Users cannot pre-date to tomorrow | Docs 11 S-02, 12, 10 F-01, 18: "blocking dates beyond tomorrow" (tomorrow is allowed) | 1781, 1787, 1795, 1802 | GB-12 | future date, tomorrow, beyond | D-21 | Decide |
| G-23 | Typical month-to-date baseline (`spentMTD`) includes `correction` (Not recorded) transactions and keeps non-monthly commitment payments. The full-month `baseSpend` excludes both | "A typical month is about X by this point" and year-on-year are skewed by one-offs and balance fixes | Doc 07 §2: "Excluded from every baseline: exclude_from_typical; non-monthly commitments; Not recorded corrections" | 1139, 1327-1333, 1476 | GB-13 | baseline, correction, Not recorded, exclude_from_typical | D-19 | Decide |
| G-24 | Bill occurrence is "matched" if any transaction carries the commitment id in the period. No window on date or amount. UI copy says matching ignores the exact amount | A far-off or very different payment satisfies a bill | Doc 07 §7 and doc 10 F-12: same payee within ±7 days of the due date and within ±20% of the expected amount; otherwise overdue | 1501, 2100 | GB-14 | matched, ±7, ±20%, window, commitment id | new | Decide |
| G-25 | Calculator evaluates strictly left to right (`340+120×2` gives 920) | Expression totals can be wrong | Doc 12 C-05: "flat expression left-to-right with standard precedence" | 1677-1693 | GB-15 | calculator, precedence, left-to-right | new | Decide |
| G-26 | Transaction search also matches category name and any number substring of the rounded-rupee amount | Searching "food" or "50" returns different results than the spec | Doc 17 §Fields searched: `payee.name` and note, "Nothing else". Amount search must be exact and offer a range chip, not a substring (17 line 13) | 3607-3610 | GC-16 | fields searched, payee.name, amount search | D-25 | Decide |
| G-27 | Limit pace labels: "Ahead of pace" above 1.15, "Behind" below 0.85. Home insight "ahead of your limit" at 1.15 | Warnings and the Home insight fire earlier and more often | Doc 07 §10: calm warning only when pace > 1.25 after day 10 and projected overrun >= ₹300. Doc 06 M-15: pace from day 5 | 2737-2740, 3854-3858 | GC-17 | pace, 1.25, overrun, ahead of | new | Decide |
| G-28 | Onboarding content: step 1 accounts, step 2 regular bills, step 3 record the first expense ("Three taps") | Different first-run sequence; no currency/format step and no categories step | Doc 10 F-01 and doc 11 S-31: step 1 currency/format confirm, step 2 first account (required), step 3 categories (defaults pre-selected, skippable) | 3202-3231 | GC-18 | onboarding, S-31, F-01 | D-06, D-29 | Decide |
| G-29 | Accounts hero "Money available" uses `moneyAvailableAll` (includes private accounts) while Home, Plan and the widget exclude them | Two different "Money available" numbers when any account is private | Doc 11 S-11: assets "sum to Money available exactly"; doc 09 §4: every aggregate drills to matching detail | 2979, 3899 | GC-19 | S-11, sum to, drill | D-05 | Decide |

## 5. Section C. Partial: the spec covers it, the prototype adds or changes something

| ID | Feature | What it does for the user | What differs (spec vs prototype) | Proto lines | Source IDs | Search terms used | Decision / change item | Suggested action |
|---|---|---|---|---|---|---|---|---|
| G-30 | Income vs expense trend line chart with tappable points (income, expense, net) and a timeline selector. Folded into Reports > Overview with period breakdown rows and a net cash flow hero | Income/expense/net reading, long windows inside Overview | Spec R-05 "Over time" (S-36, 08 §6, P1) is a separate report: spending line with P25-P75 band and per-category trend lines. Spec windows are 3/6/12/24 months (08 R-05). Doc 12 period selector: This month / Last month / Choose. Prototype chips: This Month, Last 3 Months, Last 6 Months, 1 Year, All Time (GA-10); Overview selector Month / 3 months / 6 months / 1 year / All (GC-24). Prototype has no R-05 | 242-248, 298-336, 835-841, 2510-2692, 2644-2653, 2683, 2687 | GA-9, GA-10, GC-24 | income vs expense, net, trend, timeline, All Time, 1 Year | new | Decide |
| G-31 | Widget: in-app preview card and config screen with show/hide toggles for Money available and Spent this month, plus three quick actions (Spent, Received, Moved) | Widget shows two figures and three quick-add entry points | Spec S-42 (doc 11 line 143): choose Money available OR Left to spend, and whether quick-add presets to Spent. Prototype: no Left to spend option, adds a Spent figure and three actions | 447-465, 3252-3273 | GA-12, GC-20, U-3 | widget, S-42, preset | D-27 | Decide |
| G-32 | Category picker: grouped list with sub-labels, "Every category" row for filters, in-picker "+ Create a new category" | Create a category without leaving the add flow | Spec S-04: icon-and-label grid, search only above 12 categories, recent/frequent order. Inline create is not stated (doc 09 S-21 is reached from S-20) | 604-635 | GA-13 | picker, create a category, S-04, S-21 | new (see change list P0-02/P0-03 area) | Decide |
| G-33 | Payee suggestion chips: tappable chips under the payee field, the 6 most recent payees shown on an empty field. Picking one sets the category at once, even on first use | One-tap payee reuse | Spec S-05/F-01: autocomplete list after 3 characters ranked by `times_used`; category set on the second use | 576-582, 1722, 2310 | GA-14, GB-30 | autocomplete, times_used, S-05, F-01 | new | Decide |
| G-34 | Buffer: seeded default ₹2,000 (`buffer:200000`); presets 0, 1k, 2k, 5k, 10k; Left to spend "promised" covers only unmatched occurrences in the current period | Left to spend starts lower; promised is lower than spec | Spec doc 03 `buffer_paise` default 0. Spec M-12 "promised" uses a horizon and includes owed balances due; M-13 formula is the same. Preset values unspecified | 867, 1506-1514, 1968-1971 | GA-15, GB-31 | buffer_paise, M-12, M-13, promised | D-20 (promised/card dues) | Decide |
| G-35 | Account subtype labels "Bank account / Cash / Wallet / Credit card / Loan"; a "Wallet" account is seeded | Naming only (minor) | Spec subtypes: `cash, bank, upi_wallet, savings`, `card, loan` (doc 02). No `savings` seeded; label wording differs | 880-885 | GA-16 | subtype, upi_wallet, savings | new | Decide |
| G-36 | Detected recurring bills: detection is monthly-only (same payee, at least 3 times, median gap 24-38 days, spread <= 6, amount deviation <= 20%). Accepting retro-tags every past transaction of that payee as repeating and linked to the new bill. Each row has a one-tap "Add" (up to 3 shown), no dismiss. Dismissals are stored as "rec:payee" | Quick add of suggested bills without a review editor | Spec 07 §7: at least 3 occurrences, ±7 days of monthly/quarterly/annual, ±20%, category fallback, "never auto-creates". Spec S-39: pre-filled editor with evidence, Confirm or Dismiss. F-12: suggestions are pre-filled and need confirmation; nothing says history is re-linked | 1556-1587, 2903-2910 | GB-19, GB-20, GC-34 | recurrence, rec:payee, S-39, F-12, quarterly, annual | new | Decide |
| G-37 | Qualifying month: gates are at least 10 non-start entries and drift <= 15%. Takes the last 6 calendar months then filters. Counts correction rows as entries | Slightly different baseline sets | Spec 07 §2 has the same two gates. Spec takes the last 6 qualifying months, has a "manually excluded by user" gate, and does not count corrections | 1349-1358, 1378-1385 | GB-17 | qualifying, 07 §2 | D-19 | Decide |
| G-38 | Unusual spending: 3 x max(MAD, 0.1 x median), x1.3, ₹500, MAD/median <= 0.5. Needs only 4 non-zero months within up to 6 | Alerts can appear earlier than the spec allows | Spec 06 M-21 and 07 §8: same three gates; eligibility is at least 6 qualifying months with at least 4 non-zero. Prototype omits the 30-day cooldown, the "not useful" suppression, and the 6-11 months "about" wording | 1595-1611 | GB-18 | MAD, unusual, M-21, cooldown | new | Decide |
| G-39 | "Not useful" dismisses per subject (`unusual:id`, `price:id`) | Dismissal scope is narrower | Spec 07 line 98: "Not useful" permanently suppresses the TYPE; 30-day cooldown per category | 3830, 3838, 3845 | GC-42 | not useful, suppress | new | Decide |
| G-40 | Reliability state "gaps": recorded days/16 < 0.5, last entry >= 14 days ago, or drift > 15%. "Starting" state tied to the stage prop | Trigger is approximated; wording is the same | Spec 07 §11 has the same thresholds. Spec "Just starting" means < 30 days of history and the ratio denominator is undefined. Prototype hard-codes 16 days | 1525-1537 | GB-21 | reliability, gaps, 07 §11 | new | Decide |
| G-41 | Month start day offers only 1, 5, 15, 25, with a toast "Reports now run from day N" | Fewer choices and no warning | Spec doc 03: `month_start_day` 1-28. Spec 10 F-23 and 11 S-30: a warning that report periods shift | 1110-1126, 1988-1991 | GB-22 | month_start_day, F-23, S-30 | D-15 (period naming) | Decide |
| G-42 | Undo restores a full snapshot of all transactions for one operation (add, delete or balance fix). Toast lasts 5 seconds. Balance-check undo vanishes with the toast | Balance-check undo is not persistent; no per-record undo for edits | Spec 12 C-14: Undo for every create and delete, 5 s auto-dismiss (in spec). Spec 02 §balance-check and 10 F-14: balance-check undo persists until the next check | 1645-1649, 1733-1742, 2376-2382 | GB-24 | undo, 5 s, F-14 | D-02 | Decide |
| G-43 | Closing the add sheet (`closeSheet`) never prompts to discard a non-empty amount (other close paths not checked) | Possible silent loss of typed input | Spec 09 §Unsaved input and 12: "Dismissing the add sheet with a non-empty amount prompts to discard" | 1912 | GB-25 | discard, unsaved input | new | Decide |
| G-44 | Seasons and year-on-year content: medians of a calendar month across years, a "thin month" flag, same-day-aligned YoY for the current month, a dedicated screen with this month vs last year, typical month of year, seasonal categories, year-to-date vs last year, and a locked "months to go" state. One 24-complete-month gate | All detailed content is prototype-defined | Spec 06 M-25 "YoY, minimum 24 months"; INV-17 day-aligned comparison; F-41 is P2; 10 F-18 "reachable and explain unmet condition"; 15 S-15 allows locked views to show the unmet condition (consistent). No screen, section or algorithm defined in 08. Thin-month rule and month-of-year median unspecified. See also G-11, G-12 | 1364-1416, 3471-3526 | GB-26, GC-30 | M-25, INV-17, F-41, thin month | new | Decide |
| G-45 | Bill cadence choices Monthly, Quarterly, Yearly. Non-monthly cadence is flagged "left out of typical-month comparisons". Quarterly rule `month % 3 == dueDay % 3`. Due day capped at 28 | No custom-interval bills | FR v1.1 and doc 03: cadence also includes `custom_days`. Baseline exclusion is in 07 §2. The quarterly rule is stated nowhere | 1494-1503, 2072-2078, 2116-2125 | GB-27 | cadence, custom_days, quarterly | new | Decide |
| G-46 | Editing a bill amount by presets (current, +10%, -10%) records `priceFrom` and `priceSince` | Every edit counts as a price change | Spec 07 §9: price change is detected from `commitment_amount_history` (at least 5% and ₹100). Presets not specified | 2063-2070 | GB-28 | price change, commitment_amount_history | new | Decide |
| G-47 | Limit sheet suggests the typical month, 1.2 x typical, ₹5,000, ₹10,000, a custom amount, and a warning that a limit under typical "will show you as over pace". Plus a "Without a limit" section (first 6 categories, tap to set) | Suggestions appear even with no baseline; shortcut to set limits | Spec S-18: suggestion from the median once at least 3 qualifying months exist; repeating categories blocked. Spec S-25: list of existing limits plus editor; empty state offers one-tap create | 1993-2017, 2895 | GB-29, GC-35 | S-18, S-25, limit suggestion | new | Decide |
| G-48 | PDF export: "Share report" (Overview / What changed) and "Export report" (This month / Monthly review / Over time), reachable from Reports hub, Overview and Your data. Claims "no account numbers" | PDF share available from Reports | Spec F-42 PDF export is P2 (FR line 394); no screen defined; the report list and "no account numbers" claim are the prototype's | 2139-2152, 2503, 2688, 3185 | GB-32, GC-26 | PDF, F-42, export | new | Decide |
| G-49 | Reports hub composition: six rows Overview, Limits, What changed, Regular bills, Drifting categories, Seasons and year-on-year. "Where it goes" (r02) not listed; most subtitles are fixed text | Where it goes is reachable only via Overview breakdown and period rows | Spec S-15: six cards R-01..R-06 with live one-line answers. Prototype swaps R-02 and R-05 for drift and seasons | 2461, 2484-2507 | GC-25 | S-15, R-01..R-06 | D-29 | Decide |
| G-50 | What changed shown as category delta rows (not a waterfall). Hides differences under ₹200. Includes a "Moving steadily" drift section and an unusual banner | Rows replace the waterfall chart | Spec S-34 / 08 §5: waterfall with tappable bars. ₹200 floor and drift section are additions (drift is M-23, P2, in R-05 per 08 line 104) | 2769-2810 | GC-27 | S-34, waterfall | new | Decide |
| G-51 | Regular bills report (r06): hero monthly load, price-change banner with annual cost, occurrence list with status dots; no due-date calendar strip, no detected section | Annualised price-increase line is extra; strip is missing | Spec S-37 / 08 §7: table plus due-date calendar strip; detected suggestions as a section | 2812-2833 | GC-28 | S-37, 08 §7 | new | Decide |
| G-52 | Drifting categories screen: median of older vs newer months in rupees, 20,000-paise floor. A second drift algorithm in What changed (steady direction, 25%, 50,000-paise floor). The two disagree with each other | Drift shown as a rupee change; two screens may disagree | Spec M-23 (06 line 150): share-based, percentage points vs 6-month median, floor ₹500 monthly median, P2, no standalone screen | 2749-2767, 3433-3469 | GC-29 | M-23, drift | D-26 | Decide |
| G-53 | Category drill-down lists transactions directly (no payee level). Adds a 6-month column chart and a limit bar | One fewer drill level | Spec 09 §4 and S-33: Category > Payee > Transaction | 2835-2857 | GC-31 | S-33, drill | new | Decide |
| G-54 | Must-pay and Flexible shown as two separate drill pages, no stacked bar, no toggle | Navigation instead of a toggle | Spec 08 §3 R-02: stacked bar plus must-pay/flexible toggle | 2679-2680, 3298-3306 | GC-32 | R-02, must-pay | new | Decide |
| G-55 | Plan hub: hero Left to spend, "The maths" rows (available, bills, buffer, left), regular bills link, limits bars, "Manage limits". Buffer is edited from it | Extra headline and maths block on Plan | Spec S-22: two sections (Commitments with monthly load and next due; Limits with on-track count). M-13 breakdown is a panel off Home | 2859-2887, 2872 | GC-33 | S-22, M-13 | D-29 | Decide |
| G-56 | "Your data" is one screen: Backup, Export CSV (current filter), Export PDF, Restore, Import | Fewer screens; CSV scope is the current filter | Spec S-27, S-28, S-29 are three screens; S-28 scope is all or period | 3182-3189 | GC-36 | S-27, S-28, S-29 | new | Decide |
| G-57 | Restore is one confirm sheet. Import is a result-only sheet (rows read / skipped / added), with no pre-confirm preview or invalid-rows list | Less information before replacing or adding data | Spec S-27: shows file date, transaction count and schema version first. Spec S-29: validation preview (new / skipped / invalid with row numbers and reasons) then confirm | 2154-2164, 3185 | GC-37, GC-38 | S-27, S-29 | new | Decide |
| G-58 | App lock details: biometric toggle, disclosure rows ("does not encrypt", "no recovery", "backups not locked"), and an "Encrypt at rest" toggle that uses the passcode as the key | User-visible encryption switch and extra plain-language limits | Spec S-41 / F-26: passcode + biometric, no-recovery statement. DB encryption is P2 (01 F-43, 20 line 13). No user toggle or "passcode is key" rule. 20 line 53 discloses unencrypted backups | 3275-3296 | GC-21 | S-41, F-43, encryption | D-30 | Decide |
| G-59 | Reminders: three toggles (Bills coming up, Balance check nudge after two weeks, Monthly review) with "at most four a month, never about a single transaction" | Three named reminder switches | Spec S-30 / 03 `notification_settings` JSON; 07 line 139: 4 notifications per month; 10 line 85: 14-day balance prompt. Per-type toggles and "never per transaction" wording not specified | 3168-3174 | GC-22 | notification_settings, S-30 | D-28 | Decide |
| G-60 | Preferences: "Show paise" toggle (0 or 2 decimals) and a Dark theme toggle (no "follow system"). Paise described as "on transaction detail". Scan A could not confirm "system" in JS (state holds `theme:'light'`) | No system-theme option; decimals choice reduced | Spec doc 03 line 167: decimals 0-2; theme system/light/dark (doc 13 §11) | 3159, 3162 | GC-23, U-1 | decimals, theme, system | new | Decide |
| G-61 | Account detail: last 12 transactions, Check balance, See all, "Archive or rename" | No running balance; capped at 12 rows | Spec S-12: running-balance history, Edit / Archive / Delete, archived read-only banner with Unarchive (banner not on this screen; intro text only at 3350) | 3081-3093 | GC-39 | S-12, running balance | new | Decide |
| G-62 | Category merge also deletes the source category's spending limit and can merge without a confirm (undo toast) | A limit is silently lost on merge | Spec F-19 / 02 §Category: merge reassigns all references atomically. A limit is a reference | 3401-3408 | GC-40 | merge, F-19 | new | Decide |
| G-63 | Refund records the full or partial amount to the original account dated today. No account or date choice | Fewer fields than the spec | Spec F-06: amount, account credited (defaults to parent's), date, then save | 3804-3808 | GC-41 | F-06 | D-23 | Decide |
| G-64 | Limitations list: eight items (adds private balance, passcode not encryption, dynamic seasons note) | Extra items; some reworded | Spec 11 S-19 / FR line 453: six known limitations stated verbatim | 3528-3542 | GC-43 | S-19, known limitations | D-29 | Decide |
| G-65 | Transactions filters: payee chip with a payee picker sheet, "Came back" kind chip, account chip. No amount-range filter | Different filter set | Spec S-10: chips for period, account, category, kind; amount range. Doc 17 lists payee only via drill-down | 3628-3639 | GC-44 | S-10, doc 17 | new | Decide |
| G-66 | "Mark as a one-off" from a Home insight silently marks the single largest transaction in that category | One tap alters one transaction without choosing it | Spec 07 line 143: sets `exclude_from_typical`; the target transaction is not specified | 3878-3885 | GC-45 | exclude_from_typical, one-off | new | Decide |

## 6. Section D. Prototype-only scaffolding (not product features)

| ID | Item | What it is | Proto lines | Source IDs | Search terms | Decision | Suggested action |
|---|---|---|---|---|---|---|---|
| G-67 | "Jump to a screen" chips (S-xx list) and the shell panel around the phone frame | Developer navigation. Not a user feature. Not counted as a gap by scans A and B | 52-62, 832, 2405-2444 | GA-5, U-4, GB-U1 | Jump to, tweaks, dataset | new | Decide |
| G-68 | Tweaks props: `dataset` (seven months, first week, nothing recorded), `stage` (lifecycle stage), `buffer` | Test harness that simulates data maturity. Stage gating itself is in the spec (07 §14) | 52-55, 867, 1060-1070, 1538-1540, 999-1054 | GB-U2 | stage, dataset | new | Decide |

Other unclassified items from scan C "Unsure" have no ID and are not features: `dismissInsight` (line 3920) uses an undefined variable `u`; `splitTx` (line 3709) looks like dead code; passcode fixed to `1234` (line 3281) and category rename toggling "(yours)" (line 3397) are placeholder stubs (see D-10).

## 7. Section E. Screenshots from the project chat

All nine images were readable. None contains a typed instruction from the product owner. All items below are visible in the screenshot, not independently verified.

| # | File suffix | What it shows | Requirements / defects the transcript lists | Covered by |
|---|---|---|---|---|
| 1 | 0256204 | Own prototype, light theme: prototype notes, palette picker, Android frame with Transactions (S-07) | 10 requirements: built from the spec pack; figures computed live over 294 seeded transactions (Feb-Aug 2026) and drill-downs reconcile; lifecycle stage month 7; inline stroked icon set; Tweaks datasets; theme in Settings > Preferences; eight palette directions plus Light/Dark; transactions list with search "payee, note or amount", chips, summary line "32 transactions · ₹51,272 out · income private", day groups with totals; 5-tab nav; FAB overlaps the 12 Aug amount | G-01, G-03 ("income private"), G-67/G-68 (jump list, Tweaks), G-26 (search by amount) |
| 2 | 0267478 | Own prototype, Dark theme, "Distinctive Berry" palette, same Transactions screen | Dark theme expected; screens S-18, S-34, S-35, S-36 listed. Defects: very low contrast in dark theme (search, chips, rows dim); FAB overlaps "₹288" so it reads "88" | G-01 (palette). Contrast and FAB overlap defects: no G-row (not a spec gap); see D-08, D-31 |
| 3 | 2399958 | Crop of Reports: "Income vs expense trend" | "Each point is one month". Defects: Income and Expense lines are the same green, so the legend cannot tell them apart; "No transactions in this period yet." shows under a chart that plots data | G-30 (trend chart). Defects: no G-row |
| 4 | 3144923 | Plan > Regular bills list | "Bills are a memory aid"; "the app matches them to transactions you record, it never creates a payment on your behalf"; each row shows frequency, payee, status (paid / due date / overdue in amber); rows lead to a bill detail; Monthly and Yearly shown | G-24 (matching), G-45 (cadence). Mostly consistent with spec |
| 5 | 3703575 | Regular bills, scrolled to top, "Looks like a regular bill" | "Spotted by looking at what repeats in your own entries. Nothing is added until you say so"; suggestion shows amount, cadence ("about every 31 days") and count ("seen 7 times"); one-tap "Add". Note: Home loan EMI is a suggestion here but listed as paid in image 4 (two prototype states) | G-36 |
| 6 | 5660625 | Weekly calendar strip with different styling (cream background, rounded font, no rupee symbols). Source unclear: reference app, competitor or alternate render | Day cells show per-day amount in red, one decimal; week starts on Sunday here (image 8 starts on Monday). No text states a requirement | G-20 (per-day calendar; visual pattern only) |
| 7 | 5957739 | Reports > Over time | "Aug 2026 (so far) ... to day 16" partial-month label; each month compared to typical ("₹937 above typical"); net per month in amber; "Tap a month to see day by day"; daily spending as a colour-intensity heatmap | G-20 (heatmap, day-by-day), G-30 (Over time folded into Overview) |
| 8 | 6559631 | Daily spending calendar for Aug 2026 | Week starts Monday; days with no spending show only the date; future days faded; amounts negative rupees, no decimals; days sum to header -₹51,272 | G-20 |
| 9 | 6601603 | Reports > Where it goes, scrolled | Rows show bar, amount, share and Must-pay/Flexible tag; "Not recorded" ₹700 has no percentage; footer says balance-check spending is hatched and left out of percentages; Must-pay ₹35,325 + Flexible ₹15,247 = ₹50,572. Defect: the "Not recorded" bar is shown empty, not hatched | G-54 (Must-pay/Flexible) partially. Spec-aligned behaviour otherwise; the hatch defect has no G-row |

## 8. Section F. Decisions this list creates or settles

### F1. New product-owner questions (gaps with no D-xx item)

The sources give options only where stated. Otherwise the question has no options.

| Q | Question | Rows | Options in sources |
|---|---|---|---|
| Q-1 | Does the per-day spending calendar ship? The spec removed calendar heatmaps. Scan B notes the grid has amounts and no shading and calls it a product decision | G-20 | none given |
| Q-2 | Does "Erase everything" ship? It is not in S-27, S-28 or S-29 | G-10 | none given |
| Q-3 | Do seasonal categories and year-to-date comparison ship, with the prototype thresholds (₹500 and 25%, at least 2 samples)? | G-11, G-12, G-44 | none given |
| Q-4 | May a bill be matched without the ±7 day and ±20% window? | G-24 | none given |
| Q-5 | Should the calculator use standard precedence? | G-25 | none given |
| Q-6 | Does search match category name and amount substrings? (D-25 covers amount semantics only) | G-26 | none given |
| Q-7 | Which pace threshold applies, 1.25 with ₹300 overrun (spec) or 1.15 and 0.85 (prototype)? | G-27 | two values from the sources |
| Q-8 | Should "Record this payment now", "Duplicate to today", "Lock now", "Replay setup" and the FAB-per-screen action be added to the spec? | G-13 to G-17 | none given |
| Q-9 | Should detected bills be added in one tap, with history retro-tagged, or through a review editor with Dismiss? | G-36 | none given |
| Q-10 | Do the PDF share and export sheets and the single "Your data" screen replace S-27 to S-29? | G-48, G-56, G-57 | none given |
| Q-11 | Do the prototype's Reports hub, What changed, Plan hub and Regular bills report layouts replace the spec screens? (D-29 covers the hub, Plan and limitations text) | G-49 to G-55 | none given |
| Q-12 | Is the lifecycle of money lent (statuses, simple interest, repayments, due dates, delete rule) wanted? Beyond D-03's yes/no, the sources ask whether write-off is spending or a separate loss line | G-04 to G-09 | spending or separate loss line (from D-03) |
| Q-13 | Should the "Not useful" dismissal and the "Mark as a one-off" target follow the spec (type-level suppression; user picks the transaction)? | G-39, G-66 | none given |
| Q-14 | Should category merge move or delete the source category's limit? | G-62 | none given |

### F2. Existing D-xx items that this list gives new evidence for

| D-xx | New evidence from this list |
|---|---|
| D-02 (Undo) | G-42: prototype undo is one snapshot and the balance-check undo disappears with the 5 s toast |
| D-03 (Lending) | G-04 to G-09, G-18, G-19: the prototype has a full lending tracker (form, simple interest, repayments, statuses, write-off, delete) and counts it in "What you have" |
| D-04 / D-31 (Palettes, dark variant) | G-01: three scans and screenshots 1 and 2 show 8 palettes in light and dark; screenshot 2 shows low dark-theme contrast |
| D-05 (Private accounts) | G-03, G-29: private accounts touch all totals; the Accounts hero uses a different Money available than Home |
| D-06 / D-29 (Onboarding, spec vs design) | G-17, G-28: onboarding differs from F-01 and S-31 and can be replayed from Settings. G-49, G-55, G-64, G-31 add Reports hub, Plan hub, limitations text and widget as divergences |
| D-08 (FAB) | G-13: FAB changes to "Add a regular bill"; screenshots 1 and 2 show FAB overlap |
| D-09 (Time of day) | G-02: two scans confirm a time row and clock sheet |
| D-10 (Placeholder flows) | Section D note: passcode `1234` and category rename stub in scan C |
| D-19 (Corrections in baselines) | G-23, G-37: the month-to-date baseline and qualifying-month count include corrections |
| D-20 (Card dues in promised) | G-34: prototype promised covers only unmatched occurrences in the current period |
| D-21 (Future dates) | G-22: the date picker blocks all future dates |
| D-23 (Refund account and date) | G-63: refund has no account or date choice |
| D-25 (Amount search) | G-26: search matches category name and amount substrings |
| D-26 (Drift definition) | G-52: two drift algorithms in the prototype disagree |
| D-27 (Widget) | G-31: widget has show/hide toggles, a Spent figure and three actions |
| D-28 (Reminders default) | G-59: three named reminder toggles |
| D-30 (Lock policy) | G-21, G-58: 4-digit passcode confirmed in JS, and an "Encrypt at rest" toggle exists (spec P2) |
| D-15 (Period naming with custom start day) | G-41: month start day offers 1, 5, 15, 25 only |

## 9. Section G. Not listed because IN SPEC

Count: 17 (scan A) + 16 (scan B) + 18 (scan C) = 51 IN SPEC rows. No detail is kept here.

- Scan A: GA-17 to GA-33
- Scan B: GB-33 to GB-48
- Scan C: GC-46 to GC-63

## 10. Traceability: source ID to G- row

| Source ID | Maps to |
|---|---|
| GA-1 | G-01 (A) |
| GA-2 | G-02 (A) |
| GA-3 | G-03 (A) |
| GA-4 | G-07 (A), G-08 (A) |
| GA-5 | G-67 (D) |
| GA-6 | G-18 (B) |
| GA-7 | G-20 (B) |
| GA-8 | G-21 (B) |
| GA-9 | G-30 (C) |
| GA-10 | G-30 (C) |
| GA-11 | G-20 (B) |
| GA-12 | G-31 (C) |
| GA-13 | G-32 (C) |
| GA-14 | G-33 (C) |
| GA-15 | G-34 (C) |
| GA-16 | G-35 (C) |
| GB-1 | G-03 (A) |
| GB-2 | G-01 (A) |
| GB-3 | G-10 (A) |
| GB-4 | G-11 (A) |
| GB-5 | G-12 (A) |
| GB-6 | G-07 (A) |
| GB-7 | G-04 (A), G-05 (A), G-06 (A), G-09 (A) |
| GB-8 | G-13 (A) |
| GB-9 | G-14 (A) |
| GB-10 | G-18 (B) |
| GB-11 | G-21 (B) |
| GB-12 | G-22 (B) |
| GB-13 | G-23 (B) |
| GB-14 | G-24 (B) |
| GB-15 | G-25 (B) |
| GB-16 | G-20 (B) |
| GB-17 | G-37 (C) |
| GB-18 | G-38 (C) |
| GB-19 | G-36 (C) |
| GB-20 | G-36 (C) |
| GB-21 | G-40 (C) |
| GB-22 | G-41 (C) |
| GB-23 | G-02 (A) |
| GB-24 | G-42 (C) |
| GB-25 | G-43 (C) |
| GB-26 | G-44 (C) |
| GB-27 | G-45 (C) |
| GB-28 | G-46 (C) |
| GB-29 | G-47 (C) |
| GB-30 | G-33 (C) |
| GB-31 | G-34 (C) |
| GB-32 | G-48 (C) |
| GB-U1 | G-67 (D) |
| GB-U2 | G-68 (D) |
| GB-U3 | G-20 (B) |
| GC-1 | G-05 (A) |
| GC-2 | G-06 (A) |
| GC-3 | G-05 (A) |
| GC-4 | G-07 (A) |
| GC-5 | G-09 (A) |
| GC-6 | G-04 (A) |
| GC-7 | G-03 (A) |
| GC-8 | G-10 (A) |
| GC-9 | G-01 (A) |
| GC-10 | G-15 (A) |
| GC-11 | G-16 (A) |
| GC-12 | G-17 (A) |
| GC-13 | G-18 (B) |
| GC-14 | G-19 (B) |
| GC-15 | G-20 (B) |
| GC-16 | G-26 (B) |
| GC-17 | G-27 (B) |
| GC-18 | G-28 (B) |
| GC-19 | G-29 (B) |
| GC-20 | G-31 (C) |
| GC-21 | G-58 (C) |
| GC-22 | G-59 (C) |
| GC-23 | G-60 (C) |
| GC-24 | G-30 (C) |
| GC-25 | G-49 (C) |
| GC-26 | G-48 (C) |
| GC-27 | G-50 (C) |
| GC-28 | G-51 (C) |
| GC-29 | G-52 (C) |
| GC-30 | G-44 (C) |
| GC-31 | G-53 (C) |
| GC-32 | G-54 (C) |
| GC-33 | G-55 (C) |
| GC-34 | G-36 (C) |
| GC-35 | G-47 (C) |
| GC-36 | G-56 (C) |
| GC-37 | G-57 (C) |
| GC-38 | G-57 (C) |
| GC-39 | G-61 (C) |
| GC-40 | G-62 (C) |
| GC-41 | G-63 (C) |
| GC-42 | G-39 (C) |
| GC-43 | G-64 (C) |
| GC-44 | G-65 (C) |
| GC-45 | G-66 (C) |
| U-1 | G-60 (C) |
| U-2 | G-21 (B) |
| U-3 | G-31 (C) |
| U-4 | G-67 (D) |
