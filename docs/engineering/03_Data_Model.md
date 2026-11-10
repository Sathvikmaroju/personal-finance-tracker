# 03 — Complete Data Model

Production local schema. Target: SQLite (via a typed ORM). Money is **always** `INTEGER` paise; no floating-point type appears anywhere in the money path (INV-15). All timestamps are ISO-8601 local with offset. All IDs are UUIDv4 `TEXT` so that CSV round-trips and backups remain stable across devices.

---

## 1. `accounts`

| Field | Type | Null | Default | Validation |
|---|---|---|---|---|
| `id` | TEXT PK | No | uuid | UUIDv4 |
| `name` | TEXT | No | — | 1–40 chars, trimmed, unique among non-archived |
| `icon` | TEXT | No | `'wallet'` | From icon set |
| `class` | TEXT | No | — | `asset` \| `owed` |
| `subtype` | TEXT | No | — | asset: `cash,bank,upi_wallet,savings` · owed: `card,loan` |
| `counts_as_available` | INTEGER(bool) | No | 1 | Must be 0 when `class='owed'` |
| `due_day` | INTEGER | Yes | NULL | 1–31; only when `class='owed'` |
| `is_system` | INTEGER(bool) | No | 0 | 1 only for `StartingBalance`, `Outside` |
| `is_archived` | INTEGER(bool) | No | 0 | Cannot be 1 when `is_system=1` |
| `sort_order` | INTEGER | No | next | — |
| `created_at` | TEXT | No | now | — |
| `updated_at` | TEXT | No | now | — |

**Indexes:** `idx_accounts_active (is_archived, sort_order)`.
**Unique:** `uq_accounts_name_active` on `LOWER(name)` where `is_archived=0`.
**Delete behaviour:** permitted only when the account has no transactions other than its `start`; otherwise `RESTRICT`.
**Archive behaviour:** permitted only when computed balance = 0 (EX-01). Archived accounts retain all history, are excluded from *Money available*, and cannot be selected for new transactions.
**Seed rows:** `StartingBalance` and `Outside`, both `is_system=1`, `counts_as_available=0`, never listed in account pickers.

---

## 2. `categories`

| Field | Type | Null | Default | Validation |
|---|---|---|---|---|
| `id` | TEXT PK | No | uuid | — |
| `name` | TEXT | No | — | 1–30 chars, unique case-insensitively |
| `icon` | TEXT | No | `'tag'` | From icon set |
| `kind` | TEXT | No | — | `in` \| `out` |
| `essential_default` | INTEGER(bool) | No | 0 | Only meaningful when `kind='out'` |
| `repeating_default` | INTEGER(bool) | No | 0 | Only meaningful when `kind='out'` |
| `is_system` | INTEGER(bool) | No | 0 | `Not recorded`, `Interest & charges` |
| `sort_order` | INTEGER | No | next | — |
| `created_at` / `updated_at` | TEXT | No | now | — |

**Unique:** `uq_categories_name` on `LOWER(name)`.
**Delete behaviour:** `RESTRICT` if any transaction, commitment, or limit references it. A **merge** operation reassigns all references to a target category, then deletes the source, in one atomic write.
**Seed:** out — Food & Groceries*, Eating Out, Transport, Home & Rent*, Bills & Utilities*, Health*, Shopping, Entertainment, Subscriptions, Family & Gifts, EMI & Loans*†, Other (`*` = essential default, `†` = repeating default). in — Salary, Other Income. System — `Not recorded`, `Interest & charges`†.

---

## 3. `payees`

| Field | Type | Null | Default | Validation |
|---|---|---|---|---|
| `id` | TEXT PK | No | uuid | — |
| `name` | TEXT | No | — | 1–60 chars as typed |
| `normalized_name` | TEXT | No | derived | lowercase, collapse whitespace, strip punctuation |
| `usual_category_id` | TEXT FK→categories | Yes | NULL | `SET NULL` on delete |
| `times_used` | INTEGER | No | 0 | ≥ 0 |
| `first_seen` / `last_seen` | TEXT | No | now | — |

