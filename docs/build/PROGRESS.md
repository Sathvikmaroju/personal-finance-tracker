# Build progress (branch `feat/app-build`)

> Resume protocol: follow `docs/build/README.md` before you do anything else.

## Current position

- **Phase:** 0 (spec amendments and workflow set-up)
- **Task:** P0-T07, group A lending amendments
- **Status:** [ ] not started (waiting for commit approval of T05/T06)
- **Updated:** 2026-11-10

## Next action

After the owner answers the commit request, start T07: draft group A amendments (inventory rows in group A + design doc 32 L-01..L-09, D-18a, D-19a), dispatch a worker, then a reviewer, then show the owner.

## Phases

| Phase | Name | Status |
|---|---|---|
| 0 | Spec amendments + workflow | in progress |
| 1 | Foundation | not started |
| 2 | Accounts and capture | not started |
| 3 | Financial correctness | not started |
| 4 | Reporting foundation | not started |
| 5 | Planning | not started |
| 7 | Data portability | not started |
| 8 | Accessibility, security, performance | not started |

Out of scope for now: phases 6, 9, 10. Plan: `docs/build/plans/phase-0.md`.

## Phase 0 tasks

- [x] T00 Create branch `feat/app-build` from `main`
- [x] T01 Create `docs/build/` (README, PROGRESS, task template, phase-0 plan)
- [x] T02 Pointers in `.claude/CLAUDE.md`, `code/AGENTS.md`, root `AGENTS.md`; branch-rule amendment
- [x] T03 SessionStart hook in `.claude/settings.json`
- [x] T04 Owner approved; committed d617438 and pushed to origin/feat/app-build
- [x] T05 Amendment inventory: docs/build/tasks/P0-T05-inventory.md (94 rows, 31/31 doc-30 rows); follow-ups D-18a, D-19a, P-01, L-08, L-09 logged in design doc 32 (design doc 30 §9 + doc 32 → spec sections, groups A-D)
- [x] T06 Lending Q&A: L-01..L-07 logged in design doc 32 (uncommitted)
- [ ] T07 Amendments group A: lending (docs 02/03/04/05, v1.1 non-goals)
- [ ] T08 Amendments group B: metrics (docs 06/07)
- [ ] T09 Amendments group C: data model and preferences (doc 03)
- [ ] T10 Amendments group D: UX, IA, design (docs 09-13, 17-20, onboarding)
- [ ] T11 Update `.claude/CLAUDE.md` source precedence
- [ ] T12 Phase 0 review, owner sign-off, write `plans/phase-1.md`

## Last verified state

- 2026-11-10: `git branch --show-current` → `feat/app-build`.
- 2026-11-10: hook command exits 0 and prints this file; settings.json parses. Task log: tasks/P0-T00-T03.md.
- App tests not yet re-run on this branch (no app code changed).

## Awaiting owner

- Commit T05+T06. Proposed message: "Add spec amendment inventory and lending decisions (Phase 0 T05-T06)".
- Confirm L-03 tie rule (half up) and L-08 (no interest for the written-off period) during the group A review.
- Confirm the SessionStart hook fires in a new session or after /compact (look for "BUILD TRACKER").

## Deferred

- (none)
