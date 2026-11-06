#!/usr/bin/env node
// Screen-set renderer and checker for design-system proposals (me-design-system skill, v3).
//
//   node screen-set.mjs <proposals-dir> --base <url-of-proposals-dir> [--only <slug>]
//   node screen-set.mjs <proposals-dir> --before
//   node screen-set.mjs --capture <url> [<url> ...] --out <dir> [--widths 1440,390]
//
// Proposals mode: reads <proposals-dir>/screens.json and, for every proposal folder (or just --only), renders
// each expected screen <slug>/screens/<id>.html at the first width (1440) and, when the screen has phone: true,
// at the second width (390). Full-page shots go to <slug>/_build/shots/<id>-<w>.png.
//   Expected screens: proposals whose slug starts "p-" (product layer) need every product and both screen;
//   brand directions ("a-...", "b-...") need every brand and both screen. A missing file is a failure.
// Checks per screen and width:
//   - horizontal overflow, naming the widest offending elements                      (fail)
//   - page errors, failed requests and HTTP status >= 400 (favicon ignored)           (fail)
//   - smallest font size of visible text: under 11 px at any width                   (fail)
//                                         under 12 px at desktop width                (warn)
//   - label leaks: visible text containing hypothesis, illustrative, placeholder, lorem ipsum, TODO and TBD (capitals only),
//     "sample data" or "(guess)" (case-insensitive). These words never belong inside a design.  (fail)
// --before: captures every screen's "before" URL (the existing product) into references/before/<id>-<w>.png at
//   the same widths, with the overflow and error checks but no leak or font check.
// --capture: captures arbitrary URLs (e.g. every page of an existing product during an audit) to
//   <out>/<slug>-<w>.png, where <slug> is the URL's path and query, lowercased, with runs of other characters
//   turned into "-" (http://host/explore?view=logs -> explore-view-logs; the site root -> root).
//
// Prints one Markdown table. Exits 1 on any failure, 2 on a usage error. Pages must be served over http
// (python3 -m http.server), not file://. Pages are waited on for network idle and document.fonts.ready;
// reduced motion is emulated.
//
// Needs playwright-core and Chrome. Set PLAYWRIGHT_CORE (path to playwright-core/index.mjs) and CHROME_PATH
// if the defaults below don't exist on this machine.

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const USAGE = `Usage:
  screen-set.mjs <proposals-dir> --base <url> [--only <slug>]
  screen-set.mjs <proposals-dir> --before
  screen-set.mjs --capture <url> [<url> ...] --out <dir> [--widths 1440,390]`;
const usage = msg => { if (msg) console.error(msg); console.error(USAGE); process.exit(2); };

const args = process.argv.slice(2);
const VALUED = ['--base', '--only', '--out', '--widths'];
const opt = k => (args.includes(k) ? args[args.indexOf(k) + 1] : null);
const positional = args.filter((a, i) => !a.startsWith('--') && !VALUED.includes(args[i - 1]));
const mode = args.includes('--capture') ? 'capture' : args.includes('--before') ? 'before' : 'proposals';

// ---- browser ---------------------------------------------------------------------------------------------
const home = os.homedir();
const pwCandidates = [process.env.PLAYWRIGHT_CORE, 'playwright-core',
  path.join(home, '.dotfiles/.agents/skills/stageshow/node_modules/playwright-core/index.mjs')].filter(Boolean);
async function launch() {
  let chromium;
  for (const c of pwCandidates) { try { ({ chromium } = await import(c)); break; } catch {} }
  if (!chromium) { console.error('playwright-core not found. Set PLAYWRIGHT_CORE or run: npm i -D playwright-core'); process.exit(2); }
  const chromePath = process.env.CHROME_PATH || ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome', '/usr/bin/chromium'].find(p => fs.existsSync(p));
  return chromium.launch(chromePath ? { executablePath: chromePath } : {});
}

// Research words match in any case; TODO and TBD only in capitals, so a real product label like "Todo" passes.
const LEAKS = [/\b(hypothesis|hypotheses|illustrative|placeholder|lorem\s+ipsum|sample\s+data)\b|\(guess\)/gi,
  /\b(TODO|TBD)\b/g];

