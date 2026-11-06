# BRIEF.md template

Copy into `<proposals>/BRIEF.md` and fill every `{{…}}`. Every builder reads it in full.

The brief fixes what every proposal shares so they can be compared fairly: the product truths, the screen set,
the data, the references, the checks. It never fixes how a screen looks. It does not tell builders to ignore the
current product: where one exists, it is the starting material.

---

# Brief: design system for {{Product}}

Written {{date}} for {{owner}}. Proposals to compare; nothing is adopted.

## The product
- What it is, in two sentences: {{…}}
- Who uses it daily and who buys it: {{…}}
- Surfaces: {{e.g. a dense analytics dashboard, a public website, a page end users meet}}
- Product truths every screen must respect (not style): {{status words and exact meanings in a fixed order; units;
  time format and zone; one currency and number format; languages; minimum readable table text; claims the
  product can't make}}
- Status colours: {{the values the product layer uses, and where they come from (current product, or fixed by
  the product proposal). Brand directions never change them.}}
- The name is {{final / a working name}}. Until it is final: a plain text wordmark, no invented mark.

## What exists
{{One of: "A running product: <how to run it>. Audit: <research>/audit.md" · "Some screens: <where>" · "Nothing yet."}}

**Keep** (from the audit; things users rely on): {{e.g. the five verdict levels with one colour each in the same
order everywhere; one sans-serif at small sizes; filters above results; the side panel for one session}}

**Fix** (from the audit, worst first, each with its screenshot): {{e.g. "High · four of five verdict fills are
under 3:1 on white (references/audit/explore-1440.png)"}}

## The screen set
Every proposal renders these screens, with the shared data, as `<slug>/screens/<id>.html`. Static, full size,
1440 wide; screens marked phone also at 390. Layer says who renders it: the product proposal renders product and
both; each brand direction renders brand and both.

| id | Screen | Layer | Phone | The job it must do |
|---|---|---|---|---|
| {{01-…}} | {{main working screen}} | product | yes | {{e.g. see what happened on your site today}} |
| {{02-…}} | {{detail view}} | product | no | {{e.g. understand why one visit got its verdict}} |
| {{03-…}} | {{first-run or empty state}} | product | no | {{…}} |
| {{04-…}} | {{setup / onboarding}} | product | no | {{…}} |
| {{05-…}} | {{surface end users meet}} | both | yes | {{…}} |
| {{06-…}} | {{website home}} | brand | yes | {{e.g. a first-time visitor understands what it does and why to trust it}} |

`screens.json` holds the same list for the scripts:
```json
{
  "widths": [1440, 390],
  "screens": [
    { "id": "01-analytics", "title": "Explore, Analytics view", "layer": "product", "phone": true,
      "before": "http://127.0.0.1:8710/explore?view=analytics" },
    { "id": "06-home", "title": "Website home", "layer": "brand", "phone": true }
  ]
}
```
`before` is the existing product's URL for that screen, if there is one.

## The shared data
`<proposals>/data/sample.json`: {{where it comes from, e.g. the dashboard's dev sample data}}. Every proposal uses
it unchanged (read it at build time or copy it into the page); none edits it. If a screen needs data the file
lacks, ask the orchestrator to add it for everyone. Safety: {{e.g. no real IPs, emails, cookies or full ids;
8-char id prefixes; example.com-style sites; invented names}}.

## References
- The existing product: `references/before/` {{if any}}
- Products the owner admires: {{names}}, screenshots in `references/admired/`. The aim is at least as good as these
  on hierarchy, type and familiarity, and more modern than the category's incumbents.
- Never copy their assets, names or layouts wholesale; learn from their craft.

## Content rules
- Screens at full size and full width, one per file. No frames, captions or annotations inside a screen: a screen
  shows only what the real product would show. Explanation goes in the README.
- Research words ("hypothesis", "illustrative", "guess", "sample data", "placeholder") never appear in a
  screen. A disclaimer appears only if the real product would show one.
- Real copy, in the product's voice; no lorem ipsum. Long names, empty values and large numbers must read well.

## Accessibility floor
WCAG 2.2 AA: text 4.5:1, non-text (borders, chart marks, focus rings, status fills) 3:1; visible focus; targets
at least 24 px; status never by colour alone; reduced motion respected; no puzzle tests on pages end users meet
(3.3.8). Status palette separable under protanopia, deuteranopia and tritanopia (`contrast.mjs --cvd`).

## Product proposal
Slug `p-{{name}}`. (Folder names are how the scripts tell layers apart: `p-` is the product layer; brand
directions are `a-…`, `b-…`, `c-…` and never start with `p`.) Refine the existing screens (layout may change, not just styling) or, if nothing exists,
design them from the jobs above with proven patterns. One readable UI typeface, restrained colour, calm surfaces.
Each change should trace back to a "Fix" item, a reference, or a screen the product doesn't have yet.

## Brand directions (added after the user approves them)
| | {{A. Name}} | {{B. Name}} | {{C. Name}} |
|---|---|---|---|
| Idea | | | |
| Mood | | | |
| Colour band + hex | | | |
| Display face (UI face is the product's) | | | |
| Tone + three sample lines | | | |
| Website composition | | | |
| Signature moments inside the product (at most 2–3) | | | |
| Unlike competitors because | | | |

## Files per proposal (`<proposals>/<slug>/`)
- `screens/<id>.html`: one page per screen in the set; shared `tokens.css` and `components.css`; small vanilla JS
  fine; Google Fonts allowed.
- After the screens are accepted: `tokens.json` (DTCG 2025.10; primitive, semantic, component tiers),
  `tokens.css` generated from it, `system.html` from the skill's `assets/system-viewer.html`.
- `README.md`: the idea in two sentences, then each change or decision and why (for a refinement: what changed per
  screen, linked to the "Fix" list), principles, voice with sample lines.
- `_build/`: generator and check scripts, screenshots, critiques per round.
