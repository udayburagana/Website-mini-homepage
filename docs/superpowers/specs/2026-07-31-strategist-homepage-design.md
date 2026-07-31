# EzRewards Strategist Homepage Design

## Objective

Add a second, fully independent Strategist journey to the existing EzRewards personality experience while preserving the Visionary journey and homepage unchanged.

The Strategist experience serves decision makers who need proof, clarity, ROI, governance, and implementation confidence. Its promise is: “I can measure, improve, and scale workplace culture with confidence.”

## Personality selection and routing

- The entry page offers two enabled cards:
  - Visionary: “Build cultures people never forget.”
  - Strategist: “I want to prove culture impact with clarity.”
- Operator remains disabled and marked “Coming soon.”
- Selecting a card sets a single in-page personality state and updates `aria-pressed`.
- The Continue button becomes enabled after either available card is selected.
- Continue opens the shared loader for exactly two seconds.
- The loader progresses from 0% to 100% for both personalities.
- Loader content and theme respond to the selected personality:
  - Visionary retains the current “Thinking like a Visionary” dark culture-first presentation.
  - Strategist uses a light enterprise presentation with indigo data cues and “Building your business case.”
- Completion reveals only the homepage associated with the selected personality.
- “Change experience” on either homepage returns to the entry view and focuses the previously selected card.

## Architecture

The existing static HTML, CSS, and JavaScript stack remains unchanged.

`Homepage.dc.html` contains three top-level experience views:

1. Shared entry selector
2. Shared, personality-aware loader
3. Two independent homepage containers:
   - Visionary homepage
   - Strategist homepage

`site-ui.js` owns the selected personality and maps it to:

- card pressed state
- loader class and copy
- destination homepage
- destination heading focus
- personality-specific reveal initialization

The two homepages use separate scoped class namespaces. Existing `.dark-visionary` styling and behavior are not rewritten. New Strategist styling is scoped beneath `.strategist-home`.

## Figma reference

Source: EzRewards website design, node `2108:118`; hero node `2101:62`.

The implementation follows the Figma hero:

- 1440px reference canvas
- 79px white navigation
- 60px horizontal hero padding
- 120px vertical hero padding
- two-column layout with approximately 648px editorial copy and 651px dashboard visual
- 68px desktop display type with 72px line height
- 20px body copy with 24px line height
- 52px CTA height and 8px radius
- headline: “Recognition leadership can measure. Culture your people can feel.”

The supplied written color requirements override any conflicting incidental Figma styling.

## Design system

### Color tokens

- Primary surface: `#F8FAFC`
- Card surface: `#FFFFFF`
- Tertiary surface: `#EEF2F7`
- Dark proof surface: `#0F172A`
- Primary text: `#111827`
- Secondary text: `#475569`
- Primary brand: `#4F46E5`
- Secondary brand/data: `#2563EB`
- Insight accent: `#06B6D4`
- Success: `#10B981`
- Warning: `#F59E0B`

### Typography

- Space Grotesk for display type, headings, titles, metrics, and KPI numbers.
- Geist for body copy, labels, controls, and navigation.
- Desktop display range: 56–80px, using the Figma hero’s 68px reference.
- Body range: 16–18px, with 20px reserved for the hero introduction.
- Sentence-case headings and restrained tracking.

### Components

- Cards: white, 16px radius, 1px slate border, soft shadow.
- Primary buttons: indigo background, light text, 8px radius.
- Secondary buttons: white background, indigo border.
- Ghost links: text-only blue or indigo treatment.
- Icons: outlined, rounded, two-pixel stroke, color used only for meaning.
- Charts: flat, labelled, accessible, and free of decorative gradients.
- Motion: 180–250ms interactions and 250–400ms section/chart reveals.

## Strategist homepage content

### 1. Hero

Purpose: establish measurable business value immediately.

- Eyebrow: “Culture intelligence platform”
- Heading: “Recognition leadership can measure. Culture your people can feel.”
- Supporting copy: measure recognition, understand engagement, reward performance, and give leadership complete visibility.
- Primary CTA: “Book a demo”
- Secondary CTA: “See measurable outcomes”
- Executive dashboard visual containing:
  - recognition participation
  - engagement index
  - rewards utilization
  - recognition trend
  - department comparison
  - an AI insight summary

### 2. Business challenge

Purpose: frame the operational and leadership problem.

Four cards:

- Engagement signals are fragmented.
- Retention risk appears too late.
- Recognition is inconsistent across teams.
- Manager adoption is difficult to sustain.

Each card pairs a concise business consequence with a labelled metric or status.

### 3. Solution framework

Purpose: show a connected, comprehensible operating model.

Four modules:

- Recognition
- Rewards
- Reports
- AI insights

A minimal workflow shows how moments become structured signals, leadership visibility, and informed action.

### 4. Culture analytics

Purpose: prove that EzRewards makes culture measurable.

The analytics section includes:

- KPI cards
- a labelled recognition trend chart
- department participation bars
- reward utilization donut
- a report summary table
- an accessible text summary for every chart

Example proof language:

- “Turn appreciation into measurable culture signals.”
- “Give leaders visibility without adding HR overhead.”

### 5. Implementation confidence

Purpose: reduce buying and operational risk.

Structured modules cover:

- guided onboarding
- role-based controls
- governance and budget rules
- integrations and data flow
- security and reliability
- staged rollout and adoption support

The section uses a restrained checklist and implementation timeline rather than celebratory illustration.

### 6. Executive proof and CTA

Purpose: support the internal business case and conversion.

- Dark executive contrast section using `#0F172A`
- Business-case outcomes and leadership-ready reporting
- Primary CTA: “Book a demo”
- Secondary CTA: “View reporting framework”
- Early-access language may appear as supporting copy, not as the only conversion path.

## Responsive behavior

- Desktop: Figma-aligned two-column hero and medium-density analytical layouts.
- Tablet: stacked hero copy/dashboard with two-column cards where space permits.
- Mobile: single-column hierarchy, scrollable data tables where necessary, compact charts with visible labels, and full-width CTAs.
- No horizontal page overflow at 320px or wider.
- Mobile navigation retains the current accessible expanded/collapsed behavior.

## Accessibility

- Charts include visible labels and equivalent text summaries.
- Semantic headings follow a logical order.
- Interactive controls have accessible names and clear focus styles.
- Personality selection uses `aria-pressed`.
- Loader exposes progress with `role="progressbar"` and `aria-valuenow`.
- Motion respects `prefers-reduced-motion`.
- Color is not the sole indicator of status.

## Testing and acceptance criteria

- Visionary selection still completes the existing two-second loader and reveals the unchanged Visionary homepage.
- Strategist card is enabled and Operator remains disabled.
- Strategist selection changes loader copy/theme and reveals only the Strategist homepage.
- Both loaders reach 100% in approximately two seconds.
- “Change experience” returns to the selector from either homepage.
- Strategist sections appear in the approved six-section sequence.
- Required Strategist tokens are defined exactly.
- Primary and secondary CTAs resolve to valid destinations.
- All four production routes retain metadata, landmarks, accessible navigation, and internal-link integrity.
- All tested responsive viewports have no horizontal overflow.
- The full Playwright suite passes before deployment.

## Scope exclusions

- No backend analytics, authentication, or persistence.
- No changes to the existing Product, About, or Contact page visual systems.
- No redesign of the Visionary homepage.
- No Operator homepage.
- No decorative character artwork, confetti, Neo-pop treatment, or heavy playful motion.
