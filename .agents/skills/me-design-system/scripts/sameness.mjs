#!/usr/bin/env node
// Sameness check for the brand directions of a design-system proposal set (me-design-system skill, v3).
//
//   node sameness.mjs <proposals-dir> [--base http://127.0.0.1:8765/proposals] [--out <dir>] [--strict]
//
// Only brand directions are compared (folders named like a-signal, b-...). Product-layer proposals (p-...) are
// meant to share form, so they are left out.
// 1) Reads every brand direction's tokens.json and pulls the form values: corner radii, border widths, control
//    heights, row heights. Prints a table and warns about pairs whose form values are nearly the same
//    (same corner band, same edge band, controls within 4 px, rows within 4 px).
// 2) With --base, reads <proposals-dir>/screens.json and, for each screen whose layer is brand or both, renders
//    <slug>/screens/<id>.html from every brand direction at 1440 wide (top 1100 px) and writes one contact
//    sheet per screen to --out (default <proposals-dir>/_shots): sameness-<id>.png, labelled with the slugs.
// Similar pairs are a warning; exits 1 for them only with --strict. Exit 2 on a usage error.
// Look at the sheets either way: numbers miss layout and construction.

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const args = process.argv.slice(2);
const dir = args.find((a, i) => !a.startsWith('--') && !['--base', '--out'].includes(args[i - 1]));
if (!dir) { console.error('Usage: sameness.mjs <proposals-dir> [--base url] [--out dir] [--strict]'); process.exit(2); }
const opt = k => (args.includes(k) ? args[args.indexOf(k) + 1] : null);
const base = opt('--base'), out = opt('--out') || path.join(dir, '_shots');
const strict = args.includes('--strict');
// Brand directions: a letter and a dash, but not the product layer's p-.
const brandSlugs = fs.readdirSync(dir, { withFileTypes: true })
  .filter(d => d.isDirectory() && /^[a-z]-/.test(d.name) && !d.name.startsWith('p-')).map(d => d.name).sort();

function* walk(o, p = '') {
  if (!o || typeof o !== 'object') return;
  if ('$value' in o) { yield [p, o.$value]; return; }
  for (const [k, v] of Object.entries(o)) if (!k.startsWith('$')) yield* walk(v, p ? `${p}.${k}` : k);
}
const px = v => {
  if (v && typeof v === 'object' && 'value' in v) return v.unit === 'rem' ? v.value * 16 : Number(v.value);
  const m = String(v).match(/^(-?[\d.]+)(px|rem)?$/); return m ? Number(m[1]) * (m[2] === 'rem' ? 16 : 1) : null;
};
// Minimum-target sizes (24 px, WCAG 2.5.8) are shared by design; leave them out of the comparison.
const pick = (toks, rx) => [...new Set(toks.filter(([p]) => rx.test(p) && !/target|min/i.test(p)).map(([, v]) => px(v)).filter(n => n != null && n >= 0 && n < 2000))].sort((a, b) => a - b);
const median = a => (a.length ? a[Math.floor((a.length - 1) / 2)] : null);
const band = r => (r == null ? '?' : r === 0 ? 'sharp' : r <= 6 ? 'small' : r <= 16 ? 'soft' : 'round');

const rows = [];
for (const slug of brandSlugs) {
  const f = path.join(dir, slug, 'tokens.json');
  if (!fs.existsSync(f)) continue;
  const toks = [...walk(JSON.parse(fs.readFileSync(f, 'utf8')))];
  const radius = pick(toks, /radius/i).filter(n => n < 999);
  const border = pick(toks, /border.*width|width.*border|stroke.*width/i);
  const ctrl = pick(toks, /(control|button|btn|input).*height|height.*(control|button|input)|size\.control/i);
  const row = pick(toks, /row.*height|height.*row|size\.row/i);
  const pill = toks.some(([p, v]) => /radius/i.test(p) && px(v) >= 999);
  rows.push({ slug, radius, border, ctrl, row, pill,
    corner: pill && !radius.some(r => r > 0) ? 'round' : band(Math.max(0, ...radius.filter(r => r < 999))),
    // A width of 0 means 'no borders', not thin ones.
    edge: Math.max(0, ...border) >= 2.5 ? 'heavy' : border.some(b => b > 0) ? 'thin' : border.length ? 'none' : '?',
    c: Math.min(...(ctrl.length ? ctrl : [NaN])), r: median(row) });
}
const fmt = a => (a.length ? a.join(',') : '–');
console.log('| Proposal | Corners | Radii px | Edges | Borders px | Controls px | Rows px |\n|---|---|---|---|---|---|---|');
for (const x of rows) console.log(`| ${x.slug} | ${x.corner}${x.pill ? ' (+pill)' : ''} | ${fmt(x.radius)} | ${x.edge} | ${fmt(x.border)} | ${fmt(x.ctrl)} | ${fmt(x.row)} |`);
const flagged = [];
for (let i = 0; i < rows.length; i++) for (let j = i + 1; j < rows.length; j++) {
  const a = rows[i], b = rows[j];
  const same = [a.corner === b.corner, a.edge === b.edge,
    Number.isFinite(a.c) && Number.isFinite(b.c) && Math.abs(a.c - b.c) <= 4,
    a.r != null && b.r != null && Math.abs(a.r - b.r) <= 4].filter(Boolean).length;
  if (same >= 3) flagged.push(`${a.slug} ~ ${b.slug} (${same}/4 form values alike)`);
}
if (!rows.length) console.log('| (no brand direction has a tokens.json yet) | | | | | | |');
console.log(flagged.length ? `\nWarning, too alike in form:\n- ${flagged.join('\n- ')}` : '\nNo pair is alike on 3 or more form values.');
const exitCode = strict && flagged.length ? 1 : 0;

