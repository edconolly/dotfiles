# Builder subagent prompt (one per direction)

Launch all builders in parallel, in the background, with the model the user asked for (look the exact ID up
with the models tool; if a launch fails with "model unavailable", relaunch with an explicit model). Each
prompt is self-contained: subagents start with no context.

---

Build design-system proposal **{{X}}. {{Name}}** for {{Product}}.

## Read first, in full
1. {{proposals}}/BRIEF.md: the binding brief (skeleton, files, data rules, status set, page frame, looks to avoid).
2. {{skill}}/references/anatomy.md (and {{research path}} if the project has its own research).
3. {{skill}}/assets/page-frame.html: the shared navigation frame. Use it as-is, styled with your tokens.
4. {{optional: an earlier finished proposal}}/index.html and README.md: the expected depth.

## Your direction (the user approved this description)
{{paste the approved description, including any changes the user or you asked for}}

## Don't drift into the others
{{one line per other direction: its name and the look to stay away from}}

## Process
Write a short design plan first: named hex values, type roles, layout concept, what makes it unique. Review
it against the brief's generic looks and revise anything default. Then build. Spend boldness in one place.

## Files
Write into {{proposals}}/{{letter-slug}}/: `index.html`, `tokens.json` (DTCG 2025.10), `README.md`, and
`_build/` for your generator and check scripts.

## Checks before you finish
- Contrast: run `node {{skill}}/scripts/contrast.mjs pairs.json` (write `pairs.json` in `_build/` listing every
  text/surface pair, status colour and control border; `min` 4.5 for text, 3 for non-text). Zero failures.
  Paste its Markdown table into the page and the README.
- Colour-blindness: `node {{skill}}/scripts/contrast.mjs --cvd status.json` on the status palette and the
  categorical palette. If two colours collapse, change one or add a stronger second cue.
- Keep the CSS custom properties matching tokens.json.
- Layout: serve the proposals folder (`python3 -m http.server 8765` from its parent) and run
  `node {{skill}}/scripts/check-pages.mjs http://127.0.0.1:8765/{{path}}/index.html --out {{proposals}}/{{letter-slug}}/_build/shots`.
  It must report no overflow, no page errors, and the section list visible and marking the current section.
  Look at the screenshots and fix what's off.

Don't touch anything outside your folder. Don't commit or push. When done, reply with: the file list, the
core hex values and typefaces, the one bold thing, the check results, and anything you're unsure about.
