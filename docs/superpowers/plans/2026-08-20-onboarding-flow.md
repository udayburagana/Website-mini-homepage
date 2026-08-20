# EzRewards Onboarding Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and publish a responsive, accessible, frontend-only EzRewards onboarding journey from sign-in through completion.

**Architecture:** A dedicated static `/onboarding` document contains seven progressively disclosed semantic panels. A scoped stylesheet reuses the existing Visionary tokens, while a focused JavaScript module owns in-memory form state, current-step validation, review rendering, and focus management.

**Tech Stack:** HTML5, CSS custom properties and responsive layout, vanilla JavaScript, Playwright 1.61.1, axe-core, Vercel static hosting.

**Spec:** `docs/superpowers/specs/2026-08-20-onboarding-flow-design.md`

## Global Constraints

- Use Space Grotesk for headings and titles and Inter for body copy, labels, controls, and helper text.
- Reuse the Visionary navy surfaces and violet, orchid, and coral accent colors already defined in `site.css`.
- Authentication is frontend-only: any syntactically valid, non-empty email and any non-empty password proceed without an API call.
- Keep all entered values in memory only; do not use cookies, local storage, session storage, analytics, or network requests.
- Required errors must be visible beside fields and in a focusable summary; navigation must move focus predictably.
- Support keyboard-only use, 200% zoom, reduced motion, and widths from 320px through 1440px without horizontal page scrolling.

---

### Task 1: Route and end-to-end journey contract

**Files:**
- Create: `tests/onboarding.spec.mjs`
- Modify: `tests/server.mjs`
- Modify: `vercel.json`

**Interfaces:**
- Produces: `/onboarding` route resolving to `Onboarding.dc.html`.
- Produces: test contract for `[data-onboarding-form]`, `[data-step]`, `[data-next]`, `[data-back]`, `[data-review]`, and `[data-complete]`.

- [ ] **Step 1: Write failing Playwright tests**

Add tests that assert `/onboarding` resolves, sign-in rejects invalid input, valid credentials advance, the seven step headings appear in order, Back preserves values, Review shows entered values, Edit returns to Organization, and completion is reached.

- [ ] **Step 2: Run the focused test and verify failure**

Run: `npx playwright test tests/onboarding.spec.mjs --project=chromium`

Expected: FAIL because `/onboarding` returns 404 and the onboarding document does not exist.

- [ ] **Step 3: Add static-server and Vercel rewrites**

Map `/onboarding` to `/Onboarding.dc.html` in both route maps.

- [ ] **Step 4: Re-run the focused test**

Expected: Route checks progress beyond 404; UI assertions remain red until Task 2.

### Task 2: Semantic onboarding document and branded responsive surface

**Files:**
- Create: `Onboarding.dc.html`
- Create: `onboarding.css`
- Test: `tests/onboarding.spec.mjs`

**Interfaces:**
- Produces: seven `<section data-step="N">` panels with stable IDs and headings.
- Produces: form control names `email`, `password`, `organizationName`, `companySize`, `website`, `country`, `timezone`, `adminName`, `adminRole`, `adminEmail`, `phone`, `programGoal`, `launchTiming`, and `rewardApproach`.
- Produces: `.onboarding-shell`, `.onboarding-panel`, `.field`, `.choice-card`, `.error-summary`, `.step-progress`, and `.onboarding-actions` style contracts.

- [ ] **Step 1: Implement semantic HTML**

Create metadata, skip link, branded header, progress UI, contextual aside, all seven panels, persistent labels, descriptions, review groups, completion state, and script/style references.

- [ ] **Step 2: Implement the Visionary visual system**

Use scoped `--ob-*` tokens derived from `--dv-*`, Space Grotesk headings, Inter controls, elevated navy panels, violet primary actions, high-contrast borders, 44px targets, `:focus-visible`, responsive single-column layout below 840px, and reduced-motion overrides.

- [ ] **Step 3: Run structural tests**

Run: `npx playwright test tests/onboarding.spec.mjs --grep "loads|semantic|responsive"`

Expected: structural and overflow assertions PASS; behavior assertions remain red until Task 3.

### Task 3: State, validation, navigation, and review behavior

