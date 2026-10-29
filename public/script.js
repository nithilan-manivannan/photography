(() => {
  const gallery = document.querySelector('#gallery');
  const filterList = document.querySelector('#filterList');
  const count = document.querySelector('#collectionCount');
  const lightbox = document.querySelector('#lightbox');
  const lightboxImage = document.querySelector('#lightboxImage');
  const heroCount = document.querySelector('#heroCount');

  /* ── Download / screenshot deterrents ─────────────────────────
     1. Block right-click "Save image as"
     2. Block drag-and-drop of images
     3. Block the multi-finger (3+) swipe-down screenshot gesture
        used by many Android skins — paint the screen black before
        the OS snapshot fires. */
  document.addEventListener('contextmenu', event => { event.preventDefault(); });
  document.addEventListener('dragstart', event => {
    if (event.target.closest('img')) event.preventDefault();
  });
  const guard = document.createElement('div');
  guard.className = 'screenshot-guard';
  guard.setAttribute('aria-hidden', 'true');
  document.body.append(guard);
  const showGuard = () => guard.classList.add('is-active');
  const maybeHideGuard = event => { if (event.touches.length === 0) guard.classList.remove('is-active'); };
  document.addEventListener('touchstart', event => { if (event.touches.length >= 3) showGuard(); }, { passive: true, capture: true });
  document.addEventListener('touchmove', event => { if (event.touches.length >= 3) showGuard(); }, { passive: true, capture: true });
  document.addEventListener('touchend', maybeHideGuard, { passive: true, capture: true });
  document.addEventListener('touchcancel', maybeHideGuard, { passive: true, capture: true });

  const bundled = [
    ['images/mysore-beech/1.webp','Last light by the water','Mysore Water'],
    ['images/mysore-beech/2.webp','Water study 02','Mysore Water'],
    ['images/mysore-beech/3.webp','Water study 03','Mysore Water'],
    ['images/mysore-beech/4.webp','Water study 04','Mysore Water'],
    ['images/mysore-beech/5.webp','Water study 05','Mysore Water'],
    ['images/mysore-beech/6.webp','Water study 06','Mysore Water'],
    ['images/mysore-beech/7.webp','Water study 07','Mysore Water'],
    ['images/mysore-beech/8.webp','Water study 08','Mysore Water'],
    ['images/mysore-beech/9.webp','Water study 09','Mysore Water'],
    ['images/mysore-klaoud/_DSC0009.webp','Palm silhouettes','Mysore'],
    ['images/mysore-klaoud/_DSC0011.webp','After the rain','Mysore'],
    ['images/mysore-klaoud/_DSC0014.webp','Cloud study 03','Mysore'],
    ['images/mysore-klaoud/_DSC0016.webp','Open sky','Mysore'],
    ['images/mysore-klaoud/_DSC0022.webp','Cloud study 05','Mysore'],
    ['images/mysore-klaoud/_DSC0024.webp','Cloud study 06','Mysore'],
    ['images/mysore-klaoud/_DSC0029.webp','Cloud study 07','Mysore'],
    ['images/mysore-klaoud/_DSC0123.webp','Evening clouds','Mysore'],
    ['images/mysore-klaoud/_DSC0158.webp','Soft light','Mysore'],
    ['images/mysore-klaoud/_DSC0169.webp','Violet hour','Mysore'],
    ['images/mysore-klaoud/_DSC0173.webp','Cloud study 11','Mysore'],
    ['images/mysore-klaoud/_DSC0174.webp','Moonrise','Mysore'],
    ['images/mysore-klaoud/_DSC0185.webp','Silver clouds','Mysore'],
    ['images/mysore-klaoud/_DSC0192.webp','The moon, overhead','Mysore'],
    ['images/klaud/_DSC0087.webp','Last light 01','Sky Studies'],
    ['images/klaud/_DSC0091.webp','Last light 02','Sky Studies'],
    ['images/klaud/_DSC0099.webp','Cloud study 03','Sky Studies'],
    ['images/klaud/_DSC0101.webp','Cloud study 04','Sky Studies'],
    ['images/klaud/_DSC0105.webp','Birds at dusk','Sky Studies'],
    ['images/klaud/_DSC0107.webp','Birds in formation','Sky Studies'],
    ['images/klaud/_DSC0115.webp','Evening lines','Sky Studies'],
    ['images/klaud/_DSC0116.webp','The last glow','Sky Studies'],
    ['images/klaud/_DSC0120.webp','After sunset','Sky Studies'],
    ['images/klaud/_DSC0125.webp','Light finding its way','Sky Studies'],
    ['images/klaud/_DSC0127.webp','A passing cloud','Sky Studies'],
    ['images/malleshwaram/1.webp','Street notes 01','Malleshwaram'],
    ['images/malleshwaram/2.webp','Street notes 02','Malleshwaram'],
    ['images/malleshwaram/3.webp','Street notes 03','Malleshwaram'],
    ['images/malleshwaram/4.webp','Street notes 04','Malleshwaram'],
    ['images/malleshwaram/5.webp','Street notes 05','Malleshwaram'],
    ['images/malleshwaram/6.webp','Street notes 06','Malleshwaram'],
    ['images/malleshwaram/7.webp','Street notes 07','Malleshwaram']
  ];
  const extra = window.EXTRA_PORTFOLIO_PHOTOS || [];
  const photos = [
    ...bundled.map(([url,title,category],index) => ({url,title,category,featured:index===0,paired:false})),
    ...extra.map(photo => ({...photo,featured:false,paired:false}))
  ];
  /* Mark paired (diptych) cards */
  const PAIRED_TITLES = new Set([
    'Topslip diptych I · left','Topslip diptych I · right',
    'Topslip diptych II · left','Topslip diptych II · right',
    'Mangalore diptych · left','Mangalore diptych · right',
    'Pollachi diptych · left','Pollachi diptych · right'
  ]);
  photos.forEach(photo => { if (PAIRED_TITLES.has(photo.title)) photo.paired = true; });

  /* Canonical collection order */
  const ORDER = ['Mysore Water','Madras Sky','Topslip','Street Studies','Mysore',
    'Portraits','Sky Studies','1937 Vauxhall 14DX',
    'Mark II Ambassador','Soilside','Salem','Mangalore · 2025','Pollachi',
    'Pondicherry','Malleshwaram','After Hours'];
  const categories = ORDER.filter(category => photos.some(photo => photo.category === category))
    .concat(photos.map(photo => photo.category).filter(category => !ORDER.includes(category) && !categoriesIncludes(category)));
  function categoriesIncludes(category) { return ORDER.includes(category); }
  let activeFilter = 'all';
  let currentIndex = 0;
  document.querySelector('#year').textContent = new Date().getFullYear();

  function updateFilters() {
    filterList.replaceChildren();
    [['all','All work'], ...categories.map(category => [category,category])].forEach(([value,label]) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `filter-chip${activeFilter === value ? ' is-active' : ''}`;
      button.textContent = label;
      button.addEventListener('click', () => { activeFilter = value; updateFilters(); render(); });
      filterList.append(button);
    });
  }

  function render() {
    const shown = photos.filter(photo => activeFilter === 'all' || photo.category === activeFilter);
    const groups = categories.filter(category => shown.some(photo => photo.category === category));
    gallery.replaceChildren();
    groups.forEach(category => {
      const groupPhotos = shown.filter(photo => photo.category === category);
      const section = document.createElement('section');
      section.className = 'gallery-group';
      const heading = document.createElement('div');
      heading.className = 'gallery-group-heading';
      const title = document.createElement('h3');
      title.textContent = category;
      const meta = document.createElement('div');
      meta.className = 'gallery-group-meta';
      const groupCount = document.createElement('span');
      groupCount.textContent = `${String(groupPhotos.length).padStart(2,'0')} photographs`;
      meta.append(groupCount);
      heading.append(title,meta);
      const grid = document.createElement('div');
      grid.className = 'gallery-grid';
      groupPhotos.forEach(photo => {
        const index = photos.indexOf(photo);
        const card = document.createElement('article');
        card.className = photo.paired ? 'photo-card is-paired' : 'photo-card';
        card.tabIndex = 0;
        card.setAttribute('role','button');
        card.setAttribute('aria-label',`View ${photo.title}, ${photo.category}`);
        const image = document.createElement('img');
        image.src = photo.url;
        image.alt = `${photo.title}, ${photo.category}`;
        image.loading = index < 21 ? 'eager' : 'lazy';
        image.decoding = 'async';
        image.onerror = () => card.classList.add('photo-broken');
        card.append(image);
        card.addEventListener('click', () => openLightbox(photo));
        card.addEventListener('keydown', event => {
          if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openLightbox(photo); }
        });
        grid.append(card);
      });
      section.append(heading,grid);
      gallery.append(section);
    });
    count.innerHTML = `<strong>${shown.length} frames</strong><br>across ${groups.length} ${groups.length === 1 ? 'collection' : 'collections'}`;
    heroCount.textContent = `01 / ${photos.length}`;
  }

  function openLightbox(photo) {
    currentIndex = photos.indexOf(photo);
    showLightboxPhoto();
    lightbox.showModal();
  }
  function showLightboxPhoto() {
    const photo = photos[currentIndex];
    if (!photo) return;
    lightboxImage.src = photo.url;
    lightboxImage.alt = `${photo.title}, ${photo.category}`;
  }
  function moveLightbox(direction) {
    if (!photos.length) return;
    currentIndex = (currentIndex + direction + photos.length) % photos.length;
    showLightboxPhoto();
  }
  document.querySelector('#lightboxClose').addEventListener('click', () => lightbox.close());
  document.querySelector('#lightboxPrev').addEventListener('click', () => moveLightbox(-1));
  document.querySelector('#lightboxNext').addEventListener('click', () => moveLightbox(1));
  lightbox.addEventListener('click', event => { if (event.target === lightbox) lightbox.close(); });
  document.addEventListener('keydown', event => {
    if (!lightbox.open) return;
    if (event.key === 'ArrowLeft') moveLightbox(-1);
    if (event.key === 'ArrowRight') moveLightbox(1);
  });
  updateFilters();
  render();
})();

