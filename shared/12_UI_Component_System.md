# 12 — UI Component System

Reusable components. Every component is presentation-only: none contains financial logic, and all money values arrive pre-computed from the domain layer (doc 25). Tokens referenced come from doc 13.

Common contract: all components accept a `testID`, expose an accessible label, honour dynamic type up to 200%, and meet a 48 dp minimum touch target.

---

## C-01 · Tab bar
**Anatomy** 5 items (Home, Transactions, Reports, Plan, Settings) + centred FAB.
**States** active, inactive, pressed.
**Behaviour** Preserves an independent navigation stack per tab; re-tapping an active tab scrolls to top without clearing the stack.
**Accessibility** `tab` role, selected state announced, labels always visible (never icon-only).

## C-02 · Floating add button
**Anatomy** Circular, primary colour, plus glyph.
**States** default, pressed, hidden (while a sheet is open).
**Props** `onPress`, `presetChip?`.
**Accessibility** Label "Add a transaction"; reachable via keyboard focus order.

## C-03 · Action chip group
**Anatomy** Three segmented chips — Spent · Received · Moved.
**States** selected, unselected, pressed, disabled.
**Props** `value`, `onChange`.
**Behaviour** Changing selection clears fields the new kind forbids and animates the contextual selector swap.
**Accessibility** `radiogroup`; each chip announces its selected state. Selection is never conveyed by colour alone — the selected chip also carries a filled background and bolder weight.

## C-04 · Amount input
**Anatomy** Large right-aligned figure with currency prefix, expression line above when a calculation is in progress.
**States** empty (shows ₹0), valid, invalid, calculating.
**Props** `valuePaise`, `onChange`, `maxDigits`.
**Validation** Integer paise; rejects more than 2 decimal places; rejects zero on save.
**Accessibility** Announces the formatted amount, not raw digits.

## C-05 · Number keypad with calculator
**Anatomy** 0–9, decimal, backspace, and `+ − × ÷ =`.
**Behaviour** Evaluates a flat expression left-to-right with standard precedence; `=` collapses to a value. Errors clear silently rather than showing a modal.
**Accessibility** Each key labelled; the running expression is announced on change.

## C-06 · Account selector row / sheet
**Anatomy** Icon, name, balance (formatted per class), chevron.
**States** default, selected, disabled (archived), system (hidden).
**Props** `accounts`, `value`, `onChange`, `includeOutside`.
**Behaviour** Groups by class with headers "Money I have" / "Money I owe".
**Accessibility** Label includes the balance and, for owed accounts, the word "owed".

## C-07 · Category selector grid
**Anatomy** Icon tiles with labels, 4 per row, recent-and-frequent first.
**States** default, selected, search-filtered.
**Props** `kind`, `value`, `onChange`.
**Accessibility** Grid semantics with position announcements; labels always rendered.

## C-08 · Payee input
**Anatomy** Text field with an autocomplete dropdown after 3 characters.
**States** empty, typing, suggestions, selected, new-payee.
**Behaviour** Ranked by `times_used`; selecting sets the category when none is chosen.
**Accessibility** Combobox semantics; suggestion count announced.

## C-09 · Date picker
Calendar modal with Today and Yesterday shortcuts; future dates beyond tomorrow disabled with an explanation on attempt.

## C-10 · Transaction row
**Anatomy** Category icon · primary line (payee or category) · secondary line (account, note snippet) · amount with a kind prefix.
**States** default, pressed, refunded (badge), grouped (badge), matched-to-commitment (badge), correction (distinct styling).
**Props** `transaction`, `showRunningBalance?`.
**Accessibility** One announcement per row covering kind, amount, category, payee, date. Sign is conveyed by the prefix word, never colour alone.

## C-11 · Account row
Icon, name, balance, last-checked date, chevron. Owed accounts display "owed" and never a minus sign.

## C-12 · Report card
**Anatomy** Title, live one-line answer, chevron.
**States** ready, insufficient (shows the unmet condition), locked-by-tier.
**Behaviour** Always tappable — an insufficient card opens the report and explains, rather than being disabled.

## C-13 · Chart components
Four permitted types, each with a required `caption` prop stating the decision it supports.
| Type | Use | Accessibility |
|---|---|---|
| Horizontal bar | Category comparison | Bars exposed as a data table alternative |
| Line + band | Direction over time | Series described in text; band described as "usual range" |
| Waterfall | Explaining a change | Each bar announced with label and signed value |
| Progress | Limits | Announced as "X of Y, Z per cent" |
All charts are readable without colour: bars carry labels and values; the typical band uses a pattern as well as a tint. Estimates render with an outline/hatched treatment (INV-13).

## C-14 · Progress indicator (limits)
Bar with fill, a pace marker at the linear-expectation point, and an over-limit state that extends in a warning tone without alarm styling.

## C-15 · Insight card
**Anatomy** One-line signal · one-line why · up to four actions (see transactions, set a limit, mark one-off, not useful).
**States** default, expanded, dismissed.
**Behaviour** Maximum one on Home, three in Reports. Dismissal is permanent for that instance; "not useful" suppresses the type.

## C-16 · Commitment row
Name, amount, cadence, next due, status badge (upcoming / matched / overdue), price-change indicator.

## C-17 · Limit row
Category, limit, spent, remaining, progress bar, pace marker.

## C-18 · Balance-check sheet
Sequenced content: app figure → input → plain-language difference → Fix it / Skip. Includes an undo banner state.

## C-19 · Bottom sheet
Drag handle, optional title, scrollable content, safe-area padding. Dismiss by swipe, backdrop tap, or explicit close. Warns on dismissal if unsaved input exists.

## C-20 · Modal / alert
Title, body, up to two actions. Destructive actions are labelled with the consequence ("Delete transaction and 1 refund"), never a bare "OK".

## C-21 · Toast
Message plus an optional Undo action; auto-dismiss at 5 s; queued, never stacked. Undo is available for every create and delete.

## C-22 · Empty state
Illustration or icon, one sentence explaining what will appear, and a primary action. Never a bare "No data".

## C-23 · Insufficient-data state
Distinct from empty: shows what exists, plus one sentence naming the **specific** unmet condition ("Available once you've completed another month"). Never a padlock, never a blank chart.

## C-24 · Error state
Plain-language cause, a recovery action, and — for data errors — a path to backup/restore. No error codes in user-facing copy; codes appear only in Diagnostics (S-45).

## C-25 · Confirmation dialog
Used only for destructive or irreversible actions. Always names what will be affected and the count.

## C-26 · Search field
Leading icon, clear button, live results with a count. Debounced 250 ms.

## C-27 · Filter chip row
Removable chips for each active filter, plus a Clear all. Always shows the resulting count.

## C-28 · Period selector
Segmented control (This month / Last month / Choose) with a month-picker sheet and custom range. Respects `month_start_day` and displays the resolved date range as text.

## C-29 · Section header
Title, optional trailing action, sticky within scroll containers.

## C-30 · Explanation panel
Opened by tapping a structurally exempt figure (doc 08 §9) or a metric's "?" affordance. Shows the plain-language definition, the inputs used, the period, and the data state. This component is the mechanism by which the explainability guarantee is met for figures with no transaction list.

---

## Reuse rules

1. A component may not compute a financial value; it renders what it is given.
2. Currency rendering happens in exactly one place — the formatting utility (doc 13 §9) — never ad hoc.
3. Any new surface must compose existing components before new ones are proposed.
4. Components must not encode tier logic; P1/P2 gating is decided by the caller.
5. Every state a component can enter must be representable in isolation for design review and snapshot testing.
