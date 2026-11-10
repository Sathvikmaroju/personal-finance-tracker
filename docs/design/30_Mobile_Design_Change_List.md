# Mobile Design Change List (consolidated, rewritten from scratch)

Input for Claude Design (the tool that edits the mobile design). Date: 2026-11-01 (updated 2026-11-02 with the phase 1 follow-ups).
This document supersedes the earlier version of `30_Mobile_Design_Change_List.md`. It is a consolidation only: no new review findings were added and none were dropped by the consolidation (engineering findings were removed at the product owner's request; TL-1 is kept because it is a visible defect). The product owner's decisions (`32_Decisions_Log.md`) are folded in: section 3 lists them, every affected item follows them, items they make obsolete are in section 6, and the spec documents to amend are in section 9. All 111 source IDs are traced in section 8.

## 1. What was reviewed and how

Phase 1 (P0) was applied by Claude Design on 2026-11-02; results are being verified.

- **Design file:** `design/mobile/Personal Finance App.dc.html` (working file, deleted 2026-11-10. The latest prototype is `docs/design/prototype/`). The file is now **complete at 3,927 lines**. Earlier reviews read an older truncated copy (3,427 lines, cut mid-statement); the previously missing tail (Home, Transactions list/detail/edit/split/refund, Payees/limitations, bill-detail end, drift, seasons, builders) was reviewed afterwards as `TL-n`.
- **Targets:** React Native on Android, offline, manual entry, India / INR (integer paise, FY Apr-Mar).
- **Specs cited:** `docs/shared/` and `docs/engineering/` doc numbers, exactly as the reports cite them.

| Stage | Source file (working files, deleted 2026-11-10) | ID prefix | IDs | What it is |
|---|---|---|---|---|
| Code-reading review, senior UI/UX | `review_uiux.md` | UX- | 50 | Old truncated copy |
| Code-reading review, finance (India) | `review_finance.md` | FIN- | 31 | Old truncated copy; logic also run in Node |
| Code-reading review of the tail | `review_tail.md` | TL- | 18 | Complete 3,927-line file; code only (TL-1 restored) |
| Playwright verification, UX | `verify_uiux.md` | UX- results + VUX- | 7 new | Running prototype, measured audits |
| Playwright verification, finance | `verify_finance.md` | FIN-/TL- results + VFIN- | 5 new | Running prototype, ledger recomputed |

Total source findings: UX 50 + FIN 31 + TL 18 + VUX 7 + VFIN 5 = **111**.

### Method and limits

- **Verification environment:** Playwright (Chromium) against the running prototype; device frame 412 x 892, **real app layout 396 x 812 CSS px** (not 412 or 428). Datasets switched through the app's `applyDataset()` (Seven months default, Two years, First week only); light and dark through the app's own Preferences toggle; palette sweep through app state; font scale **simulated** at 1.3x and 2.0x by scaling text only, at frame widths 412 and 360. App "today" is 16 Aug 2026.
- **Finance verification** drove the app's own methods (`saveAdd`, `recordCheck`, `recordBack`, `applySplit`, `deleteTx`, `mergeCategory`) and real clicks, then compared `logic.state` with an independent integer-paise recomputation.
- **Not tested:** no real device; TalkBack / VoiceOver spoken output, haptics, swipe-to-dismiss, switch access, real sp scaling and the native date/time/file pickers were not tested. Real 360 x 740 and 412 x 892 viewports cannot be used because the prototype shell is not responsive (VUX-7).
- **Engineering review was excluded at the product owner's request.** TL-1 is the one exception: it is a defect the user sees (P0-16).
- **Decisions:** the "Decision/gap source" field of an item lists the decision IDs (`D-`, `Q-`) from `32_Decisions_Log.md` and the gap IDs (`G-`) from `31_Prototype_vs_Spec_Gaps.md` that shaped it.
- **Priority key:** P0 = breaks a core task, loses data, misstates money or violates a hard invariant. P1 = clear spec/WCAG violation, misleading, or high friction. P2 = polish, latent, consistency. A merged item takes the highest priority of its parts; no P0 was softened.
- **Line numbers:** where an item says "Lines", the anchor was re-located by Grep on a quoted string in the current 3,927-line file. Lines labelled "(old copy)" come from the older reports and were not re-located; they may be stale. For the anchors checked, the positions in the first ~3,430 lines were unchanged.
- **Screenshots:** in `design/mobile/shots/` (working files, deleted 2026-11-10) (named `UX-n.png`, `FIN-n.png`, `TL-n.png`, `VUX-n*.png`). "None" means the evidence is a script or state result.
- **Status vocabulary:** *Confirmed in running UI* (Playwright), *Confirmed by code reading* (not run), *Not reproduced*, *Cannot test*.

## 2. Start here: top 10 must-fix items (P0)

All 17 P0 items in section 4 must be fixed. These ten come first (largest blast radius: crash, data loss, wrong money, broken core task).

| # | Item | One line | Sources | Status | Decisions |
|---|---|---|---|---|---|
| 1 | P0-04 | App goes blank with zero transactions and after "Erase everything" (TypeError at the jump list) | VUX-1 | Confirmed in running UI | Q-2, D-06a |
| 2 | P0-05 | Category merge: no confirmation, wrong Undo, 12 orphan transactions, blank toast name, and a bill pointing at a merged category blanks the whole app | UX-36, VUX-2, FIN-26, VFIN-1 | Confirmed in running UI | Q-14, D-02 |
| 3 | P0-06 | Amounts shown with paise dropped (toast "Spent ₹340" for 340.99; rows and totals disagree) | UX-20, FIN-6, VFIN-5 | Confirmed in running UI | none |
| 4 | P0-01 | Add sheet opens with More expanded; Save is 102 px below the fold | UX-1 | Confirmed in running UI | D-09, D-11 |
| 5 | P0-03 | "Create a new category" throws away the typed entry and moves to Settings | UX-3 | Confirmed in running UI | none |
| 6 | P0-07 | White text on accent fails in dark mode for all 8 palettes (FAB, Save, primary buttons); all 16 palette/theme pairs must pass | UX-27 | Confirmed in running UI | D-04 |
| 7 | P0-08 | Balance check "money found" is added to Spent instead of Received | FIN-1 | Confirmed in running UI | none |
| 8 | P0-09 | Default Home shows Money available ₹3,550 and Left to spend ₹901 against a real ₹51,200 / ₹43,653 (private must hide on screen only) | FIN-2 | Confirmed in running UI | D-05 |
| 9 | P0-11 | Bills never match the payments the user records (including the "Record this payment now" button) | FIN-4, TL-13 | Confirmed in running UI | Q-4 |
| 10 | P0-12 | Editing a transaction rebuilds it and silently drops bill, split, group and refund links | TL-2 | Confirmed in running UI | D-22 |

P0-16 (Home insight "x" throws a ReferenceError, TL-1) is a P0 and must be fixed, but it breaks one button and loses no data, so it is not in the ten above.

## 3. Decisions made

Product-owner decisions are folded into every item in section 4. Rows marked "decided by assistant, open to revision" (Q-13, Q-14) were delegated to the assistant. D-11 was revised by the product owner on 2026-11-02 (see its row). Items a decision makes obsolete are in section 6; the spec documents to amend are in section 9.

| ID | Decision | Answer | Change items affected |
|---|---|---|---|
| D-02 | Undo | No timer. Undo stays until the next action; also for balance check. | P1-21, P1-36, P1-20, P0-05, P1-28, P1-55, P0-14 |
| D-03 | Lending in v1 | Keep the full lending module (loans, repayments, interest accrual, write-off). | P1-33, P1-46, P1-31, P2-11, P2-16 |
| D-03a | Write-off | A separate loss line, not part of Spent. | P1-33 |
| D-03b | Receivables | A separate "Owed to you" line, not part of "What you have". | P1-33, P1-31 |
| D-04 | Palettes | Ship all 8 palettes; the switcher stays in Preferences. All 16 palette/theme pairs must pass WCAG AA. | P0-07, P1-19, P1-40 |
| D-05 | Private accounts | Hide on screen only; always count in totals. The user chooses which accounts are private. | P0-09, P0-10, P1-12, P1-41, P1-45, P1-31 |
| D-05a | Private: switch and reveal | A toggle per account plus one global "hide all" switch; reveal only by switching off. | P1-45 |
| D-05b | Private: what is hidden | Balance and amounts only; account name and transactions stay visible. | P1-45 |
| D-06 | Onboarding steps | Keep the prototype steps: accounts, bills, record one expense. | P1-38 |
| D-06a | Skip | Skip on every step; the app must work with no accounts, bills or entries. | P1-38, P1-50, P0-04, P1-11 |
| D-07 | Amount abbreviation | Full value everywhere below Rs 1 crore. | P2-09 |
| D-08 | Add button (FAB) | Bottom-right, one meaning: add transaction. | P2-03 |
| D-09 | Time of day | Date and time both under More, optional. | P0-01, P1-04 |
| D-10 | Stub flows | Real design for category rename and preset-only amounts (starting balance, bill edit, due day). Account naming stays as is. Passcode set-up is replaced by D-10a. | P2-22, P1-35, P2-08 |
| D-10a | App lock set-up | A "Turn on app lock" flow with no PIN screens; includes a "phone has no lock" state. | P1-47, P0-17, P2-12 |
| D-11 | Smallest screen and text size | Revised by product owner 2026-11-02: minimum supported device 360 x 640 dp portrait; 320 dp wide must still not break (no clipped or hidden controls). Text up to 200%, tablets show a centred phone column (max 560 dp), landscape must not break. Replaces the earlier decision of a 320 dp minimum width. | P1-56, P0-01, P2-06, P1-20 |
| D-12 | Type sizes | Add type tokens 36 (hero) and 19 (stat). | P1-19 |
| D-13 | Sign prefix | Every money row shows + or -. | P2-20 |
| D-14 | Accounts location | Move Accounts under Home; Settings keeps account set-up only. | P1-51, P1-06, P2-02 |
| D-15 | Period name | Show the date range, e.g. 25 Jul - 24 Aug. | P1-53, P1-16 |
| D-16 | Financial year | User chooses the year start; default January. | P1-52, P1-16, P2-14 |
| D-16a | Year start choices | January or April only; chips This year, Last year, 1 Year; April start labels read "FY 2026-27". | P1-52 |
| D-17 | Tax tagging | None; leave it to CSV export. Interest stays a normal expense. | P1-35, P1-52 |
| D-18 | Balance check, owe less | An adjustment entry; not Spent and not Received. | P1-36 |
| D-19 | Corrections vs typical | Leave corrections out of both the actual and the typical. | P0-15, P1-13 |
| D-20 | Card-paid bills | Count at the card's due date; do not count the bill again. | P1-12 |
| D-21 | Future dates | Today and earlier only. | P1-04, P1-23 |
| D-22 | Edit on linked rows | Everything editable; links always preserved; warn before an amount change. | P0-12 |
| D-23 | Refund account and date | Original account by default, changeable; any date after the purchase. | P1-43 |
| D-24 | Split inheritance | Bill link on the first part only; "exclude from typical" on every part. | P0-13 |
| D-25 | Amount search | Digit match as built (340 finds 340, 3,400, 340.50). | P1-41 |
| D-26 | Drift definition | Rupee difference from typical, as built (doc 06 M-23 amended). | P1-17 (superseded) |
| D-27 | Widget default | No figures by default; the user opts in. Default is quick-add buttons only. | P1-26, P1-48, P2-10 |
| D-28 | Reminders default | Off until turned on; ask notification permission at that moment; cap 4 a month. | P1-39, P1-49 |
| D-29 | Spec vs prototype | The prototype wins; the spec docs get amended (Reports hub, Plan hub, limitations, widget, export, Your data). | P1-08, P1-37, P1-38, P2-10, P2-16 |
| D-30a | App lock method | Biometric with the phone's own PIN or pattern as fallback; the app stores no PIN. | P0-17, P1-47, P1-27 (superseded) |
| D-30b | Encrypt at rest | Not in v1; remove the toggle. | P0-17 |
| D-31 | OLED variant | Designed dark grey (#14171B) only; no true black. | P1-40 |
| Q-1 | Daily spending calendar | Ship it; fix near-invisible future-day cells. | P1-23 |
| Q-2 | Erase everything | Ship it with a typed confirmation and a backup prompt; show a proper empty state afterwards. | P1-54, P0-04, P1-37 |
| Q-3 | Seasonal and year-to-date | Ship both with the prototype rules; hidden until 24 months of history. | P2-18 |
| Q-4 | Bill matching | Automatic: within 7 days of the due date and within 20% of the amount. | P0-11, P1-29 |
| Q-5 | Calculator precedence | Standard maths: 340+120x2 = 580. | P1-03 |
| Q-5a | Brackets | No brackets; x and / before + and - only. | P1-03 |
| Q-6 | Text search fields | Payee, note and category name. | P1-41 |
| Q-7 | Limit pace warning | 25% ahead of pace and Rs 300 over, only after day 10. | P1-15 |
| Q-8, Q-10, Q-11 | Prototype-only actions; export and Your data; hubs | Settled by D-29: the prototype wins; the spec is amended. | P1-08, P1-37, P2-10, P2-16 |
| Q-9 | Accepting a detected bill | Open a pre-filled bill editor with Dismiss; history changes only on Save. | P1-28 |
| Q-12a | Loan interest | Optional simple interest; the user types the yearly rate. | P1-46 |
| Q-12b | Deleting a loan | Delete only if nothing was repaid; otherwise mark settled or archive. | P1-46 |
| Q-13 | "Not useful" on an insight | Decided by assistant, open to revision: hide that insight type; "Mark as a one-off" lets the user pick the transaction. | P1-55 |
| Q-14 | Category merge and limit | Decided by assistant, open to revision: the target keeps its limit (or takes the source's), merge confirms, Undo restores everything. | P0-05 |

Full log: design/32_Decisions_Log.md



## 4. Change list

Each item: **Sources** (every merged ID; the first-listed IDs are the item's own, "Also see" is a cross-reference only), **Screen**, **Issue**, **Status** (with the key measured number), **Change** (an instruction to Claude Design), **Accept** (acceptance check), **Decision/gap source** (the decisions and gaps that shaped the change), **Shot**, **Lines**. An item that waits on another item says **Depends on**.

### 4.1 P0 (must fix)

#### P0-01 Add sheet opens with "More" expanded, so Save is below the fold
- **Sources:** UX-1 · **Screen:** Add sheet (S-02) · **Also see:** TL-13 (the bill button also forces `more: true`, line 3428)
- **Issue:** `openAdd` sets `more: true`; Save sits at the end of the scrolling body. Spec S-02 says collapsed "More" row then Save; F-03 says three taps.
- **Status:** Confirmed in running UI. Sheet body `scrollHeight` 793 vs `clientHeight` 691, so **102 px hidden**; Save top is 797 px below sheet top in a 763 px sheet; keypad visible, **Save not**. At 1.3x font 156 px, at 2.0x 168 px (412 frame) / 172 px (360 frame); at 360 / 1.0x already 156 px. (The review's 950-1,000 dp estimate was too high; the conclusion holds.)
- **Change:** Default `more:false`. Pin Save and the keypad in a non-scrolling footer. Only the optional fields scroll, and they sit under More: payee, note, date and time (D-09). Do not force `more:true` from other entry points (the bill button, TL-13). Keep the clock picker, because time stays (under More).
- **Accept:** At 396 x 812 and at the minimum supported device (360 x 640 dp portrait, D-11 revised) at 100% text, opening the sheet shows amount, category, keypad and Save with no scroll (at 320 dp wide no control is clipped or hidden); payee, note, date and time appear only after More. At 130% and 200% text Save stays reachable without scrolling the keypad away. In landscape Save stays reachable.
- **Decision/gap source:** D-09, D-11 (revised by product owner 2026-11-02); G-02
- **Shot:** `UX-1.png` · **Lines:** 1655 (`more: true`), 3428, 2032 · further (old copy): 515, 522, 563-600

#### P0-02 Category is a second sheet, not inline; the "three taps" claim is false
- **Sources:** UX-2 · **Screen:** Add sheet -> Category picker (S-04, C-07)
- **Issue:** Path is digits, tap Category, full sheet swap, tap row, return, tap Save. The picker is a text list with no icons and a search field at all sizes (spec: search only above 12 categories; icon-and-label grid, 4 per row, recent-and-frequent first). Onboarding step 3 says "Three taps: amount, category, save."
- **Status:** Confirmed in running UI. After typing 340 and tapping Category, one dialog replaces the add sheet; the picker has **0 SVG icons** and a "Search categories" input.
- **Change:** Show the top ~8 recent/frequent categories inline in the add sheet (icon + label, 4 per row) with an "All categories" tile that opens the picker. Remember last-used category per payee. Do not reorder fixed groups by position. Correct the onboarding copy (line 3225) to match the real path.
- **Accept:** Amount -> one category tap -> Save works from one screen. A fresh-install, 5-expense trace shows a median of at most 3 non-digit taps. Onboarding copy matches.
- **Shot:** `UX-2.png` · **Lines:** 3225 · further (old copy): 564-570, 604-635, 1175-1186, 2293

#### P0-03 "Create a new category" inside the picker destroys the entry and switches tabs
- **Sources:** UX-3 · **Screen:** Category picker -> New category
- **Issue:** `createGo` calls `jumpTo('settings', ...)`, which sets `add:null`, `sheet:null`; after creation `back()` lands on the Categories list. Amount, date and payee are lost. Violates doc 09 §1 ("recording never costs the user their place").
- **Status:** Confirmed in running UI. With 340 typed, creating "Pets" ended on Settings > Categories with `state.add = null`; amount gone.
- **Change:** Create the category inline in a sheet (name, kind from the add context, icon) that returns to the add sheet with the new category selected; if a full screen is unavoidable, preserve `add` and return to it.
- **Accept:** Typing 340, choosing "Create a new category", naming it and saving returns to the add sheet with 340 and the new category selected.
- **Shot:** `UX-3.png` · **Lines:** 631, 632, 2045 · further (old copy): 1637-1644, 3151

#### P0-04 The whole app goes blank with zero transactions, and "Erase everything" bricks it
- **Sources:** VUX-1 · **Screen:** Whole app; dataset "Nothing recorded yet"; Settings > Your data > Erase everything · **Also see:** UX-38 (Erase copy)
- **Issue:** The jump-list builder does `this.state.txs.filter(t => t.kind === 'out').slice(-1)[0].id`, which throws when no `out` row exists. The React tree unmounts; only a reload recovers. The true empty first-run state (Home, Transactions, add flow) therefore cannot be viewed, and UX-9 / UX-22 / empty-onboarding claims could not be verified.
- **Status:** Confirmed in running UI. Console: `TypeError: Cannot read properties of undefined (reading 'id')` at `renderVals`; `txs` 299 -> 0 after Erase.
- **Change:** Guard the lookups (`?.id`) and hide the jump entries when there is no data. Design a proper empty state for Home, Transactions and the add flow: the app must work with no accounts, no bills and no entries (D-06a). After Erase everything (P1-54) the app lands on Home's empty state with a primary "Record something" action.
- **Accept:** With "Nothing recorded yet" or after Erase, Home renders its empty state with a primary action and no console error; the jump list omits Detail/Refund. The same holds with zero accounts and zero bills (P1-50).
- **Decision/gap source:** Q-2, D-06a; G-10, G-28
- **Shot:** `VUX-1.png`, `VUX-1_erase_crash.png` · **Lines:** 2409, 2428

#### P0-05 Category merge: one tap, no confirmation, Undo restores nothing useful, orphans and a whole-app crash
- **Sources:** UX-36, VUX-2, FIN-26, VFIN-1 · **Screen:** Settings > Categories > edit category ("Merge into X")
- **Issue:** (a) Each "Merge into X" row merges at once (spec 18 §7 / C-25: confirmation says it cannot be undone). (b) `mergeCategory` deletes the category and its limit but Undo restores transactions only, so they point at a category that no longer exists. (c) Toast text looks up the name after deletion: "— merged into Eating Out". (d) `mergeCategory` rewrites `txs`, `categories`, `limits` but not `commitments`: a bill using the merged category keeps a dangling id (INV-11) and **opening Plan > Regular bills then blanks the whole app**. (e) Source category's limit is deleted even if the target has none. (f) Category ids come from `'c_' + name.replace(/[^a-z]+/g,'_')`, so "Pets 1" and "Pets 2" collide.
- **Status:** Confirmed in running UI. Shopping -> Eating Out: categories 18 -> 17, limit gone; after Undo **12 transactions still point at `shopping`** and Eating Out has 68. `mergeCategory('subs','other')`: Gym and Streamly keep `subs`; opening Regular bills leaves no phone UI (reload required). "Pets 1"/"Pets 2" both get `c_pets_`.
- **Change:** Add a confirmation sheet naming the count ("Move 41 transactions to Eating Out."). The merged category keeps the target's limit, or takes the source's limit if the target has none (Q-14). Undo restores the category, its limit and every transaction, and stays until the next action (D-02). Capture the source name before the merge so the toast reads correctly. Rewrite commitments (and any other reference); fall back to an "Other" label for unknown categories. Give every category a unique id so "Pets 1" and "Pets 2" stay distinct.
- **Accept:** Merge needs a confirm step. Toast reads "Shopping merged into Eating Out". The target keeps its limit (or takes the source's if it has none). Undo restores category, limit and transactions identically and has no 5 s timer. Merging a category used by two bills leaves the app usable and the bills show the target category. Two names differing only by digits keep distinct ids.
- **Decision/gap source:** Q-14 (decided by assistant, open to revision), D-02; G-62, G-42
- **Shot:** `UX-36.png`, `FIN-26.png` · **Lines:** 3392 (row), 3401 (`mergeCategory`), 3404 (limits.filter) · further (old copy): 1733-1736, 1174, 3146, 3408

#### P0-06 Money is shown with paise dropped; rows, totals, toasts and detail disagree
- **Sources:** UX-20, FIN-6, VFIN-5 · **Screen:** Shared formatter `money()`; Add toast, Transactions rows/day totals/summary, Home/report values
- **Issue:** `money(p,o)` defaults `dec=0` and floors; it never reads `prefs.decimals`. This is truncation, not rounding (doc 13 §9: display rounds only at render, decimals per `preferences.decimals`). Rows therefore do not sum to their displayed total, breaking "every drill-down sums exactly".
- **Status:** Confirmed in running UI (with one correction): `money(19999)` -> ₹199, `money(12399)` -> ₹123, `money(5)` -> ₹0, `money(-50)` -> "-₹0". Entered 340.99: toast "Spent ₹340 on Eating Out", row "₹340 spent", Home Spent +340 not +340.99. "Show paise" IS wired for list rows and detail ("-₹199.99", "-₹1,060.00") but not for toasts, day totals or summary: rows ₹199.99 + ₹1,605 + ₹1,060 = ₹2,864.99 under a day total "₹2,864" and header "₹51,471 out" (true 51,471.99).
- **Change:** One formatter driven by `prefs.decimals` used for rows, day totals, summary, toasts, reports and detail. Never drop non-zero paise silently: show paise whenever non-zero or round half-up consistently with the same rule in rows and totals. Never print "-₹0".
- **Accept:** Entering 199.99 shows ₹199.99 in toast, row, detail and totals when paise are on; with paise off, rounded display is identical in rows and totals; every visible row sum equals its total to the paisa; "-₹0" never appears.
- **Shot:** `UX-20.png`, `FIN-6.png` · **Lines:** 1079 (`money`), 1731 (toast; checked in the older copy, not re-located), 3162 ("Show paise") · further (old copy): 1079-1089, 2319, 867

#### P0-07 White text on the accent fails contrast in dark mode and in several palettes
- **Sources:** UX-27 · **Screen:** FAB, Save, primary buttons, clock "Set", "Check this balance", every `buttonFg/saveFg:'#fff'` over `var(--acc600)`
- **Issue:** Doc 13 §8 requires 4.5:1 for text and 3:1 for interactive elements in both themes. Light mode passes (5.04-18.42).
- **Status:** Confirmed in running UI. Dark, white on accent: sage 2.46, warm 2.41, sophisticated 3.07, emerald 2.28, midnight 2.40, berry 2.88, **ink 1.14**, slate 3.07. "Check this balance" 2.46 (15 px); add-sheet Save 2.46; FAB 2.46 on 19 of 19 dark screens.
- **Change:** Define `--on-accent` per theme and palette (near-black on the light dark-mode accents) and use it instead of `#fff`; or choose a darker dark-mode filled accent. All 8 palettes ship (D-04), so the fix covers every palette.
- **Accept:** `--on-accent` over `--acc600` is at least 4.5:1 for text (3:1 for large text and graphical objects) for all 16 palette/theme pairs (8 palettes x light and dark), including ink in dark mode (now 1.14:1).
- **Decision/gap source:** D-04; G-01
- **Shot:** `UX-27.png` · **Lines:** 508 (FAB), 600 (Save), 751, 2013 · further (old copy): 2349, 3108, 3213

#### P0-08 Balance-check "money found" is counted as spending; correction income never reaches Received
- **Sources:** FIN-1 · **Screen:** Balance check -> Overview / Home
- **Issue:** `spendRows` admits `kind==='correction'` on either side. When the user counts MORE than expected, the `to`-side correction raises Spent and lowers Kept; Overview labels it "Spending we could not attribute". M-04/M-05/INV-16/INV-09 require correction income in Received and only `from`-side corrections in Spent.
- **Status:** Confirmed in running UI. `recordCheck('cash','record',50000)` (counted ₹500 more): Spent 51,27,200 -> 51,77,200 (+₹500), Received unchanged ₹1,10,000, Home "Spent this month ₹51,772".
- **Change:** Spent adds a correction only when `from` is set; Received adds one only when `to` is set. Label the Overview line by direction ("Spent but not recorded" / "Received but not recorded").
- **Accept:** T-61/T-63: asset counted ₹500 above app -> Received +₹500, Spent unchanged, Kept +₹500, category shares unchanged; T-60 mirror -> Spent +₹500.
- **Shot:** `FIN-1.png` · **Lines:** 2664 ("Balance fixes" / "Spending we could not attribute") · further (old copy): 1314, 1322, 1324, 2375

#### P0-09 Default Home headline excludes the main account: Money available and Left to spend contradict the spec example
- **Sources:** FIN-2 · **Screen:** Home hero; "Left to spend" explainer · **Also see:** TL-15 (account named on Home)
- **Issue:** Seed marks "Salary bank" `private:true`; `moneyAvailable()` drops it. "Private account" is not in the spec (M-02: sum of asset accounts that count as available; drill-down must sum to the total). The headline is 7% of the user's real money.
- **Status:** Confirmed in running UI. Home: "Available, not counting Salary bank ₹3,550", Left to spend ₹901 (3,550 - 649 bills - 2,000 buffer). Real balances sum ₹51,200; with the bank not private Home reads ₹51,200 and Left to spend ₹43,653. Accounts screen shows "Money available" on a different basis (all accounts), so one label carries two values.
- **Change:** Private is a display setting only (D-05): every total counts private accounts, so Home available equals the sum of all available accounts. Remove the "Available, not counting ..." wording. One definition of "Money available" across Home, Accounts, Plan and the widget. Only the balance and amounts of a private account are masked on screen (P1-45).
- **Accept:** With the seed (Salary bank private), Home available = ₹51,200 and equals the sum of the rows in the "Money available" explainer (the private row shows dots); Left to spend = available - promised - buffer over ALL available accounts (₹43,653 on the seed); the Accounts hero and Home show the same figure.
- **Decision/gap source:** D-05, D-05a, D-05b; G-03, G-29
- **Shot:** `FIN-2.png`, `TL-15.png` · **Lines:** 880 (`private: true`), 1212, 1514, 3899

#### P0-10 Hiding recurring income produces false "you spent more than you earned" and Net cash flow statements
- **Sources:** FIN-3 · **Screen:** Reports > Overview (multi-month), trend chart
- **Issue:** `receivedVisible()` drops recurring income into private accounts; the multi-month view still computes `net = rec - sp` and prints "You spent X more than you earned" and a large negative "Net cash flow". Month view correctly hides Kept. Violates "Always say something true" and INV-13.
- **Status:** Confirmed in running UI. Default data, Last 3 Months: "Net cash flow -₹1,72,722. You spent ₹1,72,722 more than you earned in Jun 2026 - Aug 2026." (6 months -₹3,42,457; 1 Year -₹4,01,218). True: income ₹3,39,442, spent ₹1,82,164, net +₹1,57,278. With nothing private the sentence reads true, isolating the fault to hidden income.
- **Change:** Totals include private accounts' income (D-05), so Net cash flow, Kept and "You earned/spent ... more than" are computed from full figures and stay true. The private account's own balance and amounts stay masked on screen. Do not withhold or suppress the derived statements.
- **Accept:** With a private salary account, Last 3 Months shows Received ₹3,39,442, Spent ₹1,82,164 and "You earned ₹1,57,278 more than you spent"; the 6-month and 1-year views also read true; the figures are identical with the account not private.
- **Decision/gap source:** D-05, D-05b; G-03
- **Shot:** `FIN-3.png` · **Lines:** 2623 ("more than you earned"), 2652 ("Net cash flow") · further (old copy): 1215-1220, 1325, 2536, 2599, 1474

#### P0-11 Bills never match the payments the user records; Promised double-counts and paid bills show "overdue"
- **Sources:** FIN-4, TL-13 · **Screen:** Home internet / any bill detail; "Record this payment now"; Regular bills; Left to spend
- **Issue:** Occurrences match only on `t.commitmentId === c.id`; `saveAdd` never sets `commitmentId`. The dedicated "Record this payment now" button (line 3428) pre-fills payee/category/account (via `setTimeout(0)` and `more:true`) but passes no link. Copy (lines 2100, 2830) says matching uses payee, similar amount and date. Spec doc 07 §7: payee + within 7 days + within 20% of expected.
- **Status:** Confirmed in running UI. "Fibernet ₹1,199" via Add: occurrence stays `upcoming`, `promisedAll()` unchanged at ₹5,547, row has no `commitmentId`. Gym ₹1,200 on 12 Aug with exact payee "Fitwell Gym" still `overdue`. Bill screen -> "Record this payment now" -> Save: no `commitmentId`, bill unchanged.
- **Change:** Set `commitmentId` on the draft when opened from a bill and keep it when saved. Otherwise match automatically: same payee, within 7 days of the due date and within 20% of the expected amount (doc 07 §7, Q-4). Pass presets atomically when opening the add sheet (no `setTimeout`). Show the one matching rule in the copy (P1-29).
- **Accept:** Record from the bill screen -> bill shows paid for the month, Promised drops by the amount and Left to spend stays the same (available money and Promised both fall by the payment, so nothing is counted twice). "Fibernet ₹1,199" via Add, dated today or earlier (D-21 blocks future dates), turns the Home internet occurrence matched and Promised drops by ₹1,199; no second occurrence (INV-08). A payment 8 days from the due date, or more than 20% off the expected amount, does not match.
- **Decision/gap source:** Q-4; G-24, G-14
- **Shot:** `FIN-4.png`, `TL-13.png` · **Lines:** 3428 (button), 2030, 2100, 2830 · further (old copy): 1501, 1702-1711, 3413

#### P0-12 Editing a transaction rebuilds the record and drops its links
- **Sources:** TL-2 · **Screen:** Transaction detail > Edit
- **Issue:** `editTx` loads only a subset of fields and `saveAdd` builds a new `t`, replacing the row, so `commitmentId`, `splitOf`, `groupId`, `backOf`, `excludeFromTypical`, `loanId` vanish. Edit is offered for every kind. Six defects: (1) bill payment is unmatched; (2) split part loses its link; (3) editing a `back` record turns it into a record that also debits the bank; (4) editing a correction forces `kind:'out'`; (5) editing an EMI `move` drops `groupId` and does not reload interest; (6) lowering a refunded purchase below refunds already recorded is not blocked.
- **Status:** Confirmed in running UI for 1, 3, 4, 5, 6 (split-part edit uses the same rebuild path, not separately run). Edit seeded Rent to ₹18,001: loses `commitmentId`, Rent turns overdue, `promisedAll` ₹5,547 -> ₹23,547. Refund edit: becomes `from bank` and `to card`. Refunded purchase ₹1,060 lowered to ₹100 with ₹400 back: saved, Spent falls ₹960, net negative (-₹300).
- **Change:** Everything stays editable, refund, correction and grouped rows included (D-22). Edit patches fields on the existing row (merge, never rebuild), so `commitmentId`, `splitOf`, `groupId`, `backOf`, `excludeFromTypical` and `loanId` always survive, and a refund or correction keeps its kind and accounts. Before an amount change on a linked row (bill-matched, split, grouped or refunded), warn and name the linked records. Block an amount below `backSoFar` with the remaining-refundable message. Reload and re-save interest for grouped rows.
- **Accept:** Property test: edit amount/date/note of a bill-matched, split, grouped and refunded transaction, and of a refund and a correction; `commitmentId`, `splitOf`, `groupId`, `backOf`, `excludeFromTypical` and kind are unchanged and every account delta equals the intended one; a linked row asks to confirm an amount change.
- **Decision/gap source:** D-22 (the earlier request to restrict Edit by kind is superseded, section 6)
- **Shot:** `TL-2.png` · **Lines:** 3691 (Edit action), 3699 (`editTx`), 3703, 3704

#### P0-13 Split corrupts refund links and clones bill and one-off flags
- **Sources:** TL-3 · **Screen:** Transaction detail > Split · **Also see:** TL-12 (delete of a part, in P0-14), TL-4 (split entry, P1-05)
- **Issue:** `applySplit` deletes the original and creates children with `Object.assign({}, t, ...)`, offered for any `out` without `splitOf`, with no refund check: (a) refund `backOf` now points at a deleted id, `backSoFar` is 0 and deleting a part does not cascade; (b) parts inherit `commitmentId`/`excludeFromTypical` (one rent split in two counts as two matched payments); (c) deleting one part leaves siblings that no longer sum to the original.
- **Status:** Confirmed in running UI. Split refunded Green Basket (₹1,060, ₹400 back) into ₹600 + ₹460: refund still `backOf:'T270'` (gone), `backSoFar` 0 for both. Split Rent (matched) ₹15,000 + ₹3,000: both keep `commitmentId c_rent`. Deleting one part: ₹3,000 sibling stays, Spent falls ₹15,000, no warning.
- **Change:** Block split when refunds exist (or re-parent `backOf` to the largest part and say so). The bill link (`commitmentId`) stays on the first part only; "exclude from typical" is copied to every part (D-24). Deleting one part of a split asks "Delete all parts" or "Delete only this part"; the single-part option warns that the split total changes (P0-13/14a).
- **Accept:** Splitting a refunded purchase, a bill payment and a one-off leaves category totals, bill status and refund remaining unchanged versus pre-split; only the first part is bill-linked and every part of a one-off is excluded from typical; deleting any part asks "Delete all parts" or "Delete only this part"; choosing "Delete only this part" shows a warning that the split total changes, and choosing "Delete all parts" removes every part.
- **Decision/gap source:** D-24; P0-13/14a (delete one part of a split)
- **Shot:** `TL-3.png` · **Lines:** 3693, 3761, 3767-3775 (`applySplit`)

#### P0-14 EMI with declared interest: delete orphans the interest row; edit duplicates it; delete names only refunds
- **Sources:** FIN-5, TL-12 · **Screen:** Add sheet (EMI as Moved with interest), Transaction detail > Delete, Delete sheet
- **Issue:** `saveAdd` creates the interest `out` with the same `groupId`; `deleteTx` filters only `t.id !== id && t.backOf !== id`, so the interest row survives; re-saving an edited EMI appends a NEW interest row. The Delete sheet names only refunds, not grouped records or split siblings (spec 10_User_Flows line 138 / C-07: a grouped record deletes its whole group and the sheet names every linked record).
- **Status:** Confirmed in running UI. Delete EMI move T265 (₹20,500): interest T266 (₹11,500, G8) remains, Spent unchanged ₹51,27,200, loan balance -₹5,09,000 (was -₹4,88,500), bank +₹20,500. Edit then re-declare interest: a duplicate ₹11,500 out; Spent -> ₹62,77,200 (+₹11,500). Delete sheet says only "₹20,500 - Home loan EMI - 5 Aug".
- **Change:** Delete and edit operate on the whole `groupId` set; the confirmation lists every linked record ("₹11,500 interest"). For split siblings (P0-13/14a), deleting one part of a split asks "Delete all parts" or "Delete only this part", and the single-part option warns that the split total changes; delete atomically with a single Undo restoring all, which stays until the next action (D-02).
- **Accept:** T-25 then delete -> both rows gone, bank +₹12,000 owed back to prior; edit amount/interest -> exactly one move and one interest row remain; Undo restores both. Deleting one part of a split asks "Delete all parts" or "Delete only this part"; the single-part option shows a warning that the split total changes.
- **Decision/gap source:** D-02; G-42; P0-13/14a
- **Shot:** `FIN-5.png`, `TL-12.png` · **Lines:** 1737 (`deleteTx`), 1963, 924, 925 (seed groups), 3679 · further (old copy): 1714-1721, 1737-1742, 1959-1963

#### P0-15 Current-month comparisons are not day-aligned and "typical" is shown without its data thresholds
- **Sources:** FIN-7 · **Screen:** Category screen, limit sheet, category editor, unusual spending · **Also see:** P1-13 (several baselines)
- **Issue:** On a partial month the category hero compares month-to-date spend with a median of FULL months, with no 3-month floor, zero months included: the false under-spending message INV-17 exists to prevent. `unusual()` also ignores `exclude_from_typical`, non-monthly commitments and day alignment.
- **Status:** Confirmed in running UI. Food & Groceries: "₹5,825 ... ₹3,654 less than a typical month (₹9,479)"; the month-to-date median is ₹4,545, i.e. **₹1,280 MORE**; What changed says "Typical ₹4,545 +₹1,280". With only 2 qualifying months the screen still prints "less than a typical month (₹9,152)".
- **Change:** Use the month-to-date median for the current period; gate every "typical" string on 3 qualifying months (3 non-zero for a category); otherwise show level only. Leave corrections ("Not recorded") out of both the actual and the typical (D-19). (a) A category's "typical" median uses only months that had spending in that category; zero-spend months are excluded (P0-15b). (b) Adjust the sample data so the "unusual spending" card shows on Home by default, while keeping the month-to-date comparison logic unchanged (P0-15a).
- **Accept:** T-37/T-38/T-53/T-54: on day 16 the category compares with the median of day 1-16 spend; with 2 qualifying months no string contains "typical"; adding a correction in the month changes neither the compared actual nor the typical; a category with spending in 4 of 6 months has a typical equal to the median of those 4 months only (zero-spend months excluded); on the default sample data the "unusual spending" card is visible on Home and its comparison is still month-to-date.
- **Decision/gap source:** D-19; G-23; P0-15a, P0-15b
- **Shot:** `FIN-7.png`, `FIN-7_2month.png` · **Lines:** 1484 (`catMedian`), 2838 · further (old copy): 2844, 1996, 3391, 1595-1608

#### P0-16 Home insight "x" dismiss throws a ReferenceError
- **Sources:** TL-1 · **Screen:** Home insight card
- **Issue:** `dismissInsight` reads an undefined variable `u` (`this.setState(st => ({ dismissed: st.dismissed.concat([u ? 'unusual:' + u.id : 'credit']) }))`), so tapping the close button throws `ReferenceError: u is not defined` and the card can never be dismissed this way. It also hardcodes `'unusual:'` / `'credit'`, so dismissing a price, pace, reliability or positive card would hide the wrong thing. (TL-1 was tagged as an engineering finding; it is kept here because the defect is visible to the user.)
- **Status:** Confirmed by code reading (not run in the UI).
- **Change:** The dismiss button must work and remove the insight. Each card dismisses exactly itself and the next eligible card appears.
- **Accept:** Tap x: the insight disappears and no console error is logged; for each of the 5 insight kinds, x removes exactly that card and shows the next eligible one.
- **Decision/gap source:** none (visible defect; the "Not useful" behaviour is P1-55)
- **Shot:** none · **Lines:** 3920 (`dismissInsight`), 136 (button)

#### P0-17 App lock is a demo: 4 digits, plaintext, no real unlock rules (design the real lock)
- **Sources:** none (design item; the originating engineering finding was removed) · **Screen:** App lock (Settings), lock overlay, passcode create/confirm · **Also see:** UX-34 (accessibility, P1-27), UX-48 (demo copy, P2-12)
- **Issue:** Design lock is 4 digits (doc 20:43 requires 6 minimum), accepts a fixed demo code, the biometric button unlocks without authenticating, nothing locks on cold start or after backgrounding, no attempt delay, nothing hides content in the recents view, and an "Encrypt the file at rest" toggle contradicts the spec's P2 deferral. The private-balance mode changes every total (see D-05).
- **Status:** Partly confirmed in the running UI by UX-34 / UX-48: hint "Four digits. This demo accepts 1 2 3 4.", enabling the passcode instantly sets it with no create/confirm flow, `1234` unlocks. The remaining rules (cold start, background, recents view) are code reading only.
- **Change:** Design the app lock as biometric with the phone's own PIN or pattern as the fallback; the app stores no PIN and has no app-PIN screens (D-30a). Remove the 4-digit passcode, the fixed demo code and the "Encrypt the file at rest" toggle (not in v1, D-30b). The biometric prompt unlocks only on success. Keep "Lock now". The lock delay setting offers Immediately, 1, 5 and 15 minutes; the default is 1 minute (P0-17a). State that the lock hides content in the recents view and that the app cannot recover access. The set-up flow is P1-47.
- **Accept:** Cold start with lock on shows the lock screen first; 61 s in background with a 1-minute threshold requires biometric or the phone PIN, 59 s does not; the delay setting lists exactly Immediately, 1, 5 and 15 minutes with 1 minute preselected on first enable; cancelling the prompt does not unlock; no screen in the app asks for or shows a PIN; no encrypt toggle exists.
- **Decision/gap source:** D-30a, D-30b, D-10a, P0-17a; G-21, G-58, G-16
- **Shot:** `UX-34.png` · **Lines:** 1755, 1750, 1762, 1638, 3281, 3285, 3287, 1748 · further (old copy): 799-817, 1744-1764, 3275-3296


### 4.2 P1

#### Add flow

##### P1-01 Save is not blocked when the category is missing; a standing alert fires on the first digit
- **Sources:** UX-4, UX-8 · **Screen:** Add sheet (Save, error line)
- **Issue:** Save relabels to "Choose a category" (grey) but `saveAdd` never checks `needsCat`, and the button has no disabled state. The same condition also raises a `role="alert"` on the first digit (three signals for one fact; doc 18 §6: missing information is "a prompt, never a warning").
- **Status:** Confirmed in running UI. Amount 340 with no category: clicking "Choose a category" **saved** `{kind:'out', amount:34000, categoryId:null}` and toasted "Spent ₹340". After the first digit `[role=alert]` appears with "Choose a category so this can appear in your reports".
- **Change:** Block the save for a missing category and set `aria-disabled` on Save; on tap in the disabled state move focus to the Category field and announce why (doc 13 §7). Remove the standing alert; keep the Save label and show the inline message only after a save attempt.
- **Accept:** Amount 340, no category: Save saves nothing and focuses Category; TalkBack reads "Save, dimmed, choose a category"; no `role="alert"` while typing digits; after a failed attempt exactly one message is announced.
- **Shot:** `UX-4.png` · **Lines:** 2307-2309, 2333

##### P1-02 The sheet can be dismissed with a typed amount and no warning; nested sheets close the whole entry
- **Sources:** UX-5 · **Screen:** Add sheet, nested category/date/time sheets
- **Issue:** Scrim and × call `closeSheet()` which only sets `sheet:null`; `openAdd` re-initialises. Doc 09 §7 / C-19 require a discard prompt and swipe-to-dismiss; nested × and scrim close everything instead of returning to the add sheet.
- **Status:** Confirmed in running UI. ₹340.00 typed, scrim tap closed the sheet at once (no prompt); re-opening shows ₹0; × on the nested Category sheet also closes the entire entry. Swipe-to-dismiss untestable (no handle handler in markup).
- **Change:** Intercept scrim, × and system Back when digits/payee/note are non-empty and offer "Keep editing / Discard". Nested sheets return to the add sheet. Add swipe-down on the handle.
- **Accept:** With ₹340 typed, scrim tap shows the discard prompt; Back from the category sheet returns to the add sheet with 340 intact.
- **Shot:** `UX-5.png` · **Lines:** 514, 519, 1912 (`closeSheet`), 1652

##### P1-03 Keypad: unlabeled keys and non-field amount; spec keys and pressed state missing; calculator edge cases
- **Sources:** UX-6, UX-7, FIN-23 · **Screen:** Add sheet keypad / amount
- **Issue:** The amount is a `<div>`; keys read "⌫", "C", "−", "=" with no `aria-label`, no live region (doc 19 §10 requires direct keyboard entry and labelled keys). Keys emit no × ÷ although C-05 lists them and `key()` handles them; no pressed state or haptic. `evalExpr` is strictly left to right; a negative result silently clears the amount; the 9-digit cap blocks ≥ ₹1 crore entries (Outside/loan).
- **Status:** Confirmed in running UI. All 16 keypad buttons have `aria-label=null`; physical key "5" left the amount at ₹0; keys have no `:active` rule (only `.row:active` exists). `100-200=` clears amount and expression with no toast; `2+3×4` evaluates to 20 (latent: keypad shows only +/-); 12345678.9 accepted, 10th digit rejected. Haptics not testable.
- **Change:** Make the amount a real numeric field (or adjustable with a live region); label keys "Delete last digit", "Clear amount", "Plus", "Minus", "Times", "Divide", "Equals"; announce the formatted amount. The calculator uses standard maths: × and ÷ before + and -, no brackets (Q-5, Q-5a); the keypad stays small. Record "no brackets" in doc 12 C-05. Add a pressed state (4% overlay) and haptic. Show "Result is below zero" and keep the expression; raise the cap for Moved.
- **Accept:** A TalkBack user can enter 340.50 by keyboard or keypad and hears the formatted amount after each change; every key shows a pressed state; 340+120×2 gives 580 (not 920); `100-200` shows a message and keeps the expression; there is no bracket key.
- **Decision/gap source:** Q-5, Q-5a; G-25
- **Shot:** `UX-6.png` · **Lines:** 1665 (`key`), 1670, 1677, 2305 · further (old copy): 545-550, 595-599, 1659-1693

##### P1-04 Date and time pickers: future dates silently disabled; exact minutes need a drag; disabled text unreadable
- **Sources:** UX-10, VUX-6 · **Screen:** Date sheet, time sheet (also heatmap future cells) · **Also see:** FIN-30 (date rule)
- **Issue:** `future = iso > TODAY`; tapping a future day is a no-op with no message (spec C-09/S-06 allow through tomorrow and explain disabled dates on attempt, doc 19 §3). The clock offers 5-minute marks and "Drag the hand for the exact minute": a gesture-only route (doc 19 §1). Disabled day numbers are near-invisible.
- **Status:** Confirmed in running UI. Days after 16 Aug (including tomorrow) are `rgb(220,224,230)` (about 1.3:1 on white), no `disabled`/`aria-disabled`; tapping 19 left the date at 2026-08-16 with no message. Minute mode has only 00, 05 ... 55 plus the drag; dial numbers 44 x 44, AM/PM 52 x 36; day cells have digits only as label. Heatmap future cells 1.15:1 (light), 1.22:1 (dark).
- **Change:** Entries are for today and earlier only (D-21): future days stay disabled, with `aria-disabled` and an explanation on tap ("Choose today or an earlier date"). Date and time sit under More (D-09). Replace the dial with numeric hour:minute entry plus AM/PM. Give disabled text at least 3:1 contrast. Give day cells accessible labels.
- **Accept:** Tapping a day after today shows the message and leaves the date unchanged; a switch-access or TalkBack user can set 9:07 pm without a drag; disabled day text is at least 3:1; date and time are hidden until More is opened.
- **Decision/gap source:** D-21, D-09; G-22, G-02
- **Shot:** `UX-10_calendar.png`, `UX-10_time.png`, `UX-30.png` · **Lines:** 1781 (`future`), 1839 · further (old copy): 741-750

##### P1-05 Split sheet: amounts only by +/- steps; gate passes with one real part
- **Sources:** TL-4 · **Screen:** Split sheet (S-44)
- **Issue:** Minimum step is ₹100 and scales to a quarter of the amount (an ₹80 purchase can only be split 0/80 or 80/0). A part with a category and zero amount counts toward the gate but is dropped ("Split into 1 parts"); the same category can be picked twice.
- **Status:** Confirmed by code reading.
- **Change:** Per-part amount entry via the keypad component, remainder auto-filling the last part; count named parts with amount > 0; disallow or merge duplicate categories; fix the plural.
- **Accept:** Split ₹80 into 50/30 and ₹1,234.56 into three uneven parts with the paise remainder on the last; the button never enables with fewer than two non-zero parts.
- **Shot:** none · **Lines:** 3761-3775 · further (old copy): 3735-3746

#### Navigation and information architecture

##### P1-06 Cross-tab jumps rewrite another tab's stack; Back does not return to the origin; drill-in inherits stale filters
- **Sources:** UX-11, TL-10 · **Screen:** Home "money available", Reports "Change limits", Unusual banner, Account "See all", Home insight "See the transactions"
- **Issue:** `jumpTo(tab, screens)` overwrites `stacks[tab]`; Back lands on the target tab's root, not the origin (doc 09 §7). `setFilter` merges, so `q`, `kind`, `payee`, `accountId` from an earlier visit survive and the list can show fewer rows than the card's figure.
- **Status:** Confirmed in running UI for UX-11 (Home -> "Available outside your private accounts..." switches to Settings; Back lands on the Settings root). TL-10 confirmed by code reading.
- **Change:** Accounts lives under Home (P1-51), so Home -> "money available" opens Accounts on Home's own stack and Back returns to Home (D-14). For the remaining cross-tab jumps (Reports "Change limits", Unusual banner, Account "See all", Home insight "See the transactions") push drill-downs onto the originating tab's stack, or show a visible "back to Home" affordance. Reset all other filters on drill-in (or show them as chips with "Clear all").
- **Accept:** Home -> money available -> Accounts -> Back returns to Home. Set Spent + payee filter, return Home, tap "See the transactions": list total equals the card's figure; earlier Transactions filters survive a Reports drill-down and back.
- **Decision/gap source:** D-14; G-29
- **Shot:** `UX-11.png` · **Lines:** 1637 (`jumpTo`), 3829 (`go` with `setFilter`) · further (old copy): 1930, 2744, 2791, 3089

##### P1-07 Re-tapping the active tab clears its stack
- **Sources:** UX-12 · **Screen:** Bottom tab bar
- **Issue:** `if (reset || s.tab === tab) stacks[tab] = [{ n: tab }]`; C-01 says re-tap scrolls to top without clearing.
- **Status:** Confirmed in running UI. Reports > Overview > Eating Out, then tapping the Reports tab: stack `[reports, r01, category]` -> `[reports]`.
- **Change:** Re-tap scrolls to top; a second re-tap at top may pop to root, recorded as an explicit rule in doc 09.
- **Accept:** On Reports > Overview > category, tapping Reports scrolls to top and keeps the category screen.
- **Shot:** `UX-12.png` · **Lines:** 1633, 1641

##### P1-08 "Where it goes" (R-02) unreachable from the hub; hub rows are static descriptions
- **Sources:** UX-13, UX-14 · **Screen:** Reports hub (S-15)
- **Issue:** The hub lists Overview, Limits, What changed, Regular bills, Drifting categories, Seasons & year-on-year; R-02 is reachable only via the jump list or the Period breakdown of a multi-month Overview (the App Guide still tells users to go Reports -> Where it goes). Subtitles are fixed strings, whereas S-15/C-12/doc 09 §3 require a live answer per card (with a named unmet condition when history is thin).
- **Status:** Confirmed in running UI. No "Where it goes" row. Overview, Limits, What changed, Regular bills and Drifting subtitles are identical in Seven months, Two years and First week; only Seasons varies (5 of 6 rows static).
- **Change:** Keep the folded hub as built (D-29: the prototype wins; docs 09 and 11 are amended). Fix the App Guide so it names the real path to "Where it goes" (Reports -> Overview -> Period breakdown). Give every hub row a live number or a named unmet condition, e.g. "₹18,400 spent so far, ₹3,400 above a typical month", "2 limits over", "1 bill overdue".
- **Accept:** The guide and the hub describe the same path to R-02, reachable from a fresh launch in at most 3 taps without the jump list; every hub row changes with the dataset.
- **Decision/gap source:** D-29; G-49
- **Shot:** `UX-13.png` · **Lines:** 2639 (`push('r02'`), 2414, 2461 · further (old copy): 2486, 2492-2501

##### P1-09 Two sticky headers share `top:0` on Transactions and cover the search field
- **Sources:** UX-50 · **Screen:** Transactions
- **Issue:** App bar (z 5) and the filter block (z 4) both stick at `top:0`; the lower-z block slides under the app bar. S-07 asks only for a sticky period header.
- **Status:** Confirmed in running UI. Scroller 745 px, content 2,973 px; after 600 px both sit at y=0, the search input is at y=8 and hit-testing its centre returns the app-bar title. Filter block is 160 px = 21% of the scroller.
- **Change:** Offset the filter block by the app-bar height, or collapse it on scroll-down and reveal on scroll-up. Keep the result summary sticky.
- **Accept:** After scrolling 500 px the search field is fully visible or fully collapsed, never half covered; at most 25% of the viewport is pinned.
- **Shot:** `UX-50.png` · **Lines:** 76, 157

#### Home, Plan and Reports content

##### P1-10 Reliability sentence has no slot on Home; stage is driven by the prototype tweak, not data
- **Sources:** UX-21, FIN-24 · **Screen:** Home, top of reports
- **Issue:** `reliability()` exists but the Home markup shows no reliability sentence (S-01, doc 18 §6). `reliability()` uses `days / 16` and `canCompare()` reads the `stage` tweak, so First-week data shows "A few things may be missing" instead of "Just starting" (EX-04: under 30 days of history).
- **Status:** Confirmed in running UI. First week only: Home shows no reliability sentence (only a comparison note); `reliability()` returns state "gaps", "A few things may be missing - check your balance?". The 14-day-gap case was not constructed. The stage Tweak itself could not be driven (no Tweaks panel).
- **Change:** Add an explicit non-blocking sentence under the headline numbers with a "Check a balance" action, and the same at the top of reports. Derive stage from `historyStart()` / qualifying months and `periodRange.elapsed`, not from a tweak or a constant.
- **Accept:** First week only shows "Just starting" regardless of any stage setting; a 14+ day gap shows "A few things may be missing" with a one-tap link.
- **Shot:** `UX-21.png`, `FIN-24.png` · **Lines:** 1525, 1530 (`days / 16`), 1535, 3849, 3893

##### P1-11 Empty Home and Transactions have copy but no action
- **Sources:** UX-22 · **Screen:** Home, Transactions (empty and filtered-empty)
- **Issue:** C-22 requires an illustration/icon, one sentence and a primary action, never a bare "No data"; filtered-empty needs "Clear filters" (doc 18 §2).
- **Status:** Confirmed in running UI for filtered-empty ("zzzqq": "0 transactions", "Nothing matches those filters. Try a wider period.", no Clear action). Cannot test for true empty Home/Transactions because of VUX-1 (P0-04).
- **Change:** Add a primary "Record something" button (opens the add sheet) to both empty states and "Clear filters" to the filtered-empty state. Empty states for no accounts and no bills are P1-50.
- **Accept:** With "Nothing recorded yet", Home and Transactions each have a tappable action that opens the add sheet; the filtered-empty state clears filters.
- **Decision/gap source:** D-06a
- **Shot:** `UX-22.png` · **Lines:** 3651 (`emptyMsg`), 195 · further (old copy): 147-151 · **Depends on:** P0-04 (must render first)

##### P1-12 Left to spend omits card dues, EMIs and SIPs; recurring transfers cannot be bills
- **Sources:** FIN-8, TL-15 · **Screen:** Home "Left to spend", explainer sheet, new-bill category · **Also see:** P0-09 (private account named on Home)
- **Issue:** Promised sums pending commitments only. The ₹32,000 home-loan EMI and card payments are not commitments; commitments require an `out` category, so a recurring transfer (EMI as loan move, SIP to Outside, RD) cannot be created; spec M-12 adds `owed balance due <= horizon`. A bill billed to a card is subtracted from available even though cash leaves with the card payment. Home also separates "You owe" from the safe-to-spend figure. Home names the hidden account ("Available, not counting Salary bank").
- **Status:** Confirmed in running UI. Promised = bills only (₹649 on Home, ₹5,547 in total); EMI not a commitment; "You owe ₹4,88,500" shown separately and not deducted; Streamly ₹649 on the card subtracted from available; headline names the hidden account. New bills taking only an `out` category is code reading.
- **Change:** Include owed-account dues (card/loan `due_day`) in Promised at the card's due date and list them in the explain sheet. A bill paid by card is counted at the card's due date and not counted again as the bill itself (D-20). Allow a recurring commitment of kind "moves money to a loan/card/Outside". Private accounts count in the headline (D-05), so drop the "not counting ..." wording.
- **Accept:** Seed Left to spend lists EMI and card due as lines in its maths; a card-paid bill is counted once, on the card's due date; with a card due this month Left to spend changes by the due amount once and the explain sheet lists it; the headline names no private account.
- **Decision/gap source:** D-20, D-05; G-34
- **Shot:** `FIN-8.png`, `TL-15.png` · **Lines:** 1510, 1514, 3891 (`leftToSpend`), 3899, 2112 · further (old copy): 973-981, 1509-1514

##### P1-13 "Typical" is computed several ways; windows compare partial with full months; confidence wording
- **Sources:** FIN-16, FIN-17, FIN-31 · **Screen:** Reports (multi-month insight), What changed, Home insight, category screen · **Also see:** P0-15
- **Issue:** `baseSpend` and `spentMTD` differ (corrections, yearly bills, `excludeFromTypical`, `back`); `qualMonths()` includes the month under review in its own median; the "What moved" rows do not sum to the headline change; multi-month windows include the partial current month and compare it with full windows ("Expenses eased 18%" from calendar alignment); copy says "from your last six complete months" even with 3 qualifying and omits "about" below 6 (doc 07 §3).
- **Status:** Confirmed in running UI. Food typical ₹9,479 (category) vs ₹4,545 (What changed); Eating Out "₹6,059 ... 6 months" vs "Typical ₹2,552"; What moved +7,819 +1,280 +574 -433 = +₹9,240 vs headline +₹5,702 (₹3,538 unexplained, no "other" row); "Family & Gifts Typical ₹0 +₹927". FIN-16: mechanism confirmed (3-month window Jun-Aug includes 16-day Aug; +1.6% is under the 8% cut-off so a false "eased" sentence was not triggered with this data). FIN-31: "A typical month at this point is ₹46,152, from your last six complete months" with only 3 qualifying months, no "about".
- **Change:** One `baselineSpend()` path used for both the actual and the typical; corrections ("Not recorded") are left out of both sides (D-19); clamp `nDays` to the baseline month length; include zero-this-month categories; show an "other" row so deltas reconcile; compare complete months only or day-align and say so; state the actual month count and use "about" below 6.
- **Accept:** T-36: sum of listed deltas + "all other" = total change exactly; T-40: annual commitment excluded in both full and MTD baselines; a correction appears in neither side; day-16 3-month insight uses 3 complete months vs the 3 before or says "to day 16" both sides; 3 qualifying months -> "about ₹X ... from your last 3 months".
- **Decision/gap source:** D-19; G-23, G-37, G-38
- **Shot:** `FIN-17.png`, `FIN-16.png`, `FIN-31.png` · **Lines:** 1475, 1476 (`typicalFull`/`typicalMTD`), 1327 (`spentMTD`), 2779, 2789 · further (old copy): 1339-1348, 2515-2516, 2611-2625

##### P1-14 The same period shows different "spent" figures in different reports and the list
- **Sources:** FIN-21, TL-8 · **Screen:** Overview, Where it goes, Must-pay + Flexible, Transactions summary and day totals
- **Issue:** Overview uses `spent(r)` including corrections; Where it goes excludes `not_recorded`; Must-pay + Flexible excludes corrections. The list's day total and "out" summary count `out` + `correction` only (ignoring refunds shown in the same group), and the Spent chip drops corrections, so the list never reconciles to Home (T-34/T-35: a category total must equal its transaction list).
- **Status:** Confirmed in running UI. Overview "Money spent ₹51,272" vs Where it goes "of ₹50,572 spent" (₹700 Balance fixes excluded); after a ₹400 refund, Spent ₹50,872 but list header "₹51,272 out" and day total ₹2,665 gross.
- **Change:** Label category totals "categorised spending" or add a visible "Balance fixes" row to every breakdown so rows sum to the headline; show "₹X spent (net of ₹Y came back)" using the same function as Home; day totals net of backs; add a Corrections kind filter.
- **Accept:** For every seed month, list summary spent = Home Spent = R-01 total with and without refunds and corrections; rows under a headline add exactly to it.
- **Shot:** `FIN-21.png`, `TL-8.png` · **Lines:** 2664, 3648 ("income private"), 3618 (day total) · further (old copy): 2599, 2603-2604, 2696-2709, 3618-3620, 3632

##### P1-15 Limits: allowed on must-pay categories; pace thresholds differ from the spec; no "N of M on track"
- **Sources:** FIN-20 · **Screen:** Limits report, "Without a limit", Plan
- **Issue:** The "Without a limit" list offers every non-system `out` category including Home & Rent, Bills, EMI & Loans (doc 04 §12 forbids limits on repeating categories). Pace warning uses `l.pace > 1.15` from day 5; spec: warn when pace > 1.25 after day 10 and projected overrun ≥ ₹300. No L1 sentence "N of M limits on track".
- **Status:** Confirmed in running UI. "Without a limit" lists Home & Rent (Typical ₹18,000, Set), Bills & Utilities, Subscriptions, EMI & Loans. Family & Gifts ₹927 of ₹1,500 on day 16 shows "Ahead of pace" (pace ratio 1.20, below 1.25). Day-5/day-10 gating not run (cannot move the clock).
- **Change:** Filter the "Without a limit" list to flexible, non-repeating categories. Pace warning only when the pace is 25% ahead and the projected overrun is at least ₹300, and only after day 10 (Q-7); the Home insight "ahead of your limit" uses the same thresholds. Add "4 of 5 limits on track" at the top of Limits.
- **Accept:** Rent has no "Set" row; at day 8 a 1.2 pace shows no warning; on day 16 Family & Gifts at pace 1.20 shows no "Ahead of pace"; Limits opens with "4 of 5 limits on track".
- **Decision/gap source:** Q-7; G-27, G-47
- **Shot:** `FIN-20.png` · **Lines:** 2895, 2737, 2739, 2740 · further (old copy): 1521-1522, 2881

##### P1-16 Month-start day: period naming, calendar-month grids, partial first period, no financial-year view
- **Sources:** FIN-15 · **Screen:** Periods, day grid, strips, year views, Preferences "Month starts on"
- **Issue:** A salary-cycle period is labelled by its START month ("Jul 2026" on 16 Aug); `dayGridRows` and `spendCalendar` group by calendar month, so the grid does not sum to the headline; the first partial period falls outside `monthKeys`; `ytd()` is Jan-Dec only and nothing offers Apr-Mar.
- **Status:** Confirmed in running UI. Month start 25: label "Jul 2026", 2026-07-25..2026-08-24, elapsed 23, Spent ₹71,354; grid/`spendCalendar` total ₹67,176 does not equal the headline. Month start 15: "Aug 2026" = Aug 15-Sep 14, elapsed 2, ₹2,915. `ytd()` from Feb to 16 Aug, calendar year only. Searches for FY/financial year/tax/80C/UPI/SIP/lakh/crore: 0 hits in the rendered UI (India-specific absence confirmed).
- **Change:** Build the day grid, strips and calendar from the `periodRange` start/end so a custom month-start period sums to its headline, and include the first partial period in `monthKeys`. The period label rule is P1-53; the year start and FY chips are P1-52.
- **Accept:** With month start 25, cells for Jul 25 - Aug 24 sum to the period total; the first partial period appears in the strips.
- **Decision/gap source:** D-15, D-16; G-41
- **Shot:** `FIN-15.png` · **Lines:** 1448 (`dayGridRows`), 1439 (`ytd`), 3496, 1990, 3165 · further (old copy): 1111-1141, 2562-2587

##### P1-18 Over limit uses critical red; "below typical" uses positive green
- **Sources:** UX-28 · **Screen:** Limits, What changed, Plan
- **Issue:** Doc 13 §3: `critical` never for overspending; `positive` only for money in and limits met; doc 13 §12 tone: never congratulatory about spending less; doc 19 §4: over limit -> attention. The App Guide says the bar "turns red".
- **Status:** Confirmed in running UI. Eating Out over limit uses `--crit` red fill rgb(179,69,60); What changed "-₹433" below typical uses `--pos` green, "+₹..." amber.
- **Change:** Over-limit uses `attention` with "₹X over" text; "less than typical" renders neutral (`--n800`); fix the App Guide sentence. Keep `--crit` only for destructive confirmation and genuine errors.
- **Accept:** No `--crit` use outside destructive confirmation and errors; "Less than typical" renders neutral.
- **Shot:** `UX-28.png`, `UX-28_limits.png` · **Lines:** 2787, 2795, 2803 · further (old copy): 2737, 2740, 2846, 2882, 2663

#### Accessibility, contrast and touch

##### P1-19 Low-contrast secondary text and warning amber text fail AA in light mode
- **Sources:** UX-18, UX-19 · **Screen:** Home, Transactions, Reports, Plan, Accounts, Categories (tokens `--n400`, `--att`, `--pos`)
- **Issue:** `--n400` is used as text colour and fails 4.5:1 (and 3:1 for the "?" control); `--att` and `--pos` on their tints fail for 13-15 px text. Docs 13 §8 / 19 §3 claim both themes are verified.
- **Status:** Confirmed in running UI (light). `--n400` rgb(154,163,174): **2.40:1** on page bg (24 nodes of 13 px day/row amounts, 11 px "16 Aug · Aug 2026", the 15 px "?"); **2.55:1** on white (10 px weekday letters, 18 px "×", "Private"). `--att` rgb(180,118,30): **3.78:1** on white (15 px "₹700" in R01/R04/R08; 13 px "Ahead of pace"), **3.44:1** on attBg. Dark theme passes for these tokens. `--pos` on `--posBg` (4.42) was not observed as a failure on the screens visited.
- **Change:** Darken light `--n400` for text roles (≥4.5:1, e.g. ~#6E7785 on white, subject to recheck) and reserve the current value for non-text decoration; restyle the "?" with `--n600`. Darken `--att` and `--pos` for text in light mode, or use `--n800` text with an icon and amber only as surface/border. Audit all 8 palettes in both themes (D-04). Add type tokens 36 (hero) and 19 (stat) to the scale and include them in the audit (D-12).
- **Accept:** A token audit shows every text/background pair ≥4.5:1 (≥3:1 for ≥24 px figures and interactive glyphs) in all 8 palettes, light and dark (16 pairs); type tokens 36 and 19 are listed in the token table.
- **Decision/gap source:** D-04, D-12; G-01
- **Shot:** `UX-21.png`, `UX-28.png` · **Lines:** 14-29 (tokens), 97, 99 · further (old copy): 176, 286, 308, 318, 388, 588, 474, 673, 2825, 2640

##### P1-20 Touch targets below 48 dp; the "You owe" button on Home is 22 px high
- **Sources:** UX-25, VUX-3 · **Screen:** Many (see table)
- **Issue:** Doc 13 §8 / doc 19 §1 require 48 dp with 8 dp spacing. The Undo button is the only recovery for a mis-save or delete.
- **Status:** Confirmed in running UI. 422 interactive elements audited on 23 screens, 66 under-size occurrences. Measured (w x h): toast Undo 42 x 32; insight dismiss 32 x 32; chips 36 high; insight actions 40 high; sheet × 40 x 40; month nav 44 x 44; calendar cells 50 x 42; clock numbers 44 x 44; AM/PM 52 x 36; search input 229 x 44; "All categories" 127 x 44; Reports period chips 36 high; heatmap cells 44 x 44; Widget buttons 104 x 44; Home main figure 364 x 46; **"Separately, you owe ₹4,88,500" 364 x 22**. No under-size controls on Settings, Accounts, Categories, Preferences, Data, Plan, R03, R06, R08, R09. Tab bar items and FAB are at least 48.
- **Change:** Raise every listed control (including the Undo button, which stays until the next action, D-02) to at least 48 dp, or extend the hit area while keeping the visual size; keep 8 dp between targets. Pad the "You owe" row to 48 px or merge the two Home figures into one 48 px-plus control. SVG trend dots (r=2.6) fall under P1-22.
- **Accept:** Automated layout assertion (doc 19 §13) finds no touchable under 48 x 48 dp except those with an equivalent extended hit area; both Home figure buttons are at least 48 px high.
- **Decision/gap source:** D-02, D-11
- **Shot:** `UX-26.png`, `home.png` · **Lines:** 136, 823 (Undo), 159-160, 167, 245 · further (old copy): 519, 542, 579, 592-593, 691, 702, 706, 717, 736, 748, 367

##### P1-21 Toast Undo: 5 s window, polite announcement
- **Sources:** UX-26 · **Screen:** Toast (all Undo-bearing actions)
- **Issue:** Doc 19 §5 wants toasts assertive and Undo included in the announcement; doc 19 §1 says no action requires a timed response, while doc 18 §7 / C-21 specify a 5 s Undo (spec conflict, D-02). A 5 s, 32 px Undo is hard for users with motor or reading difficulties.
- **Status:** Confirmed in running UI. Toast `role="status" aria-live="polite"`; auto-dismissed after **5,108 ms**; Undo 42 x 32.
- **Change:** Undo has no timer: the toast stays until the next action (D-02), and balance-check Undo works the same way. Undo target at least 48 dp. Announce the toast assertively and include "Undo available". Phase 1 follow-up: Claude Design removed the timer only for delete and merge while other Undo toasts still last 5 s (found while applying phase 1, not in a review report); every Undo toast must stay until the next action, with no exception. Overlaps P0-05 (merge), P0-14 (delete), P1-20, P1-28, P1-36 and P1-55.
- **Accept:** With TalkBack on, the toast announces "Spent ₹340 on Food. Undo available" and stays until the user's next action; it never auto-dismisses at 5 s; this holds for every Undo-bearing action (save, edit, delete, merge, balance check, "Not useful"), not only delete and merge.
- **Decision/gap source:** D-02; G-42; follow-up found by Claude Design while applying phase 1 (not in a review report)
- **Shot:** `UX-26.png` · **Lines:** 823, 1648 (`setTimeout`) · further (old copy): 819-825, 1645-1649

##### P1-22 Trend chart: lines distinguished by colour only; stretched SVG; 5 px dots; no table alternative
- **Sources:** UX-29 · **Screen:** Reports trend chart
- **Issue:** Income `--pos` and Expense `--info` are both solid 2 px lines (doc 19 §4 needs a second channel). `preserveAspectRatio="none"` distorts text and circles. Dots are 5 px targets with only a `<title>`, no keyboard/TalkBack focus. No "View as table", caption or summary (doc 19 §8, §13).
- **Status:** Confirmed in running UI. 1 Year trend SVG viewBox 640 x 170 rendered 334 x 150 (x-scale 0.52, y-scale 0.88), strokes `var(--pos)`/`var(--info)` solid width 2, 14 circles r=2.6 with `<title>` only, no tabindex; no table or aria on the SVG.
- **Change:** Render axis labels outside the stretched SVG (or use `meet`); differentiate series by dash/marker plus direct end-labels; add a "View as table" control, a headline caption, and focusable points of at least 48 dp.
- **Accept:** In greyscale the two series are distinguishable; every plotted value is reachable via the table; axis text is at least 11 sp rendered.
- **Shot:** `UX-29.png` · **Lines:** 305 (`preserveAspectRatio`) · further (old copy): 298-336, 308, 310-313

##### P1-23 Heatmap cells carry meaning by shade; text colour switch fails contrast; no labels
- **Sources:** UX-30 · **Screen:** Reports calendar heatmap and month strips
- **Issue:** Cell fill is `color-mix(... acc600 pct% ...)` with `#fff` text when pct > 55; strip cells have no text or label; the amount appears only in a toast on tap.
- **Status:** Confirmed in running UI. 31 cells (44 x 44), 0 with aria-label (digits only); day 5 white on its fill **2.60:1**, day 1 5.91; 15 future-day cells 1.15:1 (light), 1.22:1 (dark); 5 empty strip buttons with no label. Dark white at pct 100 is 2.46:1 (old copy).
- **Change:** Keep the daily spending calendar and its month strips (Q-1; the spec's ban on calendar heatmaps gets a carve-out). Add `accessibilityLabel` "12 Aug, ₹1,240 spent"; choose text colour by computed contrast per cell and theme; fix the near-invisible future-day cells (D-21: they stay disabled but must be legible at 3:1 or more); print the selected day's amount below the grid; label month-strip buttons with their total.
- **Accept:** Every cell reads its date and amount; text contrast at least 4.5:1 at every intensity step; future-day cells are at least 3:1 in light and dark.
- **Decision/gap source:** Q-1, D-21; G-20
- **Shot:** `UX-30.png` · **Lines:** 2582 (`color-mix`) · further (old copy): 2571-2586, 391, 407

##### P1-24 Chips, segments, tabs and toggles expose state only visually
- **Sources:** UX-31, TL-16 · **Screen:** Tab bar, period/filter chips, kind segment, toggle rows (Dark theme, Show paise, notes)
- **Issue:** No `aria-pressed/selected/checked` or `tab`/`radio`/`switch` roles (doc 12 C-01/C-03, doc 13 §7, doc 19 §4); selected chips differ by fill and border only (fixed `font-weight:500`). `toggleRow(...)` converts `on` to a colour and position and never returns the boolean, so the view model cannot supply the switch state; the off-state track `--n200` is low contrast.
- **Status:** Confirmed in running UI for UX-31: on all 23 screens 0 `aria-pressed/selected/current/checked/expanded`, 0 `role=tab/switch/radio`; period chips both weight 500, differing in bg (227,240,236 vs white) and border. TL-16 confirmed by code reading (the off-state contrast was not measured).
- **Change:** Add roles/states (`tab`, `radio`, `switch` with state); bold the selected chip; add an On/Off text hint in toggle rows for greyscale; return `on` from `toggleRow`.
- **Accept:** TalkBack announces "Last 3 months, selected, 2 of 5" and "Dark theme, switch, on".
- **Shot:** `UX-41.png` (no state markup visible) · **Lines:** 3552-3554 (`toggleRow`), 3138, 3159, 3162 · further (old copy): 167, 245, 437-441, 501, 542, 805

##### P1-25 Inputs have no accessible names
- **Sources:** UX-33 · **Screen:** Payee, Note, Search transactions, Search categories, Count-it/Actual amount
- **Issue:** All inputs have a placeholder only. Doc 19 §5: every control has a label.
- **Status:** Confirmed in markup, mitigated in Chrome: none of the inputs has `aria-label` or `<label>`; Chrome falls back to the placeholder as accessible name (Playwright snapshot lists them as textboxes with those names). TalkBack behaviour untested.
- **Change:** Add a visible or accessibility label to each input ("Payee", "Note", "Search transactions", "Search categories", "Actual amount counted"); the refund sheet's input must not read the balance-check placeholder.
- **Accept:** The automated accessibility scan reports no unlabelled inputs.
- **Shot:** none · **Lines:** 159, 669 · further (old copy): 574, 575, 606, 687

##### P1-26 Widget: preview unreadable in dark mode; balance on a locked screen; content differs from S-42
- **Sources:** VUX-5 · **Screen:** Settings > Home screen widget · **Also see:** UX-46 (P2-10)
- **Issue:** The widget preview keeps a light surface with the theme's light foreground. Showing a balance on a locked device exposes private data; the design defaults it on. Content differs from S-42 (Money available or Left to spend plus a quick-add preset).
- **Status:** Confirmed in running UI: white (and white 62%) text on rgb(245,247,249), 1.05-1.07:1 for "Spent", "Received", "Moved", "₹3,550" (26 px) and "₹51,612".
- **Change:** Fix preview text to fixed dark text on the preview surface, or theme the surface (at least 4.5:1 in both themes). The default widget is three quick-add buttons (Spent / Received / Moved) with no figure (D-27); the opt-in is P1-48. Remove the claim "writes to the same local file".
- **Accept:** Preview text at least 4.5:1 in both themes; the default preview shows no balance; copy no longer claims shared-file writes.
- **Decision/gap source:** D-27; G-31
- **Shot:** `VUX-5_widget_dark.png` · **Lines:** 3267 (`widgetBalance`), 2468, 2965 · further (old copy): 447-465, 3252-3273

#### Bills and recurring

##### P1-28 One-tap "Add" on detected bills rewrites history; the EMI is suggested as an ₹11,500 bill
- **Sources:** UX-37, FIN-14 · **Screen:** Plan > Regular bills > "Looks like a regular bill"
- **Issue:** `addDetected` creates the commitment and retags every past matching `out` with `commitmentId`/`repeating:true`; the toast has no Undo; no dismiss ("Not a bill") exists although `state.dismissed` is read. S-39/C-21 want a pre-filled review and Undo. Detection also ignores grouped payments: only the interest portion carries the payee, so the suggestion is ₹11,500 not the ₹32,000 obligation.
- **Status:** Confirmed in running UI. "Home loan EMI ₹11,500 about every 31 days": one tap added it, no sheet; toast "Home loan EMI added as a regular bill" with no Undo; all 7 past EMI transactions linked (0/7 -> 7/7 `commitmentId`). `detectedRecurring()` returns amount 1,150,000 in Interest; real EMI ₹32,000.
- **Change:** Tapping a detected bill opens a pre-filled bill editor to review, with "Add" and Dismiss ("Not a bill") (Q-9). Nothing in history changes until Save. After Save, say that N past payments will be linked and offer Undo, which stays until the next action (D-02). Detection must consider group members together (move + interest) or exclude Interest & charges rows with a loan group.
- **Accept:** Each suggestion opens the editor and can be dismissed; history is unchanged until Save; adding is undoable with a sentence about N linked payments; detection never proposes a bill whose amount is a fraction of a grouped payment.
- **Decision/gap source:** Q-9, D-02; G-36
- **Shot:** `UX-37.png`, `FIN-14.png` · **Lines:** 1580 (`addDetected`), 2906, 2909 · further (old copy): 1557-1587, 2905-2910

##### P1-29 Bill-matching copy contradicts itself and the spec
- **Sources:** UX-43 · **Screen:** New bill, Typical amount sheet, Regular bills report
- **Issue:** Line 2100 says "payee and due date, not the exact amount" (a ₹500 payment for a ₹2,000 bill is said to match); line 2830 says "same payee and a similar amount lands near its due date"; F-12 is ±7 days and ±20%.
- **Status:** Confirmed in running UI. Three different wordings seen on the New bill screen, the Typical amount sheet and the Regular bills report.
- **Change:** State the real rule once ("within 7 days of the due date and within 20% of the amount", Q-4) and reuse it in all three places. Matching is implemented (P0-11), so the claim is true.
- **Accept:** One sentence, reused in all three places, says within 7 days and within 20% (F-12).
- **Decision/gap source:** Q-4; G-24
- **Shot:** `UX-43.png` · **Lines:** 2100, 2830

##### P1-30 Contradictory threshold copy: "two", "three", "another month"
- **Sources:** UX-42 · **Screen:** Onboarding, What changed, Home, App Guide
- **Issue:** Onboarding: "two complete months ... unusual spending after six"; What changed: "three full months"; Home: "once you have used this another month"; code `enoughBaseline` needs ≥3 qualifying months.
- **Status:** Confirmed in running UI. All three wordings seen.
- **Change:** Derive the copy from one constant and name the specific unmet condition ("2 more complete months").
- **Accept:** The same threshold appears in onboarding, What changed, Reports hub and the guide.
- **Shot:** `UX-42.png` · **Lines:** 3227 (two), 2789 (three), 1359 (`enoughBaseline`) · further (old copy): 2504

#### Accounts, lending and Outside

##### P1-31 Accounts screen: credit shown as debt; totals that do not reconcile; two "Money available" numbers
- **Sources:** FIN-18 · **Screen:** Accounts, Account hero · **Also see:** P0-09
- **Issue:** A card with a positive balance reads "You owe ₹2,400" (spec: "in credit"); "What you have" aside adds all asset accounts plus lent principal while the hero above shows `moneyAvailableAll()`; Home uses `moneyAvailable()` (private excluded); overdrawn assets show a bare "-₹X".
- **Status:** Confirmed in running UI. After a ₹2,400 card overpayment: "Everyday card ₹2,400" under WHAT YOU OWE whose total is ₹4,88,500 (rows add to ₹4,90,900); "Money available" ₹48,800 (all accounts) vs Home ₹3,550; overdrawn cash "-₹7,850" without "(overdrawn)".
- **Change:** Owed with balance > 0 -> "in credit"; section totals equal the sum of their rows; one definition of Money available (all available accounts, private ones included, D-05); append "(overdrawn)". "Owed to you" is a separate line and lent principal is never part of "What you have" (D-03b).
- **Accept:** Overpay a card by ₹2,400 -> "Card ₹2,400 in credit", owed totals unchanged; "What you have" contains no lent principal; "Owed to you" shows lent principal and interest on its own line; the hero equals the "What you have" aside when all assets count.
- **Decision/gap source:** D-03b, D-05, D-14; G-18, G-19, G-29
- **Shot:** `FIN-18.png` · **Lines:** 2979, 2986 · further (old copy): 2981-2984, 3085, 3357, 1212-1213

##### P1-32 "Move the remaining balance first" banner moves money the wrong way for owed and overdrawn accounts
- **Sources:** FIN-19 · **Screen:** Edit account (archive, EX-01)
- **Issue:** The banner pre-fills Moved from the account to Bank for any non-zero balance; for a card owing ₹X that is a cash advance that doubles the debt.
- **Status:** Confirmed in running UI. Card owing ₹3,350: "Move it somewhere" opens Moved card -> Bank ₹3,350; saved: card -₹6,700, bank +₹3,350.
- **Change:** Direction from sign and class: owed with debt -> Bank to Card; overdrawn -> Bank to account; positive asset -> account to Bank.
- **Accept:** Archiving a card owing ₹3,350 pre-fills Moved Bank -> Card ₹3,350 and ends at balance 0.
- **Shot:** `FIN-19.png` · **Lines:** 3360 (banner and `patchAdd`), 3361

##### P1-33 Lending subsystem: not in spec; net-worth wording; write-off defects; cannot enter an existing loan
- **Sources:** FIN-9, FIN-10 · **Screen:** Accounts > Money lent, Add a loan, Loan detail
- **Issue:** Spec T-30 says lending is a Moved to Outside (not spending) and lists Net worth as a non-goal; the design adds a `lent` account, simple-interest accrual, interest-first repayments, "Interest earned" income and a "Lending write-off" expense, plus net-worth copy ("lending money does not change your net worth"). Write-off inflates Spent in the month; written-off loans still count and accrue; a past loan cannot be recorded (start date = today, always posts a Moved from the source); `deleteLoan` removes ledger rows silently.
- **Status:** Confirmed in running UI. Write-off of ₹10,000 raised Spent 51,27,200 -> 61,27,200 (+₹10,000). Lend ₹10,000 at 12% then write off: `balance('lent')` 0 but `loanTotals().outstanding` ₹10,000, Accounts "MONEY LENT ₹10,000, 0 active loans", accrued interest ₹1,200 on the written-off loan (as of 2027-08-16), total receivable ₹11,200. No past-loan path. Tax flag on interest: advice item, not testable.
- **Change:** Lending stays in v1 (D-03); docs 02, 04, 05 and the v1.1 non-goals are amended (section 9). Write-off is a separate loss line and not part of Spent (D-03a). Written-off loans contribute 0 to every total and stop accruing interest. "Owed to you" is a separate line and never part of "What you have" (D-03b). Remove net-worth wording. Add an "already lent earlier" path (opening receivable, no account movement) and a lending-date picker. The typed rate and the delete/settle rules are P1-46.
- **Accept:** No UI string contains "net worth"; lend ₹10,000 then write off -> Spent unchanged, a loss line of ₹10,000, "Owed to you" ₹0, interest frozen; "What you have" never includes lent principal; an opening receivable of ₹5,000 leaves all asset balances unchanged.
- **Decision/gap source:** D-03, D-03a, D-03b; G-04, G-05, G-06, G-07, G-08, G-18, G-19
- **Shot:** `FIN-9.png`, `FIN-10.png` · **Lines:** 860, 1261, 1278, 1302 (`writtenOff`), 2194, 3004 · further (old copy): 1228-1310, 2986

##### P1-34 "Somewhere else" (Outside): aggregated across labels; withdrawals unrecordable; income can be posted into it; label stored in the note
- **Sources:** FIN-11 · **Screen:** Accounts, Somewhere-else hero, Moved/Received pickers
- **Issue:** EX-06: Outside is never shown in aggregate across labels. System accounts are excluded from the Moved `from` picker (T-29 withdrawal impossible); the Received "Into" picker lists Outside; the label is overloaded onto `note` (spec has `outside_label`).
- **Status:** Confirmed in running UI. Received picker lists Somewhere else; Moved "from" picker does not; Accounts shows "Money put somewhere untracked ₹40,000" and the hero "₹40,000" (sum across labels) while its note says "this figure joins no total".
- **Change:** Remove the cross-label total; add Outside as a `from` option for Moved only; exclude system accounts from Received; store the label in its own field.
- **Accept:** T-28 then T-29 produce "Mutual fund - ₹20,000 put in" then "fully withdrawn"; no total anywhere; Received cannot select Outside.
- **Shot:** `FIN-11.png` · **Lines:** 1542 (`outsideLabels`), 2984, 3235, 3242 · further (old copy): 1705, 2051, 3236-3238

##### P1-35 Starting balance, bill amount, due day and EMI interest can only be picked from presets
- **Sources:** UX-40, FIN-22, FIN-13 · **Screen:** Add account (balance), Edit bill (amount, due day), month-start, EMI interest question
- **Issue:** F-02/S-13 make a typed starting balance mandatory. Presets only: balance `[0, 1000, 5000, 25000, 18400]` (rupees), bill amount Current/+10%/-10%, due day 1,5,10,15,20,25,28, month start 1,5,15,25, new-account name a stub toggle ("Second bank"). A new Savings asset is silently counted in Money available (no `counts_as_available` choice). EMI "How much of it is interest?" offers only 0 / 12% / 20% of the payment, so the user cannot type the statement figure; "Interest & charges" also lumps card late fees with loan interest (tax relevance Sec 24(b)/80C).
- **Status:** Confirmed in running UI. Balance sheet has 0 inputs; Streamly Amount: Current, ₹714, ₹584 only; due day list as above. Nuance: **New regular bill > Amount has a real decimal input** (placeholder "e.g. 2000"); the preset limitation holds for editing an existing bill. Savings ₹1,00,000 raised Left to spend to ₹1,00,901 at once. EMI ₹32,000 offers No interest, ₹3,840, ₹6,400.
- **Change:** Design numeric entry sheets (reuse the add keypad, live Indian grouping) for starting balance, bill amount (edit), due day, month start and EMI interest (default 0, with the statement hint) (D-10). Add a counts-as-available switch for assets (default off for Savings). The account name flow stays as built (D-10: not selected). No tax tag or sub-label for interest (D-17).
- **Accept:** ₹47,650.50 entered -> start row exactly 4765050 paise; any day 1-28 selectable; EMI ₹32,000 with interest ₹11,437.50 -> move ₹20,562.50 and interest ₹11,437.50 paise-exact; a Savings account is excluded from Money available until switched on.
- **Decision/gap source:** D-10, D-17; G-41
- **Shot:** `UX-40.png`, `FIN-22.png`, `FIN-13.png` · **Lines:** 3323 (`Second bank`), 2189 (EMI question), 3313 · further (old copy): 2057-2070, 2122-2126, 1968-1991, 2185-2190

##### P1-36 Balance check: Undo is a 5 s toast; input and wording problems
- **Sources:** UX-39, FIN-25 · **Screen:** Balance check sheet, Account hero
- **Issue:** Spec doc 18 §6 / C-18 / F-10: Undo persists until the next check on that account; here only the 5 s toast. The sheet drops a leading minus (overdrawn balance cannot be entered); the owed-account body reads "More money is here than recorded"; loan drift where the user owes LESS is undefined in the spec; no once-per-day limit in `recordCheck`.
- **Status:** Confirmed in running UI. Cash counted 1900 (expected 2,150): toast "Recorded ₹250 Undo" gone after 5.8 s; the account page shows "Last checked 16 Aug - a gap of ₹250 was recorded." with 0 undo controls. "-1200" on Cash becomes ₹1,200 ("₹950 less than expected"). Loan check ₹4,00,000: "₹88,500 less owed than recorded" with body "More money is here than recorded..." and action "Record ₹88,500 I forgot to add".
- **Change:** Show "Undo this fix" on the account screen until the next check on that account; Undo has no timer (D-02). Allow a leading minus on asset accounts. Use owed-specific wording ("owe less than recorded"). When the user owes LESS than recorded, record an adjustment entry that is neither Spent nor Received (D-18). Keep "Mark as checked" free of "Great".
- **Accept:** After a fix, reopening the account the next day still offers Undo; "-1200" is accepted on a bank account; T-62/T-63 copy reads "owe less than recorded"; a loan check of ₹4,00,000 against ₹4,88,500 records an ₹88,500 adjustment that changes neither Spent nor Received.
- **Decision/gap source:** D-02, D-18; G-42
- **Shot:** `UX-39.png`, `FIN-25.png` · **Lines:** 2349 ("Great — mark as checked"), 2368 (`recordCheck`) · further (old copy): 2342, 2360-2363, 2368-2375, 2381, 3085

#### Data safety and settings

##### P1-37 Restore, import, backup and export lack previews; destinations are fake; export is filtered
- **Sources:** UX-38, FIN-30 · **Screen:** Settings > Your data (Backup, Restore, Import, Erase, Export, PDF)
- **Issue:** Restore asks to confirm before the file is chosen ("Choose a file and restore"), so date, count and schema version are never shown; Import is "Import finished" with hard-coded 412 / 389 / 23, no preview and no row-numbered invalid rows (doc 18 §5); backup row always "Last one: never"; Erase copy lists "account, bill and limit" but removes transactions only. Backup/CSV/PDF actions are toasts claiming "written to Downloads" (spec: user-chosen location via file picker, never a location the user did not choose; PDF export is P2, F-42). "Export a spreadsheet - CSV of transactions in the current filter" cannot round-trip (T-73; spec §24 full CSV).
- **Status:** Confirmed in running UI. "Export a backup file" toasted "Backup written to Downloads" while the row still says "Last one: never"; Restore, Import as described; Erase: txs 299 -> 0, accounts 7 -> 7, limits 5 -> 5, bills 8 -> 8. Export copy confirmed; import summary not run.
- **Change:** Order: choose file -> show metadata (date, transaction count, version) -> confirm. Add an import preview with new/skipped/invalid counts and a row-numbered invalid list. Show the real last-backup date. Keep "Your data" as one screen with CSV and PDF as built (D-29: the prototype wins; S-27 to S-29 are amended). Replace the "written to Downloads" toasts with a file-picker step. Name the CSV by its scope ("current filter") and offer the full CSV for round trips (T-73). Erase everything is P1-54.
- **Accept:** Restore shows the file's date, count and version before any destructive button; Import shows a preview with row-numbered errors before it writes; T-73 passes through the full CSV from any filter state; no copy names a fixed path.
- **Decision/gap source:** D-29, Q-8, Q-10, Q-11; G-48, G-56, G-57
- **Shot:** `UX-38_erase.png`, `FIN-30.png` · **Lines:** 2155, 2159 (`Import finished`), 3185 (backup/CSV toasts, "Last one: never", export copy) · further (old copy): 2139-2164, 1966

##### P1-38 Onboarding does not match F-01 / S-31 and has no completion step
- **Sources:** UX-41 · **Screen:** Onboarding (Getting started)
- **Issue:** Design steps: accounts, repeating bills, record the last thing you spent. Spec: currency/format, first account (required), categories. Step 1 jumps out to Settings; step 3 has no "Finish" (only "Start again from step 1"); progress is text ("Step 1 of 3").
- **Status:** Confirmed in running UI. Step 1 lists existing accounts; step 2 "Next — record one thing", "Skip this"; step 3 buttons are only "Record something now" and "Start again from step 1"; no `progressbar`.
- **Change:** Keep the built steps: accounts, regular bills, record one expense (D-06); F-01 and S-31 are amended. Every step has Skip (D-06a). Add a progress indicator and a clear "Done -> Home" on the last step. Keep sub-edits as sheets so the user does not lose the step. Correct the "Three taps" copy (P0-02). Empty states after Skip are P1-50.
- **Accept:** A new user can Skip on every step and lands on Home with one primary button; can edit an account without losing the step; the last step has a Done button.
- **Decision/gap source:** D-06, D-06a, D-29; G-28, G-17
- **Shot:** `UX-41.png` · **Lines:** 3202, 3225, 3227, 3228 ("Record something now"), 3229

##### P1-39 Reminders default to ON with no permission-in-context
- **Sources:** none (design item; the originating engineering finding was removed) · **Screen:** Settings > Reminders
- **Issue:** Defaults `p.notifyBills !== false` etc. are on; the notification permission should be requested at first reminder setup (doc 20 §10); the copy promises at most four a month (doc 07:139) and a 14-day nudge.
- **Status:** Confirmed by code reading (not measured).
- **Change:** Default all reminders OFF (D-28). Turning the first one on explains what will be sent and then requests the notification permission at that moment (flow in P1-49). Keep the "at most four a month" promise and show no amounts or payee names in notification text.
- **Accept:** The permission dialog appears only after a reminder is enabled; notification text on the lock screen contains no amounts or payee names.
- **Decision/gap source:** D-28; G-59
- **Shot:** none · **Lines:** 3169 (`At most four a month`), 3170 (`notifyBills`)

##### P1-40 Theme: no "follow system"; palette picker with design-note copy; light default
- **Sources:** UX-45 · **Screen:** Preferences (Dark theme, Color palette)
- **Issue:** Only a boolean "Dark theme"; doc 03:167 / doc 13 §11 want system, light, dark (system-following by default). The palette sheet has 8 options with descriptions such as "The most distinctive direction" and "Cool, calm, quietly premium" and palette names like "Dark-First Premium"; the spec defines one accent (`#2F6F5E`). Dark `--bg` values are dark greys (`#14171B`); a true-black option is a question.
- **Status:** Confirmed in running UI: Preferences has "Dark theme" and "Color palette" ("Sage Trust"); emulating `prefers-color-scheme: dark` left `data-theme="light"`.
- **Change:** Offer three theme options: Follow system (default), Light, Dark. All 8 palettes ship in Preferences (D-04): keep the picker and rewrite names and descriptions in user-facing wording (no design-review language). Dark mode uses the designed dark grey (#14171B); there is no true-black option (D-31).
- **Accept:** Theme has three options and a fresh install follows system; the picker shows 8 palettes with plain descriptions and each passes AA in both themes (P0-07); no true-black option exists.
- **Decision/gap source:** D-04, D-31; G-01, G-60
- **Shot:** `prefs_light.png`, `prefs_dark.png` · **Lines:** 3159 (`Dark theme`), 1975, 3180 (`Sage Trust`), 14-29

#### Transactions list and detail

##### P1-41 Transaction search reveals masked private income and goes beyond the spec
- **Sources:** TL-5 · **Screen:** Transactions search
- **Issue:** The filter also matches `String(Math.round(t.amount/100))`, so typing digits finds a masked income row ("Amount private"); it matches category names, substring amounts ("5" matches 5, 15, 500, 12,500), has no 2-character minimum, no accent folding, no payee-first ranking (doc 17 §1: payee and note only, 2-char minimum, exact amount plus a range chip).
- **Status:** Confirmed in running UI. Search "110000" returns the Northwind salary row shown as "₹•••••"; "5" matches 13 transactions; "Home" matches 3 by category name; "café" matches 0 while "cafe" matches 1.
- **Change:** Search matches payee, note and category name (Q-6), and amounts by digit match as built (D-25): 340 finds 340, 3,400 and 340.50. Amounts of private accounts are masked and never matched, and no result count reveals them (D-05). Fold accents ("cafe" matches "Café").
- **Accept:** With a private account's income of ₹85,000, searching "85000" returns nothing from it and no count reveals it; "340" finds 340, 3,400 and 340.50; "food" matches by category name; "cafe" matches "Café".
- **Decision/gap source:** D-25, Q-6, D-05; G-26
- **Shot:** `TL-5.png` · **Lines:** 3609, 3641, 3578 · further (old copy): 3607-3610

##### P1-42 Transactions filters are narrower than doc 17; payee list capped at 12; wrong empty text
- **Sources:** TL-9 · **Screen:** Transactions filter chips and payee filter
- **Issue:** Only This month / Last month / All time; kinds Spent/Received/Moved/Came back; account filter only after arriving from elsewhere; no month choose, custom range, amount range, multi-select, Corrections kind, "Include archived", "Clear all" or resolved date range. Payee list is `slice(0,12)` with no search. A payee-only or kind-only empty result says "No transactions in this period yet".
- **Status:** Confirmed by code reading (the filtered-empty message and missing "Clear filters" were also observed in the running UI under UX-22).
- **Change:** Implement the doc 17 §2 filter set; searchable payee list; empty-state branch on any active filter with a Clear action.
- **Accept:** Every doc 17 §2 filter is operable; filtering to a payee with no rows shows "No transactions match. Clear filters?" and the action resets.
- **Shot:** none · **Lines:** 3628-3639 (filters), 3651, 2173

##### P1-43 Refund: always dated today, always to the original account, no revised-period marker
- **Sources:** TL-11 · **Screen:** Refund sheet ("Mark money came back"), list row, monthly review
- **Issue:** `recordBack` writes `date: TODAY`, `to: p.from`; no date or account field; the refund sheet reuses the balance-check template (placeholder "Count it and type the amount"); no revised-period flag (F-06), no refunded badge or remaining-refundable on the list row (doc 12), and a refund larger than that month's category spend makes the category negative without explanation.
- **Status:** Confirmed in running UI. `recordBack` writes `date: TODAY`, `to: p.from` (card); the refund sheet has no date or account field and its placeholder reads "Count it and type the amount"; no revised-period marker.
- **Change:** Add a date field (default today; any date after the purchase) and an account picker (default the original account, changeable) (D-23); a revised-period flag and a note in the monthly review; a refund-specific placeholder; a negative-category explanation; a refunded badge on the list row.
- **Accept:** T-06/T-07 pass; a May purchase refunded in July to a different account reduces July category spend, raises the destination balance and flags May as revised.
- **Decision/gap source:** D-23; G-63
- **Shot:** `TL-11.png` · **Lines:** 3804-3808 (`recordBack`), 3690, 3778-3803, 669

#### Prototype data

##### P1-44 Seed and dataset realism: negative opening balances, EMI booked inconsistently, impossible first-week figures
- **Sources:** FIN-12, VFIN-3, VUX-4 · **Screen:** Seed data, dataset tweaks (First week, Two years), Home, R04
- **Issue:** Derived opening balances are negative (bank -₹1,27,425, cash -₹15,451) and interest is 36% of the EMI (~28% a year); the two-year dataset books prior-year EMI as one `out` in Interest with no move (violating INV-03/INV-07, so seasonal and year-on-year comparisons compare unlike things); 51 of 51 non-`out` rows carry `essential:false, repeating:false` (INV-12). First-week Home shows negative available money, a ₹6.4L debt, and a contradictory What changed.
- **Status:** Confirmed in running UI. Opening rows 2026-01-31 as stated; two-year prior EMI single `out` ₹20,500, opening re-solved to 2024-07-31 (bank ₹7,57,693). First week: Home "Available ... −₹4,972", "Left to spend −₹7,621", "You owe ₹6,38,948", Spent ₹7,263, insight "Streamly went up to ₹499..." from history the dataset lacks; R04 "Once you have used this for three full months ... it would be guessing." above a WHAT MOVED list with "Typical ₹0" and +₹3,598 (VUX-4 may be a dataset-generation artefact).
- **Change:** Build the seed forward from plausible non-negative opening balances; book prior EMI exactly like current (move + small interest out) with a realistic interest share; null the flags off-`out`; keep the first week's income and opening balances consistent; hide What moved while the threshold message is shown.
- **Accept:** Every dataset starts with all asset accounts ≥ 0 and Left to spend consistent with the narrative; the EMI treatment is identical in every month of every dataset; INV-01..INV-12 hold on the generated ledger; R04 shows the threshold message only.
- **Shot:** `FIN-24.png`, `UX-21.png`, `UX-42.png`, `ds_firstweek_home.png` · **Lines:** 880, 924, 925, 934, 935, 901 · further (old copy): 959-971, 1028, 1048


#### Items created by the decisions

Design work that a decision creates and no earlier item covers.

##### P1-45 Private accounts: per-account switch, global "Hide all", masked display
- **Sources:** none (new design item created by decisions) · **Screen:** Account editor, Preferences, Home, Accounts, lists, detail, reports
- **Issue:** Private accounts are display-only (D-05). The prototype drops the account from the totals (P0-09, P0-10) and has a single per-account flag with no global switch and no defined reveal method.
- **Status:** Design work created by a decision (not a review finding); no prototype evidence to measure.
- **Change:** Add a "Private" switch in each account's editor and one global "Hide all" switch (D-05a); either can be turned on or off at any time. Private hides only the balance and the amounts of that account's transactions (D-05b): amounts show as dots on Home, lists, detail and reports, while the account name, payee, category and date stay visible. Totals are always exact. A value is revealed only by turning that account's switch (or Hide all) off: no tap-to-reveal and no biometric prompt. Search never matches a masked amount (P1-41). Masked amounts read "Amount hidden" to a screen reader.
- **Accept:** Turn an account private: its balance and its transactions' amounts show dots on Home, Accounts, lists, detail and reports, and Home available and every total stay unchanged; the account name and transactions stay visible; Hide all masks every account; turning the switch off reveals the values; searching a hidden amount finds nothing; a screen reader reads "Amount hidden".
- **Decision/gap source:** D-05, D-05a, D-05b; G-03, G-29
- **Shot:** none · **Lines:** none

##### P1-46 Lending: typed yearly rate, delete only if nothing was repaid, settle or archive
- **Sources:** none (new design item created by decisions) · **Screen:** Add a loan, Loan detail, Money lent
- **Issue:** Add-a-loan offers only preset rates (or 0%, 12%, 20% of the payment for EMI interest), and delete removes the loan together with its linked transactions with no list.
- **Status:** Design work created by a decision (not a review finding); no prototype evidence to measure.
- **Change:** Loan interest is optional simple interest and the user types the yearly rate in a field (Q-12a). Delete is offered only when nothing was repaid, and its confirmation names the linked transactions; once any repayment exists, offer "Mark settled" or "Archive" instead (Q-12b). The loss line for a write-off and the "Owed to you" line are in P1-33.
- **Accept:** A rate such as 9.5% can be typed; interest accrues as simple interest on the outstanding principal; a loan with a repayment has no Delete and offers "Mark settled" and "Archive"; deleting an untouched loan first lists the linked transactions.
- **Decision/gap source:** Q-12a, Q-12b, D-03; G-04, G-05, G-09
- **Shot:** none · **Lines:** none

##### P1-47 "Turn on app lock" flow and the "phone has no lock" state
- **Sources:** none (new design item created by decisions) · **Screen:** Settings > App lock
- **Issue:** The prototype sets a fixed passcode with one tap. With D-30a the app stores no PIN, and D-10a replaces passcode set-up with a "Turn on app lock" flow.
- **Status:** Design work created by a decision (not a review finding); no prototype evidence to measure.
- **Change:** Design "Turn on app lock" with no PIN screens (D-10a): (1) the app checks that the phone has a screen lock or biometric; (2) one plain screen says the app uses the phone's unlock, keeps no PIN, cannot recover access and does not lock backups; (3) the user confirms once with the phone's own prompt; (4) the user picks the background threshold. Design a "phone has no lock set" state: the switch stays off, one sentence explains that the phone needs a screen lock first, and a button opens the phone's security settings. Turning the lock off asks for the phone prompt once. Keep "Lock now".
- **Accept:** On a phone with a screen lock the flow finishes in at most 3 screens with one phone prompt; on a phone with no lock the switch cannot turn on and the "phone has no lock set" state shows a route to the phone settings; no PIN entry or PIN creation screen exists in the app.
- **Decision/gap source:** D-10a, D-30a, D-10; G-21, G-58, G-16
- **Shot:** none · **Lines:** none

##### P1-48 Widget opt-in: no figures by default
- **Sources:** none (new design item created by decisions) · **Screen:** Settings > Home screen widget
- **Issue:** The prototype widget shows a balance by default. D-27 makes the default quick-add buttons only.
- **Status:** Design work created by a decision (not a review finding); no prototype evidence to measure.
- **Change:** The widget defaults to the three quick-add buttons (Spent / Received / Moved) with no figure. Add an opt-in in the widget settings: "Show Money available" or "Show Left to spend" (off by default), with one line that a figure on a locked phone can be read by anyone. The preview shows both states.
- **Accept:** A fresh install's widget and its preview show no figure; turning the opt-in on shows exactly the one chosen figure; turning it off removes it; the preview is legible in both themes.
- **Decision/gap source:** D-27; G-31
- **Shot:** none · **Lines:** none

##### P1-49 Reminders opt-in flow and permission-denied state
- **Sources:** none (new design item created by decisions) · **Screen:** Settings > Reminders
- **Issue:** Reminders are off until the user turns them on, and the notification permission is asked at that moment (D-28).
- **Status:** Design work created by a decision (not a review finding); no prototype evidence to measure.
- **Change:** Reminders opens with every reminder off and a short line: what each sends, at most four a month, no amounts or payee names. Turning the first reminder on shows a short explainer and then the Android notification permission request. Design the "permission denied" state: the switch stays off, one sentence explains why, and a link opens the phone's notification settings. Turning every reminder off needs no prompt.
- **Accept:** No permission dialog appears at install or when Reminders is opened; it appears right after the first reminder is turned on; denying leaves the switch off and shows the denied state.
- **Decision/gap source:** D-28; G-59
- **Shot:** none · **Lines:** none

##### P1-50 Empty states when onboarding is skipped: no accounts, no bills, no entries
- **Sources:** none (new design item created by decisions) · **Screen:** Home, Accounts, add sheet, Plan, Regular bills, Limits, Reports, Transactions
- **Issue:** Skip is on every onboarding step (D-06a), so the app must work with no accounts, no regular bills and no entries. The prototype always loads seed data.
- **Status:** Design work created by a decision (not a review finding); no prototype evidence to measure.
- **Change:** Design a real empty state (icon or illustration, one sentence, one primary action) for: Home with no accounts; the add sheet with no account (offers "Add an account" without losing the typed amount); Accounts; Regular bills and Plan with no bills ("Add a regular bill"); Limits with none set; Reports with no entries (names the unmet condition); Transactions with no entries (P1-11). Left to spend and Money available show "Add an account to see this" instead of a misleading ₹0.
- **Accept:** Skip all three onboarding steps: every tab opens without error and shows its empty state with a primary action; adding the first account removes that empty state; no screen shows a misleading ₹0 total.
- **Decision/gap source:** D-06a, D-06; G-28
- **Shot:** none · **Lines:** none

##### P1-51 Accounts moves under Home
- **Sources:** none (new design item created by decisions) · **Screen:** Home, Accounts, Settings
- **Issue:** "How much money I have" lives under Settings today, and Home jumps across tabs to reach it (P1-06). D-14 moves Accounts under Home.
- **Status:** Design work created by a decision (not a review finding); no prototype evidence to measure.
- **Change:** Accounts becomes a child of the Home tab: the "Money available" and "You owe" figures on Home open it, and Back returns to Home. Settings keeps account set-up only (add, edit, archive) and shows no balances. Update the navigation drawing.
- **Accept:** Home -> money available -> Accounts -> Back returns to Home; Settings shows no balances; add, edit and archive of an account stay reachable from Settings.
- **Decision/gap source:** D-14; G-29
- **Shot:** none · **Lines:** none

##### P1-52 Year start setting and financial-year chips
- **Sources:** none (new design item created by decisions) · **Screen:** Preferences, year views in Reports
- **Issue:** The prototype has calendar-year views only and no financial-year view. D-16 and D-16a add a user-chosen year start.
- **Status:** Design work created by a decision (not a review finding); no prototype evidence to measure.
- **Change:** Add a "Year starts in" setting in Preferences with two choices, January or April; the default is January (D-16, D-16a). Year views show the chips This year, Last year and 1 Year (rolling). With an April start, This year and Last year read "FY 2026-27" and "FY 2025-26". Monthly views keep honouring the month-start day (D-15). Set aside annual commitments against the chosen year (P2-14). No tax features, tags or flags (D-17).
- **Accept:** The default shows calendar years; switching to April relabels the chips "FY 2026-27" and "FY 2025-26" and recalculates; "1 Year" stays rolling; no tax tag appears anywhere.
- **Decision/gap source:** D-16, D-16a, D-17; G-12, G-41
- **Shot:** none · **Lines:** none

##### P1-53 Period label as a date range
- **Sources:** none (new design item created by decisions) · **Screen:** Period header, chips, strips, reports
- **Issue:** With a custom month-start day the prototype labels a period by its start month ("Jul 2026" on 16 Aug). D-15 shows the date range.
- **Status:** Design work created by a decision (not a review finding); no prototype evidence to measure.
- **Change:** When the month-start day is not 1, label every period by its date range, e.g. "25 Jul - 24 Aug" (D-15); with start day 1 keep "Aug 2026". Use the same label in the period header, chips, strips and reports. Check that the longest label fits at 320 dp and 200% text (wrap, never clip).
- **Accept:** With month start 25 the header reads "25 Jul - 24 Aug" and is not clipped at 320 dp and 200% text; with start day 1 it reads "Aug 2026".
- **Decision/gap source:** D-15; G-41
- **Shot:** none · **Lines:** none

##### P1-54 Erase everything: typed confirmation and backup prompt
- **Sources:** none (new design item created by decisions) · **Screen:** Settings > Your data > Erase everything
- **Issue:** The prototype erases after one confirm sheet, and its copy does not match what is removed (P1-37). Q-2 keeps the feature with a typed confirmation and a backup prompt.
- **Status:** Design work created by a decision (not a review finding); no prototype evidence to measure.
- **Change:** Before the destructive button enables, show a "Back up first" prompt with a Back up now action, then ask the user to type a confirmation word. The copy lists exactly what is erased (transactions, accounts, bills, limits). After the erase the app shows the proper empty state (P0-04, P1-50). Amend S-27 to S-29 (section 9).
- **Accept:** The Erase button stays disabled until the word is typed; the backup prompt shows first; after erase Home shows its empty state with no error; the copy matches what is removed.
- **Decision/gap source:** Q-2; G-10
- **Shot:** none · **Lines:** none

##### P1-55 Insight actions: "Not useful" hides the type; "Mark as a one-off" lets the user pick
- **Sources:** none (new design item created by decisions) · **Screen:** Home insight card
- **Issue:** "Not useful" hides one subject only, and "Mark as a one-off" silently marks the largest transaction in the category.
- **Status:** Design work created by a decision (not a review finding); no prototype evidence to measure.
- **Change:** "Not useful" hides that insight type from now on and a toast says so (Q-13: decided by assistant, open to revision; the spec's type-level suppression); Undo stays until the next action (D-02). "Mark as a one-off" opens a picker so the user chooses the transaction, and nothing changes before the choice. The "x" dismiss is P0-16.
- **Accept:** Tapping "Not useful" on a price insight hides all price insights; "Mark as a one-off" lists the category's transactions and marks only the chosen one.
- **Decision/gap source:** Q-13 (decided by assistant, open to revision), D-02; G-39, G-66
- **Shot:** none · **Lines:** none

##### P1-56 Supported screens: 360 x 640 dp (320 dp must not break), 200% text, tablet column, landscape
- **Sources:** none (new design item created by decisions) · **Screen:** All screens
- **Issue:** No minimum device or text scale was defined (D-11).
- **Status:** Design work created by a decision (not a review finding); no prototype evidence to measure.
- **Change:** Design and check every screen on a minimum of 360 x 640 dp portrait with text scale up to 200%; at 320 dp wide nothing may break (no clipped or hidden controls) (D-11 revised by product owner 2026-11-02). On tablets (600 dp and wider) show the phone layout in a centred column at most 560 dp wide. Landscape must not break or hide Save, the tabs or content. No separate tablet layout.
- **Accept:** Snapshots at 360 x 640 / 200%, 320 dp wide / 200% (no clipped or hidden control), 412 x 892 / 130%, a 600 dp-wide tablet (centred, 560 dp max) and landscape show no clipped tab label, no truncated amount and a reachable Save.
- **Decision/gap source:** D-11 (revised by product owner 2026-11-02)
- **Shot:** none · **Lines:** none

##### P1-57 Delete, Erase and Merge red buttons fail contrast in dark mode
- **Sources:** none (found by Claude Design while applying phase 1; not in a review report) · **Screen:** Delete sheet, Erase everything, Category merge · **Also see:** P0-07 (accent buttons)
- **Issue:** The red Delete, Erase and Merge buttons fail contrast in dark mode (about 2.9:1).
- **Status:** Reported by Claude Design while applying phase 1; not re-measured for this document.
- **Change:** Make the text and fill of these buttons meet 4.5:1 in light and dark mode for all 8 palettes (D-04).
- **Accept:** Measured contrast of the Delete, Erase and Merge button text against its fill is at least 4.5:1 in light and dark, for all 8 palettes (16 pairs).
- **Decision/gap source:** D-04; found by Claude Design while applying phase 1 (not in a review report)
- **Shot:** none · **Lines:** none

##### P1-58 With zero accounts the add sheet still saves to a missing "bank" account
- **Sources:** none (found by Claude Design while applying phase 1; not in a review report) · **Screen:** Add sheet · **Also see:** P1-50 (empty states), P0-04
- **Issue:** With no accounts, the add sheet still saves a transaction to an account called "bank" that does not exist.
- **Status:** Reported by Claude Design while applying phase 1; not re-measured for this document.
- **Change:** With no accounts, the add sheet must prompt the user to create an account and must not save to a missing account. Keep the typed amount (as P1-50 requires).
- **Accept:** With zero accounts, tapping Save opens the create-account prompt, saves nothing and keeps the typed amount; after the account is created the entry saves to it.
- **Decision/gap source:** D-06a; found by Claude Design while applying phase 1 (not in a review report); related to P1-50
- **Shot:** none · **Lines:** none


### 4.3 P2

##### P2-01 "Catching up" link competes with More; no running count
- **Sources:** UX-9 · **Screen:** Add sheet
- **Issue:** A permanent 13 px "Catching up on several days?" link sits beside More; the S-43 running count is absent; the toggle is not the F-27 trigger (≥7 days without entries).
- **Status:** Confirmed in running UI. After enabling and saving a ₹100 Eating Out entry no counter or "added" text appears. Day-1 visibility could not be tested (VUX-1).
- **Change:** Show the control only after ≥7 days without entries, or move it behind More; add an "N added" counter.
- **Accept:** On a day-1 install the control is not visible; once enabled each save increments a visible counter.
- **Shot:** none · **Lines:** 2329 · further (old copy): 1723 · further (old copy): 591-594, 2327-2330 · **Depends on:** P0-04 (empty-state testing)

##### P2-02 Settings mixes in Plan items; Balance check and Payees have no entry
- **Sources:** UX-15 · **Screen:** Settings, Home
- **Issue:** Settings holds "Regular bills" and "Spending limits" (Plan content). S-19 lists "Payees (P1)" and "Balance check", neither present; the balance check is four levels deep (Settings > Accounts > account > "Check this balance" > sheet); the reliability prompt has no Home slot.
- **Status:** Confirmed in running UI. Settings lists Accounts, Categories, Regular bills (7), Spending limits (5), Preferences, App lock, Widget, Your data, Getting started, About; no Payees, no Balance check.
- **Change:** Add a Balance check row (account chooser) in Settings and a Home entry when reliability is "gaps"; drop or label the Plan duplicates; add Payees. Accounts moves under Home (P1-51); Settings keeps account set-up only.
- **Accept:** A balance check can start from Home in two taps when reliability is "gaps".
- **Decision/gap source:** D-14
- **Shot:** none · **Lines:** 2965, 2964 (old copy), 2462 (old copy)

##### P2-03 The FAB changes meaning on one screen and sits bottom-right
- **Sources:** UX-16 · **Screen:** FAB on all tab roots and Regular bills
- **Issue:** On the Regular bills route the label becomes "Add a regular bill" and it calls `push('newcommitment')`; doc 09 §1 / C-01 draw it as the global Add sheet, centred in the tab bar. It is a bare "+".
- **Status:** Confirmed in running UI. On Plan > Regular bills the FAB aria-label becomes "Add a regular bill" (elsewhere "Add a transaction").
- **Change:** The FAB sits bottom-right and has one meaning everywhere: add transaction (D-08). Remove the "Add a regular bill" variant and put "Add a regular bill" as an inline button on Regular bills. The spec tab-bar drawing is amended.
- **Accept:** FAB label and behaviour are identical on all five tab roots and their children.
- **Decision/gap source:** D-08; G-13
- **Shot:** `UX-37.png` · **Lines:** 2389 · further (old copy): 508

##### P2-04 Tab icons reuse glyphs with other meanings
- **Sources:** UX-17 · **Screen:** Tab bar
- **Issue:** The Transactions icon (two arrows) matches the Moved glyph; the Plan icon is a clock (suggests History).
- **Status:** Confirmed in running UI. Transactions path `M4.4 8.6h13l-3-3 M19.6 15.4h-13l3 3`; the Moved glyph `M4.4 9h13l-3-3 M19.6 15h-13l3 3`.
- **Change:** List/receipt glyph for Transactions; calendar/target for Plan.
- **Accept:** No two distinct destinations share a glyph.
- **Shot:** none · **Lines:** 2395, 2397 · further (old copy): 1161

##### P2-05 No H1 on Home; headings elsewhere partial
- **Sources:** UX-23 · **Screen:** Home and other screens
- **Issue:** Doc 19 §5: each screen has a single H1; Home's root header is null; hero numbers have no heading role.
- **Status:** Confirmed in running UI. Home has 0 elements matching `h1,h2,h3,[role=heading]`.
- **Change:** Add a visually hidden H1 "Home" and heading/region semantics for the three headline blocks.
- **Accept:** TalkBack heading navigation on Home lands on "Home", then each section.
- **Shot:** none · **Lines:** 2451 · further (old copy): 75-90, 83, 253

##### P2-06 Fixed-px text; tab labels collide at 200% on a narrow frame
- **Sources:** UX-24 · **Screen:** Tab bar, Transactions rows, day grid, Add sheet at larger font scales
- **Issue:** Tab labels are 11 px with no scaling cap; doc 19 §2 requires text to scale to 200% with no loss. 
- **Status:** Confirmed (tab bar) and Not reproduced (titles, amounts), in the running UI with simulated font scaling. Frame 360 (interior 344) at 2.0x: labels collide and the **Settings tab is pushed outside the frame (unreachable)**; at 412 / 2.0x and both widths / 1.3x all five tabs fit (labels touching at 412 / 2.0x). Row titles did not truncate (0 of 12) and no amount was clipped at any combination on Home, Transactions, Plan, Accounts. Add sheet Save needs scrolling 102 / 156 / 172 px (P0-01). Real sp scaling untested.
- **Change:** Cap tab-label scaling at 130% or shorten "Transactions" to "Activity"; allow transaction title/sub to wrap to two lines; verify the day-grid cells at 200%.
- **Accept:** Snapshot tests at 100/150/200% show no clipped tab label and no truncated amount (doc 19 §13); all five tabs are reachable at 320 dp width and 200% text (D-11).
- **Decision/gap source:** D-11 (revised by product owner 2026-11-02); see also P1-56
- **Shot:** `UX-24_360_x2.png` · **Lines:** 505 (old copy), 185-186 (old copy)

##### P2-07 Pressed overlay invisible in dark mode; inputs have no focus style
- **Sources:** UX-32 · **Screen:** Rows, inputs, buttons
- **Issue:** `.row:active` is a fixed dark tint (`rgba(23,27,33,.04)`); doc 13 §7 specifies 4% of `n-900`, which is light in dark mode. Inputs set `outline:none` with no replacement (WCAG 2.4.7).
- **Status:** Confirmed in running UI for inputs and the pressed overlay: the only `:active` rule is `.row:active`; the Transactions search has `outline-style:none` and no ring. Buttons get Chrome's default focus ring (web-only mitigation).
- **Change:** Use `var(--n900)` at 4%; add a 2 px `--acc600` focus ring on inputs and buttons.
- **Accept:** Press feedback visible in both themes; focus visible on every control.
- **Shot:** none · **Lines:** 32 (old copy), 159

##### P2-08 Dead or ambiguous controls in lists and charts
- **Sources:** UX-35 · **Screen:** Reports bars, must-pay rows, day-grid blanks, new-account name
- **Issue:** Non-month category bars, must-pay/flexible rows and blank day cells are `<button>`s whose `go` does nothing.
- **Status:** Confirmed in running UI. Reports > Overview > 1 Year: category rows and "Must-pay" are buttons; clicking changes nothing (stack unchanged, no toast).
- **Change:** Render non-interactive items as plain text. (The stub account name stays as built, D-10.)
- **Accept:** No element with button semantics lacks an action.
- **Decision/gap source:** D-10
- **Shot:** `UX-35.png` · **Lines:** 3323 · further (old copy): 2675, 2679-2680, 264-276, 1459

##### P2-09 Chart and compact amount labels round non-zero amounts to ₹0k
- **Sources:** UX-44, FIN-27 · **Screen:** Category column chart (category screen), report charts
- **Issue:** Labels are `'₹' + Math.round(m.amt / 100000) + 'k'`: ₹499 shows "₹0k", ₹1,500 shows "₹2k". Doc 13 §9 abbreviates only above ₹1 crore; Indian users read lakh/crore, not "k". UX and finance requests differ (D-07).
- **Status:** FIN-27 Confirmed in running UI: Entertainment category chart labels "₹0k, ₹0k, ₹0k, ₹1k, ₹0k, ₹0k" for ₹349 months; Home & Rent "₹18k". UX-44 Not reproduced by the UX verifier on the views it visited (R01 1 Year, R02, R09 show full values), so the code path is reachable only from the category screen (see section 5).
- **Change:** Show the full formatted value everywhere below ₹1 crore (D-07; doc 13 §9): no "k" abbreviation below ₹1 crore. Fix the broken "₹0k" chart labels and put the values in a table alternative.
- **Accept:** No chart label abbreviates below ₹1 crore; ₹1,10,000 prints in full; 40,000 paise prints "₹400"; ₹499 never prints "₹0k".
- **Decision/gap source:** D-07
- **Shot:** `FIN-27.png`, `UX-44.png` · **Lines:** 2849 · further (old copy): 286, 2547

##### P2-10 Plan hub and widget configuration differ from S-22 and S-42
- **Sources:** UX-46 · **Screen:** Plan, Settings > Widget · **Also see:** P1-26
- **Issue:** Widget screen offers show/hide toggles for Money available and Spent plus Spent/Received/Moved shortcuts; S-42 wants Money available or Left to spend and a quick-add preset. Plan opens with a Left to spend hero (duplicating Home), "The maths" and a stub row, "Rent, subscriptions, utilities", where S-22 asks for monthly load and next-due line.
- **Status:** Confirmed in running UI. Plan shows the hero, "THE MATHS" and the stub row "Rent, subscriptions, utilities / View, add or edit what repeats each month" (no monthly load or next-due).
- **Change:** Keep the Plan hub as built (D-29; S-22 is amended) but replace the stub row with the total monthly load and the next due bill. The widget configuration is P1-26 and P1-48.
- **Accept:** Plan shows "₹X a month, next: Rent in 3 days" in the Regular bills section.
- **Decision/gap source:** D-29, D-27; G-55, G-31
- **Shot:** none · **Lines:** 2878, 2468 · further (old copy): 2859-2887, 3252-3273

##### P2-11 Mixed narrator and prohibited vocabulary
- **Sources:** UX-47 · **Screen:** Copy across Overview, Money lent, Accounts, Balance check
- **Issue:** "I" voice alternates with "the app" ("App thinks you have", "The app never pays"); accounting/statistical terms appear ("Net cash flow", "Total receivable", "Outstanding principal", "Original principal", "Write off", "Balance fixes", "noise, not news"); "Great — mark as checked" congratulates (doc 13 §12, doc 19 §12, T-80). "Principal" and "write off" may be domain terms if lending ships (D-03).
- **Status:** Confirmed in running UI (partly): "Balance fixes" (R01), "noise, not news" (R04), "Principal" (Money lent), "Outstanding principal" (Accounts) seen. "Great — mark as checked" and "Net cash flow" were not reached in the UI (present in code, lines 2349 and 2652).
- **Change:** Use "I" consistently. Replace terms: "Net cash flow" -> "Money in minus money out"; "Total receivable" -> "Still owed to you"; "Outstanding principal" -> "Still to be repaid"; "noise, not news" -> "too small to matter"; "Great — mark as checked" -> "Mark as checked".
- **Accept:** A copy audit against the T-80 term list finds no hits; the narrator is consistent.
- **Decision/gap source:** D-03 (lending stays; "Owed to you" is the agreed wording, D-03b)
- **Shot:** none · **Lines:** 2349, 2652, 2807, 2986, 3060 · further (old copy): 1527, 1939, 2356, 2920, 3217, 2664

##### P2-12 Prototype and demo wording would ship as product copy
- **Sources:** UX-48 · **Screen:** Lock, Your data, passcode toggle
- **Issue:** "This demo accepts 1 2 3 4."; toggling the passcode sets `'1234'` without a setup flow; "saved to Downloads as a PDF" and "Backup written to Downloads" toasts for actions that write nothing.
- **Status:** Confirmed in running UI. The hint reads "Four digits. This demo accepts 1 2 3 4."; enabling the passcode reads "Four digits, set on this device" with no create/confirm flow; export toast claims a write but none occurs.
- **Change:** Mark placeholders in a "design notes" layer. Remove the passcode toggle and the "demo accepts 1 2 3 4" hint: the app lock follows P0-17 and P1-47 (no app PIN). Design the real file-picker flow (P1-37).
- **Accept:** No string in the production flow refers to a demo or to a hard-coded value.
- **Decision/gap source:** D-10a, D-30a
- **Shot:** `UX-34.png` · **Lines:** 1755, 3281, 3185, 2141 (old copy)

##### P2-13 No error, recovery or read-only states are designed
- **Sources:** UX-49 · **Screen:** All; archived account detail
- **Issue:** Doc 11 requires each screen to implement its states; doc 18 §8 requires each state renderable in isolation. There is no failed-save toast, storage-full backup dialog, corrupt-backup dialog or database recovery screen (S-01 error state); no read-only banner on the archived account's detail (`scr_account` does not read `a.archived`). No loading state exists (no skeleton/spinner/loading string; near-zero cost offline).
- **Status:** Cannot test (see section 5). Absence cannot be proven visually; grep-only claim.
- **Change:** Add a states board: failed save, storage full, corrupt backup, integrity failure, archived read-only banner, "Past figures updated".
- **Accept:** Each error row in doc 18 §5 has a design frame.
- **Shot:** none · **Lines:** 3081-3093 (old copy)

##### P2-14 Regular bills: quarterly due month from day-of-month; annual load not normalised
- **Sources:** FIN-28 · **Screen:** Regular bills report, bill editor
- **Issue:** `c.cadence === 'Quarterly' && r.m % 3 !== c.dueDay % 3` makes quarterly bills appear in arbitrary months; cadence has only Monthly/Quarterly/Yearly (spec adds `custom_days`); the hero counts monthly bills only; no "set aside" guidance for the ₹12,000 yearly insurance (doc 08 §7).
- **Status:** Confirmed in running UI. Gym set to Quarterly in Aug: due day 5 and 14 appear, 12 and 15 do not. Hero "₹23,482 each month" excludes Bike insurance ₹12,000; no set-aside line.
- **Change:** Store a due month for quarterly; normalise annual/quarterly into the monthly figure with a separate label; add the set-aside line (against the chosen year start, P1-52).
- **Accept:** Bike insurance row shows "₹12,000 due in March - about ₹1,000 a month".
- **Decision/gap source:** D-16, D-16a; G-45
- **Shot:** none · **Lines:** 1496, 2074, 2118

##### P2-15 Price-change banner says "went up" for decreases; thresholds missing
- **Sources:** FIN-29 · **Screen:** Regular bills banner, bill amount
- **Issue:** Banner title is `changed[0].name + ' went up'` unconditionally; spec threshold is ≥5% and ≥₹100; only three canned amounts can be set (see P1-35).
- **Status:** Confirmed in running UI. Streamly ₹649 -> ₹584 (-10%): banner "Streamly went up. From ₹649 to ₹584 ... That is -₹780 a year." A ₹65 change creates a notice.
- **Change:** Direction-aware text and the spec thresholds; free-entry amount.
- **Accept:** ₹649 -> ₹549 reads "went down"; a ₹50 change raises no notice.
- **Shot:** `FIN-29.png` · **Lines:** 2820, 3843 · further (old copy): 2066, 2069

##### P2-16 Known-limitations screen differs from the spec text
- **Sources:** TL-18 · **Screen:** Known limitations (S-?? in doc 11 line 84)
- **Issue:** Eight rows (including a conditional seasons row, "A passcode is not encryption", "A private balance is hidden, not protected") vs the spec's six verbatim (v1.1 §27). The extra rows are evidence the passcode/private features are outside the six (D-03, D-05).
- **Status:** Confirmed by code reading.
- **Change:** Keep the eight rows as built (D-29: the prototype wins; the spec list in v1.1 §27 is amended). Reword the extras to match the decisions: a private account is hidden on screen only and totals still count it (D-05); the app lock hides the app but does not encrypt your data and the app cannot recover access (D-30a, D-30b); lending is part of v1 (D-03).
- **Accept:** The screen lists the eight rows as the amended spec list; the private and lock rows match the decisions.
- **Decision/gap source:** D-29, D-05, D-30a, D-30b, D-03; G-64
- **Shot:** none · **Lines:** 3528 (`scr_limitations`), 3536

##### P2-17 Transaction detail: six equal actions, no account-effect line, audit dates or list badges
- **Sources:** TL-19, TL-21 · **Screen:** Transaction detail, list rows
- **Issue:** Actions are Mark money came back / Edit / Mark as a one-off / Split / Duplicate to today / Delete (primary flips by kind). No "Bank went down by ₹3,000" sentence, created/edited dates (doc 11 S-08) or list-row badges (doc 12 line 64). Duplicate to today and Mark as a one-off give no inline confirmation of their effect (only a toast).
- **Status:** Confirmed by code reading.
- **Change:** One primary action plus an overflow menu for rarely used ones; add account-effect and audit rows; add refunded / grouped / matched / correction badges; after Duplicate to today or Mark as a one-off, state the effect inline and make the toast text match the stored state.
- **Accept:** Detail shows the plain-language effect; refunded and bill-matched rows show badges in the list; Duplicate and one-off actions confirm what they did.
- **Shot:** none · **Lines:** 3689-3696 (old copy: not re-located), 3690 (`Mark money came back`), 3691 (Edit), 3694, 3720-3724, 3809-3813 (Duplicate / one-off)

##### P2-18 Seasons: the partial month reads as a drop
- **Sources:** TL-22 · **Screen:** Seasons & year-on-year
- **Issue:** The "so far" bar is the shortest and filled grey; the label is the only cue (hatching is supported by `bars` but unused).
- **Status:** Confirmed by code reading.
- **Change:** Seasonal categories and the year-to-date compare ship with the prototype rules (at least ₹500 and 25% difference, at least 2 same-month samples) and stay hidden until 24 months of history (Q-3). Hatch the partial bar and show the like-for-like day-aligned value beside it.
- **Accept:** The partial bar is visibly distinct without colour.
- **Decision/gap source:** Q-3; G-11, G-12, G-44
- **Shot:** none · **Lines:** 3504, 3505 (`h.complete`)

##### P2-19 Spending or lending more than an account holds goes negative without notice
- **Sources:** VFIN-2 · **Screen:** Add a loan, Add sheet, Accounts
- **Issue:** An asset account silently goes below zero with no overdrawn label or confirmation.
- **Status:** Confirmed in running UI. Lending ₹10,000 from Cash (₹2,150) leaves Cash -₹7,850; Accounts shows "-₹7,850" and Home available falls.
- **Change:** Warn "This is more than Cash holds (₹2,150)" before saving; label negative balances "(overdrawn)" (see P1-31).
- **Accept:** The warning appears for any save that would take a cash/wallet account below zero.
- **Shot:** `FIN-10.png` · **Lines:** 2194

##### P2-20 Every money row shows a sign; a Moved row shows a wrong minus on its detail screen
- **Sources:** VFIN-4 · **Screen:** Transaction detail (Moved)
- **Issue:** Detail hero "-₹20,500.00" for a move; the list row shows no sign. A move is not spending.
- **Status:** Confirmed in running UI (Home loan EMI detail).
- **Change:** Every money row shows + or - (D-13): Spent -, Received +, Came back +. A Moved row shows the sign for the account in view (minus leaving it, plus entering it); where no account is in view, Claude Design proposes the Moved rule, but the detail screen never shows the Spent minus on a Moved record. Colour is never the only signal.
- **Accept:** Every money row in lists, detail and reports carries + or -; the Home loan EMI detail does not show "-₹20,500.00" as if it were spending; the detail amount matches the list row.
- **Decision/gap source:** D-13
- **Shot:** `TL-12.png` · **Lines:** none re-located

##### P2-21 Prototype shell is not responsive; the device interior is 396 x 812
- **Sources:** VUX-7 · **Screen:** Standalone page (not the product)
- **Issue:** At a 412 x 892 viewport the device collapses to 0 width (scrollWidth 432); at about 1,100 the interior is 396 x 812, not the 428 x 908 the older review assumed.
- **Status:** Confirmed in running UI.
- **Change:** Give the frame `flex-shrink:0` and a CSS scale for small viewports; document the interior size (396 x 812).
- **Accept:** At a 412-wide viewport the device renders at full width.
- **Shot:** none · **Lines:** 70 (old copy)

##### P2-22 Category rename flow
- **Sources:** none (new design item created by decisions) · **Screen:** Settings > Categories > edit category
- **Issue:** Rename is a stub in the prototype (D-10 selected it for a real design).
- **Status:** Design work created by a decision (not a review finding); no prototype evidence to measure.
- **Change:** Design a rename sheet: current name, text input, duplicate-name check, and Save. A rename keeps the category's id, history, limit and bill links.
- **Accept:** Renaming "Eating Out" to "Dining" updates every row, limit and bill with no new category; a name already in use shows "That name is already used".
- **Decision/gap source:** D-10
- **Shot:** none · **Lines:** none


## 5. Not reproduced / cannot test

No item is deleted. These stay in the list with the reason.

| ID | Merged item | Status | Reason |
|---|---|---|---|
| UX-44 | P2-09 | **Not reproduced** (by the UX verifier) | No "₹Nk" label appeared on any report visited, in Seven months or Two years data (R01 1 Year, R02, R09); the R01 y-axis reads ₹0, ₹33,588, ₹67,176 in full. The finance verifier did reproduce the same `Math.round(m.amt/100000)+'k'` rule on the Entertainment category chart (FIN-27: "₹0k, ₹0k, ₹0k, ₹1k"), so the code path exists and is reachable from the category screen. Keep the item; do not close it on the UX result. |
| UX-49 | P2-13 | **Cannot test** | Failed-save, storage-full, corrupt-backup, integrity and archived read-only states do not exist in the UI to open; absence cannot be proven visually. It is a grep-only claim. |

Sub-claims inside otherwise confirmed items that could not be tested (the item stays Confirmed):

| Sub-claim | Item | Reason |
|---|---|---|
| True empty Home / Transactions / add flow on a fresh install; Day-1 visibility of the catch-up link | P1-11, P2-01 | The app crashes with zero transactions (P0-04). |
| 14-day-gap reliability case; "Great — mark as checked"; "Net cash flow" copy in UI | P1-10, P2-11 | Not constructed or not reached. |
| TalkBack / VoiceOver spoken output, swipe-to-dismiss, haptics, switch access, real sp scaling | P0-01, P1-02, P1-03, P1-24, P1-25 | Only DOM/ARIA was checked; device-only. |
| Real 360 x 740 and 412 x 892 viewports | P0-01, P2-06 | The shell is not responsive (P2-21); the device frame was resized instead. |
| Native file picker for restore/import; backup file contents / PDF export | P1-37 | The sheet shows only; the destructive button was not activated; no file is created. |
| `prefers-color-scheme` as a feature | P1-40 | The app has none. |
| Show-paise toggle itself; stage Tweak | P0-06, P1-10 | No Tweaks panel; inferred from default `prefs.decimals = 2` and dataset switching. |
| FIN-8: a new bill cannot use a Moved/transfer category | P1-12 | Read from code, not driven in the category picker. |
| FIN-9 interest taxable and unflagged | P1-33 | Advice item, no UI to test. |
| FIN-10 "no way to enter an existing loan" | P1-33 | Confirmed from the Add-a-loan flow having only a starting-today path; no date field found. |
| FIN-20 day-5 / day-10 pace gating | P1-15 | The app clock cannot be moved. |
| FIN-30 import summary hard-coded 412/389/23 | P1-37 | Import not run; only export copy read. |
| FIN-23 keypad `×` | P1-03 | Key-level only; the keypad does not expose `×`. |
| TL-2(2) split-part edit | P0-12 | Same rebuild path; not separately run. |
| UX-14, UX-19, UX-22, UX-24, UX-33, UX-40, UX-47 (caveats) | respective items | Verified with the caveats stated in each item's Status (e.g. UX-19 `--pos` on `--posBg` not observed). |


## 6. Superseded by decisions

Nothing is deleted silently. These items, or parts of items, asked for something a decision rejects. The original text of the two whole items stays here for the record.

| Item or part | What was requested | Superseded by | Reason |
|---|---|---|---|
| P1-17 (TL-17), whole item | Implement M-23 drift as percentage-point share change with a ₹500 median floor | D-26 | Drift stays a rupee difference from typical, as built; doc 06 M-23 is amended (section 9). |
| P1-27 (UX-34), whole item | Fix the passcode keypad: unlabeled keys, empty focusable button, dots role, live error | D-30a | The app stores no PIN and has no app-PIN screens, so the keypad no longer exists. The biometric prompt and phone PIN are the phone's own screens. |
| P0-10, part | Suppress every derived statement (net, kept, "earned") when income is withheld | D-05 | Totals always count private accounts, so nothing is withheld and the statements stay true. |
| P0-09, part | Remove private accounts from the seed default, or label what each headline excludes | D-05 | Private is on-screen masking only; headline figures are exact. |
| P0-12, part | Restrict Edit by kind (no Edit on back or correction) | D-22 | Everything is editable and links are preserved. |
| P1-04, part | Allow tomorrow and explain beyond-tomorrow | D-21 | Entries are for today and earlier only; spec is amended. |
| P1-03, part | Decide whether × ÷ are in scope | Q-5, Q-5a | They are in scope with standard maths and no brackets. |
| P1-08, part | Add a "Where it goes" card to the hub | D-29 | The folded hub stays; the guide and the spec are fixed instead. |
| P1-33, part | Check T-30 (lending as a Moved to Outside) | D-03 | Lending is a separate module in v1. |
| P1-35 and P2-08, part | A typed account name replacing the "Second bank" stub | D-10 | Account naming was not selected and stays as is. |
| P1-35, part | A fixed sub-label for home-loan interest (tax relevance) | D-17 | No tax features or tags. |
| P1-37, part | Drop PDF export from v1 | D-29 | The export sheets are kept; the spec is amended. |
| P1-40, part | Option to remove the palette picker; option of a true-black variant | D-04, D-31 | All 8 palettes ship; dark grey only. |
| P1-41, part | Doc 17 exactly: payee and note only, exact amount plus a range chip | D-25, Q-6 | Digit match as built; payee, note and category name. |
| P1-21, part | Longer Undo window when TalkBack is active | D-02 | No timer at all. |
| P0-17, part | 6-digit PIN, attempt backoff, PIN create and confirm sheet | D-30a, D-10a | No app PIN. |
| Section 7, "Privacy design" | Private accounts removed from every derived figure ("exclude, never mask") | D-05 | The principle is reversed: mask on screen, count in totals. |

### P1-17 Drift (M-23) is computed in rupees, not as share change (superseded by D-26)
- **Sources:** TL-17 · **Screen:** Drifting categories (R-08)
- **Issue:** `driftRows` uses 6 complete months, rupee medians and a fixed ₹200 cut-off; M-23 specifies percentage-point share change over qualifying months with a ₹500 median floor.
- **Status:** Confirmed in running UI (Shopping +₹2,000, Health +₹1,418, Food -₹983, Transport +₹307; Feb-Apr vs May-Jul).
- **Decision:** D-26 keeps the rupee difference from typical. No design change; doc 06 M-23 is amended. The copy "needs at least four complete months" still needs to match whatever the spec says after the amendment.
- **Shot:** `TL-17.png` · **Lines:** 3434, 3448 (`driftRows`), 3447 (`scr_r08`)

### P1-27 Passcode screen: unlabeled keys, an empty focusable button, non-live error (superseded by D-30a)
- **Sources:** UX-34 · **Screen:** Lock overlay · **Also see:** P0-17, P1-47
- **Issue:** The 12 keys include a `''` entry that renders as an empty focusable button; backspace reads "⌫"; the hint and error are not live regions; the progress dots' `aria-label` sits on a generic div.
- **Status:** Confirmed in running UI (keys 1-9, 0, ⌫ without aria-label; one empty 72 x 64 button; wrong code shows a polite toast).
- **Decision:** D-30a removes the app passcode screen. The accessibility requirement carries over to P0-17 and P1-47: every control on the lock and set-up screens has a label and announced state.
- **Shot:** `UX-34.png` · **Lines:** 815, 1755, 1762


## 7. Do not regress (merged Keep lists, plus items the verifiers confirmed correct)


**Verified correct in the running prototype**
- **Integer-paise ledger matches to the paisa.** The finance verifier recomputed Spent, Received, Kept, Balances, Money available, Promised and Left to spend from `logic.state.txs` with its own integer loop: every figure matched. Every mismatch seen traces to the private-account rule, not the ledger math. With nothing private the Last-3-months view reads true ("You earned ₹1,57,278 more than you spent in Jun 2026 - Aug 2026").
- **Card payments are correctly excluded from Spent.** Bank-to-card payments are `move` rows (7 in the data), not Spent; card purchases count when made. (The verifier tried to disprove this and could not.)
- Indian digit grouping in `group()`: `₹1,23,456`, `₹1,00,00,000`, `₹99,99,99,999`; negatives use a true minus.
- 9-digit cap works (12345678.9 accepted, 10th digit rejected).
- Dark `--n400` passes contrast (4.54:1); dark theme works through the Preferences toggle; light-mode `white-on-accent` passes (5.04-18.42).
- No amount was clipped or truncated at any tested width/scale combination; tab bar and FAB are at least 48.

**Keep (design choices that work)**
- *Add flow:* Spent preselected, time defaults to now; Today / Yesterday quick options in the calendar; the duplicate-entry guard is a soft prompt, never blocking; the sheet has a dialog role and accessible name; keypad-first capture avoiding the system keyboard on the hot path; payee/note collapsible; catch-up mode that keeps the sheet open (control placement aside, P2-01).
- *Honest labels:* Save relabels itself with the reason ("Enter an amount", "Pick two different accounts"); Delete names the amount, payee, date and linked refunds and offers Undo; Erase and Restore state that there is no undo and no cloud copy; "A rough guide, not a rule"; estimates labelled; "Money put in, not what it is worth"; the known-limitations screen exists and its private-balance row is honest.
- *Rows and totals:* transaction rows are one announcement (`aria-label`) with a 64 px minimum height; single-line ellipsised rows with stable height; Money available and Owed are separate buttons with separate labels; tabular figures and Indian grouping; amounts never truncate (`flex:none`).
- *Finance logic:* integer paise throughout (`R = n => n*100`), interest accrual rounded to paise; INV-16 sign logic in `balanceVals` (asset `val - expected`, owed `expected - val`); the loan balance-check shortfall becomes an `out` in Interest & charges drawn from the loan; EMI split with declared interest drawn from the paying account and grouped, principal as a `move` (T-25 intent); Moved forced to carry no category (T-77); self-transfer blocked (T-78); archive only at zero with an explanation (EX-01); zero starting balance requires explicit confirmation (T-16); Not recorded excluded from category shares and shown hatched as its own line; Kept > 100% explanation; "No income recorded" when received = 0; Left to spend is signed and not floored, with a maths sheet listing available, bills, buffer and result; limit pace gated to day >= 5; unusual-spending formula matches M-21 (MAD floor, 30%, ₹500 gates) with the irregular-guard `mad/med > 0.5`; reliability precedence Just starting -> Gaps -> Reliable (EX-04); cascade delete of a parent names its refunds (C-07).
- *Privacy design:* a private account hides its balance and amounts on screen only, and every total counts it (D-05); search never matches a masked amount (P1-41). The earlier "exclude, never mask" principle is superseded (section 6).
- *Explanations:* "?" on Home and the Left to spend breakdown (C-30); explainable maths sheets (`mathRows`).
- *Accessibility and status:* reduced motion honoured; bill status dots always carry "Paid / Was due / Due" text; loan status dots have a label; the hatched Not recorded bar has a text sub-label; category picker marks selection with a check and bold weight.
- *Limits:* "Nothing is blocked" language; pace shown only after day 5.
- *Lock screen* states the no-recovery rule plainly.
- *Navigation:* per-tab stacks with an always-present 48 dp Back button; route-local params.
- *Charts:* bars and columns are plain readable boxes; the breakdown rows double as the table alternative and should be kept.
- *Honest drill-down:* Seasons unlock rules (24 months) match M-25; the partial-month "so far" label (add hatching, P2-18).


## 8. Counts and traceability

### 8.1 Source findings by prefix and source priority

| Source | Count | P0 | P1 | P2 |
|---|---|---|---|---|
| UX- | 50 | 6 | 29 | 15 |
| FIN- | 31 | 7 | 15 | 9 |
| TL- | 18 | 4 | 10 | 4 |
| VUX- | 7 | 1 | 3 | 3 |
| VFIN- | 5 | 1 | 2 | 2 |
| **Total** | **111** | **19** | **59** | **33** |

### 8.2 Source findings by verified status

| Source status | IDs |
|---|---|
| Confirmed in running UI (UX 48 incl. caveats, FIN 31, TL 9, VUX 7, VFIN 5) | 100 |
| Confirmed by code reading only (TL 9, incl. TL-1) | 9 |
| Not reproduced (UX-44; reproduced by FIN-27) | 1 |
| Cannot test (UX-49) | 1 |
| **Total** | **111** |

TL running-UI set: TL-2, 3, 5, 8, 11, 12, 13, 15, 17.

### 8.3 Merged items

| Group | Items |
|---|---|
| P0 change items | 17 |
| P1 change items | 56 (44 earlier, minus 2 superseded, plus 12 new, plus 2 found by Claude Design in phase 1: P1-57, P1-58) |
| P2 change items | 22 (21 earlier plus 1 new) |
| **Change items (section 4)** | **95** |
| Superseded items (section 6) | 2 (P1-17, P1-27) |
| Decision IDs (section 3) | 54 |

| Status | Merged change items (section 4) |
|---|---|
| Confirmed in running UI | 71 |
| Confirmed by code reading (not run in the UI) | 8 |
| Not reproduced (as sole evidence) | 0 |
| Cannot test | 1 |
| New design items created by decisions (no prior finding) | 13 |
| New items found by Claude Design while applying phase 1 (no review finding) | 2 |
| **Total** | **95** |

### 8.4 Traceability: every source ID to its merged item

New items P1-45 to P1-56 and P2-22 come from decisions and have no source ID. P1-57 and P1-58 were found by Claude Design while applying phase 1 and also have no source ID. "Source pri" is the priority the reporter gave; "Item pri" is the merged item's (highest of its parts wins).

| Source ID | Source pri | Merged item | Item pri | Title |
|---|---|---|---|---|
| UX-1 | P0 | P0-01 | P0 | Add sheet opens with "More" expanded, so Save is below the fold |
| UX-2 | P0 | P0-02 | P0 | Category is a second sheet, not inline; the "three taps" claim is false |
| UX-3 | P0 | P0-03 | P0 | "Create a new category" inside the picker destroys the entry and switches tabs |
| UX-4 | P1 | P1-01 | P1 | Save is not blocked when the category is missing; a standing alert fires on the first digit |
| UX-5 | P1 | P1-02 | P1 | The sheet can be dismissed with a typed amount and no warning; nested sheets close the whole entry |
| UX-6 | P1 | P1-03 | P1 | Keypad: unlabeled keys and non-field amount; spec keys and pressed state missing; calculator edge cases |
| UX-7 | P2 | P1-03 | P1 | Keypad: unlabeled keys and non-field amount; spec keys and pressed state missing; calculator edge cases |
| UX-8 | P1 | P1-01 | P1 | Save is not blocked when the category is missing; a standing alert fires on the first digit |
| UX-9 | P2 | P2-01 | P2 | "Catching up" link competes with More; no running count |
| UX-10 | P1 | P1-04 | P1 | Date and time pickers: future dates silently disabled; exact minutes need a drag; disabled text unreadable |
| UX-11 | P1 | P1-06 | P1 | Cross-tab jumps rewrite another tab's stack; Back does not return to the origin; drill-in inherits stale filters |
| UX-12 | P1 | P1-07 | P1 | Re-tapping the active tab clears its stack |
| UX-13 | P1 | P1-08 | P1 | "Where it goes" (R-02) unreachable from the hub; hub rows are static descriptions |
| UX-14 | P1 | P1-08 | P1 | "Where it goes" (R-02) unreachable from the hub; hub rows are static descriptions |
| UX-15 | P2 | P2-02 | P2 | Settings mixes in Plan items; Balance check and Payees have no entry |
| UX-16 | P2 | P2-03 | P2 | The FAB changes meaning on one screen and sits bottom-right |
| UX-17 | P2 | P2-04 | P2 | Tab icons reuse glyphs with other meanings |
| UX-18 | P1 | P1-19 | P1 | Low-contrast secondary text and warning amber text fail AA in light mode |
| UX-19 | P1 | P1-19 | P1 | Low-contrast secondary text and warning amber text fail AA in light mode |
| UX-20 | P0 | P0-06 | P0 | Money is shown with paise dropped; rows, totals, toasts and detail disagree |
| UX-21 | P1 | P1-10 | P1 | Reliability sentence has no slot on Home; stage is driven by the prototype tweak, not data |
| UX-22 | P1 | P1-11 | P1 | Empty Home and Transactions have copy but no action |
| UX-23 | P2 | P2-05 | P2 | No H1 on Home; headings elsewhere partial |
| UX-24 | P2 | P2-06 | P2 | Fixed-px text; tab labels collide at 200% on a narrow frame |
| UX-25 | P1 | P1-20 | P1 | Touch targets below 48 dp; the "You owe" button on Home is 22 px high |
| UX-26 | P1 | P1-21 | P1 | Toast Undo: 5 s window, polite announcement |
| UX-27 | P0 | P0-07 | P0 | White text on the accent fails contrast in dark mode and in several palettes |
| UX-28 | P1 | P1-18 | P1 | Over limit uses critical red; "below typical" uses positive green |
| UX-29 | P1 | P1-22 | P1 | Trend chart: lines distinguished by colour only; stretched SVG; 5 px dots; no table alternative |
| UX-30 | P1 | P1-23 | P1 | Heatmap cells carry meaning by shade; text colour switch fails contrast; no labels |
| UX-31 | P1 | P1-24 | P1 | Chips, segments, tabs and toggles expose state only visually |
| UX-32 | P2 | P2-07 | P2 | Pressed overlay invisible in dark mode; inputs have no focus style |
| UX-33 | P1 | P1-25 | P1 | Inputs have no accessible names |
| UX-34 | P1 | P1-27 (superseded, section 6) | P1 | Passcode screen: unlabeled keys, an empty focusable button, non-live error |
| UX-35 | P2 | P2-08 | P2 | Dead or ambiguous controls in lists and charts |
| UX-36 | P0 | P0-05 | P0 | Category merge: one tap, no confirmation, Undo restores nothing useful, orphans and a whole-app crash |
| UX-37 | P1 | P1-28 | P1 | One-tap "Add" on detected bills rewrites history; the EMI is suggested as an ₹11,500 bill |
| UX-38 | P1 | P1-37 | P1 | Restore, import, backup and export lack previews; destinations are fake; export is filtered |
| UX-39 | P1 | P1-36 | P1 | Balance check: Undo is a 5 s toast; input and wording problems |
| UX-40 | P1 | P1-35 | P1 | Starting balance, bill amount, due day and EMI interest can only be picked from presets |
| UX-41 | P1 | P1-38 | P1 | Onboarding does not match F-01 / S-31 and has no completion step |
| UX-42 | P1 | P1-30 | P1 | Contradictory threshold copy: "two", "three", "another month" |
| UX-43 | P1 | P1-29 | P1 | Bill-matching copy contradicts itself and the spec |
| UX-44 | P2 | P2-09 | P2 | Chart and compact amount labels round non-zero amounts to ₹0k |
| UX-45 | P2 | P1-40 | P1 | Theme: no "follow system"; palette picker with design-note copy; light default |
| UX-46 | P2 | P2-10 | P2 | Plan hub and widget configuration differ from S-22 and S-42 |
| UX-47 | P2 | P2-11 | P2 | Mixed narrator and prohibited vocabulary |
| UX-48 | P2 | P2-12 | P2 | Prototype and demo wording would ship as product copy |
| UX-49 | P2 | P2-13 | P2 | No error, recovery or read-only states are designed |
| UX-50 | P1 | P1-09 | P1 | Two sticky headers share `top:0` on Transactions and cover the search field |
| FIN-1 | P0 | P0-08 | P0 | Balance-check "money found" is counted as spending; correction income never reaches Received |
| FIN-2 | P0 | P0-09 | P0 | Default Home headline excludes the main account: Money available and Left to spend contradict the spec example |
| FIN-3 | P0 | P0-10 | P0 | Hiding recurring income produces false "you spent more than you earned" and Net cash flow statements |
| FIN-4 | P0 | P0-11 | P0 | Bills never match the payments the user records; Promised double-counts and paid bills show "overdue" |
| FIN-5 | P0 | P0-14 | P0 | EMI with declared interest: delete orphans the interest row; edit duplicates it; delete names only refunds |
| FIN-6 | P0 | P0-06 | P0 | Money is shown with paise dropped; rows, totals, toasts and detail disagree |
| FIN-7 | P0 | P0-15 | P0 | Current-month comparisons are not day-aligned and "typical" is shown without its data thresholds |
| FIN-8 | P1 | P1-12 | P1 | Left to spend omits card dues, EMIs and SIPs; recurring transfers cannot be bills |
| FIN-9 | P1 | P1-33 | P1 | Lending subsystem: not in spec; net-worth wording; write-off defects; cannot enter an existing loan |
| FIN-10 | P1 | P1-33 | P1 | Lending subsystem: not in spec; net-worth wording; write-off defects; cannot enter an existing loan |
| FIN-11 | P1 | P1-34 | P1 | "Somewhere else" (Outside): aggregated across labels; withdrawals unrecordable; income can be posted into it; label stored in the note |
| FIN-12 | P1 | P1-44 | P1 | Seed and dataset realism: negative opening balances, EMI booked inconsistently, impossible first-week figures |
| FIN-13 | P1 | P1-35 | P1 | Starting balance, bill amount, due day and EMI interest can only be picked from presets |
| FIN-14 | P1 | P1-28 | P1 | One-tap "Add" on detected bills rewrites history; the EMI is suggested as an ₹11,500 bill |
| FIN-15 | P1 | P1-16 | P1 | Month-start day: period naming, calendar-month grids, partial first period, no financial-year view |
| FIN-16 | P1 | P1-13 | P1 | "Typical" is computed several ways; windows compare partial with full months; confidence wording |
| FIN-17 | P1 | P1-13 | P1 | "Typical" is computed several ways; windows compare partial with full months; confidence wording |
| FIN-18 | P1 | P1-31 | P1 | Accounts screen: credit shown as debt; totals that do not reconcile; two "Money available" numbers |
| FIN-19 | P1 | P1-32 | P1 | "Move the remaining balance first" banner moves money the wrong way for owed and overdrawn accounts |
| FIN-20 | P1 | P1-15 | P1 | Limits: allowed on must-pay categories; pace thresholds differ from the spec; no "N of M on track" |
| FIN-21 | P1 | P1-14 | P1 | The same period shows different "spent" figures in different reports and the list |
| FIN-22 | P1 | P1-35 | P1 | Starting balance, bill amount, due day and EMI interest can only be picked from presets |
| FIN-23 | P2 | P1-03 | P1 | Keypad: unlabeled keys and non-field amount; spec keys and pressed state missing; calculator edge cases |
| FIN-24 | P2 | P1-10 | P1 | Reliability sentence has no slot on Home; stage is driven by the prototype tweak, not data |
| FIN-25 | P2 | P1-36 | P1 | Balance check: Undo is a 5 s toast; input and wording problems |
| FIN-26 | P2 | P0-05 | P0 | Category merge: one tap, no confirmation, Undo restores nothing useful, orphans and a whole-app crash |
| FIN-27 | P2 | P2-09 | P2 | Chart and compact amount labels round non-zero amounts to ₹0k |
| FIN-28 | P2 | P2-14 | P2 | Regular bills: quarterly due month from day-of-month; annual load not normalised |
| FIN-29 | P2 | P2-15 | P2 | Price-change banner says "went up" for decreases; thresholds missing |
| FIN-30 | P2 | P1-37 | P1 | Restore, import, backup and export lack previews; destinations are fake; export is filtered |
| FIN-31 | P2 | P1-13 | P1 | "Typical" is computed several ways; windows compare partial with full months; confidence wording |
| TL-1 | P0 | P0-16 | P0 | Home insight "x" dismiss throws a ReferenceError |
| TL-2 | P0 | P0-12 | P0 | Editing a transaction rebuilds the record and drops its links |
| TL-3 | P0 | P0-13 | P0 | Split corrupts refund links and clones bill and one-off flags |
| TL-4 | P1 | P1-05 | P1 | Split sheet: amounts only by +/- steps; gate passes with one real part |
| TL-5 | P1 | P1-41 | P1 | Transaction search reveals masked private income and goes beyond the spec |
| TL-8 | P1 | P1-14 | P1 | The same period shows different "spent" figures in different reports and the list |
| TL-9 | P1 | P1-42 | P1 | Transactions filters are narrower than doc 17; payee list capped at 12; wrong empty text |
| TL-10 | P1 | P1-06 | P1 | Cross-tab jumps rewrite another tab's stack; Back does not return to the origin; drill-in inherits stale filters |
| TL-11 | P1 | P1-43 | P1 | Refund: always dated today, always to the original account, no revised-period marker |
| TL-12 | P1 | P0-14 | P0 | EMI with declared interest: delete orphans the interest row; edit duplicates it; delete names only refunds |
| TL-13 | P0 | P0-11 | P0 | Bills never match the payments the user records; Promised double-counts and paid bills show "overdue" |
| TL-15 | P1 | P1-12 | P1 | Left to spend omits card dues, EMIs and SIPs; recurring transfers cannot be bills |
| TL-16 | P1 | P1-24 | P1 | Chips, segments, tabs and toggles expose state only visually |
| TL-17 | P1 | P1-17 (superseded, section 6) | P1 | Drift (M-23) is computed in rupees, not as share change |
| TL-18 | P2 | P2-16 | P2 | Known-limitations screen differs from the spec text |
| TL-19 | P2 | P2-17 | P2 | Transaction detail: six equal actions, no account-effect line, audit dates or list badges |
| TL-21 | P2 | P2-17 | P2 | Transaction detail: six equal actions, no account-effect line, audit dates or list badges |
| TL-22 | P2 | P2-18 | P2 | Seasons: the partial month reads as a drop |
| VUX-1 | P0 | P0-04 | P0 | The whole app goes blank with zero transactions, and "Erase everything" bricks it |
| VUX-2 | P1 | P0-05 | P0 | Category merge: one tap, no confirmation, Undo restores nothing useful, orphans and a whole-app crash |
| VUX-3 | P1 | P1-20 | P1 | Touch targets below 48 dp; the "You owe" button on Home is 22 px high |
| VUX-4 | P2 | P1-44 | P1 | Seed and dataset realism: negative opening balances, EMI booked inconsistently, impossible first-week figures |
| VUX-5 | P1 | P1-26 | P1 | Widget: preview unreadable in dark mode; balance on a locked screen; content differs from S-42 |
| VUX-6 | P2 | P1-04 | P1 | Date and time pickers: future dates silently disabled; exact minutes need a drag; disabled text unreadable |
| VUX-7 | P2 | P2-21 | P2 | Prototype shell is not responsive; the device interior is 396 x 812 |
| VFIN-1 | P0 | P0-05 | P0 | Category merge: one tap, no confirmation, Undo restores nothing useful, orphans and a whole-app crash |
| VFIN-2 | P2 | P2-19 | P2 | Spending or lending more than an account holds goes negative without notice |
| VFIN-3 | P1 | P1-44 | P1 | Seed and dataset realism: negative opening balances, EMI booked inconsistently, impossible first-week figures |
| VFIN-4 | P2 | P2-20 | P2 | Every money row shows a sign; a Moved row shows a wrong minus on its detail screen |
| VFIN-5 | P1 | P0-06 | P0 | Money is shown with paise dropped; rows, totals, toasts and detail disagree |


## 9. Spec amendments required

Each line is a spec document or section that the decisions change. The change list assumes these amendments are made.

| Spec document / section | Amendment | Decision |
|---|---|---|
| Docs 02, 04, 05 and the v1.1 non-goals | Lending is in v1: loans, repayments, simple interest, write-off as a separate loss line, "Owed to you" line, net-worth non-goal wording; vocabulary (principal, write off, receivable) still to be agreed. | D-03, D-03a, D-03b, Q-12a, Q-12b |
| Doc 06 M-04 and doc 07 (baseline) | Corrections are excluded from both the actual and the typical (M-04 counts them in Spent). | D-19 |
| Doc 06 M-23 | Drift is the rupee difference from typical, not the percentage-point share change. | D-26 |
| Doc 06 / Left to spend maths (M-12) and doc 07 | Card-paid bills are counted at the card's due date and not twice; Promised includes card dues. | D-20 |
| Doc 02 balance check and doc 10 F-14 | Define the record when the user owes less than recorded: an adjustment entry, not Spent and not Received. | D-18 |
| Docs 09, 11, 12 (S-15 Reports hub) | Folded hub replaces six cards; "Where it goes" is reached from Overview. | D-29, Q-11 |
| Doc 11 S-22 (Plan hub) | Plan hub as built (Left to spend hero, The maths, regular bills link, limits). | D-29, Q-11 |
| Doc 11 S-42 (widget) and doc 12 | Widget shows quick-add buttons by default; Money available or Left to spend only after opt-in; Spent / Received / Moved shortcuts. | D-27, D-29 |
| Doc 11 S-27 to S-29 (Your data, export, restore) | One "Your data" screen with Backup, CSV, PDF, Restore, Import and Erase everything (typed confirmation and backup prompt). | D-29, Q-2, Q-8, Q-10 |
| Doc 11 S-19 / v1.1 section 27 (known limitations) | Eight rows as built, reworded to the decisions. | D-29 |
| Docs 09 and 12 (tab bar and FAB drawing) | FAB bottom-right, one meaning: add transaction. | D-08 |
| Docs 09 and 11 (information architecture, S-19 Settings) | Accounts lives under Home; Settings keeps account set-up only. | D-14 |
| Doc 01 out of scope, doc 08 section 1, doc 29 line 84, v1.1 "Removed" | Carve-out for the daily spending calendar and month strips (ban on calendar heatmaps). | Q-1 |
| Doc 07 F-41 / M-25 / section 14 (seasons) | Seasonal categories and year-to-date compare: at least ₹500, 25%, at least 2 samples; hidden until 24 months. | Q-3 |
| Doc 13 section 3 | Add type tokens 36 and 19; palettes: 8 accents instead of one. | D-12, D-04 |
| Doc 13 section 11 | Theme: system, light, dark; dark grey #14171B only, no true black. | D-31, D-04 |
| Doc 03 preferences and doc 08 year views | Year-start setting (January or April), chips This year / Last year / 1 Year, FY label; monthly views honour the month-start day. | D-16, D-16a, D-15 |
| Doc 03 `month_start_day` and period labels | Period label shows the date range when the start day is not 1. | D-15 |
| Doc 17 (search) | Fields: payee, note and category name; amount search by digit match, no exact-match plus range chip. | D-25, Q-6 |
| Doc 12 C-05 (calculator) | Record: standard precedence, no brackets. | Q-5, Q-5a |
| Doc 18 section 7, C-21, doc 12 C-14, doc 19 section 1 | Undo has no timer and stays until the next action; balance-check Undo likewise. | D-02 |
| Doc 20 line 43, S-41, F-26 | App lock is biometric with the phone's PIN or pattern as fallback; no app PIN (replaces the 6-digit PIN). | D-30a, D-10a |
| Doc 20 and doc 01 F-43 | No encrypt-at-rest toggle in v1. | D-30b |
| Docs 11 S-02, 12, 10 F-01, 18 (dates) | Entries are for today and earlier only (no tomorrow); date and time under More. | D-21, D-09 |
| F-01 and S-31 (onboarding) | Steps: accounts, bills, record one expense; Skip on every step. | D-06, D-06a |
| Docs 03/04/11 (account fields and screens) | Add the private-account display setting, the global "Hide all" switch, and the masking rules. | D-05, D-05a, D-05b |
| Doc 11 S-30 and doc 03 `notification_settings` | Reminders default off; permission asked when first turned on. | D-28 |
| Doc 11 S-08, doc 12, F-06, S-44 | Edit keeps links with a warning on amount change; refund account and date; split inheritance rules. | D-22, D-23, D-24 |
| Doc 02 F-19 (category merge) | Merge keeps the target limit (or takes the source's), confirms, and Undo restores limit and transactions. | Q-14 |
| Doc 11 (new screens) | Add "Turn on app lock", category rename, and the added prototype actions: Duplicate to today, Lock now, Getting started, Record this payment now. | D-10, D-10a, Q-8 |
| Doc 19 / 13 contrast | Verified AA for all 16 palette/theme pairs. | D-04 |
