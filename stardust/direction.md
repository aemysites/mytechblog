---
_provenance:
  writtenBy: stardust:replica
  writtenAt: 2026-10-12T18:19:16Z
  againstInput: https://blog.osoco.de/
  readArtifacts:
    - stardust/current/PRODUCT.md
    - stardust/current/DESIGN.md
    - stardust/current/DESIGN.json
---

# Direction — preserve mode (same-design migration)

Mode: PRESERVE. The target spec is the captured current state of https://blog.osoco.de/,
promoted verbatim (no direct invocation, no creative decisions).

Promoted: current/PRODUCT.md → PRODUCT.md · current/DESIGN.md → DESIGN.md ·
current/DESIGN.json → DESIGN.json (at 2026-10-12T18:19:16Z).

Permitted deltas: ONLY the entries of stardust/replica/inconsistency-register.md
(1 entry — R-01 table overflow at 360; otherwise pure replica).

Fidelity: ia verbatim · design verbatim · content verbatim.

Hands-off: activated 2026-10-12T18:19:16Z by the run invocation (--hands-off). Named assumptions:
- Roster = the 66 selected pages of stardust/.labs/site-plan.json (fixed by the run; caps not applied — 59 articles exceed the 20-per-template default, all are in the plan).
- Breakpoints from run.json "desktop,mobile" → gate widths 1440, 360. No --target-breakpoints: source breakpoints (600, 960) kept.
- Publish decision: publish (made by the run owner; recorded in stardust/eds-conversion-log.md).

## Link targets outside the planned pages (E2 link audit, 2026-10-12)

Decision: **scope extension → repoint to the source site** (all targets sit outside the 66 planned pages, so they are not capture gaps). The links stay absolute to https://blog.osoco.de/: monthly date archives (`/2021/07/` … 30 targets), the author archive, the entries/comments feeds, `wp-login.php` and WordPress.org (Meta widget, static snapshot). `wp-login.php` (503) and `/comments/feed/` (403) answer the same on the source itself.
