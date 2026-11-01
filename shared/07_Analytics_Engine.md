# 07 — Analytics Engine

Every analytical feature specified as **Input → Calculation → Threshold → Output → Confidence → Fallback → Suppression**. The engine may never fabricate a conclusion from insufficient data; equally, it may never go silent when a weaker true statement is available. Only one feature — unusual spending — is hard-suppressed.

---

## 1. Governing rule

> Never fabricate a comparison you don't have data for; always make the strongest true statement the data supports.

Applied uniformly: at 3 days the engine reports a distribution, at 2 months a month-over-month change, at 3 qualifying months a typical-month comparison. No stage produces an empty surface.

---

## 2. Qualifying month (foundation for all baselines)

A month enters any baseline only if **all** hold:
1. Fully elapsed — never the current month.
2. ≥10 recorded transactions.
3. Unresolved balance-check drift ≤15% of that month's recorded spending. *No check performed is not disqualifying.*
4. Not manually excluded by the user.

**Excluded from every baseline:** transactions flagged `exclude_from_typical`; non-monthly commitments (quarterly, annual, custom); `Not recorded` corrections.

**Rationale for (2):** a month with three transactions is not a picture of behaviour; including it would drag medians toward noise.

---

## 3. Typical month

| | |
|---|---|
| **Input** | Qualifying months, last 6 |
| **Calculation** | `M-17 = median(monthly spend)`; per category `median` over qualifying months with non-zero spend in that category |
| **Threshold** | ≥3 qualifying months overall; ≥3 non-zero months per category |
| **Output** | "A typical month for you is about ₹47,000" |
| **Confidence** | 3–5 months → "about"; 6+ → plain figure |
| **Fallback** | 2 months → "vs last month"; 1 month → level only |
| **Suppression** | The phrase "typical" never appears below 3 qualifying months |

**Irregular guard.** If `MAD ÷ median > 0.5` for a subject, output a **range** ("your food spending usually runs ₹4,000–₹9,000", from the 25th–75th percentile) instead of a point comparison, and disable unusual-spending detection for that subject.

## 4. Day-aligned comparison

| | |
|---|---|
| **Input** | Current month-to-date spend; qualifying months |
| **Calculation** | `M-18(d) = median{ Σ spend(day 1..d) }` across qualifying months |
| **Threshold** | ≥3 qualifying months |
| **Output** | "₹18,400 by the 12th — a typical month is around ₹16,900 by this point" |
| **Fallback** | Level only |
| **Suppression** | Comparing a partial month to a full-month baseline is **prohibited** (INV-17) |

Completed months compare full to full. The UI always states which basis is in use.

## 5. Category trends

| | |
|---|---|
| **Input** | Monthly category spend, last 3/6/12 qualifying months |
| **Calculation** | Series of monthly totals plus a shaded typical band (25th–75th percentile) |
| **Threshold** | ≥3 points to draw a line; direction stated only with ≥3 consecutive qualifying months |
| **Output** | Trend line per category; "Eating Out has risen three months running" |
| **Confidence** | Direction claimed only when all three deltas share a sign |
| **Fallback** | Fewer points → plot what exists, no direction claim |
| **Suppression** | Categories below ₹500 monthly median are omitted from trend lists |

## 6. Spending concentration

**Input** current period category totals · **Calculation** `M-11` top-3 share · **Threshold** none, ≥1 month · **Output** "Three categories account for 68% of your spending" · **Confidence** always high (arithmetic) · **Fallback** n/a · **Suppression** none.
**Interpretation rule:** descriptive only. The product never characterises concentration as good or bad.

## 7. Recurrence detection (P1)

| | |
|---|---|
| **Input** | Transactions grouped by payee (or by category where payee is absent) |
| **Calculation** | ≥3 occurrences; intervals consistent within ±7 days of a monthly / quarterly / annual cadence; amounts within ±20% of their median |
| **Threshold** | All three conditions |
| **Output** | Suggestion card: "Netflix looks like a monthly bill — add it?" |
| **Confidence** | Payee-based = high; category-only = low, and the suggestion names the ambiguity |
| **Fallback** | With payee coverage < 50%, detection is offered from category+amount and labelled as a guess |
| **Suppression** | Never auto-creates a commitment. Confirmation is always the user's |

**Commitment matching.** An occurrence is satisfied by a transaction with the same payee (or category, if no payee) within ±7 days of the due date and within ±20% of the expected amount. Outside that window the occurrence becomes **overdue** and prompts the user to link manually — it is never silently double-counted in *Promised* (INV-08).

## 8. Unusual spending (P1)

