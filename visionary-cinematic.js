// Shared Visionary cinematic entry: one bundle for Meet EzRewards (03), How EzRewards works (04) and Lenis.
import { initVisionarySmoothScroll } from "./visionary-smooth-scroll.js";
import "./meet-ezrewards.js";
import "./how-it-works.js";
import "./built-for-participation.js";
import "./culture-sphere.js";
import "./early-access.js";
import "./pricing-reveal.js";
import "./faq-motion.js";
import "./final-cta.js";
import "./cinematic-footer.js";

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initVisionarySmoothScroll, { once: true });
else initVisionarySmoothScroll();
