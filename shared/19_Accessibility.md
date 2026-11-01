# 19 — Accessibility

Target: **WCAG 2.2 AA**, plus platform conventions (TalkBack, VoiceOver, Dynamic Type). Accessibility is a correctness requirement here, not a polish item: a finance app that misreports a balance to a screen reader is as wrong as one that miscalculates it.

---

## 1. Touch and motor

Minimum target 48 × 48 dp with ≥8 dp separation. The FAB, keypad keys, and category tiles are larger. No gesture is the only route to a function: swipe-to-delete always has a menu equivalent, sheet dismissal always has a close button, drag-reorder always has a move-up/move-down alternative in the row menu.

No action requires a long-press, a double-tap, multi-touch, or a timed response. The add sheet has no timeout.

## 2. Text scaling

All text scales to **200%** without loss of content or function. Layouts reflow rather than truncate; single-line constraints are used only where truncation is harmless (a note preview), never for an amount.

Amounts never truncate. At extreme scales, a row wraps to two lines rather than shortening a figure — a clipped ₹1,00,000 reading as ₹1,00,0 is a correctness failure, not a cosmetic one.

Minimum body size 15 sp before scaling; nothing below 11 sp even at the smallest setting.

## 3. Contrast

Body text ≥4.5:1; `figure-lg` and above ≥3:1; interactive borders and chart elements ≥3:1 against their background. Both light and dark palettes (doc 13 §3) are verified against these ratios. Disabled elements are exempt from the ratio but are always paired with an explanation on attempted use, so their meaning is never carried by dimming alone.

## 4. Colour independence

**No meaning is conveyed by colour alone.** Every colour signal is doubled:

| Signal | Colour | Second channel |
|---|---|---|
| Money in | positive | "+" prefix and the word "received" in the accessible label |
| Money out | neutral | "−" prefix and "spent" |
| Owed | neutral | The literal word "owed" |
| Over limit | attention | An explicit "₹800 over" text |
| Estimate | outline style | The word "estimate" |
| Typical band on a chart | tint | A 45° hatch pattern |
| Selected chip | fill | Bolder weight and selected state announcement |
| Overdue commitment | attention | The word "overdue" |

Category bars in charts use a single-hue ramp with labels and values printed, so they are legible in greyscale.

## 5. Screen-reader semantics

**Labelling rules.**
- Every icon-only control has a label. Icons in functional positions also carry visible text.
- Amounts are announced as formatted currency, not digit strings: "fifty-one thousand two hundred rupees", not "5 1 2 0 0".
- **Money available and Owed are announced as two separate values and never merged.** Merging them would imply a netting the product explicitly forbids (doc 02 §1.2).
- A transaction row is one announcement covering kind, amount, category or payee, account, and date — not five separate focus stops.

**Headings.** Each screen has a single H1 (its title); section headers are H2. Reports use heading levels to mirror the Answer → Explanation → Detail hierarchy, so a screen-reader user can jump between levels.

**Live regions.** Result counts, running calculator expressions, and the balance-check difference sentence are polite live regions. Toasts are assertive and include their Undo action in the announcement.

**State announcements.** Selected, expanded, disabled, and busy states are exposed through platform semantics rather than visual styling alone.

## 6. Focus order and keyboard

Focus follows visual reading order. Opening a bottom sheet moves focus into it and traps it until dismissal; closing returns focus to the element that opened it. Modal dialogs behave the same way.

The add sheet places focus on the amount field with the numeric keypad presented. Tab order through the sheet is: chips → amount → category → More → Save.

Full external-keyboard support: arrow keys navigate lists and grids, Enter activates, Escape dismisses sheets and clears search.

## 7. Motion

All motion respects the OS reduce-motion setting, degrading to instant transitions. No parallax, no auto-playing animation, no number count-up (doc 13 §10) — a balance that animates is harder for everyone to read and can be actively disorienting.

Chart entry animation is decorative only; charts are fully readable at their first frame.

## 8. Accessible charts

Every chart has:
1. A text caption stating what it shows and the decision it supports.
2. An accessible summary announcing the headline finding ("Eating Out is the largest category at 18 per cent").
3. A **table alternative** listing every value, reachable by a "View as table" control on the chart itself — not buried in settings.
4. Individually focusable data points announcing label and value, where the platform supports it.

A user who cannot see the chart must be able to reach every number in it. Since the underlying transactions are always reachable too (doc 08 §9), no analysis in this product is sight-dependent.

## 9. Accessible numbers

Tabular figures for alignment. Indian digit grouping is announced correctly ("one lakh" rather than "one comma zero zero comma zero zero zero"). Percentages announce as "eighteen per cent". Negative asset balances announce as "overdrawn by one thousand two hundred rupees". Dates announce in full ("twelfth of March"), never as "12/3".

## 10. Accessible transaction entry

The critical flow must be completable entirely by screen reader in a reasonable number of steps:
- Chips are a radio group with three clearly labelled options.
- The amount field accepts direct keyboard entry; the on-screen calculator is an enhancement, never the only route.
- The category grid announces position ("Food and Groceries, 3 of 14") and supports search once above 12 items.
- Save announces the outcome: "Saved. Spent three thousand rupees on Food and Groceries."
- Undo is included in that announcement.

## 11. Error and validation accessibility

Errors are announced when they appear, programmatically associated with their field, and describe the fix rather than the failure ("Choose a date up to tomorrow", not "Invalid date"). Focus moves to the first invalid field on a failed save attempt. Error text never relies on colour and always includes a glyph plus wording.

## 12. Cognitive accessibility

This is where the product's simplicity discipline and its accessibility obligations coincide. No accounting or statistical vocabulary reaches the user (enforced by T-80). Every derived number has an explanation panel (doc 12 C-30). Nothing is timed. Destructive actions always name what will be affected and are undoable where technically possible. The three-tap capture path means the most frequent task carries the least cognitive load.

## 13. Testing requirements

| Check | Method |
|---|---|
| Contrast ratios, both themes | Automated token audit in CI |
| Touch target sizes | Automated layout assertion |
| Missing labels | Automated accessibility scan on every screen |
| Text at 200% | Snapshot tests at 100%, 150%, 200% |
| Screen-reader flows | Manual scripts for F-03, F-10, F-14, F-22 |
| Colour independence | Greyscale snapshot review of every chart and status state |
| Keyboard traversal | Manual per screen |
| Reduce-motion | Automated setting toggle test |

Accessibility tests are part of the release gate (doc 31), not a separate track.
