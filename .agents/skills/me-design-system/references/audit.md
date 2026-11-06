# Auditing an existing product (SKILL.md step 3)

When a product already has screens, they are the starting material. The audit turns them into three things:
captures of every page, a written record of the system the product already has, and a list of concrete problems
the refinement will fix. The product team made many good decisions through use; the audit finds and keeps them,
so the refinement improves the product instead of replacing it.

The audit is research, not a proposal. The skill never edits the product's code: findings and refinements go to
the product team as a proposal.

## 1. Run it with its own sample data
- Look for a local or dev server with sample or fixture data (a `dev/` folder, a seed script, a storybook, a
  demo mode). Prefer it to the live product: it is safe to capture, and the data is shared with the proposals.
- If only the live product exists, capture with the user's permission and check every screenshot for real
  customer data (names, emails, IPs, ids) before it goes in the repo. Blur or crop, or keep the screenshots out of
  git.
- If only screenshots exist, use them; note that states (hover, focus, loading) can't be audited.

## 2. Capture every page
- List every page, view and panel (a nav crawl plus the routes in the code). Include the states that are easy to
  miss: an open side panel, an empty result, a loading state, an error, a dialog, the phone layout.
- Capture each at the screen-set widths:
  `node scripts/screen-set.mjs --capture <url> <url> … --out <proposals>/references/audit`
- Capture the screen set's own "before" shots once `screens.json` has `before` URLs:
  `node scripts/screen-set.mjs <proposals> --before`

## 3. Extract the system it already has
Read the CSS and markup, not just the pictures. Write `<research>/audit.md` with:
- **Tokens:** colours by role (surfaces, text, borders, accents, status/data colours) with hex values; type
  families, the sizes actually used, weights, line heights; spacing steps; radii; border widths; shadows; control
  and row heights. Mark where values are tokens and where they are hard-coded.
- **Components:** each one and the states it has (buttons, inputs, filters, tabs, tables, status chips, panels,
  charts, empty and loading states). One line each, with where it lives in the code.
- **Patterns:** page layout, navigation, how filters and time ranges work, how detail opens, how numbers and
  times are formatted.
- **What works and should be kept**, in plain words, e.g. "the five verdict levels use one colour each and the same
  order everywhere"; "one sans-serif at small sizes keeps the tables dense but readable". This list matters as much
  as the problems: it stops the refinement from throwing away what users already rely on.

## 4. Find the problems
- Score each main screen with `references/craft-rubric.md`. Use a fresh critic subagent that sees only the
  screenshots and the rubric, the same as in the craft loop, so the product and the proposals are judged alike.
- Run the accessibility checks: `scripts/contrast.mjs` on text, borders and status colours (pairs from the CSS),
  `--cvd` on the status palette, focus visibility, target sizes.
- Look for inconsistency: the same thing drawn two ways, near-duplicate colours or sizes, one-off components.
- Each problem gets one line, a screenshot reference and a severity, e.g.
  "**High** · Analytics, verdict chart: four of five verdict fills are under 3:1 on white
  (`audit/explore-1440.png`)."

## 5. Hand over to the refinement
The refinement brief lists: what to keep (from step 3), the problems to fix (from step 4, worst first), and the
screen set with its "before" shots. The refined screens may change layout as well as styling, but each change
should trace back to a problem, a reference the user admires, or a new screen the product doesn't have yet.

Show the user a short summary of the audit before building: what's good, the five worst problems, and anything
that needs the product team's decision (e.g. colours that carry meaning customers already know).
