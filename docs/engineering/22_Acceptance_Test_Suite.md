# 22 — Acceptance Test Suite

Production QA specification. **142 tests.** Tests T-01…T-80 carry forward from the canonical requirements; T-81…T-142 extend coverage to the areas this pack specifies (migrations, portability, accessibility, performance, states).

**Priority.** P0 = must pass for first release · P1 = must pass when the feature ships · P2 = future.
**Universal pass condition.** All expected results hold **and** invariants INV-01…INV-17 remain true after the action. Any invariant failure fails the test regardless of other outcomes.
**Default preconditions** (unless stated): fresh database, one bank account "Bank" with ₹1,00,000 starting balance, default categories, `month_start_day = 1`, `decimals = 2`.

---

## A. Transaction correctness — T-01…T-32 (all P0)

| ID | Preconditions | Steps | Expected state | Expected calculations | Expected UI |
|---|---|---|---|---|---|
| T-01 | Cash ₹5,000 | Spent ₹3,000, Food, Cash | 1 `out` | Cash 2,000; Spent 3,000 | "Spent ₹3,000" |
| T-02 | — | Spent ₹3,000, Food, Bank | 1 `out` | Bank 97,000; Spent 3,000 | — |
| T-03 | Card owed 0 | Spent ₹3,000 on Card | 1 `out` from Card | Card owed 3,000; Spent 3,000; Available unchanged | "You owe ₹3,000" |
| T-04 | After T-03 | Moved ₹3,000 Bank→Card | 1 `move` | Card owed 0; Bank 97,000; **Spent still 3,000** | "Paid ₹3,000 toward your card" |
| T-05 | After T-03 | Moved ₹1,000 Bank→Card | 1 `move` | Card owed 2,000; Spent 3,000 | — |
| T-06 | After T-03 | Money came back ₹1,000 | 1 `back` | Card owed 2,000; Spent 2,000; Income 0 | "₹1,000 came back" |
| T-07 | After T-03 | Money came back ₹3,000 | 1 `back` | Category nets 0; Income 0 | Parent "fully refunded" |
| T-08 | After T-07 | Money came back ₹500 more | Rejected | No change | Inline: "₹0 left to refund" |
| T-09 | Card owed 3,000; Bank B | Moved Bank B→Card | 1 `move` | Owed 0; Spent unchanged | — |
| T-10 | Card owed 3,000; Cash 5,000 | Moved Cash→Card | 1 `move` | Owed 0; Cash 2,000; Spent unchanged | — |
| T-11 | After T-04 | Moved ₹3,000 Card→Bank | 1 `move` | Balances restored | — |
| T-12 | Card | Spent ₹500 on Card, `Interest & charges` | 1 `out` | Owed +500; Spent +500 | — |
| T-13 | Card | Spent ₹340 on Card, `Interest & charges` | 1 `out` | Owed +340; Spent +340 | — |
| T-14 | Card | Moved ₹5,000 Card→Cash | 1 `move` | Owed +5,000; Cash +5,000; **Spent 0** | — |
| T-15 | — | Create card, owed ₹18,400 | 1 `start` | Owed 18,400; Income 0; Spent 0 | "You owe ₹18,400" |
| T-16 | — | Create card, leave balance blank | Save blocked | — | Statement hint; zero requires explicit confirm |
| T-17 | Cards A 5,000, B 0 | Moved ₹5,000 A→B | 1 `move` | Total owed unchanged | — |
| T-18 | Card owed 0 | Moved ₹2,400 Bank→Card | 1 `move` | Card +2,400 (in credit) | "₹2,400 in credit"; P1 signal fires |
| T-19 | — | Moved ₹5,000 Bank→Cash | 1 `move` | Bank 95,000; Cash 5,000; Spent 0 | "Took out ₹5,000 cash" |
| T-20 | After T-19 | Spent ₹1,200 from Cash | 1 `out` | Cash 3,800; **Spent 1,200 total** | — |
| T-21 | Cash 5,000 | Moved ₹2,000 Cash→Bank | 1 `move` | No income | — |
| T-22 | Cash income | Received ₹2,000 to Bank | 1 `in` | **Income 2,000** | — |
| T-23 | Loan account | Moved ₹5,00,000 Loan→Bank | 1 `move` | Owed 5,00,000; Bank +5,00,000; **Income 0** | "You owe ₹5,00,000" |
| T-24 | Loan owed 5,00,000 | Moved ₹12,000 Bank→Loan, interest 0 | 1 `move` | Owed 4,88,000; Spent 0 | "You owe ₹4,88,000" |
| T-25 | Same | Moved ₹12,000, interest ₹1,500 | 2 rows, one `group_id`: `move` 10,500 Bank→Loan; `out` 1,500 **from Bank** | Bank −12,000; owed 4,89,500; Spent 1,500 | Single confirmation |
| T-26 | Loan; app owed 4,88,000 | Balance check: user owes 4,90,300 | 1 `out` ₹2,300 **from Loan**, `Interest & charges` | Owed 4,90,300; Spent +2,300; **in category shares** | "₹2,300 of interest and charges" |
| T-27 | Loan owed 10,000 | Moved ₹10,000 Bank→Loan | 1 `move` | Owed 0; archivable | — |
| T-28 | — | Moved ₹20,000 Bank→Outside, label "Mutual fund" | 1 `move` | Spent 0; Kept unchanged | "₹20,000 put in" |
| T-29 | After T-28 | Moved ₹50,000 Outside→Bank | 1 `move` | **Income 0**; Bank +50,000 | Label "fully withdrawn" |
| T-30 | — | Moved ₹5,000 Bank→Outside, "Loan to Ravi" | 1 `move` | Spent 0 | — |
| T-31 | Spent ₹4,000 dinner | Money came back ₹2,000 | 1 `back` | Category nets 2,000; **Income 0** | — |
| T-32 | T-06 exists | Delete the parent `out` | Parent + `back` deleted | No orphan; balances consistent | Dialog: "This also deletes 1 refund" |

