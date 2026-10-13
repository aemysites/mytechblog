# Journal — blog.osoco.de replica

## Extract — 66/66 pages captured live, four page types (2026-10-12)

- `crawl.mjs --dynamics` over the 66 planned URLs: 66 OK, 0 failed; provenance 66/66 live (medium wait). Vision check 66 ok (one post carries a broken inline photo on the live source — capture state, replicated as captured).
- Source is stock WordPress Twenty Twelve: Open Sans (OFL, self-hosted woff2 saved), palette of greys + link blue #21759b, radius 3px, card shadow at ≥960px. Source breakpoints 600 / 960.
- Types: landing 1 (front page, no sidebar), static 1 (privacy policy), listing 5 (blog index + 4 category archives, full posts), article 59.
- Plugins: SyntaxHighlighter Evolved (code blocks on 12 pages, JS-rendered) — CSS-portation candidate; TablePress css loaded.
- Census at 1440+360 → `_computed-styles.json`; cap-probe: shell 1040px (#page, 960 + 2×40 padding).
- No locale roots; no capture gaps. Listing pagination links (/page/2/ …) and tag/author/month archives are outside the plan scope.

## Preserve-direction — spec promoted verbatim, empty register, 3 dynamic rows triaged (2026-10-12)

- current/PRODUCT.md, DESIGN.md, DESIGN.json → project root, verbatim. `stardust/direction.md` records PRESERVE mode + hands-off assumptions (roster = 66 planned pages, gate widths 1440/360, source breakpoints 600/960 kept, publish decided).
- Inconsistency register: empty — pure replica.
- Dynamics: search (self, index-backed, probe "Sanselan" → 2), Meta-widget login/feeds and post listings static-snapshot ("undecided — revisit at rollout"). Every row has a disposition.
- All 66 pages advanced to `directed`.

## Recreate — 4 archetypes re-authored and gated at 1440 + 360 (2026-10-12)

- Shared canon (`stardust/prototypes/canon.css`, Twenty Twelve values lifted from the source CSS) + per-type files; markup authored by `build-proto.mjs` (clean semantic chrome; text/links/media verbatim from the captured DOM). Code blocks (SyntaxHighlighter) and TablePress tables ported per section, scoped.
- Fixes off the instruments: 22px single entry title (≥600 rule), footer margin needed a clearfix, nav/footer inline whitespace mirrored, SyntaxHighlighter `!important` inline code + zero table margin, TablePress margin/border cascade, front-page article without rule/margin, title attributes carried, no extra aria-labels.
- R-01 registered + applied: the source TablePress table overflows 360 (+23px on live too) → table scrolls in its own box.
- Results (pixel / Δh): article 0.00%/0 both widths; listing 0.00%/0 @1440, 0.03%/0 @360; static 0.00%/0; landing 0.00%/0. content-diff none, chrome-parity quiet, Clipped 0, overflow ok, cap-probe PASS ×4, gate-all prototype table 4/4 PASS per width.
- Motion: menu toggle (360) observed live and implemented; header static; nav-menu class is a navigation.js init artifact (dead).

## Source-fidelity gate — 4/4 archetypes approved hands-off (2026-10-12)

- Approved (approvedBy hands-off) after all gates passed: index, privacy-policy, blog, 2021-07-the-truth-about-aem-run-modes.

## Handoff — Phase 5 opened: migrate → deploy → rollout, publish decided (2026-10-12)

- Phase 5 scripts copied (deploy, rollout, dynamics, migrate). Publish decision already recorded in the conversion log.

## Migrate plan — page map built, 4 archetypes rendered (2026-10-12)

- `migrate.mjs render` over the 4 approved archetypes: rendered 4, refused 0 (URL-literal paths: index.html, privacy-policy/, blog/, 2021/07/the-truth-about-aem-run-modes/). Broken links are the not-yet-rendered siblings.
- modules[] recorded per archetype from the 7 DESIGN.json candidates.
- Render units queued in `stardust/migrate/progress.json`: listing (4 siblings) and article-1…8 (58 siblings, ≤8 each); each runs after its template's C-deliver archetype unit is done. Siblings render with `stardust/prototypes/build-proto.mjs` (the archetypes' own builder) as the structural clone.

## A-inventory — 66 rows: 4 archetypes pending, 62 siblings content-pending (2026-10-12)

- inventory.mjs over the migrated tree + state roster; one project-copy fix (trailing-slash path match) removed 3 duplicate rows. rollout.json site filled (aemcoder/18fbe2a0, main).

## B-block — 7 distinct blocks, each converted once (2026-10-12)

- blocks.mjs: masthead, sidebar-widgets, colophon, post-entry, code-block, post-navigation, archive-navigation (19 instances → 7 conversions). plan.mjs: representative-first — the article archetype converts 6, blog converts archive-navigation, the rest reuse.

## B2-dynamic — fresh detect confirms the 3 triaged rows (2026-10-12)

- Re-detect on 4 pages (one per type): search form + Meta links only, no new surface. Search (index-backed) is built in D2; Meta links and listings stay static snapshot.

