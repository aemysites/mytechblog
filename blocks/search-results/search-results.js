import {
  buildBlock, decorateBlock, loadBlock, loadCSS,
} from '../../scripts/aem.js';

/**
 * Search results — the /search page (source: WordPress search, Twenty Twelve search.php).
 * Reads `s` (the source's parameter; `q` accepted too), ranks the query index like the source
 * shows it — title matches first, then description, then body text, newest first within each —
 * and renders each hit as a listing entry (title link, excerpt, entry meta) after the
 * archive header, whose heading gets the query appended. With no hit, the authored
 * "Nothing Found" cell is shown as an entry with a search form, as on the source.
 * @ew-exempt results are index-driven; the authored cell is the no-results copy.
 * @param {Element} block The search-results block element
 */
const INDEX = '/query-index.json';
const PAGE_SIZE = 10; // the source's posts_per_page

async function fetchIndex() {
  const rows = [];
  for (let offset = 0; ; offset += 500) {
    // eslint-disable-next-line no-await-in-loop
    const resp = await fetch(`${INDEX}?offset=${offset}&limit=500`);
    if (!resp.ok) break;
    // eslint-disable-next-line no-await-in-loop
    const json = await resp.json();
    rows.push(...(json.data || []));
    if (offset + 500 >= (json.total || 0)) break;
  }
  return rows;
}

const dateKey = (row) => {
  const m = String(row.meta || '').match(/\d{4}-\d{2}-\d{2}/) || String(row.path).match(/\/(\d{4})\/(\d{2})\//);
  return m ? m[0].replace(/\D/g, '') : '0';
};

function rank(rows, query) {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const hasAll = (s) => terms.every((t) => String(s || '').toLowerCase().includes(t));
  const byDate = (a, b) => dateKey(b).localeCompare(dateKey(a));
  const title = rows.filter((r) => hasAll(r.title)).sort(byDate);
  const desc = rows.filter((r) => !hasAll(r.title) && hasAll(r.description)).sort(byDate);
  const text = rows.filter((r) => !hasAll(r.title) && !hasAll(r.description) && hasAll(r.text))
    .sort(byDate);
  const seen = new Set();
  return [...title, ...desc, ...text].filter((r) => {
    const key = `${r.title}|${r.description}`.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function entryMeta(html) {
  const meta = document.createElement('div');
  meta.className = 'entry-meta';
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  tmp.querySelectorAll(':scope > div > div, :scope > div').forEach((cell) => {
    if (!cell.querySelector(':scope > div')) meta.append(...cell.childNodes);
  });
  if (!meta.childNodes.length) meta.append(...tmp.childNodes);
  const author = meta.querySelector('a[href*="/author/"]');
  const before = author?.previousSibling;
  if (before?.nodeType === Node.TEXT_NODE && before.textContent.lastIndexOf(' by') >= 0) {
    const lead = before.splitText(before.textContent.lastIndexOf(' by'));
    const span = document.createElement('span');
    span.className = 'by-author';
    author.before(span);
    span.append(lead, author);
  }
  return meta;
}

function entrySection(row) {
  const section = document.createElement('div');
  section.className = 'section entry';
  const header = document.createElement('header');
  header.className = 'entry-header';
  const h2 = document.createElement('h2');
  const a = document.createElement('a');
  a.href = row.path;
  a.rel = 'bookmark';
  a.textContent = row.title;
  h2.append(a);
  header.append(h2);
  const summary = document.createElement('div');
  summary.className = 'entry-summary';
  const p = document.createElement('p');
  p.textContent = row.description || '';
  summary.append(p);
  section.append(header, summary);
  if (row.meta) section.append(entryMeta(row.meta));
  section.dataset.sectionStatus = 'loaded';
  return section;
}

export default async function decorate(block) {
  const params = new URLSearchParams(window.location.search);
  const query = (params.get('s') || params.get('q') || '').trim();
  const section = block.closest('.section');
  const main = block.closest('main');
  const header = main?.querySelector('.section.archive-header');
  loadCSS(`${window.hlx.codeBasePath}/blocks/entry-meta/entry-meta.css`);

  const hits = query ? rank(await fetchIndex(), query) : [];
  document.title = `You searched for ${query} - A Matter of Unimportance`;

  if (hits.length) {
    const h1 = header?.querySelector('h1');
    if (h1) {
      const span = document.createElement('span');
      span.textContent = query;
      h1.append(' ', span);
    }
    const pages = Math.ceil(hits.length / PAGE_SIZE);
    const page = Math.min(Math.max(parseInt(params.get('paged'), 10) || 1, 1), pages);
    const entries = hits.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map(entrySection);
    if (pages > 1) {
      // source nav#nav-below: older (next page) on the left, newer (previous page) on the right
      const link = (n, html) => {
        const p = document.createElement('p');
        if (n < 1 || n > pages) return p;
        const a = document.createElement('a');
        const u = new URLSearchParams({ s: query });
        if (n > 1) u.set('paged', n);
        a.href = `${window.location.pathname}?${u}`;
        a.innerHTML = html;
        p.append(a);
        return p;
      };
      const nav = buildBlock('post-nav', [[
        link(page + 1, '<span class="meta-nav">←</span> Older posts'),
        link(page - 1, 'Newer posts <span class="meta-nav">→</span>'),
      ]]);
      const navSection = document.createElement('div');
      navSection.className = 'section';
      navSection.dataset.sectionStatus = 'loaded';
      navSection.append(nav);
      entries.push(navSection);
      decorateBlock(nav);
      loadBlock(nav);
    }
    section.replaceWith(...entries);
    return;
  }

  // nothing found: the authored cell becomes the entry, followed by a search form
  header?.remove();
  const cell = block.querySelector(':scope > div > div') || block;
  const heading = cell.querySelector('h1, h2, h3');
  const entryHeader = document.createElement('header');
  entryHeader.className = 'entry-header';
  if (heading) entryHeader.append(heading);
  const content = document.createElement('div');
  content.className = 'entry-content';
  content.append(...cell.childNodes);
  const label = document.createElement('p');
  label.textContent = 'Search for:';
  const form = buildBlock('search-form', [[label]]);
  content.append(form);
  section.classList.add('entry');
  section.replaceChildren(entryHeader, content);
  decorateBlock(form);
  await loadBlock(form);
}
