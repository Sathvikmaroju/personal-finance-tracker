# 26 — Domain & Service Contracts

Interfaces between presentation, application, domain, and data. Types are expressed language-neutrally; `Money` is always integer paise.

**Universal conventions**
- Every mutating operation returns `Result<T, DomainError>` — never throws for expected failure conditions.
- Every mutating operation is atomic (doc 25 §4) and re-asserts invariants before commit.
- Reads never mutate. Writes always bump `canonical_version`.
- No service accepts or returns a database row type, a UI type, or a formatted string. Formatting belongs to presentation.

**`DomainError` taxonomy**
`ValidationError(field, rule, message)` · `NotFound(entity, id)` · `ConstraintViolation(rule)` · `InvariantViolation(invariant, detail)` · `ReferenceInUse(entity, count)` · `InsufficientData(requirement)` · `StorageError(cause)` · `ImportError(row, reason)`.

Every error carries a plain-language `message` suitable for direct display (doc 18 §5) and a machine `rule` for tests.

---

## 1. TransactionService

```
record(cmd: RecordTransactionCommand): Result<TransactionId>
edit(id, cmd: EditTransactionCommand): Result<Unit>
delete(id, cascadeConfirmed: Bool): Result<DeleteOutcome>
recordMoneyBack(parentId, amount: Money, date, account): Result<TransactionId>
```

**`RecordTransactionCommand`** — `chip: Spent|Received|Moved`, `amount: Money`, `date`, `time?`, `accountId`, `destinationAccountId?`, `categoryId?`, `payeeName?`, `note?`, `essential?`, `repeating?`, `interestAmount?`, `outsideLabel?`.

**Preconditions.** Amount > 0 · accounts exist and are not archived or system · per-kind rules of doc 03 §4 · date ≤ tomorrow.
**Side effects.** Creates one row, or two sharing a `group_id` when `interestAmount > 0` (doc 04 §7.2). Resolves or creates the payee. Attempts commitment matching. Recomputes affected balances and periods. Marks affected closed periods revised.
**Errors.** `ValidationError` for each rule; `ConstraintViolation("archive_account_selected")`; `ConstraintViolation("self_transfer")`.
**Atomicity.** One transaction covering all rows and the payee upsert.
**Example.** `record(Moved, ₹12,000, Bank→Loan, interestAmount ₹1,500)` → two rows, one group; Bank −12,000; owed −10,500; Spent +1,500.

**`delete`** returns `DeleteOutcome { deletedIds, linkedDeleted }`. When linked records exist and `cascadeConfirmed = false`, it returns `ReferenceInUse` with the count so the UI can name them in the confirmation.

**`recordMoneyBack`** enforces cumulative refunds ≤ parent (INV-06) and rejects a parent that is not an `out`.

## 2. AccountService

```
create(cmd: CreateAccountCommand): Result<AccountId>
update(id, cmd): Result<Unit>
archive(id): Result<ArchiveOutcome>
unarchive(id): Result<Unit>
delete(id): Result<Unit>
listWithBalances(includeArchived: Bool): List<AccountWithBalance>
balance(id): Money
```

**`create`** requires a starting balance; for owed accounts the value is the amount currently owed and is stored so the resulting balance is negative. Writes the account and its `start` transaction in one transaction.
**`archive`** returns `ArchiveOutcome.RequiresBalanceMove(remaining: Money)` when the balance is non-zero (EX-01); the UI then routes to a move and retries. Never silently archives money.
**`delete`** returns `ReferenceInUse` unless the account has no transactions other than `start`.
**Invariant.** `listWithBalances` results satisfy INV-01 individually and sum to M-02 exactly for available assets.

## 3. CategoryService

```
create(cmd): Result<CategoryId>
update(id, cmd): Result<Unit>
merge(sourceId, targetId): Result<MergeOutcome>
delete(id): Result<Unit>
list(kind?): List<Category>
```
**`merge`** reassigns every transaction, commitment and limit reference in one transaction and returns the reassigned count. Not undoable; the UI must say so first.
**`update`** changing `essential_default` does **not** retroactively alter existing transactions (T-102); the caller may separately offer a bulk update scoped to the current period.
**`delete`** returns `ReferenceInUse` when referenced; system categories return `ConstraintViolation("system_category")`.

## 4. PayeeService

```
resolveOrCreate(name): PayeeId
suggest(prefix, limit): List<PayeeSuggestion>
merge(sourceId, targetId): Result<Int>
setUsualCategory(id, categoryId?): Result<Unit>
```
`suggest` ranks by `times_used` and requires ≥3 characters. `resolveOrCreate` matches on `normalized_name` (local folding only — never an external merchant database).

## 5. CommitmentService

