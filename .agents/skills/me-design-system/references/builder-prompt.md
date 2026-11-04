# Builder subagent prompt (one per direction)

Launch all builders in parallel, in the background, with the model the user asked for (look up the exact ID
with the models tool; if a launch fails with "model unavailable", relaunch with an explicit model). Each prompt
is self-contained: subagents start with no context. Don't point builders at another finished proposal: they
copy its layouts and captions, not just its depth.

---

Build design-system proposal **{{X}}. {{Name}}** for {{Product}}.

## Read first, in full
1. {{proposals}}/BRIEF.md: the binding brief. Note the "Shared on purpose vs must differ" table and "Defaults
   to replace".
2. {{skill}}/references/anatomy.md (and {{research path}} if the project has its own research).
3. {{skill}}/assets/page-frame.html: the shared navigation frame. Use it as-is, styled with your tokens. It is
   the only part you copy.

## Your direction (the user approved this description)
{{paste the approved description, including the form profile, product layout idea, website composition,
personality (colour mood band and ground, lead type class and families, tone with its three sample lines),
sample data set, and any changes the user or you asked for}}

Status colours: {{fixed by the brief: use these hex values | yours to design}}. Logo: a plain text wordmark (the
name in your lead face); don't draw a mark.

## The others, and what to stay away from
{{one line per other direction: its form profile AND its personality, e.g. "E: small corners, hairlines,
sidebar + content, map hero; light tinted blue-grey, grotesque sans, cartographer's tone"}}
Competitors buyers already know: {{one line each from the brief's market table}}. Look unlike them too.

## Process
1. Design plan first: palette with named hex values, type roles and scale, your form profile as numbers,
   product-screen layout sketch (ASCII is fine), website composition sketch, and for each item in "Defaults to
   replace" one line on what you chose instead.
2. Check the plan against the others: if you share more than two form choices with any of them, or your colour
   mood band or lead type class drifted from the assignment, change yours. Write the website's headline, one
   error and one status message in your tone before building; if they could belong to another proposal, rewrite.
3. Build. Spend boldness in one place, but let the form profile show on every component.

## Files
Write into {{proposals}}/{{letter-slug}}/: `index.html`, `tokens.json` (DTCG 2025.10; form values under
`radius.*`, `border.width.*`, `size.control.*`, `size.row.*`), `README.md` (with a "Form profile" table), and
`_build/` for your generator and check scripts.

## Checks before you finish
- Contrast: `node {{skill}}/scripts/contrast.mjs _build/pairs.json` (every text/surface pair, status colour,
  control border; `min` 4.5 text, 3 non-text). Zero failures; paste its table into the page and README.
- Colour-blindness: `node {{skill}}/scripts/contrast.mjs --cvd _build/status.json` for the status and categorical
  palettes. If a pair fails, change the colour: keep its hue, move lightness first, make the smallest change
  that passes, and show a before/after table. This applies to colours kept from an earlier round too; "keep the
  colours" never means "keep a failing pair". A stronger second cue is a backup, not a substitute.
- CSS custom properties match tokens.json.
- Layout: serve the proposals folder (`python3 -m http.server 8765` from its parent) and run
  `node {{skill}}/scripts/check-pages.mjs http://127.0.0.1:8765/{{path}}/index.html --out {{proposals}}/{{letter-slug}}/_build/shots`.
  No overflow, no errors, section list working. Look at the screenshots and fix what's off.

Don't touch anything outside your folder. Don't commit or push. Reply with: the file list, core hex values and
typefaces, your form profile, the one bold thing, check results, and anything you're unsure about.
