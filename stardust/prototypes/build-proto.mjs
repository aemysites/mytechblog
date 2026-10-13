// build-proto.mjs — author a clean replica prototype for one captured page.
// Chrome and layout are re-authored here; text, links and media come verbatim from the
// captured DOM (stardust/current/pages/<slug>.html). Styling: canon.css + <template>.css.
// Usage: node stardust/prototypes/build-proto.mjs <slug> [<slug>…]
import fs from 'node:fs';
import path from 'node:path';
import * as cheerio from 'cheerio';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const state = JSON.parse(fs.readFileSync(path.join(ROOT, 'stardust/state.json'), 'utf8'));

const KEEP = new Set(['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a', 'pre', 'code', 'ul', 'ol', 'li', 'em', 'strong', 'b', 'i',
  'img', 'blockquote', 'br', 'table', 'thead', 'tbody', 'tr', 'td', 'th', 'hr', 'sup', 'sub', 'del', 's', 'u', 'dl', 'dt', 'dd',
  'figure', 'figcaption', 'cite', 'abbr', 'small', 'big', 'q', 'kbd', 'tt', 'time', 'span']);
const STYLE_OK = new Set(['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'td', 'th', 'li', 'img']);
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function codeBlock($, el) {
  const $el = $(el);
  const lang = ($el.attr('class') || '').replace('syntaxhighlighter', '').trim().split(/\s+/)[0] || 'plain';
  const nums = $el.find('td.gutter .line').map((i, l) => $(l).text()).get();
  const lines = $el.find('td.code .line').map((i, l) => {
    const parts = $(l).contents().map((j, n) => {
      if (n.type === 'text') return esc($(n).text());
      const cls = ($(n).attr('class') || '').split(/\s+/).filter((c) => c && c !== lang).join(' ');
      return `<code class="${cls}">${esc($(n).text())}</code>`;
    }).get().join('');
    return `<div class="line">${parts}</div>`;
  }).get();
  return `<div class="code-block" data-lang="${lang}"><table><tbody><tr><td class="gutter">${nums.map((n) => `<div class="line">${n}</div>`).join('')}</td><td class="code-lines">${lines.join('')}</td></tr></tbody></table></div>`;
}

function clean($, nodes) {
  let out = '';
  nodes.each((i, n) => {
    if (n.type === 'text') { out += esc($(n).text()); return; }
    if (n.type !== 'tag') return;
    const tag = n.tagName.toLowerCase();
    const $n = $(n);
    const cls = $n.attr('class') || '';
    if (/\bsyntaxhighlighter\b/.test(cls)) { out += codeBlock($, n); return; }
    if (tag === 'script' || tag === 'style' || tag === 'noscript') return;
    const keepSpan = /tablepress-table-description/.test(cls);
    if (!KEEP.has(tag) || (tag === 'span' && !$n.attr('style') && !keepSpan)) { out += clean($, $n.contents()); return; }
    const attrs = [];
    if (tag === 'table' && /\btablepress\b/.test(cls)) attrs.push('class="data-table"');
    if (tag === 'tbody' && /row-striping/.test(cls)) attrs.push('class="is-striped"');
    if (keepSpan) attrs.push('class="table-description"');
    if (tag === 'a' && $n.attr('href')) attrs.push(`href="${esc($n.attr('href'))}"`);
    if (tag === 'img') {
      for (const a of ['src', 'alt', 'width', 'height']) if ($n.attr(a) !== undefined) attrs.push(`${a}="${esc($n.attr(a))}"`);
      const align = cls.split(/\s+/).filter((c) => /^align(left|right|center|none)$/.test(c));
      if (align.length) attrs.push(`class="${align.join(' ')}"`);
    }
    if ((tag === 'a' || tag === 'img' || tag === 'abbr') && $n.attr('title') !== undefined) attrs.push(`title="${esc($n.attr('title'))}"`);
    if (tag === 'pre' && /wp-block-preformatted/.test(cls)) attrs.push('class="is-wrapped"');
    if (STYLE_OK.has(tag) && $n.attr('style')) attrs.push(`style="${esc($n.attr('style'))}"`);
    if (tag === 'time' && $n.attr('datetime')) attrs.push(`datetime="${esc($n.attr('datetime'))}"`);
    const open = `<${tag}${attrs.length ? ` ${attrs.join(' ')}` : ''}>`;
    if (tag === 'img' || tag === 'br' || tag === 'hr') { out += open; return; }
    const html = `${open}${clean($, $n.contents())}</${tag}>`;
    // R-01 (inconsistency register): data tables scroll inside their own box instead of the page.
    out += tag === 'table' && /\btablepress\b/.test(cls) ? `<div class="table-scroll">${html}</div>` : html;
  });
  return out;
}

const localMedia = (html) => html.replace(/https:\/\/blog\.osoco\.de\/wp-content\/uploads\/\d{4}\/\d{2}\/([^"\s]+\.(?:jpe?g|png|gif))/g, (m, f) => (fs.existsSync(path.join(ROOT, 'stardust/prototypes/media', f)) ? `media/${f}` : m));

function article($, el, { single }) {
  const $a = $(el);
  const $title = $a.find('.entry-header .entry-title').first();
  const titleLink = $title.find('a').attr('href');
  const titleText = $title.text().trim();
  const title = titleLink ? `<a href="${esc(titleLink)}">${esc(titleText)}</a>` : esc(titleText);
  const content = localMedia(clean($, $a.find('.entry-content').first().contents()));
  const $meta = $a.find('footer.entry-meta').first();
  let meta = '';
  $meta.contents().each((i, n) => {
    const $n = $(n);
    if (n.type === 'tag' && /by-author/.test($n.attr('class') || '')) meta += `<span class="by-author">${clean($, $n.contents())}</span>`;
    else meta += clean($, $n);
  });
  const tag = single ? 'h1' : 'h1';
  return `<article class="entry">
  <header class="entry-header"><${tag} class="entry-title">${title}</${tag}></header>
  <div class="entry-content">${content}</div>
  <footer class="entry-meta">${meta}</footer>
</article>`;
}

function postNav($) {
  const $single = $('nav.nav-single');
  if ($single.length) {
    const prev = $single.find('.nav-previous a'); const next = $single.find('.nav-next a');
    const link = ($l, arrowFirst) => {
      if (!$l.length) return '';
      const label = $l.clone().find('.meta-nav').remove().end().text().trim();
      const arrow = $l.find('.meta-nav').text().trim();
      return `<a href="${esc($l.attr('href'))}">${arrowFirst ? `<span class="meta-nav">${arrow}</span> ${esc(label)}` : `${esc(label)} <span class="meta-nav">${arrow}</span>`}</a>`;
    };
    return `<nav class="nav-single">
  <h3 class="screen-reader-text">Post navigation</h3>
  <span class="nav-previous">${link(prev, true)}</span>
  <span class="nav-next">${link(next, false)}</span>
</nav>`;
  }
  const $below = $('#nav-below');
  if ($below.length) {
    const part = (sel, arrowFirst) => {
      const $l = $below.find(`${sel} a`);
      if (!$l.length) return '';
      const label = $l.clone().find('.meta-nav').remove().end().text().trim();
      const arrow = $l.find('.meta-nav').text().trim();
      return `<div class="${sel.slice(1)}"><a href="${esc($l.attr('href'))}">${arrowFirst ? `<span class="meta-nav">${arrow}</span> ${esc(label)}` : `${esc(label)} <span class="meta-nav">${arrow}</span>`}</a></div>`;
    };
    return `<nav class="nav-below">
  <h3 class="screen-reader-text">Post navigation</h3>
  ${part('.nav-previous', true)}${part('.nav-next', false)}
</nav>`;
  }
  return '';
}

function sidebar($) {
  const $sec = $('#secondary');
  if (!$sec.length) return '';
  const widgets = $sec.find('aside.widget').map((i, w) => {
    const $w = $(w);
    if (/widget_search/.test($w.attr('class') || '')) {
      return `<section class="widget widget-search">
  <form class="search-form" role="search" method="get" action="/search">
    <div><label class="screen-reader-text" for="s">Search for:</label> <input class="search-field" type="text" name="s" id="s" value=""> <input type="submit" value="${esc($w.find('input[type=submit]').attr('value') || 'Search')}"></div>
  </form>
</section>`;
    }
    const title = $w.find('.widget-title').first().text().trim();
    const list = clean($, $w.find('ul').first());
    return `<section class="widget">
  <h3 class="widget-title">${esc(title)}</h3>
  ${list}
</section>`;
  }).get();
  return `<aside class="widget-area" role="complementary">
${widgets.join('\n')}
</aside>`;
}

function build(slug) {
  const page = state.pages.find((p) => p.slug === slug);
  if (!page) throw new Error(`unknown slug ${slug}`);
  const html = fs.readFileSync(path.join(ROOT, `stardust/current/pages/${slug}.html`), 'utf8');
  const $ = cheerio.load(html);
  const bodyCls = $('body').attr('class') || '';
  const isFront = /template-front-page/.test(bodyCls);
  const single = /\bsingle\b/.test(bodyCls) || /\bpage\b/.test(bodyCls);
  const navItems = $('#site-navigation .nav-menu ul').first().contents().map((i, li) => {
    if (li.type === 'text') return /\s/.test($(li).text()) ? ' ' : '';
    if (li.type !== 'tag') return '';
    const $li = $(li); const $a = $li.children('a');
    const cur = /current_page_item|current-menu-item|current_page_ancestor|current-menu-ancestor/.test($li.attr('class') || '');
    return `<li${cur ? ' class="is-current"' : ''}><a href="${esc($a.attr('href'))}">${esc($a.text().trim())}</a></li>`;
  }).get();
  const archive = $('.archive-header .archive-title');
  const archiveHeader = archive.length
    ? `<header class="archive-header"><h1 class="archive-title">${clean($, archive.contents()).trim()}</h1></header>\n` : '';
  const articles = $('#content > article').map((i, a) => article($, a, { single })).get().join('\n');
  const title = $('title').text();
  const desc = $('meta[name="description"]').attr('content');
  const classes = [`tpl-${page.type}`, 'single-author', isFront ? 'is-front-page' : ''].filter(Boolean).join(' ');
  const out = `<!DOCTYPE html>
<html lang="en-US">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width">
<title>${esc(title)}</title>
${desc ? `<meta name="description" content="${esc(desc)}">\n` : ''}<link rel="icon" href="favicon.png">
<link rel="stylesheet" href="canon.css">
<link rel="stylesheet" href="${page.type}.css">
</head>
<body class="${classes}">
<div class="site" id="page">
<header class="site-header" role="banner">
  <div class="site-branding">
    <h1 class="site-title"><a href="https://blog.osoco.de/">${esc($('.site-title').first().text().trim())}</a></h1>
    <h2 class="site-description">${esc($('.site-description').first().text().trim())}</h2>
  </div>
  <nav class="main-navigation">
    <button class="menu-toggle" type="button" aria-expanded="false">${esc($('.menu-toggle').first().text().trim() || 'Menu')}</button>
    <ul class="nav-menu">${navItems.join('')}</ul>
  </nav>
</header>
<div class="site-main">
<main class="site-content" id="content">
${archiveHeader}${articles}
${postNav($)}
</main>
${isFront ? '' : sidebar($)}
</div>
<footer class="site-footer" role="contentinfo">
  <div class="site-info">${$('#colophon .site-info a').map((i, a) => `<a href="${esc($(a).attr('href'))}"${$(a).attr('title') ? ` title="${esc($(a).attr('title'))}"` : ''}>${esc($(a).text().trim())}</a>`).get().join('<span class="sep" role="separator"></span> ')}</div>
</footer>
</div>
<script src="chrome.js" defer></script>
</body>
</html>
`;
  const file = path.join(OUT_DIR, `${slug}-proposed.html`);
  fs.writeFileSync(file, out);
  const css = path.join(ROOT, `stardust/prototypes/${page.type}.css`);
  if (!fs.existsSync(css)) fs.writeFileSync(css, `/* ${page.type}.css — per-archetype layer over canon.css (${page.type} pages). */\n`);
  console.log(`${slug}: ${out.length} bytes, ${$('#content > article').length} article(s) → ${path.relative(ROOT, file)}`);
}

const args = process.argv.slice(2);
const oi = args.indexOf('--out-dir');
const OUT_DIR = oi >= 0 ? path.resolve(ROOT, args.splice(oi, 2)[1]) : path.join(ROOT, 'stardust/prototypes');
fs.mkdirSync(OUT_DIR, { recursive: true });
for (const s of args) build(s);
