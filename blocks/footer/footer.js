import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * Colophon (site-info): the /footer document's paragraphs move into `.site-info`; a decorative
 * separator (rendered as "/" by CSS, like the source) sits between consecutive links.
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  if (block.querySelector(':scope > .site-info')) return;
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);
  if (!fragment) return;

  const info = document.createElement('div');
  info.className = 'site-info';
  fragment.querySelectorAll('.default-content-wrapper > *').forEach((el) => info.append(el));
  info.querySelectorAll('a').forEach((a) => {
    const next = a.nextElementSibling;
    if (next && next.tagName === 'A') {
      const sep = document.createElement('span');
      sep.className = 'sep';
      sep.setAttribute('role', 'separator');
      sep.setAttribute('aria-hidden', 'true');
      a.after(sep);
    }
  });

  block.textContent = '';
  block.append(info);
}
