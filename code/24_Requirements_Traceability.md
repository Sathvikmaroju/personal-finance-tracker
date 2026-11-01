# 24 — Requirements Traceability

Every canonical requirement traced through the pack: **Requirement → Domain → Data → Logic → Metric → Report → Screen → Flow → Test.**

Requirement IDs use the canonical document's section letters (A–N of its §10 consolidated requirements) plus the feature IDs from doc 01 §11.

---

## 1. Consolidated-requirement trace

| Req | Statement | Domain (02) | Data (03) | Logic (04) | Metric (06) | Report (08) | Screen (11) | Flow (10) | Test (22) |
|---|---|---|---|---|---|---|---|---|---|
| **A** | Purpose | All | — | — | — | — | — | — | — |
| **B** | 17 invariants enforced | All | CHECK, FK | §1–12 | All | All | All | All | T-86…T-95 |
| **C** | Three-chip capture, 3 taps | Transaction | `transactions` | §1–3 | — | — | S-02 | F-03 | T-71, T-134 |
| **D** | Asset/owed accounts, mandatory start | Account | `accounts` | §6, §11 | M-01…M-03 | — | S-11…S-13 | F-02 | T-15, T-16, T-103 |
| **E** | Loan model with interest split | Loan | `transactions.group_id` | §7.2 | M-04 | — | S-02, S-14 | F-08 | T-23…T-27, T-82 |
| **F** | Plain language, no jargon | All | — | — | — | — | All | — | T-80 |
| **G** | Six reports, three depths, drill-down | — | Indexes | — | All | R-01…R-06 | S-16…S-18, S-34, S-36, S-37 | F-14 | T-33, T-34, T-36 |
| **H** | Baselines, day-aligned, ranges | — | — | — | M-17…M-19 | R-04, R-05 | S-34, S-36 | F-14 | T-37, T-38, T-43 |
| **I** | Balance check, reliability, card signal | Balance check | `balance_checks` | §10 | M-16 | — | S-14 | F-10 | T-60…T-69 |
| **J** | Limits (flexible only), commitments | Limit, Commitment | `spending_limits`, `commitments` | — | M-12, M-14, M-15, M-20 | R-03, R-06 | S-23…S-26 | F-11…F-13 | T-106…T-113 |
| **K** | Backup, restore, CSV round-trip | — | All tables | — | — | — | S-27…S-29 | F-21…F-23 | T-73…T-75, T-114…T-123 |
| **L** | Offline, minimal permissions | — | — | — | — | — | — | — | doc 20 §8, release gate |
| **M** | P0/P1/P2 scope | — | — | — | Tiered | Tiered | Tiered | Tiered | Tiered |
| **N** | Stated limitations in-app | — | — | — | — | — | S-19 About | — | T-80 |

## 2. Feature trace (doc 01 §11)

