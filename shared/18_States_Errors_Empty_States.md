# 18 — States, Errors & Empty States

Format: **Condition → UI → user action → system behaviour → recovery.**

Two rules govern everything here. First, **no screen ever renders blank** — an empty surface reads as a broken app. Second, **insufficient data is not an error**; it gets its own state that shows what exists and names the specific missing condition.

---

## 1. State taxonomy

| State | Meaning | Distinguishing feature |
|---|---|---|
| First use | Feature never used | Explains what will appear, offers the action |
| Empty | Feature used, no matching data | Same, plus a route back |
| Partial data | Some data, not enough for a comparison | Shows facts, names the unmet condition |
| Complete | Everything available | Full view |
| Loading | Work in progress | Skeleton after 300 ms only |
| Saving | Write in progress | Inline, non-blocking |
| Error | Something failed | Plain cause + recovery action |
| Offline | — | **Not a state.** The app has no online mode |
| Invalid input | Validation failed | Inline, at the field |
| Unreliable data | Reliability = "Some gaps" | One sentence, non-blocking |
| Unreconciled | No balance check yet | Prompt, never a warning |
| Archived | Entity retired | Read-only banner + Unarchive |
| Deleted | Entity gone | Toast with Undo |

---

## 2. First use and empty

| Surface | Copy | Action |
|---|---|---|
| Home | "Add your first expense to see where your money goes." Balances already correct. | Add |
| Transactions | "Your transactions will appear here." | Add |
| Reports hub | Cards visible with "Add a few expenses to get started." | Add |
| This month | "Nothing recorded this month yet." | Add |
| Where it goes | "Once you've recorded a few expenses, I'll show what takes the biggest share." | Add |
| Limits | "Set a limit on a category you'd like to watch." | Create limit |
| Commitments | "Add your regular bills so I can tell you what's coming." | Add commitment |
| Accounts | Impossible after onboarding (one account is mandatory) | — |
| Search | "Nothing found for '<term>'." | Clear |
| Filtered list | "No transactions match. Clear filters?" | One-tap reset |
| Empty period with data elsewhere | "Nothing recorded in this period." | Jump to the latest period with data |

## 3. Partial data (the state that matters most)

**Condition.** The screen has real data but not enough for the comparison or analysis it would normally show.
**UI.** Show every fact that *is* available, then one sentence naming the specific unmet condition. Never a padlock, never a blank chart, never a spinner.

| Feature | Condition named |
|---|---|
| Typical comparison | "Once you've used this another month, I can compare." |
| What changed | "I'll be able to compare once you've completed another month." |
| Over time | Plots the points that exist; no direction claim below three. |
| Unusual spending | Silent — the sole hard suppression. Nothing is shown, nothing is promised. |
| Regular bills detection | "Add your bills, or I'll spot the repeating ones after about three months." |
| Limit pace | Progress only before day 5. |
| Kept % | "No income recorded this month." Never 0%. |
| Left to spend | "I don't know your bills yet — add them for a better picture." |

**Prohibited.** Fabricating a comparison, showing zero in place of unknown, disabling a report card, or displaying a generic "not enough data" with no specific condition.

## 4. Loading and saving

**Loading.** Most queries complete under the 300 ms threshold at which a spinner does more harm than good; skeletons appear only beyond it, matched to the final layout so nothing shifts. Report generation over large datasets shows a skeleton with the report's own structure.
**Saving.** Writes are optimistic: the sheet dismisses immediately, a toast confirms with Undo, and the origin screen updates. If a write fails, the toast is replaced with an error and the entry is restored intact — the user's typing is never lost.

## 5. Errors

Every error message states what happened, in plain language, and offers a next step. No error codes appear in user copy; codes live in Diagnostics (S-45).

| Condition | UI | Recovery |
|---|---|---|
| Invalid amount | Inline, Save disabled | Correct the field |
| Future date beyond tomorrow | Inline on the date field | Choose another date |
| Same account both sides of a move | Inline on the destination | Choose a different account |
| Refund exceeds parent | Inline, showing what remains refundable | Reduce the amount |
| Duplicate account name | Inline | Rename |
| Limit on a repeating category | Inline, pointing to commitments | Use a commitment instead |
| Archive with a non-zero balance | Inline, offering "Move the remaining ₹X to…" | Complete the move, then archive (EX-01) |
| Delete blocked by references | Dialog naming the references | Merge or archive instead |
| Storage full on backup | Dialog | Free space or choose another location |
| Backup file corrupt | Dialog naming the reason | Choose a different file |
| Restore validation failed | Dialog naming the failed check | Existing data untouched; try another backup |
| Import rows invalid | Results screen with row numbers and reasons | Proceed with the valid subset, or export failures |
| Database integrity failure | Recovery screen | Salvage to CSV → restore → reset (doc 14 §9) |
| Invariant assertion failure | Write rolled back; plain-language message | Retry; logged locally |
| Schema newer than app | Blocking screen | Update the app |

**Never.** A raw exception, a stack trace, a silent failure, or an "OK"-only dialog for a destructive outcome.

## 6. Data-quality states

**Unreliable ("Some gaps").** One sentence on Home and at the top of reports: "A few things may be missing — check your balance?" Non-blocking; facts remain exact. Estimates and comparisons weaken but are not hidden, except unusual spending which requires qualifying months anyway.

**Unreconciled.** An account never balance-checked shows "Not checked yet" on its detail screen with a Check now action. This is a prompt, never a warning — the user has done nothing wrong.

**Reconciled.** Shows "Checked on 12 Mar — matched" or "Checked on 12 Mar — ₹700 added". An undo affordance persists until the next check on that account.

**Revised period.** A closed period whose figures changed after a backdated edit shows "Past figures updated" once, in reports and the Monthly Review, with a link to what changed.

## 7. Entity states

**Archived account.** Read-only banner, history intact, excluded from Money available and from new-entry pickers, Unarchive available. Historical reports continue to include its transactions, because the past did happen.

**Deleted transaction.** Toast with Undo for 5 seconds. Cascade deletions name every affected record in the confirmation beforehand.

**Merged category or payee.** Toast confirming the count of reassigned transactions; not undoable, and the confirmation dialog says so before proceeding.

**Inactive commitment.** Kept in history, excluded from Promised and from future occurrences; a Reactivate action is available.

## 8. Coverage requirement

Every screen in doc 11 must implement each state applicable to it, and each state must be renderable in isolation for design review and snapshot testing. Screens with no asynchronous work omit Loading; screens showing no aggregates omit Partial data. QA verifies coverage via T-70 and the state matrix in doc 22.
