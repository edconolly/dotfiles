# Standards vs convention (reference, checked Nov 2026)

Short answer: **there is no standard for a design system as a whole.** Standards exist for parts of it.
Everything else (layers, three token tiers, Atomic Design, docs format, governance) is convention.
Re-check versions if this file is more than a year old.

## Formal standards that apply to parts of a design system
| Standard | Publisher | Status (Nov 2026) | Governs | Mandatory? |
|---|---|---|---|---|
| WCAG 2.2 | W3C | Recommendation; also ISO/IEC 40500:2025 | Contrast (1.4.3 text 4.5:1, 1.4.11 non-text 3:1), focus (2.4.7, 2.4.11), target size (2.5.8, 24 px), accessible auth (3.3.8), reflow, keyboard | Via law where a product is in scope (see EAA); otherwise the accepted bar |
| WCAG 3.0 | W3C | Working Draft; "does not replace WCAG 2" | Future model | No; watch only |
| WAI-ARIA + Authoring Practices Guide (APG) | W3C | Recommendation (ARIA); APG is guidance | Roles, states, keyboard patterns for tabs, dialogs, grids, comboboxes | Not by itself; it is how you meet WCAG |
| EN 301 549 | ETSI/CEN/CENELEC | v3.2.1 (WCAG 2.1) is the legal reference; v4.1.1 (WCAG 2.2) published Sep 2026 | EU ICT accessibility requirements | Through EU law |
| European Accessibility Act (Directive 2019/882) | EU | Applies since 28 Jun 2025 | Consumer-facing products and services (e-commerce, banking, transport booking, e-books…) | Yes for in-scope consumer services; microenterprises exempt. B2B-only tools mostly out of scope, but anything you render inside a customer's consumer flow inherits their duty |
| Web Accessibility Directive (2016/2102) | EU | In force | Public-sector sites and apps | Public bodies only |
| CSS Color 4 / 5 | W3C | Color 4 Candidate Recommendation Draft (has `oklch()`); Color 5 Working Draft | Colour spaces and functions | Voluntary; sRGB hex is the safe default, OKLCH for building ramps |
| OpenType features (e.g. `tnum`) | ISO/IEC 14496-22 / Microsoft | Standard | Tabular figures, ligatures | Voluntary |
| HTML Custom Elements / Web Components | WHATWG | Living standard | Framework-free components | Voluntary |
| ISO 9241-110 / -210 | ISO | Standards | Interaction principles; human-centred design process | Voluntary (sometimes in procurement) |

## Community formats (de facto, not official standards)
- **DTCG Design Tokens format 2025.10** (W3C Community Group): first stable version. Its own text says it is
  "not a W3C Standard nor on the Standards Track". Still the right choice: Figma, Style Dictionary (v4, partial
  2025.10 support), Tokens Studio, Penpot, Supernova and zeroheight read it.
- **Open UI** (W3C Community Group): research on component anatomy and naming across systems; informs new
  HTML elements (e.g. customizable `<select>`). Useful for naming parts.

## Conventions (widely followed, nobody enforces)
Atomic Design (Brad Frost); three token tiers (primitive/semantic/component); semantic versioning; component
docs pattern (anatomy, states, do/don't, a11y notes, status); maturity models (Sparkbox Design System Maturity
Model); public checklists (designsystemchecklist.com); government systems as templates (GOV.UK Design System,
USWDS, Designers Italia: binding only on their public bodies).

## AI-readable design systems (2025–2026, real but young)
MCP (Model Context Protocol, now under the Linux Foundation's Agentic AI Foundation) servers ship from Figma
(Dev Mode MCP), Storybook (preview), GitHub Primer and shadcn/ui. `llms.txt` is a proposal, not a standard.
No formal standard for machine-readable component specs. Practical step: keep tokens in DTCG JSON and component
docs in plain Markdown in the repo; both are easy for agents to read.

## What this means for a new system
- **Must** (if in scope): WCAG 2.2 AA via the EAA/EN 301 549 for consumer-facing surfaces, including any
  challenge or block page you show end users (no cognitive puzzles: 3.3.8).
- **Should, by choice**: WCAG 2.2 AA everywhere, APG patterns per component, DTCG tokens, sRGB hex with
  documented contrast, `tnum` for data.
- **Convention**: everything else; pick it on purpose and write it down.
- Ship an **accessibility statement** and a **versioning/deprecation policy**; most first drafts forget both.

## Sources
W3C WCAG 2.2: https://www.w3.org/TR/WCAG22/ · WCAG 3: https://www.w3.org/TR/wcag-3.0/ · APG:
https://www.w3.org/WAI/ARIA/apg/ · DTCG: https://www.designtokens.org/ · Style Dictionary DTCG:
https://styledictionary.com/info/dtcg/ · EAA: https://eur-lex.europa.eu/eli/dir/2019/882/oj · EN 301 549:
https://www.etsi.org/ (search EN 301 549) · CSS Color 4: https://www.w3.org/TR/css-color-4/ · Open UI:
https://open-ui.org/ · Sparkbox maturity model: https://sparkbox.com/foundry/design_system_maturity_model ·
Design System Checklist: https://www.designsystemchecklist.com/ · GOV.UK: https://design-system.service.gov.uk/
· Designers Italia: https://designers.italia.it/
