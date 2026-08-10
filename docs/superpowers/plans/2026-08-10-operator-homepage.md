# Operator Homepage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy a complete dark operational Operator homepage without changing Visionary or Strategist.

**Architecture:** Add a third personality page container in `Homepage.dc.html`; extend `setPersona(name)` to activate it; scope all new presentation under `.operator-home` and `.operator-active`. Continue using semantic HTML, native disclosures, and existing query/local preference behavior.

**Tech Stack:** Semantic HTML, scoped CSS, vanilla JavaScript, Playwright, Vercel.

## Global Constraints

- Preserve Visionary and Strategist markup, copy, style, and behavior.
- Use the supplied Operator copy from Hero through Final CTA.
- Match the dark cyan operational reference without new dependencies.
- All conversion actions use “Join the Waitlist” and `/contact`.
- Support keyboard tabs, reduced motion, native FAQs, and 320px minimum width.

---

### Task 1: Operator page contract and narrative

**Files:** `tests/site.spec.mjs`, `Homepage.dc.html`, `site-ui.js`

- [ ] Write failing tests for the separate Operator page, 11-section order, supplied headlines, destinations, and FAQ interaction.
- [ ] Run focused tests and confirm failure because no Operator container exists.
- [ ] Add the complete semantic Operator document and toggle its hidden/inert state in `setPersona`.
- [ ] Run focused tests and confirm they pass.

### Task 2: Dark operational visual system

**Files:** `site.css`, `Homepage.dc.html`, `tests/site.spec.mjs`

- [ ] Write failing computed-style tests for near-black canvas, dark cards, white text, and cyan actions.
- [ ] Implement the reference-matched hero workspace, operational cards, charts, workflow panels, pricing, FAQs, hover/focus states, and responsive layouts.
- [ ] Run focused visual-token and overflow tests.

### Task 3: QA, regression, and deployment

**Files:** `design-qa.md`

- [ ] Run `node --check site-ui.js` and the complete Playwright suite.
- [ ] Capture 1440px Hero and Daily Operation states plus a 390px mobile state.
- [ ] Compare against both supplied references and fix all P0–P2 differences.
- [ ] Update `design-qa.md` with `final result: passed` and run `git diff --check`.
- [ ] Commit, push `codex/personality-led-homepage`, deploy a Vercel preview, and verify HTTP 200 plus Operator hero content.
