# EzRewards Onboarding Flow Design

## Goal

Create a frontend-only onboarding journey that visually belongs to the dark Visionary marketing experience and implements the accessibility and usability improvements identified in the UX audit. The flow must be testable without a backend: any non-empty email and password combination allows the user to continue.

## Visual direction

- Use Space Grotesk for headings and titles and Inter for body copy, labels, controls, and helper text.
- Reuse the Visionary navy surfaces and violet, orchid, and coral accent colors already defined in `site.css`.
- Keep the presentation calm and premium: high-contrast type, restrained glow, translucent elevated panels, fine borders, and subtle grid/radial background treatments.
- Use violet for primary actions and current progress. Success, warning, error, focus, and disabled states must remain visually distinct.

## Information architecture

Add a dedicated `/onboarding` entry point implemented as a single semantic HTML document with progressively disclosed panels:

1. **Sign in** — email, password, password reveal, inline validation, authentication bypass.
2. **Welcome** — explains the setup journey, expected time, and what information is needed.
3. **Organization** — organization name, company size, website, country, and timezone.
4. **Administrator** — name, role, work email, and optional phone number.
5. **Recognition preferences** — program goal, launch timing, and initial reward approach.
6. **Review** — grouped summary with Edit actions for previous sections.
7. **Complete** — confirms setup, explains the next step, and provides a return-home action.

The header shows the EzRewards brand, a step count, and a progress bar. Back and Continue remain in a consistent action region. Entered data is retained in memory while moving between steps but is not sent or persisted.

## Interaction and validation

- Sign-in accepts any non-empty, syntactically valid email and any non-empty password.
- Required fields use persistent labels and textual required indicators.
- Continue validates the current step only. Errors appear beside fields and in a focusable summary at the top of the form.
- Focus moves to the step heading after successful navigation and to the error summary after failed validation.
- Back preserves values. Edit actions on Review return to the relevant step.
- Save and exit returns to the marketing homepage after warning that information is not saved, because no persistence layer exists.
- Completion is an explicit page state rather than a toast.

## Accessibility and responsive behavior

- Semantic landmarks, headings, fieldsets, legends, labels, descriptions, `aria-invalid`, live status text, and clear focus indicators.
- Minimum 44px interactive targets and readable body/input text.
- Color never acts as the only status indicator.
- Desktop uses a split layout with contextual guidance; tablet and mobile collapse to a single column without reordering form controls.
- The flow supports keyboard-only use, 200% zoom, and reduced-motion preferences.

## Technical design

- `Onboarding.dc.html`: semantic page structure and all step panels.
- `onboarding.css`: scoped onboarding tokens, layout, components, states, and responsive behavior.
- `onboarding.js`: state, validation, navigation, review rendering, focus management, and authentication bypass.
- `vercel.json`: `/onboarding` rewrite.
- `tests/onboarding.spec.mjs`: Playwright journey, validation, retention, keyboard, and mobile checks.
- `tests/accessibility.spec.mjs`: include the onboarding page in automated axe coverage.

No framework, authentication provider, API, storage, analytics, or backend integration is introduced.

## Acceptance criteria

- The public `/onboarding` route loads with the Visionary visual system.
- Any valid email plus any non-empty password advances to the welcome step.
- The full journey works forward and backward, retains in-memory values, and reaches completion.
- Invalid fields show specific, accessible errors and prevent navigation.
- Review reflects entered values and provides working Edit actions.
- Mobile and desktop layouts are usable without horizontal page scrolling.
- Existing tests remain green; new onboarding and accessibility tests pass.
- Visual QA has no unresolved P0, P1, or P2 issues.
