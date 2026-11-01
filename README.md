# Personal Finance Tracker — Specification Repository

Single source of truth for design and implementation. The product-definition phase is closed; these documents are the frozen input to Claude Design and Claude Code.

---

## Structure

```
personal-finance-tracker/
├── README.md                 ← this file
├── shared/                   14 files — read by BOTH tools
├── design/                    1 file  — Claude Design entry point
└── code/                     19 files — Claude Code only
```

**34 files total.** No file is duplicated. Every document is authoritative for its own domain and cross-references others by number.

---

## shared/ — read by both (14 files)

| File | Why both need it |
|---|---|
| `PersonalFinance_Final_Requirements_v1.1.md` | The frozen canonical requirements |
| `Requirements_Exceptions.md` | 6 logged contradictions and their resolutions |
| `01_Product_Master_Spec.md` | Principles, users, jobs, feature inventory, scope |
| `02_Domain_Model.md` | Canonical concepts and terminology |
| `06_Metrics_Calculation_Engine.md` | The 25 metrics — Design needs the user-facing names and edge-case display rules |
| `07_Analytics_Engine.md` | Baselines and the progressive-intelligence ladder — source of empty/insufficient copy |
| `08_Reporting_Specification.md` | The 6 reports and the Answer → Explanation → Detail hierarchy |
| `09_Information_Architecture.md` | Navigation, 45 screens, routes |
| `10_User_Flows.md` | 27 flows |
| `11_Screen_Specification.md` | Every screen with its states |
| `12_UI_Component_System.md` | 30 components |
| `13_Design_System.md` | Tokens, formatting, tone |
| `18_States_Errors_Empty_States.md` | Every application state and its copy |
| `19_Accessibility.md` | WCAG AA conformance requirements |

## design/ — Claude Design only (1 file)

| File | Purpose |
|---|---|
| `29_Claude_Design_Handoff.md` | Entry point. Reading order, deliverables, and §15 — what must not change |

## code/ — Claude Code only (19 files)

| File | Purpose |
|---|---|
| `30_Claude_Code_Handoff.md` | **Entry point.** Non-negotiable instructions |
| `03_Data_Model.md` | Production schema, constraints, indexes |
| `04_Financial_Domain_Logic.md` | Canonical event behaviour — governs on any conflict |
| `05_Financial_Invariants.md` | The 17 rules with rationale, maths, tests |
| `14_Local_Storage_Spec.md` | Persistence, atomicity, recovery |
| `15_Recomputation_Spec.md` | Derived data and the cache boundary |
| `16_Data_Portability_Spec.md` | Backup, CSV, round-trip guarantees |
| `17_Search_Filter_Spec.md` | Query surfaces |
| `20_Security_Privacy.md` | Threat model and controls |
| `21_Performance.md` | Budgets by dataset size |
| `22_Acceptance_Test_Suite.md` | 142 tests |
| `23_Test_Data_Scenarios.md` | 16 deterministic datasets |
| `24_Requirements_Traceability.md` | Requirement → test matrix |
| `25_Technical_Architecture.md` | Layers and boundaries |
| `26_Domain_Service_Contracts.md` | Interfaces |
| `27_Database_Migrations.md` | Versioning and safety |
| `28_Implementation_Plan.md` | 10 vertical-slice phases |
| `31_Release_Readiness.md` | Production gates |
| `32_Coverage_Report.md` | Cross-document audit and status |

---

## Pointing each tool at its files

**Claude Code** — give it the repo root. It reads `shared/` and `code/`, starting from `code/30_Claude_Code_Handoff.md`.

**Claude Design** — give it `shared/` + `design/` (15 files), starting from `design/29_Claude_Design_Handoff.md`. If Design runs as an upload-based Project rather than reading the local folder, upload exactly those 15 files.

---

## Rules for maintaining this repo

1. **Do not renumber the files.** Every document cross-references others by number ("doc 04 governs", "see doc 22 T-73"). Renumbering silently breaks dozens of internal references. The gaps in `shared/` (01, 02, 06, 07, 08…) are correct and intentional.

2. **Do not rename `Requirements_Exceptions.md`.** It is referenced by name in docs 24, 29, 30, 31, and 32.

3. **Edit shared files once.** That is the point of this layout — a change to `13_Design_System.md` reaches both tools immediately.

4. **New contradictions go in `Requirements_Exceptions.md`**, never into a silent edit of a requirement. Six entries already exist; follow their format: requirement → problem → impact → resolution → traceability.

5. **Anything new must trace to `24_Requirements_Traceability.md`** or be logged as an exception. An untraceable artefact is scope creep.

---

## Status

Specification **READY**: 0 technical ambiguities, 0 financial ambiguities, 0 unresolved exceptions.

Three behavioural risks remain deliberately unsolved and are marked for prototype validation — manual-entry sustainability, balance-check adoption, and essential/flexible classification accuracy. See `32_Coverage_Report.md` §7.

**Next phase:** Claude Design → prototype → real-user validation → Claude Code → implementation per `28_Implementation_Plan.md`.
