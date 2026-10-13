<!-- stardust provenance: skill=stardust:dynamics · phase=plan draft · 2026-10-12T18:20:24.146Z · input stardust/current/_dynamics.json (4 pages, 2 findings) · target probe https://main--18fbe2a0--aemcoder.aem.page -->
# Dynamic features — draft inventory (curate into `stardust/dynamic-features.md`)

One row per detected finding. Merge duplicates, drop noise, keep every axis honest. Columns: disposition = what we do · reproducibility = what it needs · status = where it stands (reference/triage.md).

| # | id | class | feature | pages | disposition | reproducibility | status | pattern | decision needed | notes |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | s-site-search-form | S | site search form → / | 3/4 (reach 65/66) | index-backed | self | pending | search-index-backed | none (corpus = the migrated pages; second corpora stay out) |  |
| 2 | x-sign-in-account-links | X | sign-in / account links | 3/4 | decided-out | needs-backend | pending | decided-out | auth / commerce on the new host? |  |

## Triage

- **Ships autonomously (reproducibility `self`):** 1 row(s) — search-index-backed.
- **One owner decision batch:** 0 row(s) — none.
- **Already delivered by the capture pipeline:** 0 row(s) — no work.
- **Host-bound on the target:** 0 of 0 probed API paths — the off-origin data work.

## Phases

- **search** — 1
- **register** — 1
