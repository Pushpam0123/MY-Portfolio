import { mkdir, copyFile, readdir, access, rm, writeFile, readFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = path.join(root, 'src/assets/source');
const OUT = path.join(root, 'src/assets/generated');
const PUBLIC = path.join(root, 'public');

const ORIGINALS = {
  headshot: '4avatar.png',
  desk: 'desk-scene.png',
  resume: "Pushpam's Resume.pdf",
};

const WIDTHS = [640, 1024, 1536];
const FORMATS = [
  ['avif', (p) => p.avif({ quality: 62, effort: 6 })],
  ['webp', (p) => p.webp({ quality: 82, effort: 5 })],
  ['png', (p) => p.png({ compressionLevel: 9, palette: true })],
];

const exists = (p) =>
  access(p, constants.F_OK).then(
    () => true,
    () => false,
  );

async function collectOriginals() {
  await mkdir(SOURCE, { recursive: true });
  for (const file of Object.values(ORIGINALS)) {
    const dest = path.join(SOURCE, file);
    if (await exists(dest)) continue;
    const fromRoot = path.join(root, file);
    if (await exists(fromRoot)) {
      await copyFile(fromRoot, dest);
      await rm(fromRoot);
      console.log(`  moved  ${file} → src/assets/source/`);
    } else {
      throw new Error(
        `Missing source asset "${file}". Expected it in the project root or in src/assets/source/.`,
      );
    }
  }
}

function radialMask(width, height, { inner = 0.62, outer = 0.99 } = {}) {
  return Buffer.from(
    `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
       <defs>
         <radialGradient id="m" cx="50%" cy="47%" r="52%">
           <stop offset="${inner * 100}%" stop-color="#fff" stop-opacity="1"/>
           <stop offset="${outer * 100}%" stop-color="#fff" stop-opacity="0"/>
         </radialGradient>
       </defs>
       <rect width="${width}" height="${height}" fill="url(#m)"/>
     </svg>`,
  );
}

function edgeMask(width, height) {
  return Buffer.from(
    `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
       <defs>
         <linearGradient id="v" x1="0" y1="0" x2="0" y2="1">
           <stop offset="0%"   stop-color="#fff" stop-opacity="0"/>
           <stop offset="14%"  stop-color="#fff" stop-opacity="1"/>
           <stop offset="86%"  stop-color="#fff" stop-opacity="1"/>
           <stop offset="100%" stop-color="#fff" stop-opacity="0"/>
         </linearGradient>
         <linearGradient id="h" x1="0" y1="0" x2="1" y2="0">
           <stop offset="0%"   stop-color="#fff" stop-opacity="0"/>
           <stop offset="10%"  stop-color="#fff" stop-opacity="1"/>
           <stop offset="90%"  stop-color="#fff" stop-opacity="1"/>
           <stop offset="100%" stop-color="#fff" stop-opacity="0"/>
         </linearGradient>
         <mask id="hm"><rect width="${width}" height="${height}" fill="url(#h)"/></mask>
       </defs>
       <rect width="${width}" height="${height}" fill="url(#v)" mask="url(#hm)"/>
     </svg>`,
  );
}

const manifest = {};

async function emit(pipeline, name, requested = WIDTHS, formats = FORMATS) {
  const buffer = await pipeline.png().toBuffer();
  const native = (await sharp(buffer).metadata()).width;

  const widths = [...new Set(requested.map((w) => Math.min(w, native)))].sort((a, b) => a - b);

  for (const width of widths) {
    for (const [ext, apply] of formats) {
      await apply(sharp(buffer).resize({ width, withoutEnlargement: true })).toFile(
        path.join(OUT, `${name}-${width}.${ext}`),
      );
    }
  }

  manifest[name] = widths;
  console.log(`  built  ${name} → ${widths.join(', ')} (${widths.length * formats.length} files)`);
}

async function writeManifest() {
  const body = Object.entries(manifest)
    .map(([name, widths]) => `  '${name}': [${widths.join(', ')}],`)
    .join('\n');

  await writeFile(
    path.join(OUT, 'manifest.ts'),
    `export const imageWidths = {\n${body}\n} as const;\n\n` +
      `export type ImageName = keyof typeof imageWidths;\n`,
    'utf8',
  );
  console.log('  built  manifest.ts');
}

async function buildHero() {
  const src = path.join(SOURCE, ORIGINALS.headshot);
  const { width, height } = await sharp(src).metadata();
  const side = Math.round(Math.min(width, height) * 0.94);
  const left = Math.round((width - side) / 2);
  const top = Math.round((height - side) / 2);

  const base = await sharp(src)
    .extract({ left, top, width: side, height: side })
    .ensureAlpha()
    .composite([{ input: radialMask(side, side), blend: 'dest-in' }])
    .png()
    .toBuffer();

  await emit(sharp(base), 'avatar-hero');

  const sheen = Buffer.from(
    `<svg width="${side}" height="${side}" xmlns="http://www.w3.org/2000/svg">
       <defs>
         <linearGradient id="s" x1="0.1" y1="0" x2="0.9" y2="1">
           <stop offset="0%"   stop-color="#241A4A"/>
           <stop offset="30%"  stop-color="#6E58C4"/>
           <stop offset="46%"  stop-color="#B7A6F2"/>
           <stop offset="58%"  stop-color="#5A45A8"/>
           <stop offset="78%"  stop-color="#8E79DC"/>
           <stop offset="100%" stop-color="#1E1640"/>
         </linearGradient>
       </defs>
       <rect width="${side}" height="${side}" fill="url(#s)"/>
     </svg>`,
  );

  const graded = await sharp(base)
    .modulate({ saturation: 0, brightness: 1.0 })
    .linear(1.34, -26)
    .composite([{ input: sheen, blend: 'overlay' }])
    .modulate({ brightness: 0.72 })
    .png()
    .toBuffer();

  const chrome = sharp(graded)
    .ensureAlpha()
    .composite([{ input: radialMask(side, side), blend: 'dest-in' }]);

  await emit(chrome, 'avatar-hero-chrome', [1024], [FORMATS[1]]);
}

async function buildDesk() {
  const src = path.join(SOURCE, ORIGINALS.desk);
  const { width, height } = await sharp(src).metadata();
  const pipeline = sharp(src)
    .ensureAlpha()
    .composite([{ input: edgeMask(width, height), blend: 'dest-in' }]);
  await emit(pipeline, 'avatar-desk');
}

async function buildNoise() {
  const size = 256;
  const pixels = Buffer.alloc(size * size * 4);
  for (let i = 0; i < size * size; i += 1) {
    const v = Math.floor(Math.random() * 256);
    pixels[i * 4] = v;
    pixels[i * 4 + 1] = v;
    pixels[i * 4 + 2] = v;
    pixels[i * 4 + 3] = 26;
  }
  await sharp(pixels, { raw: { width: size, height: size, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toFile(path.join(PUBLIC, 'noise.png'));
  console.log('  built  noise.png');
}

async function buildOgImage() {
  const W = 1200;
  const H = 630;

  const portrait = await sharp(path.join(OUT, 'avatar-hero-640.png'))
    .resize({ width: 430 })
    .toBuffer();

  const text = Buffer.from(
    `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
       <defs>
         <radialGradient id="glow" cx="76%" cy="50%" r="46%">
           <stop offset="0%"   stop-color="#7C4DFF" stop-opacity="0.5"/>
           <stop offset="100%" stop-color="#7C4DFF" stop-opacity="0"/>
         </radialGradient>
       </defs>
       <rect width="${W}" height="${H}" fill="#08070C"/>
       <rect width="${W}" height="${H}" fill="url(#glow)"/>
       <text x="80" y="250" font-family="Helvetica, Arial, sans-serif" font-size="76"
             font-weight="700" fill="#F4F2FF" letter-spacing="-2">Pushpam Raj</text>
       <text x="80" y="316" font-family="Helvetica, Arial, sans-serif" font-size="30"
             font-weight="500" fill="#A855F7" letter-spacing="1">AI / ML Engineer</text>
       <text x="80" y="372" font-family="Helvetica, Arial, sans-serif" font-size="25"
             fill="#9A96AD">Automation systems · LLM tooling · Full-stack delivery</text>
       <rect x="80" y="432" width="196" height="46" rx="23" fill="none" stroke="#2A2440"/>
       <circle cx="106" cy="455" r="5" fill="#4ADE80"/>
       <text x="122" y="462" font-family="Helvetica, Arial, sans-serif" font-size="17"
             fill="#9A96AD" letter-spacing="1">Open to work</text>
     </svg>`,
  );

  await sharp(text)
    .composite([{ input: portrait, top: 100, left: 700 }])
    .png()
    .toFile(path.join(PUBLIC, 'og.png'));
  console.log('  built  og.png');
}

const clamp255 = (v) => Math.max(0, Math.min(255, Math.round(v)));

const parseHex = (hex) => {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
};

const toHex = (rgb) => `#${rgb.map((c) => clamp255(c).toString(16).padStart(2, '0')).join('')}`;

const mix = (a, b, t) => {
  const [ar, ag, ab] = parseHex(a);
  const [br, bg, bb] = parseHex(b);
  return toHex([ar + (br - ar) * t, ag + (bg - ag) * t, ab + (bb - ab) * t]);
};

const luminance = (hex) => {
  const channel = (c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  const [r, g, b] = parseHex(hex);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
};

const rgbToHsl = (hex) => {
  const [r, g, b] = parseHex(hex).map((c) => c / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return [0, 0, l];

  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return [h, s, l];
};

const hslToHex = ([h, s, l]) => {
  if (s === 0) return toHex([l * 255, l * 255, l * 255]);
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const channel = (t) => {
    let v = t;
    if (v < 0) v += 1;
    if (v > 1) v -= 1;
    if (v < 1 / 6) return p + (q - p) * 6 * v;
    if (v < 1 / 2) return q;
    if (v < 2 / 3) return p + (q - p) * (2 / 3 - v) * 6;
    return p;
  };
  return toHex([channel(h + 1 / 3) * 255, channel(h) * 255, channel(h - 1 / 3) * 255]);
};

const shellTone = (hex, lightness) => {
  const [h, s] = rgbToHsl(hex);
  return hslToHex([h, Math.min(s, 0.42), lightness]);
};

const readable = (hex, limit) => {
  let out = hex;
  let guard = 0;
  while (luminance(out) > limit && guard < 24) {
    out = mix(out, '#000000', 0.1);
    guard += 1;
  }
  return out;
};

const INK_ICON = 0.42;
const INK_WORDMARK = 0.28;

async function buildTechTextures() {
  const { techBalls } = await loadTechBalls();
  const si = await import('simple-icons');

  const W = 1536;
  const H = 768;
  const LOGO = 384;
  const positions = [W * 0.25, W * 0.75];

  for (const ball of techBalls) {
    let brand = ball.hex ? `#${ball.hex}` : '#333333';
    let iconPath = null;

    if (ball.icon) {
      const key = `si${ball.icon.charAt(0).toUpperCase()}${ball.icon.slice(1)}`;
      const icon = si[key] ?? si.default?.[key];
      if (!icon) throw new Error(`simple-icons has no "${ball.icon}" (looked for ${key})`);
      brand = `#${ball.hex ?? icon.hex}`;
      iconPath = icon.path;
    }

    const ink = readable(brand, iconPath ? INK_ICON : INK_WORDMARK);

    const shellLight = shellTone(brand, 0.95);
    const shellMid = shellTone(brand, 0.9);
    const shellDeep = shellTone(brand, 0.78);

    let marks = '';

    if (iconPath) {
      const s = LOGO / 24;

      marks = positions
        .map(
          (cx) =>
            `<g transform="translate(${cx - LOGO / 2} ${H / 2 - LOGO / 2}) scale(${s})">` +
            `<path d="${iconPath}" fill="${ink}"/></g>`,
        )
        .join('');
    } else {
      const panel = W / positions.length;
      const maxTextWidth = panel * 0.62;
      const avgGlyphRatio = 0.58;
      const fontSize = Math.min(
        200,
        Math.round(maxTextWidth / (avgGlyphRatio * ball.label.length)),
      );

      marks = positions
        .map(
          (cx) =>
            `<text x="${cx}" y="${H / 2}" font-family="Helvetica, Arial, sans-serif" ` +
            `font-size="${fontSize}" font-weight="700" fill="${ink}" text-anchor="middle" ` +
            `dominant-baseline="central" letter-spacing="-2">${ball.label}</text>`,
        )
        .join('');
    }

    const svg = Buffer.from(
      `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
         <defs>
           <linearGradient id="shell" x1="0" y1="0" x2="0" y2="1">
             <stop offset="0%"   stop-color="${shellDeep}"/>
             <stop offset="26%"  stop-color="${shellMid}"/>
             <stop offset="50%"  stop-color="${shellLight}"/>
             <stop offset="74%"  stop-color="${shellMid}"/>
             <stop offset="100%" stop-color="${shellDeep}"/>
           </linearGradient>
         </defs>
         <rect width="${W}" height="${H}" fill="url(#shell)"/>
         ${marks}
       </svg>`,
    );

    await emit(sharp(svg), `tech-${ball.id}`, [W], [FORMATS[1]]);
  }
}

async function loadTechBalls() {
  const source = await readFile(path.join(root, 'src/data/skills.ts'), 'utf8');
  const match = source.match(/export const techBalls: TechBall\[\] = (\[[\s\S]*?\n\]);/);
  if (!match) throw new Error('Could not find techBalls in src/data/skills.ts');

  const literal = match[1].replace(/\/\/.*$/gm, '').replace(/,(\s*[\]}])/g, '$1');

  const techBalls = new Function(`return ${literal}`)();
  return { techBalls };
}

async function copyResume() {
  await mkdir(path.join(PUBLIC, 'resume'), { recursive: true });
  await copyFile(
    path.join(SOURCE, ORIGINALS.resume),
    path.join(PUBLIC, 'resume/Pushpam-Raj-Resume.pdf'),
  );
  console.log('  built  resume/Pushpam-Raj-Resume.pdf');
}

async function main() {
  console.log('Preparing assets…');
  await collectOriginals();
  await mkdir(OUT, { recursive: true });
  await mkdir(PUBLIC, { recursive: true });

  await buildHero();
  await buildDesk();
  await buildTechTextures();
  await buildNoise();
  await buildOgImage();
  await copyResume();
  await writeManifest();

  const files = await readdir(OUT);
  console.log(`Done — ${files.length} generated images in src/assets/generated/`);
}

main().catch((error) => {
  console.error('\nAsset preparation failed:', error.message);
  process.exit(1);
});
