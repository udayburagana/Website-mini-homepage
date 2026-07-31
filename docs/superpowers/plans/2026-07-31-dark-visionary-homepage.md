# Dark Visionary Homepage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the post-loader Visionary homepage with a dark, cinematic, six-act culture-first experience while preserving the light selector and loader.

**Architecture:** Keep the static HTML/CSS/JavaScript stack. Replace only the markup inside `[data-experience-view="home"]`, introduce a scoped dark token system in `site.css`, reuse existing view/menu behavior, and add only lightweight reveal/parallax behavior that degrades cleanly for reduced motion.

**Tech Stack:** Semantic HTML5, CSS custom properties and SVG effects, vanilla JavaScript, Playwright, Vercel.

## Global Constraints

- Keep the current light personality selector and two-second loader unchanged.
- Use `#090A16`, `#111328`, `#171A34`, `#F8FAFC`, `#B8C0D9`, `#8B5CF6`, `#D946EF`, `#FF6B5F`, `#F5C542`, and `#22D3EE`.
- Primary CTAs use `#8B5CF6` with `#F8FAFC`.
- Use Space Grotesk for display/headings and Geist for body/UI.
- Use outlined futuristic culture iconography; avoid green Neo-Pop, stickers, emoji, and generic HR imagery.
- Route “Join Waitlist” and “Book a Demo” to `/contact`.
- Preserve all existing routes, accessibility behavior, and 320px responsive support.

---

### Task 1: Lock the new homepage contract in tests

**Files:**
- Modify: `tests/site.spec.mjs`

**Interfaces:**
- Consumes: existing selector/loader `data-experience-view` contract.
- Produces: required six-section `data-visionary-section` sequence and dark-token assertions.

- [ ] Add failing Playwright assertions for `hero`, `culture-gap`, `transformation`, `product-story`, `flywheel`, and `proof`, plus primary CTA destinations and local cinematic artwork.
- [ ] Add source assertions for the exact dark palette and remove old cream/lime homepage-token assertions.
- [ ] Run `npm.cmd test -- --grep "Visionary homepage"` and confirm failure on the old eleven-section page.

### Task 2: Build the cinematic homepage

**Files:**
- Modify: `Homepage.dc.html`
- Modify: `site.css`
- Modify: `site-ui.js`
- Create: `assets/visionary/culture-orbit.svg`

**Interfaces:**
- Consumes: unchanged selector/loader and mobile-menu behavior.
- Produces: six semantic homepage sections, local SVG artwork, reveal hooks, and CTA anchors.

- [ ] Replace only `[data-experience-view="home"]` with the approved six-act content and Figma-derived centered hero hierarchy.
- [ ] Add scoped midnight surfaces, glass panels, violet/orchid glow, coral warmth, gold proof, cyan intelligence, outlined icons, responsive layouts, and 8px CTA geometry.
- [ ] Add intersection-based reveal classes and subtle pointer parallax for the hero orbit, guarded by `prefers-reduced-motion`.
- [ ] Run the focused homepage tests until they pass.

### Task 3: Verify, publish, and smoke-test

**Files:**
- Modify only if verification exposes a regression: `tests/site.spec.mjs`, `Homepage.dc.html`, `site.css`, or `site-ui.js`.

**Interfaces:**
- Consumes: completed static experience.
- Produces: pushed `codex/visionary-new` branch and public Vercel preview URL.

- [ ] Run the complete Playwright suite and `git diff --check`.
- [ ] Capture and inspect desktop/mobile entry, loader, hero, and full-page screenshots.
- [ ] Commit the scoped files and push `codex/visionary-new`.
- [ ] Resolve the GitHub-connected Vercel preview URL and smoke-test homepage transition, `/contact`, HTTP 200, and console cleanliness.