## B. Reporting & analytics — T-33…T-49

| ID | Pri | Scenario | Expected |
|---|---|---|---|
| T-33 | P0 | Drill Spent → category → payee → transactions | Sums reconcile exactly at every level |
| T-34 | P0 | Category total vs its transaction list | Identical to the paise |
| T-35 | P0 | Period containing a correction | `Not recorded` is its own row; excluded from shares; shares sum to 100% |
| T-36 | P1 | Waterfall in R-04 | Σ increases − Σ decreases = total change exactly |
| T-37 | P1 | 2 qualifying months, then 3 | "Typical" absent at 2, present at 3 |
| T-38 | P1 | Current month, day 12 | Compares to typical **MTD day 12**, not full month |
| T-39 | P1 | Mark a transaction as one-off | Excluded from all future baselines |
| T-40 | P1 | Annual commitment ₹12,000 | Excluded from monthly baselines; set-aside guidance shown |
| T-41 | P1 | Rent ₹18,000 ×6 then ₹18,500 | Price-change notice; **no** unusual-spending alert |
| T-42 | P1 | Category with spend in 2 of 6 months | No unusual-spending alert (fails ≥4 non-zero) |
| T-43 | P1 | Category MAD/median > 0.5 | Range shown; point comparison suppressed |
| T-44 | P0 | Limit viewed on day 3 | Progress only; no pace |
| T-45 | P0 | Month with zero income | Kept % suppressed; "no income recorded" |
| T-46 | P0 | Refunds exceed spending | Kept % >100%; explanation shown; not an error |
| T-47 | P0 | Top-3 share | Equals top-3 sum ÷ (Spent − corrections) |
| T-48 | P1 | Unusual-spending drill-down | Shows figure, typical, months used, exclusions |
| T-49 | P0 | Any screen with an estimate | Labelled; never summed with actuals |

