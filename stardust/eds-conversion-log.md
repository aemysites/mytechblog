# EDS conversion log — blog.osoco.de

- 2026-10-12T18:19:16Z — Publish decision: **publish** (made by the run owner before the run). Every delivered page, the redirects sheet and the chrome documents (nav, footer) go live on the aem.live origin.
- Script adaptation (rollout/inventory.mjs, project copy): `urlToDeliveredPath` strips the trailing slash so a roster URL `/blog/` matches the migrated archetype `/blog` (otherwise every archetype got a duplicate `-x` content-pending row).
- DA target: org `aemcoder`, site `18fbe2a0`, branch `main`; preview `main--18fbe2a0--aemcoder.aem.page`, live `main--18fbe2a0--aemcoder.aem.live`.

## Foundation (C0)

- **Global layer**: `styles/styles.css` ports `stardust/prototypes/canon.css` value-for-value (lint forced 4-decimal line-heights/percentages, rounded up so line boxes stay on whole px). Mapping: `.site` → `body` (page card; `html` carries the #e6e6e6 backdrop ≥960), `.site-content` → `main`, `article.entry` → `main .section.entry`, `.entry-content` → section default content, `.widget-area` → `body > aside`, `.site-footer` → `body > footer`. Breakpoints 600/960 (source). Fonts: self-hosted Open Sans woff2 (`fonts/`, `styles/fonts.css`, preloaded + linked in `head.html`, `font-display: swap`); Roboto removed; favicon.png.
- Layout fixes found on the preview origin: float bottom margins (24px) on `main`/`aside` stand in for the source's `#main` clearfix (footer margin was swallowed by clearance, Δh 24); `aside::after` table keeps the last widget's 48px margin inside (360 sidebar offset).
- **scripts.js**: `decorateSectionMetadata` (this boilerplate's aem.js has none), `decorateEntries` (a section opening with h1/h2 → heading MOVED into `header.entry-header`, section gets `.entry`), `loadSidebar` (the `/sidebar` fragment into `aside.widget-area[role=complementary]` after main, every template except `landing`), `lang=en-US`. Template comes from page metadata `Template` (landing|static|listing|article) → body class.
- **Blocks + decode tier**: `header` template-slotted (nav doc h1/h2 MOVED into `.site-branding`, list MOVED into `div.nav-menu`; `Menu` toggle = source navigation.js, `aria-current` on the current link; source's wp_list_pages whitespace quirk reproduced); `footer` template-slotted (paragraph MOVED into `.site-info`, decorative `/` separator span); `search-form` template-slotted (label text MOVED; form GET `s` → same-origin `/search`); `entry-meta` template-slotted (nodes MOVED; ` by <author>` grouped into the hidden `.by-author` as on the single-author source); `post-nav` template-slotted (cells classified by ←/→; covers both nav-single and the listing's nav-below — rollout plan ids post-navigation + archive-navigation); `code` reconstructive (authored pre/code MOVED into the code column, text nodes split in place into lines/tokens; in-block tokenizer reproducing SyntaxHighlighter java/jscript/xml brushes; variants lang, `nogutter`, `wrapped`, `preformatted`); `table` reconstructive (TablePress: header row, `striped`, `no-header`, single-cell last row = description; R-01 `.table-scroll`). block-roundtrip `--ew`: 0 structural 🔴 on article (code, entry-meta, post-nav) and blog (code, table, post-nav); EW editable 100 %.
- Rollout plan ids → EDS: masthead→header, colophon→footer, sidebar-widgets→/sidebar fragment + search-form, post-entry→section `.entry` + entry-meta, code-block→code, post-navigation/archive-navigation→post-nav.
- **Encoder**: `node stardust/scripts/convert/encode.mjs <slug…> | --all | --chrome` (migrated page, else a build-proto structural clone of the capture → `content/<path>.html`; metadata Title/Description(og:description)/Template; source-host links to inventory paths root-relative, the rest left absolute for localize-links; images mapped through `stardust/deploy/media-ledger.json`). Media: `pet-300x169.jpg` → `content.da.live/aemcoder/18fbe2a0/media/osoco/`.
- **Deviations**: listing pages keep one `<h1>` (archive title, else first entry title), other entry titles `<h2>`; entries whose content carries `<h1>` are authored one level down with section Style `demoted` (sizes identical) — recorded for `blog` via `migrate.mjs deviation`. `/nav` carries the site title `<h1>` by design (delivery-lint P1 "fragment h1" accepted: the page document keeps exactly one h1).
- Chrome docs `nav`, `footer`, `sidebar` (Robots noindex) and shell `privacy-policy` deployed + published (ledger `stardust/deploy/ledger-foundation.json`).
- **Shell gate** (preview origin): 1440 1.07 % Δh 0, 360 2.43 % Δh 0, clipped 0, MISSING/HIDDEN 0; header bands 0.24 %/0.32 %, footer 0.32 %/2.28 % (360). The residual is instrument asymmetry: gate-all shoots the origin with headed Chrome and the EDS host with headless Chromium (different text shaping/wrapping); the same EDS page shot headed measures 0.01 % (1440) / 0.05 % (360) and 0.00 % on every header/footer band. chrome-compare (header contract, 1440+360, menu drawer) exit 0.
- Accepted: `davids-model-lint` D15 🔴 on text inside a `code` block's `<pre>` (e.g. blog.html "Collection&lt;Integer&gt;" in a JSON sample) is a false positive — the lint strips tags without exempting `<pre>`, and a code block's job is to show code; every D15 hit is checked to sit inside `<pre>` before a page is written. Open: DA's pipeline inserts a space between `&nbsp;` and adjacent `<em>` (privacy-policy contact line) — no authoring workaround found.

## Archetypes C — landing (index) and article (2021-07-the-truth-about-aem-run-modes)

- landing: new block `aligned-image` (template-slotted; variants right|left|center) — the encoder emits it for a WordPress img.align* opening a paragraph (the image inside a floated picture capped at 288px at 360; the source caps at the column width). Fix round 1 → 360 headed-symmetric 0.00 %.
- article: `code.preformatted` carrier `code` inherited the theme's inline-code line-height 2 (+18px at 1440, +35px at 360); scoped override in blocks/code/code.css (round 1) → headed-symmetric 0.00 % at 1440 and 360.
- Gate rows (gate-all, preview host): index 1440 1.07 % Δh 0 / 360 3.63 % Δh 0; article 1440 2.63 % Δh 0 / 360 6.28 % Δh -96 (headless-Chromium wrapping on the EDS side; the same page shot headed = 0 px Δh, 0.00 %). Clipped 0, MISSING/HIDDEN 0.
- Motion (360, article): menu toggle `toggled-on` parity; `nav-menu` init class is static in the build (dead on live, as recorded in progress.json).

## Archetype C — listing (blog)

- Re-encoded with prose `<` authored as `&#60;`; the remaining D15 🔴 sits inside a code block's `<pre>` (accepted, see Foundation). Deployed + published (ledger `stardust/deploy/ledger-archetypes.json`).
- Gate row (gate-all, published origin): 1440 3.43 % Δh -175, 360 8.02 % Δh -215 (both inside the 5 % height tolerance; headless-EDS wrapping vs headed origin as on the other archetypes). Clipped 0, MISSING/HIDDEN 0. PASS.
- cluster-article: `/2008/04/innovation-at-apache-the-fun-is-back-with-apache-sling` references `wp-content/uploads/dsc_0593_small.JPG`, which 404s on the source origin — EDS refuses an unreachable image (`about:error` in the delivered page), so the dead `<img>` is authored as its alt text inside the original link — what the source renders for the broken image (capture-state deviation, this page only).

## Clusters — listing (4 category archives) and article (58 posts)

- Encoded with the archetype encoder, davids-model-lint clean (D15 only inside `<pre>`), deployed + published (`stardust/deploy/ledger-cluster-{listing,article}.json`).
- Encoder fix found by the article gate (`/2009/04/rapid-development-with-apache-sling-using-an-ide` Δh 372 @1440): the delivery pipeline drops `<br>` inside inline `<code>` (multi-line snippets collapsed). encode.mjs now authors one `<code>` per line with the breaks between them (the theme's inline code has no box, so the rendering is identical). Only that post and `/category/everything` (which lists it) changed; both re-deployed and re-gated: post 3.46 %/Δh -74 @1440, 6.82 %/-70 @360; everything 3.77 %/-294, 8.36 %/-373 (inside 5 %).
- Gate rows: listing 4/4 PASS both widths; article 58/58 PASS both widths after the fix (1440 ≤ 3.9 %, 360 ≤ 7.9 %), clipped 0, MISSING/HIDDEN 0.

## D-site

- Served sitemap 66 = assembled 66 (chrome docs nav/footer/sidebar carry Robots noindex). Root `/` 200 (source root serves a page → delivered as `index`).
- Redirects sheet `/redirects.json` (65 rows, `stardust/redirects.tsv`): every WordPress trailing-slash source path → its extensionless EDS path (the pipeline 404s `/blog/`); PUT to DA, previewed + published; verified 301 on the live origin.

## D2 — site search

- `helix-query.yaml` (code branch): index `/query-index.json` over `/**` minus nav/footer/sidebar/search and the aggregating archives (`/blog`, `/category/**` — the source search returns posts and pages, never archives); properties title (main h1), description, meta (entry-meta HTML), text (first section), template. 61 rows after republishing the pages.
- `/search` page (Template listing): archive header "Search Results for:" + new block `search-results` — reads `s` (also `q`), ranks title → description → body text, newest first within each tier (the source's order), 10 per page with older/newer post-nav as on the source; no hit → the authored "Nothing Found" copy + a search form. The sidebar form already GETs `/search?s=`. Indexed in the sitemap (no noindex: a coverage row must be served).
- Parity (`stardust/dynamics/parity.json`, `dynamics-check.mjs`): 5/5 PASS — "Sanselan" 2 = source 2, "OSGi" page 1 10 = source 10 with the source's top titles.

## G — JSON-LD

- Every page carries its source page's Yoast schema graph verbatim as a `JSON-LD` metadata row (the delivery pipeline renders it as `<script type="application/ld+json">` in the head); `/search` carries the site's own `WebSite` node (with its search action) under a `SearchResultsPage`. optimize: P2 67 → 0, P1 0.
