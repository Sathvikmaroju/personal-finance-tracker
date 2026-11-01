# 21 — Performance

Targets are stated per dataset size, because the right engineering answer differs by an order of magnitude between a first-year user and a decade-long one. Optimise what the evidence demands; leave the rest simple.

**Reference devices.** Budget Android (4 GB RAM, eMMC storage) is the target for all "must" figures; a mid-range device should comfortably beat them. Figures are p95 on a warm app.

---

## 1. Realistic dataset sizes

| Profile | Transactions | Reached by |
|---|---|---|
| New user | 0–200 | Month 1–2 |
| Typical | ~1,000/year | Ordinary use, ~3/day |
| Heavy | ~3,600/year | ~10/day, cash-heavy |
| 1,000 | Baseline | Year 1, typical |
| 10,000 | Common ceiling | Year 10 typical, year 3 heavy |
| 50,000 | Stress | Beyond realistic single-user use |
| 100,000 | Design limit | Correctness must hold; speed may degrade gracefully |

Most users will never exceed 10,000. The 50k and 100k figures exist to prove the architecture does not collapse, not because they are expected.

## 2. Targets

| Operation | 1k | 10k | 50k | 100k | Priority |
|---|---|---|---|---|---|
| Cold start to interactive Home | 800 ms | 900 ms | 1.2 s | 1.6 s | **Critical** |
| Warm resume | 200 ms | 250 ms | 350 ms | 450 ms | Critical |
| Add sheet open (keypad ready) | 100 ms | 100 ms | 120 ms | 150 ms | **Critical** |
| Save a transaction | 60 ms | 80 ms | 120 ms | 180 ms | **Critical** |
| Home metrics refresh after save | 80 ms | 120 ms | 200 ms | 300 ms | Critical |
| Transaction list first page | 100 ms | 120 ms | 180 ms | 250 ms | High |
| Transaction list scroll | 60 fps | 60 fps | 60 fps | 55 fps | High |
| Filter apply | 20 ms | 40 ms | 90 ms | 150 ms | High |
| Text search (post-debounce) | 30 ms | 60 ms | 150 ms | 300 ms | Medium |
| R-01 This month | 80 ms | 120 ms | 250 ms | 400 ms | High |
| R-02 Where it goes | 80 ms | 120 ms | 250 ms | 400 ms | High |
| R-04 What changed | 150 ms | 250 ms | 500 ms | 800 ms | Medium |
| R-05 Over time (12 months) | 200 ms | 350 ms | 700 ms | 1.1 s | Medium |
| Baseline recomputation | 100 ms | 200 ms | 400 ms | 700 ms | Medium |
| Backup write | 300 ms | 1 s | 4 s | 8 s | Low (progress shown) |
| Restore + validate | 500 ms | 2 s | 8 s | 16 s | Low (progress shown) |
| CSV export | 200 ms | 800 ms | 3.5 s | 7 s | Low |
| CSV import + validate | 400 ms | 1.5 s | 7 s | 14 s | Low |

**The two figures that matter most** are add-sheet open and save. Capture is the product's survival constraint (doc 01 §7); if recording an expense ever feels slow, nothing downstream matters. These carry a hard budget and a CI regression gate.

## 3. What needs optimisation, and what does not

**Optimise now**
- **Add flow.** Pre-warm the sheet, pre-load the category grid and default account at app start, keep the keypad in memory. Save writes one small transaction and returns; recomputation is asynchronous and the UI updates on its event.
- **Monthly rollups** (doc 15 §5). Mandatory above 10k transactions; they turn R-04 and R-05 from full-table scans into small reads.
- **List virtualisation.** Paged at 50 rows from the start — retrofitting this is far more expensive than building it in.
- **Indexes.** All of doc 03's indexes exist from the first release; they cost little and are painful to add under load.

**Do not optimise yet**
- Report generation below 10k — direct queries are comfortably inside budget.
- Search below 10k — a debounced scan is fine.
- Backup, restore, export, import — infrequent, user-initiated, and acceptable with a progress indicator. Speed here is not worth risking atomicity.
- Startup integrity checks — a balance re-derivation over 10k rows is a few milliseconds and buys correctness confidence at every launch.

**Never optimise by**
- Storing a headline figure and trusting it (violates INV-14).
- Skipping the post-write balance assertion.
- Caching anything that is not also derivable on demand.
- Approximating a median with a sampled subset.

## 4. Startup budget

| Phase | Budget |
|---|---|
| Process start to first frame | 400 ms |
| Database open + integrity + FK check | 100 ms |
| Balance derivation and INV-01 assertion | 150 ms at 10k |
| Home metrics | 150 ms |
| First interactive frame | ≤900 ms at 10k |

Above 50k transactions, the startup balance assertion moves to a background task that completes within the first two seconds; the UI renders from the rollup cache immediately and reconciles on completion, showing a brief inline notice if a discrepancy is found.

## 5. Memory

Steady-state under 150 MB at 10k transactions. The transaction list holds at most three pages in memory. Report view models are released on navigation away. The payee search index (built above 50k) is capped at 10,000 entries by frequency.

## 6. Battery and background work

There is no background sync, no polling, and no scheduled network work — there is no network. Background activity is limited to local notification scheduling and, after a bulk import, a one-off rollup rebuild that yields to the foreground. Battery impact should be indistinguishable from a notes app.

## 7. Degradation strategy

Above the design limit, the app degrades in a defined order rather than failing: report windows narrow to 12 months by default with an explicit control to extend · note search restricts to the filtered set · the startup assertion moves to background · export and import show progress with cancellation. **Financial correctness never degrades.** No fallback path is permitted to produce an approximate balance or an unasserted total.

## 8. Measurement

| Metric | Method | Gate |
|---|---|---|
| Add-sheet open, save latency | Instrumented in CI on reference hardware | Regression >10% fails the build |
| Report timings across all sizes | Benchmark suite over doc 23 datasets | Must meet the table |
| Cold start | Platform startup tracing | Must meet the table |
| Scroll jank | Frame-timing capture over a 5,000-row scroll | <1% dropped frames |
| Memory | Profiler on the 50k dataset | Under ceiling |
| Cache equivalence | Reports rendered with and without rollups | Byte-identical output (doc 15 §9) |

Benchmarks run against the deterministic datasets in doc 23, so results are comparable between builds rather than dependent on whatever data happens to be on a test device.
