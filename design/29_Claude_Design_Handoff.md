# 29 — Claude Design Handoff

**Purpose.** Everything the designer needs to produce the visual and interaction source of truth, and an explicit boundary around what may not change.

**Read these first, in order:** doc 01 (product) → doc 13 (design system) → doc 09 (IA) → doc 11 (screens) → doc 12 (components) → doc 18 (states) → doc 19 (accessibility).

---

## 1. What you are designing

An offline personal finance app for an ordinary person with basic smartphone literacy. It records money events manually and turns them into accurate balances, honest comparisons against the user's own history, and a few things worth knowing.

**The design thesis in one line:** simple interaction, progressive disclosure, rich underlying information. A user wanting a quick answer gets it in one glance; a user wanting to analyse can go three levels deeper. **Simple UI must never be achieved by removing reporting.**

## 2. Product principles that shape the design

1. **Correctness first** — never let a visual treatment obscure or blend a number.
2. **Capture is sacred** — no design change may add a step to recording a transaction.
3. **Always say something true** — never a padlock, never a blank chart; show what exists and name what's missing.
4. **Plain language only** — no accounting or statistical vocabulary anywhere.
5. **Every number is traceable** — every aggregate must look tappable and lead somewhere.
6. **Describe and compare, never prescribe** — no judgement, no congratulation, no shame.

## 3. The user

Understands money, income, expenses, savings, bills, and budgets. Does **not** understand — and must never be required to — accounting, double-entry, accrual, statistics, or databases. They may be entering a transaction one-handed on a bus.

## 4. Navigation

Five tabs — **Home · Transactions · Reports · Plan · Settings** — plus a floating add button present on every tab. Independent back stack per tab; back always returns to the point of origin, never a tab root. Full structure in doc 09.

## 5. Screen inventory

45 screens: **33 P0, 10 P1, 2 P2** (doc 11). Design all P0 first; P1 screens are fully specified and should be designed once P0 is complete. Tier assignments are fixed.

**The five that carry the product:** S-02 Add transaction (the survival flow) · S-01 Home (four elements, nothing more) · S-16 This month · S-14 Balance check · S-34 What changed.

## 6. User flows

27 flows in doc 10. Design against these three first, because they set every other pattern:
- **F-03 Record an expense** — three taps: amount → category → save. Every millisecond and every tap matters.
- **F-10 Balance check** — app states its figure, user types theirs, app fixes the difference. Two taps, zero accounting language.
- **F-14 Review reports** — Answer → Explanation → Detail, with every number leading to its transactions.

## 7. Components

30 components in doc 12. Compose these before proposing new ones. The ones needing the most design attention: C-03 action chips, C-04 amount input, C-05 calculator keypad, C-10 transaction row, C-13 charts, C-15 insight card, C-23 insufficient-data state, C-30 explanation panel.

## 8. Design system

Doc 13 is the source for typography, spacing, colour, radius, elevation, icons, charts, and number formatting. Three points that are product decisions rather than aesthetic ones:

- **Money is not colour-coded green and red.** That is a trading-app reflex; it makes ordinary spending feel like failure. Colour is reserved for the semantic signals defined in doc 13 §3.
- **Owed amounts never show a minus sign.** `−488500` internally becomes **"You owe ₹4,88,500"**.
- **Indian digit grouping throughout** — ₹1,00,000, not ₹100,000.

## 9. Content hierarchy

Every reporting surface: **Level 1 answer** (one number, one sentence of context) → **Level 2 explanation** (3–6 rows) → **Level 3 detail** (transactions). Design each level to stand alone; a user who stops at Level 1 must still have learned something true.

Home is Level 1 only, and holds exactly four elements: Money available (with Owed separate) · Left to spend · Spent this month with its comparison · at most one insight card.

## 10. Financial terminology translation

The user learns exactly five concepts: **money out · money in · moving my own money · money coming back · bills that repeat.** Never introduce a sixth.

