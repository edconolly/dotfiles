---
name: me-design-system
description: Create or refine a design system for any product or company, screens first. Starts from what exists (audits a running product and keeps what works) or from the product's jobs, designs the same fixed set of key screens with the same real data, improves them through a craft loop (screenshots beside reference products the user admires, a critic with a 10-point rubric, 2–3 revision rounds), then extracts tokens and components into a neutral system viewer. Product UI stays familiar and polished; distinct brand directions (website, tone, signature moments) are proposed as short descriptions for the user to pick from, then built in parallel. Includes contrast, colour-blind, layout and label-leak checks and a same-screen comparison page. Use whenever the user wants to define, refine, explore, compare, propose or start a design system, design language, token set, visual identity for a product, or UI kit, even if they only say "make it look consistent", "make the dashboard look better" or "a style for the app and website". Not for a single page, a logo, or marketing collateral on its own.
---

# Design systems, screens first

A design system is shared decisions plus the code, docs and process that keep them shared. Test: could a
newcomer build a correct new screen from it without asking anyone?

This skill builds one by **designing screens first, extracting the system second and documenting it last**. The
system and the product grow together; components designed alone look lifeless and need redesigning once they
meet real content. Whatever already exists (a running product, a few screens, nothing) is the starting material.

It keeps two layers apart:

| | Product layer | Brand layer |
|---|---|---|
| Goal | Fast to read, familiar, consistent, modern | Recognisable, distinctive, true to the positioning |
| Patterns | Proven ones are welcome (filters, tabs, chart, lists, side panel) | Free to explore |
| Type | One readable family; personality only in small touches | Expressive pairing allowed |
| Colour | Restrained; colour means data or state | Brand colours, moods, imagery |
| Variation between proposals | Not a goal: quality is | Required, checked against each other and competitors |
| How many | One refinement (or one new system) | 2–3 directions |

The brand may lend the product a few signature moments (an empty state, the page end users meet, a report
export) without changing how the product works.

Worked example (earlier versions, and why they failed): Bot Max,
`~/Documents/1-projects/biz-lesblondes/bot-max/docs/research/design-system/`.

## My defaults
<!-- TODO(human): 2-5 house rules that apply to every design system you make. -->

## Workflow

### 1. Ground it in the product
Learn, from the repo, docs, notes and memory before asking: what the product is, who buys it and who uses it
daily, the surfaces (app, dashboard, website, the page end users meet, email), the product truths that are not
style (status words and their exact meaning, units, time format, languages, legal limits on claims), the
positioning, and whether the name is final. Find out **what exists**: running UI with sample data, screenshots,
a stylesheet, nothing.

Then ask, in one short round, with defaults:
- gaps in the above;
- **references:** "Name 2–3 products whose design you admire." Offer a starter list of modern, well-crafted
  products (e.g. Linear, Attio, Plain, Raycast, Cursor, Granola, Vercel, Resend, Clerk, Supabase, Mercury, Ramp)
  and say the aim is better than the category's incumbents. Ask the user to drop screenshots of the screens they
  like into `<proposals>/references/admired/` (product UIs are usually behind a login); public pages can be
  captured. For internal comparison only: never reuse their assets;
- where the work lives (e.g. `docs/design-system/`), and that nothing is committed until they say so.

### 2. Research (reuse before redoing)
Read `references/anatomy.md` (what a system contains, brand↔product models, failure modes) and
`references/standards.md` (real standards, law, convention). Research fresh only what's specific to this
product (accessibility law in its market, sector conventions). Use a subagent that must open every source it
cites.

**Competitor audit** (feeds the brand layer): a subagent visits 6–8 competitors' public sites and writes
`<research>/competitors.md`: ground colour and mood, lead type class, form, tone, what buyers recognise them by,
plus a homepage screenshot each for a contact sheet.

### 3. Audit what exists
If any UI exists, follow `references/audit.md`: run it with its sample data, capture every page, write down the
system it already has, list **what works and must be kept**, and find the problems (craft rubric, contrast,
colour blindness, inconsistency). If nothing exists, skip to step 4.

### 4. Fix the screen set, the data and the references
- **Screen set:** 4–6 screens that every proposal renders, written to `<proposals>/screens.json` (format in
  `references/brief-template.md`). Cover: the main working screen; a detail view; a first-run or empty state;
  setup or onboarding; the surface end users meet, if any; the public website's home (brand layer). Pick the
  real views by judgement; the user can swap any. Static and full size: 1440 wide, plus phone width for the main
  screen and anything end users see. No clickable flows.
- **Shared data:** one `<proposals>/data/sample.json` used by every proposal, taken from the product's own sample
  data where it exists, otherwise realistic data in realistic volume (long names, empty values, big numbers).
  Holding content fixed is what makes the comparison fair: every difference you see is design.
- **Before shots:** if a product exists, add each screen's `before` URL to screens.json and run
  `scripts/screen-set.mjs <proposals> --before`.

