# 08 — Reporting Specification

Reporting is a core product capability, not a dashboard. Six views live in one Reports area. Every view follows **Answer → Explanation → Detail**, and every number drills to the transactions that sum to it.

Metric IDs refer to doc 06; analytics behaviour to doc 07.

---

## 1. Reporting model

| Level | Purpose | Content |
|---|---|---|
| **L1 — Answer** | What the user immediately learns | One number, one sentence of context |
| **L2 — Explanation** | Why it is that way | 3–6 movements or breakdown rows |
| **L3 — Detail** | What makes it up | Transaction list, filtered, summing exactly |

Worked shape:
```
You spent ₹52,400 this month
  ₹4,200 more than a typical month
  → Eating Out  +₹2,000  (₹5,200 vs ₹3,200 typical)
    Shopping    +₹1,400
    Transport     +₹800
      → 14 transactions
```

**Chart discipline.** Bars for comparison · lines for direction · waterfall for explanation · progress for limits. No pie chart as a primary view, no heatmaps, no decorative visuals. Every chart must name the decision it supports.

---

## 2. R-01 · This month · **P0**

**User question (J-03, J-04).** How much have I spent, and where did it go?
**L1.** M-04 Spent · M-06 Kept · M-07 Kept % · M-19 day-aligned comparison when available.
**L2.** Categories ordered by size, each with amount, M-10 share, and its own change vs typical (P1). `Not recorded` shown as its own final row, excluded from shares (INV-09).
**L3.** Transactions per category, then per payee.
**Visualisations.** Horizontal bars for category sizes; a single comparison bar for this month vs typical.
**Metrics.** M-04, M-06, M-07, M-10, M-19, M-16.
**Filters.** Period selector (this month, last month, any month, custom range). Account filter.
**Time range.** Defaults to the current period.
**Drill-down.** L1 total → L2 categories → L3 transactions. Sums must reconcile exactly at every level.
**States.** *Empty:* "Add a few expenses to start seeing where your money goes." *Partial (<3 qualifying months):* full figures, no typical comparison, with "Once you've used this another month, I can compare." *Full:* all levels.
**Actions.** Set a limit on a category · mark a transaction as a one-off (P1).
**Performance.** Single period aggregation; target <150 ms at 50k transactions with the category index.

---

## 3. R-02 · Where it goes · **P0**

**User question (J-04, J-11).** Which categories matter most, and what could I actually change?
**L1.** M-11 top-3 share — "Three categories account for 68% of your spending".
**L2.** Full category breakdown split into **Must-pay (M-08)** and **Flexible (M-09)**, each with share and amount.
**L3.** Transactions per category, then payee.
**Visualisations.** Stacked bar for must-pay vs flexible; ranked horizontal bars per category.
**Metrics.** M-08, M-09, M-10, M-11.
**Filters.** Period; must-pay / flexible toggle.
**Drill-down.** Category → payee → transaction.
**States.** *Empty:* explains what the split will show. *Partial:* works from day 1 — this report needs no history.
**Actions.** Reclassify a category or transaction as essential/flexible · set a limit.
**Performance.** As R-01.

---

## 4. R-03 · Limits · **P0**

**User question (J-09).** Am I inside the limits I set?
**L1.** "4 of 5 limits on track."
**L2.** Per-limit progress (M-14), amount remaining, and pace (M-15) from day 5.
**L3.** Transactions counting against each limit.
**Visualisations.** Progress bars with a pace marker showing the linear-expectation point.
**Metrics.** M-14, M-15.
**Filters.** Period; on-track / over toggle.
**Drill-down.** Limit → transactions.
**States.** *Empty:* "Set a limit on a category you'd like to watch" with a one-tap create. *Partial:* before day 5, progress only, no pace. *Full:* both.
**Actions.** Adjust limit · create limit · remove limit.
**Note.** Plan creates and edits limits; this report analyses them. No duplication of function.

---

## 5. R-04 · What changed · **P1** (includes Monthly Review mode)

