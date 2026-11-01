# 31 — Release Readiness

Production gates. Every item is verifiable — a checkbox that cannot be objectively evaluated does not belong here. Release is blocked by any unchecked **Blocking** item.

---

## 1. Functional

| # | Gate | Verification | Level |
|---|---|---|---|
| 1.1 | All P0 features (F-01…F-23) implemented | Doc 24 trace complete | Blocking |
| 1.2 | All 33 P0 screens implemented with every applicable state | Snapshot coverage | Blocking |
| 1.3 | All P0 user flows completable end to end | Manual scripts, doc 10 | Blocking |
| 1.4 | Every aggregate drills to transactions summing exactly | T-33, T-34 | Blocking |
| 1.5 | No screen renders blank in any state | T-70 | Blocking |
| 1.6 | Every P1 feature either complete or fully absent — no partial surfaces | Review | Blocking |

## 2. Financial correctness

| # | Gate | Verification | Level |
|---|---|---|---|
| 2.1 | All 17 invariants implemented as runtime assertions | Code review + T-86…T-95 | Blocking |
| 2.2 | Group A (32 transaction tests) green | CI | Blocking |
| 2.3 | ₹3,000 card purchase + payment = ₹3,000 spending | T-03, T-04 | Blocking |
| 2.4 | ATM withdrawal + cash spend never double-counts | T-19, T-20 | Blocking |
| 2.5 | Refunds never become income | T-06, T-07, T-31 | Blocking |
| 2.6 | Loan disbursement never becomes income | T-23 | Blocking |
| 2.7 | Loan interest source correct in both cases | T-25, T-26 | Blocking |
| 2.8 | Balance-check sign correct for owed accounts | T-62 | Blocking |
| 2.9 | Moves never affect spending, income or kept | T-06, T-28, T-30 | Blocking |
| 2.10 | Integer paise throughout; no float in the money path | T-94 + static check | Blocking |
| 2.11 | Zero invariant failures across all doc 23 datasets | CI | Blocking |

## 3. Data integrity

| # | Gate | Verification | Level |
|---|---|---|---|
| 3.1 | All CHECK constraints, FKs, unique constraints present | Schema diff against doc 03 | Blocking |
| 3.2 | Multi-row actions atomic | T-82 | Blocking |
| 3.3 | Interrupted write recovers cleanly | T-127 | Blocking |
| 3.4 | Corrupt database opens recovery, never crashes | T-124 | Blocking |
| 3.5 | Startup integrity and balance assertion runs | T-126 | Blocking |
| 3.6 | No orphan records reachable by any path | T-32, T-90 | Blocking |
| 3.7 | Archive-at-zero enforced | T-81 | Blocking |

## 4. Reporting correctness

| # | Gate | Verification | Level |
|---|---|---|---|
| 4.1 | Groups B and C green | CI | Blocking |
| 4.2 | Same metric identical across reports | Cross-report assertion | Blocking |
| 4.3 | Current-month comparisons day-aligned | T-38, T-95 | Blocking |
| 4.4 | Insufficient data names the specific unmet condition | Copy review + T-53…T-55 | Blocking |
| 4.5 | Corrections excluded from shares and baselines | T-35, T-65 | Blocking |
| 4.6 | Estimates labelled, never summed with actuals | T-49, T-92 | Blocking |
| 4.7 | Reports identical with the rollup cache dropped | T-128 | Blocking |

## 5. Offline behaviour

| # | Gate | Verification | Level |
|---|---|---|---|
| 5.1 | No networking permission in the manifest | Manifest inspection | Blocking |
| 5.2 | No networking API referenced anywhere | Static analysis in CI | Blocking |
| 5.3 | No analytics, crash, ad, or attribution SDK | Dependency audit | Blocking |
| 5.4 | Full functionality in airplane mode from install to uninstall | Manual, full regression | Blocking |
| 5.5 | Backup, restore, export, import all work offline | Manual | Blocking |
| 5.6 | No transitive dependency opens a socket | Dependency tree audit | Blocking |

## 6. Accessibility

| # | Gate | Verification | Level |
|---|---|---|---|
| 6.1 | Group K green | CI + manual | Blocking |
| 6.2 | WCAG AA contrast, both themes | Automated token audit | Blocking |
| 6.3 | Text to 200% with no truncated amount | Snapshot at 3 scales | Blocking |
| 6.4 | Every interactive element labelled | Automated scan | Blocking |
| 6.5 | F-03 completable by screen reader | Manual script | Blocking |
| 6.6 | Money available and Owed announced separately | Manual | Blocking |
| 6.7 | Every chart has a table alternative | Manual | Blocking |
| 6.8 | Reduce-motion honoured | Automated toggle test | Blocking |
| 6.9 | 48 dp targets throughout | Automated layout assertion | Blocking |

## 7. Performance

| # | Gate | Verification | Level |
|---|---|---|---|
| 7.1 | Add-sheet open within budget at 10k | Benchmark on reference device | Blocking |
| 7.2 | Save within budget at 10k | Benchmark | Blocking |
| 7.3 | Cold start within budget at 10k | Startup trace | Blocking |
| 7.4 | Reports within budget at 10k | Benchmark | Blocking |
| 7.5 | List scroll <1% dropped frames at 50k | Frame timing | High |
| 7.6 | Memory under ceiling at 50k | Profiler | High |
| 7.7 | Correctness holds at 100k, even if slower | Full suite on D-14 | Blocking |

## 8. Security and privacy

