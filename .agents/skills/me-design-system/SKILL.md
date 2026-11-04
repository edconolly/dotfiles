---
name: me-design-system
description: Create a proper design system for any product or company. Grounds it in the product, proposes several clearly different directions as short descriptions for the user to pick from, then has parallel subagents build each one as a full system (principles, voice, DTCG tokens, components with states, data-viz rules, sample screens, governance) with scripted contrast, colour-blind and layout checks, and a side-by-side comparison page. Use whenever the user wants to define, explore, compare, propose or start a design system, design language, token set, brand-and-product visual system or UI kit for an app, site or company, even if they only say "make it look consistent", "give us a visual identity for the product" or "a style for the dashboard and website". Not for a single page, a logo, or marketing collateral on its own.
---

# Design system proposals

Build a design system the way the discipline means it: shared decisions plus the code, docs and process that
keep them shared. Not a mood board, a slide deck or a set of mockups. A useful test: could a newcomer build a
correct new screen from it without asking anyone?

The workflow below produces several competing **proposals**, each a complete system, so the owner chooses
between real decisions rather than colours. It was first used for Bot Max (a B2B bot-detection product);
that project is a worked example: `~/Documents/1-projects/biz-lesblondes/bot-max/docs/research/design-system/`.

## My defaults
<!-- TODO(human): 2-5 house rules that apply to every design system you make. -->

## Workflow

### 1. Ground it in the product
Learn, from the repo, docs, notes and memory before asking: what the product is, who buys it and who uses it
daily, the surfaces (app, dashboard, website, mobile), the product truths that are not style (status words and
their exact meaning, units, time format, languages, legal limits on claims), the positioning ideas, and whether
a name is final. Read any existing UI code to see what's already decided. Ask only for gaps, in one short
round. Agree with the user where the work lives (e.g. `docs/design-system/`) and that nothing is committed
until they say so.

### 2. Research (reuse before redoing)
Read `references/anatomy.md` (what a system contains, the three brand↔product models, build order, failure
modes) and `references/standards.md` (what's a real standard, what's law, what's convention). Run fresh
research only for what's specific to this product, e.g. accessibility law for its market, sector conventions
(banking, healthcare, government), or exemplar systems in its category. Use a subagent that must open every
source it cites and mark anything it couldn't open.

### 3. Propose directions as descriptions first
Follow `references/directions.md`. A subagent drafts three directions (two to four is fine) that differ on
surface axes (idea, brand↔product model, mood, theme, type, colour, signature idea) **and form axes** (corners,
edges, density, button and status construction, product layout, website composition).
Review the draft for generic colours, claims the product can't back, and false "only one that…" lines. Then
show the user and **wait**: they read, pick, edit or ask for another set (e.g. "more enterprise-focused").
Further rounds continue the lettering (D, E, F…) so earlier proposals stay comparable.

### 4. Write the brief
Fill `references/brief-template.md` into `<proposals>/BRIEF.md`. It is a **template, not a recipe**: share the
outline (sections, states to cover, checks, accessibility floor, page frame) and assign everything that should
differ (colour, type, **form profile**, product-screen layout idea, website composition, sample data). Describe
the composites as jobs, not screens. When rules change mid-way (new standard, user feedback), update the brief
and tell any running builders.

### 5. Build in parallel
One builder subagent per approved direction, all launched in the same turn, in the background, using
`references/builder-prompt.md`. Use the model and effort the user asks for. Look up the exact ID with the
models tool, and relaunch with an explicit model if a builder fails at once. Each builder uses
`assets/page-frame.html` (same navigation everywhere), keeps its scripts in `<slug>/_build/`, and runs
`scripts/contrast.mjs` and `scripts/check-pages.mjs` before reporting.

While they run, keep the user informed briefly. Don't duplicate a builder's work.

### 6. Review, fix, compare
As each finishes, follow `references/review.md`: serve the folder (`python3 -m http.server 8765` from the
proposals' parent), run `scripts/check-pages.mjs` yourself, look at the screenshots, and fix layout faults
(the table of known pitfalls saves time). When all are in, run `scripts/sameness.mjs` and look at its contact
sheets; if proposals differ only in paint, rebuild the worst pair with stronger form assignments before
presenting. Then build `<proposals>/index.html` from `assets/compare-index.html`
with screenshots in `_shots/`, open it in the browser panel, and summarise each proposal in plain words: what it
looks like, the one standout idea, the decisions the user must weigh.

Leave "How to judge them" for the owner. Criteria are their call, and good ones make at least one proposal lose.

### 7. After a choice
- Make the winner's `tokens.json` the project's single source; generate CSS variables from it (Style
  Dictionary, or the builder's script moved into the repo). Add a check for raw colours outside it.
- Fill the gaps the standards flag: an APG pattern per component, an accessibility statement, a versioning
  and deprecation policy.
- Extract components from real screens, not from the proposal page. Record ownership (look and voice vs code).
- Optional: product demos and marketing visuals with the `stageshow` skill, driven only by the system's tokens.

### Committing the proposals (only when the user says so)
- Follow the repo's own commit rules (branch or straight to main, message style); if they clash with the
  user's general rules, say which you follow before committing.
- Add a `.gitignore` in the design-system folder for `proposals/*/_build/shots/` and `.DS_Store`: the working
  screenshots are large (≈40 MB for nine proposals) and `check-pages.mjs` regenerates them.
- Before staging, scan for anything sensitive in sample data (IP-like numbers, emails, long hex ids, keys). Copied
  third-party kits trip the scan harmlessly; check the hits, don't just count them.
- Stage only the design-system folder, check the staged list, and confirm afterwards that the push changed
  nothing outside it.

## Things that keep going wrong
- Proposals that differ only in paint. The first real run produced nine proposals with the same corners,
  borders, control sizes, button pair, dashboard layout and hero. Assign form as well as colour, describe jobs
  not screens, give each its own sample data, never show a builder another proposal, and run `sameness.mjs`.
- Uneven depth between proposals (one shows brand vs product as a diagram, another as a sentence): fine if the
  user accepts it, but say so when comparing.
- Builder reports are optimistic: check pages yourself and recompute contrast and colour-blind numbers with the
  bundled script, which can disagree with a builder's own metric.
- Sample data must never contain real IPs, emails, cookies, tokens or full ids.