**User question (J-06).** What changed, and why?
**L1.** M-19 — "₹4,200 more than a typical month" (day-aligned for the current period).
**L2.** Waterfall of the largest increases and decreases by category, in rupees. Increases minus decreases must equal the total change exactly.
**L3.** Transactions behind each bar.
**Visualisations.** Waterfall — the single most explanatory chart in the product.
**Metrics.** M-04, M-17, M-18, M-19.
**Filters.** Period; compare against typical or against last month.
**Drill-down.** Bar → category → transactions.
**States.** *Insufficient (<2 months):* the view is reachable and explains "I'll be able to compare once you've completed another month." *Partial (2 months):* compares to last month only, labelled as such. *Full (≥3 qualifying):* typical comparison.
**Actions.** Mark a transaction as a one-off · set a limit.
**Monthly Review mode.** Entered from a Home card in the first week of a period. Same report, scoped to the just-closed month, with a narrative header and the sequence defined in doc 07 §12, ending in a single pre-filled action ("set next month's limits"). It is a mode, not a seventh surface.
**Performance.** Two period aggregations plus a median over 6 months; target <300 ms at 50k.

---

## 6. R-05 · Over time · **P1**

**User question (J-05, J-12).** How is my behaviour changing?
**L1.** Direction across 3 / 6 / 12 months — "Spending has been steady" / "rising".
**L2.** Per-category trend lines with the typical band shaded; sparkline per category row.
**L3.** Month → transactions.
**Visualisations.** Multi-month line with a shaded 25th–75th percentile band; per-row sparklines.
**Metrics.** M-04, M-17, M-23 (P2 drift).
**Filters.** Window (3/6/12/24 months); category selection; must-pay vs flexible.
**Drill-down.** Point on the line → that month → transactions.
**States.** *Insufficient (<3 points):* plots what exists with no direction claim. *Full:* direction stated only when three consecutive deltas share a sign.
**Actions.** Set a limit · open a month in R-01.
**Performance.** Up to 24 monthly aggregations; precompute per-month rollups (doc 15).

---

## 7. R-06 · Regular bills · **P1**

**User question (J-07, J-10).** What repeats, what does it cost, and what's coming?
**L1.** M-20 total monthly commitment load, normalised to monthly for non-monthly cadences.
**L2.** Every commitment with amount, cadence, next due date, matched/overdue status, and any price change.
**L3.** Matched transactions per commitment.
**Visualisations.** Simple table plus a calendar strip of what is due this period. No chart is warranted here; a table is the correct instrument.
**Metrics.** M-12, M-20; price-change detection per doc 07 §9.
**Filters.** Active / inactive; due this period.
**Drill-down.** Commitment → occurrences → matched transactions.
**States.** *Empty:* "Add your regular bills so I can tell you what's coming." *Partial:* user-entered only, with detection suggestions once 3 qualifying months exist. *Full:* both.
**Actions.** Confirm a detected commitment · edit · deactivate · link an overdue occurrence manually.
**Annual items.** An annual commitment displays set-aside guidance: "₹12,000 due in March — about ₹1,000 a month".

---

## 8. Cross-report behaviour

**Period selector.** Shared across all reports, respecting `month_start_day`. Changing period in one report does not silently change it in another; each report remembers its own selection within a session.
**Context preservation.** Drilling from any report into transactions and returning restores scroll position and filter state.
**Export.** Any report's L3 transaction list can be exported to CSV using the same writer as doc 16.
**Consistency rule.** Two reports showing the same metric for the same period must show identical values. This is guaranteed by all reports calling the same engine (doc 06), never their own arithmetic.

---

## 9. The explainability guarantee

Every aggregate resolves to a transaction list summing to it exactly, along **Home → Report → Category → Payee → Transaction**.

Four figures are structurally exempt and must therefore **always appear as separate line items**, never folded into a category:

| Figure | Why exempt | How it is explained |
|---|---|---|
| `Not recorded` corrections | No underlying transactions exist by definition | "₹700 was spent but not recorded — found on 12 March" |
| Estimates | Forward-looking; never summed with actuals (INV-13) | Labelled, with inputs shown on tap |
| Starting balances | Not income or spending (INV-10) | Shown on the account, dated, in no report |
| `Outside` movements | Not spending; never valued | "₹20,000 put in" with label and transactions listed |

**Unusual-spending drill-down** additionally shows this month's figure, the typical figure, the qualifying months used, and any excluded one-offs — so the user can always answer "why is it saying this?"

---

## 10. Performance considerations

| Report | Aggregations | Strategy |
|---|---|---|
| R-01, R-02 | 1 period | Direct query on `idx_tx_category_date` |
| R-03 | 1 period × limits | Direct |
| R-04 | 2 periods + 6-month median | Monthly rollup cache (doc 15) |
| R-05 | up to 24 periods | Monthly rollup cache, mandatory above 10k transactions |
| R-06 | occurrences + matches | Direct; occurrence table is small |

Targets and dataset sizes are specified in doc 21.
