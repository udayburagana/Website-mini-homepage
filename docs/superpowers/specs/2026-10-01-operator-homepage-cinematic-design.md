# EzRewards Operator Homepage — Console Cinematic Design

## Objective

Rebuild the Operator personality homepage so its style, layout, look and feel, and motion match the cinematic Visionary homepage and the reference site elvalabs.ai, while keeping every word of the approved Operator copy unchanged.

## Scope

- **In scope:** the Operator `<main data-persona-page="operator">` in `Homepage.dc.html`, its new stylesheet and engine, the shared smooth-scroll layer, the build script, and the Operator tests.
- **Out of scope:** Visionary, Strategist, Creative Culture Builder and default personas; `/pricing`; any copy change.
- **Imagery:** procedural only. No raster backdrops; depth comes from CSS gradients, masked grids, glow rings, canvas-2D scenes and the existing HTML product mock.

The section order is unchanged: hero, problem, vision, category, loop, capabilities, outcomes, early-access, pricing, faq, final-cta.

## Copy contract

The visible Operator text is frozen in `tests/fixtures/operator-copy.txt` (9,526 characters, extracted from the committed `Homepage.dc.html`). `tests/operator-cinematic.spec.mjs` compares the live DOM text against it both before the engine loads and in full cinematic mode, with engine-generated controls excluded. Markup changes are limited to attributes, one decorative hero light, one text-free loop console and a wrapper around the Vision scene.

Engine-generated rail tabs reuse existing card labels as their accessible names. Their step numbers are `aria-hidden` decoration, so no new copy reaches assistive technology.

## Architecture

| File | Role |
| --- | --- |
| `operator-cinematic.css` | Visual system for every mode, plus scene layouts keyed on `data-operator-mode` |
| `operator-cinematic.js` | Mode arbiter and 12 scene controllers, each with setup and teardown |
| `operator-anchors.mjs` | Dependency-free anchor arrays and mode function, imported directly by tests |
| `cinematic-smooth-scroll.js` | Shared Lenis manager; personas register claims instead of toggling one instance against each other |
| `visionary-smooth-scroll.js` | Re-export shim so Visionary modules keep their import paths |
| `scripts/build-cinematic.mjs` | One esbuild call with code splitting, a per-file and total gzip budget, and consolidated licences |

### Modes

`operatorMode()` returns `static` for reduced motion or an inactive persona; `full` at `(min-width:1200px) and (min-height:760px)` (the desktop multi-column scenes); `compact` at `(min-height:560px)` for everything else, which is tablets, phones and short laptops; and `flow` (normal layout with reveals) only for viewports too short to pin a stage under the header, such as landscape phones. Lenis smooth scroll runs only in `full` with a fine pointer. CSS keys scene layout on the attribute the engine writes, not on duplicated media queries, so CSS and JS cannot disagree about the mode.

**Compact mode.** The scroll-driven scenes are preserved in single-column layouts. The section intro scrolls normally; the engine then moves the stage (rail, phone, list) into a sticky pin inside a static holder whose height provides the scroll range, and the same ScrollTrigger progress drives the scene. Per scene: the problem cards pile up as they arrive; vision keeps its three beats; category draws the triangle in a band with the card beneath it; the workflow deck stacks full-width cards; capabilities becomes a horizontal strip of plain-text points, the sticky phone, then the content; outcomes draws the mesh above the card; early-access ticks animate in sequence when the list scrolls into view (no pin). Scroll positions are measured from the static holder, never from the sticky pin, because a stuck element reports shifted offsets.

### `site-ui.js` integration

Operator opts out of the shared `initSteppers`, `initStickyStacks` and `initSelectablePanels` enhancers. Those enhancers rewrote Operator's authored DOM: the capability grid was removed and rebuilt as four synthetic tabs, and step list items were hidden. The `data-persona-section` aliases that every persona relies on are unchanged. The shared sticky-stack test now runs on the default persona.

