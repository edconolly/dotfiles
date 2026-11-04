# Reviewing proposals (do this yourself; don't trust the builder's report alone)

## Every proposal
- Run `scripts/check-pages.mjs` on every page at 1440 and 390 px. Then **look** at the screenshots.
- Check the skeleton: all eight sections, both composites, three files plus `_build/`.
- Check the brief's product truths: status words, units, time format, sample-data rules (grep for anything
  that looks like an IP, email or long id).
- Read the README for claims the product can't back (compliance, certification, measured money).

## Sameness (check before the user sees anything)
Run `node scripts/sameness.mjs <proposals> --base http://127.0.0.1:8765/<proposals-path> --out <proposals>/_shots`.
It prints each proposal's form values (corners, borders, control and row heights), flags pairs alike on 3+ of 4,
and writes contact sheets of every Components and Composites section side by side. Look at the sheets: numbers
miss layout and construction (same dashboard layout, same hero, same button pair). If proposals read as one
product in different colours, fix the brief and rebuild the worst pair before presenting; don't present a set
that only differs in paint.

## Known pitfalls (each one happened at least once)
| Symptom | Cause | Fix |
|---|---|---|
| Page scrolls sideways on phones | A grid falls back to `grid-template-columns: 1fr` in a media query; an SVG or table's min-content width then widens the column | Use `minmax(0, 1fr)`; give charts `width: 100%` |
| Left section list missing mid-page | Class-name clash: the proposal already used `.frame` (or similar) with `overflow: hidden` for a mock window, and the layout reused the name | Reserve `topbar`, `doc-frame`, `toc` for the frame; rename on clash |
| Sticky list doesn't stick | An ancestor has `overflow: hidden/auto` | Remove it from the frame's ancestors |
| A wide composite overflows after adding the left column | It "breaks out" with `100vw` / `translateX(-50%)` relative to the old centred column | Inside `.doc-frame`, set the breakout to `width: 100%` |
| Your edit vanished after a rebuild | The page is generated from a template by the builder's script | Edit the template in `_build/` and rerun the build, not the output |
| Build script lost | Scripts were left in /tmp | Keep them in `<slug>/_build/` |
| Browser-panel screenshots don't follow `#hash` navigation | The panel captures the visible top of the page | Use `check-pages.mjs` (headless Chrome) for scrolled shots |
| Builder subagent fails at once ("model unavailable") | Default model alias not available | Relaunch with an explicit model ID from the models tool |
| All proposals look like one product in different colours | Brief fixed the screens (recipe) and only assigned surface axes; ban lists pushed everyone into the same corner; shared sample rows; builders shown another proposal | Assign form profiles and layout ideas per direction, describe composites as jobs, give each its own sample data, show builders only the page frame, run `sameness.mjs` |
| Proposals differ in form but still feel alike (same grey grounds, same sans, same status colours, same voice) | Personality axes left unassigned, so they drift to one model's taste | Assign colour mood band, lead type class and tone per direction; decide status colours explicitly; compare against the competitor sheet |
| A check reads the wrong current section | Smooth scrolling still running when read | `check-pages.mjs` emulates reduced motion |
| Colours render black or a size reads "[object Object]" | A semantic token aliases a primitive with the same CSS name, so the variable points to itself; or a DTCG dimension object was printed raw | Name primitives by hue/step, semantics by role; have the build refuse self-references and unformatted values |
| Hidden pages, panels or slides all show at once | An author `display` rule overrides the `hidden` attribute | Add `[hidden] { display: none !important; }` |
| Commas and colons look spaced out in prose | Tabular figures (`tnum`) applied to body text | Apply `tnum` only where numbers line up (tables, figures) |
| A builder keeps colours that fail colour-blindness | The prompt said both "keep these colours" and "must pass" | Say which wins: adjust lightness first, keep hue, report before/after |
| Sameness flags pairs that clearly look different | Shared floors (24 px targets) counted as form choices | The script skips `target`/`min` tokens; always judge from the contact sheets |
| A builder's colour-blind "pass" disagrees with yours | Different metric (OKLab distance vs ΔE) | Re-run `contrast.mjs --cvd` and report that number |

## Comparison page
Build `<proposals>/index.html` from `assets/compare-index.html`: a side-by-side table (idea, model, feel,
core and status swatches, type, density, signature, dark theme, biggest risk) and one screenshot of each
proposal's composites (`check-pages.mjs` writes them; resize to ~1100 px wide JPEGs in `<proposals>/_shots/`).
Keep this page visually neutral so it doesn't favour any proposal.
