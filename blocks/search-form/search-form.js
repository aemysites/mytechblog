/**
 * Sidebar search widget (source: WordPress get_search_form() in Twenty Twelve).
 * The authored label text ("Search for:") is MOVED into the screen-reader label; the form
 * submits GET `s` to the same-origin results route /search.
 * @ew-exempt the submit control's "Search" value is a control literal of the theme.
 * @param {Element} block The search-form block element
 */
export default function decorate(block) {
  if (block.querySelector('form')) return;
  const form = document.createElement('form');
  form.className = 'search-form';
  form.setAttribute('role', 'search');
  form.method = 'get';
  form.action = '/search';
  const row = document.createElement('div');
  const label = document.createElement('label');
  label.className = 'screen-reader-text';
  label.htmlFor = 's';
  const source = block.querySelector('p') || block.querySelector(':scope > div > div');
  if (source) label.append(...source.childNodes);
  const field = document.createElement('input');
  field.className = 'search-field';
  field.type = 'text';
  field.name = 's';
  field.id = 's';
  field.value = new URLSearchParams(window.location.search).get('s') || '';
  const submit = document.createElement('input');
  submit.type = 'submit';
  submit.value = 'Search';
  row.append(label, ' ', field, ' ', submit);
  form.append(row);
  block.textContent = '';
  block.append(form);
}
