# EzRewards Design System

EzRewards is an employee appreciation platform: peer recognition, digital rewards, wallet/redemption tracking, and AI-assisted reports in one place for growing teams. It is **an Evolutyz product** (credited in the site footer).

Blurb from the source: "Great work should never go unseen. EzRewards helps companies turn everyday appreciation into a visible, structured, and rewarding culture." The product wraps five moments into one loop — **Recognize → Celebrate → Reward → Redeem → Understand** — and is built for HR/People, Founders, Operations, and Admins alike.

**Source:** a Figma file, "Ezrewards website design (Copy).fig" (mounted read-only; not a live link). The user scoped the import to 26 frames on Page-1. The canonical, most-finished design is the frame named **"final homepage v2"** (node `119:407`) — a single-page marketing site, hero to footer. `Product page 1`/`Product page 2` are near-duplicate exploration cuts of the same sections. Several `screencapture-*` frames are pasted PNG screenshots of earlier, alternate homepage explorations (dark-theme variants) — useful only as secondary reference, not built from (screenshots are lossy; the JSX-backed `final-homepage-v2` won. See CAVEATS). A `Light theme 2` frame (node `32:242`) is a color/type specimen sheet and is the primary source for the token values below. No app codebase or additional Figma link was provided — the actual product dashboard (Overview/Recognition/Rewards/Wallet/Reports) only exists as illustrative screenshots embedded *inside* the marketing site's feature sections (`assets/imagery/`); the `ui_kits/app` kit recreates it from those.

