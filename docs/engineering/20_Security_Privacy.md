# 20 — Security & Privacy

The threat model is narrow because the architecture is narrow: there is no server, no account, no network traffic, and no third party. Almost every classic risk in a finance app is eliminated by construction rather than mitigated by control. What remains is device-local, and the controls below address exactly that — nothing more, because unnecessary security complexity in an offline app buys nothing and costs usability.

---

## 1. Threat model

**In scope**
| Threat | Exposure | Control |
|---|---|---|
| Casual access to an unlocked device | Someone opens the app and reads finances | App lock (P1) |
| Device theft or loss | Full data at rest | OS storage encryption; DB encryption (P2); no recovery without the user's own backup |
| Backup or export file read by another app or person | Files leave the app sandbox by user choice | User-chosen location; clear warning that exports are unencrypted |
| Malicious or malformed import file | Bad data, crash | Strict validation, staged restore (doc 16) |
| Screenshot in the app switcher | Balances visible in recents | Obscure content when backgrounded, if app lock is on |
| Other apps reading app storage | Data theft | Private app storage; no world-readable files |

**Out of scope by architecture**
Network interception · server breach · credential theft · session hijacking · third-party data sharing · advertising or tracking SDKs · supply-chain data exfiltration. None of these have an attack surface because none of the corresponding components exist.

## 2. Local data protection

All application data lives in the app's private storage directory, inaccessible to other apps under normal OS conditions. The app relies on platform full-disk encryption as its baseline (active by default on supported Android and iOS versions).

**Database encryption at rest (P2).** SQLCipher-style page encryption with a key held in the platform keystore, unlocked by device credentials. Deferred to P2 deliberately: on a device with OS encryption and a screen lock, it adds meaningful protection only against physical extraction, while adding key-management failure modes that could lose a user's data outright. It ships only once backup and restore are proven robust.

**No shadow copies.** No monetary value is written outside SQLite (doc 14 §1). Logs, caches, and preference stores never contain amounts, payee names, or notes.

## 3. Sensitive data classes

| Class | Examples | Handling |
|---|---|---|
| Financial | Amounts, balances, transactions | Private storage; never logged; never in crash output |
| Behavioural | Payee names, notes, categories | Same. Payee and note text is the most identifying data in the app |
| Configuration | Preferences, theme, month start | Private storage; non-sensitive |
| Diagnostic | Invariant failures, timings | Local only; sanitised of amounts and payee names; user-exportable, never auto-sent |

**Rule.** No log line, diagnostic entry, or error message written to disk may contain an amount, a payee name, or a note. Errors reference record IDs only.

## 4. App lock (P1)

Passcode (6 digits minimum) with optional biometric unlock via the platform API. Triggered on cold launch and after backgrounding beyond a user-set threshold (immediately / 1 min / 5 min).

The passcode is stored as a salted hash using a memory-hard KDF; the plain value is never persisted. Biometric unlock uses the platform prompt and never handles the passcode itself.

**No recovery path.** Stated plainly at setup: there is no server to authenticate against, so a forgotten passcode cannot be reset. The only route back is restoring a backup into a fresh install. Making this explicit at setup is a security requirement — a hidden dead end would be worse than the lock's absence.

App lock protects the UI, not the file. It is not a substitute for device encryption, and the setup copy says so.

## 5. Backup security

Backups are **unencrypted by default**, and this is disclosed at the moment of creation: "This file contains all your financial data in readable form. Keep it somewhere private."

Rationale: an encrypted backup that the user cannot open in five years is a worse outcome than a readable one they chose where to store. Optional passphrase encryption for backups may be offered alongside P2 database encryption, with an unmissable warning that a lost passphrase means permanently lost data.

The app never uploads a backup, never chooses a location on the user's behalf, and never writes to a location the user has not explicitly picked through the system file picker.

## 6. Export and import security

**Export.** Plain CSV, unencrypted by design — the point is spreadsheet readability. The export screen states what the file contains before writing.

**Import.** Every file is untrusted input. All rows are validated (doc 16 §2), references resolve by ID only, and the entire batch is applied in one transaction after a preview. No file content is ever executed, interpreted as a formula, or used to construct a query — all database access is parameterised. CSV injection is neutralised on export by prefixing any field beginning with `=`, `+`, `-`, or `@` with a single quote, so an exported file cannot become an attack on the user's spreadsheet application.

## 7. Data deletion

The user can, at any time: delete individual transactions · delete or archive accounts · reset the entire database from Settings (double confirmation, naming the transaction count) · uninstall, which removes all app data under both platforms' guarantees.

There is no "request deletion" flow, because there is nowhere else the data exists. Settings → About states this directly.

## 8. No network transmission

The app makes **zero** network requests. This is enforced, not merely intended:
- No networking permission is declared in the manifest.
- No analytics, crash-reporting, advertising, or attribution SDK is included.
- Dependency review at every release verifies that no transitive dependency opens a socket (doc 31).
- A CI check fails the build if a networking API is referenced from application code.

Crash reporting is therefore local only: a sanitised diagnostics log the user can read and export deliberately (S-45).

## 9. No third-party data sharing

No SDK, no partner, no service, no shared identifier. The `install_id` in `app_meta` is local, random, never transmitted, and exists only to correlate the user's own diagnostic entries. No advertising ID is read.

## 10. Permissions

| Permission | When requested | Why |
|---|---|---|
| Storage / document access | At first backup, export, or import | To write and read files the user chooses |
| Notifications | At the first reminder setup | Local reminders only |
| Biometrics | At app-lock setup (P1) | Unlock |

Nothing else. Never SMS, contacts, location, camera, or network. Every permission is requested in context, at the moment of use, with an explanation — never at launch.

## 11. Privacy disclosures in-app

Settings → About states, in plain language: all data stays on this device · nothing is sent anywhere · there is no account and no sync · if you lose the device, only your own backup can recover the data · backups and exports are readable files, so keep them somewhere private.

These statements are testable claims, verified by the release checklist (doc 31), not marketing copy.
