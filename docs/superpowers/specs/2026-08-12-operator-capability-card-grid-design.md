# Operator Capability Card Grid Design

## Scope

Redesign only the “Built for day-to-day use” capability area of the Operator homepage. Preserve its section introduction and the complete eyebrow, title, and body copy of all eight capability cards. Visionary, Strategist, shared pages, navigation, personality switching, and conversion behavior remain unchanged.

## Layout

At desktop widths, the eight cards form a strict four-column, two-row grid. Each card uses the same internal structure and height so both rows align cleanly. The grid becomes two columns on tablet-sized screens and one column on narrow mobile screens, without horizontal overflow.

Each card contains:

1. A compact vector illustration stage.
2. The existing uppercase capability eyebrow.
3. The existing card title.
4. The existing supporting paragraph.

The illustration stage appears before the text and uses a consistent height so the text baselines remain orderly across the grid.

## Visual Direction

The cards interpret the supplied dark technical reference through the established Operator design system. They retain the near-black canvas, dark navy card surfaces, cool gray borders, cyan emphasis, and restrained teal secondary accent already used by the homepage.

The cards become denser and more technical than the current large two-column panels. Their vector stages resemble compact product-interface diagrams rather than decorative artwork. Card hover behavior is limited to a small upward movement and border emphasis; the content remains readable without hover.

The AI Report Assistant card can retain stronger cyan emphasis, but its text and vector illustration must continue to meet WCAG AA contrast.

## Vector Asset System

Use local SVG assets from an established open-source icon library rather than runtime CDN dependencies or hand-drawn glyph substitutes. Combine semantically appropriate icons into compact interface-style compositions using normal accessible markup and existing card surfaces.

The eight illustration concepts are:

1. **Peer recognition:** two people connected by a recognition signal.
2. **AI-assisted messages:** a message editor with an assistance sparkle.
3. **Company feed:** stacked activity items with reactions.
4. **Rewards catalogue:** a reward or gift selection interface.
5. **Direct assignment:** one-to-many recipient selection.
6. **Onboarding:** employee import through SSO or CSV.
7. **Culture reporting:** structured recognition activity charts.
8. **AI Report Assistant:** a question connected to a grounded report answer.

The vectors are decorative supplements to visible text, use empty alternative text or `aria-hidden="true"`, and never carry essential meaning alone.

## Responsive and Accessibility Behavior

- Four columns at large desktop widths.
- Two columns on tablet and compact desktop widths.
- One column on mobile.
- No horizontal overflow at 320px or wider.
- Logical DOM and reading order remain card 1 through card 8.
- Text contrast remains WCAG 2.2 AA compliant.
- Hover styling is paired with keyboard-visible focus behavior where applicable.
- Reduced-motion mode removes card movement while preserving all content.
- Decorative vectors remain hidden from assistive technology.

## Validation

Automated coverage will confirm:

- Exactly eight cards remain.
- Their approved copy is unchanged.
- Desktop computes four grid columns and two rows.
- Tablet computes two columns.
- Mobile computes one column without overflow.
- Every card contains one decorative local vector illustration.
- Operator desktop and mobile Axe scans return no WCAG A/AA violations.
- Existing personality, route, responsive, and accessibility suites continue to pass.

After local verification, commit the approved changes, push `codex/personality-led-homepage` to GitHub, deploy the same commit to the linked Vercel production project, and smoke-test all three personality URLs on the stable public domain.
