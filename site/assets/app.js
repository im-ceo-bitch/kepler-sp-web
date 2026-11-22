/* Spyder Network v6: independent, zero-network site interaction controller. */
(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const languages = ['en', 'ru', 'uz'];
  const strings = {
    copied: {en:'DOI copied', ru:'DOI скопирован', uz:'DOI nusxalandi'},
    copyFailed: {en:'Copy unavailable — select the DOI above', ru:'Копирование недоступно — выделите DOI выше', uz:'Nusxalash mumkin emas — DOI ni yuqoridan tanlang'},
    listing: {en:'Verified official link available', ru:'Подтверждённая официальная ссылка доступна', uz:'Tasdiqlangan rasmiy havola mavjud'},
  };
  let lang = 'en';
  function setLanguage(next) {
    lang = languages.includes(next) ? next : 'en';
    document.documentElement.lang = lang;
    $$('[data-en][data-ru][data-uz]').forEach(el => {el.textContent = el.dataset[lang];});
    document.title = document.body.dataset['title' + lang.charAt(0).toUpperCase() + lang.slice(1)] || document.title;
    if ($('#language')) $('#language').value = lang;
    try { localStorage.setItem('spyder-site-lang', lang); } catch (_) { /* browser may block storage */ }
    updateSimulation();
    applyOfficialDestinations();
  }
  try {
    const saved = localStorage.getItem('spyder-site-lang');
    const browser = (navigator.language || 'en').slice(0,2).toLowerCase();
    lang = languages.includes(saved) ? saved : languages.includes(browser) ? browser : 'en';
  } catch (_) { lang = 'en'; }
  $('#language')?.addEventListener('change', e => setLanguage(e.target.value));
  const menu = $('#mobile-menu');
  const menuButton = $('.menu-btn');
  function closeMenu(restore = false) {
    if (!menu || !menuButton) return;
    menu.hidden = true;
    menuButton.setAttribute('aria-expanded','false');
    if (restore) menuButton.focus();
  }
  menuButton?.addEventListener('click', () => {
    const opening = menu.hidden;
    menu.hidden = !opening;
    menuButton.setAttribute('aria-expanded', String(opening));
    if (opening) $('a',menu)?.focus();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(true); });
  document.addEventListener('click', e => {
    if (menu && !menu.hidden && !menu.contains(e.target) && !menuButton.contains(e.target)) closeMenu();
  });
  $$('.mobile-menu a').forEach(el => el.addEventListener('click', () => closeMenu()));
  window.addEventListener('resize', () => { if (window.innerWidth > 1020) closeMenu(); });
  function updateSimulation() {
    const input = $('#tx-range');
    if (!input) return;
    const daily = Math.max(100000, Math.min(5000000, Number(input.value) || 1000000));
    const format = new Intl.NumberFormat(lang === 'ru' ? 'ru-RU' : lang === 'uz' ? 'uz-UZ' : 'en-US');
    const fees = daily * 365 * .005;
    $('#tx-display').textContent = format.format(daily);
    $('#annual-fees').textContent = '$' + format.format(Math.round(fees));
    $('#validator-fees').textContent = '$' + format.format(Math.round(fees * .9));
    input.style.setProperty('--progress', `${(daily - 100000) / 4900000 * 100}%`);
  }
  $('#tx-range')?.addEventListener('input', updateSimulation);
  function safeUrl(raw, platform) {
    if (!raw || typeof raw !== 'string') return null;
    try {
      const u = new URL(raw);
      if (u.username || u.password) return null;
      if (platform === 'support' && u.protocol === 'mailto:' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(u.pathname)) return u.href;
      if (u.protocol !== 'https:') return null;
      if (platform === 'ios' && !['apps.apple.com','testflight.apple.com'].includes(u.hostname)) return null;
      if (platform === 'android' && u.hostname !== 'play.google.com') return null;
      return u.href;
    } catch (_) { return null; }
  }
  const config = window.SPYDER_CONFIG || {};
  function applyOfficialDestinations() {
    for (const platform of ['ios','android']) {
      const a = $(`[data-platform-link="${platform}"]`);
      const url = safeUrl(config[`${platform}Url`], platform);
      if (a && url) {
        a.href = url; a.hidden = false; a.target = '_blank'; a.rel = 'noopener noreferrer';
        const status = $(`[data-platform-status="${platform}"]`);
        if (status) status.textContent = strings.listing[lang];
      }
    }
    const a = $('[data-contact-link]');
    const url = safeUrl(config.supportUrl,'support');
    if (a && url) {
      a.href = url; a.hidden = false;
      if (url.startsWith('https:')) {a.target='_blank';a.rel='noopener noreferrer';}
      const pending = $('[data-contact-pending]'); if (pending) pending.hidden = true;
    }
  }
  $$('[data-copy]').forEach(button => button.addEventListener('click', async () => {
    const status = $('.copy-feedback');
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(button.dataset.copy);
      if (status) status.textContent = strings.copied[lang];
    } catch (_) { if (status) status.textContent = strings.copyFailed[lang]; }
  }));
  if ($('#year')) $('#year').textContent = new Date().getFullYear();
  setLanguage(lang);
})();
