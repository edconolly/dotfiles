#!/usr/bin/env node
// Layout check for design-system proposal pages (me-design-system skill).
//
//   node check-pages.mjs <url> [<url> ...] [--out dir] [--widths 1440,390]
//
// For each page and width it reports: horizontal overflow (and which elements cause it), page errors, whether
// the left section list (.toc) exists with 8 entries, and whether clicking "Components" marks it as current
// and keeps the list in view (desktop). Writes screenshots: <slug>-<width>-top.png, -nav.png, -comp.png.
// Exits 1 if any check fails. Pages must be served over http (python3 -m http.server), not file://.
//
// Needs playwright-core and Chrome. Set PLAYWRIGHT_CORE (path to playwright-core/index.mjs) and CHROME_PATH
// if the defaults below don't exist on this machine.

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const home = os.homedir();
const pwCandidates = [process.env.PLAYWRIGHT_CORE, 'playwright-core',
  path.join(home, '.dotfiles/.agents/skills/stageshow/node_modules/playwright-core/index.mjs')].filter(Boolean);
let chromium;
for (const c of pwCandidates) { try { ({ chromium } = await import(c)); break; } catch {} }
if (!chromium) { console.error('playwright-core not found. Set PLAYWRIGHT_CORE or run: npm i -D playwright-core'); process.exit(2); }
const chromePath = process.env.CHROME_PATH || ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome', '/usr/bin/chromium'].find(p => fs.existsSync(p));

const args = process.argv.slice(2);
const opt = (k, d) => (args.includes(k) ? args[args.indexOf(k) + 1] : d);
const out = opt('--out', 'shots');
const widths = opt('--widths', '1440,390').split(',').map(Number);
const urls = args.filter((a, i) => !a.startsWith('--') && !['--out', '--widths'].includes(args[i - 1]));
if (!urls.length) { console.error('Usage: check-pages.mjs <url> [...] [--out dir] [--widths 1440,390]'); process.exit(2); }
fs.mkdirSync(out, { recursive: true });

const browser = await chromium.launch(chromePath ? { executablePath: chromePath } : {});
let problems = 0;
for (const url of urls) {
  const slug = new URL(url).pathname.split('/').filter(Boolean).slice(-2, -1)[0] || 'page';
  for (const w of widths) {
    // Reduced motion: smooth scrolling would otherwise still be running when the list is read.
    const page = await browser.newPage({ viewport: { width: w, height: w > 800 ? 900 : 844 }, reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);
    const res = await page.evaluate(() => {
      const clipped = e => { for (let a = e.parentElement; a && a !== document.body; a = a.parentElement) if (getComputedStyle(a).overflowX !== 'visible') return true; return false; };
      const over = document.documentElement.scrollWidth - innerWidth;
      const culprits = over > 0 ? [...document.querySelectorAll('body *')]
        .filter(e => e.getBoundingClientRect().right > innerWidth + 1 && !clipped(e)).slice(0, 4)
        .map(e => `${e.tagName.toLowerCase()}${e.className && typeof e.className === 'string' ? '.' + e.className.trim().split(/\s+/).join('.') : ''} in #${e.closest('section')?.id || '?'}`) : [];
      return { over, culprits, toc: document.querySelectorAll('.toc a').length };
    });
    await page.screenshot({ path: path.join(out, `${slug}-${w}-top.png`) });
    let nav = 'n/a';
    // Find the Components entry by id, or by its label for pages that use other ids.
    const link = (await page.$('.toc a[href="#components"]')) || (await page.$('.toc a:has-text("Components")'));
    if (link) {
      await link.click(); await page.waitForTimeout(900);
      nav = await page.evaluate(desktop => {
        const cur = [...document.querySelectorAll('.toc a[aria-current="true"]')].map(a => a.textContent.trim());
        const r = document.querySelector('.toc').getBoundingClientRect();
        const visible = !desktop || (r.top >= 0 && r.top < innerHeight && r.height > 0);
        return `${cur.join(',') || 'none'}${visible ? '' : ' (list not in view)'}`;
      }, w > 860);
      await page.screenshot({ path: path.join(out, `${slug}-${w}-nav.png`) });
    }
    // The composites section: by id, or the target of the list entry labelled "Composites".
    const box = await page.evaluate(() => {
      const a = [...document.querySelectorAll('.toc a')].find(x => /Composites/.test(x.textContent));
      let el = document.querySelector('#composites') || (a && document.querySelector(a.hash));
      if (!el) return null;
      el = el.closest('section') || el;
      const r = el.getBoundingClientRect(); return { y: r.top + scrollY, h: r.height };
    });
    if (box) {
      await page.screenshot({ path: path.join(out, `${slug}-${w}-comp.png`), fullPage: true, clip: { x: 0, y: box.y, width: w, height: Math.min(box.h, 3200) } });
    }
    const bad = res.over > 0 || errors.length || res.toc !== 8 || !/Components/.test(nav) || /not in view/.test(nav);
    if (bad) problems++;
    console.log(`${bad ? 'FAIL' : 'ok  '} ${slug} @${w}: overflow=${res.over}px${res.culprits.length ? ' [' + res.culprits.join('; ') + ']' : ''} errors=${errors.length ? errors.join(' | ') : 0} toc=${res.toc} current=${nav}`);
    await page.close();
  }
}
await browser.close();
process.exit(problems ? 1 : 0);
