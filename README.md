# 🕷️ Peter Toss — Portfolio

Spider-Man themed portfolio for a Software Engineer & AI Engineer, featuring an immersive Three.js 3D scene.

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Then open http://localhost:3000

## 📦 Project Structure

```
spider-portfolio/
├── src/
│   ├── app/
│   │   ├── layout.tsx           # Root layout + SEO metadata
│   │   ├── page.tsx             # Home page + JSON-LD
│   │   ├── globals.css          # Spider-Man theme styles
│   │   ├── robots.ts            # robots.txt
│   │   ├── sitemap.ts           # sitemap.xml
│   │   └── not-found.tsx        # 404 page
│   └── components/
│       ├── SpiderScene.tsx      # 3D scene (web strings, particles)
│       ├── Navbar.tsx           # Navigation bar
│       ├── HeroSection.tsx      # Hero with name animation
│       ├── AboutSection.tsx     # About section
│       ├── SkillsSection.tsx    # Skills showcase
│       ├── ProjectsSection.tsx  # Featured projects
│       ├── ContactSection.tsx   # Contact form
│       ├── Footer.tsx           # Footer
│       └── RevealOnScroll.tsx   # Scroll reveal effects
├── public/                      # Static assets
├── package.json
├── next.config.js
├── tsconfig.json
└── README.md
```

## 🎨 Features

- **3D Scene**: Animated spider emblem, web strings, particle system with Three.js
- **Mouse Parallax**: Camera follows cursor movement
- **Scroll Parallax**: Camera depth changes as you scroll
- **Scroll Reveal**: Sections fade in smoothly on scroll
- **SEO Optimized**: Open Graph, Twitter Cards, JSON-LD, semantic HTML
- **Fully Responsive**: Mobile hamburger menu, fluid typography
- **Modern Stack**: Next.js 15, React 19, TypeScript, Three.js

## 🏗️ Build for Production

```bash
npm run build
npm start
```

## 🔧 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI Library**: React 19
- **Language**: TypeScript 5
- **3D Graphics**: Three.js 0.185
- **Styling**: Custom CSS with animations

## 🎯 Sections

1. **Hero** - Full-screen 3D background with animated name
2. **About** - Bio with statistics and inspirational quote
3. **Skills** - 6 skill categories with tech tags
4. **Projects** - 4 featured projects with descriptions
5. **Contact** - Functional form with social links

## 🌐 Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Import in [Vercel](https://vercel.com)
3. Deploy automatically

### Other Platforms
Build static export:
```bash
npm run build
```

Deploy to:
- Netlify
- Cloudflare Pages
- AWS Amplify
- GitHub Pages

## 📝 Customization

Update personal information in:
- `src/components/HeroSection.tsx` - Name and title
- `src/components/AboutSection.tsx` - Bio and stats
- `src/components/SkillsSection.tsx` - Skills and technologies
- `src/components/ProjectsSection.tsx` - Your projects
- `src/components/ContactSection.tsx` - Contact info and socials
- `src/app/layout.tsx` - SEO metadata
- `src/app/page.tsx` - JSON-LD structured data

## 🐛 Troubleshooting

### 3D Scene Not Rendering
- Check browser WebGL support
- Ensure client-side rendering (`'use client'` directive)
- Check browser console for Three.js errors

### TypeScript Errors
- Restart TypeScript server: `Ctrl+Shift+P` → "TypeScript: Restart TS Server"
- Delete `.next` folder and rebuild

## 📄 License

MIT License - Free to use and modify

## 👨‍💻 Author

**Peter Toss**
- GitHub: [@pitsssss](https://github.com/pitsssss)

---

Built with ❤️ and 🕷️ using Next.js, React, Three.js, and TypeScript
