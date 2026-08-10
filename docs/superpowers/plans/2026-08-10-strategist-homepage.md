# Strategist Homepage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a complete light-mode Strategist homepage that replaces the homepage content below the shared selector when Strategist is selected, without changing Visionary.

**Architecture:** Keep the shared header and personality tablist. Add two personality page containers in `Homepage.dc.html`, toggle their hidden/inert state through `site-ui.js`, and scope the new analytical design under `.strategist-home` in `site.css`. Preserve the query-string and local-storage personality contract.

**Tech Stack:** Semantic HTML, scoped CSS, vanilla JavaScript, Playwright.

## Global Constraints

- Preserve Visionary markup, styling, copy, and behavior.
- Use the supplied Strategist copy from Hero through Final CTA.
- Use a light analytical design matching the supplied desktop references.
- Use “Join the Waitlist” for conversion actions and the existing `/contact` flow.
- Do not add animation or icon dependencies.
- Support reduced motion, keyboard tabs, native FAQ disclosures, and 320px minimum width.

---

### Task 1: Personality container contract

**Files:**
- Modify: `tests/site.spec.mjs`
- Modify: `Homepage.dc.html`
- Modify: `site-ui.js`

**Interfaces:**
- Produces: `[data-persona-page="visionary|strategist"]` containers; `setPersona(name)` controls `hidden` and `inert`.

- [ ] Add failing browser tests proving Visionary remains visible by default, Strategist reveals a separate light page, and hidden personality content cannot receive focus.
- [ ] Run the focused tests and confirm they fail because the Strategist container does not exist.
- [ ] Wrap the current Visionary content and add the Strategist container with the approved 11-section order.
- [ ] Extend `setPersona(name)` to toggle container visibility, inertness, page classes, and metadata without resetting scroll position.
- [ ] Run the focused tests and confirm they pass.

### Task 2: Strategist content and interactions

**Files:**
- Modify: `tests/site.spec.mjs`
- Modify: `Homepage.dc.html`
- Modify: `site-ui.js`

**Interfaces:**
- Produces: `[data-strategist-section]` sequence and native `<details>` FAQ items.

- [ ] Add failing tests for the supplied Hero, Problem, Vision, Category, Appreciation Loop, Capabilities, Outcomes, Early Access, Pricing, FAQ, and Final CTA copy.
- [ ] Add tests for `/product`, `/contact`, measurable-outcomes anchor destinations, and FAQ disclosure interaction.
- [ ] Run tests and verify the missing sections fail.
- [ ] Implement the exact supplied copy with corrected punctuation encoding and functional destinations.
- [ ] Run focused tests and verify they pass.

### Task 3: Light analytical visual system

**Files:**
- Modify: `site.css`
- Modify: `Homepage.dc.html`
- Modify: `tests/site.spec.mjs`

**Interfaces:**
- Produces: `.strategist-home`, `.strategist-dashboard`, `.strategist-card-grid`, `.strategist-pricing`, and responsive variants.

- [ ] Add failing computed-style and overflow tests for light page background, white cards, navy text, indigo actions, and responsive widths.
- [ ] Run tests and confirm the dark interim Strategist styling fails.
- [ ] Implement the reference-matched navigation state, hero split, dashboard visual, card systems, charts, pricing panel, FAQ, and CTA styling.
- [ ] Add hover, focus, reveal, and reduced-motion states.
- [ ] Run focused style and responsive tests and confirm they pass.

### Task 4: Visual and regression verification

**Files:**
- Update: `design-qa.md`

- [ ] Run `node --check site-ui.js`.
- [ ] Run `npm.cmd test -- --workers=2` and require zero failures.
- [ ] Capture the Strategist page at the 1440px reference viewport and a 390px mobile viewport.
- [ ] Compare the desktop capture against both supplied references for palette, typography, spacing, dashboard density, borders, and shadows.
- [ ] Fix all P0–P2 discrepancies and record `final result: passed` in `design-qa.md`.
- [ ] Run `git diff --check` and review the final diff for Visionary regressions.
