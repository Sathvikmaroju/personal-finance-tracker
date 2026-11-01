# 16 — Backup / Import / Export (Data Portability)

Data portability is part of the ownership model, never a paid feature. Both artefacts are free, local, and unrestricted.

Two artefacts with different jobs, and the distinction is deliberate:

| | **Backup** | **CSV** |
|---|---|---|
| Job | Recovery | Inspection, spreadsheet use, and re-import |
| Fidelity | Lossless, complete | Complete for transactions; readable |
| Semantics | **Replaces** all data | **Additive** merge |
| Contains | Every table | Transactions (plus reference sheets) |
| Guarantee | Byte-equivalent restore | Round-trip identity (T-73) |

---

## 1. CSV export

**Scope options.** All transactions, or a chosen period. The chosen scope is written into the header comment.

**Header.** A single comment line precedes the column row:
`# personal-finance-tracker,schema_version=<n>,app_version=<v>,exported_at=<iso>,scope=<all|period>,rows=<n>`

**Columns (fixed order, always all present):**
```
id, date, kind, amount_paise, from_account_id, from_account_name,
to_account_id, to_account_name, category_id, category_name,
payee_id, payee_name, note, essential, repeating,
back_of_id, commitment_id, group_id, outside_label,
exclude_from_typical, created_at, updated_at
```

**Rules.**
- **IDs are authoritative; names are informational.** Names exist so a spreadsheet is readable; they are never used to resolve references on import (this is why renaming an account cannot break a round trip).
- `amount_paise` is an integer. No currency symbol, no grouping, no decimal point — this is the machine column.
- Booleans are `true` / `false`; empty cells are genuinely empty, never `null` or `0`.
- Encoding UTF-8 with BOM (so Indian-language payee names open correctly in Excel); RFC 4180 quoting; `\r\n` line endings.
- Derived values are **never** exported. There is no balance column, no category share, no typical. Exporting a derived figure would create a second, forkable source of truth.

**Reference sheets.** Alongside the transactions file, export writes `accounts.csv`, `categories.csv`, `payees.csv`, and `commitments.csv` with their own IDs and fields, so that an import into an empty database can reconstruct references. All four are optional on import.

## 2. CSV import

**Mode.** Additive. Import never deletes and never overwrites.

**Procedure.**
1. Read and validate the header. A missing header is tolerated with a warning; a `schema_version` newer than the app's is refused.
2. Parse rows, validating each independently.
3. Resolve references **by ID**. If an ID is absent from the database and from the accompanying reference sheets, the row is invalid — the importer never invents an account or category, and never matches by name.
4. Present a **preview**: new rows, skipped rows (ID already present), invalid rows with row numbers and reasons.
5. On confirmation, insert the valid subset in a **single database transaction**.
6. Rebuild rollups and reassert INV-01 for every touched account.

**Duplicate handling.** A row whose `id` already exists is **skipped**, never updated. This is what makes re-importing an export a no-op and guarantees that a nervous user re-running an import cannot double their spending.

**Validation per row.**

| Check | Failure handling |
|---|---|
| `id` is a valid UUID | Invalid — reported |
| `kind` in the six kinds | Invalid |
| `amount_paise` positive integer | Invalid |
| `date` parseable, ≤ tomorrow | Invalid |
| Per-kind account and category rules (doc 03 §4) | Invalid, with the specific rule named |
| Referenced IDs resolvable | Invalid — missing reference named |
| `back_of_id` resolves to an `out`, cumulative refunds ≤ parent | Invalid |
| `group_id` members all present in the batch or the database | Invalid — partial groups are refused (EX-03) |

**Ordering.** The importer topologically orders rows so parents precede refunds and group members arrive together, regardless of file order.

**Error reporting.** A results screen lists every invalid row by number with a plain-language reason, and offers to export the failures as their own CSV for correction. The user may proceed with the valid subset.

## 3. Round-trip guarantee

**Requirement (T-73).** `export → import into an empty database → export` produces byte-identical transaction files, ignoring the header's `exported_at`.

**Requirement (T-74).** `export → import into the same database` inserts zero rows and reports every row as skipped.

Both are mandatory CI tests, run against all datasets in doc 23.

## 4. Backup

**Format.** One file: metadata header + a complete logical dump of every table.
**Header fields.** `schema_version`, `app_version`, `created_at`, per-table row counts, and a content checksum.
**Write.** Serialise to a temporary file → re-read and verify checksum and counts → atomic rename. An interrupted backup leaves the previous good file or nothing, never a truncated file.
**Excluded.** Monthly rollups and any other cache (doc 15 §5), because a cache in a backup is a stale value waiting to be restored.
**Location.** A user-chosen local directory via the system picker. No cloud integration exists; if the user picks a synced folder, that is an explicit choice of theirs.

## 5. Restore

Staged and validated before anything is replaced:
1. Validate header, `schema_version` ≤ current, checksum.
2. Migrate the payload forward in memory if older.
3. Write to a staging database.
4. Validate the staging database: foreign keys, CHECK constraints, INV-01 for every account, row counts against the header.
5. Atomic swap, reopen, rebuild rollups.

The live database is untouched until step 5. Any failure reports the specific reason and changes nothing.

**Semantics.** Restore **replaces** all data. The confirmation says so explicitly and shows the backup's date and transaction count. There is no merge-restore; merging is what CSV import is for, and offering both would blur two very different guarantees.

## 6. Version compatibility

| Situation | Behaviour |
|---|---|
| Backup older than current schema | Migrated forward in memory, then restored |
| Backup newer than current schema | **Refused** — "This backup was created by a newer version" |
| CSV older | Missing columns default; extra known columns ignored |
| CSV newer | Refused with the version named |
| Unknown extra columns | Ignored with a warning, so third-party tooling can annotate files harmlessly |

Migration mechanics: doc 27.

## 7. Missing references and invalid records

The importer resolves only by ID and never fabricates entities. A transaction referencing an unknown account is invalid; it is reported, not silently attached to a default account. Optional references (`payee_id`, `commitment_id`) that cannot be resolved are set to `NULL` with a warning rather than failing the row, because neither affects a balance.

## 8. Recovery paths

| Failure | Recovery |
|---|---|
| Corrupt database | Recovery screen: salvage to CSV → restore from backup → reset (doc 14 §9) |
| Backup write interrupted | Previous file intact; retry |
| Restore validation fails | Live data untouched; reason named |
| Import partially valid | Proceed with the valid subset; failures exportable for correction |
| Device lost | Only the user's own backup file can recover the data — stated plainly at onboarding and in Settings → About, because with no cloud there is no other path |

## 9. What is deliberately absent

No cloud backup, no account, no sync, no share-to-service integration, no proprietary encrypted container that only this app can read. The backup format is documented in this specification precisely so the user's data outlives the app.
