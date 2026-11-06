# Reviewing proposals (do this yourself; don't trust a builder's report alone)

## Each craft round
1. Serve the proposals folder (`python3 -m http.server 8765` from its parent).
2. `node scripts/screen-set.mjs <proposals> --base http://127.0.0.1:8765/<path> --only <slug>`: overflow, page
   errors, smallest text, leaked research words, missing screens. Send failures straight back to the builder.
3. Sheets for the critic, per screen, with `scripts/side-by-side.mjs`, at the same width:
   - `before` beside the proposal, if a product exists: `--labels "Today,Proposal"`;
   - the proposal beside one or two admired references: `--labels "Proposal,<Product>,<Product>"`.
   Use `--crop 1100` for a first-screen view and a second sheet without crop for the full page when it scrolls.
   One call per width: never mix desktop and phone shots in one sheet.
   Write them to `<slug>/_build/critique-<n>/`.
4. Start a fresh critic (prompt below). Save its reply as `<slug>/_build/critique-<n>/critique.md`.
5. Look at the sheets yourself too. Add anything the critic missed, then send the three worst problems to the
   builder by its session ID.

### Critic prompt
> You are judging screen designs for {{Product}}, {{one sentence: what it does and who uses it}}. Read
> `{{skill}}/references/craft-rubric.md` and follow it exactly. Then look at every image in
> `{{slug}}/_build/critique-{{n}}/` and the full screenshots in `{{slug}}/_build/shots/`. Each sheet labels the
> proposal and the references. Judge only what you see. Reply in the rubric's output format.

Give the critic nothing else: not the brief, the direction, the builder's plan or earlier critiques. A critic
who knows the intent grades the intent.

## Brand directions as a set
Run `node scripts/sameness.mjs <proposals> --base http://127.0.0.1:8765/<path> --out <proposals>/_shots`. It
compares brand directions only (the product layer is meant to be shared), prints their form values as
information, and writes one contact sheet per brand screen (`sameness-<id>.png`). Look at the sheets beside the
competitor contact sheet. Directions that read as one brand in different colours get reassigned and rebuilt
before the user sees them.

## Every proposal, before presenting
- Product truths: status words and order, units, time format, number format (grep the screens).
- Sample data: nothing that looks like a real IP, email or long id; the shared data unchanged.
- README claims the product can't back (compliance, certification, measured money).
- For the product proposal: every "Fix" item addressed or explained, every "Keep" item kept.
- System sheet (once built): `scripts/check-pages.mjs <url>/<slug>/system.html` and the contrast tables.

## Known pitfalls (each happened at least once)
| Symptom | Cause | Fix |
|---|---|---|
| Proposals pass every check but look worse than the real product | No craft step; rules that rewarded difference; personality in the product layer | The craft loop with a fresh critic and references; variation only in the brand layer |
| A screen is a costume (field guide, till slip, referee's cards) | Concept first: a metaphor dressed the product | Start from the screen's job; metaphors may only shape a brand mood or one signature moment |
| A colour or symbol means the opposite of what users expect | Theming renamed the product's things | Product truths in the brief; the critic's familiarity item |
| "(hypothesis)" or "illustrative" inside a headline | Research labels from the brief copied into copy | Content rules; `screen-set.mjs` scans for them |
| Screens look like wireframes | Thin invented data, shrunken mock-ups with captions | Shared realistic data; full-size screens; captions only in the README |
| Specimens look fine, screens look lifeless | System designed before screens | Screens first; extract the system after |
| Content differences read as design differences | Each proposal had its own sample data | One `data/sample.json` for all |
| The critic praises the concept | It was given the brief or the builder's reasoning | Give it only images and the rubric |
| Page scrolls sideways on phones | A grid falls back to `1fr` in a media query; min-content width of an SVG or table widens it | `minmax(0, 1fr)`; charts `width: 100%` |
| Your edit vanished after a rebuild | The page is generated from a template | Edit the template in `_build/` and rerun |
| Build script lost | Scripts left in /tmp | Keep them in `<slug>/_build/` |
| Browser-panel screenshots don't follow `#hash` navigation | The panel captures the visible top | Use the scripts (headless Chrome) for scrolled shots |
| Builder subagent fails at once ("model unavailable") | The default or long-context variant isn't available | Relaunch with an explicit model ID from the models tool |
| Colours render black or a size reads "[object Object]" | A semantic token aliases a primitive with the same CSS name; a DTCG dimension object printed raw | Name primitives by hue/step, semantics by role; the build refuses self-references |
| Hidden panels all show at once | An author `display` rule overrides `hidden` | `[hidden] { display: none !important; }` |
| Commas look spaced out in prose | `tnum` on body text | `tnum` only where numbers line up |
| A builder keeps colours that fail colour-blindness | "Keep these colours" and "must pass" both said | Say which wins: keep hue, move lightness, report before/after |
| A builder's colour-blind "pass" disagrees with yours | Different metric | Re-run `contrast.mjs --cvd` and report that number |
| The system viewer's shell takes on a proposal's fonts | The proposal styles bare elements (`body`, `h2`) | Scope those styles under `.app` / `.specimen` |

## Comparison page
Build `<proposals>/index.html` from `assets/compare-index.html`: product screens before and after, row by row;
then each brand screen across directions; then each proposal's links (screens, system sheet, README), strengths
and biggest risk. Copy or link shots from each `_build/shots/` into `<proposals>/_shots/`. Keep the page neutral.
