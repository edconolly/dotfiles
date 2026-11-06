#!/usr/bin/env node
// Layout check for design-system pages, mainly each proposal's system viewer, <slug>/system.html
// (me-design-system skill).
//
//   node check-pages.mjs <url> [<url> ...] [--out dir] [--widths 1440,390]
//
// For each page and width it reports: horizontal overflow (and which elements cause it) and page errors.
// If the page has a section list (.toc, or .sv-toc in the system viewer), it also checks that the list has one link per `main > section[id]`
// (at least one), and that clicking a link (the one to #components if present, else the third, else the last)
// marks that link as current (aria-current="true") and keeps the list in view (desktop). A page without .toc
// skips those checks with a note. Writes screenshots: <slug>-<width>-top.png, -nav.png, and -comp.png when
// a #composites section exists. <slug> is the page's folder, plus the file name unless it is index or system.
// Exits 1 if any check fails, 2 on a usage error. Pages must be served over http (python3 -m http.server).
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
  const parts = new URL(url).pathname.split('/').filter(Boolean);
  const file = (parts.at(-1) || '').replace(/\.html?$/, '');
  const folder = parts.slice(-2, -1)[0] || 'page';
  const slug = !file || ['index', 'system'].includes(file) ? folder : `${folder}-${file}`;
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
      return { over, culprits, hasToc: !!document.querySelector(':is(.toc, .sv-toc)'), toc: document.querySelectorAll(':is(.toc, .sv-toc) a').length,
        sections: document.querySelectorAll('main > section[id]').length };
    });
    await page.screenshot({ path: path.join(out, `${slug}-${w}-top.png`) });
    let nav = 'n/a', navOk = true, tocOk = true;
    if (res.hasToc) {
      tocOk = res.sections >= 1 && res.toc === res.sections;
      // The link to #components if there is one, else the third link (the last if there are fewer).
      const links = await page.$$(':is(.toc, .sv-toc) a');
      const link = (await page.$(':is(.toc, .sv-toc) a[href="#components"]')) || links[2] || links.at(-1);
      navOk = false;
      if (link) {
        const want = (await link.textContent()).trim();
        await link.click(); await page.waitForTimeout(900);
        const st = await page.evaluate(desktop => {
          const cur = [...document.querySelectorAll(':is(.toc, .sv-toc) a[aria-current="true"]')].map(a => a.textContent.trim());
          const r = document.querySelector(':is(.toc, .sv-toc)').getBoundingClientRect();
          return { cur, visible: !desktop || (r.top >= 0 && r.top < innerHeight && r.height > 0) };
        }, w > 860);
        navOk = st.cur.includes(want) && st.visible;
        nav = `${st.cur.join(',') || 'none'} (clicked ${want})${st.visible ? '' : ' (list not in view)'}`;
        await page.screenshot({ path: path.join(out, `${slug}-${w}-nav.png`) });
      }
    }
    // The composites section: by id, or the target of the list entry labelled "Composites".
    const box = await page.evaluate(() => {
      const a = [...document.querySelectorAll(':is(.toc, .sv-toc) a')].find(x => /Composites/.test(x.textContent));
      let el = document.querySelector('#composites') || (a && document.querySelector(a.hash));
      if (!el) return null;
      el = el.closest('section') || el;
      const r = el.getBoundingClientRect(); return { y: r.top + scrollY, h: r.height };
    });
    if (box) {
      await page.screenshot({ path: path.join(out, `${slug}-${w}-comp.png`), fullPage: true, clip: { x: 0, y: box.y, width: w, height: Math.min(box.h, 3200) } });
    }
    const bad = res.over > 0 || errors.length || !tocOk || !navOk;
    if (bad) problems++;
    const tocNote = res.hasToc ? `toc=${res.toc}/${res.sections} sections current=${nav}` : 'toc=none (toc checks skipped)';
    console.log(`${bad ? 'FAIL' : 'ok  '} ${slug} @${w}: overflow=${res.over}px${res.culprits.length ? ' [' + res.culprits.join('; ') + ']' : ''} errors=${errors.length ? errors.join(' | ') : 0} ${tocNote}`);
    await page.close();
  }
}
await browser.close();
process.exit(problems ? 1 : 0);
