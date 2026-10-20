# EN2RIOR. — Interior Design Landing Page

A responsive, animated landing page for **EN2RIOR**, an interior-design studio, built from the Figma artboard *Interior Design Landing Page* (node `13:2`, 1440 × 9428).

Plain **HTML + CSS + vanilla JavaScript**: no framework, no build step, no dependencies.

---

## Run locally

Any static server works:

```bash
python3 -m http.server 8811
# open http://localhost:8811
```

Opening `index.html` directly from the file system also works, but the YouTube embed needs to be served over `http(s)`.

### Deploy to Vercel

The repo is a zero-build static site; `vercel.json` sets everything Vercel needs (no framework, no build/install step, clean URLs, cache and security headers).

**Option A: from GitHub (recommended, auto-deploys on every push)**
1. Push this repo to GitHub.
2. In Vercel: **Add New → Project → Import** the repository.
3. Leave the defaults (*Framework Preset: Other*, no build command, root directory `./`) and click **Deploy**.

**Option B: from the terminal**
```bash
npx vercel          # preview deployment (first run asks you to log in and link the project)
npx vercel --prod   # production deployment
```

| File | Purpose |
|---|---|
| `vercel.json` | static config: `cleanUrls`, security headers, 7-day cache for images/icons, always-revalidate for CSS/JS |
| `.vercelignore` | keeps `README.md` / `.gitignore` out of the deployment |
| `favicon.svg` | site icon |

> CSS/JS filenames are not content-hashed, so they are served with `must-revalidate`; a new deploy is picked up immediately. If you replace an image, give it a new filename (images are cached for 7 days).

### Deploy to GitHub Pages

**Settings → Pages → Deploy from branch → `main` / root** also works; no build configuration is needed.

---

## Project structure

```
en2rior-landing/
├── index.html                 # all markup (sections, video modal, gallery lightbox)
├── assets/
│   ├── css/styles.css         # design tokens, layout, breakpoints, motion
│   ├── js/app.js              # interactions & scroll-driven animation
│   ├── images/                # 14 photos (JPEG)
│   └── icons/                 # 5 SVG icons
├── README.md
├── vercel.json                # Vercel static-hosting config
├── .vercelignore
├── favicon.svg
└── .gitignore
```

---

## Features

| Area | Behaviour |
|---|---|
| **Layout** | Pixel-matched to the Figma artboard at 1440 px (every desktop size is `design px × --u`, where `--u = container width ÷ 1440`); fluid up to 1920 px. |
| **Breakpoints** | Large/XL ≥ 1024 px (design composition) · Medium 640–1023 px (tablet reflow) · Small < 640 px (mobile, burger menu). |
| **Sticky navbar** | Vertical nav at rest → horizontal & centred when scrolled (FLIP glide, hysteresis); frosted light bar, auto-switches to a dark bar over the Projects section. |
| **Hero** | Staged intro (headline, image reveals, copy); subtle zoom on image hover. |
| **Who We Are** | Scroll image reveals; *Watch Video* opens a YouTube lightbox (Esc / backdrop / × to close, focus-trapped). |
| **Projects** | Infinite, spring-driven carousel: arrows, drag / swipe with momentum, trackpad & keyboard; centre card grows to the tall design size. |
| **What We Provide** | Six interactive styles: image cross-fade and description fade swap per category. |
| **How We Work** | Pointer-aware red fill that spreads from the cursor entry point, plus card lift. |
| **Gallery Corner** | Draggable card deck (top card tucks to the back, loops); click opens a full-view lightbox that grows from the card, with prev / next, keyboard and swipe. |
| **CTA** | Letter-by-letter grey → ink colour progression tied to scroll. |
| **Footer** | Live GMT+0 clock. |
| **Accessibility** | Semantic landmarks, alt text, visible focus, keyboard support for every control, `prefers-reduced-motion` respected. |

---

## Resources used

### Design source

| Resource | Reference |
|---|---|
| Figma file | `Test-Design`, file key `6Tw8PmNOsiC0x7wTAQ1mye` |
| Artboard | `13:2` *Interior Design Landing Page* (1440 × 9428) |
| Section nodes | Nav `13:4` · Hero `13:3/13:49` · Who We Are `56:2` · Projects `52:851` · What We Provide `56:3` · How We Work `59:7` · Gallery `13:144` · Footer `13:154–13:181` |

### Fonts

