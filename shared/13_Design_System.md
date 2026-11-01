# 13 — Design System

Visual language: **simple, trustworthy, calm, modern, financial, approachable.** Explicitly not a dense fintech dashboard. Generous space, few colours, large numbers, quiet chrome.

---

## 1. Typography

System font stack (Roboto on Android, SF on iOS) — no bundled webfont, keeping the app small and the render fast.

| Token | Size | Weight | Line height | Use |
|---|---|---|---|---|
| `display` | 40 | 600 | 46 | Money available on Home |
| `figure-lg` | 32 | 600 | 38 | Report L1 answers, amount input |
| `figure-md` | 24 | 600 | 30 | Section totals, account balances |
| `title` | 20 | 600 | 26 | Screen titles |
| `subtitle` | 17 | 500 | 24 | Section headers, report card titles |
| `body` | 15 | 400 | 22 | Primary content, list rows |
| `body-strong` | 15 | 600 | 22 | Amounts in rows |
| `caption` | 13 | 400 | 18 | Secondary lines, dates, explanations |
| `micro` | 11 | 500 | 14 | Badges, chart axis labels |

Numerals use tabular figures everywhere money appears, so columns align and digits do not jitter as values change.

## 2. Spacing and grid

4 dp base unit. Scale: `2, 4, 8, 12, 16, 20, 24, 32, 40, 48`.
Screen horizontal padding 16 · card padding 16 · list row vertical padding 12 · section gap 24 · related-element gap 8.
Single-column layout throughout; content max width 640 dp on large screens, centred.

## 3. Colour tokens

Restrained: one accent, three semantic signals, a neutral ramp. Money is not colour-coded green and red by default — that is the reflex of a trading app, and it makes ordinary spending feel like failure.

**Neutrals (light)** `n-0 #FFFFFF` · `n-50 #F7F8F9` · `n-100 #EDEFF2` · `n-200 #DCE0E6` · `n-400 #9AA3AE` · `n-600 #5B6472` · `n-800 #2C333D` · `n-900 #171B21`
**Neutrals (dark)** `n-0 #14171B` · `n-50 #1A1E24` · `n-100 #22272E` · `n-200 #2E3540` · `n-400 #7C8695` · `n-600 #A9B2BE` · `n-800 #E2E6EB` · `n-900 #F5F7F9`
**Accent** `accent-600 #2F6F5E` (deep calm teal) · `accent-500 #3A8874` · `accent-100 #E3F0EC`
**Semantic** `positive #2E7D5B` · `attention #B4761E` · `critical #B3453C` · `info #3B6EA5`
Each has a `-bg` tint at ~8% opacity for surfaces.

**Semantic usage rules**
- `positive` — only for money coming in and limits met. Never for "you spent less", which is not inherently good.
- `attention` — over a limit, overdue commitment, "some gaps may be missing". Calm, not alarming.
- `critical` — reserved for destructive confirmation and genuine errors. **Never** used for overspending.
- Owed amounts use neutral `n-800` with the word "owed", not red.

## 4. Surfaces, borders, radius, elevation

Surfaces: `background` = n-50, `surface` = n-0, `surface-sunken` = n-100.
Border: 1 dp `n-200`; dividers `n-100`.
Radius: `sm 8` (chips, badges) · `md 12` (cards, inputs) · `lg 20` (bottom sheets, top corners only) · `full` (FAB, avatars).
Elevation: only two levels — `raised` (FAB, bottom sheet) with a soft 8 dp shadow at 8% opacity, and `flat` for everything else. Cards use borders rather than shadows to keep the surface calm.

## 5. Icons

Single outline set, 24 dp default, 2 dp stroke, on a 48 dp target. Categories draw from a curated set of ~40 glyphs covering the default categories plus common user additions. Icons never carry meaning alone — every icon in a functional position has a visible or accessible text label.

## 6. Charts and data visualisation

Four permitted types (doc 12 C-13). Palette: a single-hue sequential ramp derived from the accent for category bars, ordered by size — categorical rainbow palettes are prohibited because they imply meaning that does not exist.
Typical band: `accent-100` fill with a 45° hatch pattern, so it is distinguishable without colour.
Estimates: outlined with a dashed stroke and no fill (INV-13).
Every chart carries a caption stating the decision it supports, and an accessible text alternative listing its values.
Axis labels use `micro`; gridlines are `n-100` and minimal; no 3D, no gradients, no animation beyond a 200 ms entry fade.

## 7. States

| State | Treatment |
|---|---|
| Default | Surface, `n-800` text |
| Pressed | 4% overlay of `n-900` |
| Disabled | 38% opacity, no colour change; always paired with an explanation on attempted use |
| Selected | Filled `accent-100`, `accent-600` text, **plus** weight change |
| Warning | `attention-bg` surface, `attention` text, warning glyph |
| Error | `critical-bg` surface, `critical` text, error glyph, plain-language message |
| Estimate | Dashed outline, `n-600` text, "estimate" label |

## 8. Accessibility contrast

All text meets WCAG AA: ≥4.5:1 for body, ≥3:1 for `figure-lg` and above. Interactive elements meet ≥3:1 against their background. Both themes are verified against these ratios; the dark theme is a designed palette, not an inversion. Touch targets are ≥48 × 48 dp with ≥8 dp between adjacent targets.

## 9. Number and currency formatting

**One utility, used everywhere.** No component formats money independently.

- Symbol `₹`, prefixed, no space: `₹48,200`.
- **Indian digit grouping**: last three digits, then pairs — `₹1,00,000`, `₹12,34,567`.
- Decimals per `preferences.decimals` (0–2, default 2); trailing `.00` is suppressed in list rows and shown in detail views.
- Storage is always integer paise; display rounds only at render, never in intermediate arithmetic.
- Negative asset balances: `−₹1,200` with an "overdrawn" label.
- Owed amounts: absolute value plus "owed" — **never** a minus sign.
- Large figures in constrained space abbreviate only above ₹1 crore (`₹1.2 Cr`), never below, and never in a detail view.
- Percentages: whole numbers below 10% show one decimal; above, none. Kept % may exceed 100% or be negative and is displayed as computed with an explanation.
- Dates: `12 Mar` within the current year, `12 Mar 2025` otherwise. Relative labels (Today, Yesterday) in transaction lists only.

## 10. Motion

Purposeful and brief. Sheet present/dismiss 250 ms ease-out · chart entry fade 200 ms · toast 200 ms. No parallax, no celebratory animation, no number count-up — a balance that animates upward is harder to read and implies emotion the product should not add. All motion respects the OS reduce-motion setting, degrading to instant transitions.

## 11. Theme

Light, dark, and system-following. Dark is a designed palette with equal contrast compliance. Theme changes apply immediately without restart. Charts, chart bands, and estimate treatments have explicit dark-mode variants.

## 12. Tone of voice

Plain, calm, second person, present tense. Short sentences. No exclamation marks. No accounting or statistical vocabulary (enforced by T-80). Never congratulatory about spending less; never admonishing about spending more. Uncertainty is expressed in words ("about", "around", "roughly"), never in symbols or intervals.

Examples: "You have ₹51,200" · "Paid ₹18,400 toward your card" · "₹700 was spent but not recorded" · "A few things may be missing — check your balance?" · "Once you've used this another month, I can compare."
