#!/usr/bin/env node
/* Regenerates extra-photos.js with the requested renames, curation, pairing and order. */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const cols = n => path.join(root, 'public', 'images', 'collections', n);

/* Build a numbered list of photos for a collection folder. */
function series(folder, count, category, pad = 2, skip = [], from = 1) {
  const out = [];
  for (let i = from; i < from + count; i++) {
    const n = String(i).padStart(pad, '0');
    if (skip.includes(i)) continue;
    out.push({
      url: `images/collections/${folder}/${n}.webp`,
      title: `${category} photograph ${n}`,
      category
    });
  }
  return out;
}

/* Rename helper: keep folder urls, change display category + titles. */
function renamed(photos, category) {
  return photos.map((p, i) => ({
    url: p.url,
    title: `${category} photograph ${String(i + 1).padStart(2, '0')}`,
    category
  }));
}

const photos = [];

/* 1. Mysore · Waterside (bundled, first) — handled in script.js bundled array */

/* 2. Madras Sky (was Pothys Sky) — Padi, Chennai */
photos.push(...renamed(series('pothys-sky', 12, 'x'), 'Madras Sky'));

/* 3. Topslip (near Pollachi) — pairs: 01(left)+03(right), 02(left)+04(right), skip 10 */
{
  const cat = 'Topslip';
  const order = ['01', '03', '02', '04', '05', '06', '07', '08', '09', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20'];
  const titles = {
    '01': 'Topslip diptych I · left', '03': 'Topslip diptych I · right',
    '02': 'Topslip diptych II · left', '04': 'Topslip diptych II · right'
  };
  order.forEach((n, i) => {
    photos.push({ url: `images/collections/topslip/${n}.webp`, title: titles[n] || `${cat} photograph ${n}`, category: cat });
  });
}

/* 4. Street Studies — T. Nagar, Chennai */
photos.push(...renamed(series('street', 14, 'x'), 'Street Studies'));

/* 5. Sky Studies (was Landscape Studies) — Chidambaram; the old Yelahanka 'sky' set was removed.
   The klaud photos are bundled in script.js. */

/* 6. Portraits — Chidambaram */
photos.push(...renamed(series('people', 10, 'x'), 'Portraits'));

/* 7. Landscape Studies — Chidambaram (bundled, green photo removed in script.js) */

/* 8. Pollachi — pair 01+02 (leaf diptych) */
{
  const cat = 'Pollachi';
  const order = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15'];
  const titles = { '01': 'Pollachi diptych · left', '02': 'Pollachi diptych · right' };
  order.forEach(n => {
    photos.push({ url: `images/collections/pollachi/${n}.webp`, title: titles[n] || `${cat} photograph ${n}`, category: cat });
  });
}

/* 9. After Hours — Yelahanka */
photos.push(...renamed(series('after-hours', 12, 'x'), 'After Hours'));

/* 10. 1937 Vauxhall 14DX (cars-01) */
photos.push(...renamed(series('cars-01', 10, 'x'), '1937 Vauxhall 14DX'));

/* 11. Mark II Ambassador (cars-02) */
photos.push(...renamed(series('cars-02', 8, 'x'), 'Mark II Ambassador'));

/* 12. Soilside (farm) — Villiyanallur, Tamil Nadu */
photos.push(...renamed(series('farm', 8, 'x'), 'Soilside'));

/* 13. Salem (hometown-2025) */
photos.push(...renamed(series('hometown-2025', 21, 'x'), 'Salem'));

/* 14. Mangalore · 2025 — portraits: 01+02 pair, rotated derivatives for 03-07, 08 dropped (only landscape original) */
{
  const cat = 'Mangalore · 2025';
  const items = [
    ['01.webp', 'Mangalore diptych · left'],
    ['02.webp', 'Mangalore diptych · right'],
    ['03-portrait.webp', null],
    ['04-portrait.webp', null],
    ['05-portrait.webp', null],
    ['06-portrait.webp', null],
    ['07-portrait.webp', null]
  ];
  items.forEach(([file, pairTitle], i) => {
    photos.push({ url: `images/collections/mangalore-2025/${file}`, title: pairTitle || `${cat} photograph ${String(i + 1).padStart(2, '0')}`, category: cat });
  });
}

/* 15. Pondicherry (poondy) */
photos.push(...renamed(series('poondy', 16, 'x'), 'Pondicherry'));

const out = `window.EXTRA_PORTFOLIO_PHOTOS = ${JSON.stringify(photos)};\n`;
fs.writeFileSync(path.join(root, 'public', 'extra-photos.js'), out);
console.log('Wrote', photos.length, 'photos');