## C. Data completeness — T-50…T-59 (all P0)

T-50 day 1: exact balances and spending, no comparison · T-51 five days: distribution, no projection · T-52 two weeks: MTD only · T-53 one month: level, no typical · T-54 two months: vs last month · T-55 three qualifying months: typical unlocks · T-56 a month with 8 transactions is excluded from baselines and typical changes accordingly · T-57 14 days without entries triggers the reliability prompt · T-58 month with no income falls back to spending-only reporting · T-59 30 backdated entries recompute affected periods and mark them revised.

## D. Balance check — T-60…T-69 (all P0)

T-60 asset, actual < app → missed-spending correction · T-61 asset, actual > app → missed-income correction · T-62 owed, user owes **more** than app → missed spending · T-63 owed, user owes less → missed income · T-64 correction included in Spent and Kept · T-65 correction excluded from shares, limits, baselines · T-66 undo restores prior state, `outcome = ignored` · T-67 skipping alters no data · T-68 rate-limited to one prompt per account per day · T-69 correction opens an explanation panel, not a transaction list.

## E. UX & state — T-70…T-80

T-70 (P0) every screen has a non-blank first-use state · T-71 (P0) common expense completes in three taps · T-72 (P0) back from a drill-down returns to origin, not tab root · T-73 (P0) CSV export → import → export is byte-identical · T-74 (P0) re-import into the same database inserts zero rows · T-75 (P0) backup restore is lossless · T-76 (P1) duplicate prompt only within 5 minutes on matching amount+payee+account · T-77 (P0) changing kind `out`→`move` nulls category and flags · T-78 (P0) self-transfer blocked · T-79 (P0) archived account unselectable for new entries, history retained · T-80 (P0) no user-visible string contains banned accounting or statistical terms (automated lint).

## F. Invariants and structural integrity — T-81…T-95

| ID | Pri | Scenario | Expected |
|---|---|---|---|
| T-81 | P0 | Archive an account with ₹5,000 balance | Blocked; offers "Move the remaining ₹5,000 to…" (EX-01) |
| T-82 | P0 | Delete one row of an interest-split group | Whole group deletes atomically (EX-03) |
| T-83 | P0 | Day 20, days-recorded ratio 0.4 | Reliability = "Just starting" (precedence, EX-04) |
| T-84 | P0 | Edit a correction's amount | `BalanceCheck.difference` updates in the same write (EX-05) |
| T-85 | P0 | Outside label net ≤ 0 | "Fully withdrawn", no amount shown (EX-06) |
| T-86 | P0 | After every write in suite A | INV-01 holds for all touched accounts |
| T-87 | P1 | Two payments matching one occurrence | Only one matches; the other stays unmatched |
| T-88 | P1 | Commitment paid 9 days early | Unmatched → overdue prompt to link manually |
| T-89 | P0 | Account with a starting balance | `start` appears in no report; Income 0 |
| T-90 | P0 | Attempt to write a `back` with no parent | Rejected by validation |
| T-91 | P0 | Attempt `essential` on an `in` record | Rejected by CHECK constraint |
| T-92 | P0 | Report containing actuals and an estimate | Never summed into one unlabelled figure |
| T-93 | P0 | Recompute twice from identical data | Byte-identical results |
| T-94 | P0 | Sum 10,000 random amounts | Exactly equals the integer total; no drift |
| T-95 | P0 | Full-month vs partial-month comparison | Partial always day-aligned (INV-17) |

## G. Accounts & categories — T-96…T-105

T-96 (P0) duplicate active account name rejected · T-97 (P0) account delete blocked when transactions exist · T-98 (P0) unarchive restores selectability · T-99 (P0) category merge reassigns all references atomically · T-100 (P0) category delete blocked when referenced · T-101 (P0) system categories cannot be renamed or deleted · T-102 (P0) changing `essential_default` does not retroactively alter existing transactions · T-103 (P0) `counts_as_available` forced false for owed accounts · T-104 (P1) payee merge reassigns transactions · T-105 (P1) payee delete sets `payee_id` null, transactions intact.

