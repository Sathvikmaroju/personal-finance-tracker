# 27 — Database Migration Strategy

Assume real user data with no cloud copy. A failed migration on this product is not a degraded experience — it is the permanent loss of a person's financial history. Every rule below follows from that.

---

## 1. Versioning

`app_meta.schema_version` is a single monotonically increasing integer, owned by the data layer. It is written into every backup and every CSV export header, so any exported artefact can be matched to the schema that produced it.

Version 1 is the first released schema. Versions are never reused, never skipped in the migration chain, and never branched.

**Forward-only.** The app migrates `n → n+1 → … → current`. There are no downgrade migrations, because a downgrade would have to discard data added by the newer version, and silently discarding financial data is not an acceptable behaviour.

**Newer database refused.** A database whose `schema_version` exceeds the binary's is not opened. The user sees "This data was created by a newer version of the app" with a link to update — never a partial read, never a best-effort parse.

## 2. Principles

1. **Additive first.** Prefer adding a nullable column or a new table to altering or dropping. Most product evolution can be expressed additively.
2. **Never mutate historical money.** No migration may alter an existing `amount_paise`, `date`, `kind`, or account reference on a transaction. If a value must be reinterpreted, add a new column and derive.
3. **Every migration is reversible in effect, not in schema.** Rollback is achieved by restoring the pre-migration backup (§5), not by writing a down-migration.
4. **Migrations are pure SQL plus deterministic data transforms.** No network, no clock-dependent logic, no randomness.
5. **Validate after every step**, not just at the end, so a failure names the migration that caused it.
6. **Balances must be identical before and after.** This is the single acceptance criterion that matters most (§4).

## 3. Mechanics

On open, if `stored_version < binary_version`:

1. **Pre-flight.** Verify integrity (`integrity_check`, `foreign_key_check`) and assert INV-01 for every account. A database that is already broken is not migrated — it routes to recovery (doc 14 §9).
2. **Capture the fingerprint.** Record every account's balance, the transaction count, and per-month spend totals.
3. **Automatic safety backup.** Write a full backup labelled `pre-migration-v<n>` to app-private storage. This is not the user's backup and is not user-managed.
4. **Migrate**, one version at a time, each inside its own database transaction.
5. **Validate after each step:** foreign keys intact, all CHECK constraints satisfied, INV-01 holds for every account, row counts reconcile.
6. **Compare the fingerprint.** Every account balance, the transaction count, and every monthly total must match exactly. A single paise of drift aborts.
7. **Commit** the new `schema_version`; discard rollup caches and rebuild lazily.
8. **On any failure:** roll back the step, restore the safety backup, open in recovery mode with a plain-language explanation, and retain the safety backup for support.

The safety backup is deleted only after the app has run successfully for seven days on the new version.

## 4. Validation

| Check | Requirement |
|---|---|
| Balance identity | Every account's balance is bit-identical before and after |
| Row counts | Match the pre-migration fingerprint per table, allowing for intentional additions |
| Monthly totals | Every month's Spent, Received and Kept unchanged |
| Foreign keys | `foreign_key_check` returns empty |
| Constraints | Every CHECK satisfied on every row |
| Invariants | INV-01…INV-17 hold across the whole database |
| Report equivalence | Doc 23 golden datasets produce identical report output before and after |

The last check is the strongest: migration correctness is measured by whether the user's *reports* are unchanged, not merely whether the schema parsed.

## 5. Rollback

There is no down-migration. Recovery is by restoring the automatic safety backup taken at step 3, which returns the user to the exact pre-migration state. The app then refuses to migrate again on that build and surfaces the failure reason, so a defective release cannot loop a user through repeated failed attempts.

## 6. Backward compatibility with files

| Artefact | Older than current | Newer than current |
|---|---|---|
| Backup | Migrated forward in memory, then restored and validated | **Refused**, version named |
| CSV | Missing columns take defaults; the header's version is recorded | **Refused**, version named |
| Unknown extra CSV columns | Ignored with a warning, so external tooling may annotate files harmlessly | — |

A backup from any released version must remain restorable indefinitely. This obligation constrains schema evolution: a column may be added or deprecated, but the migration chain from version 1 must always be complete and tested (doc 23 D-15).

## 7. Future evolution

Anticipated changes and how they are handled additively:

| Change | Approach |
|---|---|
| P2 split transactions | Reuse `group_id`; no schema change to existing rows |
| P2 encryption at rest | Storage-level, not schema-level; a re-key operation, not a migration |
| New metric or report | Derived only — no schema change |
| New account subtype | Extend the CHECK constraint; existing rows untouched |
| New commitment cadence | Extend the enum; regenerate occurrences forward only |
| Deprecating a column | Stop writing it, keep reading it, drop it only after two released versions and only once no supported backup depends on it |

**Never permitted:** changing the meaning of an existing column, repurposing a value in an enum, altering paise scale, or renaming an ID. Each would silently reinterpret history.

## 8. Testing

- **Chain test.** Migrate from every released version to current, using doc 23 D-15's stored backups, asserting the §4 checks each time (T-122).
- **Idempotence.** Running a migration twice is impossible by version guard; the guard itself is tested.
- **Interruption.** Kill the process mid-migration; the next open must find either the pre-migration state or a clean completed state, never a half-migrated database (T-127).
- **Large data.** Migration on the 100k dataset completes within the doc 21 budget and shows progress beyond two seconds.
- **Refusal paths.** Newer-version database and newer-version backup both refuse cleanly with the correct message (T-118).

## 9. Release discipline

No release ships a schema change without: a migration from the immediately previous version, a test in the chain suite, a stored D-15 backup for the new version, and a fingerprint comparison run against all doc 23 datasets. A schema change without these is blocked at the release gate (doc 31).
