# 🕷️ Peter Toss — Portfolio

Spider-Man themed portfolio for a Software Engineer & AI Engineer, featuring an immersive Three.js 3D scene.

## 🚀 Live Demo

Open `index.html` in any browser — no build step required.

## 📦 What's Included

```
spidey-portfolio-full/
├── index.html              ← Complete standalone portfolio (open in browser)
├── nextjs-project/         ← Next.js App Router source code
│   ├── package.json
│   ├── next.config.js
│   ├── tsconfig.json
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx      ← Root layout + full SEO metadata
│   │   │   ├── page.tsx        ← Home page + JSON-LD
│   │   │   ├── globals.css     ← Spider-Man theme
│   │   │   ├── robots.ts       ← robots.txt
│   │   │   ├── sitemap.ts      ← sitemap.xml
│   │   │   └── not-found.tsx   ← 404 page
│   │   └── components/
│   │       ├── SpiderScene.tsx  ← 3D scene (NYC skyline, web strings, particles)
│   │       ├── Navbar.tsx
│   │       ├── HeroSection.tsx
│   │       ├── AboutSection.tsx
│   │       ├── SkillsSection.tsx
│   │       ├── ProjectsSection.tsx
│   │       ├── ContactSection.tsx
│   │       └── Footer.tsx
│   └── public/
└── README.md
```

## 🛠️ Next.js Development

```bash
cd nextjs-project
npm install
npm run dev
```

Then open http://localhost:3000

## 🏗️ Static Export

```bash
cd nextjs-project
npm run build
# Output in nextjs-project/out/
```

## 🎨 Features

- **3D Scene**: NYC skyline, animated spider emblem, web strings, particle system
- **Mouse parallax**: Camera follows cursor
- **Scroll parallax**: Camera depth changes as you scroll
- **SEO**: Open Graph, Twitter Cards, JSON-LD, semantic HTML
- **Responsive**: Mobile hamburger menu, fluid typography
- **Scroll reveal**: Sections fade in on scroll

## 🔧 Tech Stack

- Three.js (CDN, v0.160)
- Next.js 15 (App Router)
- TypeScript
- CSS (no framework — all custom)
