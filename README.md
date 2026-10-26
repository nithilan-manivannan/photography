# photography

**Source and archive for shots.nithilan, a quiet photography portfolio published on GitHub Pages.**

This repository holds the entire site: a static photo journal of 193 photographs across 16 collections, made from landscapes, streets, portraits, vintage cars, and quiet moments across India. There is no framework and no build pipeline for the page itself. Plain HTML, CSS, and one small script, deployed to GitHub Pages through a GitHub Actions job that uploads the `public/` folder as the site artifact.

## What the site does

- **Rotating hero**: the opening viewport shows a large photograph with a caption and frame counter that changes as you scroll or interact.
- **Filterable gallery**: collection filters render as chips above the grid. Picking one narrows the gallery to that collection.
- **Collections with metadata**: each collection group declares its location (Mysore, Topslip, T. Nagar, Malleshwaram, Salem, Mangalore, Pollachi, Pondicherry, Yelahanka, Chidambaram, Puducherry, Bengaluru) and photo count.
- **Diptychs**: selected pairs display as deliberate left and right pairings, ordered and titled by the build tool so the pairs read as one composition.
- **Lightbox**: clicking a photograph opens a full screen viewer with previous and next navigation and a close control, keyboard accessible.
- **Performance**: WebP images, explicit dimensions, lazy loading below the fold, and eager priority for the hero.
- **Accessibility**: nav and filters carry aria labels and live regions; images carry descriptive alt text.

## Collections

Sixteen groups, from Mysore water studies and street scenes to a 1937 Vauxhall 14DX and a Mark II Ambassador. Every photograph lives in `public/images/` as a WebP.

## Adding photographs

1. Drop new `.webp` files into `public/images/collections/<collection-name>/` (or one of the standalone folders such as `mysore-beech/`).
2. Edit `tools/build-extra-photos.js` to describe the collection: order, display names, category, and any diptych pairing.
3. Regenerate the manifest:

```bash
node tools/build-extra-photos.js
```

4. The tool rewrites `public/extra-photos.js`, which the site script merges with any bundled photographs.
5. Push to `main`. The Pages workflow (`deploy.yml` under `.github/workflows/`) copies the site verification file, uploads `public/` as the artifact, and deploys.

## Deployment

The `.github/workflows/pages.yml` workflow runs on every push to main:

1. Checkout and GitHub Pages configuration.
2. Copy of the `google*.html` verification file into `public/`.
3. Upload of the `public/` folder as the deployment artifact.
4. Deploy with the official actions.

The workflow also responds to manual triggers from the Actions tab.

## Repository structure

```
photography/
├── public/
│   ├── index.html              # the whole page, statically generated
│   ├── script.js               # gallery, filters, lightbox, hero
│   ├── styles.css              # editorial styling
│   ├── extra-photos.js         # generated photo manifest (run the tool)
│   └── images/                 # every photograph, in collection folders
├── tools/
│   └── build-extra-photos.js   # curation tool that builds the manifest
├── googlef92e09a8c32be966.html # search console verification
└── .github/workflows/pages.yml # GitHub Pages deploy
```

## Design

The visual language is an editorial one: warm paper tones against deep ink, generous margins, an arch serif treatment for titles, and quiet motion. The theme color matches the paper tone so mobile chrome blends in. Social previews carry a large image card and captions.
