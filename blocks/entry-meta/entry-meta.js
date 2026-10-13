/**
 * Entry meta — the post footer line ("This entry was posted in … on … by …"). The authored
 * nodes MOVE out of the row/cell scaffolding into the block root; the author credit
 * (" by <author link>") is grouped into `.by-author`, which the single-author theme hides —
 * exactly as on the source.
 * @param {Element} block The entry-meta block element
 */
export default function decorate(block) {
  const cells = [...block.querySelectorAll(':scope > div > div')];
  if (!cells.length) return;
  const nodes = [];
  cells.forEach((cell) => {
    const p = cell.querySelector(':scope > p');
    nodes.push(...(p && cell.children.length === 1 ? [p] : cell.childNodes));
  });
  block.replaceChildren(...nodes);

  const author = block.querySelector('a[href*="/author/"]');
  if (!author || author.closest('.by-author')) return;
  const before = author.previousSibling;
  if (!before || before.nodeType !== Node.TEXT_NODE) return;
  const at = before.textContent.lastIndexOf(' by');
  if (at < 0) return;
  const lead = before.splitText(at);
  const span = document.createElement('span');
  span.className = 'by-author';
  author.before(span);
  span.append(lead, author);
}
