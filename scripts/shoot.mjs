import { mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import puppeteer from 'puppeteer-core';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v = 'true'] = a.replace(/^--/, '').split('=');
    return [k, v];
  }),
);

const url = args.url ?? 'http://localhost:5173';
const width = Number(args.width ?? 1280);
const height = Number(args.height ?? 800);
const outDir = path.resolve(args.out ?? './shots');
const reduceMotion = args.motion === 'reduce';

const SECTIONS = ['top', 'about', 'services', 'career', 'work', 'stack', 'credentials', 'contact'];

const main = async () => {
  await rm(outDir, { recursive: true, force: true });
  await mkdir(outDir, { recursive: true });

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    defaultViewport: { width, height, deviceScaleFactor: 1 },
    args: ['--hide-scrollbars', '--enable-gpu', '--use-gl=angle', '--no-sandbox'],
  });

  const page = await browser.newPage();

  if (reduceMotion) {
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  }

  const errors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`console: ${msg.text()}`);
  });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  page.on('requestfailed', (req) =>
    errors.push(`requestfailed: ${req.url()} — ${req.failure()?.errorText}`),
  );

  await page.goto(url, { waitUntil: 'networkidle2', timeout: 45_000 });

  await page
    .waitForFunction(() => !document.querySelector('.preload'), { timeout: 20_000 })
    .catch(() => errors.push('preloader never dismissed'));

  await new Promise((r) => setTimeout(r, 1200));

  const meta = await page.evaluate(() => ({
    docHeight: document.documentElement.scrollHeight,
    smooth: document.body.dataset.smooth,
    canvas: (() => {
      const c = document.querySelector('canvas');
      return c ? { w: c.width, h: c.height } : null;
    })(),

    heroFadeOpacity: (() => {
      const el = document.querySelector('[data-hero-fade]');
      return el ? getComputedStyle(el).opacity : 'missing';
    })(),
  }));

  console.log(`viewport ${width}x${height}${reduceMotion ? ' (reduced motion)' : ''}`);
  console.log('  page height :', meta.docHeight);
  console.log('  smoothing   :', meta.smooth);
  console.log(
    '  hero canvas :',
    meta.canvas ? `${meta.canvas.w}x${meta.canvas.h}` : 'static image',
  );
  console.log('  hero copy   : opacity', meta.heroFadeOpacity);

  for (const id of SECTIONS) {
    const found = await page.evaluate((sectionId) => {
      const el = document.getElementById(sectionId);
      if (!el) return null;

      const y = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: Math.max(0, y - 8), behavior: 'instant' });
      return Math.round(y);
    }, id);

    if (found === null) {
      errors.push(`section #${id} not found`);
      continue;
    }

    await page
      .waitForFunction(
        (target) => {
          const max = document.documentElement.scrollHeight - window.innerHeight;
          return Math.abs(window.scrollY - Math.min(target, max)) < 4;
        },
        { timeout: 8000, polling: 100 },
        Math.max(0, found - 8),
      )
      .catch(() => errors.push(`scroll to #${id} did not settle`));

    await new Promise((r) => setTimeout(r, 3200));
    await page.screenshot({ path: path.join(outDir, `${id}.png`) });
    console.log(`  shot        : ${id}.png (y≈${found})`);
  }

  await browser.close();

  if (errors.length) {
    console.log('\nISSUES:');
    for (const e of [...new Set(errors)]) console.log('  -', e);
    process.exitCode = 1;
  } else {
    console.log('\nNo console errors, page errors, or failed requests.');
  }
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