```
create(cmd): Result<CommitmentId>
update(id, cmd): Result<Unit>
deactivate(id): Result<Unit>
listActive(): List<CommitmentWithStatus>
occurrences(id, window): List<Occurrence>
linkManually(occurrenceId, transactionId): Result<Unit>
detectSuggestions(): List<CommitmentSuggestion>          // P1
```
**Matching.** On every new `out`, the service attempts a match within ±7 days and ±20% (doc 07 §7). A manual link is canonical and is never overwritten by automatic matching (doc 15 §6).
**Price change.** An amount differing from the last recorded value appends to history and emits a price-change event (P1).
**`detectSuggestions`** never creates a commitment; it returns candidates with the evidence that produced them.
**Invariant.** INV-08 — one occurrence, one state, one matched transaction.

## 6. LimitService

```
create(categoryId, amount): Result<LimitId>
update(id, amount): Result<Unit>
delete(id): Result<Unit>
suggestAmount(categoryId): Result<Money>    // from the user's own median
listWithProgress(period): List<LimitProgress>
```
**Preconditions.** Category is flexible (`repeating_default = false`) — otherwise `ConstraintViolation("limit_on_repeating_category")` with a message pointing to commitments. One active limit per category.
**`suggestAmount`** returns `InsufficientData("3 qualifying months")` below the threshold rather than a guess.

## 7. BalanceCheckService

```
prepare(accountId): BalanceCheckPrompt          // app's figure + last-checked date
submit(accountId, reportedBalance: Money): Result<BalanceCheckResult>
undo(checkId): Result<Unit>
```
**`submit`** computes the difference by **account class** (INV-16), never raw subtraction. Where the difference is non-zero it writes, in one transaction, the `balance_checks` row plus either a `correction` in `Not recorded` or — for loan accounts — an `out` in `Interest & charges` from the loan (doc 04 §7.2).
**`BalanceCheckResult`** — `{ difference: Money, direction: MissedSpending|MissedIncome|Matched, createdTransactionId? }`.
**`undo`** is available until the next check on that account; it removes the created transaction and sets `outcome = ignored`.
**Rate limit.** One prompt per account per day; user-initiated checks are never rate-limited.

## 8. MetricsService (domain-facing, read-only)

```
metric(id: MetricId, period, filters?): MetricResult
metrics(ids: List<MetricId>, period, filters?): Map<MetricId, MetricResult>
```
**`MetricResult`** — `{ value, basis: Spending|Money, period, isEstimate, dataState: Ok|Insufficient(requirement)|Suppressed, drillQuery? }`.
**Contract.** Never returns a substitute value for missing data. `Insufficient` carries the specific unmet condition so the UI can name it (doc 18 §3). `drillQuery` is `null` only for the four structurally exempt figures (doc 08 §9), which resolve to an explanation panel instead.

## 9. ReportService

```
report(id: ReportId, period, filters?): ReportViewModel
drillDown(query: DrillQuery): TransactionPage
```
**`ReportViewModel`** — `{ level1: Answer, level2: List<ExplanationRow>, availability: Available|Insufficient(requirement), actions }`.
**Contract.** Composes metrics; performs no arithmetic of its own. Every `ExplanationRow` carries its own `drillQuery`, and the sum of a level's rows equals its level-1 figure exactly — verified by T-33 and T-34.

## 10. PortabilityService

```
backup(destination): Result<BackupSummary>
inspectBackup(file): Result<BackupMetadata>
restore(file, confirmed: Bool): Result<RestoreSummary>
exportCsv(scope, destination): Result<ExportSummary>
validateCsv(file): Result<ImportPreview>
importCsv(file, confirmed: Bool): Result<ImportSummary>
```
**`inspectBackup`** returns date, transaction count and schema version so the UI can show them before any destructive confirmation.
**`restore`** stages, validates (foreign keys, CHECK constraints, INV-01 for every account, row counts), and swaps only on success. The live database is untouched until the swap.
**`validateCsv`** returns `ImportPreview { newRows, skippedRows, invalidRows: List<(rowNumber, reason)> }` and writes nothing.
**`importCsv`** applies only the valid subset, in one transaction, resolving references **by ID only**, skipping existing IDs (never overwriting), and refusing partial groups.
**Guarantee.** Export → import → export is byte-identical (T-73); re-import into the same database inserts zero rows (T-74).

## 11. PreferencesService

```
get(): Preferences
update(patch): Result<Unit>
```
Changing `month_start_day` triggers full recomputation and returns a flag so the UI can warn that report periods shift. Changing `decimals` affects display only and triggers **no** recomputation — stored values are never altered.

## 12. Events

The application layer emits: `TransactionsChanged(affectedPeriods, affectedAccounts)` · `AccountsChanged` · `BaselinesInvalidated` · `PeriodRevised(period)` · `InsightAvailable(insight)` · `ReliabilityChanged(state)`.

Mounted screens subscribe and re-query. No screen polls, and no screen caches a financial value across an event boundary.