## H. Commitments & limits — T-106…T-113

T-106 (P0) commitment generates occurrences to a 12-month horizon · T-107 (P0) matched occurrence excluded from Promised · T-108 (P0) overdue occurrence appears in Promised and prompts · T-109 (P0) limit on a repeating category blocked with explanation · T-110 (P0) two active limits on one category prevented · T-111 (P1) price change appends history and raises a notice · T-112 (P1) deactivated commitment drops future occurrences, retains history · T-113 (P1) detected commitment requires confirmation, never auto-created.

## I. Portability & migration — T-114…T-123

T-114 (P0) CSV with an unknown account ID → row invalid, reported, not fabricated · T-115 (P0) CSV renamed account, same ID → imports correctly (IDs authoritative) · T-116 (P0) partial group in import → refused · T-117 (P0) import ordering: refunds after parents regardless of file order · T-118 (P0) backup with newer schema → refused with a clear message · T-119 (P0) backup with older schema → migrated then restored · T-120 (P0) restore validation failure leaves live data untouched · T-121 (P0) interrupted backup leaves no partial file · T-122 (P0) migration from each prior schema version preserves all balances exactly · T-123 (P0) CSV field beginning with `=` is escaped on export.

## J. Recovery & integrity — T-124…T-129

T-124 (P0) corrupt database opens the recovery screen, never crashes · T-125 (P0) foreign-key violation detected at startup · T-126 (P0) out-of-band balance corruption caught by the startup assertion · T-127 (P0) interrupted write rolled back on next open · T-128 (P0) rollup cache dropped → every report renders identically (doc 15 §9) · T-129 (P0) diagnostics log contains no amounts, payee names, or notes.

## K. Accessibility — T-130…T-136

T-130 (P0) all text renders at 200% with no truncated amount · T-131 (P0) contrast ratios pass in both themes · T-132 (P0) every interactive element has an accessible label · T-133 (P0) Money available and Owed announce as two separate values · T-134 (P0) F-03 completable end-to-end by screen reader · T-135 (P0) every chart offers a table alternative · T-136 (P0) reduce-motion disables all transitions.

## L. Performance — T-137…T-142

T-137 (P0) add-sheet open within budget at 10k · T-138 (P0) save within budget at 10k · T-139 (P0) cold start within budget at 10k · T-140 (P1) R-05 over 12 months within budget at 50k · T-141 (P1) list scroll <1% dropped frames at 50k · T-142 (P1) memory under ceiling at 50k.

---

## Coverage summary

| Group | Tests | P0 | P1 | P2 |
|---|---|---|---|---|
| A Transactions | 32 | 32 | — | — |
| B Reporting | 17 | 8 | 9 | — |
| C Completeness | 10 | 10 | — | — |
| D Balance check | 10 | 10 | — | — |
| E UX & state | 11 | 10 | 1 | — |
| F Invariants | 15 | 13 | 2 | — |
| G Accounts/categories | 10 | 8 | 2 | — |
| H Commitments/limits | 8 | 5 | 3 | — |
| I Portability/migration | 10 | 10 | — | — |
| J Recovery | 6 | 6 | — | — |
| K Accessibility | 7 | 7 | — | — |
| L Performance | 6 | 3 | 3 | — |
| **Total** | **142** | **122** | **20** | **0** |

P2 features (split transactions, drift, growth, seasonality, PDF, encryption) carry their tests at implementation time; specifying them now would fix details that the P2 design has not yet settled.

## Execution requirements

Every test runs against the deterministic datasets in doc 23. Group A, F, and J run on every commit. Groups B–E, G–I run on every build. Groups K and L run nightly and at the release gate. A failure in any P0 test blocks release; a failure in Group A or F blocks merge.