| | |
|---|---|
| **Input** | Flexible, non-repeating category spend across qualifying months |
| **Calculation** | `M-21`: robust threshold `median + 3 × max(MAD, 0.1 × median)` |
| **Threshold** | **Three gates, all required:** robust-statistical **and** ≥30% relative **and** ≥₹500 absolute |
| **Eligibility** | ≥6 qualifying months, ≥4 with non-zero spend in the category, `MAD ÷ median ≤ 0.5` |
| **Output** | "Eating Out was ₹2,100 more than usual — four orders over ₹600" |
| **Confidence** | 6–11 months → "about"; 12+ → plain |
| **Fallback** | None — this is the one hard suppression |
| **Suppression** | Silent below eligibility. Cooldown 30 days per category. "Not useful" permanently suppresses the type |

**Why the MAD floor exists.** Rent at exactly ₹18,000 for six months gives MAD = 0, making ₹18,500 infinitely many MADs away — a guaranteed false alarm on the most stable categories in the app. Flooring MAD at `0.1 × median` removes that failure. The ≥4-non-zero rule removes the mirror failure for sparse categories where median = 0.

**Commitment price changes are not anomalies.** A rent increase raises a *price change* notice (§9), never an unusual-spending alert.

## 9. Commitment price change (P1)

**Input** `commitment_amount_history` · **Calculation** compare newest matched amount to the previous recorded amount · **Threshold** change ≥5% **and** ≥₹100 · **Output** "Rent went up ₹500" · **Confidence** high (exact) · **Fallback** none · **Suppression** one notice per commitment per change.

## 10. Limits and pace (P0)

**Input** limit, category spend, day of period · **Calculation** `M-14`, `M-15` · **Threshold** pace shown from day 5 · **Output** progress bar plus, when pace > 1.25 after day 10 and projected overrun ≥₹300, a calm warning · **Confidence** arithmetic · **Fallback** progress only before day 5 · **Suppression** one warning per limit per month.

## 11. Reliability (P0)

**Input** days with ≥1 record in the period; most recent unresolved balance-check drift; days since last entry.
**Calculation and precedence (strict, EX-04):**

| Order | State | Condition | Message |
|---|---|---|---|
| 1 | Just starting | < 30 days of history | "Keep adding expenses — I'll start spotting patterns soon" |
| 2 | Some gaps | days-recorded ratio < 0.5 **or** unresolved drift > 15% of period spending **or** ≥14 days since the last entry | "A few things may be missing — check your balance?" |
| 3 | Reliable | otherwise | "Your spending picture looks reliable" |

**Never** displayed as a percentage. Facts remain exact in every state; only comparisons and estimates weaken.

## 12. Monthly Review (P1)

A **month-boundary mode of the What changed report**, not a separate surface. Triggered by a Home card in the first week of a period, once ≥1 prior qualifying month exists.

**Composition (assembled from existing metrics — no new analytics):** headline (M-04, M-06, M-07 with M-19 comparison) → what changed (waterfall) → limits exceeded (M-14) → what went well (limits met, M-07 improvement) → commitments and any price changes → what's coming (M-12) → one closing action ("set next month's limits", pre-filled from the user's own medians).

**Fallback with one prior month:** the review runs without the typical comparison, using vs-last-month only.

## 13. Insight gates (P1)

Every insight must pass all four:
1. **Materiality** — both relative and absolute thresholds met.
2. **Confidence** — eligibility conditions met.
3. **Novelty** — outside the cooldown for that subject.
4. **Budget** — at most 1 card on Home, 3 active in Reports, 4 notifications per month.

**Insight set:** unusual spending · commitment price change · limit pace · card-in-credit · reliability prompt · one positive acknowledgement per month (reserved slot — a product that only reports failure gets deleted).

**Actions on every card:** see the transactions · set a limit · mark as a one-off (sets `exclude_from_typical`) · not useful (suppresses that type).

## 14. Progressive intelligence ladder

| Stage | Statement the engine produces |
|---|---|
| Day 1 | "You have ₹51,200. You've spent ₹1,240 today." |
| Days 3–7 | "₹8,400 over 5 days — mostly Food and Transport." |
| 2 weeks | "₹19,600 so far this month." (no projection) |
| 1 month | "Month one: ₹48,200 spent, ₹51,800 kept — 52% of what came in." |
| 2 months | "₹4,200 more than last month, mostly Eating Out." |
| 3 qualifying months | "A typical month for you is about ₹47,000." · recurrence suggestions begin |
| 6 qualifying months | Trends with direction · unusual spending begins |
| 12 months | "Your regular bills grew from ₹18,000 to ₹22,400 this year." (P2) |
| 24 months | "October is usually your heaviest month — last year ₹64,000." (P2) |

The claim strengthens with evidence and never disappears.
