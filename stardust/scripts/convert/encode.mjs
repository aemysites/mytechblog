#!/usr/bin/env node
// encode.mjs — the shared ENCODER of the blog.osoco.de replica: migrated page → DA document.
// Reads stardust/migrated/<path>/index.html (falls back to a structural clone built from the
// capture by stardust/prototypes/build-proto.mjs when the page is not migrated) and writes
// content/<delivered-path>.html in DA format: body > header/main/footer, one top-level div per
// section, blocks as <div class="name variant"> rows/cells, a metadata block (Title,
// Description, Template). Content is verbatim; only structure is re-encoded.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import * as cheerio from 'cheerio';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../../..');
const HELP = `encode.mjs — migrated page → DA document (blog.osoco.de replica encoder)

Usage:
  node stardust/scripts/convert/encode.mjs [options] <slug…>
  node stardust/scripts/convert/encode.mjs --chrome [options]     nav, footer, sidebar documents
  node stardust/scripts/convert/encode.mjs --all [options]        every page of the inventory

Options:
  --content <dir>        output root (default content)
  --media-ledger <file>  da-media-upload ledger used to map local images to DA URLs
                         (default stardust/deploy/media-ledger.json)
  --source-host <host>   the live host (default blog.osoco.de)
  --chrome-from <slug>   page whose chrome feeds --chrome (default privacy-policy)
  --dry-run              print the documents' paths and block census, write nothing
  --help                 this text

Blocks emitted: aligned-image (left|right|center), code (java|jscript|xml|plain, nogutter, wrapped, preformatted), table
(striped), entry-meta, post-nav, section-metadata (Style: archive-header | demoted),
metadata. Listing pages keep exactly one <h1> (the archive title, else the first entry title);
other entry titles are <h2>. A section whose content carries an <h1> while the page already has
its title <h1> is authored one heading level down with Style "demoted" (styled identically).
Each such re-levelling is printed as DEVIATION for migrate.mjs deviation.
Exit: 0 written · 1 usage/input error.`;

const args = process.argv.slice(2);
const opt = (name, def) => {
  const i = args.indexOf(name);
  if (i < 0) return def;
  const v = args[i + 1];
  if (!v || v.startsWith('--')) {
    console.error(`encode: ${name} needs a value`);
    process.exit(1);
  }
  args.splice(i, 2);
  return v;
};
const flag = (name) => {
  const i = args.indexOf(name);
  if (i < 0) return false;
  args.splice(i, 1);
  return true;
};
if (flag('--help') || flag('-h')) {
  console.log(HELP);
  process.exit(0);
}
const CONTENT = path.resolve(ROOT, opt('--content', 'content'));
const LEDGER = path.resolve(ROOT, opt('--media-ledger', 'stardust/deploy/media-ledger.json'));
const HOST = opt('--source-host', 'blog.osoco.de');
const CHROME_FROM = opt('--chrome-from', 'privacy-policy');
const DRY = flag('--dry-run');
const CHROME = flag('--chrome');
const ALL = flag('--all');
const unknown = args.find((a) => a.startsWith('--'));
if (unknown) {
  console.error(`encode: unknown option ${unknown}`);
  process.exit(1);
}

