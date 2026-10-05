import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export const EARLY_ACCESS_ANCHORS = [.34, .46, .58, .70, .82];
const reducedMotionQuery = matchMedia("(prefers-reduced-motion: reduce)");
const phoneQuery = matchMedia("(max-width: 767px)");
const compactPhoneQuery = matchMedia("(max-width: 480px)");
const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
// Where the door sits in each generated poster/video (fractions of its natural size); see scripts/generate-early-access-media.mjs.
const DOOR = {
  desktop: { width: 1920, height: 1080, x: .7, top: .2, doorWidth: .32, doorHeight: .52 },
  portrait: { width: 1080, height: 1350, x: .51, top: .18, doorWidth: .58, doorHeight: .43 },
};
const MIN_BEAM = 52;

export function earlyAccessStateAt(progress) {
  const amount = clamp(progress);
  let active = -1;
  EARLY_ACCESS_ANCHORS.forEach((anchor, index) => { if (amount >= anchor) active = index; });
  // Copy and visual run in parallel: tag ↔ beam square, heading/body ↔ beam growth, CTA ↔ cards beginning (first anchor .34).
  return {
    active,
    meta: clamp(amount / .06),
    square: clamp(amount / .06),
    heading: clamp((amount - .06) / .08),
    copy: clamp((amount - .12) / .09),
    beam: clamp((amount - .07) / .15),
    action: clamp((amount - .23) / .08),
    light: clamp((amount - .07) / .25),
  };
}

