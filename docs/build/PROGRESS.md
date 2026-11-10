# Build progress (branch `feat/app-build`)

> Resume protocol: follow `docs/build/README.md` before you do anything else.

## Current position

- **Phase:** 0 (spec amendments and workflow set-up)
- **Task:** P0-T04, commit approval for T00-T03
- **Status:** [ ] waiting for owner
- **Updated:** 2026-11-10

## Next action

Ask the owner to approve the staged commit of T00-T03 (message under Awaiting owner). After that, start T05.

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
- [ ] T04 Owner approves commit of T00-T03
- [ ] T05 Amendment inventory (design doc 30 §9 + doc 32 → spec sections, groups A-D)
- [ ] T06 Lending Q&A with the owner
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

- Commit T00-T03. Proposed message: "Add build tracker, resume protocol and SessionStart hook". Owner to also confirm the hook fires in a new session or after /compact.

## Deferred

- (none)
