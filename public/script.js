(() => {
  const gallery = document.querySelector('#gallery');
  const filterList = document.querySelector('#filterList');
  const count = document.querySelector('#collectionCount');
  const lightbox = document.querySelector('#lightbox');
  const lightboxImage = document.querySelector('#lightboxImage');
  const lightboxStage = document.querySelector('#lightboxStage');
  const lightboxPairL = document.querySelector('#lightboxPairL');
  const lightboxPairR = document.querySelector('#lightboxPairR');
  const zoomLevel = document.querySelector('#zoomLevel');
  const zoomInBtn = document.querySelector('#zoomIn');
  const zoomOutBtn = document.querySelector('#zoomOut');
  const zoomResetBtn = document.querySelector('#zoomReset');
  const fullBtn = document.querySelector('#lightboxFull');
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
    'Pollachi diptych · left','Pollachi diptych · right',
    'Poolside diptych · left','Poolside diptych · right'
  ]);
  photos.forEach(photo => { if (PAIRED_TITLES.has(photo.title)) photo.paired = true; });

  /* Canonical collection order: canonical categories first (in ORDER
     sequence), then any extra (non-canonical) categories kept distinct */
  const ORDER = ['Mysore Water','Madras Sky','Topslip','Street Studies','Mysore',
    'Portraits','Sky Studies','Poolside','1937 Vauxhall 14DX',
    'Mark II Ambassador','Soilside','Salem','Mangalore · 2025','Pollachi',
    'Pondicherry','Malleshwaram','After Hours'];

  /* Collection-level captions (the Instagram post captions, verbatim) */
  const CAPTIONS = {
    'Mysore Water': null,
    'Madras Sky': 'Cotton candy over madras💖',
    'Topslip': 'Peacocks for aesthetics, elephants for power, bisons for attitude. Balanced ecosystem.🌱',
    'Street Studies': 'T. Nagar, in a slightly different light 🌺',
    'Mysore': null,
    'Portraits': 'Ten frames, ten lives… I just passed through the middle.',
    'Sky Studies': '"A bird doesn\'t sing because it has an answer, it sings because it has a song."',
    'Poolside': 'Caught them mid-argument, mid-chaos, mid-whatever pigeons are always in the middle of. All of this, right at my apartment swimming pool. I raised the camera, they didn\'t care. No golden hour, no plan, just me and the birds..',
    '1937 Vauxhall 14DX': 'Straight out of Britain\'s golden era — no touchscreens, no gimmicks, just pure presence 😮‍💨',
    'Mark II Ambassador': 'Built like a tank, driven like a king.',
    'Soilside': 'a little sunsoaked, a little soilside, fully in the moment.',
    'Salem': null,
    'Mangalore · 2025': 'A little late.... But the ocean doesn\'t mind. Mangalore \'25',
    'Pollachi': 'Chased the river until it led us straight into the sunset.',
    'Pondicherry': 'Old French buildings, warm light, and streets that made slowing down feel easy.',
    'Malleshwaram': 'malleshwaram, 5pm',
    'After Hours': 'Stayed after hours. The night had opinions. Turns out they were good ones...'
  };
  const usedCategories = [...new Set(photos.map(photo => photo.category))];
  const categories = ORDER.filter(category => usedCategories.includes(category))
    .concat(usedCategories.filter(category => !ORDER.includes(category)));
  let currentIndex = 0;
  document.querySelector('#year').textContent = new Date().getFullYear();

  /* ── Chips are an ALBUM INDEX now: clicking one glides the page to
     that album's position instead of re-rendering only that album.
     Anchors keep native fallback (html{scroll-behavior}) when JS is
     off, and the liquid scroll module takes the wheel when it's on. */
  const slugify = text => 'album-' + text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  function updateChips() {
    filterList.replaceChildren();
    [['#gallery', 'All work'], ...categories.map(category => ['#' + slugify(category), category])].forEach(([hash, label]) => {
      const chip = document.createElement('a');
      chip.className = 'filter-chip';
      chip.href = hash;
      chip.textContent = label;
      filterList.append(chip);
    });
  }

  function render() {
    const shown = photos;
    const groups = categories.filter(category => shown.some(photo => photo.category === category));
    gallery.replaceChildren();
    groups.forEach(category => {
      const groupPhotos = shown.filter(photo => photo.category === category);
      const section = document.createElement('section');
      section.className = 'gallery-group';
      section.id = slugify(category);
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
      /* collection-level caption (the Instagram post caption, verbatim) */
      const caption = CAPTIONS[category];
      if (caption) {
        const note = document.createElement('p');
        note.className = 'gallery-group-caption';
        note.textContent = caption;
        heading.append(note);
      }
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
    count.innerHTML = `<strong>${photos.length} frames</strong><br>across ${groups.length} ${groups.length === 1 ? 'collection' : 'collections'}`;
    heroCount.textContent = `01 / ${photos.length}`;
  }

  /* ── Diptych halves: the two chopped portrait cards are actually one
     landscape, so the expanded view composes them back into one frame ── */
  const isPairLeft = photo => /·\s*left$/i.test(photo.title || '');
  const isPairRight = photo => /·\s*right$/i.test(photo.title || '');
  function pairPartner(index) {
    const photo = photos[index];
    if (!photo) return -1;
    if (isPairLeft(photo) && photos[index + 1] && isPairRight(photos[index + 1])) return index + 1;
    if (isPairRight(photo) && photos[index - 1] && isPairLeft(photos[index - 1])) return index - 1;
    return -1;
  }

  /* ── Zoom + pan state for the viewing room ── */
  const ZOOM_MIN = 1, ZOOM_MAX = 4, ZOOM_STEP = 0.5;
  let zoom = 1, panX = 0, panY = 0;

  function clampPan() {
    if (!lightboxStage) return;
    const maxX = (lightboxStage.offsetWidth * (zoom - 1)) / 2;
    const maxY = (lightboxStage.offsetHeight * (zoom - 1)) / 2;
    panX = Math.min(maxX, Math.max(-maxX, panX));
    panY = Math.min(maxY, Math.max(-maxY, panY));
  }
  function applyZoom() {
    if (!lightboxStage) return;
    lightboxStage.style.transform = `translate(${panX}px, ${panY}px) scale(${zoom})`;
    if (zoomLevel) zoomLevel.textContent = Math.round(zoom * 100) + '%';
    lightbox.classList.toggle('is-zoomed', zoom > 1.001);
    if (zoomOutBtn) zoomOutBtn.disabled = zoom <= ZOOM_MIN + 0.001;
    if (zoomInBtn) zoomInBtn.disabled = zoom >= ZOOM_MAX - 0.001;
  }
  function setZoom(next) {
    zoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, next));
    if (zoom <= 1.001) { panX = 0; panY = 0; }
    clampPan();
    applyZoom();
  }
  function resetZoom() { zoom = 1; panX = 0; panY = 0; applyZoom(); }

  function openLightbox(photo) {
    currentIndex = photos.indexOf(photo);
    showLightboxPhoto();
    lightbox.showModal();
  }
  function showLightboxPhoto() {
    const photo = photos[currentIndex];
    if (!photo) return;
    resetZoom();
    const partner = pairPartner(currentIndex);
    const pairing = partner !== -1;
    lightbox.classList.toggle('is-pair', pairing);
    if (pairing) {
      const left = isPairLeft(photo) ? photo : photos[partner];
      const right = isPairLeft(photo) ? photos[partner] : photo;
      lightboxImage.removeAttribute('src');
      lightboxPairL.src = left.url;
      lightboxPairL.alt = `${left.title}, ${left.category}`;
      lightboxPairR.src = right.url;
      lightboxPairR.alt = `${right.title}, ${right.category}`;
      lightbox.setAttribute('aria-label', `${left.category} diptych`);
    } else {
      lightboxPairL.removeAttribute('src');
      lightboxPairR.removeAttribute('src');
      lightboxImage.src = photo.url;
      lightboxImage.alt = `${photo.title}, ${photo.category}`;
      lightbox.setAttribute('aria-label', `${photo.title}, ${photo.category}`);
    }
  }
  function moveLightbox(direction) {
    if (!photos.length) return;
    let next = (currentIndex + direction + photos.length) % photos.length;
    /* never stop on the right half of a diptych — the pair shows as one frame */
    if (isPairRight(photos[next]) && pairPartner(next) !== -1) {
      next = (next + direction + photos.length) % photos.length;
    }
    currentIndex = next;
    showLightboxPhoto();
  }
  document.querySelector('#lightboxClose').addEventListener('click', () => lightbox.close());
  document.querySelector('#lightboxPrev').addEventListener('click', () => moveLightbox(-1));
  document.querySelector('#lightboxNext').addEventListener('click', () => moveLightbox(1));
  lightbox.addEventListener('click', event => { if (event.target === lightbox) lightbox.close(); });
  lightbox.addEventListener('close', () => {
    resetZoom();
    if (document.fullscreenElement === lightbox) document.exitFullscreen().catch(() => {});
  });
  document.addEventListener('keydown', event => {
    if (!lightbox.open) return;
    if (event.key === 'ArrowLeft') moveLightbox(-1);
    if (event.key === 'ArrowRight') moveLightbox(1);
    if (event.key === '+' || event.key === '=') setZoom(zoom + ZOOM_STEP);
    if (event.key === '-') setZoom(zoom - ZOOM_STEP);
    if (event.key === '0') resetZoom();
  });

  /* zoom controls */
  if (zoomInBtn) zoomInBtn.addEventListener('click', () => setZoom(zoom + ZOOM_STEP));
  if (zoomOutBtn) zoomOutBtn.addEventListener('click', () => setZoom(zoom - ZOOM_STEP));
  if (zoomResetBtn) zoomResetBtn.addEventListener('click', resetZoom);
  lightbox.addEventListener('wheel', event => {
    if (!lightbox.open) return;
    event.preventDefault();
    setZoom(zoom + (event.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP));
  }, { passive: false });
  lightboxStage.addEventListener('dblclick', () => setZoom(zoom > 1.01 ? 1 : 2));

  /* drag to pan while zoomed */
  let dragStart = null;
  lightboxStage.addEventListener('pointerdown', event => {
    if (zoom <= 1.001 || event.button !== 0) return;
    dragStart = { x: event.clientX, y: event.clientY, px: panX, py: panY };
    lightboxStage.setPointerCapture(event.pointerId);
    lightboxStage.classList.add('is-dragging');
  });
  lightboxStage.addEventListener('pointermove', event => {
    if (!dragStart) return;
    panX = dragStart.px + (event.clientX - dragStart.x);
    panY = dragStart.py + (event.clientY - dragStart.y);
    clampPan();
    applyZoom();
  });
  const endDrag = () => { if (!dragStart) return; dragStart = null; lightboxStage.classList.remove('is-dragging'); };
  lightboxStage.addEventListener('pointerup', endDrag);
  lightboxStage.addEventListener('pointercancel', endDrag);

  /* fullscreen */
  if (fullBtn) {
    if (!document.fullscreenEnabled) fullBtn.hidden = true;
    fullBtn.addEventListener('click', () => {
      const done = () => {};
      if (document.fullscreenElement === lightbox) {
        document.exitFullscreen().catch(done);
      } else {
        lightbox.requestFullscreen().catch(done);
      }
    });
    document.addEventListener('fullscreenchange', () => {
      const on = document.fullscreenElement === lightbox;
      lightbox.classList.toggle('is-fullscreen', on);
      fullBtn.setAttribute('aria-label', on ? 'Exit fullscreen' : 'Enter fullscreen');
    });
  }
  applyZoom();
  /* ── Album scrollspy: highlight the chip of the album you're in ── */
  const chips = () => Array.from(filterList.querySelectorAll('.filter-chip'));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let lastActive = '';

  /* chip strip edges: fade only a side that still hides chips, so pills
     are never hard-chopped by the glass dock */
  function updateStripFade() {
    const strip = filterList;
    const max = strip.scrollWidth - strip.clientWidth;
    strip.classList.toggle('is-scrollable', max > 2);
    strip.classList.toggle('is-at-start', strip.scrollLeft <= 2);
    strip.classList.toggle('is-at-end', max <= 2 || strip.scrollLeft >= max - 2);
  }
  filterList.addEventListener('scroll', updateStripFade, { passive: true });
  window.addEventListener('resize', updateStripFade);

  function setActiveChip() {
    const marker = window.scrollY + (window.__anchorOffset ? window.__anchorOffset() + 10 : 170);
    let active = '#gallery';
    document.querySelectorAll('.gallery-group').forEach(section => {
      if (section.getBoundingClientRect().top + window.scrollY <= marker) active = '#' + section.id;
    });
    chips().forEach(chip => {
      const on = chip.getAttribute('href') === active;
      chip.classList.toggle('is-active', on);
      if (on) chip.setAttribute('aria-current', 'true'); else chip.removeAttribute('aria-current');
    });
    /* nudge the chip STRIP itself (never the window) so the active chip
       is visible on mobile — and only when the active album changes,
       otherwise the spy fights the user's finger on every scroll tick */
    if (active !== lastActive) {
      lastActive = active;
      const activeChip = chips().find(chip => chip.classList.contains('is-active'));
      if (activeChip) {
        const strip = filterList;
        const chipLeft = activeChip.getBoundingClientRect().left - strip.getBoundingClientRect().left + strip.scrollLeft;
        const max = strip.scrollWidth - strip.clientWidth;
        let to = strip.scrollLeft;
        if (chipLeft < strip.scrollLeft) to = Math.max(0, chipLeft - 30);
        else if (chipLeft + activeChip.offsetWidth > strip.scrollLeft + strip.clientWidth) to = Math.min(max, chipLeft + activeChip.offsetWidth - strip.clientWidth + 30);
        if (to !== strip.scrollLeft) {
          try { strip.scrollTo({ left: to, behavior: reduced ? 'auto' : 'smooth' }); } catch (error) { strip.scrollLeft = to; }
        }
      }
    }
    /* liquid-glass surge on the heading of the album just jumped to */
    if (pendingSurge && active === pendingSurge) {
      const group = document.querySelector(pendingSurge);
      pendingSurge = null;
      surge(group);
    }
    return active;
  }
  let spyTicking = false;
  window.addEventListener('scroll', () => {
    if (spyTicking) return;
    spyTicking = true;
    window.requestAnimationFrame(() => { setActiveChip(); spyTicking = false; });
  }, { passive: true });
  window.addEventListener('resize', () => { setActiveChip(); }, { passive: true });

  /* ── Arrival glass: when a chip is clicked, remember the album and
     surface a liquid-glass plate under its heading when you land.
     If you're already there, it surfaces right away. ── */
  let pendingSurge = null;
  function surge(group) {
    if (reduced || !group) return;
    const heading = group.querySelector('.gallery-group-heading');
    if (!heading) return;
    heading.classList.remove('is-surfaced');
    void heading.offsetWidth;
    heading.classList.add('is-surfaced');
    window.setTimeout(() => heading.classList.remove('is-surfaced'), 1800);
  }
  filterList.addEventListener('click', event => {
    const chip = event.target.closest('.filter-chip');
    if (!chip || reduced) return;
    const hash = chip.getAttribute('href');
    const group = hash && hash !== '#gallery' ? document.querySelector(hash) : null;
    if (group && group.getBoundingClientRect().top < 260 && group.getBoundingClientRect().top > -600) {
      surge(group); /* already looking at it */
      return;
    }
    pendingSurge = hash;
    window.setTimeout(() => { if (pendingSurge === hash) pendingSurge = null; }, 3000);
  });

  updateChips();
  render();
  setActiveChip();
  updateStripFade();
})();

/* ── Anchor offset: derived from the sticky dock's real height, so
   anchors never land under the glass no matter how the dock resizes. ── */
(() => {
  const dock = document.querySelector('.gallery-tools');
  let offset = 156;
  function measure() {
    if (!dock) return;
    const stickTop = parseFloat(getComputedStyle(dock).top) || 0;
    const next = Math.round(stickTop + dock.offsetHeight + 14);
    if (next > 40) {
      offset = next;
      document.documentElement.style.setProperty('--anchor-offset', next + 'px');
    }
  }
  window.__anchorOffset = () => offset;
  window.addEventListener('resize', measure, { passive: true });
  window.addEventListener('load', measure);
  measure();
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
    target = clampTo(el.getBoundingClientRect().top + window.scrollY - (window.__anchorOffset ? window.__anchorOffset() : 156));
    nudge();
  });

  window.addEventListener('resize', () => { target = clampTo(target); nudge(); }, { passive: true });
})();
