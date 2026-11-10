# 17 — Search, Filter & Sort

Scope is deliberately narrow: only what doc 09 (S-10) and the drill-down paths require. No filter appears here that no screen uses.

---

## 1. Search

**Fields searched.** `payee.name` and `transaction.note`. Nothing else — searching category or account names would duplicate the filters and produce confusing overlaps.

**Behaviour.** Case- and accent-insensitive substring match on the normalised form. Debounced 250 ms. Minimum 2 characters. Results are ranked: payee-name matches before note matches, then most recent first. The result count is always displayed.

**Amount search.** Typing a bare number searches the amount as an exact match in rupees **and** offers a "range around this" chip, rather than guessing. This is the only overload of the search field, and it is explicit.

**Not supported.** Fuzzy matching, wildcards, boolean operators, saved searches. Each would add UI weight for a use case this product does not have.

## 2. Filters

| Filter | Values | Default | Used by |
|---|---|---|---|
| Period | This month · Last month · Choose month · Custom range | This month | S-07, all reports |
| Account | Multi-select of non-archived accounts; "All" | All | S-07, S-12, R-01 |
| Category | Multi-select; "All" | All | S-07, drill-downs |
| Kind | Spent · Received · Moved · Money back · Corrections | All | S-07 |
| Payee | Single, set by drill-down | None | S-33 |
| Amount range | Min and/or max | None | S-07 |

**Combination.** Filters combine with AND; multi-select values within one filter combine with OR. Search text combines with AND over the filtered set.

**Period resolution.** All periods respect `preferences.month_start_day`. The resolved date range is always displayed as text beneath the selector, so "this month" is never ambiguous.

**Archived accounts.** Excluded by default; a "Include archived" toggle appears only when the user has at least one archived account, so it never clutters an account that has none.

**Corrections.** Included by default in the transaction list and clearly styled, because hiding them would contradict the explainability guarantee. They can be filtered out via the Kind filter.

**Presentation.** Active filters render as removable chips above the list with a Clear all action and a live result count.

**Persistence.** Filter and search state persists within a session and survives back-navigation and tab switching (doc 09 §7). It resets on app restart, so a user never returns to a mysteriously filtered list days later.

## 3. Sort

| Context | Default | Alternatives |
|---|---|---|
| Transaction list | Date descending, then `created_at` descending | Date ascending · Amount descending · Amount ascending |
| Category breakdown | Amount descending | Name · Share |
| Payee drill-down | Amount descending | Date · Frequency |
| Accounts list | User `sort_order` | — (manual drag only) |
| Categories list | User `sort_order` | — (manual drag only) |
| Commitments | Next due ascending | Amount descending |
| Limits | Percentage used descending | Category name |

Sorting never changes totals; the header total is always the sum of the filtered set regardless of order.

## 4. Empty and no-result states

| Situation | Message |
|---|---|
| No transactions at all | "Your transactions will appear here." + Add action |
| Filters exclude everything | "No transactions match. Clear filters?" + one-tap reset |
| Search returns nothing | "Nothing found for '<term>'." + Clear search |
| Period has no data but others do | "Nothing recorded in this period." + jump to the most recent period containing data |

The last case matters: a user browsing to an empty month should be helped forward, not left staring at a blank screen wondering whether the app broke.

## 5. Drill-down as filter

Every drill-down is implemented as a filter specification applied to the transaction list, which is why L3 always reconciles to its L1 figure by construction:

| Drill-down | Filter |
|---|---|
| Report total | `{period}` |
| Category row | `{period, category}` |
| Payee row | `{period, category?, payee}` |
| Account balance | `{account}`, all time, running balance shown |
| Limit | `{period, category, kind: out}` |
| Commitment | `{commitment_id}` |
| Insight | The insight's own stored filter specification |

The filter chips are visible after a drill-down, so the user can always see — and loosen — the scope that produced the number they tapped.

## 6. Performance expectations

| Operation | 1k | 10k | 50k | 100k |
|---|---|---|---|---|
| Filter by period + category | <20 ms | <40 ms | <90 ms | <150 ms |
| Text search (debounced) | <30 ms | <60 ms | <150 ms | <300 ms |
| Sort a filtered set | <10 ms | <30 ms | <80 ms | <150 ms |
| First page render | <100 ms | <120 ms | <180 ms | <250 ms |

Supported by `idx_tx_date`, `idx_tx_category_date`, `idx_tx_account_date`, `idx_tx_payee`, and `idx_tx_kind_date` (doc 03). Lists are virtualised and paged at 50 rows. Above 50k transactions, text search runs against an in-memory payee index built at startup rather than scanning notes on every keystroke; note search remains a filtered scan over the already-narrowed set.
