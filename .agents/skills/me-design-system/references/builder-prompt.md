# Builder subagent prompt

One builder per proposal: one for the product layer (SKILL.md step 6), one per approved brand direction (step 7,
launched in parallel, in the background). Each prompt is self-contained: subagents start with no context. Never
point a builder at another proposal. Keep each builder's session ID: the craft loop sends it the critic's
findings in later rounds.

---

Build **{{slug}}: {{Name}}** for {{Product}}. You are designing screens first; the system is extracted from them
later.

## Read first, in full
1. {{proposals}}/BRIEF.md: the binding brief: product truths, what to keep and fix, the screen set, the data,
   the content rules, the accessibility floor.
2. {{proposals}}/screens.json and {{proposals}}/data/sample.json.
3. {{skill}}/references/craft-rubric.md: how your screens will be judged, by a critic who sees only screenshots.
4. Look at (read the images): {{proposals}}/references/before/ {{if a product exists}} and
   {{proposals}}/references/admired/. These are the bar: at least as good as them on hierarchy, type and
   familiarity.
{{product version only:}}
5. The existing product's code for these screens: {{paths, e.g. product/dash/*.html, dash_look.css}}. Learn its
   decisions before changing them.

## Your job
{{product version:}} Render the product and shared screens of the set ({{ids}}) as
`{{proposals}}/{{slug}}/screens/<id>.html`. Start from the real screens: keep what the brief lists under "Keep",
fix what it lists under "Fix", and improve hierarchy, spacing, type and polish. You may change layout, not just
styling, when it makes a screen clearly better; say why in the README. Use proven patterns; nothing the user has
to decode. One readable UI typeface; colour only for data, state and the main action.

{{brand version:}} Your direction (the user approved this):
{{paste the approved description, with any edits}}
Render the brand and shared screens of the set ({{ids}}) as `{{proposals}}/{{slug}}/screens/<id>.html`. The
product layer is fixed: use `{{proposals}}/p-{{name}}/tokens.css` and `components.css` for anything inside the
product, and its status colours unchanged. Your direction shows in the website, the tone, the display face, the
imagery and at most the signature moments listed. Other directions (stay unlike them): {{one line each}}.
Competitors (look unlike them too): {{one line each}}.

## How to work
1. **Plan briefly**: for each screen, what the eye should land on first, the layout in a few lines, and which
   "Fix" items it addresses. Write it to `_build/plan.md`.
2. **Build the screens** with shared `tokens.css` (CSS custom properties) and `components.css`, both used by every
   screen. Use the shared data: every screen shows the same sites, numbers and names as the other proposals.
   Real copy in the product's voice.
3. **Look at your own work.** Serve the proposals folder (`python3 -m http.server {{port}}` from its parent) and run
   `node {{skill}}/scripts/screen-set.mjs {{proposals}} --base http://127.0.0.1:{{port}}/{{path}} --only {{slug}}`.
   Fix every failure (overflow, errors, text under 11 px, leaked research words). Then read the screenshots in
   `_build/shots/` beside the references and fix what a critic would see first.
4. **Check colour**: `node {{skill}}/scripts/contrast.mjs _build/pairs.json` for every text/surface pair, border,
   focus ring and status fill (`min` 4.5 text, 3 non-text). Zero failures. For status and chart palettes,
   `contrast.mjs --cvd _build/status.json`; if a pair fails, keep the hue, move lightness first, make the smallest
   change that passes.
5. **README**: the idea in two sentences; per screen, what changed and why (linked to the "Fix" list or a
   reference); voice with three sample lines. Explanations live here, never inside a screen.

## Content rules (a critic and a script check them)
- Full-size screens only: no device frames, captions, annotations, "Before/After" labels or arrows in a screen.
- Never in a screen: "hypothesis", "illustrative", "guess", "sample data", "placeholder", lorem ipsum, TODO.
- A screen shows only what the real product would show.

## Later rounds
You will get the critic's three worst problems, and sometimes notes from the orchestrator. Fix those first, rerun
step 3 and 4, and reply with what you changed per problem. Don't redesign what nobody criticised.

## After the screens are accepted (a separate message will ask)
Extract the system from the screens: `tokens.json` (DTCG 2025.10; primitive → semantic → component), `tokens.css`
generated from it by a script in `_build/` (the screens keep working), and `system.html` from
`{{skill}}/assets/system-viewer.html`, filled with live specimens of what your screens actually use:
- Replace `{{surface-token}}`, `{{text-token}}` and `{{font-token}}` with your real variable names.
- Specimens use your real classes; show states with your own state classes or attributes (`.is-hover`,
  `aria-pressed`, `disabled`, `aria-busy`), never screenshots. Hex values and contrast numbers come from
  `contrast.mjs`, not by hand.
- Keep base styles (`body`, headings, `p`, `a`, `li`) scoped under `.app` (each screen's root) and `.specimen`, so
  they don't restyle the viewer's neutral shell. Don't rename the viewer's section ids.

Run
`node {{skill}}/scripts/check-pages.mjs http://127.0.0.1:{{port}}/{{path}}/{{slug}}/system.html --out _build/shots`.

Don't touch anything outside `{{proposals}}/{{slug}}/`. Don't edit the shared data or the product's code. Don't
commit or push. Reply with: the file list, the main decisions (type, colours, layout changes), check results,
and what you're least sure about.
