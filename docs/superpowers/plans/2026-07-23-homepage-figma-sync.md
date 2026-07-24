# EzRewards Homepage Figma Sync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the production homepage match Figma frame `168:951` at 1440 px while preserving the existing responsive behavior, accessibility, interactions, and GitHub-to-Vercel deployment flow.

**Architecture:** Keep the existing `.dc.html` component model, bundled design-system tokens, and lightweight JavaScript behavior. Update only the changed homepage markup and exact Figma-exported assets, then add deterministic Playwright checks for frame geometry and screenshots before publishing through the existing `main` → Vercel production integration.

**Tech Stack:** HTML/DC components, inline component styles, `site.css`, JavaScript, Playwright 1.61.1, GitHub, Vercel.

## Global Constraints

- Source design: Figma file `Csh8JZtbIwUPRZxCVlIbkL`, homepage frame `168:951`.
- Desktop reference viewport: `1440 × 900`, device scale factor `1`.
- Preserve the existing routes, copy, form behavior, navigation, responsive breakpoints, design-system imports, SEO metadata, and reduced-motion support.
- Use exact exported Figma assets; do not redraw the flower or icons with CSS, Unicode, inline SVG, or placeholders.
- Keep `.vercel/project.json` local and ignored.
- Production acceptance URL: `https://website-mini-homepage.vercel.app/`.

---

## File Structure

- Create `assets/home/hero-corner-burst.svg` — exact Figma export for node `168:1017`.
- Create `assets/home/feature-peer-recognition.svg` — exact Figma `StarFour` export.
- Create `assets/home/feature-digital-rewards.svg` — exact Figma `Gift` export.
- Create `assets/home/feature-company-wallet.svg` — exact Figma `Wallet` export.
- Create `assets/home/feature-admin-controls.svg` — exact Figma `UserCheck` export.
- Create `assets/home/feature-reports.svg` — exact Figma `FileArrowUp` export.
- Create `assets/home/feature-ai-report-assistant.svg` — exact Figma `OpenAiLogo` export.
- Modify `Homepage.dc.html` — hero decoration, “How it works” card structure, and feature card structure/assets.
- Modify `site.css` — reusable homepage asset/card classes and responsive safeguards.
- Modify `tests/site.spec.mjs` — deterministic desktop geometry, asset, and accessibility assertions.
- Create `tests/homepage.visual.spec.mjs` — stable-state homepage visual capture and screenshot baseline.

---

### Task 1: Add deterministic Figma assets

**Files:**
- Create: `assets/home/hero-corner-burst.svg`
- Create: `assets/home/feature-peer-recognition.svg`
- Create: `assets/home/feature-digital-rewards.svg`
- Create: `assets/home/feature-company-wallet.svg`
- Create: `assets/home/feature-admin-controls.svg`
- Create: `assets/home/feature-reports.svg`
- Create: `assets/home/feature-ai-report-assistant.svg`

**Interfaces:**
- Consumes: Figma nodes `168:1017` and `169:1556`.
- Produces: seven repository-local asset paths used by `Homepage.dc.html`.

- [ ] **Step 1: Refresh the Figma export URLs**

Call `get_design_context` for node `168:951` to obtain the current hero burst export, then node `169:1556` to obtain the six feature-icon exports. Do not use URLs saved from an older run because Figma MCP asset URLs expire.

- [ ] **Step 2: Download the exact bytes**

Save the returned SVG responses under the seven paths listed above. Preserve the returned SVG bytes; do not optimize or rewrite their paths.

- [ ] **Step 3: Verify each asset**

Run:

```powershell
Get-ChildItem assets/home/*.svg | Select-Object Name,Length
```

Expected: seven non-empty SVG files.

- [ ] **Step 4: Commit the assets**

```powershell
git add assets/home
git commit -m "assets: sync homepage artwork from Figma"
```

---

### Task 2: Match the hero decoration

**Files:**
- Modify: `Homepage.dc.html`
- Modify: `site.css`
- Test: `tests/site.spec.mjs`

**Interfaces:**
- Consumes: `assets/home/hero-corner-burst.svg`.
- Produces: `.hero-corner-burst`, a decorative image matching Figma node `168:1017`.

- [ ] **Step 1: Add a failing hero assertion**

Add this test inside `tests/site.spec.mjs`:

```javascript
test("homepage hero uses the current Figma corner artwork", async ({ page }) => {
  await page.goto("/");
  const burst = page.locator(".hero-corner-burst");
  await expect(burst).toHaveAttribute("src", "/assets/home/hero-corner-burst.svg");
  await expect(burst).toHaveAttribute("alt", "");
  await expect(burst).toHaveCSS("width", "160px");
  await expect(burst).toHaveCSS("height", "160px");
});
```

