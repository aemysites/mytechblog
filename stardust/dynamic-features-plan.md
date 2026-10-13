# Dynamic features — plan

## Phase search (row 1, self)
- Deliverable: `helix-query.yaml` in the code branch (index of the migrated pages: path, title, description) + a search results behaviour for the sidebar form (form submits to a results route on the EDS host; the results render from `/query-index.json`). The form never keeps the source origin's results URL.
- Verification: `search-query` parity check, term "Sanselan" → expectCount 2, expectTitles ["Apache iBatis and Apache Sanselan Session", "New Projects: Apache Sling and Apache Sanselan"], at 1440 and 360 on the published origin.
- Effort: small. Runs in rollout B2.

## Rows 2–3 (static-snapshot)
- Static path only: links migrated verbatim; listings as authored documents. Revisit at rollout; no owner input needed to continue.
