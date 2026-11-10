# 01 — Product Master Specification

**Executive source document for the specification pack.** Derived entirely from `PersonalFinance_Final_Requirements_v1.1.md`. No feature appears here that is not traceable to that document.

---

## 1. Product definition

An offline, manually maintained personal finance application that turns recorded money events into accurate balances, honest comparisons against the user's own history, and a small number of things worth knowing.

## 2. Vision

Most people experience money as a vague anxiety because they have no reliable record and no honest point of comparison. This product replaces guessing with an accurate personal financial memory that costs a few seconds a day to maintain, works with no internet and no accounts, and grows more insightful the longer it is used — without ever asking its user to learn finance.

## 3. Goals

| ID | Goal |
|---|---|
| G-1 | Accurate balances and spending from day one |
| G-2 | Plain-language reporting with genuine analytical depth |
| G-3 | Honest comparison against the user's own past |
| G-4 | Detection of what changed and what is unusual |
| G-5 | Minimum possible entry effort |
| G-6 | Complete data ownership |

## 4. Non-goals

Net worth · financial-health scores · investment valuation · external benchmarking · AI advice · gamification · bank, card or UPI integration · multi-currency · shared or group expenses · prescriptive financial recommendations.

## 5. Target users

An ordinary person with basic smartphone literacy who wants to know where their money goes, is willing to record transactions manually, and does not want to connect bank accounts. They must not be required to understand accounting, double-entry, accrual basis, statistics, financial modelling, or database concepts.

## 6. User jobs

| ID | Job | Frequency | First answerable |
|---|---|---|---|
| J-01 | How much money do I actually have? | Daily | Day 1 |
| J-02 | Can I spend this, or is it promised? | Daily | Day 1 (weak) → strong with commitments |
| J-03 | How much have I spent this month? | Weekly | Day 1 |
| J-04 | Where did it go? | Monthly | Week 1 |
| J-05 | Is that normal for me? | Monthly | Month 3 |
| J-06 | What changed, and why? | Monthly | Month 2 |
| J-07 | What bills repeat, and what do they cost? | Monthly | Day 1 (entered) / Month 3 (detected) |
| J-08 | How much am I keeping? | Monthly | Month 1 |
| J-09 | Am I inside the limits I set? | Weekly | On limit creation |
| J-10 | What's coming that I should prepare for? | Monthly | Commitments entered |
| J-11 | Where could I realistically cut? | Occasional | Month 3 |
| J-12 | Is my behaviour drifting over time? | Quarterly | Month 6 |
| J-13 | Can I trust these numbers? | Ongoing | Always |

## 7. Product principles

1. **Correctness first.** A finance app that is wrong once is finished.
2. **Capture is sacred.** No feature may add a step to recording a transaction.
3. **Always say something true.** Never fabricate a comparison; always make the strongest true statement the data supports.
4. **Plain language only.** No accounting or statistical vocabulary reaches the user.
5. **Every number is traceable.** Any aggregate leads to the transactions behind it.
6. **Describe and compare; never prescribe.**

## 8. UX principles

Simple interaction + progressive disclosure + rich underlying information. Answer → Explanation → Detail on every reporting surface. A user wanting a quick answer gets it immediately; a user wanting analysis can go several levels deeper. Simple UI never means few features.

## 9. Offline principles

Every capability computes from local rows alone. No network call, no external dataset, no remote model, no account, no telemetry dependency. Offline is not a degraded mode — it is the only mode.

## 10. Privacy principles

All data remains on device. Payee and note text never leave the device. Backup and CSV export are free and unrestricted, because data portability is part of the ownership model rather than a paid feature.

## 11. Complete feature inventory

