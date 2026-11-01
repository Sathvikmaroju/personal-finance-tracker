# 14 — Local Storage & Persistence

The database is the only source of truth. Everything the user sees is derived from it (doc 15). It must survive interrupted writes, corruption, restore, and migration without ever producing a balance that violates INV-01.

---

## 1. Storage engine

**SQLite**, on-device, in the app's private storage. Chosen for correctness rather than fashion: it gives ACID transactions, CHECK constraints, foreign keys, and integer arithmetic — all four of which the financial model depends on. A key-value or document store would push referential integrity into application code, where doc 05's invariants would be far harder to guarantee.

**Configuration.** `PRAGMA foreign_keys = ON` (mandatory; enforced at every connection open) · `journal_mode = WAL` · `synchronous = FULL` for writes touching money · `busy_timeout = 5000`.

**No second store for money.** Preferences may live in a lightweight key-value store, but no monetary value, transaction, or account may exist outside SQLite.

## 2. Write model

Every user action that produces one or more rows is a **single database transaction**. Partial writes are impossible by construction.

| Action | Rows written | Atomicity requirement |
|---|---|---|
| Simple expense | 1 | Trivial |
| Move | 1 | Trivial |
| Loan repayment with interest | 2 (shared `group_id`) | Both or neither (EX-03) |
| Balance check → correction | 2 (`balance_checks` + transaction) | Both or neither |
| Category merge | n updates + 1 delete | All or nothing |
| Account archive with balance move | 1 move + 1 account update | Both or neither |
| Restore | full replace | Staged, then swapped |
| CSV import | n inserts | Single transaction; all-or-nothing per confirmed batch |

**Post-write assertion.** After every money-affecting commit, the domain layer re-derives the balances of touched accounts and asserts INV-01. A failure rolls back, surfaces a plain-language error, and writes to the local diagnostics log.

## 3. Referential integrity

Enforced by foreign keys with explicit behaviours (doc 03 §12): `RESTRICT` for accounts and categories (archive and merge exist precisely so deletion is never needed), `SET NULL` for payees and commitment links, application-level cascade with confirmation for `back_of_id` and `group_id`.

Constraints expressible in schema are CHECK constraints, not application checks, so invalid states cannot be written even by a defective code path. The three rules that cannot be expressed in SQL — cumulative refunds ≤ parent, parent must be an `out`, `Outside` not on both sides — are enforced in the domain layer and covered by tests.

## 4. Schema versioning

`app_meta.schema_version` is the single authority. It is written into every backup and CSV export header. The app refuses to open a database whose version exceeds the binary's known version, showing "This data was created by a newer version of the app" rather than risking a lossy downgrade.

Migration mechanics are specified in doc 27.

## 5. Backup

**Format.** A single file containing a full logical dump: metadata header (`schema_version`, `app_version`, `created_at`, row counts, integrity checksum) plus all rows of every table.
**Write procedure.** Serialise to a temporary file → verify by re-reading and comparing the checksum and row counts → atomically rename into place. An interrupted backup therefore leaves either the previous good file or no new file, never a truncated one.
**Location.** User-selected local directory via the system file picker. No cloud provider is integrated; if the user chooses a synced folder, that is their decision, made explicitly.
**Scheduling.** A local reminder only — the app never writes a backup silently to a location the user did not choose.

## 6. Restore

1. Read the header; validate `schema_version` ≤ current and the checksum.
2. Migrate the payload forward in memory if the version is older.
3. Write into a **staging database** file.
4. Validate the staged database: foreign keys intact, all CHECK constraints satisfied, INV-01 holds for every account, row counts match the header.
5. Only then swap the staging file into place atomically and reopen.

The live database is never mutated until step 5. A failure at any step leaves the existing data untouched and reports the specific reason.

**Semantics.** Restore **replaces** all data; the confirmation states this explicitly and shows the backup's date and transaction count.

## 7. Import (CSV)

Additive, never destructive. Detailed contract in doc 16. Persistence requirements: the entire confirmed batch is one transaction; rows failing validation are excluded and reported with row numbers; ID collisions are skipped rather than overwritten, so re-importing an export can never duplicate data.

## 8. Recovery after interrupted writes

WAL plus full synchronous means an interrupted commit is rolled back by SQLite on next open. On startup the app additionally:
1. Runs `PRAGMA integrity_check` and `PRAGMA foreign_key_check`.
2. Re-derives balances for all accounts and asserts INV-01.
3. Verifies that no `back` record exceeds its parent and no orphan `group_id` singleton exists where a group is expected.

Failures route to the recovery flow (§9) rather than crashing.

## 9. Corrupted data handling

**Detection.** Integrity check failure, foreign-key violation, or an INV-01 assertion failure at startup.
**Response.** The app opens in a read-only recovery screen offering, in order: export the readable data to CSV (best-effort salvage) · restore from the most recent backup · reset the database. It never silently repairs financial data, because a silent repair is indistinguishable to the user from a wrong number.
**Reporting.** The reason and affected tables are written to the local diagnostics log and shown to the user in plain language.

## 10. Data validation layers

| Layer | Enforces | Examples |
|---|---|---|
| Schema (CHECK, FK, UNIQUE, NOT NULL) | Structural impossibility | `amount_paise > 0`; per-kind account rules; one active limit per category |
| Domain layer | Financial rules not expressible in SQL | Cumulative refunds ≤ parent; forced move classification; archive-at-zero |
| Post-write assertion | Invariants | INV-01 on touched accounts |
| Startup check | Whole-database health | integrity, FK, balances |
| Import/restore validation | Foreign data | header, checksum, staged validation |

## 11. Offline guarantee

No storage path touches the network. There is no remote database, no sync engine, no cloud backup integration, no telemetry upload, and no license or entitlement check. The app is fully functional with the device in airplane mode from install to uninstall, including backup, restore, export, and import — all of which operate on local files chosen by the user.

## 12. Storage footprint

At 100,000 transactions, the database is approximately 25–35 MB including indexes; a backup file is of comparable size. Monthly rollup caches (doc 15) add under 1 MB. These figures inform the performance targets in doc 21 and are verified in the test data scenarios of doc 23.
