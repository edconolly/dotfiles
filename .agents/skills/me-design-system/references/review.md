# Reviewing proposals (do this yourself; don't trust the builder's report alone)

## Every proposal
- Run `scripts/check-pages.mjs` on every page at 1440 and 390 px. Then **look** at the screenshots.
- Check the skeleton: all eight sections, both composites, three files plus `_build/`.
- Check the brief's product truths: status words, units, time format, sample-data rules (grep for anything
  that looks like an IP, email or long id).
- Read the README for claims the product can't back (compliance, certification, measured money).

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

## Comparison page
Build `<proposals>/index.html` from `assets/compare-index.html`: a side-by-side table (idea, model, feel,
core and status swatches, type, density, signature, dark theme, biggest risk) and one screenshot of each
proposal's composites (`check-pages.mjs` writes them; resize to ~1100 px wide JPEGs in `<proposals>/_shots/`).
Keep this page visually neutral so it doesn't favour any proposal.
