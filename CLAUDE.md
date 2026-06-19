# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Moment of Zen** — a corporate marketing site for Zen-inspired sacred objects, fronted by a daily meditative magazine. Pure static site (no build step, no bundler, no framework).

Two distinct surfaces share one repo:
- **Corporate site** (root `index.html` + `product/`) — markets the 3MAGIC Buddha figurine collection and frames the brand's philosophy (calm and perspective in the AI era).
- **Daily magazine** (`magazine/`) — the original daily experience of curated quotes, poetry, and gallery imagery. Supports 7 languages: English, Japanese, Simplified Chinese, Traditional Chinese, Korean, Thai, Vietnamese.

## Running Locally

```powershell
python -m http.server 8000
# or any static file server — no build needed
```

Serve from the repo root. The corporate homepage is `/` (root `index.html`); the product landing page is `/product/3magic/`; the philosophy page is `/about/`; the magazine lives at `/magazine/`. The magazine's `days/` and `locales/` paths are loaded at runtime as JS module scripts (relative to `magazine/`).

## Adding a New Day

```powershell
.\magazine\days\new-day.ps1 -Date 2026-06-10 -HeroId photo-XXXX -Gallery1Id photo-YYYY -Gallery2Id photo-ZZZZ
```

This scaffolds `magazine/days/2026-06-10/data.js` (with TODO placeholders), six locale translation files, downloads Unsplash images if IDs are provided, and updates `magazine/days/available.js`. The script resolves all paths relative to its own location, so it stays self-consistent inside `magazine/`. Fill in `data.js` manually with the quote, subtitle, and poems.

## Architecture

### Entry Points
- Root `index.html` — corporate marketing homepage, built as a **single-screen, no-scroll carousel** of three full-page slides (Buddha Figurines, Magazine, Philosophy). Each slide has its own color theme (deep-space / verdant green / white), a CTA in a fixed position linking to its landing page, and auto-advances after its scroll text finishes (Buddha slide) or after 5s, plus arrow-key/dot/swipe navigation. No top nav. Self-contained: inline CSS + JS, no shared bundle.
- `about/index.html` — the Philosophy slide's landing page (placeholder, to be expanded). Warm/white theme matching the corporate design system. Linked as `about/`.
- `product/<brand>/...` — product pages, grouped by brand so future brands can sit alongside `3magic`. The current landing page is `product/3magic/index.html` (linked as `product/3magic/`; four figurines, Amazon CTAs + "Learn more" links to the buddhism virtue pages). Self-contained; references figurine art under `buddha-figurine/<name>/main.png` (same directory).
- `magazine/index.html` — the daily magazine app; all CSS and application JS live inside it. No separate JS bundle.

The two corporate pages and the magazine each duplicate a small CSS design system (the `:root` palette + Cormorant Garamond / Jost typography) inline rather than sharing a stylesheet — keep them visually consistent by hand.

### Magazine Content Model (under `magazine/`)
- `magazine/days/available.js` — ordered list of available dates (newest first)
- `magazine/days/<date>/data.js` — day content object: hero image, subtitle, quote, gallery items, two poems, optional music URL
- `magazine/days/<date>/data.<lang>.js` — per-day translations (ja, ko, th, vi, zh-hans, zh-hant); only loaded when user picks that language
- Content priority: per-day translation → 14-entry POOL fallback in each locale → English

### Localization (magazine only)
- `magazine/i18n.js` — language switching system; lazy-loads locale files on demand; persists selection to `localStorage['moz-lang']`
- `magazine/locales/<lang>.js` — UI labels + 14-entry fallback pool (quotes, subtitles)
- Add a new language by creating `magazine/locales/[code].js` matching the structure of `en.js`, adding per-day translation files, and registering the language in `magazine/i18n.js`

### Products & 3magic
- `product/` groups products by brand (`product/3magic/…` today; add `product/<other-brand>/…` later). Within a brand the same intent holds: market the objects and link out to purchase.
- `product/3magic/buddha-figurine/<name>/main.png` — product photography for each figurine (`aureate-punya`, `celeste-shanti`, `verdant-bodhi`, `blush-maitri`). Used by the corporate homepage hero and `product/3magic/index.html`.
- `product/3magic/models/<SKU>.html` — pages for physical Buddha figurine NFC tags; parse URL params to display model/color info. SKUs map to figurines: `RB1BDGD1S1`=Aureate Puṇya (gold), `RB1BDLB1S1`=Celeste Shanti (blue), `RB1BDLG1S1`=Verdant Bodhi (green), `RB1BDLP1S1`=Blush Maitri (pink).
- `_redirects` — Netlify routing rules that map NFC tag URLs to model pages (`/product/3magic/models/…`) and short links (`/punya`, `/bodhi`, …) to `religions/buddhism/` pages.
- **Amazon links on `product/3magic/index.html` are placeholders** (Amazon search URLs). Replace with real product/ASIN links once listings exist.
- Add new product SKUs by creating `product/3magic/models/<NEW-SKU>.html` and adding the redirect rule in `_redirects`.

### Buddhism Content
- `religions/buddhism/` — virtue pages (philosophy/meaning content for the figurine virtues). Distinct from the magazine and not moved into `magazine/`.

## Deployment

Two paths target `main` on push: a Netlify build (the `_redirects` file controls URL routing there) and a self-hosted GitHub Actions workflow (`.github/workflows/deploy.yml`) that rsyncs the repo to an EC2/Nginx release directory. The rsync preserves the full directory structure, so the root corporate site, `product/`, and `magazine/` all deploy as-is.

## Key Implementation Notes

- **Corporate pages** (root `index.html`, `product/`): dark luxurious palette, gold accents, `IntersectionObserver` fade-ins, scroll-triggered nav background, hamburger menu at 768px.
- **Magazine** (`magazine/index.html`):
  - **Hero crossfade**: 480ms CSS transition, triggered by swapping `.hero-bg` src
  - **Fade-on-scroll**: `IntersectionObserver` on `.fade-in` elements (gallery, about)
  - **Poem tooltips**: Hover/tap shows original-language text with dynamic positioning to avoid viewport overflow
  - **Mobile breakpoint**: 768px — hamburger nav, single-column layout at 480px
- **Typography** (both surfaces): Cormorant Garamond (display/quotes), Jost (UI); the magazine also loads CJK-specific fonts (Ma Shan Zheng, Nanum Myeongjo) from Google Fonts.
