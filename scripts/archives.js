/**
 * Date and tag archive links (source: WordPress /YYYY/MM/ and /tag/{slug}/ archives, authored
 * with the old host) point at the index-driven archive listings on /search (`?m=YYYYMM` and
 * `?tag={slug}`, as WordPress accepts them).
 */
const SOURCE_HOST = 'blog.osoco.de';

/**
 * The /search archive listing an archive link points at.
 * @param {string} href The authored link (absolute or relative)
 * @returns {string|null} The listing href, or null if the link is not an archive link
 */
export function archiveHref(href) {
  const url = new URL(href, window.location);
  if (url.hostname !== SOURCE_HOST && url.origin !== window.location.origin) return null;
  const month = url.pathname.match(/^\/(\d{4})\/(\d{2})\/?$/);
  if (month) return `/search?m=${month[1]}${month[2]}`;
  const tag = url.pathname.match(/^\/tag\/([^/]+)\/?$/);
  if (tag) return `/search?${new URLSearchParams({ tag: decodeURIComponent(tag[1]) })}`;
  return null;
}

/**
 * Points every archive link in a container at its /search listing.
 * @param {Element} container The element holding the links
 */
export function decorateArchiveLinks(container) {
  container.querySelectorAll('a[href]').forEach((a) => {
    const href = archiveHref(a.getAttribute('href'));
    if (href) a.href = href;
  });
}