/* ─────────────────────────────────────────────────────────────────
   Motion layer — staggered reveals, 3D tilt, parallax, progress.
   Self-contained: observes whatever the gallery renders, so filter
   changes stay animated without touching the gallery logic above.
   All animation is transform/opacity only; everything is gated on
   prefers-reduced-motion; pointer-dependent effects need fine input.
   ───────────────────────────────────────────────────────────────── */
(() => {
  const html = document.documentElement;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!reduced) html.classList.add('motion');

  /* ── Gold scroll progress hairline (works even with reduced motion) ── */
  const progress = document.querySelector('.scroll-progress');
  if (progress) {
    const paintProgress = () => {
      const max = html.scrollHeight - window.innerHeight;
      progress.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
    };
    window.addEventListener('scroll', paintProgress, { passive: true });
    paintProgress();
  }
  if (reduced) return; /* everything below is choreography */
  const heroImage = document.querySelector('#heroImage');
  function paintHero() {
    if (!heroImage) return;
    const y = Math.min(window.scrollY, window.innerHeight * 1.4);
    heroImage.style.transform = `translate3d(0,${(y * -0.055).toFixed(1)}px,0) scale(1.06)`;
  }
  if (heroImage && window.matchMedia('(min-width:641px)').matches) {
    /* subtle parallax: hero drifts slower than the page as you scroll */
    let heroTicking = false;
    window.addEventListener('scroll', () => {
      if (heroTicking) return;
      heroTicking = true;
      window.requestAnimationFrame(() => { paintHero(); heroTicking = false; });
    }, { passive: true });
  }

  /* Reveal machinery */
  const cardObserver = new IntersectionObserver(entries => {
    let batchIndex = 0;
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const card = entry.target;
      cardObserver.unobserve(card);
      const delay = Math.min(batchIndex * 70, 420);
      card.style.setProperty('--d', `${delay}ms`);
      card.classList.add('is-entering');
      const settle = event => {
        if (event && event.target && event.target !== card) return;
        card.classList.remove('is-entering');
        card.classList.add('is-in');
        card.style.removeProperty('--d');
      };
      card.addEventListener('transitionend', settle, { once: true });
      /* safety net if transitionend never fires */
      window.setTimeout(() => {
        if (!card.classList.contains('is-in')) settle(null);
      }, 1400);
      batchIndex += 1;
    });
  }, { rootMargin: '90px 0px 0px 0px', threshold: 0.02 });
  function stageReveal(el) {
    if (!el.classList.contains('is-in') && !el.classList.contains('is-entering')) {
      el.classList.add('is-ready');
      cardObserver.observe(el);
    }
  }

  /* Load shimmer → photo reveal */
  document.addEventListener('load', event => {
    if (event.target.tagName !== 'IMG') return;
    event.target.classList.add('img-loaded');
  }, { capture: true });
  document.querySelectorAll('img').forEach(img => { if (img.complete) img.classList.add('img-loaded'); });

  /* Once-only reveals for static section furniture */
  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-revealed');
      sectionObserver.unobserve(entry.target);
      const note = entry.target.matches('.about-note') ? entry.target : entry.target.querySelector('.about-note');
      if (note) {
        note.querySelectorAll('p').forEach((p, i) => p.style.setProperty('--w', i));
        window.setTimeout(() => note.classList.add('is-scrub'), 120);
      }
    });
  }, { rootMargin: '-10% 0px -10% 0px' });
  ['.work-section .section-heading', '.about-content h2', '.about-note']
    .forEach(selector => { document.querySelectorAll(selector).forEach(el => sectionObserver.observe(el)); });

  /* Wire cards that the gallery renders now or later */
  function wire(cards) {
    cards.forEach(card => {
      if (!card.classList.contains('is-ready')) stageReveal(card);
      card.querySelectorAll('img').forEach(img => { if (img.complete) img.classList.add('img-loaded'); });
    });
  }
  wire(document.querySelectorAll('.photo-card'));
  new MutationObserver(mutations => {
    const fresh = [];
    mutations.forEach(m => m.addedNodes.forEach(node => {
      if (node.classList && node.classList.contains('photo-card')) fresh.push(node);
      else if (node.querySelectorAll) node.querySelectorAll('.photo-card').forEach(c => fresh.push(c));
    }));
    if (fresh.length) wire(fresh);
  }).observe(document.querySelector('#gallery'), { childList: true, subtree: true });

  /* ── 3D tilt + cursor spotlight (desktop pointers only) ── */
  if (fine) {
    let tiltCard = null;
    function applyTilt(event) {
      if (!tiltCard) return;
      const rect = tiltCard.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width;
      const py = (event.clientY - rect.top) / rect.height;
      tiltCard.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`);
      tiltCard.style.setProperty('--my', `${(py * 100).toFixed(1)}%`);
      tiltCard.style.transform = `perspective(900px) rotateX(${((0.5 - py) * 7).toFixed(2)}deg) rotateY(${((px - 0.5) * 9).toFixed(2)}deg) translateY(-2px)`;
    }
    document.addEventListener('pointermove', event => {
      const card = event.target.closest && event.target.closest('.photo-card');
      if (card !== tiltCard) {
        if (tiltCard) { tiltCard.classList.remove('tilting'); tiltCard.style.transform = ''; }
        tiltCard = card;
        if (tiltCard) tiltCard.classList.add('tilting');
      }
      if (tiltCard) applyTilt(event);
    }, { passive: true });
    document.addEventListener('pointerdown', event => {
      if (event.pointerType !== 'mouse') return;
      const card = event.target.closest && event.target.closest('.photo-card');
      if (card) { card.style.transform = ''; card.classList.remove('tilting'); tiltCard = null; }
    });
  }

  /* ── Lightbox peak: retrigger the entrance on every photo ── */
  const lightboxImage = document.querySelector('#lightboxImage');
  if (lightboxImage) {
    const replay = () => {
      lightboxImage.style.animation = 'none';
      void lightboxImage.offsetWidth;
      lightboxImage.style.animation = '';
    };
    lightboxImage.addEventListener('load', replay);
  }
})();

/* -----------------------------------------------------------------
   Liquidscroll � inertial wheel scroller, Lenis-style, zero deps.
   Intercepts the wheel and eases the page toward it on an rAF loop,
   which is what makes desktop scrolling feel like liquid instead of
   steps. Touch and prefers-reduced-motion keep NATIVE scrolling �
   this module bails out on both.
   ----------------------------------------------------------------- */
(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (reduced || !fine) return;

  const EASE = 0.092;             /* smaller = silkier glide          */
  const SNAP = 0.35;              /* px threshold to call it "there"  */
  const limit = () => Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

  let target = window.scrollY;
  let current = target;
  let rafId = null;
  const clampTo = v => Math.min(Math.max(v, 0), limit());

  function step() {
    current += (target - current) * EASE;
    if (Math.abs(target - current) < SNAP) {
      current = target;
      window.scrollTo({ top: current, behavior: 'instant' });
      rafId = null;
      return;
    }
    window.scrollTo({ top: current, behavior: 'instant' });
    rafId = requestAnimationFrame(step);
  }
  const nudge = () => { if (rafId === null) rafId = requestAnimationFrame(step); };

  /* native scrolls (keyboard, spacebar) pull our cursor back in sync */
  window.addEventListener('scroll', () => {
    if (rafId === null) { current = target = window.scrollY; }
  }, { passive: true });

  window.addEventListener('wheel', event => {
    if (event.ctrlKey || event.deltaMode === 2) return;         /* pinch-zoom */
    const t = event.target;
    if (t instanceof Element && t.closest('dialog')) return;    /* lightbox scrolls itself */
    event.preventDefault();
    const line = event.deltaMode === 1 ? 16 : 1;                /* Firefox line mode */
    target = clampTo(target + event.deltaY * line);
    nudge();
  }, { passive: false });

  /* anchor links ride the same liquid curve */
  document.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) return;
    const t = event.target;
    const link = t instanceof Element && t.closest('a[href^="#"]');
    if (!link) return;
    const hash = link.getAttribute('href');
    if (hash.length < 2) return;
    const el = document.getElementById(hash.slice(1));
    if (!el) return;                                            /* unknown target: native jump */
    event.preventDefault();
    target = clampTo(el.getBoundingClientRect().top + window.scrollY - 96);
    nudge();
  });

  window.addEventListener('resize', () => { target = clampTo(target); nudge(); }, { passive: true });
})();