## C-deliver (in progress) — foundation + 3 archetypes live, article render unit 1 done (2026-10-12)

- foundation done (shell privacy-policy 1.07%/2.43%, Δh 0, chrome-compare 0; frozen 18 files). archetype-static, -landing (1.07/3.63), -article (2.63/6.28, Δh -96 @360 inside 5%) done. Residual pct = headed-live vs headless-EDS raster.
- archetype-listing (blog) was in flight when the session ended: re-run it (D15 davids-lint false positive on prose "Collection<Integer>" pending). Migrate render: article-1 done; article-2..8 and listing pending (`sh stardust/.work/render-unit.sh <unit>` then `sh stardust/.work/render-record.sh <unit> "<verdict>"`).

## Migrate render — 62 siblings rendered in 9 units, 66/66 migrated (2026-10-12)

- article-1..8 rendered 58 sibling posts (0 refused, 0 passthrough) off the gated article archetype; listing rendered the 4 category archives after archetype-listing (blog) passed its published-origin row (1440 3.43 %/Δh -175, 360 8.02 %/Δh -215, clipped 0, MISSING/HIDDEN 0).
- davids-model-lint D15 on code inside `<pre>` accepted as false positive (conversion log). state.json: 66 pages migrated.
- Next: C-deliver cluster-listing, cluster-article (encode → deploy-batch → gate-all --only), then gate-all, final.

## C-deliver — 66/66 pages delivered, published and gated (2026-10-12)

- Units: foundation, archetype ×4 (listing finished this session: blog 3.43 %/8.02 %), cluster-listing 4/4, cluster-article 58/58, gate-all 66/66 PASS at 1440 and 360 (0 clipped, 0 MISSING/HIDDEN), final (freeze unchanged, no requests).
- One encoder fix: inline `<code>` with `<br>` is authored one `<code>` per line (the pipeline drops breaks inside inline code). One source-broken image (404 on the origin) authored as its alt text in the original link.
- Coverage: 66 rows deployed with gate rows. Next: D-site (sitemap, redirects for trailing-slash URLs, root 200), D2 search, E verify, E2 links, F–I.

## D-site — sitemap 66 = 66, redirects for trailing-slash URLs, / 200 (2026-10-12)

- assemble.mjs --verify-origin exit 0 (66 served = 66 assembled); 65-row redirects sheet published, 301s verified; chrome docs noindex.

## D2-dynamic — site search delivered, parity 5/5 (2026-10-12)

- helix-query.yaml + search-results block + /search page; index 61 rows; dynamics-check 5/5 PASS (count + titles equal the source for "Sanselan" and "OSGi"). /search registered in coverage; served sitemap 67 = assembled 67. Rows 2–3 ship as static snapshot.

## E-full-site — 67/67 verified, render check 5/5 templates (2026-10-12)

- verify.mjs on the live origin: 67 checked, 67 verified, 0 failed (gate rows all pass). Headless render check (landing, static, listing, article, search): body.appear, sections > 0, 0 pageerrors, 0 broken images. No restoreAtDelivery entries (no media on the source).

## E2-link-audit — 68/68 internal links 200, chrome published (2026-10-12)

- localize-links --check PASS (0 localizable left); every href GET: internal 68/68 = 200, source-host 43/45 (wp-login 503, comments feed 403 — same on the source). /nav, /footer, /sidebar published. Out-of-plan targets (date/author archives, feeds) kept on the source — decision in direction.md.

## F-optimize — gate PASS, 0 P1; 67 P2 = missing JSON-LD (2026-10-12)

- optimize.mjs --all on the live origin: P1 0, P2 67 (all `ai-search/jsonld`, platform-migration, autofix eds-jsonld → G), P3 2 (duplicate descriptions on archives, design-pass, mirrors the source's archive excerpts), 8 source-parity title-length (informational). Score 64 (ai-search 0 until G).

## G-aem — JSON-LD restored on 67 pages, optimize P2 67 → 0 (2026-10-12)

- autofix-aem: eds-jsonld is manual → source JSON-LD (verbatim) as a metadata row per page, 66 + /search redeployed + published; verify 67/67; optimize: P1 0, P2 0, P3 2 (archive duplicate descriptions, design-pass), score 64 → see scorecard.

## H-report — 67/67 verified, 66/66 gated at both widths (2026-10-12)

- Summary block in stardust/rollout/report.md; 6 learnings in stardust/learnings.md.

## I-dashboard — dashboard written (2026-10-12)

- stardust/rollout/dashboard/: 67 identified · 67 prototyped · 67 deployed · 54 optimised (13 carry only P3/source-parity informational findings).

## Handoff — complete: 66/66 pages live, gated and verified (2026-10-12)

- migrate → deploy → rollout finished: 66 planned pages + /search published on aem.live, gate-all 66/66 PASS at 1440 and 360, verify 67/67, optimize P1 0 / P2 0, search parity 5/5, redirects + sitemap live. done-check: complete, no gaps.
