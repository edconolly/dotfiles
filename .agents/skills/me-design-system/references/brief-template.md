# BRIEF.md template

Copy into `<proposals>/BRIEF.md` and fill every `{{…}}`. Every builder reads it in full, so it is the contract
that makes proposals comparable. Keep product truths here; keep each direction's look in its own prompt.

---

# Brief: design-system proposals for {{Product}}

Written {{date}} for {{owner}}. Not adopted; proposals to compare.

Each proposal is a full **system**, not a mood board: the same skeleton, different decisions. Grounded in
{{path to research, or "the me-design-system anatomy reference"}}.

## The product (what every proposal designs for)
- What it is, in two sentences: {{…}}
- Who uses it and who buys it: {{…}}
- Surfaces: {{e.g. a dense dashboard + a public website / a mobile app + marketing site}}
- Product truths every proposal must respect (not style): {{e.g. status words and their exact meanings,
  units, time format and zone, numbers with tabular figures, minimum table text size, languages}}
- Fixed status set, same order everywhere, one colour each + a non-colour cue: {{e.g. Human, Bot, Agent, Unsure}}
- The name is {{final / a working name}}. Name and logo live in one swappable token group (`brand.*`) and one mark.

## The directions (assigned; don't drift into each other)
| | {{A. Name}} | {{B. Name}} | {{C. Name}} |
|---|---|---|---|
| Positioning / idea it carries | | | |
| Brand ↔ product model | one unified / one foundation, two expressions / separate systems | | |
| Feeling | | | |
| Type (assigned) | | | |
| Must NOT become | | | |
| Density | | | |

## Same skeleton in each proposal
1. **Thesis**: two sentences; which idea; which brand↔product model and why. Show what is shared and what differs
   between brand and product (a sentence is the minimum; a small diagram is better).
2. **Principles**: 3–6, each "so we do / so we don't" + a concrete product example.
3. **Voice and words**: 3 voice traits; the status labels with one-line definitions; button label rules; one
   error, one empty state, one domain-specific explanation, one marketing headline + subline. Customer words only.
4. **Foundations / tokens**: primitive palette; semantic roles (text, surface, border, focus, status); type
   scale (tabular numerals rule); spacing; radius; elevation/borders; motion (durations, easing, reduced-motion);
   icon rule. **Contrast table** computed by script: every text/surface pair and status colour, PASS/FAIL vs
   4.5:1 (text) or 3:1 (non-text). No failing pair ships.
5. **Components with states**: button (primary, secondary, quiet, destructive × default, hover, focus, disabled,
   loading), input + filter chip, tabs, dense table (`aria-sort` on sortable headers), status badge,
   card/panel, banner, empty state, loading skeleton, side panel or dialog (name its WAI-ARIA APG pattern).
   Keyboard behaviour; 24 px minimum targets.
6. **Data visualisation**: categorical palette (≤6–8, colour-blind safe, ordered), the status palette reused
   unchanged, sequential ramp, chart rules (axes, gridlines, labels, top-N + "Other", number format).
7. **Composites built only from the tokens**: (a) {{the main product screen, e.g. dashboard with filter bar,
   chart, dense table, open side panel}}; (b) {{a public-site hero + one section below it}}.
8. **Governance**: who owns look and voice, who owns code, how a change lands (one commit: tokens + docs).

## Files per proposal (`<proposals>/<letter-slug>/`)
- `index.html`: the whole proposal, self-contained (Google Fonts allowed; small vanilla JS fine). CSS custom
  properties generated from / matching `tokens.json`. Responsive to 390 px; visible focus; reduced motion respected.
- `tokens.json`: DTCG 2025.10 (`$type`, `$value`, `$description`, aliases). Primitive, semantic, component tiers;
  structure reflects the brand↔product model.
- `README.md`: sections 1–4, 6, 8 in prose and tables, readable without a browser.
- `_build/`: any generator or check scripts, so the proposal can be rebuilt later (not /tmp).

## Page frame (identical in every proposal)
Use `assets/page-frame.html` from the me-design-system skill: sticky top bar (mark, name, "Design system,
proposal X: Name"); a two-column grid with a sticky section list on the left (eight entries, ids `#thesis
#principles #voice #foundations #components #dataviz #composites #governance`) and content on the right; the
current section marked with `aria-current="true"`; a sideways-scrolling tab row under 860 px. Style it with the
proposal's own tokens. Reserved class names: `topbar`, `doc-frame`, `toc`; don't reuse them for anything else.

## Sample data rules
{{e.g. no IPs, emails, cookies or full ids; ids as 8-char prefixes; example.com-style sites; invented names;
plausible, varied numbers; estimates labelled "estimated" with a range}}

## Generic looks to avoid
Cream + terracotta (≈#F4F1EA / #D97757); black + one acid-green or vermilion accent; broadsheet hairline grids;
identical rounded cards with the same soft shadow and gradient washes; ALL-CAPS tracked eyebrow labels over
every heading; "A · B · C" meta strings; "→" on every button; 01/02/03 markers on things that aren't a sequence;
one italic word accented in a headline; sci-fi HUD glow.
