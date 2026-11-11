/* SPYDER v4 · no network calls, external scripts or real transactions */
(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const languages = ['en','ru','uz'];
  let lang = 'en';
  let stage = 'start';
  let amount = 25;
  let network = 'Polygon';
  let touchConnected = false;
  let transferTimer;
  let touchTimer;
  const words = {
    invalid: ['Enter an amount from 0.01 to 1,850 USDC, with up to two decimal places.','Введите сумму от 0,01 до 1 850 USDC, не более двух знаков после запятой.','0,01 dan 1 850 USDC gacha, ko‘pi bilan ikki kasr xonali summa kiriting.'],
    sending: ['Simulating…','Симуляция…','Simulyatsiya…'],
    found: ['questions found','вопросов найдено','ta savol topildi'],
    available: ['Official download available','Официальная ссылка доступна','Rasmiy havola mavjud'],
    touchIdle: ['Two people. One connection.','Два человека. Одна связь.','Ikki inson. Bitta aloqa.'],
    touchBusy: ['Bringing you closer…','Становимся ближе…','Yaqinlashmoqda…'],
    touchDone: ['Connected in the demo. No devices were paired.','Связь в демо. Устройства не сопрягались.','Demoda bog‘landi. Qurilmalar ulanmagan.'],
    touchReplay: ['Play again','Повторить','Qayta ko‘rish']
  };
  const tr = key => words[key][languages.indexOf(lang)];
  const fmt = value => new Intl.NumberFormat(lang === 'uz' ? 'uz-UZ' : lang, {maximumFractionDigits:2}).format(value);
  function updateReview() {
    if (!$('#review-amount')) return;
    $('#review-amount').textContent = `${fmt(amount)} USDC`;
    $('#review-network').textContent = network;
    $('#review-fee').textContent = network === 'Polygon' ? '0.001 POL' : '0.0003 ETH';
    $('#receipt-amount').textContent = `${fmt(amount)} USDC`;
    $('#receipt-network').textContent = network;
  }
  function supportSearch() {
    const input = $('#support-search');
    if (!input) return;
    const normalize = x => x.toLocaleLowerCase().normalize('NFKC').replace(/[’‘`]/g,"'");
    const q = normalize(input.value.trim());
    let count = 0;
    $$('[data-faq]').forEach(item => {
      const match = normalize(item.textContent).includes(q);
      item.hidden = !match;
      if (match) count++;
    });
    $('#support-empty').hidden = count > 0;
    $('#support-count').textContent = `${count} ${tr('found')}`;
  }
  const config = window.SPYDER_CONFIG || {};
  function safeUrl(raw, platform) {
    if (typeof raw !== 'string' || !raw.trim()) return null;
    try {
      const url = new URL(raw);
      if (url.username || url.password) return null;
      if (platform === 'support' && url.protocol === 'mailto:' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(url.pathname)) return url.href;
      if (url.protocol !== 'https:') return null;
      if (platform === 'ios' && !['apps.apple.com','testflight.apple.com'].includes(url.hostname)) return null;
      if (platform === 'android' && url.hostname !== 'play.google.com') return null;
      return url.href;
    } catch (_) { return null; }
  }
  function applyDestinations() {
    for (const platform of ['ios','android']) {
      const url = safeUrl(config[`${platform}Url`], platform);
      const a = $(`[data-platform-link="${platform}"]`);
      const status = $(`[data-platform-status="${platform}"]`);
      if (a && url) { a.href = url; a.hidden = false; a.rel = 'noopener noreferrer'; if(status) status.textContent = tr('available'); }
    }
    const supportUrl = safeUrl(config.supportUrl, 'support');
    const contact = $('[data-contact-link]');
    if (supportUrl && contact) { contact.href = supportUrl; contact.hidden = false; $('[data-contact-pending]').hidden = true; }
  }
  function setLanguage(value) {
    lang = languages.includes(value) ? value : 'en';
    document.documentElement.lang = lang;
    $$('[data-en][data-ru][data-uz]').forEach(el => { el.textContent = el.dataset[lang]; });
    document.title = document.body.dataset[`title${lang[0].toUpperCase()+lang.slice(1)}`] || document.title;
    if ($('#language')) $('#language').value = lang;
    try { localStorage.setItem('spyder-site-lang',lang); } catch (_) {}
    updateReview(); supportSearch(); applyDestinations();
    if ($('#amount-error') && !$('#amount-error').hidden) $('#amount-error').textContent = tr('invalid');
    if (stage === 'sending') $('#confirm-transfer').textContent = tr('sending');
    if (touchConnected) { $('#touch-status').textContent = tr('touchDone'); $('#touch-play').textContent = tr('touchReplay'); }
  }
  let preference;
  try { preference = localStorage.getItem('spyder-site-lang'); } catch (_) {}
  const browserLanguage = (navigator.language || 'en').slice(0,2);
  setLanguage(languages.includes(preference) ? preference : languages.includes(browserLanguage) ? browserLanguage : 'en');
  $('#language')?.addEventListener('change', e => setLanguage(e.target.value));
  $('#support-search')?.addEventListener('input',supportSearch);
  if ($('#year')) $('#year').textContent = new Date().getFullYear();
  // Accessible mobile navigation: native tab order, Escape and outside-click close.
  const menu = $('#mobile-menu');
  const menuButton = $('.menu-btn');
  function closeMenu(returnFocus = false) {
    if (!menu || !menuButton) return;
    menu.hidden = true; menuButton.setAttribute('aria-expanded','false');
    if (returnFocus) menuButton.focus();
  }
  menuButton?.addEventListener('click', () => {
    const open = menu.hidden; menu.hidden = !open;
    menuButton.setAttribute('aria-expanded',String(open));
    if (open) $('a',menu)?.focus();
  });
  document.addEventListener('keydown',event => {if(event.key === 'Escape' && menu && !menu.hidden) closeMenu(true);});
  document.addEventListener('click', event => {if(menu && !menu.hidden && !menu.contains(event.target) && !menuButton.contains(event.target)) closeMenu();});
  $$('a',menu || document).forEach(a => a.addEventListener('click',() => closeMenu()));
  window.addEventListener('resize', () => { if(window.innerWidth>820) closeMenu(); });
  // Transfer state machine. All values remain in this document's memory.
  function showStage(next, focus = true) {
    stage = next;
    const ids = {start:'demo-start',compose:'transfer-compose',review:'transfer-review',sending:'transfer-review',success:'demo-success'};
    for (const id of new Set(Object.values(ids))) { if ($('#'+id)) $('#'+id).hidden = id !== ids[next]; }
    $('#transfer-receipt').hidden = next !== 'success';
    const step = next === 'start' ? 1 : next === 'compose' ? 2 : 3;
    $$('.demo-steps li').forEach(li => { li.classList.toggle('active',Number(li.dataset.step)<=step); if(Number(li.dataset.step) === step) li.setAttribute('aria-current','step'); else li.removeAttribute('aria-current'); });
    if (focus) {
      const target = {start:'#open-transfer',compose:'#transfer-amount',review:'#confirm-transfer',success:'#try-again'}[next];
      if (target) $(target).focus({preventScroll:true});
    }
  }
  function resetDemo() {
    clearTimeout(transferTimer);
    amount = 25; network = 'Polygon';
    $('#transfer-amount').value = '25'; $('#transfer-network').value = 'Polygon';
    $('#amount-error').hidden = true; $('#transfer-amount').removeAttribute('aria-invalid');
    $('#confirm-transfer').disabled = false;
    // Restore the localized span if a previous sending state replaced it.
    restoreConfirm(); updateReview(); showStage('start');
  }
  const confirmText = ['Send demo transfer','Выполнить демо-перевод','Demo o‘tkazmani yuborish'];
  function restoreConfirm() {
    const button = $('#confirm-transfer');
    if (!button) return;
    button.replaceChildren();
    const span = document.createElement('span');
    languages.forEach((l,i) => { span.dataset[l] = confirmText[i]; });
    span.textContent = confirmText[languages.indexOf(lang)]; button.append(span); button.disabled = false;
  }
  if ($('#open-transfer')) {
    $('#open-transfer').addEventListener('click',() => showStage('compose'));
    $('#close-transfer').addEventListener('click',() => showStage('start'));
    $('#edit-transfer').addEventListener('click',() => { clearTimeout(transferTimer); restoreConfirm(); showStage('compose'); });
    $('#demo-reset').addEventListener('click',resetDemo);
    $('#try-again').addEventListener('click',resetDemo);
    $$('[data-amount]').forEach(button => button.addEventListener('click',() => {
      $('#transfer-amount').value = button.dataset.amount;
      $('#amount-error').hidden = true; $('#transfer-amount').removeAttribute('aria-invalid');
    }));
    $('#transfer-amount').addEventListener('input',() => {$('#amount-error').hidden = true;$('#transfer-amount').removeAttribute('aria-invalid');});
    $('#transfer-amount').addEventListener('keydown',e => {if(e.key === 'Enter') $('#review-transfer').click();});
    $('#review-transfer').addEventListener('click',() => {
      const raw = $('#transfer-amount').value.trim().replace(',','.');
      const number = Number(raw);
      if (!/^\d+(?:\.\d{1,2})?$/.test(raw) || !Number.isFinite(number) || number < .01 || number > 1850) {
        $('#amount-error').hidden = false; $('#amount-error').textContent = tr('invalid');
        $('#transfer-amount').setAttribute('aria-invalid','true'); $('#transfer-amount').focus({preventScroll:true}); return;
      }
      amount = Math.round(number*100)/100; network = $('#transfer-network').value;
      updateReview(); showStage('review');
    });
    $('#confirm-transfer').addEventListener('click', () => {
      if (stage !== 'review') return;
      stage = 'sending'; $('#confirm-transfer').disabled = true; $('#confirm-transfer').textContent = tr('sending');
      transferTimer = setTimeout(() => {restoreConfirm();showStage('success');}, motion.matches ? 0 : 650);
    });
    showStage('start',false);
  }
  // A scene, not a device pairing or payment capability.
  $('#touch-play')?.addEventListener('click', () => {
    clearTimeout(touchTimer); touchConnected = false;
    const art = $('#touch-art'); const button = $('#touch-play');
    art.classList.remove('is-connected'); button.disabled = true;
    $('#touch-status').textContent = tr('touchBusy');
    touchTimer = setTimeout(() => {
      art.classList.add('is-connected'); touchConnected = true;
      $('#touch-status').textContent = tr('touchDone');
      button.textContent = tr('touchReplay'); button.disabled = false;
    }, motion.matches ? 0 : 180);
  });
})();