| Internal (never shown) | Show instead |
|---|---|
| Liability / owed account, negative balance | "Card: ₹18,400 owed" |
| Transfer to a liability account | "Paid ₹18,400 toward your card" |
| Transfer bank → cash | "Took out ₹5,000 cash" |
| Expense offset | "₹1,000 came back from Amazon" |
| Reconciliation adjustment | "₹700 spent but not recorded" |
| Trailing median baseline | "A typical month for you" |
| Below confidence threshold | "Once you've used this another month, I can compare" |
| Completeness below threshold | "A few things may be missing" |

Banned from every user-visible string: transfer, liability, asset, reconciliation, adjustment, accrual, median, MAD, percentile, variance, anomaly, cash basis, debit, credit. This is enforced by an automated lint (T-80), so a design that uses these words will fail the build.

## 11. Reporting hierarchy

Six views in one Reports area (doc 08): This month (P0) · Where it goes (P0) · Limits (P0) · What changed (P1) · Over time (P1) · Regular bills (P1). Monthly Review is a **mode of What changed**, not a seventh surface — do not design it as a separate destination.

**Charts.** Only four types, each justified by a decision: horizontal bars (comparison), lines with a band (direction), waterfall (explanation), progress (limits). No pie chart as a primary view, no heatmaps, no donuts. Every chart needs a caption and a readable-in-greyscale treatment.

## 12. Empty and insufficient states

These are the most important states in the product, and the easiest to get wrong.

- **Empty** — explain what will appear, offer the action. Never "No data".
- **Insufficient** — show what exists, then name the **specific** unmet condition. Never a padlock, never a disabled card, never a blank chart, never a generic "not enough data".

Doc 18 §2–3 gives the exact copy for every surface. Treat that copy as a starting point to refine, not as placeholder text to replace freely — the precision is deliberate.

## 13. Error states

Plain-language cause plus a recovery action. No error codes, no stack traces, no "OK"-only dialogs for destructive outcomes. Destructive confirmations name what will be affected and the count ("This also deletes 1 refund"). Full inventory in doc 18 §5.

## 14. Accessibility requirements

Non-negotiable, specified in doc 19: 48 dp targets with 8 dp separation · text to 200% with **amounts never truncating** · WCAG AA contrast in both themes · no meaning by colour alone · Money available and Owed announced as two separate values · every chart has a table alternative · reduce-motion honoured · F-03 completable end to end by screen reader.

## 15. What Claude Design must not change

- **Financial semantics.** Never alter what a number means, how it is derived, or which view (spending vs money) it belongs to.
- **Metrics.** Never invent one, rename one in a way that changes meaning, or display one not in doc 06.
- **Reporting scope.** Never remove a report, a level, or a drill-down path to make the UI look simpler. Depth is the product.
- **Priorities.** Never move a feature between P0, P1, and P2.
- **Internal concepts.** Never surface accounting vocabulary, transaction kinds, or statistical terms.
- **The three-tap capture path.** Never add a required field, a confirmation step, or an interstitial to F-03.
- **Owed display.** Never show a minus sign for an owed account, and never net owed against available into one figure.
- **Suppression rules.** Never show a comparison the data cannot support, and never hide a fact that is available.
- **The five user concepts.** Never introduce a sixth.

## 16. Where design judgement is wanted

Visual identity within doc 13's tokens · layout and rhythm within the information hierarchy · microcopy refinement (subject to the banned-terms lint) · empty-state illustration · chart styling within the four permitted types · the insight card's visual weight · onboarding pacing across its three steps · how the add sheet reveals its optional fields · making the Reports hub feel informative rather than a menu.

## 17. Deliverables

Screen designs for all 33 P0 screens with every applicable state · the 30 components with all their states · a token set matching doc 13 · the three critical flows as interactive prototypes · light and dark themes · text at 100% / 150% / 200% · a greyscale pass proving colour independence · final microcopy for every empty, insufficient, and error state.

## 18. If something seems wrong

If a requirement appears contradictory, impossible, or bad for the user: **do not silently change it.** Name the exact requirement, explain the conflict, propose a resolution, and record it in `Requirements_Exceptions.md`. Continue with the original until the exception is accepted. Six such exceptions already exist and are documented — that process works, and it is how the specification stays trustworthy.
