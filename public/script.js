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
