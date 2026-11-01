/* SPYDER Website — progressive enhancements; zero third-party scripts. */
(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const translations = {
    wallet: {
      number: {en:'01 — WALLET',ru:'01 — КОШЕЛЁК'},
      title: {en:'Your assets, in focus.',ru:'Активы под контролем.'},
      desc: {en:'A calm, clear place to view your portfolio, explore assets and follow your activity.',ru:'Простое пространство для просмотра портфеля, активов и истории операций.'},
      device: {en:'Wallet overview',ru:'Обзор кошелька'}
    },
    messages: {
      number: {en:'02 — MESSAGES',ru:'02 — СООБЩЕНИЯ'},
      title: {en:'Conversations, connected.',ru:'Общение, которое объединяет.'},
      desc: {en:'Messages designed for the SPYDER experience. The interface is a product preview, not a live messaging service.',ru:'Сообщения, задуманные как часть SPYDER. Интерфейс демонстрационный: это не действующий веб-мессенджер.'},
      device: {en:'Messages preview',ru:'Превью сообщений'}
    },
    touch: {
      number: {en:'03 — TOUCH',ru:'03 — TOUCH'},
      title: {en:'A gesture toward the future.',ru:'Новое взаимодействие.'},
      desc: {en:'SPYDER Touch explores simple ways to connect. The animation demonstrates a concept rather than an available transfer method.',ru:'Spyder Touch исследует простые способы взаимодействия. Анимация показывает концепцию, а не доступный способ перевода.'},
      device: {en:'SPYDER Touch',ru:'SPYDER Touch'}
    }
  };
  let language = 'en';
  let activeTab = 'wallet';
  let hiddenBalance = false;

  function applyTab() {
    const data = translations[activeTab];
    if (!data || !$('#demo-title')) return;
    for (const [id, key] of [['#demo-number','number'],['#demo-title','title'],['#demo-desc','desc'],['#device-head','device']]) {
      const target = $(id);
      if (target) target.textContent = data[key][language];
    }
    $$('.feature-tab').forEach(tab => {
      const isSelected = tab.dataset.tab === activeTab;
      tab.classList.toggle('active',isSelected);
      tab.setAttribute('aria-selected',String(isSelected));
      tab.tabIndex = isSelected ? 0 : -1;
    });
    $$('.demo-screen').forEach(screen => {
      const shown = screen.dataset.screen === activeTab;
      screen.classList.toggle('active',shown);
      screen.hidden = !shown;
      screen.setAttribute('aria-hidden',String(!shown));
    });
    const shell = $('#demo-shell');
    if (shell) shell.dataset.mode = activeTab;
  }
  function setLanguage(next) {
    if (!['en','ru'].includes(next)) return;
    language = next;
    document.documentElement.lang = next;
    $$('[data-en][data-ru]').forEach(el => {el.textContent = el.dataset[next];});
    $$('[data-only-language]').forEach(el => {el.hidden = el.dataset.onlyLanguage !== next;});
    $$('.lang').forEach(button => {
      const active = button.dataset.lang === next;
      button.classList.toggle('active',active);
      button.setAttribute('aria-pressed',String(active));
    });
    if (document.body.dataset.titleEn) document.title = document.body.dataset[next === 'ru' ? 'titleRu' : 'titleEn'];
    applyTab();
    try { localStorage.setItem('spyder-site-lang', next); } catch (_) { /* storage can be disabled */ }
  }
  const tabButtons = $$('.feature-tab');
  tabButtons.forEach((tab, index) => {
    tab.addEventListener('click',() => { activeTab = tab.dataset.tab; applyTab(); });
    tab.addEventListener('keydown',event => {
      let newIndex = index;
      if (event.key === 'ArrowRight') newIndex = (index + 1) % tabButtons.length;
      else if (event.key === 'ArrowLeft') newIndex = (index + tabButtons.length - 1) % tabButtons.length;
      else if (event.key === 'Home') newIndex = 0;
      else if (event.key === 'End') newIndex = tabButtons.length - 1;
      else return;
      event.preventDefault();
      tabButtons[newIndex].focus();tabButtons[newIndex].click();
    });
  });
  $$('.lang[data-lang]').forEach(button => button.addEventListener('click', () => setLanguage(button.dataset.lang)));
  let savedLanguage = 'en';
  try { if (localStorage.getItem('spyder-site-lang') === 'ru') savedLanguage = 'ru'; } catch (_) {}
  setLanguage(savedLanguage);

  const balanceToggle = $('#balance-toggle');
  if (balanceToggle) balanceToggle.addEventListener('click',() => {
    hiddenBalance = !hiddenBalance;
    $('#balance-amount').textContent = hiddenBalance ? '••••••' : '—';
    balanceToggle.setAttribute('aria-pressed',String(hiddenBalance));
    balanceToggle.setAttribute('aria-label', hiddenBalance ? (language === 'ru' ? 'Показать превью баланса' : 'Reveal preview balance') : (language === 'ru' ? 'Скрыть превью баланса' : 'Hide preview balance'));
  });

  const menuToggle = $('#mobile-toggle');
  const menu = $('#mobile-menu');
  const closeMenu = () => {
    document.body.classList.remove('menu-open');
    if (!menuToggle) return;
    menuToggle.setAttribute('aria-expanded','false');
    menuToggle.setAttribute('aria-label',language === 'ru' ? 'Открыть меню' : 'Open menu');
    if (menu) menu.setAttribute('inert','');
  };
  if (menuToggle && menu) {
    menu.setAttribute('inert','');
    menuToggle.addEventListener('click',() => {
      const opening = !document.body.classList.contains('menu-open');
      document.body.classList.toggle('menu-open',opening);
      menuToggle.setAttribute('aria-expanded',String(opening));
      menuToggle.setAttribute('aria-label',opening ? (language === 'ru' ? 'Закрыть меню' : 'Close menu') : (language === 'ru' ? 'Открыть меню' : 'Open menu'));
      if (opening) {menu.removeAttribute('inert'); $('a',menu)?.focus();}
      else menu.setAttribute('inert','');
    });
    $$('a',menu).forEach(a => a.addEventListener('click',closeMenu));
    document.addEventListener('keydown',e => {if(e.key==='Escape' && document.body.classList.contains('menu-open')){closeMenu();menuToggle.focus();}});
    document.addEventListener('click',e => {
      if (document.body.classList.contains('menu-open') && !menu.contains(e.target) && !menuToggle.contains(e.target)) closeMenu();
    });
    window.addEventListener('resize', () => {if(window.innerWidth>800)closeMenu();});
  }
  const year = $('#year');
  if(year) year.textContent = String(new Date().getFullYear());

  // Scroll-progress indicator and active navigation: lightweight, no dependencies.
  const progress = $('#scroll-progress');
  const navLinks = $$('.nav-links a[href^="#"]');
  const sections = navLinks.map(a => ({anchor:a, target: $(a.getAttribute('href'))})).filter(x=>x.target);
  let pendingScrollFrame = false;
  function onScroll(){
    if(pendingScrollFrame)return;
    pendingScrollFrame = true;
    requestAnimationFrame(()=>{
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if(progress) progress.style.transform = `scaleX(${max>0 ? Math.max(0,Math.min(1,window.scrollY/max)) : 0})`;
      let active = null;
      for(const item of sections){if(item.target.getBoundingClientRect().top <= 145)active=item.anchor;}
      navLinks.forEach(anchor=>{anchor.classList.toggle('current',anchor===active);if(anchor===active)anchor.setAttribute('aria-current','location');else anchor.removeAttribute('aria-current');});
      pendingScrollFrame = false;
    });
  }
  window.addEventListener('scroll',onScroll,{passive:true});
  window.addEventListener('resize',onScroll,{passive:true});onScroll();

  if('IntersectionObserver' in window && !reducedMotion.matches){
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if(entry.isIntersecting){entry.target.classList.add('in-view');observer.unobserve(entry.target);} });
    },{threshold:.04,rootMargin:'0px 0px -20px 0px'});
    $$('.reveal').forEach(el=>observer.observe(el));
    // Make non-observed content visible when JS is available but IO is slow.
    document.documentElement.classList.add('enhanced');
  } else $$('.reveal').forEach(el=>el.classList.add('in-view'));

  // Hero interaction is purely visual; the actual wallet remains a mobile product.
  const heroArt = $('#hero-art');
  if(heroArt && !reducedMotion.matches && window.matchMedia('(pointer:fine)').matches){
    heroArt.addEventListener('pointermove',e => {
      const bounds=heroArt.getBoundingClientRect();
      const x = (e.clientX-bounds.left)/bounds.width-.5;
      const y = (e.clientY-bounds.top)/bounds.height-.5;
      heroArt.style.setProperty('--pointer-x',`${(x*10).toFixed(2)}px`);
      heroArt.style.setProperty('--pointer-y',`${(y*9).toFixed(2)}px`);
    });
    heroArt.addEventListener('pointerleave',()=>{heroArt.style.setProperty('--pointer-x','0px');heroArt.style.setProperty('--pointer-y','0px');});
  }
})();