| F | Feature | Tier | Domain | Data | Logic | Metric | Screen | Flow | Test |
|---|---|---|---|---|---|---|---|---|---|
| F-01 | Three-chip capture | P0 | Transaction | `transactions` | §1–3 | — | S-02 | F-03 | T-71 |
| F-02 | Calculator | P0 | — | — | — | — | C-05 | F-03 | T-137 |
| F-03 | Smart defaults | P0 | Payee | `payees` | — | — | S-02, S-05 | F-03 | T-105 |
| F-04 | Accounts | P0 | Account | `accounts` | §6, §11 | M-01…M-03 | S-11…S-13 | F-02, F-24 | T-15, T-81 |
| F-05 | Categories | P0 | Category | `categories` | — | M-10 | S-20, S-21 | F-19 | T-99…T-102 |
| F-06 | Payee memory | P0 | Payee | `payees` | — | — | S-05, S-40 | F-03, F-20 | T-104, T-105 |
| F-07 | Six kinds | P0 | Transaction | `transactions` | §1–6 | All | S-02 | F-03…F-09 | T-01…T-32 |
| F-08 | Refunds | P0 | Transaction | `back_of_id` | §4 | M-04 | S-08 | F-06 | T-06…T-08, T-31 |
| F-09 | Moves and Outside | P0 | Outside | `outside_label` | §3, §9 | M-22 | S-02, S-03 | F-05 | T-28…T-30, T-85 |
| F-10 | Loan model | P0 | Loan | `group_id` | §7.2 | M-04 | S-02 | F-08 | T-23…T-27 |
| F-11 | Commitments | P0 | Commitment | `commitments`, occurrences | — | M-12, M-20 | S-23, S-24 | F-11, F-12 | T-106…T-108 |
| F-12 | Limits | P0 | Limit | `spending_limits` | — | M-14, M-15 | S-25, S-26 | F-13 | T-109, T-110 |
| F-13 | Balance check | P0 | Balance check | `balance_checks` | §10 | — | S-14 | F-10 | T-60…T-69 |
| F-14 | Reliability | P0 | — | — | — | M-16 | S-01 | — | T-57, T-83 |
| F-15 | R-01 This month | P0 | — | — | — | M-04…M-07, M-10 | S-16 | F-14 | T-33, T-35 |
| F-16 | R-02 Where it goes | P0 | — | — | — | M-08…M-11 | S-17 | F-14 | T-47 |
| F-17 | R-03 Limits | P0 | — | — | — | M-14, M-15 | S-18 | F-14 | T-44 |
| F-18 | Transactions list | P0 | — | Indexes | — | — | S-07, S-10 | F-16 | doc 17 |
| F-19 | Home | P0 | — | — | — | M-02…M-04, M-13, M-16 | S-01 | — | T-70, T-133 |
| F-20 | Backup/restore | P0 | — | All | — | — | S-27 | F-21, F-22 | T-75, T-118…T-121 |
| F-21 | CSV export/import | P0 | — | All | — | — | S-28, S-29 | F-23 | T-73, T-74, T-114…T-117 |
| F-22 | ₹ formatting | P0 | — | `preferences` | — | — | doc 13 §9 | F-25 | T-130 |
| F-23 | Screen states | P0 | — | — | — | — | All | — | T-70 |
| F-24 | Recurrence detection | P1 | Commitment | `source` | — | — | S-39 | F-11 | T-113 |
| F-25 | R-04 What changed | P1 | — | — | — | M-19 | S-34, S-35 | F-14, F-15 | T-36, T-38 |
| F-26 | R-05 Over time | P1 | — | — | — | M-17, M-23 | S-36 | F-14 | T-140 |
| F-27 | Typical baselines | P1 | — | — | — | M-17, M-18 | — | — | T-37, T-43, T-56 |
| F-28 | R-06 Regular bills | P1 | Commitment | occurrences | — | M-20 | S-37 | F-12 | T-111, T-112 |
| F-29 | Unusual spending | P1 | — | — | — | M-21 | S-38 | — | T-41, T-42, T-48 |
| F-30 | Price-change alerts | P1 | Commitment | amount history | — | — | S-37 | F-12 | T-111 |
| F-31 | Card-in-credit signal | P1 | Account | — | §7.1 | M-01 | S-01, S-12 | F-07 | T-18 |
| F-32 | One-off flagging | P1 | — | `exclude_from_typical` | — | M-17 | S-08, S-38 | — | T-39 |
| F-33 | Widget | P1 | — | — | — | M-02, M-13 | S-42 | F-03 | — |
| F-34 | App lock | P1 | — | `preferences` | — | — | S-41 | F-26 | doc 20 §4 |
| F-35 | Duplicate prompt | P1 | — | — | — | — | S-02 | F-03 | T-76 |
| F-36 | Catch-up entry | P1 | — | — | — | — | S-43 | F-27 | — |
| F-37 | Insight engine | P1 | — | — | — | M-21 | S-38 | — | T-48 |
| F-38 | Split transactions | P2 | Transaction | `group_id` | — | — | S-44 | — | at build |
| F-39 | Category drift | P2 | — | — | — | M-23 | S-36 | — | at build |
| F-40 | Flexible-vs-income growth | P2 | — | — | — | M-24 | S-36 | — | at build |
| F-41 | Seasonality | P2 | — | — | — | M-25 | S-36 | — | at build |
| F-42 | PDF export | P2 | — | — | — | — | S-28 | F-23 | at build |
| F-43 | Encryption at rest | P2 | — | — | — | — | S-19 | — | at build |

## 3. Invariant → test trace

Every invariant INV-01…INV-17 maps to at least one test; the full matrix is in doc 05 §Enforcement. No invariant is untested.

## 4. Metric → report → screen trace

| Metric | Reports | Screens |
|---|---|---|
| M-01…M-03 | — | S-01, S-11, S-12 |
| M-04…M-07 | R-01 | S-01, S-16 |
| M-08…M-11 | R-01, R-02 | S-16, S-17 |
| M-12, M-13 | — | S-01, S-23 |
| M-14, M-15 | R-03 | S-18, S-25 |
| M-16 | all | S-01, report headers |
| M-17…M-19 | R-01, R-04, R-05 | S-16, S-34, S-36 |
| M-20 | R-06 | S-37 |
| M-21 | R-04 | S-38 |
| M-22 | — | S-12, S-08 |
| M-23…M-25 | R-05 | S-36 (P2) |

## 5. Orphan analysis

**Requirements without implementation coverage:** none.

**Implementation artefacts without a requirement:** the following exist in the pack and are justified as structural necessities rather than product features, each recorded in `Requirements_Exceptions.md`:

| Artefact | Justification |
|---|---|
| `transactions.group_id` | EX-03 — multi-record actions would otherwise orphan (INV-11) |
| Archive-at-zero rule | EX-01 — otherwise money vanishes from Money available |
| Interest-source rule | EX-02 — the requirement was silent; two readings existed |
| Reliability precedence | EX-04 — states could match simultaneously |
| Correction/BalanceCheck sync | EX-05 — otherwise the audit record desynchronises |
| `Outside` per-label net rule | EX-06 — sign was undefined |
| Monthly rollup cache | Doc 15 §5 — performance only; discardable without behaviour change |
| `app_meta.install_id` | Local diagnostic correlation; never transmitted (doc 20 §9) |
| Diagnostics screen (S-45, P2) | Support path for local-only crash data |

**Screens without a requirement:** none. Every screen in doc 09 traces to a job (doc 01 §6) or a feature.

**Tests without a requirement:** none. Groups K and L (accessibility, performance) trace to requirement L and the non-functional requirements of the canonical document.

## 6. Trace integrity rule

Any new artefact introduced during design or implementation must either trace to a row in this matrix or be added to `Requirements_Exceptions.md` with a justification. An untraceable artefact is scope creep and is rejected at review (docs 29, 30).
