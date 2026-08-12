# Operator Capability Card Grid Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the Operator “Built for day-to-day use” cards as an accessible, responsive 4×2 technical grid with eight meaningful local vector illustrations and unchanged copy.

**Architecture:** Keep the existing static HTML/CSS architecture. Add one decorative illustration container to each existing card, use local open-source SVG icon assets, and scope all new layout styling to `.operator-capabilities` so other personality pages remain untouched.

**Tech Stack:** Semantic HTML, scoped CSS, local SVG icon assets, Playwright, Axe, Git, GitHub, Vercel.

## Global Constraints

- Preserve all existing copy in the eight capability cards exactly.
- Use four columns on large screens, two on tablet/compact desktop, and one on mobile.
- Use local vector assets without a runtime CDN dependency.
- Decorative vectors must use `aria-hidden="true"` and carry no essential meaning alone.
- Maintain WCAG 2.2 AA contrast and reduced-motion behavior.
- Preserve Visionary, Strategist, shared routes, navigation, and personality switching.

---

### Task 1: Add card-grid regression coverage

**Files:**
- Modify: `tests/site.spec.mjs`

**Interfaces:**
- Consumes: existing `/?persona=operator` route and `.operator-capabilities` markup.
- Produces: assertions for copy, card count, vector presence, computed desktop/tablet/mobile columns, and overflow.

- [ ] **Step 1: Write a failing Playwright test**

Add a test that loads Operator at 1440px, asserts exactly eight cards and eight `.operator-capability-visual[aria-hidden="true"]` elements, verifies four unique card x-coordinates and two unique y-coordinates, and confirms the eight current titles remain unchanged. Resize to 900px and assert two columns; resize to 390px and assert one column with no horizontal overflow.

- [ ] **Step 2: Run the focused test and verify failure**

Run: `npm.cmd test -- tests/site.spec.mjs --grep "Operator capability cards use the technical vector grid"`

Expected: FAIL because the visual elements and four-column grid do not exist.

### Task 2: Add local vector assets and card markup

**Files:**
- Create: `assets/icons/operator/*.svg`
- Modify: `Homepage.dc.html`

**Interfaces:**
- Consumes: eight approved capability cards in their existing DOM order.
- Produces: one `.operator-capability-visual` per card containing relevant local SVG `<img>` assets hidden from assistive technology.

- [ ] **Step 1: Add eight local open-source SVG icon assets**

Use suitable icons for recognition, message assistance, activity feed, gift catalogue, user assignment, file import, chart reporting, and report Q&A. Retain the source library license in `assets/icons/operator/LICENSE.txt`.

- [ ] **Step 2: Add the decorative visual stages**

Insert one visual container as the first child of each card. Use `aria-hidden="true"`; use empty `alt` attributes on contained images. Do not alter any existing text.

### Task 3: Implement the responsive technical card design

**Files:**
- Modify: `site.css`

**Interfaces:**
- Consumes: `.operator-capability-visual` markup and local SVG icons.
- Produces: 4×2 desktop, 2-column tablet, and 1-column mobile layouts.

- [ ] **Step 1: Build the desktop grid and card structure**

Set `.operator-capabilities` to `repeat(4, minmax(0, 1fr))`. Give cards equal minimum heights, a consistent internal grid, a technical illustration stage, dark navy surfaces, cool borders, cyan/teal icon treatments, and restrained hover elevation.

- [ ] **Step 2: Add responsive breakpoints**

At `max-width: 1100px`, use two columns. At `max-width: 767px`, use one column. Prevent overflow and retain readable type sizes.

- [ ] **Step 3: Preserve reduced-motion behavior**

Ensure capability-card hover transforms are disabled under `prefers-reduced-motion: reduce`.

- [ ] **Step 4: Run the focused test and verify it passes**

Run: `npm.cmd test -- tests/site.spec.mjs --grep "Operator capability cards use the technical vector grid"`

Expected: PASS.

### Task 4: Visual, responsive, and accessibility verification

**Files:**
- Create or update: `design-qa.md`

**Interfaces:**
- Consumes: completed local Operator page.
- Produces: verified design QA and full regression evidence.

- [ ] **Step 1: Capture and compare the Operator section**

Open the local page at desktop and mobile widths, compare it with the supplied reference, and document fidelity, spacing, hierarchy, and remaining issues in `design-qa.md`.

- [ ] **Step 2: Fix all P0–P2 QA findings**

Repeat capture and comparison until `design-qa.md` ends with `final result: passed`.

- [ ] **Step 3: Run all functional and accessibility tests**

Run: `npm.cmd test -- tests/site.spec.mjs tests/accessibility.spec.mjs`

Expected: all tests pass with zero WCAG A/AA violations.

### Task 5: Publish and deploy

**Files:**
- Stage only the approved current working-tree files and new vector/design files.

**Interfaces:**
- Consumes: verified local working tree.
- Produces: GitHub branch update and production Vercel deployment.

- [ ] **Step 1: Review the complete diff**

Run `git status --short` and `git diff --check`; confirm the diff contains the previously approved live homepage/accessibility changes plus this capability-grid work.

- [ ] **Step 2: Commit and push**

Commit with `redesign operator capability cards`, then push `codex/personality-led-homepage` to `origin`.

- [ ] **Step 3: Deploy production**

Deploy the committed working tree to the linked Vercel production project.

- [ ] **Step 4: Smoke-test public personalities**

Confirm `?persona=visionary`, `?persona=strategist`, and `?persona=operator` each return HTTP 200 and the Operator page contains the new grid assets.
