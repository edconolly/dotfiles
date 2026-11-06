#!/usr/bin/env node
// Side-by-side composer for screenshots (me-design-system skill, v3). For the critic and for before/after.
//
//   node side-by-side.mjs <img> <img> [<img> ...] --out <file.png> [--labels "Before,After"] [--width 1440]
//                         [--crop 1100] [--cols N]
//
// Scales every image to one column width (the first image's natural width, capped by --width; default cap 1440),
// top-aligns them, and puts a small neutral label above each (outside the screens; default label = file name).
// --crop H keeps only the top H px of each image after scaling (one screen height, e.g. 1100 for 1440 wide).
// --cols N wraps into rows of N (default: all in one row). Light grey background, thin gaps.
// Compare like with like: one call per width (scaling a 390 phone shot up to 1440 is useless).
// PNG, JPEG, WebP and GIF inputs. Exits 1 if an image can't be read or rendered, 2 on a usage error.
//
// Needs playwright-core and Chrome. Set PLAYWRIGHT_CORE (path to playwright-core/index.mjs) and CHROME_PATH
// if the defaults below don't exist on this machine.

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const args = process.argv.slice(2);
const VALUED = ['--out', '--labels', '--width', '--crop', '--cols'];
const opt = (k, d) => (args.includes(k) ? args[args.indexOf(k) + 1] : d);
const imgs = args.filter((a, i) => !a.startsWith('--') && !VALUED.includes(args[i - 1]));
const out = opt('--out');
if (imgs.length < 1 || !out) {
  console.error('Usage: side-by-side.mjs <img> <img> [...] --out <file.png> [--labels "Before,After"] [--width 1440] [--crop 1100] [--cols N]');
  process.exit(2);
}
const cap = Number(opt('--width', 1440));
const crop = opt('--crop') ? Number(opt('--crop')) : 0;
const cols = Math.max(1, Math.min(imgs.length, Number(opt('--cols', imgs.length))));
if (![cap, crop, cols].every(Number.isFinite)) { console.error('--width, --crop and --cols take numbers.'); process.exit(2); }
const given = opt('--labels') ? opt('--labels').split(',').map(s => s.trim()) : [];
const labels = imgs.map((f, i) => given[i] || path.basename(f).replace(/\.[^.]+$/, ''));

const MIME = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif' };
const missing = imgs.filter(f => !fs.existsSync(f));
if (missing.length) { console.error(`Not found: ${missing.join(', ')}`); process.exit(1); }
const srcs = imgs.map(f => `data:${MIME[path.extname(f).toLowerCase()] || 'image/png'};base64,${fs.readFileSync(f).toString('base64')}`);

const home = os.homedir();
let chromium;
for (const c of [process.env.PLAYWRIGHT_CORE, 'playwright-core', path.join(home, '.dotfiles/.agents/skills/stageshow/node_modules/playwright-core/index.mjs')].filter(Boolean)) {
  try { ({ chromium } = await import(c)); break; } catch {}
}
if (!chromium) { console.error('playwright-core not found. Set PLAYWRIGHT_CORE or run: npm i -D playwright-core'); process.exit(2); }
const chromePath = process.env.CHROME_PATH || ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/chromium'].find(p => fs.existsSync(p));
const browser = await chromium.launch(chromePath ? { executablePath: chromePath } : {});

const GAP = 12;
const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const page = await browser.newPage({ viewport: { width: 800, height: 600 }, deviceScaleFactor: 1 });
// Step 1: load the images to learn their natural sizes.
await page.setContent(`<body style="margin:0">${srcs.map(s => `<img src="${s}">`).join('')}</body>`);
const sizes = await page.evaluate(async () => Promise.all([...document.images].map(async i => {
  try { await i.decode(); return { w: i.naturalWidth, h: i.naturalHeight }; } catch { return null; }
})));
const bad = sizes.map((s, i) => (s ? null : imgs[i])).filter(Boolean);
if (bad.length) { console.error(`Could not decode: ${bad.join(', ')}`); await browser.close(); process.exit(1); }

// Step 2: lay them out at one column width and screenshot the sheet.
const colW = Math.min(sizes[0].w, cap);
const sheetW = cols * colW + (cols + 1) * GAP;
await page.setViewportSize({ width: sheetW, height: 600 });
await page.setContent(`<!doctype html><html><body style="margin:0;background:#e6e6e8;width:${sheetW}px">
<div style="display:grid;grid-template-columns:repeat(${cols},${colW}px);gap:${GAP}px;padding:${GAP}px;align-items:start">
${srcs.map((s, i) => `<figure style="margin:0">
  <figcaption style="font:600 13px/1.4 -apple-system,system-ui,'Segoe UI',Helvetica,Arial,sans-serif;color:#3a3a3c;padding:0 0 6px">${esc(labels[i])}</figcaption>
  <div style="width:${colW}px;${crop ? `max-height:${crop}px;` : ''}overflow:hidden;background:#fff;box-shadow:0 0 0 1px #c8c8cc">
    <img src="${s}" style="display:block;width:${colW}px;height:auto">
  </div></figure>`).join('\n')}
</div></body></html>`);
const sheetH = await page.evaluate(async () => {
  await Promise.all([...document.images].map(i => i.decode()));
  return Math.ceil(document.documentElement.scrollHeight);
});
fs.mkdirSync(path.dirname(path.resolve(out)), { recursive: true });
// Size the viewport to the whole sheet: Chrome's fullPage capture of a tall setContent page can repeat the
// first viewport. Past Chrome's ~16k px limit, fall back to fullPage.
if (sheetH <= 16000) { await page.setViewportSize({ width: sheetW, height: sheetH }); await page.screenshot({ path: out }); }
else await page.screenshot({ path: out, fullPage: true });
await browser.close();
console.log(`Wrote ${out} (${imgs.length} image${imgs.length > 1 ? 's' : ''}, ${cols} per row, ${colW}px columns${crop ? `, top ${crop}px` : ''})`);
