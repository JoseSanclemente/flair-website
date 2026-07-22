# Flair

AI-powered personal stylist landing page — describe what you need, get shoppable outfits from real products.

> **Status:** Prototype. Live on Netlify.

## Tech Stack

- HTML / CSS / vanilla JS — no build step, no framework
- [Tailwind CSS](https://tailwindcss.com/) (CDN)
- [GSAP](https://gsap.com/) 3.12.5 + ScrollTrigger (CDN) — scroll animations
- [Lenis](https://lenis.darkroom.engineering/) 1.3.25 (CDN) — smooth scroll
- Custom Satoshi font

## Project Structure

```
index.html          entry point
js/
  hero.js
  how-it-works.js
  discover-yourself.js
  typing.js
  scroll-utils.js
  smooth-scroll.js
assets/
  css/               main.css, variables.css, satoshi.css
  images/
  fonts/
```

## Running Locally

No install, no build. Just serve the folder:

```bash
npx serve .
```

Or open `index.html` directly in a browser.

## Deployment

Static site deployed on Netlify — publish directory is the repo root, no build command required.
