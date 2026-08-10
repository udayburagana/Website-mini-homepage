# EzRewards Operator Homepage Design

## Goal

Add a complete Operator personality homepage to the shared EzRewards homepage. Selecting Operator replaces all homepage content below the shared selector with a dark operational experience; Visionary and Strategist remain unchanged.

## Experience architecture

- Keep `/` and the existing `?persona=operator` state contract.
- Add a dedicated `[data-persona-page="operator"]` container with 11 sections.
- Keep shared navigation, selector, local preference, keyboard tab behavior, and scroll position.
- Only the selected personality page is visible, focusable, and exposed to assistive technology.

## Visual system

- Near-black canvas, dark navy elevated panels, white headings, and muted blue-gray body text.
- Bright cyan primary actions, active states, highlighted phrases, operational charts, and workspace controls.
- Teal status indicators communicate healthy or completed states with accompanying text.
- Compact admin interfaces, workflow cards, wallet panels, structured reports, and practical controls provide the primary visual language.
- Motion is limited to reveals, short card elevation, chart entrance, and personality transitions; reduced motion removes transforms and delays.

## Content sequence

Use the supplied Operator copy, correcting only character encoding:

1. Hero and admin workspace
2. Operational problem and four cards
3. Simpler-workflow vision
4. Category introduction and three pillars
5. Five-step operational workflow
6. Eight product capabilities
7. Four stakeholder outcomes
8. Early-access invitation
9. $1 active-seat pricing
10. Eleven FAQ disclosures
11. Final waitlist CTA

## Responsive and accessibility requirements

- Desktop hero uses the reference text/workspace split; tablet and mobile stack copy before interface visuals.
- Dense grids collapse from four to two to one column without horizontal overflow at 320px or above.
- FAQs use native disclosures; charts have readable text summaries; status colors never carry meaning alone.
- All conversion actions use “Join the Waitlist” and link to `/contact`.

## Verification and release

- Add Playwright coverage for container isolation, section order, supplied copy, destinations, FAQ interaction, visual tokens, reduced motion, and responsive overflow.
- Compare 1440px Hero and Daily Operation captures against the supplied references and resolve all P0–P2 differences.
- Push the verified commits to `codex/personality-led-homepage` and create a fresh Vercel preview deployment.