**Files:**
- Create: `onboarding.js`
- Test: `tests/onboarding.spec.mjs`

**Interfaces:**
- Produces: `showStep(index, options)`, `validateStep(index)`, `collectState()`, `renderReview()`, and `setPasswordVisibility(visible)` internal functions.
- Consumes: the stable data attributes and control names defined in Task 2.

- [ ] **Step 1: Verify journey tests fail for missing behavior**

Run: `npx playwright test tests/onboarding.spec.mjs --grep "sign-in|retains|review|complete"`

Expected: FAIL because buttons do not navigate or validate.

- [ ] **Step 2: Implement current-step validation**

Use native validity plus specific messages. Set `aria-invalid`, connect each invalid field to its message, populate the error summary with links, and focus the summary after failed submission.

- [ ] **Step 3: Implement in-memory navigation**

Update panel visibility, step count, progress width, contextual copy, document title, and focus. Preserve values naturally in the DOM. Make Back, Continue, Enter submission, and password visibility work.

- [ ] **Step 4: Implement review and completion**

Render grouped text-only summaries from form values, wire Edit buttons to their source steps, and show the explicit completion state after confirmation.

- [ ] **Step 5: Run the focused journey suite**

Run: `npx playwright test tests/onboarding.spec.mjs`

Expected: all onboarding journey tests PASS.

### Task 4: Accessibility, metadata, responsive, and offline regression coverage

**Files:**
- Modify: `tests/accessibility.spec.mjs`
- Modify: `tests/site.spec.mjs`
- Modify: `sitemap.xml`
- Test: `tests/onboarding.spec.mjs`

**Interfaces:**
- Consumes: public `/onboarding` route.
- Produces: axe checks at 1440×900 and 390×844, metadata/canonical checks, sitemap coverage, offline rendering, keyboard/focus assertions, and 320/390/768/1024/1440 overflow checks.

- [ ] **Step 1: Add failing cross-cutting checks**

Add onboarding to metadata routes, sitemap assertions, offline route checks, reduced-motion checks, and axe targets. Add keyboard tests confirming focus enters the new heading after navigation and enters the error summary after invalid submission.

- [ ] **Step 2: Run cross-cutting tests and inspect failures**

Run: `npx playwright test tests/accessibility.spec.mjs tests/site.spec.mjs tests/onboarding.spec.mjs`

Expected: any missing metadata, contrast, focus, or route issue is reported precisely.

- [ ] **Step 3: Fix only the reported onboarding issues**

Adjust markup, color tokens, accessible descriptions, or behavior without refactoring unrelated marketing pages.

- [ ] **Step 4: Run the complete suite**

Run: `npm test`

Expected: all existing and onboarding tests PASS.

### Task 5: Visual QA, branch publication, and preview deployment

**Files:**
- Modify: `design-qa.md`
- Create: `docs/qa/onboarding/onboarding-desktop.png`
- Create: `docs/qa/onboarding/onboarding-mobile.png`

**Interfaces:**
- Produces: `design-qa.md` with `final result: passed`.
- Produces: pushed branch `codex/onboarding-flow` and public Vercel preview URL.

- [ ] **Step 1: Run the app and capture desktop/mobile states**

Capture sign-in, a form step, review, and completion at 1440×900 and 390×844. Inspect spacing, clipping, focus, contrast, hierarchy, and form density.

- [ ] **Step 2: Complete blocking design QA**

Record findings in `design-qa.md`; fix every P0/P1/P2 issue and repeat capture until the file says `final result: passed`.

- [ ] **Step 3: Verify the final diff and test evidence**

Run: `git diff --check`, `git status --short`, and `npm test`.

Expected: no whitespace errors, only onboarding-scoped changes, complete suite PASS.

- [ ] **Step 4: Commit and push**

Stage only the approved onboarding, route, test, QA, sitemap, spec, and plan files. Commit with `feat: add accessible onboarding flow`, then push `codex/onboarding-flow` to `origin`.

- [ ] **Step 5: Deploy and verify preview**

Run a Vercel preview deployment from the branch, open `/onboarding`, rerun the critical sign-in-to-completion smoke test against the public URL, and report its READY URL and commit SHA.