// Render one URL at one width, screenshot it full-page, and return what the checks found.
async function render(browser, url, w, shotPath, { leaks = true, desktopW = 1440 } = {}) {
  const r = { overflow: 0, culprits: [], errors: [], minFont: null, minText: '', leaks: [], fails: [], warns: [] };
  const page = await browser.newPage({ viewport: { width: w, height: w > 800 ? 900 : 844 }, reducedMotion: 'reduce' });
  page.on('pageerror', e => r.errors.push(`js: ${e.message.split('\n')[0]}`));
  page.on('requestfailed', q => { if (!/\/favicon\.ico$/.test(q.url())) r.errors.push(`request failed: ${short(q.url())}`); });
  page.on('response', s => { if (s.status() >= 400 && !/\/favicon\.ico$/.test(s.url())) r.errors.push(`${s.status()}: ${short(s.url())}`); });
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(300);
    Object.assign(r, await page.evaluate(() => {
      const clipped = e => { for (let a = e.parentElement; a && a !== document.body; a = a.parentElement) if (getComputedStyle(a).overflowX !== 'visible') return true; return false; };
      const name = e => `${e.tagName.toLowerCase()}${e.id ? '#' + e.id : ''}${e.className && typeof e.className === 'string' && e.className.trim() ? '.' + e.className.trim().split(/\s+/).slice(0, 2).join('.') : ''}`;
      const over = document.documentElement.scrollWidth - innerWidth;
      // Widest offenders first, so the cause (not its children) leads the list.
      const culprits = over > 0 ? [...document.querySelectorAll('body *')]
        .filter(e => e.getBoundingClientRect().right > innerWidth + 1 && !clipped(e))
        .sort((a, b) => b.getBoundingClientRect().width - a.getBoundingClientRect().width).slice(0, 3)
        .map(e => `${name(e)} (${Math.round(e.getBoundingClientRect().width)}px)`) : [];
      // Smallest font among visible text nodes (element walks would trip on font-size:0 wrappers).
      let minFont = null, minText = '';
      const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      for (let n = tw.nextNode(); n; n = tw.nextNode()) {
        const el = n.parentElement;
        if (!el || !n.textContent.trim() || el.closest('script,style,noscript,template')) continue;
        const cs = getComputedStyle(el);
        if (!el.getClientRects().length || cs.visibility === 'hidden' || Number(cs.opacity) === 0) continue;
        const fs = parseFloat(cs.fontSize);
        if (minFont == null || fs < minFont) { minFont = fs; minText = n.textContent.trim().slice(0, 30); }
      }
      return { overflow: over, culprits, minFont, minText, text: document.body ? document.body.innerText : '' };
    }));
    await page.screenshot({ path: shotPath, fullPage: true });
  } catch (e) {
    r.errors.push(`render: ${e.message.split('\n')[0]}`);
  }
  await page.close();
  if (leaks && r.text) {
    for (const m of LEAKS.flatMap(re => [...r.text.matchAll(re)])) {
      const s = Math.max(0, m.index - 20), t = r.text.slice(s, m.index + m[0].length + 20).replace(/\s+/g, ' ').trim();
      r.leaks.push(`"${t}"`);
    }
  }
  delete r.text;
  if (r.overflow > 0) r.fails.push('overflow');
  if (r.errors.length) r.fails.push('errors');
  if (leaks && r.leaks.length) r.fails.push('leak');
  if (leaks && r.minFont != null) {
    if (r.minFont < 11) r.fails.push('font');
    else if (r.minFont < 12 && w >= desktopW) r.warns.push('font');
  }
  return r;
}

