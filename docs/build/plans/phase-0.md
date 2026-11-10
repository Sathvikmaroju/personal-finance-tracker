# Plan: start the app build on `feat/app-build`, with a crash-proof progress workflow

## Context

The design phase is closed. `code/` is still the bare Expo SDK 58 template (one `App.tsx`, one test).
The owner wants to build the app from the specs, and the work will run across many sessions.
Context resets, compactions, PC shutdowns and stopped tasks must not lose track of what is done.
Another LLM must be able to resume the work from the repo alone.

Owner decisions in this session (2026-11-10):

| Topic | Decision |
|---|---|
| Scope | The P0 release: engineering doc 28 phases 1-5, 7 and 8. Phases 6, 9 and 10 come later. |
| Branch | One long-lived branch, `feat/app-build`, for the whole build. Merge to `main` at the end. |
| Commits | Ask the owner before every commit (C3). The tracker is updated on disk after every step. |
| Resume aids | `docs/build/PROGRESS.md`, per-task logs, a SessionStart hook, and pointers in CLAUDE.md and AGENTS.md. |
| Plan depth | The first phase is detailed now. Each later phase gets a detailed plan when it starts. |
| Lending and spec amendments | **Phase 0 comes first:** amend the specs (design doc 30 §9) before any app code. |
| CI | Local npm scripts only (`npm run check`). No GitHub Actions. |
| Router | Decide when Phase 2 starts. |
| DB tests | A thin `SqlDatabase` port. On the device: `expo-sqlite`. In Jest: Node 22's built-in `node:sqlite`. |
| Execution | Mixed. Small or coupled tasks run inline. Bounded tasks go to subagents. Subagents do the reviews. |
| Phase gate | A subagent review, all checks green, then owner sign-off before the next phase is planned. |

Phase 1 is planned in detail only after Phase 0, because the schema (engineering doc 03) depends on the amended specs.

---

## Part A: progress workflow (Phase 0, tasks T01-T04)

### Files

```
docs/build/
  README.md          the protocol below: how to work, how to resume (stable; rarely changes)
  PROGRESS.md        the single source of truth for "where are we" (short; it is injected each session)
  plans/phase-0.md   detailed plan per phase (phase-1.md ... written when each phase starts)
  tasks/P0-T01.md    one log per task: goal, files, step checklist, evidence, decisions, handoff note
  tasks/_TEMPLATE.md
.claude/settings.json  SessionStart hook (project-level, checked in)
```

### PROGRESS.md layout (kept under about 80 lines)

1. **Current position**: phase, task ID, step number, status, and the last update time.
2. **Next action**: one exact sentence, for example "Run `npm test`; expect T-91 RED; then add the CHECK in schema.ts".
3. **Phase table**: each P0 phase with the status `not started | planning | in progress | review | signed off`.
4. **Current phase task list**: `[ ]` todo, `[~]` in progress, `[x]` done (verified), `[!]` blocked.
5. **Last verified state**: commands, exit codes, pass/fail counts and date, quoted from the real output.
6. **Awaiting owner**: open questions, and staged changes that wait for commit approval (with the proposed message).
7. **Deferred**: one line per item found mid-task that is not part of the task.

### Write discipline (this is what makes the tracker survive a crash)

- **Write ahead.** Before a step starts, mark it `[~]` in the task log and in PROGRESS.md. After the step, mark it `[x]` and add its evidence.
- After a crash, a step that still shows `[~]` is not trusted. The resume protocol re-checks it.
- Update the files with the Edit tool after every step, not at the end of the task. The data is on disk, so a compaction or a shutdown cannot lose it.
- At the end of a task: tests and typecheck run green, the files are staged, and the task log is complete. Then I ask the owner to approve the commit.
- Uncommitted progress survives on disk. Only the machine that holds it can see it until the commit happens.

### Resume protocol (in docs/build/README.md; any agent follows it)

1. Read `docs/build/PROGRESS.md`, then the current task log.
2. Run `git status` and `git diff --stat`. Compare the result with the task log. Any file the log does not explain is suspect, so report it.
3. Re-run `npm test` and `npm run typecheck` in `code/`. Compare the result with "Last verified state".
4. Re-verify any step that shows `[~]`. Then continue from **Next action**.
5. Never mark a step `[x]` without fresh command output from the current session.

### SessionStart hook

`.claude/settings.json` adds a `SessionStart` hook with no matcher, so it fires on every start type (`startup`, `resume`, `clear`, `compact`, `fork`; checked against the hooks docs 2026-11-10).
The hook command prints PROGRESS.md and the line "follow docs/build/README.md resume protocol":
`node -e "process.stdout.write(require('fs').readFileSync('docs/build/PROGRESS.md','utf8'))"`.
The command has no logic, so it gets a B3 run check, not a test.
I check the matcher names against the current Claude Code hooks docs before I write the file (D1).

### Pointers

- `.claude/CLAUDE.md`: add "Build progress: read `docs/build/PROGRESS.md` first; follow `docs/build/README.md`."
  Also amend the Workflow branch rule: until the P0 build is complete, all work goes on `feat/app-build`.
- `code/AGENTS.md`: the same pointer at the top.
- New root `AGENTS.md`: a 3-line pointer, so Codex or other agents that open the repo root find the tracker.

---

## Part B: Phase 0 tasks (detailed)

