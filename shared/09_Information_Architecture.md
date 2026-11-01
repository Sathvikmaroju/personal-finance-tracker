# 09 — Information Architecture

Five destinations, one persistent creation action. A sixth destination would be a design failure.

---

## 1. Navigation model

```
Bottom tab bar (persistent)
├── Home          "How am I doing right now?"
├── Transactions  "What exactly happened?"
├── [ + ]         Add sheet — floating, present on every tab
├── Reports       "Help me understand my behaviour"
├── Plan          "What repeats, and what limits did I set?"
└── Settings      "Configure, protect, and own my data"
```

The add action is a floating button, not a tab — it opens a bottom sheet over the current context and returns there on dismissal, so recording never costs the user their place.

---

## 2. Screen inventory

| ID | Screen | Type | Tier | Parent |
|---|---|---|---|---|
| S-01 | Home | Tab root | P0 | — |
| S-02 | Add transaction | Bottom sheet | P0 | Global |
| S-03 | Account picker | Bottom sheet | P0 | S-02, S-11 |
| S-04 | Category picker | Bottom sheet | P0 | S-02 |
| S-05 | Payee input | Inline + sheet | P0 | S-02 |
| S-06 | Date picker | Modal | P0 | S-02 |
| S-07 | Transactions list | Tab root | P0 | — |
| S-08 | Transaction detail | Screen | P0 | S-07, drill-downs |
| S-09 | Edit transaction | Bottom sheet | P0 | S-08 |
| S-10 | Filter & search | Bottom sheet | P0 | S-07 |
| S-11 | Accounts list | Screen | P0 | S-19 |
| S-12 | Account detail | Screen | P0 | S-11, S-01 |
| S-13 | Create / edit account | Screen | P0 | S-11 |
| S-14 | Balance check | Bottom sheet | P0 | S-12, S-01, S-19 |
| S-15 | Reports hub | Tab root | P0 | — |
| S-16 | R-01 This month | Screen | P0 | S-15 |
| S-17 | R-02 Where it goes | Screen | P0 | S-15 |
| S-18 | R-03 Limits | Screen | P0 | S-15 |
| S-19 | Settings | Tab root | P0 | — |
| S-20 | Categories list | Screen | P0 | S-19 |
| S-21 | Create / edit category | Bottom sheet | P0 | S-20 |
| S-22 | Plan hub | Tab root | P0 | — |
| S-23 | Commitments list | Screen | P0 | S-22 |
| S-24 | Create / edit commitment | Screen | P0 | S-23 |
| S-25 | Limits list | Screen | P0 | S-22 |
| S-26 | Create / edit limit | Bottom sheet | P0 | S-25 |
| S-27 | Backup & restore | Screen | P0 | S-19 |
| S-28 | Export | Screen | P0 | S-19 |
| S-29 | Import | Screen | P0 | S-19 |
| S-30 | Preferences | Screen | P0 | S-19 |
| S-31 | Onboarding | Flow (3 steps) | P0 | First launch |
| S-32 | Category drill-down | Screen | P0 | S-16, S-17 |
| S-33 | Payee drill-down | Screen | P0 | S-32 |
| S-34 | R-04 What changed | Screen | P1 | S-15 |
| S-35 | Monthly Review | Mode of S-34 | P1 | S-01 card |
| S-36 | R-05 Over time | Screen | P1 | S-15 |
| S-37 | R-06 Regular bills | Screen | P1 | S-15 |
| S-38 | Insight detail | Screen | P1 | S-01, S-15 |
| S-39 | Detected commitment review | Bottom sheet | P1 | S-23, S-01 |
| S-40 | Payees list | Screen | P1 | S-19 |
| S-41 | App lock | Screen | P1 | Launch |
| S-42 | Widget config | System surface | P1 | OS |
| S-43 | Catch-up entry | Mode of S-02 | P1 | S-02 |
| S-44 | Split transaction | Bottom sheet | P2 | S-08 |
| S-45 | Diagnostics | Screen | P2 | S-19 |

