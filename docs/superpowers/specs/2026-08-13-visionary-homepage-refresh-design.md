# EzRewards Visionary Homepage Refresh Design

## Objective

Rebuild the Visionary personality homepage using the complete approved copy in the attached source file and the visual language defined by Figma node `2171:214`. The new page must feel like one coherent Visionary experience, not a collection of independently styled marketing blocks.

## Scope

The Visionary homepage will contain these sections in order:

1. Hero
2. The Problem
3. The Vision
4. Category Introduction
5. The Appreciation Loop
6. Product Capabilities
7. Outcomes
8. Early Access
9. Pricing
10. Frequently Asked Questions
11. Final CTA

The existing top navigation, personality selector, URL-based personality state, waitlist destinations, Strategist homepage, Operator homepage, and standalone Pricing page remain unchanged.

## Content Source of Truth

All visible Visionary copy comes from the user-provided text attachment. This includes headings, body copy, capability descriptions, pricing details, FAQ answers, CTAs, supporting lines, and the closing brand statement. The implementation may introduce semantic wrappers or short accessible labels, but it must not rewrite the supplied marketing copy.

## Visual System

Figma node `2171:214` is the strict visual reference. Its typography scale, text hierarchy, colors, section surfaces, card treatments, spacing rhythm, border styling, and responsive width constraints override the existing Visionary presentation where they conflict.

The implementation will:

- Preserve the dark Visionary identity and its approved accessible violet treatment.
- Match Figma heading, body, label, and card-title sizing through responsive CSS clamps.
- Reproduce the Figma maximum and minimum content widths for the Problem and Vision sections.
- Use consistent section gutters and vertical rhythm derived from the frame.
- Reuse the current Space Grotesk and Geist font system.
- Build any interface graphics with semantic HTML and CSS unless Figma exports a required image or icon asset.
- Download and commit any required Figma assets rather than depending on expiring remote URLs.

## Responsive Behaviour

Desktop and landscape-tablet layouts follow the Figma compositions and width constraints. Multi-column content collapses progressively at existing project breakpoints. Mobile places section introductions before their related cards, keeps CTA groups usable, and preserves a minimum 16px readable body size. The page must not overflow horizontally at 320px or above.

## Components and Interaction

- The personality selector remains a keyboard-accessible tablist and Visionary remains the default.
- Waitlist CTAs continue to use the existing contact/waitlist destination.
- Product exploration links use the existing Product route.
- The FAQ uses native disclosure semantics so each question works with pointer, keyboard, and assistive technology without additional JavaScript.
- Motion remains restrained and is disabled by the existing reduced-motion policy.

## Accessibility

The target is WCAG 2.2 AA. Heading order, landmarks, visible focus, color contrast, touch target size, semantic lists, disclosure controls, and responsive reflow must be preserved. No visual distinction may rely on color alone.

## Validation

Automated coverage will verify:

- The exact 11-section order and supplied copy.
- Visionary-only visual changes without regressions to Strategist, Operator, or the standalone Pricing page.
- Figma-derived desktop typography and width constraints.
- FAQ keyboard and semantic behaviour.
- No horizontal overflow at 320, 390, 768, 1024, and 1440 pixels.
- Zero Axe WCAG A/AA violations across desktop and mobile Visionary states.
- Existing routes, personality switching, navigation, and reduced-motion behaviour.

Visual QA will compare the rendered desktop and mobile implementation against the Figma reference before deployment.

## Deployment

After all tests and visual checks pass, the changes will be committed to `codex/personality-led-homepage`, pushed to GitHub, deployed to the existing Vercel production project, and smoke-tested at `https://website-mini-homepage.vercel.app/?persona=visionary`.

## Explicit Non-Goals

- No changes to Strategist or Operator content or design.
- No changes to the standalone Pricing page.
- No backend or waitlist API work.
- No new framework, animation library, or component dependency.
- No invented testimonials, statistics, or product claims.