if (base) {
  const specFile = path.join(dir, 'screens.json');
  const spec = fs.existsSync(specFile) ? JSON.parse(fs.readFileSync(specFile, 'utf8')) : null;
  const brandScreens = (spec?.screens || []).filter(s => s.layer === 'brand' || s.layer === 'both');
  if (!spec) console.log(`\nNo screens.json in ${dir}; skipping contact sheets.`);
  else if (!brandScreens.length) console.log('\nscreens.json has no brand or both screens; skipping contact sheets.');
  else if (brandSlugs.length < 2) console.log('\nFewer than two brand directions; skipping contact sheets.');
  else {
    const home = os.homedir();
    let chromium;
    for (const c of [process.env.PLAYWRIGHT_CORE, 'playwright-core', path.join(home, '.dotfiles/.agents/skills/stageshow/node_modules/playwright-core/index.mjs')].filter(Boolean)) {
      try { ({ chromium } = await import(c)); break; } catch {}
    }
    if (!chromium) { console.error('playwright-core not found; skipping contact sheets'); process.exit(exitCode); }
    const chromePath = process.env.CHROME_PATH || ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/chromium'].find(p => fs.existsSync(p));
    const browser = await chromium.launch(chromePath ? { executablePath: chromePath } : {});
    // The top 1100 px of each screen at 1440 wide is the viewport itself, so a plain viewport screenshot.
    const page = await browser.newPage({ viewport: { width: 1440, height: 1100 }, reducedMotion: 'reduce' });
    fs.mkdirSync(out, { recursive: true });
    const COL = 720, PER_ROW = Math.min(3, brandSlugs.length), GAP = 12;
    const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
    for (const s of brandScreens) {
      if (!brandSlugs.some(slug => fs.existsSync(path.join(dir, slug, 'screens', `${s.id}.html`)))) {
        console.log(`No brand direction has screens/${s.id}.html yet; no sheet for it.`); continue;
      }
      const cells = [];
      for (const slug of brandSlugs) {
        if (!fs.existsSync(path.join(dir, slug, 'screens', `${s.id}.html`))) { cells.push([slug, null, 'missing']); continue; }
        try {
          await page.goto(`${base.replace(/\/$/, '')}/${slug}/screens/${s.id}.html`, { waitUntil: 'networkidle', timeout: 30000 });
          await page.evaluate(() => document.fonts.ready);
          await page.waitForTimeout(200);
          cells.push([slug, `data:image/png;base64,${(await page.screenshot()).toString('base64')}`, '']);
        } catch (e) { cells.push([slug, null, `render failed: ${e.message.split('\n')[0]}`]); }
      }
      const sheetW = PER_ROW * COL + (PER_ROW + 1) * GAP;
      const html = `<!doctype html><body style="margin:0;background:#e6e6e8;width:${sheetW}px"><div style="display:grid;grid-template-columns:repeat(${PER_ROW},${COL}px);gap:${GAP}px;padding:${GAP}px;align-items:start">${cells.map(([slug, src, note]) =>
        `<figure style="margin:0"><figcaption style="font:600 13px/1.4 -apple-system,system-ui,sans-serif;color:#3a3a3c;padding:0 0 6px">${esc(slug)}${note ? ` (${esc(note)})` : ''}</figcaption>${src
          ? `<img src="${src}" style="display:block;width:${COL}px;box-shadow:0 0 0 1px #c8c8cc">`
          : `<div style="width:${COL}px;height:${COL * 1100 / 1440}px;background:#f4f4f5;box-shadow:0 0 0 1px #c8c8cc"></div>`}</figure>`).join('')}</div></body>`;
      const q = await browser.newPage({ viewport: { width: sheetW, height: 400 }, deviceScaleFactor: 1 });
      await q.setContent(html);
      const h = await q.evaluate(async () => { await Promise.all([...document.images].map(i => i.decode())); return Math.ceil(document.documentElement.scrollHeight); });
      const dest = path.join(out, `sameness-${s.id}.png`);
      // Viewport sized to the sheet (fullPage on setContent pages can repeat the first viewport).
      await q.setViewportSize({ width: sheetW, height: Math.min(h, 16000) });
      await q.screenshot({ path: dest }); await q.close();
      console.log(`Wrote ${dest}${cells.some(c => !c[1]) ? ` (gaps: ${cells.filter(c => !c[1]).map(c => `${c[0]} ${c[2]}`).join(', ')})` : ''}`);
    }
    await browser.close();
  }
}
process.exit(exitCode);