**45 screens: 33 P0, 10 P1, 2 P2.**

---

## 3. Tab contents

**Home (S-01).** Four elements only: Money available (M-02) with Owed (M-03) on a separate line · Left to spend (M-13) · Spent this month (M-04) with its comparison · at most one insight card. Plus a reliability sentence when the state is not "Reliable", and the Monthly Review card in the first week (P1).

**Transactions (S-07).** Reverse-chronological list, grouped by day, with a sticky period header. Filter and search entry point. The landing zone for every drill-down.

**Reports (S-15).** A hub listing the six views with a one-line current answer as each card's subtitle, so the hub itself is informative rather than a menu.

**Plan (S-22).** Two sections: Commitments (regular bills) and Limits. Creation and editing live here.

**Settings (S-19).** Accounts · Categories · Payees (P1) · Balance check · Backup & restore · Export · Import · Preferences · App lock (P1) · About and limitations.

---

## 4. Drill-down paths

```
Home → Money available      → S-11 Accounts → S-12 Account → transactions
Home → Left to spend        → breakdown panel → S-23 Commitments
Home → Spent this month     → S-16 This month → S-32 Category → S-33 Payee → S-08
Home → Insight card         → S-38 → filtered S-07
Reports → any L1 number     → L2 breakdown → L3 transactions → S-08
Plan → Limit                → S-18 → filtered S-07
Plan → Commitment           → occurrences → matched S-08
Settings → Account          → S-12 → S-14 Balance check
```

Every aggregate is tappable. The four structurally exempt figures (doc 08 §9) open an **explanation panel** instead of a transaction list, so no tap is ever a dead end.

---

## 5. Modal and sheet inventory

| Surface | Type | Dismissal | Preserves context |
|---|---|---|---|
| Add transaction | Bottom sheet, expandable | Swipe down or Save | Returns to origin |
| Pickers (account, category, payee) | Bottom sheet | Selection or dismiss | Returns to add sheet with state |
| Date picker | Modal | Confirm or cancel | Same |
| Balance check | Bottom sheet | Complete or skip | Returns to origin |
| Filter & search | Bottom sheet | Apply or clear | Applies to list beneath |
| Edit transaction | Bottom sheet | Save or cancel | Returns to detail |
| Delete confirmation | Alert | Confirm or cancel | Names linked records |
| Detected commitment | Bottom sheet | Confirm or dismiss | Returns to origin |

Bottom sheets are used for creation and selection; full screens for browsing and analysis; alerts only for destructive confirmation.

---

## 6. In-app deep links

Internal routes used by the widget, notifications, and insight actions:

| Route | Target | Used by |
|---|---|---|
| `/add?chip=spent` | S-02 preset to Spent | Widget, Home FAB |
| `/add?chip=moved` | S-02 preset to Moved | — |
| `/balance-check?account=<id>` | S-14 | Reliability prompt, notification |
| `/report/this-month?period=<p>` | S-16 | Monthly Review card |
| `/report/what-changed?period=<p>&mode=review` | S-35 | Monthly Review card |
| `/transactions?filter=<spec>` | S-07 filtered | Insight actions, drill-downs |
| `/commitment/<id>` | S-24 | Price-change alert |
| `/limit/<id>` | S-26 | Pace warning |

Routes are internal only. No route accepts external input, and none opens a network resource.

---

## 7. Back navigation and context preservation

**Rule.** Back always returns to the point of origin, never to a tab root.

Each tab maintains an independent navigation stack. Drilling from Home into a report and then into transactions builds a stack on the Home tab; the Reports tab retains its own separate position. Switching tabs never destroys a stack. Filter state, period selection, and scroll position survive both back-navigation and tab switching within a session, and are restored on app resume.

**Unsaved input.** Dismissing the add sheet with a non-empty amount prompts to discard. Nothing else in the product blocks navigation.
