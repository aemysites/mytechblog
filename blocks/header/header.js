import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * Marks the menu link of the current page (source: `current_page_item` + aria-current).
 * @param {Element} list The authored menu list
 */
function markCurrent(list) {
  // source quirk (wp_list_pages): the prepended Home item has no whitespace after it, every
  // later item is separated by a newline — inline-block gaps follow the same pattern
  [...list.childNodes].filter((n) => n.nodeType === Node.TEXT_NODE).forEach((n) => n.remove());
  [...list.children].slice(2).forEach((li) => li.before(document.createTextNode(' ')));
  const here = window.location.pathname.replace(/\/$/, '') || '/';
  list.querySelectorAll('a[href]').forEach((a) => {
    const target = new URL(a.href, window.location).pathname.replace(/\/$/, '') || '/';
    if (target === here) a.setAttribute('aria-current', 'page');
  });
}

/**
 * Wires the small-screen menu toggle (source: twentytwelve/js/navigation.js).
 * @param {HTMLButtonElement} button The toggle
 * @param {Element} menu The menu wrapper
 */
function wireToggle(button, menu) {
  if (button.dataset.wired) return;
  button.dataset.wired = 'true';
  button.addEventListener('click', () => {
    const open = menu.classList.toggle('toggled-on');
    button.classList.toggle('toggled-on', open);
    button.setAttribute('aria-expanded', String(open));
  });
}

/**
 * Masthead: site title + tagline (authored as h1/h2 in the /nav document) and the main menu.
 * Template-slotted: authored nodes are MOVED into the masthead's slots, never rebuilt.
 * @ew-exempt "Menu" toggle label is a control literal of the theme, not authored copy.
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  if (block.querySelector(':scope > .site-branding')) return;
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);
  if (!fragment) return;

  const branding = document.createElement('div');
  branding.className = 'site-branding';
  const nav = document.createElement('nav');
  nav.className = 'main-navigation';
  nav.setAttribute('aria-label', 'Main');
  const button = document.createElement('button');
  button.className = 'menu-toggle';
  button.type = 'button';
  button.setAttribute('aria-expanded', 'false');
  button.setAttribute('aria-controls', 'site-menu');
  button.textContent = 'Menu';
  const menu = document.createElement('div');
  menu.className = 'nav-menu';
  menu.id = 'site-menu';
  nav.append(button, menu);

  // site title + tagline: every heading moves into the branding slot, in authored order
  fragment.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((h) => branding.append(h));
  // the menu: every list moves into the menu slot
  fragment.querySelectorAll('ul, ol').forEach((list) => {
    markCurrent(list);
    menu.append(list);
  });

  block.textContent = '';
  block.append(branding, nav);
  wireToggle(button, menu);
}
