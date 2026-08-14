# Pushpam Raj — Portfolio

Personal portfolio site. Dark, motion-heavy, built around a 3D-rendered avatar
that reacts to the cursor.

**Stack:** React 19 · TypeScript · Vite 7 · GSAP 3.15 (ScrollTrigger,
ScrollSmoother, SplitText, Observer) · Three.js via React Three Fiber · hand-written
CSS with design tokens. No CSS framework, no component library.

---

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:5173.

The first `npm run dev` needs generated images to exist. If `src/assets/generated`
is missing, run the asset pipeline first:

```bash
npm run assets
```

---

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Vite dev server with HMR |
| `npm run build` | Regenerates assets, typechecks, then builds to `dist/` |
| `npm run preview` | Serves the production build on :4173 |
| `npm run assets` | Rebuilds every derived image from the source renders |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `node scripts/shoot.mjs` | Screenshots every section in real Chrome (see below) |
| `node scripts/audit.mjs` | axe-core accessibility + page-structure audit |

---

## How content is edited

Every fact on the page comes from typed data files in `src/data/`. Sections render
from that data, so updating the site is a one-file edit — no JSX changes needed.

| File | Contents |
| --- | --- |
| `profile.ts` | Name, role, contact details, summary, headline stats |
| `experience.ts` | Career timeline (jobs + education) |
| `projects.ts` | Project write-ups, metrics, stack, links |
| `skills.ts` | Tech-stack groups and the three "What I Do" cards |
| `credentials.ts` | Certifications, achievements |
| `nav.ts` | Nav items and section ids |

The source of truth for all of it is the résumé at
`src/assets/source/Pushpam's Resume.pdf`.

### Still to fill in

`src/data/projects.ts` is marked `TODO(links)` — the two projects currently point
at the GitHub profile root because the résumé lists no repository or demo URLs.
Swap in the real ones and nothing else needs to change.

---

## Assets

`scripts/prepare-assets.mjs` derives everything the site imports from three source
renders in `src/assets/source/`. It is idempotent — re-run it any time.

It produces:

- `avatar-hero` — the circular portrait, alpha-faded so it floats on the page
- `avatar-hero-chrome` — a violet-metal grade of the **same crop**, used as the
  second texture in the cursor reveal. Pixel-identical framing is the whole
  effect, which is why both come from one crop.
- `avatar-desk` — the seated scene for the About section
- `avatar-face-1..3` — the three expressions cut out of the contact sheet, one
  per "What I Do" card
- `tech-<id>` — equirectangular sphere textures for the Tech Stack scene, built
  from `simple-icons` brand paths (or a wordmark where simple-icons carries no
  logo). The logo repeats three times around the equator so a mark faces the
  camera from any angle; poles stay blank because that is where equirectangular
  distortion is worst. Driven by `techBalls` in `src/data/skills.ts`.
- `public/noise.png`, `public/og.png`, and the résumé copied to `public/resume/`
- `manifest.ts` — the widths actually rendered, so `srcset` never advertises a
  size that was not produced

Generated output is gitignored; the originals are committed.

To swap in new renders, drop them in `src/assets/source/` under the same filenames
and re-run `npm run assets`.

---

## Contact form

The form posts to a public endpoint (Formspree or Web3Forms). Copy `.env.example`
to `.env` and set it:

```
VITE_CONTACT_ENDPOINT=https://formspree.io/f/xxxxxxxx
```

This value is not a secret — it is a public submission URL, safe in the client
bundle. **With it unset the form is replaced by an email panel**, so the site is
fully functional either way and visitors never see setup instructions.

---

## Deploying to Vercel

1. Push the repo to GitHub.
2. On Vercel, **Add New → Project** and import it. The framework is detected as
   Vite; `vercel.json` already sets the build command, output directory, and cache
   headers.
3. Add `VITE_CONTACT_ENDPOINT` under **Settings → Environment Variables** if you
   want the form.
4. Deploy. Every push to the default branch redeploys.

After you have a real domain, update it in three places: `index.html` (canonical,
OG, Twitter, JSON-LD), `public/sitemap.xml`, and `public/robots.txt`.

---

## Accessibility & motion

- `prefers-reduced-motion` is honoured throughout: smooth scrolling off, no
  pinning, no cursor-follow, the hero renders a plain `<img>` instead of the
  WebGL scene, and the Tech Stack physics scene becomes a static chip grid.
- The WebGL hero falls back to a static portrait on three conditions — no WebGL
  support, reduced motion, or a runtime context loss.
- `node scripts/audit.mjs` reports zero axe violations (WCAG 2.1 A/AA +
  best-practice), one `h1`, no skipped heading levels, and a visible focus ring on
  every stop.

## Performance notes

- Three.js (~232 kB gzip) sits behind `React.lazy` boundaries, shared by the hero
  avatar and the Tech Stack scene. It is not in the initial bundle and never
  downloads for reduced-motion or non-WebGL visitors. Initial JS is ~137 kB gzip.
- The Tech Stack physics is a ~21 kB gzip hand-written sphere solver
  (`src/three/spherePhysics.ts`). Rapier was used first and dropped: it ships its
  WASM base64-inlined, which cost 865 kB gzip for behaviour that, with only
  spheres involved, is sixty lines of maths.
- `vite.config.ts` deliberately sets **no** `manualChunks`: naming a Three.js
  chunk pulls React in with it, which makes the entry chunk import it statically
  and defeats the lazy boundary.
- Images ship as AVIF → WebP → PNG at three widths, with `sizes` set per usage.
- Fonts are self-hosted variable `.woff2` (Archivo, Inter, JetBrains Mono).

## Testing in a headless browser

`scripts/shoot.mjs` and `scripts/audit.mjs` drive real Chrome over CDP. This
matters: an embedded editor preview keeps the page `document.hidden`, which
throttles `requestAnimationFrame` to zero — GSAP's ticker and R3F's render loop
both freeze and nothing animates. These scripts run a genuinely visible page.

```bash
node scripts/shoot.mjs --width=390 --height=844 --out=./shots-mobile
node scripts/shoot.mjs --motion=reduce
node scripts/audit.mjs --url=http://localhost:4173
```

Both expect Chrome at `/Applications/Google Chrome.app`.

---

## Credit

Design and code by Pushpam Raj, built with Claude Code. The avatar renders are
original assets.
