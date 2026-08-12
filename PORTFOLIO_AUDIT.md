# Portfolio V2 Repository Audit

> Archived audit documentation. Historical findings only. Not production content.


**Date:** 2026-08-12 | **Repo:** `spidey-portfolio-full` | No code changes made

---

## 1. Current Architecture

| Area | Finding |
|------|---------|
| Framework | Next.js **15.5.22**, React **19**, TypeScript **5** (`strict: true`) |
| Router | **App Router** — `src/app/` |
| Package manager | **npm** (`package-lock.json` local, **gitignored**) |
| Scripts | `dev`, `build`, `start` only — no `lint`/`typecheck` |
| Output | **Static export** (`output: 'export'`) — no API routes |
| 3D | Raw imperative **Three.js** — no R3F |
| Styling | `globals.css` + inline styles + `styled-jsx` |
| Animation | CSS keyframes, `IntersectionObserver` reveal, `scroll-behavior: smooth` |
| Legacy | Root `index.html` (~538 lines) — not used by Next.js |

**Structure:** `src/app/` (layout, page, globals, robots, sitemap, not-found) + `src/components/` (9 files) + `public/projects/` (11 unused SVGs).

**Page flow:** `RevealOnScroll` → `Navbar` → Hero → About → Skills → Projects → Contact → `Footer`.

---

## 2. Dependency Findings

| Package | Status |
|---------|--------|
| `next` ^15 → 15.5.22 | Active |
| `three` ^0.185.1 | Bundled **and** CDN-loaded (conflict) |
| `framer-motion` ^12.42.2 | **Installed, never imported** |
| `@react-three/fiber` | Not installed |
| ESLint | Not configured |

---

## 3. Three.js — Files & Dual-Load Root Cause

| File | Role |
|------|------|
| `src/components/SpiderScene.tsx` | Production scene (~215 lines imperative Three.js) |
| `src/components/HeroSection.tsx` | `dynamic(() => import('./SpiderScene'), { ssr: false })` |
| `index.html` L265 | Legacy CDN import map (not served by Next) |

**"Multiple instances of Three.js" cause:** `SpiderScene.tsx` injects import map → CDN `three@0.160.0` (L11–18) **and** `import('three')` bundles npm `three@0.185.1` (L22). Two builds coexist. Catch fallback (L24–29) would add a third; `getSceneCode()` is a stub.

**CDN:** `cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js` in `SpiderScene.tsx` L15 and `index.html` L265.

**WebGL failure:** No try/catch on `WebGLRenderer`; no fallback when WebGL unavailable — canvas stays blank behind hero text. Loading spinner only covers import delay. No unmount cleanup (rAF, listeners, renderer leak).

---

## 4. Content Locations

| Content | File | Notes |
|---------|------|-------|
| Hero | `HeroSection.tsx` | Inline copy/CTAs |
| About/stats | `AboutSection.tsx` | Bio, `+3 yrs`, `+21 projects` |
| Skills | `SkillsSection.tsx` `const S` | 5 categories (usable) |
| Projects | `ProjectsSection.tsx` `const P` | **Placeholder — discard** |
| Project SVGs | `public/projects/*.svg` | 11 real thumbnails, unwired |
| Contact/social | `ContactSection.tsx` | Alert-only form; `href="#"` socials |
| SEO | `layout.tsx`, `page.tsx` | OG, Twitter, canonical |
| JSON-LD | `page.tsx` | Person schema |
| Sitemap/robots | `sitemap.ts`, `robots.ts` | Single-page |

---

## 5. SEO & Metadata Issues

- `metadataBase`, canonical, OG url: **`https://peterparker.dev`** (`layout.tsx`, `sitemap.ts`, `robots.ts`)
- Twitter `creator`: **`@peterparker`** (`layout.tsx` L31)
- JSON-LD `sameAs`: `github.com/peterparker`, etc. (`page.tsx` L25)
- OG image `/og-image.png` — **missing** from `public/`
- Legacy `index.html` still says "Peter Parker"

