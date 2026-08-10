# EzRewards Strategist Homepage Design

## Goal

Add a complete Strategist personality homepage to the existing EzRewards personality-led homepage. Visionary remains unchanged. Selecting Strategist replaces every homepage section below the shared navigation and personality selector with a light, analytical experience.

## Experience architecture

- Keep `/` as the only personality homepage route.
- Keep the shared top navigation and personality selector visible across personality changes.
- Preserve `?persona=strategist`, browser history handling, local preference memory, keyboard tab behavior, and scroll position.
- Render separate Visionary and Strategist page containers. Only the selected container is exposed to assistive technology and interaction.
- Operator continues using its current interim experience until a dedicated design is supplied.

## Visual system

- White navigation and card surfaces.
- Pale blue-gray page and alternating section backgrounds.
- Dark navy headings and body text.
- Electric indigo for primary actions, selected states, links, chart marks, and highlighted headline phrases.
- Fine cool-gray borders, restrained blue-gray shadows, generous whitespace, and moderate rounded corners.
- Product visuals use accessible HTML/CSS dashboard cards, charts, tables, progress indicators, and insight panels. No decorative photography is required.
- Motion is limited to section reveals, card hover elevation, chart entrance, FAQ disclosure, and short personality transitions. Reduced-motion disables transforms and reveal delays.

## Content sequence

The Strategist container uses the supplied copy in this order:

1. Hero with leadership dashboard visual
2. Fragmented-recognition problem and four cards
3. Intentional-system vision and highlight statement
4. EzRewards category introduction and three capability pillars
5. Five-step appreciation loop
6. Eight product capabilities
7. Four stakeholder outcomes
8. Early-access invitation and benefits
9. $1-per-active-employee pricing
10. Ten accessible FAQ disclosures
11. Final waitlist CTA

Copy is preserved verbatim except for correcting broken punctuation and character encoding.

## Responsive behavior

- Desktop hero uses a balanced text/dashboard split matching the supplied reference.
- Tablet collapses dense four-column grids to two columns.
- Mobile stacks copy before visuals and uses one-column cards, full-width actions, and compact selector controls.
- No horizontal overflow is permitted at 320, 375, 768, 1024, or 1440 pixels.

## Conversion and navigation

- All conversion actions use “Join the Waitlist” and link to the existing `/contact` flow.
- “Explore the Product” links to `/product`.
- “See measurable outcomes” scrolls to the Strategist outcomes section.
- Shared Product, Pricing, About, Contact, and waitlist pages do not change.

## Accessibility and validation

- Personality selection remains a keyboard-operable tablist with accurate selected state.
- Hidden personality content is removed from focus and accessibility navigation.
- FAQ items use native disclosure behavior.
- Charts include textual summaries and never rely on color alone.
- Automated tests cover complete section order, supplied headline/copy, personality switching, CTA destinations, FAQ interaction, responsive overflow, reduced motion, and metadata updates.