export function initEarlyAccessGateway() {
  const section = document.querySelector("[data-early-access]");
  const page = section?.closest(".visionary-refresh");
  if (!section || !page) return;
  const pin = section.querySelector(".cinematic-early__pin");
  const video = section.querySelector("[data-early-video]");
  const benefits = [...section.querySelectorAll("[data-early-benefit]")];
  const saveData = Boolean(navigator.connection?.saveData);
  let mode = "", trigger = null, benefitObserver = null, mediaObserver = null, abort = new AbortController(), sourcesAttached = false;

  const modeForPage = () => reducedMotionQuery.matches || saveData ? "static" : page.dataset.cinematicMode === "full" ? "pinned" : innerWidth >= 768 ? "flow" : "static";
  const media = section.querySelector(".cinematic-early__media");
  const poster = media.querySelector("img");
  const COMPLETE = { meta: 1, square: 1, heading: 1, copy: 1, beam: 1, action: 1 };
  const setState = ({ active, meta, square, heading, copy, beam, light, action }) => {
    section.dataset.activeBenefit = active >= 0 ? String(active + 1) : "none";
    section.style.setProperty("--early-meta", meta.toFixed(3));
    section.style.setProperty("--early-square", square.toFixed(3));
    section.style.setProperty("--early-heading", heading.toFixed(3));
    section.style.setProperty("--early-copy", copy.toFixed(3));
    section.style.setProperty("--early-beam", beam.toFixed(3));
    section.style.setProperty("--early-light", light.toFixed(3));
    section.style.setProperty("--early-action", action.toFixed(3));
    benefits.forEach((benefit, index) => { benefit.dataset.benefitState = index === active ? "active" : index < active ? "complete" : "upcoming"; });
  };

  // Place the live beam over the door as drawn by object-fit: cover at the media's current size and object-position.
  const layoutDoor = () => {
    const door = phoneQuery.matches ? DOOR.portrait : DOOR.desktop;
    const width = media.clientWidth;
    const height = media.clientHeight;
    if (!width || !height) return;
    const scale = Math.max(width / door.width, height / door.height);
    const [positionX, positionY] = getComputedStyle(poster).objectPosition.split(" ").map((value) => value.endsWith("%") ? parseFloat(value) / 100 : .5);
    const left = (width - door.width * scale) * positionX;
    const top = (height - door.height * scale) * positionY;
    const doorHeight = door.height * door.doorHeight * scale;
    media.style.setProperty("--door-x", `${(left + door.width * door.x * scale).toFixed(1)}px`);
    media.style.setProperty("--door-top", `${(top + door.height * door.top * scale).toFixed(1)}px`);
    media.style.setProperty("--door-h", `${doorHeight.toFixed(1)}px`);
    media.style.setProperty("--door-w", `${(door.width * door.doorWidth * scale).toFixed(1)}px`);
    // The beam keeps a constant width of at least 52px; only its height grows.
    media.style.setProperty("--beam-w", `${Math.max(MIN_BEAM, door.width * door.doorWidth * .0675 * scale).toFixed(1)}px`);
    media.dataset.doorReady = "";
  };
  new ResizeObserver(layoutDoor).observe(media);
  poster.addEventListener("load", layoutDoor);

  const detachVideo = () => {
    video.pause();
    video.replaceChildren();
    video.removeAttribute("src");
    video.load();
    sourcesAttached = false;
    section.dataset.videoState = "idle";
  };
  const attachVideo = async () => {
    if (sourcesAttached || reducedMotionQuery.matches || saveData || document.documentElement.dataset.persona !== "visionary") return;
    sourcesAttached = true;
    section.dataset.videoState = "loading";
    const size = innerWidth < 768 ? "mobile" : "desktop";
    const formats = [["webm", "video/webm"], ["mp4", "video/mp4"]];
    formats.forEach(([format, type]) => {
      const source = document.createElement("source");
      source.src = video.dataset[`${size}${format[0].toUpperCase()}${format.slice(1)}`];
      source.type = type;
      video.append(source);
    });
    video.load();
    try { await video.play(); section.dataset.videoState = "playing"; }
    catch { section.dataset.videoState = "fallback"; }
  };
  const installMediaObserver = () => {
    mediaObserver = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) attachVideo();
      else if (sourcesAttached) { video.pause(); section.dataset.videoState = "paused"; }
    }, { rootMargin: "500px" });
    mediaObserver.observe(section);
    video.addEventListener("playing", () => { section.dataset.videoState = "playing"; }, { signal: abort.signal });
    video.addEventListener("error", () => { section.dataset.videoState = "fallback"; }, { signal: abort.signal });
  };
  const showAll = () => {
    setState({ ...COMPLETE, active: benefits.length - 1, light: 1 });
    benefits.forEach((benefit) => benefit.dataset.benefitState = "complete");
  };
  const setupPinned = () => {
    installMediaObserver();
    setState(earlyAccessStateAt(0));
    const header = document.querySelector(".site-header");
    trigger = ScrollTrigger.create({
      trigger: section,
      start: () => `top ${header?.offsetHeight || 76}px`,
      end: () => `bottom-=${pin.offsetHeight} ${header?.offsetHeight || 76}px`,
      scrub: .55,
      invalidateOnRefresh: true,
      onUpdate: ({ progress }) => setState(earlyAccessStateAt(progress)),
    });
  };
  const setupFlow = () => {
    installMediaObserver();
    setState({ ...COMPLETE, active: -1, light: .72 });
    benefitObserver = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const index = benefits.indexOf(entry.target);
      benefits.forEach((benefit, benefitIndex) => { benefit.dataset.benefitState = benefitIndex === index ? "active" : benefitIndex < index ? "complete" : "upcoming"; });
      section.dataset.activeBenefit = String(index + 1);
    }), { rootMargin: "-26% 0px -42%", threshold: .08 });
    benefits.forEach((benefit) => benefitObserver.observe(benefit));
  };
  const teardown = () => {
    trigger?.kill(); trigger = null;
    benefitObserver?.disconnect(); benefitObserver = null;
    mediaObserver?.disconnect(); mediaObserver = null;
    abort.abort(); abort = new AbortController();
    detachVideo();
  };
  const setup = (nextMode = modeForPage()) => {
    teardown(); mode = nextMode; section.dataset.earlyAccessMode = mode;
    requestAnimationFrame(layoutDoor);
    if (document.documentElement.dataset.persona !== "visionary") { showAll(); section.dataset.videoState = "paused"; return; }
    if (mode === "pinned") setupPinned();
    else if (mode === "flow") setupFlow();
    else {
      showAll();
      if (!reducedMotionQuery.matches && !saveData && innerWidth > 480) installMediaObserver();
    }
    requestAnimationFrame(() => ScrollTrigger.refresh());
  };

  addEventListener("ezrewards:cinematic-mode", () => setup(modeForPage()));
  const personaChanged = (event) => setup(event.detail.persona === "visionary" ? modeForPage() : "static");
  addEventListener("ezrewards:persona_changed", personaChanged);
  addEventListener("ezrewards:persona_selected", personaChanged);
  reducedMotionQuery.addEventListener("change", () => setup(modeForPage()));
  phoneQuery.addEventListener("change", () => setup(modeForPage()));
  compactPhoneQuery.addEventListener("change", () => setup(modeForPage()));
  const personaObserver = new MutationObserver(() => setup(modeForPage()));
  personaObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-persona"] });
  addEventListener("pagehide", () => { personaObserver.disconnect(); teardown(); }, { once: true });
  setup();
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initEarlyAccessGateway, { once: true });
else initEarlyAccessGateway();