---

## 6. Contact, Animation & Scroll

- **Form:** `alert('Thanks! 🕸️')` only — no delivery; static export needs external service
- **Social:** `href="#"` placeholders (`ContactSection.tsx` L18); README has `@pitsssss` unused
- **Scroll:** `html { scroll-behavior: smooth }` (`globals.css` L11)
- **Reveal:** `RevealOnScroll.tsx` — `IntersectionObserver` on `.reveal`
- **Hero:** CSS `fadeUp`; 3D mouse/scroll parallax in `SpiderScene.tsx` rAF loop
- **Skills:** Mouse-tilt 3D cards in `SkillsSection.tsx`
- **`framer-motion`:** unused

---

## 7. Problems by Severity

**Critical**
1. Dual Three.js (CDN 0.160.0 + npm 0.185.1) in `SpiderScene.tsx`
2. WebGL failure leaves 3D background blank — no detection/fallback
3. No scene cleanup on unmount

**High**
4. Placeholder projects in `ProjectsSection.tsx`; real SVGs unused
5. Wrong domain/handles (`peterparker.dev`, `@peterparker`) across metadata files
6. Contact form non-functional
7. Social links `href="#"`

**Medium**
8. Missing `og-image.png`
9. Dead `framer-motion` dependency
10. Legacy `index.html` duplicates Three.js pattern
11. No ESLint config/script
12. Parent lockfile causes Next.js workspace-root warning

**Low**
13. A11y: `outline: none` on inputs; no `prefers-reduced-motion`; no skip link
14. Perf: continuous rAF; blocking Google Fonts `@import`
15. `package-lock.json` gitignored

---

## 8. Reusable Components & Assets

| Preserve | Rewrite |
|----------|---------|
| `globals.css` — tokens, `.glass`, `.reveal`, keyframes | `SpiderScene.tsx` — single import, fallback, cleanup |
| `Navbar`, `HeroSection`, `AboutSection`, `Footer` | `index.html` — archive/delete |
| `SkillsSection` `SkillCard` tilt | |
| `ProjectsSection` card layout (not data) | |
| `ContactSection` form layout (not handler) | |
| `RevealOnScroll`, `not-found.tsx` | |
| `robots.ts`/`sitemap.ts` patterns | |
| `public/projects/*.svg` | |

---

## 9. Recommended V2 Architecture

```
src/
  app/                    layout, page, globals, robots, sitemap, not-found
  components/
    layout/               Navbar, Footer, RevealOnScroll, SectionHeader
    sections/             Hero, About, Skills, Projects, Contact
    three/                HeroCanvas (R3F or clean module), WebGL fallback
    ui/                   GlassCard, Button, Tag, SocialLinks
  content/
    profile.ts  skills.ts  projects.ts  social.ts  site.ts
  lib/contact.ts          Formspree/Resend wrapper
public/og-image.png  projects/*.svg
```

---

## 10. Implementation Order

1. `content/*.ts` + correct domain/handles + `og-image.png`
2. Fix Three.js — remove CDN/import map; WebGL fallback + dispose
3. Wire real projects from `content/projects.ts` + SVGs
4. Contact via external form service (static-export compatible)
5. Social links + JSON-LD `sameAs`
6. Extract shared UI; reduce inline styles
7. Add `lint`/`typecheck` scripts, ESLint, `outputFileTracingRoot`
8. A11y/perf — reduced-motion, pause rAF, focus styles; drop or use `framer-motion`
9. Remove legacy `index.html`

---

## 11. Commands Run

| Command | Result |
|---------|--------|
| `npm run build` | **PASS** — static export; `/` 114 kB First Load JS |
| `npx tsc --noEmit` | **PASS** |
| `npm run lint` | **N/A** — missing script |
| `npx next lint` | **N/A** — no config; interactive prompt |

Build warning: wrong workspace root from `C:\Users\asasv\package-lock.json`.

---

*Production code untouched.*
