# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Moment of Zen** — a daily meditative web experience presenting curated quotes, poetry, and gallery imagery. Pure static site (no build step, no bundler, no framework). Supports 7 languages: English, Japanese, Simplified Chinese, Traditional Chinese, Korean, Thai, Vietnamese.

## Running Locally

```powershell
python -m http.server 8000
# or any static file server — no build needed
```

Open `index.html` directly or via the server. The `days/` and `locales/` paths are loaded at runtime as JS module scripts.

## Adding a New Day

```powershell
.\days\new-day.ps1 -Date 2026-06-10 -HeroId photo-XXXX -Gallery1Id photo-YYYY -Gallery2Id photo-ZZZZ
```

This scaffolds `days/2026-06-10/data.js` (with TODO placeholders), six locale translation files, downloads Unsplash images if IDs are provided, and updates `days/available.js`. Fill in `data.js` manually with the quote, subtitle, and poems.

## Architecture

### Entry Point
`index.html` is the entire app — all CSS (large inline `<style>` block) and application JS live inside it. There is no separate JS bundle.

### Content Model
- `days/available.js` — ordered list of available dates (newest first)
- `days/<date>/data.js` — day content object: hero image, subtitle, quote, gallery items, two poems, optional music URL
- `days/<date>/data.<lang>.js` — per-day translations (ja, ko, th, vi, zh-hans, zh-hant); only loaded when user picks that language
- Content priority: per-day translation → 14-entry POOL fallback in each locale → English

### Localization
- `i18n.js` — language switching system; lazy-loads locale files on demand; persists selection to `localStorage['moz-lang']`
- `locales/<lang>.js` — UI labels + 14-entry fallback pool (quotes, subtitles)
- Add a new language by creating `locales/[code].js` matching the structure of `en.js`, adding per-day translation files, and registering the language in `i18n.js`

### 3magic NFC Integration
- `3magic/models/<SKU>.html` — product pages for physical Buddha figurine NFC tags; parse URL params to display model/color info
- `_redirects` — Netlify routing rules that map NFC tag URLs to the correct model pages
- Add new product SKUs by creating `3magic/models/<NEW-SKU>.html` and adding the redirect rule in `_redirects`

## Deployment

Netlify, automatic on push to `main`. The `_redirects` file controls all URL routing. No CI pipeline.

## Key Implementation Notes

- **Hero crossfade**: 480ms CSS transition, triggered by swapping `.hero-bg` src
- **Fade-on-scroll**: `IntersectionObserver` on `.fade-in` elements (gallery, about)
- **Poem tooltips**: Hover/tap shows original-language text with dynamic positioning to avoid viewport overflow
- **Mobile breakpoint**: 768px — hamburger nav, single-column layout at 480px
- **Typography**: Cormorant Garamond (quotes/poems), Jost (UI), CJK-specific fonts (Ma Shan Zheng, Nanum Myeongjo) loaded from Google Fonts
