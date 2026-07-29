# EzRewards Visionary Homepage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy the approved personality selector, two-second percentage loader, and complete Visionary EzRewards homepage.

**Architecture:** Preserve the existing static HTML/CSS/JavaScript stack and enhance the homepage as three mutually exclusive views controlled by a small state machine. Keep content semantic in HTML, presentation responsive in CSS, and interaction/focus behavior in `site-ui.js`.

**Tech Stack:** Static HTML5, CSS custom properties and animations, vanilla JavaScript, Playwright, Vercel static hosting.

## Global Constraints

- Visionary is the only selectable personality; Strategist and Operator are disabled and marked “Coming soon.”
- Loader displays 0–100% and reaches the homepage in 2 seconds.
- Use the supplied Visionary copy and tokens without remote runtime dependencies.
- Preserve Product, About, and Contact routes and existing shared behavior.
- Support keyboard navigation, visible focus, reduced motion, and 320px-wide screens.

---

### Task 1: Entry and loader behavior

**Files:**
- Modify: `tests/site.spec.mjs`
- Modify: `Homepage.dc.html`
- Modify: `site-ui.js`
- Modify: `site.css`

**Interfaces:**
- Consumes: DOM attributes `data-experience-view`, `data-personality`, `data-enter-visionary`, `data-loader-progress`, and `data-change-experience`.
- Produces: accessible selector → loader → homepage state transitions.

- [ ] **Step 1: Write failing Playwright tests** asserting the selector is initially visible, only Visionary is enabled, selection enables the CTA, progress reaches 100, the homepage appears after approximately 2 seconds, and reset returns to the selector.
- [ ] **Step 2: Run `npm test -- --grep "Visionary experience flow"`** and confirm failure because the new selectors do not exist.
- [ ] **Step 3: Add semantic view markup and minimal state functions** `showView(name)`, `selectPersonality(name)`, and `startVisionaryExperience()` with progress based on elapsed time.
- [ ] **Step 4: Add entry/loader styles** using supplied tokens, responsive cards, focus states, and reduced-motion handling.
- [ ] **Step 5: Run `npm test -- --grep "Visionary experience flow"`** and confirm the tests pass.

### Task 2: Visionary homepage narrative

**Files:**
- Modify: `tests/site.spec.mjs`
- Modify: `Homepage.dc.html`
- Modify: `site.css`
- Create: `assets/visionary/hero-culture.svg`

**Interfaces:**
- Consumes: homepage view revealed by Task 1.
- Produces: semantic sections identified by `data-visionary-section` and CTA anchors `#demo`, `#platform`, and `#pricing`.

- [ ] **Step 1: Write failing tests** for the supplied hero heading, ordered narrative sections, primary calls to action, one `h1`, and local hero artwork.
- [ ] **Step 2: Run `npm test -- --grep "Visionary homepage narrative"`** and confirm failure on missing content.
- [ ] **Step 3: Replace the old homepage content** with the brief’s hero, problem, transformation, recognition, rewards, AI, moments, platform, trust, pricing, final CTA, and footer content.
- [ ] **Step 4: Build the local Neo Pop hero artwork** with accessible decorative treatment and add responsive editorial layouts for every section.
- [ ] **Step 5: Run `npm test -- --grep "Visionary homepage narrative"`** and confirm the tests pass.

### Task 3: Regression, responsive QA, and deployment

**Files:**
- Modify: `tests/site.spec.mjs`
- Modify: `robots.txt`
- Modify: `sitemap.xml`

**Interfaces:**
- Consumes: complete local experience from Tasks 1–2.
- Produces: verified Vercel preview deployment URL.

- [ ] **Step 1: Update legacy assertions** that intentionally changed while preserving metadata, route, accessibility, menu, form, and offline-rendering coverage.
- [ ] **Step 2: Run `npm test`** and resolve all behavior, accessibility, and overflow failures.
- [ ] **Step 3: Run the Vercel deployment command** for the current branch and capture the preview URL.
- [ ] **Step 4: Smoke-test the deployed URL** for the entry screen, transition, homepage hero, and HTTP success.
- [ ] **Step 5: Review `git diff --check`, `git status --short`, and the final diff** before reporting the deployment.