| # | Gate | Verification | Level |
|---|---|---|---|
| 8.1 | Data in private app storage only | File-system inspection | Blocking |
| 8.2 | No amounts, payee names, or notes in any log | Log audit, T-129 | Blocking |
| 8.3 | Permissions requested in context, never at launch | Manual | Blocking |
| 8.4 | No SMS, contacts, location, camera, or network permission | Manifest | Blocking |
| 8.5 | Parameterised queries only | Static analysis | Blocking |
| 8.6 | CSV injection escaped on export | T-123 | Blocking |
| 8.7 | Backup contents disclosed before writing | Copy review | Blocking |
| 8.8 | App lock has no recovery path, stated at setup (P1) | Copy review | Blocking if shipped |

## 9. Backup and restore

| # | Gate | Verification | Level |
|---|---|---|---|
| 9.1 | Backup atomic; interruption leaves no partial file | T-121 | Blocking |
| 9.2 | Restore staged and validated before any swap | T-120 | Blocking |
| 9.3 | Round-trip identity | T-73 | Blocking |
| 9.4 | Re-import inserts zero rows | T-74 | Blocking |
| 9.5 | Invalid rows reported by number and reason | T-114…T-117 | Blocking |
| 9.6 | Newer-version file refused clearly | T-118 | Blocking |

## 10. Migration

| # | Gate | Verification | Level |
|---|---|---|---|
| 10.1 | Migration from every released version | T-122, chain suite | Blocking |
| 10.2 | Balance fingerprints identical before and after | Automated comparison | Blocking |
| 10.3 | Safety backup written before migrating | Manual | Blocking |
| 10.4 | Interrupted migration leaves a clean state | Kill test | Blocking |
| 10.5 | A stored backup exists for the new schema version | Artefact check | Blocking |

## 11. QA

| # | Gate | Verification | Level |
|---|---|---|---|
| 11.1 | All 122 P0 tests green | CI | Blocking |
| 11.2 | All shipped P1 tests green | CI | Blocking |
| 11.3 | Nightly suites stable for 7 consecutive days | CI history | Blocking |
| 11.4 | Every doc 23 dataset passes its expected-value manifest | CI | Blocking |
| 11.5 | Zero known P0 defects | Tracker | Blocking |

## 12. UX

| # | Gate | Verification | Level |
|---|---|---|---|
| 12.1 | Banned-terms lint passes on every string | T-80 | Blocking |
| 12.2 | Common expense in three taps | T-71 | Blocking |
| 12.3 | Back returns to origin, never a tab root | T-72 | Blocking |
| 12.4 | Every empty and insufficient state has deliberate copy | Copy review | Blocking |
| 12.5 | Destructive confirmations name what is affected | Review | Blocking |
| 12.6 | Undo available for every create and delete | Review | High |

## 13. Device testing

| # | Gate | Level |
|---|---|---|
| 13.1 | Minimum supported OS version, budget device | Blocking |
| 13.2 | Current OS version, mid-range device | Blocking |
| 13.3 | Small screen (≤5.5") and large screen (≥6.7") | Blocking |
| 13.4 | Both themes on both devices | Blocking |
| 13.5 | Low-storage condition during backup | Blocking |
| 13.6 | Process death and restore of navigation state | Blocking |
| 13.7 | Locale variations affecting date and number input | High |

## 14. Crash and error handling

| # | Gate | Level |
|---|---|---|
| 14.1 | Crash-free rate ≥99.5% over the internal test period | Blocking |
| 14.2 | No user-facing raw exception or stack trace | Blocking |
| 14.3 | Every error has a plain cause and a recovery action | Blocking |
| 14.4 | Invariant failures roll back and surface plainly | Blocking |
| 14.5 | Diagnostics local, sanitised, user-exportable | Blocking |

## 15. Store readiness

| # | Gate | Level |
|---|---|---|
| 15.1 | Data-safety declaration matches doc 20 exactly — no collection, no sharing | Blocking |
| 15.2 | Listing makes no claim the product does not deliver | Blocking |
| 15.3 | In-app limitations statement present and accurate (doc 01) | Blocking |
| 15.4 | Privacy policy states on-device only, no account, no sync, and that only the user's own backup can recover data | Blocking |
| 15.5 | No advertising identifier read | Blocking |
| 15.6 | Screenshots reflect real functionality, not mockups | Blocking |

---

## Final release checklist

- [ ] All Blocking gates in §§1–15 passed
- [ ] 122 P0 + shipped P1 acceptance tests green
- [ ] Zero invariant failures across all doc 23 datasets
- [ ] Airplane-mode regression completed end to end
- [ ] Migration rehearsed from every released version with identical balances
- [ ] Accessibility manual scripts completed
- [ ] Performance benchmarks meet the doc 21 table
- [ ] Dependency audit shows no network-capable library
- [ ] Banned-terms lint clean
- [ ] Store declaration verified against actual behaviour
- [ ] `Requirements_Exceptions.md` reviewed; no unresolved BLOCKING entry
- [ ] Doc 32 coverage report shows no orphan P0 requirement

## Post-release monitoring — without telemetry

There is no analytics pipeline, so monitoring is deliberately limited and honest: store-reported crash rates and reviews · user-initiated diagnostics exports sent to support voluntarily · the two behavioural risks (manual-entry sustainability, balance-check adoption) answered by **prototype and interview research**, not by instrumenting the released app.

If a correctness defect is reported post-release, the response order is: reproduce against a doc 23 dataset → add a failing acceptance test → fix → verify the invariant that should have caught it, and add one if none existed.
