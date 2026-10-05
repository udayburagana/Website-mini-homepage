# Operator Console Cinematic Design QA

## Evidence

- Spec: `docs/superpowers/specs/2026-10-01-operator-homepage-cinematic-design.md`
- Captures: `docs/qa/operator-cinematic/` — every pinned scene at 1440 × 900 (full mode), hero and loop at 1024 × 768 (flow), hero, capabilities and early access at 390 × 844 (static); device scale factor 1, live webfonts.
- References: the Visionary homepage (`?persona=visionary`) and elvalabs.ai.

## Findings

No actionable P0, P1 or P2 differences remain. Issues found and fixed during QA:

- **P1, contrast:** the early-access eyebrow rendered light blue on the cyan section, about 1.5:1. axe did not flag it because it cannot measure contrast over gradients. Fixed, and a computed-contrast test now covers gradient surfaces.
- **P1, layout:** the loop scene's grid collapsed into implicit columns because a generic rule outranked the loop's `closing` area. The 8-viewport geometry test caught it. Fixed.
- **P2, hierarchy:** the product mock's "Recognition feed" heading inherited the section display scale. Restored to product-UI scale.
- **P2, motion:** the category graph's nodes sat behind the pillar card. They now orbit the card on a stage-sized ellipse.
- **P2, spacing:** mobile heading rows inherited the desktop gap. Reset to 18px below 768px.

Other checks:

- **Copy:** identical to the committed source, character for character (fixture test).
- **Typography:** Space Grotesk display, matching Visionary's tight tracking, with Inter body. Geist was not used: the design system does not load it, so it would fall back to Arial.
- **Colour:** the Operator cyan family is kept, and `#38bdf8` stays the primary CTA. Per-card accents appear on borders, icon washes and rails only.
- **Responsive:** no horizontal overflow at 320–1920px. Pinned panels stay between the header and the viewport bottom at every full-mode anchor.

final result: passed

### Section revisions after review

- **Meet EzRewards (category):** cards no longer rise and fade at one central spot. Each pillar is centred on a vertex of an equilateral triangle sized from the stage; a stage change moves the card along the shared edge. Measured at 1280×800, 1317×880, 1440×900 and 1920×1080: all three sides equal, card centres within 0 px of their vertex. Evidence: `docs/qa/operator-cinematic/operator-category-*.png`.
- **How EzRewards works (loop):** replaced the rail-and-card layout with a stacked deck. Each step lands one header-height below the previous, so all five numbers and titles stay visible once stacked (asserted by `elementFromPoint` in the spec). Added text-free animated illustrations per step, also shown in the tablet and phone layouts. The stray decorative console (segments, lines, caret) was removed. The intro heading and copy now share one bottom line in every Operator section.
- **Responsive scenes (compact mode):** the animated scenes previously ran only on desktop; tablets, phones and short laptops now get single-column pinned versions of every scene (see the spec's "Compact mode"). Found during QA: full-mode `grid-area` names leaked into the single-column pin and created implicit columns, pushing the phone and cards off to the right; and scroll ranges measured from the sticky pin drifted by one stage because a stuck element reports shifted `offsetTop`. Both fixed (areas reset inside the pin; ranges measured from a static holder). Evidence: `docs/qa/operator-cinematic/operator-compact-*.png` at 390×844 and 768×1024.
- **Built for day-to-day use (capabilities):** three columns. Plain-text points on the left (no background or button shape; bold white when active), a phone mockup in the centre whose screen morphs a particle illustration per point, and the content on the right. Found during QA: the Company feed and AI Report Assistant shapes read as noise in the thinned software-GL render because their fills out-weighed their strokes; rebalanced toward strokes. Headless captures show the reduced tier (no bloom, half particles); GPU-rendered browsers show the full effect.

---

# Operator Capability Grid Design QA

## Evidence

- Source visual truth: `C:\Users\Uday\AppData\Local\Temp\codex-clipboard-d3077983-f625-4313-9309-dfdd38e49ab6.png`
- Desktop implementation: `C:\Users\Uday\Downloads\Website-mini-homepage-main\docs\qa\operator-capability-grid\operator-capabilities-implementation.png`
- Mobile implementation: `C:\Users\Uday\Downloads\Website-mini-homepage-main\docs\qa\operator-capability-grid\operator-capabilities-mobile.png`
- Side-by-side comparison: `C:\Users\Uday\Downloads\Website-mini-homepage-main\docs\qa\operator-capability-grid\operator-capabilities-comparison.png`
- Desktop comparison viewport: 1880 × 956 CSS px, device scale factor 1
- Source pixels: 1880 × 956
- Desktop implementation pixels: 1880 × 956
- Mobile implementation viewport and pixels: 390 × 844, device scale factor 1
- State: Operator personality selected; “Built for day-to-day use” capability section

The source and desktop implementation were normalized to identical pixel dimensions and placed side by side in one comparison image. A focused card-grid region was used because typography, icon treatment, and internal spacing are legible there; a separate mobile capture validates the responsive card stack.

## Findings

No actionable P0, P1, or P2 differences remain.

- **Fonts and typography:** The implementation preserves the existing EzRewards Space Grotesk/Inter hierarchy rather than copying the reference brand typeface. Card eyebrows, headings, and supporting copy remain clear at the denser four-column width with no clipping or truncation.
- **Spacing and layout rhythm:** Desktop uses four equal columns and a consistent visual-stage height, producing the requested four-card row. Equal card padding and aligned illustration stages give the grid the technical rhythm of the reference. Tablet and mobile reflow to two and one columns.
- **Colors and visual tokens:** The reference’s neon green technical emphasis is intentionally translated to EzRewards cyan and teal. Dark navy surfaces, cool borders, and the cyan highlighted AI card remain consistent with the Operator personality and maintain contrast.
- **Image quality and asset fidelity:** All eight illustrations use crisp local Phosphor SVG assets with no external runtime dependency. They are semantically matched to the card subject and remain sharp at desktop and mobile sizes.
- **Copy and content:** The eight existing card titles and paragraphs are unchanged. The section introduction is also unchanged.
- **Accessibility and interaction:** Illustrations are decorative and hidden from assistive technology. The card content does not depend on hover. Reduced-motion mode disables card movement.

## Comparison History

### Initial pass

- Source evidence: supplied Oxide technical card reference.
- Implementation evidence: `operator-capabilities-implementation.png` and the normalized side-by-side comparison.
- Findings: no P0/P1/P2 issues. The implementation intentionally retains the EzRewards section-scale heading and simplified product iconography rather than copying Oxide-specific interface data.
- Fixes required: none.

## Primary Interactions and Console

- Personality selector retained and Operator remains selected.
- Existing navigation and Join Waitlist controls remain visible.
- Responsive card layout checked at desktop, tablet, and mobile widths.
- Browser console warnings/errors: none.

## Follow-up Polish

- P3: Future product screenshots could replace the icon panels when production UI is finalized, adding more data density without changing the grid.

final result: passed
