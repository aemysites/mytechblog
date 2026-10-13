# Learnings — blog.osoco.de replica

- **Inline `<code>` loses `<br>` in the EDS pipeline.** WordPress posts with multi-line snippets inside an inline `<code>` (no `<pre>`) collapse to one line once delivered (+372 px Δh on one post). Author one `<code>` per line with the breaks between them; the gate's height criterion is what caught it.
- **An unreachable image fails the whole page** (`about:error` in the delivered HTML). A source image that 404s on the origin itself cannot be ingested; author its alt text in place (what the source renders) and log the deviation.
- **davids-model-lint D15 does not exempt `<pre>`.** Generic types like `Collection<Integer>` inside a code block trip it; check every D15 hit sits inside `<pre>` (re-lint with `<pre>` blanked) instead of re-encoding prose.
- **WordPress trailing-slash URLs 404 on EDS**: a redirects sheet with one row per source path (`/x/` → `/x`) keeps every inbound link working.
- **JSON-LD survives as a `JSON-LD` metadata row** — the pipeline renders it as a head `<script type="application/ld+json">`, which server-side detectors see. Carry the source's schema graph verbatim.
- **gate-all over ~60 pages needs a longer run-bg deadline** (probes ~4 pages / 100 s per width); with `--skip-existing` a deadline kill loses no captures.
