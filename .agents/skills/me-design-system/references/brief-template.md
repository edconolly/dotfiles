# BRIEF.md template

Copy into `<proposals>/BRIEF.md` and fill every `{{…}}`. Every builder reads it in full.

**Template, not recipe.** The brief fixes the *outline* (which sections exist, which states and checks every
proposal must cover) so proposals can be compared. It must not fix the *content* (which screens, which layouts,
which button construction, which sample rows). When the first Bot Max round fixed both, nine proposals came out
as one product in nine paints: same near-square corners, same 28/40 px controls, same filled-plus-outlined
buttons, same dashboard layout, same left-aligned hero with two buttons. Differences survived only where a
direction had to invent its own component. So: share the outline, assign the form, describe jobs not screens.

---

# Brief: design-system proposals for {{Product}}

Written {{date}} for {{owner}}. Not adopted; proposals to compare.

## The product (what every proposal designs for)
- What it is, in two sentences: {{…}}
- Who uses it and who buys it: {{…}}
- Surfaces: {{e.g. a dense dashboard + a public website}}
- Product truths every proposal must respect (not style): {{status words and exact meanings, units, time
  format and zone, **one currency and number format for all sample data**, tabular figures, minimum readable
  table text, languages, claims the product can't make}}
- Fixed status set, same order everywhere, one colour each + a non-colour cue: {{e.g. Human, Bot, Agent, Unsure}}
- The name is {{final / a working name}}. Name and logo live in one swappable token group (`brand.*`) and one mark.

## Shared on purpose vs must differ
| Shared by every proposal (for comparison and correctness) | Must differ between proposals (assigned below) |
|---|---|
| The eight sections and page frame | Colour strategy and palette |
| Which states each component covers | Type families and scale contrast |
| Accessibility floor (WCAG 2.2 AA, 24 px targets, APG patterns) | Form profile: corners, edges, depth, density, control and badge construction |
| Status words and their meaning | Layout grid and composition of the product screen |
| Sample-data safety rules | Website composition |
| Files and checks | Sample data set and example copy |

## The directions (assigned; don't drift into each other)
| | {{A. Name}} | {{B. Name}} | {{C. Name}} |
|---|---|---|---|
| Idea it carries | | | |
| Brand ↔ product model | one unified / one foundation, two expressions / separate systems | | |
| Feeling | | | |
| Type (assigned) | | | |
| Colour strategy | | | |
| **Form profile** (see below) | | | |
| Product screen: the job and its layout idea | | | |
| Website: composition idea | | | |
| Sample data set | | | |
| Must NOT become | | | |

**Form profile** = one line each, chosen so no two directions share more than two:
- Corners: sharp 0 / small 2–6 / soft 10–16 / round pill 999 / mixed by role (say which)
- Edges: hairlines / heavy rules (2–4 px) / filled tonal blocks, no borders / depth by shadow or layering
- Density: product row height and control height in px (e.g. 24/26 compact, 32/36 medium, 44/48 roomy)
- Button construction: e.g. filled block / text-only with underline / pill / bordered tile with icon / segmented bar
- Status construction: e.g. dot + word / filled tag / letter cell / outlined stamp / bar in a row / icon only + label on hover (with a11y)
- Layout grid: e.g. single column / sidebar + content / 12-column with wide gutters / dense split panes / canvas or map
- Scale contrast: e.g. flat (headline 1.5× body) / dramatic (headline 5× body)

## Same outline in each proposal
1. **Thesis**: two sentences; which idea; which brand↔product model and why; what is shared and what differs
   between brand and product (a small diagram beats a sentence).
2. **Principles**: 3–6, each "so we do / so we don't" + a concrete product example.
3. **Voice and words**: 3 voice traits; status labels with one-line definitions; button label rules; one error,
   one empty state, one domain-specific explanation, one marketing headline + subline. Customer words only.
4. **Foundations / tokens**: palette; semantic roles; type scale; spacing; the form profile as tokens (radius,
   border widths, elevation, control and row heights); motion; icon rule. **Contrast table** from the skill's
   `scripts/contrast.mjs`: every text/surface pair and status colour vs 4.5:1 (text) or 3:1 (non-text). No failure.
5. **Components**: cover button (primary, secondary, quiet, destructive) across default, hover, focus, disabled
   and loading; input + filter; tabs; table (`aria-sort`); status badge; panel; banner; empty state; loading;
   side panel or dialog (name its APG pattern). Keyboard behaviour; 24 px minimum targets. **Present them in
   your own way**: a states matrix is one option, not the required format.
6. **Data visualisation**: categorical palette (≤6–8, colour-blind safe), the status palette reused unchanged,
   sequential ramp, chart rules. Chart types follow your direction's job, not a default stacked bar.
7. **Composites, built only from the tokens**, each described as a **job**, not a layout:
   (a) {{product job, e.g. "a customer sees what happened on their site today and why one visit got its verdict"}};
   (b) {{website job, e.g. "a first-time visitor understands what the product does and why to trust it"}}.
   Use the layout idea assigned to your direction; don't default to filter row + chart + table + right panel, or to
   a left-aligned headline with two buttons, unless your direction was assigned it.
8. **Governance**: who owns look and voice, who owns code, how a change lands (one commit: tokens + docs).

## Files per proposal (`<proposals>/<letter-slug>/`)
- `index.html`: self-contained (Google Fonts allowed; small vanilla JS fine); CSS custom properties generated
  from / matching `tokens.json`; responsive to 390 px; visible focus; reduced motion respected.
- `tokens.json`: DTCG 2025.10; primitive, semantic, component tiers; structure reflects the brand↔product model.
  Put the form-profile values under clearly named tokens (`radius.*`, `border.width.*`, `size.control.*`,
  `size.row.*`) so the sameness check can read them.
- `README.md`: sections 1–4, 6, 8 in prose and tables, including a "Form profile" table.
- `_build/`: generator and check scripts, so the proposal can be rebuilt later (not /tmp).

## Page frame (identical in every proposal)
Use the skill's `assets/page-frame.html`: sticky top bar; sticky section list on the left (ids `#thesis
#principles #voice #foundations #components #dataviz #composites #governance`); current section marked; a
sideways tab row under 860 px. Style it with the proposal's own tokens. Reserved class names: `topbar`,
`doc-frame`, `toc`. The frame is the only thing builders copy; don't show them another proposal.

## Sample data
Safety rules for all: {{e.g. no IPs, emails, cookies or full ids; 8-char id prefixes; example.com-style sites;
invented names; estimates labelled with a range}}. Each direction gets its **own** sample set (different sites,
ids, people, numbers and example copy) so shared rows don't make different systems read alike. Real names of
products, bots or agents are allowed only if described accurately (e.g. ClaudeBot is a crawler, not a shopping
agent); otherwise invent one.

## Defaults to replace, not just avoid
For each of these, the builder states in its design plan what it chose instead and why. A list of bans alone
pushes everyone into the same leftover corner (last time: flat, near-square, 1 px borders for all nine).
Cream + terracotta; black + one acid accent; broadsheet hairline grids; identical rounded cards with soft shadow
and gradient washes; ALL-CAPS tracked eyebrows; "A · B · C" meta strings; "→" on every button; 01/02/03 on
non-sequences; one italic accented word; sci-fi HUD glow; **and the developer-tool default**: near-square corners,
1 px grey borders, a dark filled primary next to an outlined secondary, left-aligned hero with two buttons,
dashboard = filter row + KPI tiles + stacked bars + table + right panel.
