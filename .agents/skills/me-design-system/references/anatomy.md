# What a design system is (reference)

Condensed from research done for Bot Max (Nov 2026). Use it to brief builders and to check a proposal is a
*system*, not a mood board. Full sources: see `standards.md`.

## Contents
1. Definition
2. Layers
3. Tokens
4. Brand system vs product system
5. Components: what each needs
6. Data visualisation
7. Governance
8. Build order for a small team
9. Failure modes
10. Exemplars

## 1. Definition
A design system is **a set of shared decisions plus the code, documentation and process that keep them shared**.
Brand guidelines, a style guide, a pattern library, a component library and design tokens are each one *part* of it.

Test: could a newcomer build a new screen that looks and behaves right using only the system, without asking
anyone? If yes, it is a system. If not, it is a pile of assets.

## 2. Layers (each depends on the one below)
```
Governance & documentation   who decides, how it changes, where it is read
Patterns & templates         page-level solutions: filter bar, empty state, list + side panel
Components                   Button, Table, Tabs, Dialog, Badge ...
Design tokens                primitive -> semantic -> component
Foundations / brand          colour, type, spacing, icons, imagery, motion, voice
Principles                   what we value; how to decide when rules run out
   cross-cutting: accessibility, content design (voice, words), data visualisation
```
- **Principles**: 3–6, each with "so we do / so we don't" and a concrete example from the product. Derive them
  from what the team already insists on, not a wish-list.
- **Voice**: voice is constant, tone flexes. Cover capitalisation, number/date/time formats, button labels
  (verb + object), error shape (what happened, why, what to do), empty states, a terminology list (customer
  words vs internal words).

## 3. Tokens
Named design decisions stored as data, compiled to CSS variables / JS / native / Figma variables.

| Tier | Example | Rule |
|---|---|---|
| Primitive | `blue.600 = #1d4ed8`, `space.4 = 16px` | Raw palette and scales. Components never use these directly. |
| Semantic | `color.text.danger -> red.700` | Named by purpose. This is what theming (dark mode) swaps. |
| Component | `table.header.bg -> color.surface.sunken` | Optional; only where one component needs an override. |

- Name by role + modifier (`text.subtle`, `surface.raised`, `border.strong`), never by appearance
  (`blue-button`), and never by the product name if the name might change: keep name and logo in a `brand.*` group.
- Format: W3C Design Tokens Community Group (DTCG) format, version 2025.10: `$type`, `$value`, `$description`,
  groups, aliases like `{color.ink.900}`. Readable by Figma, Style Dictionary, Tokens Studio, Penpot.
- Density is a token (row height, cell padding), not a magic number.

## 4. Brand system vs product system (pick one model per proposal)
| Model | Shape | Example |
|---|---|---|
| One unified system | Same components everywhere; marketing is roomier composition | Vercel Geist |
| One foundation, two expressions | Shared tokens and voice; a brand layer and a denser product layer | GitHub Primer (Product UI / Brand UI) |
| Separate systems, few shared decisions | Expressive brand, neutral product; share only name, status colours, voice, one typeface, icons | Shopify (Polaris for admin, separate brand) |

Always shared whatever the model: name and logo, icon set, voice and terminology, status semantics, the
accessibility floor. May differ: type scale, density, motion, imagery, component set.

## 5. Components: what each needs
Purpose and when *not* to use it; anatomy; variants; **all states** (default, hover, focus, active, disabled,
loading, error, empty); sizes/density; keyboard and screen-reader behaviour (name the WAI-ARIA APG pattern);
content rules; code. Minimum target 24×24 CSS px (WCAG 2.2, 2.5.8). Don't build more than the product uses.

Typical core set for an app with a dashboard: button, input + filter chip, tabs, dense table (sortable:
`aria-sort`), status badge, card/panel, banner/toast, empty state, loading skeleton, side panel or dialog
(decide: modal dialog, non-modal dialog or complementary region, and follow that APG pattern).

## 6. Data visualisation (needed for any analytics UI)
- Colour roles: categorical (ordered, colour-blind-safe, max 6–8 series), sequential, diverging, and a
  **separate status palette** that keeps the same colour on every chart and table.
- Never colour alone: glyph, pattern, label or position as a second cue. Marks ≥3:1 against the background.
- Chart rules: horizontal gridlines only, top-N + "Other", direct labels where possible, tabular numerals,
  right-aligned numbers, units always shown, a "show as table" alternative, a title that says what and when.

## 7. Governance
- Ownership: name one owner for look and voice, one for code. Decisions are written in the docs, not chat.
- A change = one commit that updates tokens + code + docs together, with a before/after screenshot.
- Versioning: semantic versioning for published packages; a dated changelog for a single internal file.
- Deprecation: mark it, name the replacement and the removal date, keep it working until then.
- Health: count raw colours/paddings outside the token file (a cheap lint), per-page overrides, a11y defects.

## 8. Build order for a small team (no dedicated design-system team)
This is the order the *documented system* settles in, not the order of design work: this skill designs the key
screens first and extracts steps 1–4 from them (SKILL.md).

1. Foundations in words: principles, voice and terminology, accessibility target (WCAG 2.2 AA), name existing values.
2. Tokens: palette, semantic roles, type scale, spacing, radius, elevation; status colours fixed once.
3. Core components, documented with states and keyboard behaviour (extract from real screens, don't invent).
4. Data-viz rules.
5. Brand layer for the public site, once name and positioning are settled.
6. Later: docs site, Figma library synced to tokens, dark mode, versioned package, visual-regression tests.

## 9. Failure modes
Built first, used never. No owner (drift returns). Two sources of truth (Figma vs code). Naming by appearance.
Over-abstraction (12 button variants). Accessibility "later". Docs without examples or don'ts. Treating it as a
project with an end date. Marketing look forced onto dense UI, or the reverse.

## 10. Exemplars worth opening
GitHub Primer (primer.style): brand + product split, patterns, a11y. IBM Carbon: data viz and dense tables.
Atlassian (atlassian.design): token naming, content guidance. Shopify Polaris: admin UI, content rules.
Vercel Geist: one system for site and app. Grafana Saga: analytics panels, time pickers. GOV.UK Design
System: evidence-based components and contribution process. Adobe Spectrum / Material 3: theming, density, motion.
