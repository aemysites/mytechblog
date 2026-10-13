/**
 * Post navigation — single-post previous/next (source nav.nav-single) and the listing's
 * older/newer posts (source nav#nav-below). One row, one cell per direction; a cell whose text
 * carries "←" is the previous/older link, "→" the next/newer one (falls back to cell order).
 * The authored link nodes MOVE into the nav-previous / nav-next slots.
 * @ew-exempt the visually hidden "Post navigation" heading is a theme literal.
 * @param {Element} block The post-nav block element
 */
export default function decorate(block) {
  if (block.querySelector('nav')) return;
  const cells = [...block.querySelectorAll(':scope > div > div')];
  const nav = document.createElement('nav');
  nav.className = 'post-navigation';
  const label = document.createElement('h3');
  label.className = 'screen-reader-text';
  label.textContent = 'Post navigation';
  const prev = document.createElement('div');
  prev.className = 'nav-previous';
  const next = document.createElement('div');
  next.className = 'nav-next';
  const unplaced = [];
  cells.forEach((cell) => {
    const text = cell.textContent;
    if (!text.trim()) return;
    if (text.includes('←')) prev.append(...cell.childNodes);
    else if (text.includes('→')) next.append(...cell.childNodes);
    else unplaced.push(cell);
  });
  unplaced.forEach((cell) => {
    (prev.childNodes.length ? next : prev).append(...cell.childNodes);
  });
  nav.append(label, prev, next);
  block.replaceChildren(nav);
}