| ID | Feature | Tier | Depends on |
|---|---|---|---|
| F-01 | Three-chip capture (Spent / Received / Moved) | P0 | — |
| F-02 | Amount keypad with calculator | P0 | F-01 |
| F-03 | Smart defaults (last account, today, payee category) | P0 | F-01, F-06 |
| F-04 | Asset and owed accounts with starting balances | P0 | — |
| F-05 | Categories with essential/repeating defaults | P0 | — |
| F-06 | Payee memory and autocomplete | P0 | — |
| F-07 | Six transaction kinds | P0 | F-04, F-05 |
| F-08 | Refunds via `back` | P0 | F-07 |
| F-09 | Moves including `Outside` | P0 | F-04, F-07 |
| F-10 | Loan model with interest split | P0 | F-04, F-07 |
| F-11 | Commitments (user-entered) with due dates | P0 | F-05 |
| F-12 | Spending limits with progress and pace | P0 | F-05 |
| F-13 | Balance check and corrections | P0 | F-04, F-07 |
| F-14 | Reliability indicator | P0 | F-13 |
| F-15 | Report: This month | P0 | F-07 |
| F-16 | Report: Where it goes | P0 | F-07 |
| F-17 | Report: Limits | P0 | F-12 |
| F-18 | Transactions list with filter and search | P0 | F-07 |
| F-19 | Home (four elements) | P0 | F-04, F-11, F-13 |
| F-20 | Backup and restore | P0 | — |
| F-21 | CSV export and import | P0 | — |
| F-22 | ₹ formatting, decimals, month-start day | P0 | — |
| F-23 | All six screen states | P0 | all |
| F-24 | Recurrence detection | P1 | F-06, 3 months |
| F-25 | Report: What changed (+ Monthly Review mode) | P1 | F-27 |
| F-26 | Report: Over time | P1 | F-27 |
| F-27 | Typical-month baselines | P1 | 3 qualifying months |
| F-28 | Report: Regular bills | P1 | F-11 |
| F-29 | Unusual spending detection | P1 | F-27, 6 qualifying months |
| F-30 | Commitment price-change alerts | P1 | F-11 |
| F-31 | Card-in-credit signal | P1 | F-04 |
| F-32 | One-off flagging UI (`exclude_from_typical`) | P1 | F-27 |
| F-33 | Home-screen widget quick-add | P1 | F-01 |
| F-34 | Passcode and biometric lock | P1 | — |
| F-35 | Duplicate prompt | P1 | F-06 |
| F-36 | Catch-up entry mode | P1 | F-01 |
| F-37 | Insight engine and gates | P1 | F-29, F-30, F-31 |
| F-38 | Post-hoc split transactions | P2 | F-07 |
| F-39 | Category drift analysis | P2 | F-27, 6 months |
| F-40 | Flexible-vs-income growth (12 months) | P2 | F-27, 12 months |
| F-41 | Seasonality / year-over-year (24 months) | P2 | F-27, 24 months |
| F-42 | PDF export | P2 | F-15, F-16 |
| F-43 | Database encryption at rest | P2 | F-20 |

**Removed (never to be added):** net worth · health score · tags · subcategories · funds and goals · weekly or custom budget periods · budget carry-over · calendar heatmaps · dormant-subscription detection · shared expenses · multi-currency · investment valuation · gamification · peer comparison · receipt OCR · SMS parsing · AI advice.

## 12. Feature dependency graph

```
F-04 Accounts ─┬─> F-07 Transactions ─┬─> F-15/F-16 Reports ─> F-25/F-26 (needs F-27)
F-05 Categories┘                      ├─> F-13 Balance check ─> F-14 Reliability
F-06 Payee ───────────────────────────┼─> F-24 Recurrence (3m) ─> F-28 Regular bills
                                      ├─> F-35 Duplicate prompt
                                      └─> F-27 Typical (3 qualifying months)
                                             ├─> F-29 Unusual (6 qm) ─┐
                                             ├─> F-39 Drift (6m)      ├─> F-37 Insights
                                             ├─> F-40 Growth (12m)    │
                                             └─> F-41 Seasonality(24m)┘
F-11 Commitments ─> Promised ─> Left to spend (F-19) ─> F-30 Price change
F-12 Limits ─> F-17 Limits report
```

**Data-volume gates:** Day 1 → facts only. 2 months → vs last month. 3 qualifying months → typical, recurrence. 6 qualifying months → unusual spending, drift. 12 months → growth comparison. 24 months → seasonality.

## 13. Product lifecycle

| Stage | User state | Product behaviour |
|---|---|---|
| Setup | No data | Onboarding: currency confirm, first account with balance, category set |
| Days 1–30 | Facts only | Exact balances and totals; no comparisons; "just starting" reliability |
| Months 2–3 | First comparisons | Vs last month, then typical unlocks |
| Months 4–6 | Patterns | Recurrence detection, trends |
| Months 6–12 | Full intelligence | Unusual spending, insights, monthly review |
| Year 2+ | Long-horizon | Growth comparison, seasonality |

## 14. Success metrics

**Activation:** first transaction within 60 s of install · 10+ transactions across ≥5 distinct days in the first 14 days.
**Engagement:** transactions per active week · days-recorded ratio · Reports opens per month · drill-down depth per Reports session.
**Retention:** D7, D30, M3, M6 — M3+ is the only honest measure for a monthly-cadence product.
**Quality:** balance-check completion rate · reliability-state distribution · insight dismissal rate · crash-free rate.
**Correctness (internal):** zero invariant-assertion failures in production telemetry-free logs; all acceptance tests green.

Causal honesty: the product may observe correlation between usage and financial outcomes but must never claim to have caused them, in marketing or internally.

## 15. Known risks

| Risk | Type | Mitigation / status |
|---|---|---|
| Manual-entry sustainability | Behavioural | Prototype validation; failure invalidates the concept |
| Balance-check adoption | Behavioural | Prototype validation over 60 days |
| Essential/flexible classification accuracy | Behavioural | Defaults + one-tap override; measure override rate |
| Full recomputation cost at scale | Technical | Doc 15 and 21 define caching boundaries |
| Device loss with no cloud backup | Product | Backup prompts; stated clearly at onboarding |
| Requirement drift during design/build | Process | Docs 29 and 30 define what must not change |
