# Personal Finance Tracker — project rules

Offline, manual-entry personal finance app for Android, India / INR. React Native + TypeScript (strict) via Expo SDK 58.

**Build progress:** read `docs/build/PROGRESS.md` first, then follow the resume protocol in `docs/build/README.md`. Update the tracker after every step.

## Repo map

```
docs/shared/        product, domain, UX and design-system specs (14)
docs/engineering/   data model, invariants, architecture, tests, plan (19)
docs/design/        design docs 29-33 + prototype/ (final phase 2A export)
docs/build/         build tracker: PROGRESS.md, phase plans, per-task logs
code/               the Expo app; layers under code/src/ per engineering doc 25 §11
```

Numbers 30, 31 and 32 exist in both `engineering/` and `design/`. They are different documents. Always cite the folder ("design doc 32").

## Reading order before any build task

1. `docs/engineering/30_Claude_Code_Handoff.md`: non-negotiable instructions.
2. `docs/engineering/28_Implementation_Plan.md`: the 10 phases. Build one phase at a time.
3. `docs/engineering/25_Technical_Architecture.md`: layers, stack, boundary rules (§12).
4. `docs/design/32_Decisions_Log.md`: product-owner decisions that override the spec.
5. The spec docs and the prototype screens that the task touches.

## Which source wins on a conflict

The spec docs are **not yet amended** for the product-owner decisions. Do not build from a spec section without checking the sources above it. Highest first:

1. `docs/design/32_Decisions_Log.md` (decisions D-xx, Q-xx and follow-ups).
2. `docs/design/33_Phase2A_Fix_List.md`: known prototype defects. Build the fixed behaviour, never the defect.
3. `docs/design/30_Mobile_Design_Change_List.md` §9: the spec amendments the decisions require.
4. The prototype as built: `docs/design/prototype/Personal Finance App.dc.html` (decision D-29: prototype wins over the spec).
5. The spec docs in `docs/shared/` and `docs/engineering/`. Within the spec, engineering doc 04 governs all financial behaviour.

**Exception: 14 undecided gaps.** These doc-31 rows have no product-owner decision. When a task touches one, stop and ask the owner. Do not pick the prototype or the spec. Log the answer in design doc 32.

| Row | Topic |
|---|---|
| G-30 | Income vs expense trend inside Overview vs the separate "Over time" report (R-05) |
| G-32 | Category picker layout and inline "create category" |
| G-33 | Payee chips; category set on first use vs second use |
| G-35 | Account subtype labels; `savings` subtype |
| G-38 | Unusual-spending eligibility, 30-day cooldown, "about" wording (baseline is decided: P0-15c) |
| G-40 | Reliability "gaps" and "Just starting" triggers |
| G-41 | Month start day choices (1, 5, 15, 25 vs 1-28) and the period-shift warning |
| G-43 | Discard prompt when the add sheet closes with an amount |
| G-45 | Bill cadence `custom_days`; quarterly rule |
| G-46 | Bill amount presets vs price-change detection |
| G-47 | Limit suggestions before 3 qualifying months |
| G-60 | "Show paise" and the "follow system" theme option |
| G-61 | Account detail: running balance, 12-row cap |
| G-65 | Transactions filter set; amount-range filter |

Open vocabulary (D-03): the lending terms "principal", "write off" and "receivable" are not agreed yet. Ask before naming them in UI copy.

## Visual tokens and copy

- Take colour, type, spacing and radius tokens from the CSS custom properties in the prototype file (`[data-palette=...][data-theme=...]` blocks: 8 palettes, light and dark).
- Take UI copy from the prototype, unless design docs 32 or 33 change it.
- Doc 13 rules still apply: formatting, tone and WCAG AA contrast for all 16 palette and theme pairs (D-04).
- View the prototype: run `python -m http.server` in `docs/design/prototype/`, then open the `.dc.html` file. The `{{ }}` SVG console errors are harmless.
- The prototype's "Jump to a screen" panel, Tweaks and sample datasets are scaffolding (G-67, G-68). Do not build them.

## Stack and commands

Run from `code/`:

```bash
npm install
npx expo start          # dev server; scan the QR code with Expo Go
npm test                # Jest (jest-expo) + React Native Testing Library
npm run typecheck       # tsc --noEmit
npx expo install <pkg>  # always use this to add a package; it picks SDK-compatible versions
npx expo-doctor         # check dependency and config issues
```

- Read the Expo docs for SDK 58 before you use any Expo or React Native API. Do not rely on memory.
- Database: `expo-sqlite`. Money: a branded integer-`number` paise type. Every Money operation asserts `Number.isSafeInteger`.
- Builds: EAS Build free tier (15 Android builds). Use local builds after the cap.
- `code/AGENTS.md` is the Expo template's agent guide. Where it conflicts with this file, this file wins. In particular, use no `eas update` / OTA updates (no networking), and no router choice without asking the owner.

## Boundaries (engineering doc 25 §12)

1. No financial arithmetic outside `domain/`.
2. No SQL outside `data/`.
3. No platform or framework type inside `domain/`.
4. `app/` never calls a repository directly. It always goes through a service.
5. No money value is formatted outside the formatting utility.
6. No derived value is persisted, except the discardable rollup cache.
7. No networking API, network-using package, analytics, crash reporting or ads anywhere.
8. Every write path re-asserts the invariants (engineering doc 05) before commit.

## Workflow

- Until the P0 build is complete, all build work goes on one branch: `feat/app-build` (owner decision, 2026-11-10). It merges to `main` at the end, with approval. Never commit to `main` directly.
- Write a failing test first. Use the acceptance tests in engineering doc 22 (IDs `T-nn`) as the source of test cases, and the datasets in engineering doc 23.
- Run `npm test` and `npm run typecheck` before you call any task done. Quote the result.
- Ask the owner before every commit and every push.
- A new contradiction between sources goes in `docs/shared/Requirements_Exceptions.md` or design doc 32. Never fix it with a silent edit to a requirement.
- Do not renumber docs. Do not rename `Requirements_Exceptions.md`.
