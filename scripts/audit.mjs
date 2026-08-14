/**
 * Accessibility + structure audit.
 *
 * Runs axe-core against the live page, then adds a few checks axe cannot make:
 * heading order, landmark presence, keyboard reachability of the primary
 * actions, and that every image carries an alt attribute.
 *
 * Usage: node scripts/audit.mjs [--url=http://localhost:5173]
 */
import { createRequire } from 'node:module';
import puppeteer from 'puppeteer-core';

const require = createRequire(import.meta.url);
const axePath = require.resolve('axe-core/axe.min.js');

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v = 'true'] = a.replace(/^--/, '').split('=');
    return [k, v];
  }),
);
const url = args.url ?? 'http://localhost:5173';

const main = async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    defaultViewport: { width: 1280, height: 900 },
    args: ['--hide-scrollbars', '--enable-gpu', '--use-gl=angle', '--no-sandbox'],
  });

  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 45_000 });
  await page.waitForFunction(() => !document.querySelector('.preload'), { timeout: 20_000 });
  await new Promise((r) => setTimeout(r, 1000));

  // Reveal every scroll-triggered section so axe sees the real, settled DOM
  // rather than elements still parked at opacity 0.
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.75;
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo({ top: y, behavior: 'instant' });
      await new Promise((r) => setTimeout(r, 220));
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
    await new Promise((r) => setTimeout(r, 600));
  });

  await page.addScriptTag({ path: axePath });

  const results = await page.evaluate(async () => {
    // eslint-disable-next-line no-undef
    const run = await axe.run(document, {
      resultTypes: ['violations'],
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'] },
    });
    return run.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      help: v.help,
      nodes: v.nodes.slice(0, 4).map((n) => n.html.slice(0, 130)),
    }));
  });

  const structure = await page.evaluate(() => {
    // Report the accessible name, not raw textContent: an aria-label overrides
    // the content, and visually-broken lines can concatenate without spaces.
    const headings = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map((h) => ({
      level: Number(h.tagName[1]),
      text: (h.getAttribute('aria-label') ?? h.textContent ?? '')
        .trim()
        .replace(/\s+/g, ' ')
        .slice(0, 52),
    }));

    const order = [];
    let prev = 0;
    for (const h of headings) {
      if (prev && h.level > prev + 1) order.push(`h${prev} → h${h.level} ("${h.text}")`);
      prev = h.level;
    }

    return {
      h1Count: headings.filter((h) => h.level === 1).length,
      headings,
      skippedLevels: order,
      landmarks: {
        header: document.querySelectorAll('header').length,
        main: document.querySelectorAll('main').length,
        footer: document.querySelectorAll('footer').length,
        nav: document.querySelectorAll('nav').length,
      },
      imagesMissingAlt: [...document.images]
        .filter((i) => !i.hasAttribute('alt'))
        .map((i) => i.currentSrc.split('/').pop()),
      langAttr: document.documentElement.lang,
      title: document.title,
      metaDescription: document
        .querySelector('meta[name="description"]')
        ?.getAttribute('content')?.length,
    };
  });

  // Keyboard reachability: tab through and record what receives focus.
  const focusOrder = [];
  for (let i = 0; i < 14; i += 1) {
    await page.keyboard.press('Tab');
    const info = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return null;
      const style = getComputedStyle(el);
      return {
        tag: el.tagName.toLowerCase(),
        label: (el.getAttribute('aria-label') || el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 34),
        outline: style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) > 0,
      };
    });
    if (info) focusOrder.push(info);
  }

  await browser.close();

  console.log('STRUCTURE');
  console.log('  title           :', structure.title);
  console.log('  lang            :', structure.langAttr || 'MISSING');
  console.log('  meta desc length:', structure.metaDescription ?? 'MISSING');
  console.log('  h1 count        :', structure.h1Count);
  console.log('  landmarks       :', JSON.stringify(structure.landmarks));
  console.log('  images w/o alt  :', structure.imagesMissingAlt.length || 'none');
  console.log('  skipped levels  :', structure.skippedLevels.length ? structure.skippedLevels : 'none');

  console.log('\nHEADING OUTLINE');
  for (const h of structure.headings) console.log(`  ${'  '.repeat(h.level - 1)}h${h.level} ${h.text}`);

  console.log('\nKEYBOARD FOCUS ORDER (first 14 stops)');
  for (const f of focusOrder) {
    console.log(`  ${f.outline ? '✓' : '✗ no ring'} <${f.tag}> ${f.label}`);
  }

  console.log('\nAXE VIOLATIONS');
  if (!results.length) {
    console.log('  none');
  } else {
    for (const v of results) {
      console.log(`  [${v.impact}] ${v.id} — ${v.help}`);
      for (const n of v.nodes) console.log(`      ${n}`);
    }
    process.exitCode = 1;
  }
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