**Unique:** `uq_payees_normalized` on `normalized_name`.
**Index:** `idx_payees_lookup (normalized_name)`, `idx_payees_frequency (times_used DESC)`.
**Delete behaviour:** allowed; referencing transactions set `payee_id = NULL`. A **merge** reassigns transactions then deletes the source.
**Maintenance:** `usual_category_id` is set once a payee has ≥2 transactions sharing one category; recomputed on each new transaction.

---

## 4. `transactions`

The central table. Constraints are expressed as CHECK clauses so invalid financial states are hard to represent.

| Field | Type | Null | Default | Validation |
|---|---|---|---|---|
| `id` | TEXT PK | No | uuid | — |
| `kind` | TEXT | No | — | `out,in,move,back,correction,start` |
| `amount_paise` | INTEGER | No | — | > 0 always |
| `date` | TEXT (date) | No | — | Not more than 1 day in the future |
| `time` | TEXT | Yes | NULL | — |
| `from_account_id` | TEXT FK→accounts | Yes | NULL | Per-kind rule below |
| `to_account_id` | TEXT FK→accounts | Yes | NULL | Per-kind rule below |
| `category_id` | TEXT FK→categories | Yes | NULL | Per-kind rule below |
| `payee_id` | TEXT FK→payees | Yes | NULL | Always optional |
| `note` | TEXT | Yes | NULL | ≤ 200 chars |
| `essential` | INTEGER(bool) | Yes | from category | Non-null **iff** `kind='out'` |
| `repeating` | INTEGER(bool) | Yes | from category | Non-null **iff** `kind='out'` |
| `back_of_id` | TEXT FK→transactions | Yes | NULL | Non-null **iff** `kind='back'` |
| `commitment_id` | TEXT FK→commitments | Yes | NULL | `SET NULL` on delete |
| `group_id` | TEXT | Yes | NULL | Shared by records from one user action (EX-03) |
| `outside_label` | TEXT | Yes | NULL | Only when a side is `Outside`; ≤ 40 chars |
| `exclude_from_typical` | INTEGER(bool) | No | 0 | UI to set it is P1 |
| `created_at` / `updated_at` | TEXT | No | now | — |

### Per-kind account and category rules (CHECK constraints)

