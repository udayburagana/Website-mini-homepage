# EzRewards Visionary Homepage Design

## Objective

Create a personality-led EzRewards entry flow and a new Visionary homepage that makes employee recognition feel emotional, memorable, and culturally meaningful before explaining the platform.

## Experience flow

1. A first-time visit opens a full-viewport cream entry screen with EzRewards navigation, an editorial introduction, and three personality cards.
2. Visionary is the only selectable personality. Strategist and Operator remain visible as disabled “Coming soon” options.
3. Selecting Visionary enables “Continue as Visionary.” Activating it opens a full-screen branded loader.
4. The loader counts visibly from 0% to 100% over 2 seconds, then reveals the Visionary homepage.
5. A “Change experience” control returns to the personality selector without reloading the document.

## Visual direction

The experience uses the supplied Version 1.0 Visionary tokens: cream `#F2ECDD`, paper `#FDFCF6`, white, ink `#111111`, dark `#0B0D13`, lime `#C2F24A`, purple `#A78BFA`, yellow `#F7CF52`, coral `#F37C73`, and blue-violet `#7188FE`. Space Grotesk carries oversized editorial headings; Geist carries navigation, controls, and body copy. Cards use one-pixel ink borders, 16px corners, and hard four-to-five-pixel shadows. Decorative shapes and custom CSS illustrations provide the Neo Pop language without adding remote asset dependencies.

## Homepage narrative

The page follows the brief’s emotional sequence: Inspiration → Possibility → Transformation → Trust → Action.

- Navigation keeps Product, Platform, Pricing, Resources, and Book a Demo visible.
- The hero leads with “Build a workplace people never want to leave,” supported by a celebratory people-and-product composition.
- A dark problem section frames why annual recognition is insufficient.
- A cream transformation section introduces lasting employee moments.
- Lime Recognition, coral Rewards, and purple AI sections each use a distinct composition and a single dominant accent.
- Employee Moments and Platform Overview connect the emotional story to tangible product capabilities.
- Testimonials and pricing provide trust and conversion context without invented customer names, quotes, or prices; they are framed as product principles and plan flexibility.
- A lime final call to action and dark footer close the journey.

## Interaction and accessibility

All interactive controls provide keyboard focus and at least 44×44px targets. Disabled personality cards expose their status semantically. The loader uses a live region and progressbar semantics. Focus moves into the loader and then to the homepage heading as state changes. Motion uses opacity and transforms and collapses to near-instant transitions when `prefers-reduced-motion` is enabled, while still preserving a perceivable state change. The layout supports 320px through wide desktop widths without horizontal overflow.

## Architecture

The site remains dependency-free static HTML, CSS, and JavaScript. `Homepage.dc.html` contains the three top-level experience views and semantic homepage content. `site.css` owns responsive styling and motion. `site-ui.js` owns selection, progress, view switching, focus management, and existing shared navigation/form behavior. Playwright verifies the complete flow, timings, semantics, and responsive behavior.

## Validation

Automated browser tests cover the initial selector, disabled cards, Visionary selection, loader progress, two-second transition, homepage content, reset behavior, reduced-motion behavior, metadata, internal links, and horizontal overflow at supported viewport sizes. The final production build is deployed to a Vercel preview and smoke-tested at the returned URL.