- [ ] **Step 2: Run the assertion and confirm it fails**

Run:

```powershell
pnpm exec playwright test tests/site.spec.mjs -g "current Figma corner artwork"
```

Expected: failure because `.hero-corner-burst` does not exist.

- [ ] **Step 3: Replace the lime circle**

In the hero section of `Homepage.dc.html`, replace the current `230px` lime circle with:

```html
<img
  class="hero-corner-burst"
  src="/assets/home/hero-corner-burst.svg"
  alt=""
  aria-hidden="true"
>
```

Add to `site.css`:

```css
.hero-corner-burst {
  position: absolute;
  left: -14px;
  top: -80px;
  width: 160px;
  height: 160px;
  object-fit: contain;
  pointer-events: none;
}
```

- [ ] **Step 4: Verify and commit**

Run:

```powershell
pnpm exec playwright test tests/site.spec.mjs -g "current Figma corner artwork"
git add Homepage.dc.html site.css tests/site.spec.mjs
git commit -m "style: match Figma hero artwork"
```

Expected: the focused test passes.

---

### Task 3: Restore the Figma “How it works” card rhythm

**Files:**
- Modify: `Homepage.dc.html`
- Modify: `site.css`
- Test: `tests/site.spec.mjs`

**Interfaces:**
- Produces: `.home-flow-grid`, `.home-flow-card`, and `.home-flow-card__content`.
- Desktop target: section height `622px`, five equal cards, `20px` column gap, and `48px` separation between the number badge and text block.

- [ ] **Step 1: Add failing geometry assertions**

Add:

```javascript
test("homepage middle sections match the Figma desktop bounds", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  const bounds = await page.evaluate(() =>
    Object.fromEntries(
      [...document.querySelectorAll("[data-screen-label]")].map((element) => {
        const rect = element.getBoundingClientRect();
        return [element.dataset.screenLabel, Math.round(rect.height)];
      })
    )
  );

  expect(bounds["How it works"]).toBe(622);
  expect(bounds.Features).toBe(964);
});
```

- [ ] **Step 2: Confirm the current failure**

Run:

```powershell
pnpm exec playwright test tests/site.spec.mjs -g "middle sections match"
```

Expected: `How it works` is `582`, and `Features` is `908`.

- [ ] **Step 3: Restructure the five flow cards**

Give the grid `class="home-flow-grid"` and every card `class="home-flow-card"`. Wrap each card’s heading and paragraph in:

```html
<div class="home-flow-card__content">
  <h3>Recognize</h3>
  <p>Badges, appreciation messages, reactions, and comments — from anyone, to anyone.</p>
</div>
```

Use the same wrapper for Reward, Redeem, Track, and Ask AI, preserving their existing copy and colors.

Add:

```css
.home-flow-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 20px;
  margin-top: 60px;
}

.home-flow-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 48px;
  padding: 21px 22px 47px;
}

.home-flow-card:first-child {
  padding-bottom: 26px;
}

.home-flow-card__content {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.home-flow-card__content h3 {
  margin: 5px 0 0;
}

.home-flow-card__content p {
  margin: 0;
}
```

Retain the existing background, border, radius, shadow, typography, reveal delay, and hover transform styles on each card.

- [ ] **Step 4: Preserve responsive stacking**

Inside the existing `max-width: 767px` block, add:

```css
.home-flow-grid {
  grid-template-columns: minmax(0, 1fr) !important;
}

.home-flow-card,
.home-flow-card:first-child {
  gap: 24px;
  padding: 24px 22px;
}
```

- [ ] **Step 5: Verify and commit**

Run:

```powershell
pnpm exec playwright test tests/site.spec.mjs -g "middle sections match"
git add Homepage.dc.html site.css tests/site.spec.mjs
git commit -m "style: match Figma flow card spacing"
```

Expected: “How it works” is `622px`; “Features” remains failing until Task 4.

---

### Task 4: Match feature-card composition and icons

**Files:**
- Modify: `Homepage.dc.html`
- Modify: `site.css`
- Test: `tests/site.spec.mjs`

**Interfaces:**
- Consumes: the six `assets/home/feature-*.svg` files.
- Produces: `.home-feature-grid`, `.home-feature-card`, `.home-feature-icon`, and `.home-feature-card__content`.
- Desktop target: section height `964px`, three `421.333px` columns, `28px` gaps, `44px` icon tiles, and `24px` card content gaps.

- [ ] **Step 1: Add failing asset assertions**

Add:

