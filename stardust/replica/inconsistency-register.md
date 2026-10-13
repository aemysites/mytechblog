# Inconsistency register — blog.osoco.de replica

Everything not listed here is frozen; any design delta found by the gate is a
defect, not an improvement.

## R-01 — TablePress data table overflows the page at small widths

- **Evidence:** live https://blog.osoco.de/blog/ (and the post "Migrating from the Apache Felix SCR Annotations to the OSGi Declarative Services Annotations") at 360px: `document.documentElement.scrollWidth` 383 > viewport 360 (+23px), measured by measure.mjs (stardust/replica/gates/blog-360/overflow-iter3.txt). The 4-column "Annotation Mapping" table is 359px wide inside a 312px content column.
- **Finding:** a defect — the whole page scrolls sideways on phones because one table is wider than its column; the replica's delivery gate fails any page wider than its viewport.
- **Minimal change:** wrap each data table in a box with `overflow-x: auto` so the table scrolls inside its own box; table size, cells, colours and everything else unchanged. No effect at ≥600px (the table fits).
- **Status:** applied
- **Where:** article and listing pages that carry a TablePress table (blog index, 2016-05 "Migrating from the Apache Felix SCR Annotations…").
