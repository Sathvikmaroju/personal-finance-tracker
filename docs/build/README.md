# Build workflow and resume protocol

This folder tracks the build of the app on branch `feat/app-build`. Any agent (Claude Code, Codex, another LLM) or person can resume the work from these files alone.

## Files

| File | Purpose |
|---|---|
| `PROGRESS.md` | The single source of truth for "where are we". Keep it short (about 80 lines). A SessionStart hook prints it at the start of each session and after each compaction. |
| `plans/phase-N.md` | The detailed plan for phase N. A phase gets its plan when it starts. |
| `tasks/<phase>-<task>.md` | One log per task: goal, files, step checklist, evidence, decisions, handoff note. Copy `tasks/_TEMPLATE.md`. |

Status markers, used everywhere: `[ ]` todo · `[~]` in progress · `[x]` done and verified · `[!]` blocked.

## Resume protocol (do this first, every session)

1. Read `PROGRESS.md`, then the task log of the current task.
2. Run `git status` and `git diff --stat`. Compare them with the task log. Report any changed file that the log does not explain.
3. In `code/`, run `npm test` and `npm run typecheck`. Compare the result with "Last verified state" in `PROGRESS.md`.
4. Do not trust a step marked `[~]`: the work stopped during that step. Re-check it, then finish or redo it.
5. Continue from **Next action** in `PROGRESS.md`.

## Write discipline

- **Write ahead.** Before you start a step, mark it `[~]` in the task log and in `PROGRESS.md`. Then do the step.
- After the step, mark it `[x]` and paste the evidence: the command, its exit code and the key output lines.
- Update the files after every step, not at the end of a task. A crash then loses at most one step.
- Always keep **Next action** as one exact, executable sentence.
- Never mark a step `[x]` without fresh command output from the current session.
- Work found mid-task that is not the task goes to **Deferred** as one line.

## Task end

1. `npm test` and `npm run typecheck` pass. Quote the result in the task log.
2. Stage the files of the task.
3. Write the proposed commit message under **Awaiting owner** in `PROGRESS.md`.
4. Ask the owner to approve the commit. **Never commit or push without approval, for every commit.**
5. After the commit, record the commit hash in the task log.

## Phase end

1. A subagent reviews the phase.
2. All checks pass.
3. The owner signs off. Record the sign-off in `PROGRESS.md`.
4. Write `plans/phase-N+1.md`, then start the next phase.

## Rules that always apply

- Project rules: `.claude/CLAUDE.md` (source precedence, boundaries, undecided gaps G-xx).
- Ask the owner when a task touches an undecided gap or an open decision. Do not guess.
- Scope: the P0 release, which is engineering doc 28 phases 1-5, 7 and 8, preceded by Phase 0 (spec amendments).