## Components
Real UI primitives, `components/<group>/`:
- **NavLink** (`navigation/`) — the one true component family the Figma file defines ("Link", Property 1 variant).
- **Logo** (`assets/logo/`) — EzRewards wordmark + sparkle mark, traced path-for-path from the source (no separate logo file existed; it's built from vector letterforms in the header).
### Intentional additions
Recurring visual atoms instantiated throughout the page, formalized as components since a design system needs them, but not literal Figma component sets. These names are our own, confirmed intentional — the Figma file does not name them:
- **Logo** — EzRewards wordmark + sparkle mark, traced path-for-path (no logo file existed in the source).
- **Button** (`core/`) — primary / dark / secondary / ghost.
- **Tag** (`core/`) — uppercase section eyebrow.
- **Badge** (`core/`) — status / tag pills.
- **Card** (`core/`) — cream / dark / paper variants.
- **Input** (`forms/`) — labeled field + hint.

## UI kits
- `ui_kits/website/` — full click-through recreation of the one-page marketing site.
- `ui_kits/app/` — click-through recreation of the product dashboard, built from the illustrative screenshots embedded in the marketing site (not a separate Figma frame).

## Foundations
- `tokens/` — colors, typography, effects (shadows/radii/spacing), fonts — all imported by root `styles.css`.
- `guidelines/` — specimen cards for the Design System tab (Colors, Type, Spacing groups).
- `assets/imagery/` — the four dashboard-mockup PNGs used across the site (recognition feed, reward wallet, participation report).

## Index
- `readme.md` — this file
- `SKILL.md` — Claude-Code-portable skill wrapper
- `styles.css`, `tokens/*.css` — design tokens
- `components/core/{Button,Tag,Badge,Card}.*`, `components/forms/Input.*`, `components/navigation/NavLink.*`, `assets/logo/Logo.*`
- `guidelines/*.card.html` — foundation specimens
- `ui_kits/website/`, `ui_kits/app/` — product recreations
- `thumbnail.html` — project tile

---

## CONTENT FUNDAMENTALS
- **Voice:** direct, plain-spoken, slightly wry — anti-corporate-jargon on purpose. "All in one place that doesn't feel like corporate software." Short declarative sentences, often fragments used as headlines: *"Say it." "Share it." "Make it count."*
- **You never appears, "the company"/"teams"/"people" instead:** copy speaks about the org in third person ("Give specific appreciation... make meaningful work visible across the company") rather than a direct "you're amazing" — recognition is framed as infrastructure, not flattery.
- **Headlines are blunt claims, not questions:** "Great work should never go unseen.", "Reward freely. Stay in control.", "One clear price. No theatre." Two short sentences, second one landing the point.
- **Problem framing uses concrete artifacts, not abstractions:** "A thank-you in one tool. A reward in another." names the actual scattered tools (spreadsheet, chat) rather than saying "recognition is fragmented."
- **Numbers as proof, not decoration:** "$1 / user / month", "12,450 reward credits", "78% participation", "+18% this month" — always attached to a real unit, never a bare stat.
- **No emoji.** The only decorative glyph is a small ✦ sparkle (mirrors the logo mark) used sparingly as a bullet/accent, e.g. "✦ Ownership".
- **Casing:** sentence case almost everywhere; eyebrow labels are the one ALL-CAPS treatment ("RECOGNITION", "REPORTS + AI"); the giant hero headline is set in full caps for dramatic weight only in that one spot.
- **CTAs are plain verbs:** "Join the Waitlist", "Continue", "See how it works", "Ask a plain-language question →" — never "Get Started Now!" hype language.

## VISUAL FOUNDATIONS
- **Palette:** cream canvas (`#F2ECDD`) as the resting background; black (`#111111`/`#000`) for all text, borders and shadows; **lime** (`#C2F24A`) as the single primary accent/CTA color. Each feature section gets its own full-bleed background — yellow, lime, coral, purple, dark navy — rotating through the story instead of staying monochrome. Only 1–2 accent colors ever appear together on one section.
- **Type:** Archivo for the one mega hero headline (96px, tight -2.36px tracking, all caps); Space Grotesk for every section heading (300–400 weight, large sizes 52–72px) and all-caps eyebrow labels (12px, +1.44px tracking); Inter for body copy and buttons; DM Sans/Albert Sans/JetBrains Mono/Playfair Display appear only in small supporting roles (dashboard UI numerals, one link's microcopy, a data label, a rare quote accent).
- **Backgrounds:** flat full-bleed color blocks per section — no gradients on the marketing site itself (gradients only appear inside dark dashboard cards, top-to-bottom navy). No photography; the only imagery is illustrative product-dashboard screenshots (mock UI). No hand-drawn illustration, no repeating pattern/texture.
- **Shadows are hard-offset, never blurred:** every raised element (button, card, badge) uses a flat `Npx Npx 0px 0px color` shadow — 2–3px on buttons/badges, 5–8px on cards — instead of a soft blur. This is the single most defining brand trait (neo-brutalist, sticker-like).
- **Borders:** cards commonly use an inset 1–2px black hairline *in addition to* the offset shadow, so shapes read as if cut from black-outlined paper.
- **Corner radii:** 4px (small chips) → 8–16px (buttons, cards) → 20px (pill buttons/tags). Never fully circular except icon chips and the pill CTAs.
- **Animation:** none observed in the source (static compositions only) — treat hover/press states as the only motion.
- **Hover/press states:** not explicitly specified in the source; recommend a 1px translate toward the shadow's origin on hover (already implemented in `Button.jsx`) to sell the "sticker lifting" effect, since flat colors give no room for opacity/darken tricks without breaking the flat-color rule.
- **Transparency/blur:** used sparingly and only for floating annotation callouts layered over the hero product screenshot (`backdrop-filter: blur(12px)` on a translucent white chip) — never on primary UI.
- **Imagery color vibe:** the dashboard-mockup screenshots are dark-navy UI with lime/periwinkle accents — cool and screen-lit, contrasting with the warm cream marketing canvas around them.
- **Layout:** centered content column (max-width ~1440px), generous section padding (80–120px vertical), nav header is a fixed-height 79px bar with a hairline bottom border.

## ICONOGRAPHY
- No built-in icon font. The Figma source uses two things: (1) a small set of hand-drawn line icons as plain SVG (e.g. the arrow-up-right on "See how it works", copied verbatim into components), and (2) a handful of **Streamline "Ultimate" colorful sticker icons** (e.g. `streamline-ultimate-color:party-confetti`, a praying-hands glyph) used as one-off decorative badges over the hero image. Streamline's colorful icon pack is a paid/proprietary set, not freely CDN-available — **flagged substitution:** if more of these decorative stickers are needed, use a similarly rounded, colorful icon set (e.g. Fluent Emoji or Noto colorful icons) rather than recreating Streamline's exact artwork.
- No emoji in UI copy. Unicode is used once as a decorative bullet: the ✦ sparkle (matches the logo mark), used as e.g. "✦ Ownership".
- **No logo file existed in the source** — the wordmark is built from raw vector letterforms in the header; it's been traced into `assets/logo/Logo.jsx` so it renders as real vector paths, not a redraw.

## CAVEATS — please help us iterate
1. **Font substitutions:** Geist Mono and Cabinet Grotesk are used a handful of times in the source but aren't on Google Fonts — substituted with **JetBrains Mono** and **Space Grotesk Bold** respectively. If you have the real font files, send them over and we'll swap them in.
2. **Fonts loaded via Google Fonts CDN**, not local files — the Figma file doesn't expose font binaries. Happy to switch to self-hosted files if you provide them.
3. **Only one true component family** existed in the Figma file (the nav "Link"). Button/Tag/Badge/Card/Input were formalized from repeating visual patterns on the page, not from named Figma components — flag anything that doesn't feel right and we'll adjust.
4. **No app codebase or app-specific Figma frame was provided.** `ui_kits/app` is a best-effort reconstruction from the illustrative dashboard screenshots embedded in the marketing site — if you have the real product's design file or code, we'd love to rebuild this kit from source.
5. Several `screencapture-*` frames in scope are screenshots of **earlier/alternate** homepage explorations (dark theme) rather than the final cream/lime direction — we treated `final-homepage-v2` as ground truth per its name and used the others only as loose context.

**Please review and tell us what to fix** — wrong color, a section that reads differently than you intended, a component that should be added or renamed. We'd rather iterate now than guess forever.
