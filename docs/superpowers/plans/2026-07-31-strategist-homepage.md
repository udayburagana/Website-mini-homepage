# Strategist Homepage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a selectable Strategist personality with a tailored loader and a separate proof-first, responsive enterprise homepage while preserving the current Visionary journey.

**Architecture:** Keep the static HTML/CSS/JavaScript application and add one Strategist homepage view beside the existing Visionary view. Extend the existing UI controller with a selected-personality state that configures the shared loader and reveals the correct homepage. Scope all Strategist visuals beneath `.strategist-home` and use inline semantic HTML/CSS chart primitives so no new runtime dependencies are required.

**Tech Stack:** Semantic HTML, CSS custom properties and responsive layout, vanilla JavaScript, Playwright.

## Global Constraints

- Visionary selection, loader, homepage markup, styling, and interactions remain functional.
- Operator remains disabled.
- Strategist surfaces use `#F8FAFC`, `#FFFFFF`, `#EEF2F7`, and `#0F172A`.
- Strategist accents use `#4F46E5`, `#2563EB`, `#06B6D4`, `#10B981`, and `#F59E0B`.
- Space Grotesk is used for display, headings, titles, and data; Geist is used for body and labels.
- Primary content containers are fluid and capped at 1440px; section backgrounds remain full-bleed.
- Loader duration remains 2000ms and exposes 0–100% progress.
- Charts are labelled and include accessible text summaries.
- Motion respects `prefers-reduced-motion`.
- No new dependencies, backend services, or changes to Product, About, or Contact page visual systems.

---

### Task 1: Personality-aware flow tests and controller

**Files:**
- Modify: `tests/site.spec.mjs`
- Modify: `Homepage.dc.html`
- Modify: `site-ui.js`

**Interfaces:**
- Consumes: `[data-personality]`, `[data-enter-visionary]`, `[data-experience-view]`, and the existing progressbar.
- Produces: `selectedPersonality: "visionary" | "strategist"`, loader elements marked with `[data-loader-kicker]`, `[data-loader-personality]`, and `[data-loader-message]`, plus homepage views named `visionary-home` and `strategist-home`.

- [ ] **Step 1: Write the failing Strategist flow tests**

Add a test that:

```js
await page.goto("/");
const strategist = page.locator('[data-personality="strategist"]');
await expect(strategist).toBeEnabled();
await expect(page.locator('[data-personality="operator"]')).toBeDisabled();
await strategist.click();
await expect(strategist).toHaveAttribute("aria-pressed", "true");
await page.locator("[data-enter-visionary]").click();
await expect(page.locator("[data-loader-personality]")).toHaveText("Strategist.");
await expect(page.locator("[data-loader-message]")).toContainText("business case");
await expect(page.locator('[data-experience-view="strategist-home"]')).toBeVisible({ timeout: 2600 });
await expect(page.locator('[data-experience-view="visionary-home"]')).toBeHidden();
```

Retain a separate Visionary test proving its current copy and destination.

- [ ] **Step 2: Run the two flow tests and verify the Strategist case fails**

Run:

```powershell
node_modules\.bin\playwright.cmd test --grep "Visionary experience flow" --workers=1
```

Expected: Strategist fails because its card is disabled and no Strategist view exists; Visionary continues to pass.

- [ ] **Step 3: Add personality-aware markup**

In `Homepage.dc.html`:

- remove `disabled` from the Strategist card
- set its visitor-facing copy to “I want to prove culture impact with clarity.”
- change its status to “Available now”
- add loader data hooks without changing the progressbar structure
- rename the existing homepage view value from `home` to `visionary-home`
- add an initially hidden empty Strategist view with `data-experience-view="strategist-home"`

- [ ] **Step 4: Extend the controller**

In `site-ui.js`:

```js
let selectedPersonality = null;
const personalityButtons = [...document.querySelectorAll("[data-personality]")];

const loaderContent = {
  visionary: {
    kicker: "Shaping your experience",
    personality: "Visionary.",
    message: "Preparing a more human way to see recognition."
  },
  strategist: {
    kicker: "Preparing your evidence",
    personality: "Strategist.",
    message: "Building your business case with clear culture signals."
  }
};
```

Update selection so only the chosen enabled card has `aria-pressed="true"`. On Continue, apply the appropriate loader class/content, run the existing 2000ms progress loop, reveal `${selectedPersonality}-home`, initialize that homepage, and focus its `h1`.

- [ ] **Step 5: Run the flow tests**

Expected: both personality journeys pass and each reveals only its associated homepage.

- [ ] **Step 6: Commit**

```powershell
git add Homepage.dc.html site-ui.js tests/site.spec.mjs
git commit -m "Add Strategist personality journey"
```

### Task 2: Strategist semantic homepage and proof modules

**Files:**
- Modify: `Homepage.dc.html`
- Modify: `tests/site.spec.mjs`

**Interfaces:**
- Consumes: the empty `[data-experience-view="strategist-home"]` container from Task 1.
- Produces: six ordered `[data-strategist-section]` sections: `hero`, `business-challenge`, `solution-framework`, `analytics`, `implementation`, and `proof`.

- [ ] **Step 1: Write failing narrative and accessibility tests**

Test the exact sequence:

```js
expect(await page.locator("[data-strategist-section]").evaluateAll((nodes) =>
  nodes.map((node) => node.dataset.strategistSection)
)).toEqual([
  "hero",
  "business-challenge",
  "solution-framework",
  "analytics",
  "implementation",
  "proof"
]);
```

Assert the exact hero heading, four solution module labels, labelled charts, accessible chart summaries, implementation headings, and `/contact` CTA destinations.

- [ ] **Step 2: Run the Strategist narrative tests and verify they fail**

Run:

```powershell
node_modules\.bin\playwright.cmd test --grep "Strategist homepage" --workers=1
```

Expected: failure because the Strategist container is empty.

- [ ] **Step 3: Build the Strategist header and hero**

Add:

- white sticky navigation with Product, How It Works, Analytics, Implementation, About, Change experience, and Book a demo
- Figma-aligned two-column hero
- exact heading “Recognition leadership can measure. Culture your people can feel.”
- primary `/contact` CTA and secondary `#measurable-outcomes` CTA
- semantic executive dashboard with KPI cards, labelled trend bars, department comparison, rewards utilization, and AI insight

- [ ] **Step 4: Build business challenge and solution framework**

Add four challenge cards for engagement, retention, consistency, and manager adoption. Add a connected four-module framework for Recognition, Rewards, Reports, and AI insights using outlined inline SVG icons with `aria-hidden="true"` and explanatory copy.

- [ ] **Step 5: Build analytics**

Add KPI cards, a labelled recognition trend, department participation bars, a CSS conic-gradient donut with visible numeric label, and a semantic report summary table. Include visually available summaries such as “Recognition participation rose from 61% to 78% over six months.”

- [ ] **Step 6: Build implementation confidence and proof**

Add a four-stage implementation timeline, governance/security cards, control checklist, and a dark executive proof section with “Book a demo” and “View reporting framework” CTAs.

- [ ] **Step 7: Run the narrative tests**

Expected: all Strategist homepage structure, copy, accessibility, and link assertions pass.

- [ ] **Step 8: Commit**

```powershell
git add Homepage.dc.html tests/site.spec.mjs
git commit -m "Build Strategist proof-first homepage"
```

### Task 3: Strategist design system, responsive layout, and motion

**Files:**
- Modify: `site.css`
- Modify: `site-ui.js`
- Modify: `tests/site.spec.mjs`

**Interfaces:**
- Consumes: `.strategist-home`, `[data-strategist-reveal]`, and semantic chart classes from Task 2.
- Produces: exact `--st-*` CSS tokens and `initStrategistExperience()` reveal/count-up behavior.

