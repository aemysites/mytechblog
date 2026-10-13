/**
 * Table — the source's TablePress data tables. First row = header row (thead/th), the rest
 * the body; variant `striped` = TablePress row striping. A trailing row with a single cell
 * (when the table has more columns) is the table description shown under the table.
 * R-01 (inconsistency register): the table scrolls inside its own `.table-scroll` box.
 * Cell contents MOVE into the created th/td cells.
 * @param {Element} block The table block element
 */
export default function decorate(block) {
  if (block.querySelector('table')) return;
  const rows = [...block.children].filter((r) => r.children.length);
  const width = Math.max(0, ...rows.map((r) => r.children.length));
  let description = null;
  const last = rows[rows.length - 1];
  if (width > 1 && last && last.children.length === 1) description = rows.pop();

  const table = document.createElement('table');
  table.className = 'data-table';
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');
  if (block.classList.contains('striped')) tbody.className = 'is-striped';
  const noHeader = block.classList.contains('no-header');
  rows.forEach((row, i) => {
    const tr = document.createElement('tr');
    const head = i === 0 && !noHeader;
    [...row.children].forEach((cell) => {
      const c = document.createElement(head ? 'th' : 'td');
      c.append(...cell.childNodes);
      tr.append(c);
    });
    (head ? thead : tbody).append(tr);
  });
  if (thead.children.length) table.append(thead);
  table.append(tbody);

  const scroll = document.createElement('div');
  scroll.className = 'table-scroll';
  scroll.append(table);
  const parts = [scroll];
  if (description) {
    const desc = document.createElement('div');
    desc.className = 'table-description';
    desc.append(...description.firstElementChild.childNodes);
    parts.push(desc);
  }
  block.replaceChildren(...parts);
}
