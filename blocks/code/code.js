/*
 * A small tokenizer reproducing the SyntaxHighlighter 3.0.x brushes used on the source
 * (java, jscript, xml). Returns non-overlapping [start, end, cssClass] ranges over the text.
 */

const C_LINE = /\/\/.*$/gm;
const C_BLOCK = /\/\*[\s\S]*?\*\//gm;
const DQ = /"(?:[^"\\\n]|\\.)*"/g;
const SQ = /'(?:[^'\\\n]|\\.)*'/g;

const words = (list) => new RegExp(`\\b(?:${list.split(' ').join('|')})\\b`, 'gm');

const JAVA_KEYWORDS = 'abstract assert boolean break byte case catch char class const continue '
  + 'default do double else enum extends false final finally float for goto if implements '
  + 'import instanceof int interface long native new null package private protected public '
  + 'return short static strictfp super switch synchronized this throw throws true transient '
  + 'try void volatile while';

const JS_KEYWORDS = 'break case catch class continue default delete do else enum export extends '
  + 'false for function if implements import in instanceof interface let new null package '
  + 'private protected static return super switch this throw true try typeof var while with '
  + 'yield';

const BRUSHES = {
  java: [
    [C_LINE, 'comments'],
    [/\/\*(?!\*)[\s\S]*?\*\//gm, 'comments'],
    [/\/\*\*[\s\S]*?\*\//gm, 'preprocessor'],
    [DQ, 'string'],
    [SQ, 'string'],
    [/\b(?:\d+(?:\.\d+)?|0x[a-f0-9]+)\b/gi, 'value'],
    [/(?!@interface\b)@[$\w]+\b/g, 'color1'],
    [/@interface\b/g, 'color2'],
    [words(JAVA_KEYWORDS), 'keyword'],
  ],
  jscript: [
    [DQ, 'string'],
    [SQ, 'string'],
    [C_LINE, 'comments'],
    [C_BLOCK, 'comments'],
    [words(JS_KEYWORDS), 'keyword'],
  ],
};

function collect(text, list) {
  const found = [];
  list.forEach(([re, cls]) => {
    const rx = new RegExp(re.source, re.flags);
    let m = rx.exec(text);
    while (m) {
      if (m[0].length) found.push([m.index, m.index + m[0].length, cls]);
      else rx.lastIndex += 1;
      m = rx.exec(text);
    }
  });
  return found;
}

function xml(text) {
  const found = [];
  const add = (re, fn) => {
    const rx = new RegExp(re.source, re.flags);
    let m = rx.exec(text);
    while (m) {
      fn(m);
      m = rx.exec(text);
    }
  };
  add(/<!\[[\w\s]*?\[[\s\S]*?\]\]>/gm, (m) => found.push([m.index, m.index + m[0].length, 'color2']));
  add(/<!--[\s\S]*?-->/gm, (m) => found.push([m.index, m.index + m[0].length, 'comments']));
  add(/<[\s/?!]*([:\w.-]+)([^>]*?)[\s/?]*>/gm, (m) => {
    const nameStart = m.index + m[0].indexOf(m[1]);
    found.push([nameStart, nameStart + m[1].length, 'keyword']);
    const attrs = m[2];
    const base = nameStart + m[1].length;
    const rx = /([\w:.-]+)\s*=\s*(".*?"|'.*?'|\w+)/g;
    let a = rx.exec(attrs);
    while (a) {
      const s = base + a.index;
      found.push([s, s + a[1].length, 'color1']);
      const v = s + a[0].lastIndexOf(a[2]);
      found.push([v, v + a[2].length, 'string']);
      a = rx.exec(attrs);
    }
  });
  return found;
}

/**
 * @param {string} text the code
 * @param {string} lang java | jscript | xml (anything else: no tokens)
 * @returns {Array<[number, number, string]>} sorted, non-overlapping ranges
 */
function highlight(text, lang) {
  let found = [];
  if (lang === 'xml') found = xml(text);
  else if (BRUSHES[lang]) found = collect(text, BRUSHES[lang]);
  found.sort((a, b) => (a[0] - b[0]) || ((a[1] - a[0]) - (b[1] - b[0])));
  const out = [];
  let end = -1;
  found.forEach((r) => {
    if (r[0] >= end) {
      out.push(r);
      [, end] = r;
    }
  });
  return out;
}

const LANGS = ['java', 'jscript', 'xml'];

/**
 * Splits the authored code's text node into ordered pieces: leading indentation ("spaces"),
 * tokens, plain runs and the line breaks. The authored text nodes are split, never replaced.
 * @param {Element} code the authored code element (text only)
 * @param {string} lang brush
 * @returns {Array<Array<{node: Text, cls: string|null}>>} pieces per line
 */
function splitLines(code, lang) {
  code.normalize();
  const text = code.textContent;
  const tokens = highlight(text, lang);
  const segments = [];
  const lines = text.split('\n');
  if (lines.length > 1 && lines[lines.length - 1] === '') lines.pop();
  let ls = 0;
  let t = 0;
  lines.forEach((line, li) => {
    const le = ls + line.length;
    const ws = line.match(/^[ \t]*/)[0].length;
    if (ws) {
      segments.push({
        s: ls, e: ls + ws, cls: 'spaces', li,
      });
    }
    let pos = ls + ws;
    while (t < tokens.length && tokens[t][1] <= pos) t += 1;
    let k = t;
    while (pos < le) {
      const tok = tokens[k];
      if (tok && tok[0] < le) {
        const ts = Math.max(tok[0], pos);
        if (ts > pos) {
          const run = text.slice(pos, ts);
          segments.push({
            s: pos, e: ts, cls: /^\s+$/.test(run) ? null : 'plain', li,
          });
        }
        const te = Math.min(tok[1], le);
        segments.push({
          s: ts, e: te, cls: tok[2], li,
        });
        pos = te;
        if (tok[1] <= le) k += 1;
      } else {
        segments.push({
          s: pos, e: le, cls: 'plain', li,
        });
        pos = le;
      }
    }
    if (le < text.length) {
      segments.push({
        s: le, e: le + 1, cls: null, li,
      });
    }
    ls = le + 1;
  });

  const perLine = lines.map(() => []);
  let node = code.firstChild;
  segments.forEach((seg) => {
    if (!node) return;
    const len = seg.e - seg.s;
    const piece = node;
    node = len < piece.length ? piece.splitText(len) : null;
    perLine[seg.li].push({ node: piece, cls: seg.cls });
  });
  return perLine;
}

/**
 * Code — the source's SyntaxHighlighter boxes (numbered gutter + highlighted lines) and the
 * WordPress preformatted block (variant `preformatted`). Authored as one cell holding a
 * pre/code; variants: language (java | jscript | xml), `nogutter`, `wrapped` (the SyntaxHighlighter
 * box sits inside a preformatted frame, as on the source). The authored pre/code MOVES into the
 * code column; its text nodes are split into tokens and lines in place.
 * @ew-exempt gutter line numbers are generated presentation, not authored copy.
 * @param {Element} block The code block element
 */
export default function decorate(block) {
  if (block.querySelector('.code-block, .code-frame')) return;
  const pre = block.querySelector('pre');
  if (!pre) return;

  if (block.classList.contains('preformatted')) {
    const frame = document.createElement('div');
    frame.className = 'code-frame';
    frame.append(pre);
    block.replaceChildren(frame);
    return;
  }

  const lang = LANGS.find((l) => block.classList.contains(l)) || 'plain';
  const code = pre.querySelector('code') || pre;
  const textOnly = [...code.childNodes].every((n) => n.nodeType === Node.TEXT_NODE);

  const box = document.createElement('div');
  box.className = 'code-block';
  box.dataset.lang = lang;
  const table = document.createElement('table');
  const tbody = document.createElement('tbody');
  const tr = document.createElement('tr');
  const lines = document.createElement('td');
  lines.className = 'code-lines';
  lines.append(pre);

  if (textOnly && code.textContent) {
    const perLine = splitLines(code, lang);
    const lineEls = perLine.map((pieces) => {
      const line = document.createElement('div');
      line.className = 'line';
      pieces.forEach(({ node, cls }) => {
        if (!cls) {
          line.append(node);
          return;
        }
        const c = document.createElement('code');
        c.className = cls;
        c.append(node);
        line.append(c);
      });
      return line;
    });
    code.append(...lineEls);
    if (!block.classList.contains('nogutter')) {
      const gutter = document.createElement('td');
      gutter.className = 'gutter';
      gutter.setAttribute('aria-hidden', 'true');
      lineEls.forEach((l, i) => {
        const n = document.createElement('div');
        n.className = 'line';
        n.textContent = String(i + 1);
        gutter.append(n);
      });
      tr.append(gutter);
    }
  }
  tr.append(lines);
  tbody.append(tr);
  table.append(tbody);
  box.append(table);

  if (block.classList.contains('wrapped')) {
    const frame = document.createElement('div');
    frame.className = 'code-frame';
    frame.append(box);
    block.replaceChildren(frame);
  } else {
    block.replaceChildren(box);
  }
}