Show the user the audit summary (what's good, the five worst problems) and the screen set, and **wait**.

### 5. Write the brief
Fill `references/brief-template.md` into `<proposals>/BRIEF.md`: product truths, what to keep, the problems to
fix, the screen set, the shared data, the references, the content rules, the accessibility floor, the files.
Brand directions are added to it in step 7.

### 6. Product layer: one proposal, through the craft loop
One builder subagent (`references/builder-prompt.md`, product version) designs the product screens of the
screen set as `<proposals>/p-<name>/screens/<id>.html`. Where a product exists it refines the real screens
(layout may change, not just styling); where nothing exists it designs them from the product's jobs and the
references, using proven patterns.

**The craft loop** (2–3 rounds before the user sees anything). Subagents can't start subagents, so you run it:
1. The builder finishes a round and reports.
2. You serve the proposals folder (`python3 -m http.server 8765` from its parent) and run
   `node scripts/screen-set.mjs <proposals> --base http://127.0.0.1:8765/<path> --only p-<name>`.
   Fix-or-return any failure (overflow, errors, tiny text, leaked labels) first.
3. You make comparison sheets with `scripts/side-by-side.mjs`: each screen beside its before shot (if any) and
   beside one or two admired references, at the same width.
4. You start a **fresh critic** subagent each round with only: the sheets, the screenshots and
   `references/craft-rubric.md`. Never the brief's direction text, the builder's reasoning or earlier critiques:
   it judges the picture, not the intent.
5. You send the critic's three worst problems to the builder (same session ID) to fix, with anything you saw
   yourself. Repeat.

Stop when no rubric item is weak and the critic rates the screens at least as good as the references on
hierarchy, type and familiarity; or after three rounds, and then tell the user plainly what is still weak.

Show the user the before/after screens at full size, with the README's short list of changes, and **wait**.

### 7. Brand layer: directions as descriptions first, then built
While the product proposal is being built, draft brand directions with `references/directions.md`: 2–3 that
differ in idea, mood, colour mood, type pairing, tone of voice and website composition, and that look unlike the
competitors. They share the product layer: each direction shows how the same product looks inside its brand, not
a different product. Logos are out of scope: a plain text wordmark until the name is final.

Show the descriptions and **wait**: the user picks, edits or asks for another set. Then add the approved
directions to the brief and launch one builder per direction in parallel, in the background
(`references/builder-prompt.md`, brand version). Each renders the brand and shared screens of the screen set,
on top of the accepted product proposal's tokens. Run the craft loop on each. Then run
`scripts/sameness.mjs <proposals> --base …` and look at its sheets: brand directions that read alike get
reassigned and rebuilt before the user sees them.

### 8. System sheets
Only after a proposal's screens are accepted, its builder extracts the system from them: `tokens.json` (DTCG
2025.10), generated `tokens.css`, `components.css` (the same file the screens use), and `system.html` from
`assets/system-viewer.html`. The viewer's shell is neutral and identical for every proposal; only the
specimens inside are in the proposal's style. Run `scripts/contrast.mjs` (and `--cvd` on the status palette) and
`scripts/check-pages.mjs` on it. Full documentation (principles, every component, governance) waits for step 10.

### 9. Compare and present
Follow `references/review.md`, then build `<proposals>/index.html` from `assets/compare-index.html`: the product
screens before and after, then each brand screen across directions side by side, then each proposal's links.
Open it in the browser panel and summarise in plain words: what changed in the product and why, and per brand
direction what it looks like, its one standout idea, and the decision the user must weigh.

Leave "How to judge them" to the owner. Good criteria make at least one proposal lose.

### 10. After a choice
- Write the full documentation for the chosen system only: principles, voice and words, every component with
  states and keyboard behaviour, data-viz rules, governance (who owns look and voice, who owns code, how a change
  lands). Add what the standards flag: an APG pattern per component, an accessibility statement, a versioning and
  deprecation note, and dark mode and phone layouts for any screen that lacks them.
- Make its `tokens.json` the single source; generate CSS variables from it and add a check for raw colours
  outside it.
- For an existing product, the result stays a proposal for its team: hand over the before/after screens, the
  audit and the token diff. Don't edit the product's code.
- Optional: product demos and marketing visuals with the `stageshow` skill, driven by the system's tokens.

### Committing (only when the user says so)
- Follow the repo's own commit rules; if they clash with the user's general rules, say which you follow.
- Add a `.gitignore` for `*/_build/shots/` and `.DS_Store`: working screenshots are large and regenerable.
- Before staging, scan for anything sensitive in sample data and screenshots (IP-like numbers, emails, long hex
  ids, keys, real customer data in captures). Check the hits; don't just count them.
- Stage only the design-system folder, check the staged list, confirm afterwards nothing else changed.

## Builders and models
Use the model and effort the user asks for. If a subagent fails at once with "model unavailable", look up the
exact ID with the models tool and relaunch with it (a long-context variant may not be available). Builder prompts
are self-contained; never show a builder another proposal.

## Things that keep going wrong
- **Concept first.** Starting from a metaphor (field guide, referee, till slip) and dressing the product in it.
  Theming is not design, and it changed meaning (a yellow card meaning "allowed"). Start from the screens' jobs.
- **Rewarding difference over quality.** Earlier versions banned familiar layouts and neutral type in the
  product, so every proposal was different and worse than the real product. Variation belongs to the brand layer;
  the product layer is judged on craft.
- **Personality in the product.** A tool people use all day should be calm and fast to read.
- **No craft step.** Mechanical checks (contrast, overflow) all passed on designs nobody would want. The critic
  and the rounds are not optional.
- **System before screens.** Specimen grids designed in a vacuum, then forced into screens.
- **Documentation mixed with demonstration.** A docs page styled in each proposal's look is odd to read and
  still doesn't show the product. Screens show the design; the neutral viewer documents it.
- **Content varying with design.** Different sample data per proposal made content differences read as design
  differences. One shared data file.
- **Throwing away the existing product.** Its team's decisions were made through use. Audit, keep, then improve.
- **Labels leaking into designs.** "(hypothesis)" ended up in a website headline. Research labels stay in
  documents; `screen-set.mjs` scans for them.
- **Optimistic builder reports.** Check screens yourself and recompute contrast and colour-blind numbers with the
  bundled script.
- Sample data must never contain real IPs, emails, cookies, tokens or full ids.