```javascript
test("feature cards use the six current Figma icons", async ({ page }) => {
  await page.goto("/");
  const icons = page.locator(".home-feature-icon img");
  await expect(icons).toHaveCount(6);
  await expect(icons).toHaveAttribute("alt", "");
  await expect(icons.nth(0)).toHaveAttribute("src", "/assets/home/feature-peer-recognition.svg");
  await expect(icons.nth(1)).toHaveAttribute("src", "/assets/home/feature-digital-rewards.svg");
  await expect(icons.nth(2)).toHaveAttribute("src", "/assets/home/feature-company-wallet.svg");
  await expect(icons.nth(3)).toHaveAttribute("src", "/assets/home/feature-admin-controls.svg");
  await expect(icons.nth(4)).toHaveAttribute("src", "/assets/home/feature-reports.svg");
  await expect(icons.nth(5)).toHaveAttribute("src", "/assets/home/feature-ai-report-assistant.svg");
});
```

- [ ] **Step 2: Confirm the assertion fails**

Run:

```powershell
pnpm exec playwright test tests/site.spec.mjs -g "six current Figma icons"
```

Expected: failure because the live cards use repeated sparkle text.

- [ ] **Step 3: Replace the icon glyphs**

For each icon tile, use this structure with the corresponding asset:

```html
<div class="home-feature-icon" aria-hidden="true">
  <img src="/assets/home/feature-peer-recognition.svg" alt="">
</div>
```

Preserve the existing tile background color for each feature.

- [ ] **Step 4: Restructure card content**

Add `class="home-feature-grid"` to the grid and `class="home-feature-card"` to each card. Wrap every heading and paragraph:

```html
<div class="home-feature-card__content">
  <h3>Peer Recognition</h3>
  <p>Make appreciation visible across the company with public recognition posts, badges, reactions, and comments.</p>
</div>
```

Use equivalent wrappers for the other five cards while preserving copy.

Add:

```css
.home-feature-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 28px;
  margin-top: 56px;
}

.home-feature-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 24px;
  padding: 30px;
}

.home-feature-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  flex: 0 0 44px;
  border-radius: 10px;
}

.home-feature-icon img {
  display: block;
  width: 24px;
  height: 24px;
}

.home-feature-card__content {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.home-feature-card__content h3 {
  margin: 10px 0 0;
}

.home-feature-card__content p {
  margin: 0;
}
```

For Company Wallet, add enough bottom padding to make both first-row cards share the Figma row height:

```css
.home-feature-card--wallet {
  padding-bottom: 54px;
}
```

- [ ] **Step 5: Preserve mobile behavior**

Inside the existing mobile block, add:

```css
.home-feature-grid {
  grid-template-columns: minmax(0, 1fr) !important;
}

.home-feature-card,
.home-feature-card--wallet {
  padding: 24px;
}
```

- [ ] **Step 6: Verify and commit**

Run:

```powershell
pnpm exec playwright test tests/site.spec.mjs -g "middle sections match|six current Figma icons"
git add Homepage.dc.html site.css tests/site.spec.mjs
git commit -m "style: sync feature cards with Figma"
```

Expected: both section heights and all six asset assertions pass.

---

### Task 5: Normalize the marquee and footer frame bounds

**Files:**
- Modify: `Homepage.dc.html`
- Modify: `site.css`
- Test: `tests/site.spec.mjs`

**Interfaces:**
- Produces: `.home-marquee` and `.site-footer` with the exact desktop bounds required to make the full frame `6438px` tall.

- [ ] **Step 1: Extend the desktop geometry test**

Add these assertions to the `homepage middle sections match the Figma desktop bounds` test:

```javascript
expect(bounds.Marquee).toBe(51);
expect(bounds.Footer).toBe(328);
```

- [ ] **Step 2: Confirm the current failures**

Run:

```powershell
pnpm exec playwright test tests/site.spec.mjs -g "middle sections match"
```

Expected: live marquee is `52px` instead of `51px`; live footer is `333px` instead of `328px`.

- [ ] **Step 3: Apply the exact desktop bounds**

Add `class="home-marquee"` to the marquee wrapper and `class="site-footer"` to the footer. Add:

```css
@media (min-width: 1025px) {
  .home-marquee {
    display: flex;
    align-items: center;
    height: 51px;
    padding-top: 0 !important;
    padding-bottom: 0 !important;
    box-sizing: border-box;
  }

  .site-footer {
    height: 328px;
    min-height: 328px;
  }
}
```

Do not apply fixed heights below `1025px`; mobile and tablet content must continue sizing naturally.

- [ ] **Step 4: Verify the complete frame geometry**

Run:

```powershell
pnpm exec playwright test tests/site.spec.mjs -g "middle sections match"
```

Expected: marquee `51`, How it works `622`, Features `964`, and footer `328`.

- [ ] **Step 5: Commit**

```powershell
git add Homepage.dc.html site.css tests/site.spec.mjs
git commit -m "style: align homepage frame bounds"
```

---

### Task 6: Add stable visual regression coverage

**Files:**
- Create: `tests/homepage.visual.spec.mjs`
- Create: `tests/homepage.visual.spec.mjs-snapshots/homepage-1440-chromium-win32.png`

**Interfaces:**
- Produces: a stable, animation-free 1440 px homepage screenshot check.

- [ ] **Step 1: Add the visual test**

Create:

```javascript
import { expect, test } from "@playwright/test";

test("homepage matches the approved 1440px Figma implementation", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1800);
  await page.evaluate(() => {
    document.querySelectorAll("[data-reveal]").forEach((element) => {
      element.style.opacity = "1";
      element.style.transform = "none";
      element.style.transition = "none";
    });
    const style = document.createElement("style");
    style.textContent = "*{animation:none!important;transition:none!important}header{position:relative!important}";
    document.head.appendChild(style);
  });

  await expect(page).toHaveScreenshot("homepage-1440.png", {
    fullPage: true,
    animations: "disabled",
    maxDiffPixelRatio: 0.01
  });
});
```

- [ ] **Step 2: Generate and inspect the baseline**

Run:

```powershell
pnpm exec playwright test tests/homepage.visual.spec.mjs --update-snapshots
```

Open the generated PNG and compare it side by side with the fresh Figma `168:951` screenshot. Reject the baseline if the hero burst, card heights, icons, section boundaries, form, or footer differ visibly.

- [ ] **Step 3: Run the baseline as a test**

```powershell
pnpm exec playwright test tests/homepage.visual.spec.mjs
```

Expected: one passing visual test.

- [ ] **Step 4: Commit**

```powershell
git add tests/homepage.visual.spec.mjs tests/homepage.visual.spec.mjs-snapshots
git commit -m "test: add homepage visual regression"
```

---

### Task 7: Full validation, GitHub publication, and Vercel production

**Files:**
- Verify all modified and created files.

**Interfaces:**
- Consumes: completed Tasks 1–6.
- Produces: GitHub branch, reviewed pull request, merged `main`, and verified production deployment.

- [ ] **Step 1: Run the complete test suite**

```powershell
pnpm test
```

Expected: all Playwright tests pass with zero failures.

- [ ] **Step 2: Verify responsive layouts**

Run:

```powershell
pnpm exec playwright test tests/site.spec.mjs -g "fits"
```

Expected: all route/viewport combinations pass at `1440`, `1024`, `768`, `390`, and `320` px.

- [ ] **Step 3: Review repository scope**

```powershell
git status -sb
git diff --stat origin/main...HEAD
git log --oneline origin/main..HEAD
```

Expected: only homepage assets, homepage markup/styles, tests, snapshots, and this plan are included.

- [ ] **Step 4: Push the implementation branch**

```powershell
git push -u origin agent/sync-homepage-with-figma
```

- [ ] **Step 5: Open a pull request**

Create a PR targeting `main` titled:

```text
Sync homepage with updated Figma design
```

The body must list the hero artwork change, flow-card spacing change, feature icon/card change, exact section-height verification, responsive test coverage, and visual regression coverage.

- [ ] **Step 6: Verify the Vercel preview**

Inspect the PR’s Vercel preview at 1440 px. Capture it with the same stable-state procedure used by `homepage.visual.spec.mjs` and compare it to Figma frame `168:951`.

Expected section heights:

```text
Header: 79
Hero: 908
Marquee: 51
Problem: 954
How it works: 622
Features: 964
AI Report Assistant: 693
Why EzRewards: 742
Waitlist: 1097
Footer: 328
Total frame: 6438
```

- [ ] **Step 7: Merge and verify production**

After the preview and PR checks pass, merge to `main`. Wait for the Vercel production deployment to reach `READY`, then verify:

```text
https://website-mini-homepage.vercel.app/
```

Confirm the deployed Git commit SHA equals the merged `main` SHA and repeat the stable 1440 px screenshot comparison.

---

## Self-Review

- Spec coverage: hero artwork, How-it-works height, feature-card height, six changed icons, responsive behavior, accessibility semantics, tests, GitHub, preview, merge, and production verification are covered.
- Placeholder scan: no deferred implementation placeholders remain.
- Interface consistency: all class names, asset paths, test selectors, expected frame sizes, branch names, and deployment targets are consistent across tasks.
