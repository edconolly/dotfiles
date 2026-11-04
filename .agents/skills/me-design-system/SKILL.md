---
name: me-design-system
description: Create a proper design system for any product or company. Grounds it in the product and a competitor audit, proposes several clearly different directions (in form and personality, not just colour) as short descriptions for the user to pick from, then has parallel subagents build each one as a full system (principles, voice, DTCG tokens, components with states, data-viz rules, sample screens, governance) with scripted contrast, colour-blind and layout checks, and a side-by-side comparison page. Use whenever the user wants to define, explore, compare, propose or start a design system, design language, token set, brand-and-product visual system or UI kit for an app, site or company, even if they only say "make it look consistent", "give us a visual identity for the product" or "a style for the dashboard and website". Not for a single page, a logo, or marketing collateral on its own.
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

**Competitor audit (always).** "Different" must mean different in the market, not only from each other. A
subagent visits the public websites (and any public product screenshots or docs) of 6–8 competitors buyers will
compare against, and writes `<research>/competitors.md`: per competitor, ground colour and colour mood band, lead
type class, form (corners, edges, density), tone of voice, and what buyers recognise them by. It saves one
screenshot of each homepage for a contact sheet (for internal comparison only; never reuse their assets). The
summary table goes into the brief's market section.

### 3. Propose directions as descriptions first
Follow `references/directions.md`. First decide with the user whether **status colours** are fixed for all
directions or varied on purpose. Then a subagent drafts three directions (two to four is fine) that differ on
**idea** axes (idea, brand↔product model, mood, signature idea, market position), **form** axes (corners, edges,
density, button and status construction, product layout, website composition) and **personality** axes
(colour mood band, lead type class, tone of voice with sample lines). Unassigned axes converge on one model's
taste, so assign all three groups. Logos are out of scope: plain text wordmark until the name is final.
Review the draft with the set table in directions.md, and for generic colours, claims the product can't back,
and false "only one that…" lines. Then
show the user and **wait**: they read, pick, edit or ask for another set (e.g. "more enterprise-focused").
Further rounds continue the lettering (D, E, F…) so earlier proposals stay comparable.

### 4. Write the brief
Fill `references/brief-template.md` into `<proposals>/BRIEF.md`. It is a **template, not a recipe**: share the
outline (sections, states to cover, checks, accessibility floor, page frame) and assign everything that should
differ (**form profile**, **personality**: colour mood, type class, tone; product-screen layout idea, website
composition, sample data, how each is unlike the competitors). Fix status colours here if the user chose that. Describe
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
presenting. Also check personality: a table of each proposal's ground colour band, lead type class and
headline, set beside the competitor contact sheet. Clusters there are as real as clusters in form. Then build `<proposals>/index.html` from `assets/compare-index.html`
with screenshots in `_shots/`, open it in the browser panel, and summarise each proposal in plain words: what it
looks like, the one standout idea, the decisions the user must weigh.

Leave "How to judge them" for the owner. Criteria are their call, and good ones make at least one proposal lose.

### 7. Stress-test the shortlist (before choosing one)
Proposals are built around the screens that sell the product, so they all look good there. Once the user
shortlists two or three (ideally after settling positioning), send each back to a builder to add the screens
nobody designed, in the same system, then compare again:
- the screen an end user meets when the product acts on them (e.g. a block or challenge page, an error page,
  an email); this is often where accessibility law bites hardest (WCAG 2.2 3.3.8: no puzzle tests);
- setup and onboarding (the first run, connecting the product, switching from trial or shadow to live);
- a second product area (e.g. analytics with filters and top lists, or settings with roles and permissions);
- dark mode (if not built) and the main screen at phone width;
- an accessibility statement and a versioning and deprecation note.
The system that holds up on these is usually the one to choose.

### 8. After a choice
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
- Proposals that differ in form but share a personality. The second run fixed form, yet six of nine sat on light
  grey grounds, eight of nine led with a grotesque sans, seven of nine had the same status colours, and all
  wrote in one voice. Assign colour mood, type class and tone; decide status colours explicitly.
- Differentiating only within the set. Without a competitor audit, nobody knows whether the whole set looks like
  the market leader.
- Judging on hero screens. Shortlist, then stress-test on the unglamorous screens (step 7).
- Uneven depth between proposals (one shows brand vs product as a diagram, another as a sentence): fine if the
  user accepts it, but say so when comparing.
- Builder reports are optimistic: check pages yourself and recompute contrast and colour-blind numbers with the
  bundled script, which can disagree with a builder's own metric.
- Sample data must never contain real IPs, emails, cookies, tokens or full ids.
