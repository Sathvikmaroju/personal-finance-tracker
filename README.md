# Personal Finance Tracker

An offline, manually maintained personal finance app for Android (India / INR). This repository holds the frozen specification, the final design prototype, and the app source.

---

## Structure

```
personal-finance-tracker/
├── README.md          ← this file
├── docs/
│   ├── shared/        14 files — product, domain, UX and design-system specs
│   ├── engineering/   19 files — data model, invariants, architecture, tests, plan
│   └── design/         5 files + prototype/ — design handoff, change lists, decisions
└── code/              the React Native (Expo) app
```

## Tech stack

| Concern | Choice |
|---|---|
| Language / framework | React Native + TypeScript (strict) |
| Toolkit | Expo (SDK 58), npm |
| Database | SQLite via `expo-sqlite` |
| Money | Branded integer-`number` paise, guarded by `Number.isSafeInteger` |
| Tests | Jest (`jest-expo`) + React Native Testing Library |
| Builds | EAS Build free tier now; local builds once the free cap is reached |
| Network | None. No networking, analytics, crash-reporting or OTA-update module (doc 20 §8) |

The rationale is in `docs/engineering/25_Technical_Architecture.md` §2.

## Run the app

```bash
cd code
npm install
npx expo start      # scan the QR code with Expo Go on an Android phone
npm test            # unit and component tests
npm run typecheck   # tsc --noEmit
```

## Where to start

**Building the app:** read `docs/engineering/30_Claude_Code_Handoff.md` first, then follow `docs/engineering/28_Implementation_Plan.md` (10 vertical-slice phases). The source layout under `code/src/` follows doc 25 §11.

**Visual reference:** `docs/design/prototype/Personal Finance App.dc.html` is the final design prototype (phase 2A export, 2026-11-10). To view it, run `python -m http.server` in that folder and open the file in a browser. Claude Design is retired; the prototype and docs 30–33 in `docs/design/` are the final design record. `docs/design/33_Phase2A_Fix_List.md` lists the known fixes the prototype still needs; implement the fixed behaviour, not the prototype's defects.

## docs/shared/ (14 files)

| File | Purpose |
|---|---|
| `PersonalFinance_Final_Requirements_v1.1.md` | The frozen canonical requirements |
| `Requirements_Exceptions.md` | Logged contradictions and their resolutions |
| `01_Product_Master_Spec.md` | Principles, users, jobs, feature inventory, scope |
| `02_Domain_Model.md` | Canonical concepts and terminology |
| `06_Metrics_Calculation_Engine.md` | The 25 metrics |
| `07_Analytics_Engine.md` | Baselines and the progressive-intelligence ladder |
| `08_Reporting_Specification.md` | The 6 reports |
| `09_Information_Architecture.md` | Navigation, 45 screens, routes |
| `10_User_Flows.md` | 27 flows |
| `11_Screen_Specification.md` | Every screen with its states |
| `12_UI_Component_System.md` | 30 components |
| `13_Design_System.md` | Tokens, formatting, tone |
| `18_States_Errors_Empty_States.md` | Every application state and its copy |
| `19_Accessibility.md` | WCAG AA conformance requirements |

## docs/engineering/ (19 files)

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
| `25_Technical_Architecture.md` | Layers, boundaries, tech stack |
| `26_Domain_Service_Contracts.md` | Interfaces |
| `27_Database_Migrations.md` | Versioning and safety |
| `28_Implementation_Plan.md` | 10 vertical-slice phases |
| `31_Release_Readiness.md` | Production gates |
| `32_Coverage_Report.md` | Cross-document audit and status |

## docs/design/

| File | Purpose |
|---|---|
| `29_Claude_Design_Handoff.md` | Original design brief (historical) |
| `30_Mobile_Design_Change_List.md` | Consolidated design change items |
| `31_Prototype_vs_Spec_Gaps.md` | Prototype features not stated in the spec |
| `32_Decisions_Log.md` | Product-owner decisions |
| `33_Phase2A_Fix_List.md` | Remaining fixes against the final prototype |
| `prototype/` | Final prototype export and changelogs |

**Number clash:** numbers 30, 31 and 32 exist in both `engineering/` and `design/`. They are different documents. Cite them with the folder, for example "design doc 32".

---

## Rules for maintaining the docs

1. **Do not renumber the files.** Documents cross-reference each other by number ("doc 04 governs", "see doc 22 T-73"). Gaps in the numbering are intentional.
2. **Do not rename `Requirements_Exceptions.md`.** Docs 24, 29, 30, 31 and 32 reference it by name.
3. **Edit shared files once.** Each fact lives in one document.
4. **New contradictions go in `Requirements_Exceptions.md`**, never into a silent edit of a requirement. Follow the existing format: requirement → problem → impact → resolution → traceability.
5. **Anything new must trace to `24_Requirements_Traceability.md`** or be logged as an exception.