| Font | Weights / styles | Source |
|---|---|---|
| **Urbanist** | 400, 500, 600, 700, 800 · italic 400, 700 | [Google Fonts](https://fonts.google.com/specimen/Urbanist) (SIL Open Font License 1.1), loaded via `fonts.googleapis.com` |

### Colour tokens (`assets/css/styles.css → :root`)

| Token | Value | Use |
|---|---|---|
| `--ink` | `#290802` | text, buttons |
| `--red` | `#e02427` | primary / accent, hover |
| `--bg` | `#ebe4db` | page background |
| `--hero-bg` | `#cdccc8` | hero background |
| `--dark` | `#240701` | Projects section |
| `--cream` | `#ebe0c5` | text on dark |
| `--cream-2` | `#d9cca9` | label on dark |
| `--chip` | `#4c261e` | arrow buttons |
| `--card` | `#faf6f0` | step cards, photo frames |

### Images (`assets/images/`): exported from the Figma file

| File | Size (px) | Figma node | Used in |
|---|---|---|---|
| `hero-cafe-planter-chandelier.jpg` | 1920 × 2880 | 13:11 | Hero (right) · Gallery deck |
| `hero-living-leather-sofa.jpg` | 1920 × 2880 | 13:12 | Hero (middle) |
| `who-lounge-rattan.jpg` | 1920 × 2880 | 13:13 / 13:148 | Who We Are (small) · Gallery deck · *Bohemian Vibes* |
| `who-living-rust-wall.jpg` | 1920 × 1920 | 13:14 / 13:151 | Who We Are (large) · Gallery deck |
| `project-rustic-charm.jpg` | 1920 × 2880 | 13:81 | Project 01 · *Classic Vintage* |
| `project-luxe-loft.jpg` | 1920 × 2880 | 13:86 | Project 02 · *Rustic Charm* · Gallery deck |
| `project-modern-minimalist.jpg` | 1920 × 2880 | 13:91 | Project 03 |
| `provide-cafe-spindle-chairs.jpg` | 1920 × 2880 | 13:15 | What We Provide · *Contemporary Chic* · Project 06 |
| `process-living-curved-sofa.jpg` | 1920 × 1371 | 13:116 | How We Work · Gallery deck |
| `process-grid-wall-armchairs.jpg` | 1920 × 2713 | 13:108 | How We Work · *Modern Industrial* |
| `gallery-timber-glass-wall.jpg` | 1920 × 2899 | 13:153 | Gallery deck (top card) |
| `collage-boardroom-wood-slats.jpg` | 1920 × 1280 | 13:110 | Collage · Project 05 · Gallery deck |
| `collage-home-office.jpg` | 1920 × 1280 | 13:109 | Collage · Project 04 |
| `collage-sunlit-living.jpg` | 1920 × 2880 | 13:111 | Collage · *Minimalist Elegance* · Gallery deck |

### Icons (`assets/icons/`): exported from the Figma file

| File | Figma layer | Used in |
|---|---|---|
| `arrow-up-right-white.svg` | `bitcoin-icons:arrow-up-outline` | *Let's Talk* buttons, *Book an Appointment* |
| `arrow-left-cream.svg` | `solar:arrow-down-linear` (13:68) | Projects ← · Lightbox ← |
| `arrow-right-cream.svg` | `solar:arrow-down-linear` (13:74) | Projects → · Lightbox → |
| `dot-ink.svg` | `Ellipse 18` | Section labels (light) |
| `dot-cream.svg` | `Ellipse 18` (13:59) | Projects label (dark) |
| *(inline SVG)* | `octicon:play-24` (13:62) | *Watch Video* (inlined so it takes `currentColor`) |

### Media & external links

| Resource | URL |
|---|---|
| Watch Video (YouTube, privacy-enhanced embed) | `https://www.youtube-nocookie.com/embed/gXcapkDd_j4` ([watch](https://youtu.be/gXcapkDd_j4)) |
| Contact / booking | `mailto:demo@in2rior.gamil.com` (address as given in the design) |
| Social links (footer) | instagram.com · tiktok.com · linkedin.com · medium.com (generic, replace with real profiles) |

### Content notes

- All copy is taken verbatim from the design, **except** the following placeholders, which should be replaced with real content:
  - Projects **04–06** titles and clients (*Warm Timber Studio – David Kim*, *Executive Oak Boardroom – Laura Chen*, *Café Bloom Interiors – Ethan Brooks*).
  - What We Provide descriptions for the five non-default styles (in `assets/js/app.js → SERVICES`).
- The photographs come from the Figma file. Confirm their licence and attribution before publishing.

---

## Browser support

Latest Chrome, Edge, Safari and Firefox. Uses CSS container query units (`cqi`), `text-box-trim` (progressive: older browsers fall back gracefully), `backdrop-filter`, the Web Animations API and Pointer Events.
