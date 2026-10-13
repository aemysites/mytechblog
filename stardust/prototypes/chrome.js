// chrome.js — small-screen menu toggle (source: twentytwelve/js/navigation.js behaviour).
(() => {
  const button = document.querySelector('.main-navigation .menu-toggle');
  const menu = document.querySelector('.main-navigation .nav-menu');
  if (!button || !menu) return;
  button.addEventListener('click', () => {
    const open = menu.classList.toggle('toggled-on');
    button.classList.toggle('toggled-on', open);
    button.setAttribute('aria-expanded', String(open));
  });
})();
