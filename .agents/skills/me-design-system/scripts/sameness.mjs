#!/usr/bin/env node
// Sameness check for a set of design-system proposals (me-design-system skill).
//
//   node sameness.mjs <proposals-dir> [--base http://127.0.0.1:8765/proposals] [--out <dir>]
//
// 1) Reads every <proposals-dir>/*/tokens.json and pulls the form values: corner radii, border widths, control
//    heights, row heights. Prints a table and flags pairs of proposals whose form values are nearly the same
//    (same corner band, same edge band, controls within 4 px, rows within 4 px).
// 2) With --base, renders each proposal (served over http) and writes two contact sheets to --out:
//    sameness-components.png and sameness-composites.png, so a person can see sameness at a glance.
// Exits 1 if any pair is flagged. Look at the sheets either way: numbers miss layout and construction.

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const args = process.argv.slice(2);
const dir = args.find(a => !a.startsWith('--') && !['--base', '--out'].includes(args[args.indexOf(a) - 1]));
if (!dir) { console.error('Usage: sameness.mjs <proposals-dir> [--base url] [--out dir]'); process.exit(2); }
const opt = k => (args.includes(k) ? args[args.indexOf(k) + 1] : null);
const base = opt('--base'), out = opt('--out') || dir;

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
for (const slug of fs.readdirSync(dir).sort()) {
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
console.log(flagged.length ? `\nToo alike in form:\n- ${flagged.join('\n- ')}` : '\nNo pair is alike on 3 or more form values.');

if (base) {
  const home = os.homedir();
  let chromium;
  for (const c of [process.env.PLAYWRIGHT_CORE, 'playwright-core', path.join(home, '.dotfiles/.agents/skills/stageshow/node_modules/playwright-core/index.mjs')].filter(Boolean)) {
    try { ({ chromium } = await import(c)); break; } catch {}
  }
  if (!chromium) { console.error('playwright-core not found; skipping contact sheets'); process.exit(flagged.length ? 1 : 0); }
  const chromePath = process.env.CHROME_PATH || ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/chromium'].find(p => fs.existsSync(p));
  const browser = await chromium.launch(chromePath ? { executablePath: chromePath } : {});
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'sameness-'));
  const shot = {};
  for (const { slug } of rows) {
    await page.goto(`${base.replace(/\/$/, '')}/${slug}/index.html`, { waitUntil: 'networkidle' });
    for (const label of ['Components', 'Composites']) {
      const y = await page.evaluate(l => {
        const a = [...document.querySelectorAll('.toc a')].find(x => x.textContent.includes(l));
        let el = (a && document.querySelector(a.hash)) || document.getElementById(l.toLowerCase());
        if (!el) return null; el = el.closest('section') || el; return el.getBoundingClientRect().top + scrollY;
      }, label);
      if (y == null) continue;
      const file = path.join(tmp, `${slug}-${label}.png`);
      await page.screenshot({ path: file, fullPage: true, clip: { x: 200, y, width: 1240, height: 900 } });
      (shot[label] ||= []).push([slug, file]);
    }
  }
  for (const [label, list] of Object.entries(shot)) {
    const html = `<body style="margin:0;background:#888;display:grid;grid-template-columns:repeat(3,620px);gap:6px;padding:6px;font:14px system-ui">${list.map(([s, f]) => `<figure style="margin:0;background:#fff"><figcaption style="padding:4px 8px;font-weight:600">${s}</figcaption><img src="file://${f}" style="width:620px;display:block"></figure>`).join('')}</body>`;
    const hf = path.join(tmp, `${label}.html`); fs.writeFileSync(hf, html);
    const q = await browser.newPage({ viewport: { width: 1884, height: 400 } });
    await q.goto(`file://${hf}`); await q.waitForTimeout(300);
    const dest = path.join(out, `sameness-${label.toLowerCase()}.png`);
    await q.screenshot({ path: dest, fullPage: true }); await q.close();
    console.log(`Wrote ${dest}`);
  }
  await browser.close();
}
process.exit(flagged.length ? 1 : 0);