const short = u => { try { const x = new URL(u); return x.pathname + x.search; } catch { return u; } };
const cell = s => String(s).replace(/\|/g, '\\|');
function row(name, screen, w, r, shot) {
  const status = r.fails.length ? 'FAIL' : r.warns.length ? 'warn' : 'ok';
  const over = r.overflow > 0 ? `${r.overflow}px ${r.culprits.join(', ')}` : '0';
  const font = r.minFont == null ? '–' : `${r.minFont}px${r.minFont < 12 ? ` "${r.minText}"` : ''}`;
  return `| ${status} | ${cell(name)} | ${cell(screen)} | ${w} | ${cell(over)} | ${cell(r.errors.join('; ') || 0)} | ${cell(font)} | ${cell(r.leaks.join(' ') || '–')} | ${shot} |`;
}
const HEAD = '| Result | Proposal | Screen | Width | Overflow | Errors | Min font | Leaks | Shot |\n|---|---|---|---|---|---|---|---|---|';
const slugify = u => {
  const x = new URL(u);
  return ((x.pathname + x.search).toLowerCase().replace(/\.html?$/, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')) || 'root';
};

// ---- capture mode ----------------------------------------------------------------------------------------
if (mode === 'capture') {
  const out = opt('--out');
  const urls = positional;
  if (!out || !urls.length) usage('--capture needs at least one URL and --out <dir>.');
  const widths = (opt('--widths') || '1440,390').split(',').map(Number);
  fs.mkdirSync(out, { recursive: true });
  const browser = await launch();
  const lines = []; let fails = 0;
  for (const u of urls) for (const w of widths) {
    const f = path.join(out, `${slugify(u)}-${w}.png`);
    const r = await render(browser, u, w, f, { leaks: false });
    if (r.fails.length) fails++;
    lines.push(row('capture', short(u), w, r, f));
  }
  await browser.close();
  console.log(`${HEAD}\n${lines.join('\n')}\n\n${fails ? `${fails} capture(s) with problems.` : 'All captures clean.'}`);
  process.exit(fails ? 1 : 0);
}

// ---- proposals / before modes ----------------------------------------------------------------------------
const dir = positional[0];
if (!dir) usage();
const specFile = path.join(dir, 'screens.json');
if (!fs.existsSync(specFile)) usage(`No screens.json in ${dir}.`);
const spec = JSON.parse(fs.readFileSync(specFile, 'utf8'));
const widths = spec.widths?.length ? spec.widths.map(Number) : [1440, 390];
const [desk, phone = 390] = widths;
const screens = spec.screens || [];
const widthsFor = s => (s.phone ? [desk, phone] : [desk]);

const browser = await launch();
const lines = []; let fails = 0, warns = 0;

if (mode === 'before') {
  const out = path.join(dir, 'references', 'before');
  fs.mkdirSync(out, { recursive: true });
  const withBefore = screens.filter(s => s.before);
  if (!withBefore.length) console.error('No screen in screens.json has a "before" URL.');
  for (const s of withBefore) for (const w of widthsFor(s)) {
    const f = path.join(out, `${s.id}-${w}.png`);
    const r = await render(browser, s.before, w, f, { leaks: false, desktopW: desk });
    if (r.fails.length) fails++;
    lines.push(row('before', s.id, w, r, path.relative(dir, f)));
  }
} else {
  const base = opt('--base');
  if (!base) usage('Proposals mode needs --base <url of the proposals folder>.');
  const only = opt('--only');
  const skip = new Set(['references', 'data']);
  let slugs = fs.readdirSync(dir, { withFileTypes: true })
    .filter(d => d.isDirectory() && /^[a-z]-/.test(d.name) && !skip.has(d.name)).map(d => d.name).sort();
  if (only) { if (!slugs.includes(only)) usage(`No proposal folder "${only}" in ${dir}.`); slugs = [only]; }
  if (!slugs.length) usage(`No proposal folders (named like p-refined or a-signal) in ${dir}.`);
  for (const slug of slugs) {
    const product = slug.startsWith('p-');
    const expected = screens.filter(s => s.layer === 'both' || s.layer === (product ? 'product' : 'brand'));
    const shots = path.join(dir, slug, '_build', 'shots');
    fs.mkdirSync(shots, { recursive: true });
    for (const s of expected) {
      const file = path.join(dir, slug, 'screens', `${s.id}.html`);
      if (!fs.existsSync(file)) {
        fails++;
        lines.push(`| FAIL | ${slug} | ${s.id} | – | missing: ${slug}/screens/${s.id}.html | | | | |`);
        continue;
      }
      for (const w of widthsFor(s)) {
        const f = path.join(shots, `${s.id}-${w}.png`);
        const r = await render(browser, `${base.replace(/\/$/, '')}/${slug}/screens/${s.id}.html`, w, f, { desktopW: desk });
        if (r.fails.length) fails++; else if (r.warns.length) warns++;
        lines.push(row(slug, s.id, w, r, path.relative(dir, f)));
      }
    }
  }
}
await browser.close();
console.log(`${HEAD}\n${lines.join('\n')}\n\n${fails} failing, ${warns} warning, ${lines.length - fails - warns} ok.`);
process.exit(fails ? 1 : 0);
