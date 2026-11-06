# Craft rubric

Used by the **critic** in the craft loop (SKILL.md step 6). The critic is a fresh subagent that sees only the
screen screenshots, the reference screenshots at the same size, and this file: never the builder's reasoning
or the brief's direction text. Judging the picture, not the intent, is the point.

## How to score
For each item: **weak / fine / strong**, plus one line of evidence that points at something visible ("the
filter row's controls sit on three different baselines"), never a feeling ("feels cluttered"). Then name the
**three worst problems** across all screens, most damaging first, each with the screen and the place.

A screen set is ready only when no item is weak and, on hierarchy, type and familiarity, it is at least as good
as the references. If the existing product is a reference and the proposal is worse on any of those three, say
so plainly: being different from the product is not a reason to accept being worse than it.

## The items

**1. Hierarchy.** The eye lands first on what matters most on that screen, then moves in a sensible order.
- Strong: one clear focal point per screen (the chart on an analytics view, the verdict in a session panel);
  secondary things are visibly quieter.
- Weak: everything has the same weight; decoration or labels compete with the data; the most important number
  is not the most prominent.

**2. Alignment.** Things sit on one grid; edges and baselines line up.
- Strong: columns, cards and controls share left edges; text baselines align across a row.
- Weak: near-misses of a few pixels; controls of different heights in one row; content that starts at
  different insets in neighbouring panels.

**3. Spacing rhythm.** A small set of spacing steps, used consistently; related things closer than unrelated.
- Strong: you can see the groups without borders; gaps repeat.
- Weak: random gaps; a heading closer to the previous section than to its own; cramped and empty areas side by side.

**4. Type.** Readable sizes, a clear scale, sensible line lengths, tabular figures where numbers line up.
- Strong: body text easy at normal distance; three or four sizes doing distinct jobs; numbers align.
- Weak: tiny text (under ~12 px in a product, ~16 px for website body); too many sizes; a display or
  decorative face used for running UI text; long lines of prose.

**5. Density.** Right for the job and the person.
- Strong: an analyst's screen shows a lot without strain; a first-time visitor's page breathes.
- Weak: a work screen showing seven rows and a lot of empty space; a marketing page crammed like a table.

**6. Colour restraint.** Colour carries meaning (data, state, the one main action), not decoration.
- Strong: you can tell what each colour means; status colours mean the same thing everywhere.
- Weak: several accents fighting; colour used for emphasis that should come from hierarchy; status colours reused
  as decoration.

**7. Consistency.** The same thing looks and behaves the same everywhere.
- Strong: one button style per role, one way to show a status, one way to show a selected item.
- Weak: two kinds of tabs; a status as a pill here and a dot there; different corner radii without a reason.

**8. Familiarity.** A new user knows how to use it without explanation.
- Strong: proven patterns where they fit (filters above results, tabs for views, a side panel for detail);
  labels say what things do.
- Weak: a metaphor the user must decode; invented controls for ordinary jobs; explanatory captions needed
  to understand the screen.

**9. Content fit.** Real data reads well.
- Strong: long names truncate gracefully; empty values are clear; big numbers format well; the screen still works
  with realistic volume.
- Weak: layouts that only work with the tidy sample; overflowing labels; placeholder-looking data.

**10. States and polish.** Hover, focus, selected, loading, empty and error look designed.
- Strong: focus is visible; empty and loading states look like part of the product.
- Weak: missing focus; an empty state that is just blank; error text bolted on.

## Output format (the critic's reply)
```
| Item | Score | Evidence |
|---|---|---|
| Hierarchy | fine | ... |
... all ten ...

Versus references (hierarchy / type / familiarity): better | as good | worse, one line each.

Three worst problems:
1. <screen>, <where>: <what is wrong>, <what would fix it>
2. ...
3. ...
```