const ORIGIN = `https://${HOST}`;
const readJson = (f) => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));
const state = readJson('stardust/state.json');
const inventory = readJson('stardust/rollout/coverage/pages.json').pages;
const INV_PATHS = new Set(inventory.map((p) => p.path));
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escAttr = (s) => esc(s).replace(/"/g, '&quot;');
// prose text: a literal "<" before a word (e.g. "Collection<Integer>") is authored as the numeric
// entity — same character on the page, but not read as markup by the content-model lint (D15)
const escProse = (s) => esc(s).replace(/&lt;(?=\s*[a-z])/gi, '&#60;');

/* ---------- page resolution ---------- */
function pageInfo(slug) {
  const st = state.pages.find((p) => p.slug === slug);
  const inv = inventory.find((p) => p.slug === slug);
  if (!st && !inv) throw new Error(`unknown slug ${slug}`);
  const url = st?.url || inv.source.sourceUrl;
  const urlPath = new URL(url).pathname;
  const delivered = urlPath.replace(/\/$/, '') || '/';
  const file = delivered === '/' ? 'index.html' : `${delivered.slice(1)}.html`;
  let template = st?.type;
  if (!template && inv?.templateId) template = state.pages.find((p) => p.slug === inv.templateId)?.type;
  return {
    slug, url, urlPath, delivered, file, template: template || 'article',
  };
}

function sourceHtml(info) {
  const rel = info.urlPath.replace(/^\/|\/$/g, '');
  const migrated = path.join(ROOT, 'stardust/migrated', rel, 'index.html');
  if (fs.existsSync(migrated)) return { html: fs.readFileSync(migrated, 'utf8'), from: migrated };
  const outDir = path.join(ROOT, 'stardust/.work/encode');
  execFileSync('node', [path.join(ROOT, 'stardust/prototypes/build-proto.mjs'), '--out-dir', outDir, info.slug], { stdio: 'pipe' });
  const clone = path.join(outDir, `${info.slug}-proposed.html`);
  return { html: fs.readFileSync(clone, 'utf8'), from: clone };
}

/* ---------- links + media ---------- */
function href(raw, base) {
  if (!raw) return raw;
  if (/^(mailto:|tel:|#|javascript:)/i.test(raw)) return raw;
  let u;
  try {
    u = new URL(raw, base);
  } catch {
    return raw;
  }
  const host = u.hostname.replace(/^www\./, '');
  if (host !== HOST) return u.href;
  let p = u.pathname.replace(/\/index\.html$/, '/');
  const norm = p.replace(/\/$/, '') || '/';
  if (INV_PATHS.has(norm)) return `${norm}${u.search}${u.hash}`;
  if (!p.endsWith('/') && !/\.[a-z0-9]+$/i.test(p)) p += '/';
  return `${ORIGIN}${p}${u.search}${u.hash}`;
}

let ledger = null;
function mediaUrl(src, base) {
  const file = decodeURIComponent(path.basename(new URL(src, base).pathname));
  if (ledger === null) {
    ledger = fs.existsSync(LEDGER) ? JSON.parse(fs.readFileSync(LEDGER, 'utf8')) : {};
  }
  const entries = Array.isArray(ledger.entries) ? ledger.entries
    : Object.entries(ledger.entries || ledger.files || ledger)
      .map(([k, v]) => (typeof v === 'object' && v ? { file: k, ...v } : { file: k, url: v }));
  const hit = entries.find((e) => e && typeof e === 'object'
    && path.basename(String(e.file || e.localPath || e.name || '')) === file && (e.url || e.contentUrl));
  if (hit) return hit.url || hit.contentUrl;
  // not rehosted yet: keep the captured source URL (media-reconcile decides keep/omit)
  const live = new URL(src, base);
  if (live.hostname.replace(/^www\./, '') === HOST) return live.href;
  return `${ORIGIN}/wp-content/uploads/${file}`;
}

/* ---------- inline cleaning ---------- */
const INLINE_KEEP = new Set(['a', 'em', 'strong', 'b', 'i', 'code', 'br', 'sub', 'sup', 'del',
  's', 'u', 'img', 'q', 'cite', 'small', 'kbd', 'tt']);
const BLOCK_KEEP = new Set(['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li',
  'blockquote', 'pre']);

function inline($, nodes, base) {
  let out = '';
  nodes.each((i, n) => {
    if (n.type === 'text') {
      out += escProse($(n).text());
      return;
    }
    if (n.type !== 'tag') return;
    const tag = n.tagName.toLowerCase();
    const $n = $(n);
    if (!INLINE_KEEP.has(tag) && !BLOCK_KEEP.has(tag)) {
      out += inline($, $n.contents(), base);
      return;
    }
    if (tag === 'br') {
      out += '<br>';
      return;
    }
    if (tag === 'img') {
      const alt = $n.attr('alt') || '';
      out += `<img src="${escAttr(mediaUrl($n.attr('src'), base))}" alt="${escAttr(alt)}">`;
      return;
    }
    const attrs = [];
    if (tag === 'a') {
      const h = $n.attr('href');
      if (!h) {
        out += inline($, $n.contents(), base);
        return;
      }
      attrs.push(`href="${escAttr(href(h, base))}"`);
      if ($n.attr('title')) attrs.push(`title="${escAttr($n.attr('title'))}"`);
    }
    const t = tag === 'b' ? 'strong' : (tag === 'i' ? 'em' : tag);
    if (t === 'code') {
      // the delivery pipeline drops <br> inside inline code (lines collapse into one):
      // one <code> per line, the breaks between them — same rendering, the theme's code has no box
      const inner = inline($, $n.contents(), base);
      if (inner.includes('<br>')) {
        out += inner.split('<br>').map((seg) => (seg.trim() ? `<code>${seg}</code>` : seg)).join('<br>');
        return;
      }
    }
    out += `<${t}${attrs.length ? ` ${attrs.join(' ')}` : ''}>${inline($, $n.contents(), base)}</${t}>`;
  });
  return out;
}

const block = (name, rows) => `<div class="${name}">${rows.map((cells) => `<div>${cells.map((c) => `<div>${c}</div>`).join('')}</div>`).join('')}</div>`;

/* ---------- entry content → section children ---------- */
function codeText($, el) {
  return $(el).find('td.code-lines .line').map((i, l) => $(l).text()).get().join('\n');
}

function encodeContent($, $content, base, census, shift) {
  const parts = [];
  let loose = '';
  const flush = () => {
    if (loose.trim()) parts.push(`<p>${loose.trim()}</p>`);
    loose = '';
  };
  const kids = $content.contents().toArray();
  for (let i = 0; i < kids.length; i += 1) {
    const n = kids[i];
    if (n.type === 'text') {
      if ($(n).text().trim()) loose += escProse($(n).text());
      else if (loose) loose += ' ';
      continue; // eslint-disable-line no-continue
    }
    if (n.type !== 'tag') continue; // eslint-disable-line no-continue
    const $n = $(n);
    const tag = n.tagName.toLowerCase();
    const cls = $n.attr('class') || '';
    if (INLINE_KEEP.has(tag) || tag === 'span' || tag === 'time') {
      if (/table-description/.test(cls)) {
        flush();
        continue; // eslint-disable-line no-continue
      }
      loose += inline($, $(n), base);
      continue; // eslint-disable-line no-continue
    }
    flush();
    if (/^h[1-6]$/.test(tag)) {
      const lvl = Math.min(6, Number(tag[1]) + shift);
      parts.push(`<h${lvl}>${inline($, $n.contents(), base)}</h${lvl}>`);
    } else if (tag === 'p') {
      // WordPress aligned image opening a paragraph (img.alignright|alignleft|aligncenter):
      // an aligned-image block placed before the paragraph, which keeps wrapping around it
      const first = $n.contents().toArray().find((c) => c.type === 'tag' || $(c).text().trim());
      const fcls = first && first.type === 'tag' ? ($(first).attr('class') || '') : '';
      const align = (fcls.match(/\balign(left|right|center)\b/) || [])[1];
      if (align && (first.tagName === 'img' || $(first).children('img').length === 1)) {
        census.add('aligned-image');
        parts.push(block(`aligned-image ${align}`, [[inline($, $(first), base)]]));
        $(first).remove();
      }
      const html = inline($, $n.contents(), base).trim();
      if (html) parts.push(`<p>${html}</p>`);
    } else if (tag === 'ul' || tag === 'ol' || tag === 'blockquote') {
      parts.push(`<${tag}>${inline($, $n.contents(), base).trim()}</${tag}>`);
    } else if (tag === 'pre') {
      const sh = $n.find('div.code-block').first();
      if (sh.length) {
        const lang = sh.attr('data-lang') || 'plain';
        census.add('code');
        parts.push(block(`code ${lang} wrapped`, [[`<pre><code>${esc(codeText($, sh))}</code></pre>`]]));
      } else if (/\bis-wrapped\b/.test(cls)) {
        census.add('code');
        parts.push(block('code preformatted', [[`<pre><code>${esc($n.text())}</code></pre>`]]));
      } else {
        parts.push(`<pre><code>${esc($n.text())}</code></pre>`);
      }
    } else if (tag === 'div' && /\bcode-block\b/.test(cls)) {
      const lang = $n.attr('data-lang') || 'plain';
      census.add('code');
      parts.push(block(`code ${lang}`, [[`<pre><code>${esc(codeText($, n))}</code></pre>`]]));
    } else if ((tag === 'div' && /\btable-scroll\b/.test(cls)) || tag === 'table') {
      const $t = tag === 'table' ? $n : $n.find('table').first();
      const rows = $t.find('tr').toArray().map((tr) => $(tr).children('th, td').toArray()
        .map((c) => inline($, $(c).contents(), base).trim()));
      // the TablePress description (a following span) rides as a single-cell last row
      let j = i + 1;
      while (j < kids.length && kids[j].type === 'text' && !$(kids[j]).text().trim()) j += 1;
      const next = kids[j];
      if (next && next.type === 'tag' && /table-description/.test($(next).attr('class') || '')) {
        rows.push([inline($, $(next).contents(), base).trim()]);
      }
      const striped = $t.find('tbody.is-striped').length ? ' striped' : '';
      const noHead = $t.find('thead').length ? '' : ' no-header';
      census.add('table');
      parts.push(block(`table${striped}${noHead}`, rows));
    } else if (tag === 'figure' || tag === 'div') {
      const sub = encodeContent($, $n, base, census, shift);
      parts.push(...sub);
    } else if (tag === 'hr') {
      // section-internal rule: not representable in a DA section; dropped (no visible text)
    } else {
      const html = inline($, $n.contents(), base).trim();
      if (html) parts.push(`<p>${html}</p>`);
    }
  }
  flush();
  return parts;
}

function metaBlock(rows) {
  return block('metadata', rows.filter(([, v]) => v).map(([k, v]) => [esc(k), esc(v)]));
}

function doc(sections) {
  return `<body>
  <header></header>
  <main>
${sections.map((s) => `    <div>${s}</div>`).join('\n')}
  </main>
  <footer></footer>
</body>
`;
}

/* ---------- pages ---------- */
function encodePage(slug) {
  const info = pageInfo(slug);
  const { html, from } = sourceHtml(info);
  const $ = cheerio.load(html);
  const base = info.url;
  const census = new Set();
  const deviations = [];
  const $main = $('main').first();
  const sections = [];
  const archive = $main.find('header.archive-header').first();
  const articles = $main.find('article.entry').toArray();
  const listing = info.template === 'listing';
  let h1Used = false;

  if (archive.length) {
    const title = inline($, archive.find('.archive-title').first().contents(), base).trim();
    sections.push(`<h1>${title}</h1>${block('section-metadata', [['Style', 'archive-header']])}`);
    census.add('section-metadata');
    h1Used = true;
  }

  articles.forEach((a, idx) => {
    const $a = $(a);
    const $title = $a.find('.entry-header .entry-title').first();
    const titleHtml = inline($, $title.contents(), base).trim();
    const lvl = h1Used ? 2 : 1;
    if (listing && lvl === 2) {
      deviations.push(`entry title ${idx + 1} "${$title.text().trim()}" authored as <h2> (one <h1> per page)`);
    }
    h1Used = true;
    const $content = $a.find('.entry-content').first();
    const shift = $content.find('h1').length ? 1 : 0;
    if (shift) deviations.push(`entry ${idx + 1}: content headings authored one level down (h1→h2…), Style demoted`);
    const parts = [`<h${lvl}>${titleHtml}</h${lvl}>`, ...encodeContent($, $content, base, census, shift)];
    const $meta = $a.find('footer.entry-meta').first();
    const metaHtml = inline($, $meta.contents(), base).replace(/\s+/g, ' ').trim();
    if (metaHtml) {
      census.add('entry-meta');
      parts.push(block('entry-meta', [[metaHtml]]));
    }
    if (shift) {
      census.add('section-metadata');
      parts.push(block('section-metadata', [['Style', 'demoted']]));
    }
    sections.push(parts.join(''));
  });

  const $nav = $main.find('nav.nav-single, nav.nav-below').first();
  if ($nav.length) {
    const cells = $nav.find('.nav-previous, .nav-next').toArray().map((c) => {
      const $l = $(c).find('a').first();
      if (!$l.length) return '';
      const text = $l.text().replace(/\s+/g, ' ').trim();
      return `<a href="${escAttr(href($l.attr('href'), base))}">${esc(text)}</a>`;
    }).filter(Boolean);
    if (cells.length) {
      census.add('post-nav');
      sections.push(block('post-nav', [cells]));
    }
  }

  const meta = readMeta(info, $);
  const metadata = metaBlock([
    ['Title', meta.title],
    ['Description', meta.description],
    ['Template', info.template],
  ]);
  sections[sections.length - 1] += metadata;
  census.add('metadata');
  const out = doc(sections);
  const dest = path.join(CONTENT, info.file);
  if (!DRY) {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, out);
  }
  console.log(`${slug} → ${path.relative(ROOT, dest)} (${info.template}; from ${path.relative(ROOT, from)}; blocks: ${[...census].join(', ')})`);
  deviations.forEach((d) => console.log(`  DEVIATION ${slug}: ${d}`));
  return { info, deviations };
}

function readMeta(info, $) {
  let title = $('title').first().text().trim();
  let description = $('meta[name="description"]').attr('content') || null;
  const cur = path.join(ROOT, 'stardust/current/pages', `${info.slug}.json`);
  if (fs.existsSync(cur)) {
    const j = JSON.parse(fs.readFileSync(cur, 'utf8'));
    title = title || j.title;
    description = description || j.description || j.og?.description || null;
  }
  return { title, description };
}

/* ---------- chrome documents ---------- */
function encodeChrome() {
  const info = pageInfo(CHROME_FROM);
  const { html } = sourceHtml(info);
  const $ = cheerio.load(html);
  const base = info.url;
  const robots = block('metadata', [['Robots', 'noindex']]);
  const write = (name, sections) => {
    const dest = path.join(CONTENT, `${name}.html`);
    if (!DRY) {
      fs.mkdirSync(CONTENT, { recursive: true });
      fs.writeFileSync(dest, doc(sections));
    }
    console.log(`${name} → ${path.relative(ROOT, dest)}`);
  };

  // nav: site title (h1) + tagline (h2), then the main menu
  const $title = $('.site-header .site-title').first();
  const brand = `<h1>${inline($, $title.contents(), base).trim()}</h1><h2>${inline($, $('.site-header .site-description').first().contents(), base).trim()}</h2>`;
  const items = $('.main-navigation .nav-menu li').toArray()
    .map((li) => `<li>${inline($, $(li).contents(), base).trim()}</li>`).join('');
  write('nav', [brand, `<ul>${items}</ul>${robots}`]);

  // footer: the colophon links in one paragraph (the separator is decorative CSS)
  const links = $('.site-footer .site-info a').toArray()
    .map((a) => inline($, $(a), base).trim()).join(' ');
  write('footer', [`<p>${links}</p>${robots}`]);

  // sidebar: one section per widget
  const widgets = $('aside.widget-area section.widget').toArray().map((w) => {
    const $w = $(w);
    if ($w.find('form').length) {
      const label = $w.find('label').first().text().trim() || 'Search for:';
      return block('search-form', [[`<p>${esc(label)}</p>`]]);
    }
    const title = $w.find('.widget-title').first().text().trim();
    const list = $w.find('ul').first();
    const lis = list.children('li').toArray()
      .map((li) => `<li>${inline($, $(li).contents(), base).trim()}</li>`).join('');
    return `<h3>${esc(title)}</h3><ul>${lis}</ul>`;
  });
  widgets[widgets.length - 1] += robots;
  write('sidebar', widgets);
}

/* ---------- main ---------- */
try {
  if (CHROME) encodeChrome();
  const slugs = ALL ? inventory.map((p) => p.slug) : args;
  if (!CHROME && !slugs.length) {
    console.error('encode: no slug given (see --help)');
    process.exit(1);
  }
  slugs.forEach((s) => encodePage(s));
} catch (e) {
  console.error(`encode: ${e.message}`);
  process.exit(1);
}