- [ ] **Step 1: Write failing token and responsive tests**

Assert these literal declarations exist:

```text
--st-surface-primary: #f8fafc
--st-surface-secondary: #ffffff
--st-surface-tertiary: #eef2f7
--st-surface-dark: #0f172a
--st-text-primary: #111827
--st-text-secondary: #475569
--st-brand-primary: #4f46e5
--st-brand-secondary: #2563eb
--st-brand-accent: #06b6d4
--st-success: #10b981
--st-warning: #f59e0b
```

Add a 1920px viewport assertion verifying `.strategist-container` is no wider than 1440px and centered. Add Strategist overflow checks at 1440×900, 1024×768, 768×1024, 390×844, and 320×568.

- [ ] **Step 2: Run the design-system tests and verify they fail**

Expected: missing token declarations and Strategist layout.

- [ ] **Step 3: Add scoped Strategist tokens and components**

Append CSS beneath `.strategist-home` using:

```css
.strategist-container {
  width: min(100% - (2 * var(--st-gutter)), 1440px);
  margin-inline: auto;
}
```

Implement white 16px cards, 1px slate borders, soft shadows, 8px buttons, structured type scale, flat charts, and outlined icon containers.

- [ ] **Step 4: Add fluid responsive behavior**

- keep full-bleed section backgrounds
- stack the hero below 1050px
- switch analytical grids from four to two to one columns
- make the report table horizontally scrollable inside its own labelled region
- collapse navigation using the existing menu behavior below 768px
- ensure all CTAs become full-width where appropriate below 480px

- [ ] **Step 5: Add purposeful motion**

Create `initStrategistExperience()`:

- reveal `[data-strategist-reveal]` with IntersectionObserver
- animate KPI numbers only when visible and only when they declare numeric `data-kpi-target`
- immediately show final values when reduced motion is enabled
- initialize once with a `data-motion-ready` guard

- [ ] **Step 6: Run token, flow, responsive, and reduced-motion tests**

Expected: all focused tests pass.

- [ ] **Step 7: Commit**

```powershell
git add site.css site-ui.js tests/site.spec.mjs
git commit -m "Style responsive Strategist experience"
```

### Task 4: Regression, visual QA, and deployment

**Files:**
- Verify: all production files
- Modify only if verification identifies a defect

**Interfaces:**
- Consumes: completed dual-personality site.
- Produces: green test suite, committed branch, and public Vercel preview.

- [ ] **Step 1: Run the full automated suite**

```powershell
node_modules\.bin\playwright.cmd test --workers=2
```

Expected: every test passes with zero failures.

- [ ] **Step 2: Capture visual QA screenshots**

Capture:

- selector with both active cards
- Strategist loader
- Strategist desktop full page at 1440×900
- Strategist wide layout at 1920×1080
- Strategist mobile full page at 390×844
- Visionary desktop hero regression screenshot

Inspect for clipping, unreadable labels, card imbalance, overflow, and unintended Visionary changes.

- [ ] **Step 3: Run a fresh final suite after any visual fixes**

Expected: every test passes with zero failures.

- [ ] **Step 4: Push the feature branch**

```powershell
git push -u origin codex/strategist-homepage
```

- [ ] **Step 5: Verify Vercel**

Confirm the branch deployment state is `READY`. Run the remote selector → Strategist loader → Strategist homepage flow, confirm progress reaches 100%, the public response is HTTP 200, the mobile document has no horizontal overflow, and the browser console has no errors.

## Plan self-review

- The six approved homepage sections are implemented and tested.
- Figma hero dimensions are translated into a fluid 1440px maximum container.
- Both personality journeys, loader variants, accessibility, responsive behavior, and reduced motion are explicitly covered.
- The plan contains no backend, authentication, Operator homepage, unrelated page redesign, or new dependency.
