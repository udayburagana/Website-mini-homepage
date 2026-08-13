# Visionary Homepage Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current Visionary narrative with the approved 11-section copy and reproduce the visual system and responsive constraints from Figma node `2171:214` without changing other personalities or shared pages.

**Architecture:** Keep the existing static HTML/CSS/JavaScript personality system. Replace only the `data-persona-page="visionary"` main content, add Visionary-scoped component styles, and use native `<details>` FAQ disclosures. Existing shared navigation, persona state, routes, and accessibility helpers remain intact.

**Tech Stack:** Semantic HTML, scoped CSS, lightweight vanilla JavaScript, Playwright, Axe, Vercel static hosting.

## Global Constraints

- Use all approved copy verbatim across 11 Visionary sections.
- Follow Figma node `2171:214`; desktop content max-width is `1280px`, with the designed `1080px` minimum applying only before responsive collapse.
- Keep Strategist, Operator, and `/pricing` unchanged.
- No new dependency or backend integration.
- Meet WCAG 2.2 AA and prevent horizontal overflow from 320px upward.

---

### Task 1: Lock the new narrative with failing tests

**Files:**
- Modify: `tests/site.spec.mjs`
- Modify: `tests/accessibility.spec.mjs`

**Interfaces:**
- Consumes: `[data-persona-page="visionary"]`, `[data-home-section]`, native `details/summary`.
- Produces: regression expectations for the 11-section sequence, exact copy, FAQ semantics, Figma measurements, and unaffected shared routes.

- [ ] Add a Playwright test expecting the exact section sequence: `hero`, `problem`, `vision`, `category`, `appreciation-loop`, `capabilities`, `outcomes`, `early-access`, `pricing`, `faq`, `final-cta`.
- [ ] Assert the new hero, problem, pricing, and final CTA copy, eight capability cards, five loop steps, nine FAQ disclosures, and `/pricing` link behaviour.
- [ ] Assert Figma desktop values: `102px/100px` hero heading, `1280px` section container, four equal Problem cards, and dark `#090a16` surface.
- [ ] Run `npm.cmd test -- --grep "refreshed Visionary"` and confirm failure because the old page is still rendered.

### Task 2: Replace the Visionary HTML narrative

**Files:**
- Modify: `Homepage.dc.html`
- Modify: `site-ui.js`
- Test: `tests/site.spec.mjs`

**Interfaces:**
- Consumes: existing `.dark-button`, persona tablist, routes `/contact`, `/product`, `/pricing`.
- Produces: semantic 11-section Visionary document and native FAQ disclosures.

- [ ] Replace only the Visionary `<main>` content with the approved copy and ordered `data-home-section` identifiers.
- [ ] Use semantic lists for loop steps, benefits, pricing inclusions, and outcomes; use `<details><summary>` for each FAQ.
- [ ] Update the Visionary persona copy map so switching back to Visionary restores the new hero copy.
- [ ] Run the focused tests and confirm content/structure assertions pass while style assertions remain red.

### Task 3: Implement the Figma visual system responsively

**Files:**
- Modify: `site.css`
- Test: `tests/site.spec.mjs`

**Interfaces:**
- Consumes: new `.visionary-refresh` section classes.
- Produces: Figma-aligned dark section system with responsive grids and cards.

- [ ] Scope all new selectors below `[data-persona-page="visionary"]` so other personalities and routes cannot inherit them.
- [ ] Implement the Figma hero: 102px/100px desktop title, 779px supporting copy, paired 53px CTAs, selector glow, and supporting price line.
- [ ] Implement Problem and Vision content containers at `width:min(1280px,100%)`, 80px desktop gutters, 40px column gap, 52px/56px headings, and responsive one-column collapse below 1080px.
- [ ] Implement the remaining sections with consistent dark/violet surfaces, 52px section headings, 20–24px card titles, 15–18px body copy, 14px-radius cards, white borders, and restrained solid shadows.
- [ ] Implement responsive four/two/one-column card grids and prevent overflow at every tested viewport.
- [ ] Run the focused tests and confirm all refreshed Visionary assertions pass.

### Task 4: Accessibility and complete regression verification

**Files:**
- Modify: `tests/accessibility.spec.mjs`
- Modify: `design-qa.md`

**Interfaces:**
- Consumes: final rendered page.
- Produces: verified WCAG and visual-QA record.

- [ ] Add FAQ keyboard/semantic assertions and run desktop/mobile Axe checks.
- [ ] Run `npm.cmd test` and require all tests to pass.
- [ ] Visually compare the desktop and mobile page against the Figma frame and record the comparison in `design-qa.md`.
- [ ] Run `git diff --check` and inspect the final diff for Visionary-only scope.

### Task 5: Publish and production smoke test

**Files:**
- Commit all scoped files on `codex/personality-led-homepage`.

**Interfaces:**
- Produces: GitHub commit and production Vercel deployment.

- [ ] Commit with a focused message and push `codex/personality-led-homepage`.
- [ ] Deploy the verified commit to the existing Vercel production project.
- [ ] Smoke-test `https://website-mini-homepage.vercel.app/?persona=visionary` for exact hero copy, 11 sections, FAQ disclosure, zero horizontal overflow, and unchanged `/pricing` route.
