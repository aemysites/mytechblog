# Dynamic features — blog.osoco.de

Detected by `dynamics-detect.mjs` (4 archetype pages probed, reach from 66/66 crawled pages): no third-party hosts, no first-party APIs, no client-rendered content, no media players. Code blocks are rendered client-side by SyntaxHighlighter from server HTML — handled as a static recreation in the archetypes, not a dynamic feature.

## Listings contract
Listing pages (blog index, 4 category archives) are migrated as static documents: each listing document carries its posts' text as authored content (captured state). No query-index-fed listing block. Fields every article page emits for a future index: `title`, `description`, `date` (entry-date), `category`. Disposition of the listing behaviour: `static-snapshot` — reason "undecided — revisit at rollout" (new posts would need the listing documents edited).

## Features
| # | id | feature | class | reach | disposition | reproducibility | status | pattern | decision / owner | evidence |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | s-site-search-form | sidebar site search (GET `/?s=`) | S | 65/66 | index-backed | self | delivered | search-index-backed | none (corpus = the migrated pages) | `#searchform` input `s`; probe "Sanselan" → 2 results |
| 2 | x-sign-in-account-links | Meta widget: Log in, Entries feed, Comments feed, WordPress.org | X | 65/66 | static-snapshot | needs-backend | shipped (static snapshot) | link kept verbatim | undecided — revisit at rollout (named assumption: links kept as captured, absolute to the source host) | `https://blog.osoco.de/wp-login.php`, `/feed/`, `/comments/feed/` |
| 3 | l-post-listings | blog index + category archives (full posts, paginated) | L | 5/66 | static-snapshot | self | shipped (static snapshot) | document-first static listing | undecided — revisit at rollout | `#content article` ×N, `#nav-below` |

## Decision batch
One message to the owner (hands-off: interim tier shipped, decision named, run continues):
- **Login and feeds** — the WordPress login and RSS feeds do not exist on the new platform. Links are kept as captured; decide whether to drop the Meta widget links or point the feeds elsewhere.
- **Listings** — the post listings are migrated as static pages; decide whether new posts should populate them automatically (query index) later.

## Register (decided-out)
| feature | reason | production statement |
|---|---|---|
| — | none (no owner statement yet) | — |

## Rollout B2 verification (2026-10-12)
Fresh `dynamics-detect.mjs --from-state` over /, /blog/, /privacy-policy/, /2024/02/value-created-by-developers/: the same two detected rows (search form 65/66, Meta sign-in links) and nothing new — no third-party hosts, no first-party APIs, no client-rendered content, no media. Dispositions above stand; row 1 is delivered in D2 (helix-query.yaml + results route), rows 2–3 ship as static snapshot.