## Scene design

| Section | Analogue | Full-mode behaviour | Static / flow fallback |
| --- | --- | --- | --- |
| Hero | Visionary depth hero | Console boot sequence once per session, pointer tilt, scroll-driven de-tilt and light parallax | Final state, no motion |
| Problem | Visionary problem cards | Pinned; four cards rise into a fanned row, then align | 4 / 2 / 1-column grid |
| Vision | Vision manifesto | Pinned; question, answer and principle arrive in three beats, then the principle settles onto its cyan shadow | All visible |
| Category | Meet EzRewards | Pinned three-tab rail; each pillar card is centred on a vertex of an equilateral triangle drawn on canvas, and travels along the edge to the next vertex on a stage change | 3-column grid |
| Loop | How it works | Pinned; no rail. Steps stack into a deck as the page scrolls, each landing one header-height below the last so every earlier step keeps its number, title and label visible. Each card carries a text-free animated illustration of its step | 5 / 2 / 1-column grid with the same illustrations |
| Capabilities | Built for participation / Meet EzRewards constellation | Pinned, three columns: the eight points as plain text (bold and white when active, still a tablist), a phone mockup whose screen morphs a three.js particle illustration per point, and the active point's content | 4 / 2 / 1-column grid with icon visuals |
| Outcomes | Culture sphere | Pinned four-tab rail over a canvas mesh that widens ring by ring | 4-column grid |
| Early access | Early-access gateway | Pinned; benefits checked off in sequence under a light sweep | All ticks drawn |
| Pricing | Pricing reveal | One reveal on entry: columns split from a seam and features stagger. No numeric count-up, so the price never displays as anything but the approved "$1" | Final state |
| FAQ | FAQ motion | Height and opacity animation on native `<details>` | Native toggle |
| Final CTA | Final CTA convergence | Canvas signal pulse resolving into a drawn horizon line | Static |

Only the capability phone uses three.js (`operator-phone-particles.js`), and it reuses the Visionary constellation technique: shapes assembled from weighted stroke and fill primitives, angle-sorted so every particle has a partner in every shape, morphed in the vertex shader with additive glow and bloom. Because Visionary already ships three.js, code splitting puts it in the shared chunk and Operator's own engine stays at about 11 KiB gzip. If WebGL is unavailable the phone is removed and the icon visuals return beside the content (`data-render-state="fallback"`); on software GL the phone drops bloom and runs at 1× pixel ratio, and a frame-time guard thins the particles if frames stay slow. Category, Outcomes and the final CTA use canvas-2D, which needs no fallback artwork.

## Accessibility

- Hidden stage panels use `visibility:hidden` together with `aria-hidden` and `inert`, never partial opacity. axe measures contrast through partial opacity, so mid-fade text would fail.
- Rails are `role="tablist"` with arrow, Home and End keys. Activating a tab scrolls the page to that stage's anchor.
- When list items become tabpanels, the list gets `role="presentation"` so the list structure stays valid.
- Every canvas and decorative element is `aria-hidden`.
- axe returns "incomplete" for contrast over gradient backgrounds. A dedicated test therefore computes WCAG contrast for key text against the worst-case gradient stop. That test caught a real light-on-cyan eyebrow during QA.
- Under reduced motion the engine runs in static mode, and every animation and transition under `.operator-home` is disabled.

## Verification

- `tests/operator-cinematic.spec.mjs`: 22 tests covering copy fixture, anchor maths, mode matrix, scroll-to-stage sync for all four rails, keyboard navigation, sticky pinning, reduced-motion completeness, persona-switch teardown, FAQ semantics, network isolation, mid-scene axe, gradient contrast, and an 8-viewport geometry sweep.
- Updated: `tests/site.spec.mjs` (Operator visual system and capability grid), `tests/persona-redesign.spec.mjs` (sticky stacks moved to default; Operator engine test added).
- Visual QA evidence: `docs/qa/operator-cinematic/`.
