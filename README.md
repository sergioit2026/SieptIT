# Siept — Landing page

Brand marketing landing for **Siept** (Portuguese SaaS — websites by subscription). Visual + animations only; no wizard, payments, auth, or database.

## Stack

- Next.js (App Router) + TypeScript
- CSS Modules + global design tokens
- Minimal dependencies

## Run locally

```bash
cd /workspace/siept-landing
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Production build:

```bash
npm run build
npm start
```

## Structure

- `src/app/page.tsx` — landing sections
- `src/app/page.module.css` — layout & section styles
- `src/app/globals.css` — palette, base, reduced-motion
- `src/components/IntroSplash.tsx` — name → slogan intro fade

## Design notes

- Dark / cold greys + sober blue accent
- Intro splash respects `prefers-reduced-motion`
- Copy in European Portuguese (pt-PT)
