(function () {
  'use strict';

  // ── Elements ──────────────────────────────────────────────
  const header      = document.getElementById('header');
  const navToggle   = document.getElementById('navToggle');
  const navLinks    = document.getElementById('navLinks');
  const navLinkEls  = document.querySelectorAll('.nav-link');
  const sections    = document.querySelectorAll('section[id]');
  const reveals     = document.querySelectorAll('.reveal');
  const backToTop   = document.getElementById('backToTop');
  const themeToggle = document.getElementById('themeToggle');
  const printBtns   = [document.getElementById('printBtn'), document.getElementById('printBtnFooter')];
  const filterBtns  = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-row, .project-card');

  // ── Theme ─────────────────────────────────────────────────
  const savedTheme = localStorage.getItem('portfolio-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('portfolio-theme', next);
    updateThemeIcon(next);
  });

  function updateThemeIcon(theme) {
    themeToggle.textContent = theme === 'dark' ? 'Light' : 'Dark';
  }

  // ── Mobile nav ────────────────────────────────────────────
  navToggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', open);
  });

  navLinkEls.forEach(link => {
    link.addEventListener('click', () => navLinks.classList.remove('open'));
  });

  // ── Scroll: header shadow + back to top ───────────────────
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 20);
    backToTop.classList.toggle('visible', window.scrollY > 400);
    highlightNav();
  }, { passive: true });

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ── Active nav link ───────────────────────────────────────
  function highlightNav() {
    const scrollPos = window.scrollY + 100;
    let current = '';

    sections.forEach(section => {
      if (scrollPos >= section.offsetTop) {
        current = section.getAttribute('id');
      }
    });

    navLinkEls.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
  }

  // ── Scroll reveal ─────────────────────────────────────────
  const revealObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  reveals.forEach(el => revealObserver.observe(el));

  // ── Project filter ────────────────────────────────────────
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;

      projectCards.forEach(card => {
        const category = card.dataset.category;
        const show = filter === 'all'
          || category === filter
          || (filter === 'flagship' && category.includes('flagship'));
        card.classList.toggle('hidden', !show);
      });
    });
  });

  // ── Print ─────────────────────────────────────────────────
  printBtns.forEach(btn => {
    if (btn) btn.addEventListener('click', () => window.print());
  });

  // ── Detail modal ────────────────────────────────────────────
  const modal       = document.getElementById('detailModal');
  const modalHead   = document.getElementById('modalHead');
  const modalBody   = document.getElementById('modalBody');
  let lastTrigger   = null;

  if (modal) {
    document.querySelectorAll('.tile-trigger').forEach(trigger => {
      trigger.addEventListener('click', () => openModal(trigger));
    });

    modal.querySelectorAll('[data-modal-close]').forEach(el => {
      el.addEventListener('click', closeModal);
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && modal.classList.contains('modal--open')) {
        closeModal();
      }
    });
  }

  function openModal(trigger) {
    const article = trigger.closest('article');
    const source  = article && article.querySelector('.modal-source');
    if (!source) return;

    modalHead.innerHTML = '';

    const badges   = trigger.querySelector('.flagship-badges');
    const rowCat   = trigger.querySelector('.project-row__cat');
    const cardTop  = trigger.querySelector('.card-top');
    const label    = trigger.querySelector('.card-label');
    const title    = trigger.querySelector('.project-row__title, h3');
    const subtitle = trigger.querySelector('.flagship-subtitle');
    const metrics  = trigger.querySelector('.card-metrics, .flagship-stats');

    if (badges)   modalHead.appendChild(badges.cloneNode(true));
    if (rowCat)   modalHead.appendChild(rowCat.cloneNode(true));
    if (cardTop)  modalHead.appendChild(cardTop.cloneNode(true));
    if (label)    modalHead.appendChild(label.cloneNode(true));
    if (title) {
      const t = title.cloneNode(true);
      t.id = 'modalTitle';
      modalHead.appendChild(t);
    }
    if (subtitle) modalHead.appendChild(subtitle.cloneNode(true));
    if (metrics)  modalHead.appendChild(metrics.cloneNode(true));

    modalBody.innerHTML = source.innerHTML;

    const premiumType = source.dataset.premium;
    modal.classList.toggle('modal--premium', !!premiumType);
    modal.classList.remove('modal--report', 'modal--llm');
    if (premiumType === 'report') modal.classList.add('modal--report');
    if (premiumType === 'llm') modal.classList.add('modal--llm');

    modalBody.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', closeModal, { once: true });
    });

    modal.classList.add('modal--open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    lastTrigger = trigger;

    const closeBtn = modal.querySelector('.modal__close');
    if (closeBtn) closeBtn.focus();
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('modal--open', 'modal--premium', 'modal--report', 'modal--llm');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    modalHead.innerHTML = '';
    modalBody.innerHTML = '';
    if (lastTrigger) {
      lastTrigger.focus();
      lastTrigger = null;
    }
  }

})();