| Kind | `from_account_id` | `to_account_id` | `category_id` |
|---|---|---|---|
| `out` | required | must be NULL | required |
| `in` | must be NULL | required | required |
| `move` | required | required, ≠ from | must be NULL |
| `back` | must be NULL | required | must be NULL (inherits parent's) |
| `correction` | exactly one of from/to set | | required = `Not recorded` |
| `start` | required = `StartingBalance` | required | must be NULL |

Additional CHECKs: `amount_paise > 0` · `essential IS NULL` unless `kind='out'` · `repeating IS NULL` unless `kind='out'` · `back_of_id IS NULL` unless `kind='back'` · `from_account_id <> to_account_id`.

**Application-enforced (not expressible as CHECK):** cumulative `back` against a parent ≤ parent amount · `back_of_id` must reference a transaction of kind `out` · `Outside` may not appear on both sides.

**Indexes:**
`idx_tx_date (date DESC)` · `idx_tx_account_date (from_account_id, date)` and `(to_account_id, date)` · `idx_tx_category_date (category_id, date)` · `idx_tx_payee (payee_id)` · `idx_tx_kind_date (kind, date)` · `idx_tx_back_of (back_of_id)` · `idx_tx_group (group_id)` · `idx_tx_commitment (commitment_id)`.

**Delete behaviour:**
- `out` with linked `back` records → cascade **on explicit confirmation** naming each linked record.
- `move` → single row; deletion restores both balances atomically (INV-11).
- Any record with a `group_id` → the whole group is deleted as a unit.
- `start` → deletable only with its account.
- `correction` → deletable; the linked `BalanceCheck.outcome` reverts to `ignored`.

**Update behaviour:** changing `kind` nulls every field the new kind forbids, in the same write. Any create/update/delete triggers recomputation (doc 15) and marks affected closed periods **revised**.

**Audit:** `created_at` is immutable; `updated_at` is set on every write. No soft delete — deletion is real, because a ledger with hidden rows cannot satisfy INV-01 legibly.

---

## 5. `commitments`

| Field | Type | Null | Default | Validation |
|---|---|---|---|---|
| `id` | TEXT PK | No | uuid | — |
| `name` | TEXT | No | — | 1–40 chars |
| `payee_id` | TEXT FK→payees | Yes | NULL | `SET NULL` |
| `category_id` | TEXT FK→categories | No | — | `RESTRICT` |
| `account_id` | TEXT FK→accounts | Yes | NULL | `SET NULL` |
| `expected_amount_paise` | INTEGER | No | — | > 0 |
| `cadence` | TEXT | No | — | `monthly,quarterly,annual,custom_days` |
| `cadence_days` | INTEGER | Yes | NULL | Required iff `cadence='custom_days'`; ≥ 1 |
| `next_due` | TEXT (date) | No | — | Required while `is_active=1` |
| `is_active` | INTEGER(bool) | No | 1 | — |
| `source` | TEXT | No | `user_added` | `user_added` \| `detected` |
| `created_at` / `updated_at` | TEXT | No | now | — |

## 6. `commitment_amount_history`

`id` PK · `commitment_id` FK (CASCADE) · `amount_paise` · `effective_from` (date) · `created_at`. Appended whenever `expected_amount_paise` changes; drives the price-change alert (F-30).

## 7. `commitment_occurrences`

`id` PK · `commitment_id` FK (CASCADE) · `due_date` · `expected_amount_paise` · `status` (`upcoming,matched,overdue,skipped`) · `matched_transaction_id` FK→transactions (`SET NULL`) · `matched_at`.
**Unique:** `uq_occurrence (commitment_id, due_date)`.
**Invariant:** a transaction may match at most one occurrence; an occurrence matches at most one transaction (INV-08). Occurrences are generated lazily up to a 12-month horizon.

## 8. `spending_limits`

`id` PK · `category_id` FK (`RESTRICT`) · `amount_paise` (> 0) · `is_active` · `created_at` / `updated_at`.
**Unique:** `uq_limit_active (category_id)` where `is_active=1`.
**Validation:** the category must have `repeating_default = 0`.

## 9. `balance_checks`

`id` PK · `account_id` FK (`CASCADE`) · `checked_at` · `user_reported_paise` · `app_balance_paise` · `difference_paise` (signed) · `outcome` (`corrected,ignored`) · `resulting_transaction_id` FK→transactions (`SET NULL`) · `undone_at` (nullable).
**Index:** `idx_bc_account_time (account_id, checked_at DESC)`.
**Rule:** editing the resulting transaction's amount updates `difference_paise` atomically (EX-05).

## 10. `preferences`

Single row, `id = 1`. `decimals` (0–2, default 2) · `month_start_day` (1–28, default 1) · `theme` (`system,light,dark`) · `passcode_hash` (nullable, P1) · `biometric_enabled` (P1) · `buffer_paise` (default 0) · `notification_settings` (JSON) · `schema_version` · `last_backup_at`.

## 11. `app_meta`

`key` PK · `value`. Holds `schema_version`, `install_id` (local only, never transmitted), `last_migration_at`.

---

## 12. Relationship summary

| Relationship | Cardinality | Delete rule |
|---|---|---|
| Account → Transaction (from/to) | 1 : n | RESTRICT (archive instead) |
| Category → Transaction | 1 : n | RESTRICT (merge instead) |
| Payee → Transaction | 1 : n | SET NULL |
| Transaction → Transaction (`back_of`) | 1 : n | CASCADE on confirmation |
| Transaction ↔ Transaction (`group_id`) | n : n via group | Group deleted as a unit |
| Commitment → Occurrence → Transaction | 1 : n : 0..1 | CASCADE / SET NULL |
| Category → SpendingLimit | 1 : 0..1 active | RESTRICT |
| Account → BalanceCheck → Transaction | 1 : n : 0..1 | CASCADE / SET NULL |

## 13. Migration considerations

Schema version is stored in `app_meta` and mirrored in every backup and CSV export. Migrations are forward-only, additive-first, and validated post-run (doc 27). New columns must be nullable or carry defaults so that older backups restore cleanly. No migration may alter historical `amount_paise` or `date` values.
