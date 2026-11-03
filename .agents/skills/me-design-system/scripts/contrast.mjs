#!/usr/bin/env node
// Contrast and colour-blindness checks for design-system proposals (me-design-system skill).
//
// 1) WCAG contrast:  node contrast.mjs pairs.json
//    pairs.json: [{ "name": "text.default on surface.page", "fg": "#121619", "bg": "#ECEEEF", "min": 4.5 }, ...]
//    "min" is 4.5 for text, 3 for non-text (icons, borders, chart marks, focus rings). Hex only (#rgb or #rrggbb).
//    Prints a Markdown table; exits 1 if any pair fails.
//
// 2) Colour-blind separation:  node contrast.mjs --cvd palette.json [--min 20]
//    palette.json: { "Human": "#1268D2", "Bot": "#A3300B", ... }  (or [{ "name": ..., "hex": ... }])
//    Simulates protanopia, deuteranopia and tritanopia (Machado et al. 2009, full severity) and reports the
//    closest pair per condition as CIE76 ΔE. Exits 1 if any pair is under --min (default 20).
//    Under ~20 the two colours are hard to tell apart: change one, or rely on a stronger second cue.

import fs from 'node:fs';

const hexToRgb = h => {
  let s = h.trim().replace('#', '');
  if (s.length === 3) s = [...s].map(c => c + c).join('');
  if (!/^[0-9a-f]{6}$/i.test(s)) throw new Error(`Not a hex colour: ${h}`);
  return [0, 2, 4].map(i => parseInt(s.slice(i, i + 2), 16) / 255);
};
const toLin = c => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const fromLin = c => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);
const lum = rgb => { const [r, g, b] = rgb.map(toLin); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const ratio = (a, b) => { const [x, y] = [lum(hexToRgb(a)), lum(hexToRgb(b))].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

const CVD = {
  protan: [[0.152286, 1.052583, -0.204868], [0.114503, 0.786281, 0.099216], [-0.003882, -0.048116, 1.051998]],
  deutan: [[0.367322, 0.860646, -0.227968], [0.280085, 0.672501, 0.047413], [-0.011820, 0.042940, 0.968881]],
  tritan: [[1.255528, -0.076749, -0.178779], [-0.078411, 0.930809, 0.147602], [0.004733, 0.691367, 0.303900]],
};
const simulate = (rgb, m) => {
  const lin = rgb.map(toLin);
  return m.map(row => fromLin(Math.min(1, Math.max(0, row[0] * lin[0] + row[1] * lin[1] + row[2] * lin[2]))));
};
const toLab = rgb => {
  const [r, g, b] = rgb.map(toLin);
  const X = (0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047, Y = 0.2126 * r + 0.7152 * g + 0.0722 * b, Z = (0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883;
  const f = t => (t > 216 / 24389 ? Math.cbrt(t) : (24389 / 27 * t + 16) / 116);
  return [116 * f(Y) - 16, 500 * (f(X) - f(Y)), 200 * (f(Y) - f(Z))];
};
const dE = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

const args = process.argv.slice(2);
if (!args.length) { console.error('Usage: contrast.mjs pairs.json | contrast.mjs --cvd palette.json [--min 20]'); process.exit(2); }

if (args[0] === '--cvd') {
  const raw = JSON.parse(fs.readFileSync(args[1], 'utf8'));
  const pal = Array.isArray(raw) ? raw.map(p => [p.name, p.hex]) : Object.entries(raw);
  const min = args.includes('--min') ? Number(args[args.indexOf('--min') + 1]) : 20;
  let fail = false;
  const rows = [['normal', null], ...Object.entries(CVD)].map(([cond, m]) => {
    const labs = pal.map(([n, h]) => [n, toLab(m ? simulate(hexToRgb(h), m) : hexToRgb(h))]);
    let best = [Infinity, ''];
    for (let i = 0; i < labs.length; i++) for (let j = i + 1; j < labs.length; j++) {
      const d = dE(labs[i][1], labs[j][1]);
      if (d < best[0]) best = [d, `${labs[i][0]} / ${labs[j][0]}`];
    }
    const ok = best[0] >= min; if (!ok) fail = true;
    return `| ${cond} | ${best[1]} | ${best[0].toFixed(1)} | ${ok ? 'PASS' : 'FAIL'} |`;
  });
  console.log(`| Vision | Closest pair | ΔE | ≥${min} |\n|---|---|---:|---|\n${rows.join('\n')}`);
  process.exit(fail ? 1 : 0);
}

const pairs = JSON.parse(fs.readFileSync(args[0], 'utf8'));
let failures = 0;
const lines = pairs.map(p => {
  const r = ratio(p.fg, p.bg), ok = r >= p.min; if (!ok) failures++;
  return `| ${p.name} | \`${p.fg}\` on \`${p.bg}\` | ${r.toFixed(2)}:1 | ${p.min}:1 | ${ok ? 'PASS' : 'FAIL'} |`;
});
console.log(`| Pair | Colours | Ratio | Needs | Result |\n|---|---|---:|---:|---|\n${lines.join('\n')}`);
console.error(`${pairs.length - failures}/${pairs.length} pairs pass`);
process.exit(failures ? 1 : 0);