| ID | Task | Mode | Done when |
|---|---|---|---|
| T00 | `git checkout -b feat/app-build` from `main` (clean) | inline | `git branch --show-current` prints `feat/app-build` |
| T01 | Create `docs/build/` with README (protocol), PROGRESS.md, task template, plans/phase-0.md (this plan) | inline | The files exist. PROGRESS shows T01 `[x]` |
| T02 | Add the pointers and the branch-rule amendment to `.claude/CLAUDE.md`, `code/AGENTS.md`, root `AGENTS.md` | inline | `grep -n "docs/build/PROGRESS.md"` finds all three |
| T03 | Add the SessionStart hook to `.claude/settings.json` | inline | The command runs and prints PROGRESS.md. The JSON parses. The owner sees it fire in a new session |
| T04 | Ask the owner to approve a commit of T00-T03 | inline | Owner decision recorded |
| T05 | **Amendment inventory.** Map every row of design doc 30 §9, and every decision in design doc 32 that changes a spec, to the target doc sections. Group them: A lending (docs 02/03/04/05, v1.1 non-goals); B metrics (06/07: D-18, D-19, D-20, D-26); C data model and preferences (03: year start, month-start label, private accounts, notification defaults); D UX/IA/design (09, 11, 12, 13, 17, 18, 19, 20, onboarding) | dispatch (scout) | One table: each row has a decision ID, a doc/section and the current text location |
| T06 | **Lending Q&A with the owner.** Settle the open vocabulary ("principal", "write off", "receivable"), the repayment and interest events, write-off, settle/archive (D-03, D-03a, D-03b, Q-12a/b, P1-33, P1-46) | inline | Answers logged in design doc 32 |
| T07-T10 | Draft the amendments, one group per task (A, B, C, D). Each amendment edits the spec text in place and adds a marker: `> Amended 2026-xx-xx per D-xx.` The owner approves each group before the next one starts | dispatch (worker) per group + a reviewer subagent | The owner approves the group. The reviewer finds no contradiction with docs 32 and 33 |
| T11 | Update `.claude/CLAUDE.md` "Which source wins": the specs are now amended (only the 14 G-xx gaps stay open) | inline | Diff reviewed |
| T12 | Phase 0 review by a subagent. Then owner sign-off. Then write `plans/phase-1.md` in detail (writing-plans skill) | dispatch (reviewer) + inline | Owner sign-off recorded in PROGRESS |

Each task ends with a staged diff and a request for commit approval (C3).
The owner may say several tasks go in one commit, but only by an answer to that specific request.

---

## Part C: outline of later phases (detail comes when each phase starts)

- **Phase 1 Foundation.** `code/src/{app,application,domain,data,portability,testfixtures}`. Contents: the Money type (branded paise, `Number.isSafeInteger`); entities; schema v1 from the amended doc 03 with every CHECK, FK and index; a `SqlDatabase` port (expo-sqlite adapter + node:sqlite test adapter; data tests use `@jest-environment node`); repositories; `TransactionValidator`, `BalanceCalculator`, `InvariantAsserter`; a single-writer queue; doc 23 generators (seed `pf-tracker-v1`); `npm run check` = boundary scan + no-networking scan + typecheck + tests, as a Node script with no new dependency. Tests: T-86, T-91, T-93, T-94, generator determinism. A developer harness screen.
- **Phase 2 Accounts and capture.** Ask the owner about the router first. Ask about the touched gaps (G-32, G-33, G-35, G-41, G-43, G-60, G-61, G-65) when they come up.
- **Phase 3 Financial correctness.** Lending is built here from the amended specs.
- **Phase 4 Reporting.** G-30 and G-40 are asked here.
- **Phase 5 Planning.** G-45, G-46 and G-47 are asked here.
- **Phase 7 Portability.**
- **Phase 8 Accessibility, security, performance.**

Each phase follows the same pattern: plan, then TDD tasks, then tracker updates, then review, then sign-off.

## Deliberately out of scope

Phases 6, 9 and 10. GitHub Actions. Merging to `main` (done at the end of the build, with approval). EAS builds.

## Adversarial pass

1. **The tracker can drift from reality** if an update is skipped. Fix: the write-ahead `[~]` markers, plus resume steps 2-3, which re-derive the state from git and the tests rather than trusting the file.
2. **Phase 0 can grow too large.** Design doc 30 §9 has about 30 rows. Fix: four groups, each approved separately, with progress tracked per group, so a stop mid-phase loses at most one draft.
3. **Hook matcher names** may differ from my memory. Fix: check the current docs in T03, and the owner checks that the hook fires.
4. **node:sqlite under jest-expo** may need the node test environment or show an experimental warning. This affects Phase 1, so it gets a spike test first in the Phase 1 plan.
5. **Uncommitted work is local only.** I accept this risk, given the ask-per-commit rule. The tracker states what is uncommitted.

## Verification

- T00: `git branch --show-current` → `feat/app-build`.
- T01-T02: `ls docs/build`, `grep -rn "docs/build/PROGRESS.md" .claude/CLAUDE.md code/AGENTS.md AGENTS.md`.
- T03: run the hook command from the repo root and read the output. `node -e "JSON.parse(require('fs').readFileSync('.claude/settings.json','utf8'))"` exits 0. The owner then opens a new session or runs `/compact` to see the tracker injected.
- Resume drill (end of T03): a fresh subagent gets only "resume the build" and the repo. It must state the correct current task and next action from the files alone.
- `cd code && npm test && npm run typecheck` stays green throughout. Phase 0 changes no app code.
