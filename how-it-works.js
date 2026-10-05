import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { smoothScrollTo } from "./visionary-smooth-scroll.js";
import { createTransparentOutputPass } from "./cinematic-alpha-pass.js";

gsap.registerPlugin(ScrollTrigger);

export const STAGES = ["notice", "recognize", "celebrate", "reward", "learn"];
// Scroll progress windows in which each stage holds; the gaps between them are transitions.
const HOLDS = [[0, .18], [.24, .38], [.44, .58], [.64, .78], [.84, .94]];
const STAGE_POINTS = HOLDS.map(([start, end]) => (start + end) / 2);
const COMPLETE_AT = .94;
const FULL_COUNT = 16000;
const REDUCED_COUNT = 8000;
const STAGE_COUNT = FULL_COUNT / STAGES.length;
const ANCHORS = [[0, 0, 0], [6.2, 1, -1.4], [12.4, -.7, -.4], [18.6, .9, -1.8], [24.8, 0, -.6]].map((point) => new THREE.Vector3(...point));
const COLOR = {
  mint: new THREE.Color("#82efc8"), violet: new THREE.Color("#c5a6ff"), gold: new THREE.Color("#ffc978"),
  amber: new THREE.Color("#ffb86b"), teal: new THREE.Color("#6fd8e6"), white: new THREE.Color("#f4f1ff"),
};

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const ease = (value) => value * value * (3 - 2 * value);
const seeded = (seed = 92317) => () => {
  seed = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  seed ^= seed + Math.imul(seed ^ (seed >>> 7), 61 | seed);
  return ((seed ^ (seed >>> 14)) >>> 0) / 4294967296;
};

// Maps section progress (0–1) to the stage story: which stage is active, how far each has formed and retired.
export function journeyAt(progress, entry = 1) {
  const p = clamp(progress);
  const form = STAGES.map((_, index) => index === 0 ? clamp(entry) : clamp((p - HOLDS[index - 1][1]) / (HOLDS[index][0] - HOLDS[index - 1][1])));
  const memory = STAGES.map((_, index) => index < STAGES.length - 1 ? form[index + 1] : 0);
  let index = STAGES.length - 1;
  let phase = "complete";
  let travel = STAGES.length - 1;
  if (p < COMPLETE_AT) {
    const holding = HOLDS.findIndex(([start, end]) => p >= start && p <= end);
    if (holding >= 0) {
      index = holding; phase = "hold"; travel = holding;
    } else {
      const from = HOLDS.findIndex(([, end], i) => p > end && p < HOLDS[i + 1][0]);
      const t = form[from + 1];
      index = t < .5 ? from : from + 1; phase = "transition"; travel = from + ease(t);
    }
  }
  return { progress: p, index, phase, form, memory, travel, complete: clamp((p - COMPLETE_AT) / .04) };
}

// Authored counts are in base units; each is multiplied by DENSITY so strokes thicken and fills read as solid.
const DENSITY = 3.8;

function createSampler(seed) {
  const random = seeded(seed);
  const positions = [];
  const colors = [];
  const weights = [];
  const jitter = (amount = .03) => (random() - .5) * amount;
  const scaled = (count) => Math.round(count * DENSITY);
  const push = (x, y, z, color, weight = 1) => {
    positions.push(x + jitter(), y + jitter(), z + jitter(.14));
    colors.push(color.r, color.g, color.b);
    weights.push(weight);
  };
  const insidePolygon = (x, y, points) => {
    let inside = false;
    for (let i = 0, j = points.length - 1; i < points.length; j = i, i += 1) {
      const [xi, yi] = points[i];
      const [xj, yj] = points[j];
      if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  };
  const starPoints = (cx, cy, outer, inner, spikes, rotation) => Array.from({ length: spikes * 2 + 1 }, (_, i) => {
    const radius = i % 2 ? inner : outer;
    const angle = rotation + i * Math.PI / spikes;
    return [cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius];
  });
  const sampler = {
    random,
    line([ax, ay, az = 0], [bx, by, bz = 0], count, color, { width = .05, weight = 1 } = {}) {
      const length = Math.hypot(bx - ax, by - ay) || 1;
      const nx = -(by - ay) / length;
      const ny = (bx - ax) / length;
      for (let i = 0, total = scaled(count); i < total; i += 1) {
        const t = random();
        const offset = (random() - .5) * width;
        push(ax + (bx - ax) * t + nx * offset, ay + (by - ay) * t + ny * offset, az + (bz - az) * t, color, weight);
      }
    },
    polyline(points, count, color, options) {
      const segments = points.slice(1).map((point, index) => [points[index], point]);
      const lengths = segments.map(([a, b]) => Math.hypot(b[0] - a[0], b[1] - a[1]));
      const total = lengths.reduce((sum, value) => sum + value, 0);
      segments.forEach((segment, index) => sampler.line(segment[0], segment[1], count * lengths[index] / total, color, options));
    },
    arc(cx, cy, rx, count, color, { start = 0, end = Math.PI * 2, ry = rx, z = 0, rotate = 0, width = .05, weight = 1 } = {}) {
      for (let i = 0, total = scaled(count); i < total; i += 1) {
        const angle = start + (end - start) * random();
        const grow = 1 + (random() - .5) * width / Math.max(rx, ry);
        const x = Math.cos(angle) * rx * grow;
        const y = Math.sin(angle) * ry * grow;
        push(cx + x * Math.cos(rotate) - y * Math.sin(rotate), cy + x * Math.sin(rotate) + y * Math.cos(rotate), z, color, weight);
      }
    },
    // Area-uniform filled ellipse or sector.
    disc(cx, cy, rx, count, color, { start = 0, end = Math.PI * 2, ry = rx, z = 0, weight = .5 } = {}) {
      for (let i = 0, total = scaled(count); i < total; i += 1) {
        const angle = start + (end - start) * random();
        const radius = Math.sqrt(random());
        push(cx + Math.cos(angle) * rx * radius, cy + Math.sin(angle) * ry * radius, z, color, weight);
      }
    },
    rect(x0, y0, x1, y1, radius, count, color, options) {
      const w = x1 - x0 - radius * 2;
      const h = y1 - y0 - radius * 2;
      const corner = Math.PI * radius / 2;
      const total = w * 2 + h * 2 + corner * 4;
      sampler.line([x0 + radius, y0], [x1 - radius, y0], count * w / total, color, options);
      sampler.line([x0 + radius, y1], [x1 - radius, y1], count * w / total, color, options);
      sampler.line([x0, y0 + radius], [x0, y1 - radius], count * h / total, color, options);
      sampler.line([x1, y0 + radius], [x1, y1 - radius], count * h / total, color, options);
      const perCorner = count * corner / total;
      [[x1 - radius, y1 - radius, 0], [x0 + radius, y1 - radius, Math.PI / 2], [x0 + radius, y0 + radius, Math.PI], [x1 - radius, y0 + radius, Math.PI * 1.5]]
        .forEach(([cx, cy, start]) => sampler.arc(cx, cy, radius, perCorner, color, { ...options, start, end: start + Math.PI / 2 }));
    },
    fillRect(x0, y0, x1, y1, count, color, { z = 0, weight = .2 } = {}) {
      for (let i = 0, total = scaled(count); i < total; i += 1) push(x0 + (x1 - x0) * random(), y0 + (y1 - y0) * random(), z, color, weight);
    },
    star(cx, cy, outer, inner, spikes, count, color, rotation = -Math.PI / 2) {
      sampler.polyline(starPoints(cx, cy, outer, inner, spikes, rotation), count, color);
    },
    fillStar(cx, cy, outer, inner, spikes, count, color, rotation = -Math.PI / 2, weight = .85) {
      const points = starPoints(cx, cy, outer, inner, spikes, rotation);
      for (let placed = 0, total = scaled(count); placed < total;) {
        const x = cx + (random() * 2 - 1) * outer;
        const y = cy + (random() * 2 - 1) * outer;
        if (insidePolygon(x, y, points)) { push(x, y, .05, color, weight); placed += 1; }
      }
    },
    heart(cx, cy, size, count, color) {
      for (let i = 0, total = scaled(count); i < total; i += 1) {
        const t = random() * Math.PI * 2;
        const x = 16 * Math.sin(t) ** 3;
        const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
        push(cx + x * size / 17, cy + y * size / 17, .05, color);
      }
    },
    // Fills heart()'s parametric outline by sampling its parameter and pulling each point toward the centre.
    fillHeart(cx, cy, size, count, color, weight = .8) {
      for (let i = 0, total = scaled(count); i < total; i += 1) {
        const t = random() * Math.PI * 2;
        const scale = Math.sqrt(random()) * size / 17;
        const x = 16 * Math.sin(t) ** 3;
        const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
        push(cx + x * scale, cy + (y + 2) * scale - 2 * size / 17, .05, color, weight);
      }
    },
    // Soft fill between a polyline and a horizontal baseline, densest just under the line.
    fillUnder(points, baseline, count, color, weight = .36) {
      const yAt = (x) => {
        const index = Math.min(points.length - 2, Math.max(0, points.findIndex(([px]) => px >= x) - 1));
        const [ax, ay] = points[index];
        const [bx, by] = points[index + 1];
        return ay + (by - ay) * ((x - ax) / ((bx - ax) || 1));
      };
      const [x0, x1] = [points[0][0], points[points.length - 1][0]];
      for (let i = 0, total = scaled(count); i < total; i += 1) {
        const x = x0 + (x1 - x0) * random();
        const top = yAt(x);
        push(x, top - (top - baseline) * random() ** 1.6, -.05, color, weight);
      }
    },
    dust(count, rx, ry, color) {
      for (let i = 0; i < count; i += 1) push((random() - .5) * rx * 2, (random() - .5) * ry * 2, (random() - .5) * .9, color, .6);
    },
    finish(count) {
      const authored = positions.length / 3;
      // Keep a light ambient dust, then top up the budget by re-sampling the authored shape so it only gets denser.
      sampler.dust(Math.min(Math.max(0, count - authored), Math.round(count * .04)), 2.3, 1.7, COLOR.white);
      while (positions.length / 3 < count) {
        const from = Math.floor(random() * authored);
        push(positions[from * 3], positions[from * 3 + 1], positions[from * 3 + 2], { r: colors[from * 3], g: colors[from * 3 + 1], b: colors[from * 3 + 2] }, weights[from]);
      }
      // Shuffle so any truncated draw range still keeps a recognizable version of every form.
      const order = [...Array(positions.length / 3).keys()];
      for (let i = order.length - 1; i > 0; i -= 1) { const j = Math.floor(random() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
      const outPositions = new Float32Array(count * 3);
      const outColors = new Float32Array(count * 3);
      const outWeights = new Float32Array(count);
      order.slice(0, count).forEach((from, to) => {
        outPositions.set(positions.slice(from * 3, from * 3 + 3), to * 3);
        outColors.set(colors.slice(from * 3, from * 3 + 3), to * 3);
        outWeights[to] = weights[from];
      });
      return { positions: outPositions, colors: outColors, weights: outWeights, authored };
    },
  };
  return sampler;
}

// Each form is authored around its own origin; FOCAL marks where the signal orb comes to rest.
const FOCAL = [[.9, .62, .25], [1.02, -.52, .25], [1.85, .3, .3], [1.85, 1.45, .3], [1.85, 1.15, .3]];

// Notice: a radar of attention sweeping toward a sparkle of contribution.
function noticeForm(count) {
  const s = createSampler(11);
  s.disc(0, 0, .7, 48, COLOR.mint, { weight: .68 });
  s.disc(0, 0, 1.94, 70, COLOR.teal, { start: 0, end: .6, weight: .52 });
  s.arc(0, 0, .72, 64, COLOR.mint);
  s.arc(0, 0, 1.34, 92, COLOR.mint, { start: -.35, end: Math.PI * 2 - .95 });
  s.arc(0, 0, 1.96, 112, COLOR.teal, { start: -.15, end: Math.PI * 2 - 1.25, width: .06 });
  s.line([0, 0], [Math.cos(.6) * 1.96, Math.sin(.6) * 1.96], 38, COLOR.teal, { width: .06 });
  for (let i = 0; i < 4; i += 1) { const angle = i * Math.PI / 2 + Math.PI / 2; s.line([Math.cos(angle) * 2.1, Math.sin(angle) * 2.1], [Math.cos(angle) * 2.35, Math.sin(angle) * 2.35], 8, COLOR.mint, { width: .07 }); }
  s.star(.9, .62, .4, .1, 4, 74, COLOR.white, 0);
  s.fillStar(.9, .62, .4, .1, 4, 34, COLOR.white, 0);
  [.52, .78, 1.04].forEach((radius, index) => s.arc(.9, .62, radius, 26 - index * 2, index ? COLOR.gold : COLOR.white, { start: -.15, end: 1.05 }));
  return s.finish(count);
}

// Recognize: a recognition card being written, with a gold badge.
function recognizeForm(count) {
  const s = createSampler(23);
  s.fillRect(-2.02, -1.07, 1.57, 1.05, 120, COLOR.violet, { weight: .34 });
  s.rect(-2.05, -1.1, 1.6, 1.08, .22, 150, COLOR.violet, { width: .06 });
  s.arc(-1.55, .6, .22, 30, COLOR.white);
  s.disc(-1.55, .6, .2, 22, COLOR.white, { weight: .85 });
  s.line([-1.15, .72], [.4, .72], 26, COLOR.violet, { width: .07 });
  s.line([-1.15, .42], [1, .42], 32, COLOR.violet, { width: .07 });
  s.line([-1.62, .06], [1.1, .06], 34, COLOR.white, { width: .07 });
  const stroke = Array.from({ length: 41 }, (_, i) => [-1.6 + 2.62 * i / 40, -.52 + Math.sin(i / 40 * Math.PI * 5) * .17]);
  s.polyline(stroke, 96, COLOR.gold, { width: .07 });
  s.disc(1.62, 1.1, .44, 40, COLOR.gold, { weight: .83 });
  s.arc(1.62, 1.1, .46, 62, COLOR.gold, { width: .06 });
  s.star(1.62, 1.1, .27, .11, 5, 48, COLOR.white);
  s.fillStar(1.62, 1.1, .27, .11, 5, 22, COLOR.white);
  return s.finish(count);
}

// Celebrate: the card shared into an orbit of reactions.
function celebrateForm(count) {
  const s = createSampler(37);
  const tilt = -.18;
  s.fillRect(-1.27, -.92, 1.27, .92, 100, COLOR.gold, { weight: .34 });
  s.rect(-1.3, -.95, 1.3, .95, .18, 124, COLOR.gold, { width: .06 });
  s.arc(-.9, .55, .18, 24, COLOR.white);
  s.disc(-.9, .55, .16, 16, COLOR.white, { weight: .85 });
  s.line([-.6, .6], [.5, .6], 20, COLOR.gold, { width: .07 });
  s.line([-1, .15], [1, .15], 24, COLOR.white, { width: .07 });
  s.line([-1, -.12], [.6, -.12], 18, COLOR.white, { width: .07 });
  [-.8, -.4, 0].forEach((x) => { s.arc(x, -.6, .1, 10, COLOR.gold); s.disc(x, -.6, .09, 8, COLOR.gold, { weight: .85 }); });
  s.arc(0, 0, 2.35, 124, COLOR.violet, { ry: .95, rotate: tilt, width: .07 });
  const onOrbit = (angle) => {
    const x = Math.cos(angle) * 2.35;
    const y = Math.sin(angle) * .95;
    return [x * Math.cos(tilt) - y * Math.sin(tilt), x * Math.sin(tilt) + y * Math.cos(tilt)];
  };
  s.heart(...onOrbit(.72), .3, 46, COLOR.amber);
  s.fillHeart(...onOrbit(.72), .3, 34, COLOR.amber);
  s.heart(...onOrbit(3.7), .2, 28, COLOR.gold);
  s.fillHeart(...onOrbit(3.7), .2, 18, COLOR.gold);
  [2.2, 4.75, 5.75].forEach((angle) => { s.arc(...onOrbit(angle), .16, 22, COLOR.mint); s.disc(...onOrbit(angle), .15, 14, COLOR.mint, { weight: .85 }); });
  s.star(...onOrbit(1.55), .14, .05, 4, 14, COLOR.white, 0);
  s.fillStar(...onOrbit(1.55), .14, .05, 4, 8, COLOR.white, 0);
  return s.finish(count);
}

// Reward: a wrapped gift beside a coin of value.
function rewardForm(count) {
  const s = createSampler(53);
  s.fillRect(-1.33, -1.43, 1.33, .33, 100, COLOR.gold, { weight: .44 });
  s.fillRect(-1.53, .37, 1.53, .83, 44, COLOR.gold, { weight: .62 });
  s.fillRect(-.12, -1.45, .12, .85, 34, COLOR.violet, { z: .05, weight: .85 });
  s.rect(-1.35, -1.45, 1.35, .35, .1, 130, COLOR.gold, { width: .06 });
  s.rect(-1.55, .35, 1.55, .85, .08, 86, COLOR.gold, { width: .06 });
  s.line([-.12, -1.45], [-.12, .85], 28, COLOR.violet);
  s.line([.12, -1.45], [.12, .85], 28, COLOR.violet);
  s.arc(-.46, 1.12, .45, 44, COLOR.violet, { ry: .27, width: .06 });
  s.arc(.46, 1.12, .45, 44, COLOR.violet, { ry: .27, width: .06 });
  s.disc(-.46, 1.12, .43, 26, COLOR.violet, { ry: .25, weight: .85 });
  s.disc(.46, 1.12, .43, 26, COLOR.violet, { ry: .25, weight: .85 });
  s.disc(0, 1.02, .1, 10, COLOR.white, { weight: .85 });
  s.disc(1.85, 1.45, .4, 36, COLOR.teal, { weight: .73 });
  s.arc(1.85, 1.45, .42, 56, COLOR.teal, { width: .06 });
  s.arc(1.85, 1.45, .25, 30, COLOR.mint);
  s.star(1.85, 1.45, .14, .06, 4, 16, COLOR.white, 0);
  s.fillStar(1.85, 1.45, .14, .06, 4, 10, COLOR.white, 0);
  s.line([1.1, .95], [1.55, 1.2], 16, COLOR.gold, { width: .06 });
  return s.finish(count);
}

// Learn: culture insight rising on a chart, fed by a connected network.
function learnForm(count) {
  const s = createSampler(71);
  s.line([-2.15, -1.38], [2.2, -1.38], 38, COLOR.teal, { width: .06 });
  s.line([-2.15, -1.38], [-2.15, 1.45], 28, COLOR.teal, { width: .06 });
  const graph = [[-1.9, -1.05], [-1.1, -.7], [-.35, -.82], [.4, -.1], [1.1, .25], [1.85, 1.15]];
  s.fillUnder(graph, -1.38, 120, COLOR.teal);
  s.polyline(graph, 138, COLOR.teal, { width: .07 });
  graph.forEach(([x, y]) => { s.arc(x, y, .1, 12, COLOR.white); s.disc(x, y, .09, 8, COLOR.white, { weight: .85 }); });
  const nodes = [[-1.6, .88], [-1, 1.3], [-.45, .78], [-1.1, .36], [-.1, 1.28]];
  [[0, 1], [1, 2], [2, 3], [3, 0], [1, 4], [2, 4], [0, 2]].forEach(([a, b]) => s.line(nodes[a], nodes[b], 13, COLOR.violet));
  nodes.forEach(([x, y]) => { s.arc(x, y, .1, 13, COLOR.mint); s.disc(x, y, .09, 8, COLOR.mint, { weight: .85 }); });
  s.arc(1.85, 1.15, .24, 30, COLOR.white);
  s.disc(1.85, 1.15, .22, 20, COLOR.white, { weight: .85 });
  return s.finish(count);
}

const FORMS = [noticeForm, recognizeForm, celebrateForm, rewardForm, learnForm];

const VERTEX_SHADER = `
  attribute vec3 aOrigin; attribute vec3 aColor; attribute float aStage; attribute float aSeed; attribute float aWeight;
  uniform float uForm[5]; uniform float uMemory[5]; uniform vec3 uAnchor[5]; uniform vec3 uFocus;
  uniform float uTime; uniform float uHold; uniform float uComplete; uniform float uPixelRatio; uniform float uSize;
  varying vec3 vColor; varying float vAlpha;
  float ease(float v) { v = clamp(v, 0., 1.); return v * v * (3. - 2. * v); }
  void main() {
    int stage = int(aStage + .5);
    float form = ease(uForm[stage] * 1.35 - aSeed * .35);
    float memory = ease(uMemory[stage] * 1.35 - aSeed * .35);
    vec3 anchor = uAnchor[stage];
    float breath = sin(uTime * 1.35 + aSeed * 6.283) * .018 * uHold + sin(uTime * .9) * .012 * uHold;
    vec3 scattered = anchor + aOrigin;
    vec3 formed = anchor + position * (1. + breath);
    float angle = aStage * 1.2566 + uTime * .045 + 2.1;
    float radius = 1. + uComplete * .18;
    vec3 ghost = uFocus + vec3(cos(angle) * 2.95 * radius, sin(angle) * 1.7 * radius, -2.6) + position * .28;
    vec3 p = mix(mix(scattered, formed, form), ghost, memory);
    float travel = form * (1. - form) + memory * (1. - memory);
    p += vec3(sin(uTime * 1.3 + aSeed * 40.), cos(uTime * 1.1 + aSeed * 31.), sin(aSeed * 17. + uTime)) * travel * .75;
    vec4 mv = modelViewMatrix * vec4(p, 1.);
    gl_Position = projectionMatrix * mv;
    // Fill particles (aWeight < 1) are smaller and dimmer so solid areas read as filled without blowing out the bloom.
    gl_PointSize = (2.2 + aSeed * 2.4) * mix(.92, 1., aWeight) * mix(1., .72, memory) * uSize * uPixelRatio * (8. / -mv.z);
    vColor = aColor;
    vAlpha = (.46 + aSeed * .4) * aWeight * mix(.035, 1., form) * mix(1., .22, memory);
  }`;

const FRAGMENT_SHADER = `
  varying vec3 vColor; varying float vAlpha;
  void main() {
    float d = distance(gl_PointCoord, vec2(.5));
    if (d > .5) discard;
    gl_FragColor = vec4(vColor, smoothstep(.5, .05, d) * vAlpha);
  }`;

const ORB_VERTEX = `
  attribute float aTrail; uniform float uPixelRatio; uniform float uTime; uniform float uHold;
  varying float vTrail;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.);
    gl_Position = projectionMatrix * mv;
    float pulse = 1. + sin(uTime * 2.2) * .12 * uHold;
    float head = aTrail < .5 ? 1. : 0.;
    gl_PointSize = mix(10. * (1. - aTrail / 40.), 34. * pulse, head) * uPixelRatio * (8. / -mv.z);
    vTrail = aTrail;
  }`;

const ORB_FRAGMENT = `
  varying float vTrail;
  void main() {
    float d = distance(gl_PointCoord, vec2(.5));
    if (d > .5) discard;
    float core = smoothstep(.2, 0., d);
    float halo = smoothstep(.5, .04, d);
    float fade = 1. - vTrail / 40.;
    vec3 color = mix(vec3(.51, .94, .78), vec3(1.), core);
    gl_FragColor = vec4(color, (halo * .55 + core) * fade * (vTrail < .5 ? 1. : .45));
  }`;

class SignalJourney {
  constructor(section, onFailure) {
    this.section = section;
    this.host = section.querySelector(".cinematic-how__visual");
    this.onFailure = onFailure;
    this.running = false;
    this.visible = false;
    this.frame = 0;
    this.samples = [];
    this.frameCount = 0;
    this.state = journeyAt(0, 0);
    this.camU = 0;
    this.orbU = 0;
    this.hold = 1;
    this.complete = 0;
    this.form = new Float32Array(5);
    this.memory = new Float32Array(5);
    this.parallax = new THREE.Vector2();
    this.parallaxTarget = new THREE.Vector2();
    this.abort = new AbortController();
    try {
      this.init();
    } catch (error) {
      this.failed = true;
      this.dispose();
      onFailure(error);
    }
  }

  init() {
    // A fresh canvas per instance lets dispose() release the context without poisoning the next rebuild.
    const previous = this.host.querySelector("[data-how-canvas]");
    this.canvas = previous.cloneNode(false);
    previous.replaceWith(this.canvas);
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, alpha: true, antialias: false, powerPreference: "high-performance" });
    this.pixelRatio = Math.min(devicePixelRatio || 1, 1.5);
    this.renderer.setPixelRatio(this.pixelRatio);
    this.renderer.setClearColor(0x000000, 0);
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(38, 1, .1, 60);
    this.anchorCurve = new THREE.CatmullRomCurve3(ANCHORS, false, "centripetal");
    this.orbCurve = new THREE.CatmullRomCurve3(ANCHORS.map((anchor, index) => anchor.clone().add(new THREE.Vector3(...FOCAL[index]))), false, "centripetal");
    this.buildParticles();
    this.buildOrb();
    this.buildPath();
    this.buildDust();
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), .42, .32, .74);
    this.composer.addPass(this.bloom);
    this.composer.addPass(createTransparentOutputPass());
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.host);
    this.intersectionObserver = new IntersectionObserver(([entry]) => {
      this.visible = entry.isIntersecting;
      this.section.dataset.renderState = this.visible ? "active" : "paused";
      if (this.visible) this.start(); else this.stop();
    }, { rootMargin: "300px" });
    this.intersectionObserver.observe(this.section);
    if (matchMedia("(hover: hover) and (pointer: fine)").matches) {
      this.host.addEventListener("pointermove", (event) => {
        const rect = this.host.getBoundingClientRect();
        this.parallaxTarget.set(((event.clientX - rect.left) / rect.width) * 2 - 1, ((event.clientY - rect.top) / rect.height) * 2 - 1);
      }, { signal: this.abort.signal });
      this.host.addEventListener("pointerleave", () => this.parallaxTarget.set(0, 0), { signal: this.abort.signal });
    }
    this.resize();
    this.section.dataset.particleCount = String(FULL_COUNT);
  }

  buildParticles() {
    const positions = new Float32Array(FULL_COUNT * 3);
    const origins = new Float32Array(FULL_COUNT * 3);
    const colors = new Float32Array(FULL_COUNT * 3);
    const stages = new Float32Array(FULL_COUNT);
    const seeds = new Float32Array(FULL_COUNT);
    const weights = new Float32Array(FULL_COUNT);
    const random = seeded(4099);
    const forms = FORMS.map((build) => build(STAGE_COUNT));
    // Interleave stages so a reduced draw range removes particles evenly from all five forms.
    for (let i = 0; i < FULL_COUNT; i += 1) {
      const stage = i % STAGES.length;
      const local = Math.floor(i / STAGES.length);
      positions.set(forms[stage].positions.subarray(local * 3, local * 3 + 3), i * 3);
      colors.set(forms[stage].colors.subarray(local * 3, local * 3 + 3), i * 3);
      weights[i] = forms[stage].weights[local];
      const radius = 2.4 + random() * 3.2;
      const theta = random() * Math.PI * 2;
      const phi = Math.acos(random() * 2 - 1);
      origins.set([Math.sin(phi) * Math.cos(theta) * radius, Math.cos(phi) * radius * .7, Math.sin(phi) * Math.sin(theta) * radius - 1], i * 3);
      stages[i] = stage;
      seeds[i] = random();
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("aOrigin", new THREE.BufferAttribute(origins, 3));
    geometry.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute("aStage", new THREE.BufferAttribute(stages, 1));
    geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    geometry.setAttribute("aWeight", new THREE.BufferAttribute(weights, 1));
    geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(12.4, 0, -1), 22);
    this.uniforms = {
      uForm: { value: this.form }, uMemory: { value: this.memory }, uAnchor: { value: ANCHORS },
      uFocus: { value: new THREE.Vector3() }, uTime: { value: 0 }, uHold: { value: 1 }, uComplete: { value: 0 },
      uPixelRatio: { value: this.pixelRatio }, uSize: { value: 1 },
    };
    const material = new THREE.ShaderMaterial({
      uniforms: this.uniforms, vertexShader: VERTEX_SHADER, fragmentShader: FRAGMENT_SHADER,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    });
    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }

  buildOrb() {
    this.trail = new Float32Array(41 * 3);
    const trailIndex = new Float32Array(41).map((_, index) => index);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(this.trail, 3));
    geometry.setAttribute("aTrail", new THREE.BufferAttribute(trailIndex, 1));
    geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(12.4, 0, -1), 22);
    const material = new THREE.ShaderMaterial({
      uniforms: { uPixelRatio: this.uniforms.uPixelRatio, uTime: this.uniforms.uTime, uHold: this.uniforms.uHold },
      vertexShader: ORB_VERTEX, fragmentShader: ORB_FRAGMENT,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    });
    this.orb = new THREE.Points(geometry, material);
    this.orb.renderOrder = 2;
    const start = this.orbCurve.getPoint(0);
    for (let i = 0; i < 41; i += 1) this.trail.set([start.x, start.y, start.z], i * 3);
    this.scene.add(this.orb);
  }

  buildPath() {
    this.pathPoints = 240;
    const geometry = new THREE.BufferGeometry().setFromPoints(this.orbCurve.getPoints(this.pathPoints - 1));
    geometry.setDrawRange(0, 1);
    const material = new THREE.LineBasicMaterial({ color: 0x6fd8e6, transparent: true, opacity: .1, depthWrite: false, blending: THREE.AdditiveBlending });
    this.path = new THREE.Line(geometry, material);
    this.scene.add(this.path);
  }

  buildDust() {
    const count = 260;
    const values = new Float32Array(count * 3);
    const random = seeded(157);
    for (let i = 0; i < count; i += 1) values.set([-6 + random() * 38, (random() - .5) * 9, -3 - random() * 5], i * 3);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(values, 3));
    const material = new THREE.PointsMaterial({ color: 0x9ddcc4, size: .03, transparent: true, opacity: .22, depthWrite: false });
    this.dust = new THREE.Points(geometry, material);
    this.scene.add(this.dust);
  }

  setState(state) { this.state = state; }

  resize() {
    if (!this.renderer) return;
    const width = Math.max(1, this.host.clientWidth);
    const height = Math.max(1, this.host.clientHeight);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
    this.composer?.setSize(width, height);
    this.uniforms.uSize.value = clamp(height / 560, .7, 1.25) * (this.reduced ? 1.3 : 1);
  }

  start() {
    if (this.running || !this.renderer) return;
    this.running = true;
    this.lastTime = performance.now();
    this.frame = requestAnimationFrame((now) => this.render(now));
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.frame);
  }

  render(now) {
    if (!this.running) return;
    const delta = Math.min(now - this.lastTime, 50);
    this.lastTime = now;
    const seconds = delta / 1000;
    const damp = (current, target, rate) => current + (target - current) * (1 - Math.exp(-rate * seconds));
    const { form, memory, travel, phase, complete } = this.state;
    for (let i = 0; i < 5; i += 1) {
      this.form[i] = damp(this.form[i], form[i], 7);
      this.memory[i] = damp(this.memory[i], memory[i], 7);
    }
    this.camU = damp(this.camU, travel, 3.2);
    this.orbU = damp(this.orbU, travel, 5.5);
    this.hold = damp(this.hold, phase === "transition" ? 0 : 1, 4);
    this.complete = damp(this.complete, complete, 4);
    this.parallax.x = damp(this.parallax.x, this.parallaxTarget.x, 5);
    this.parallax.y = damp(this.parallax.y, this.parallaxTarget.y, 5);

    const focus = this.anchorCurve.getPoint(clamp(this.camU / 4));
    const distance = 8.4 + this.complete * 1.6;
    // Convert the 10px parallax ceiling into world units at the focus plane.
    const worldPerPixel = (2 * Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2)) * distance) / Math.max(this.host.clientHeight, 1);
    const shiftX = -this.parallax.x * 10 * worldPerPixel;
    const shiftY = this.parallax.y * 10 * worldPerPixel;
    this.camera.position.set(focus.x + shiftX, focus.y + .1 + shiftY, focus.z + distance);
    this.camera.lookAt(focus.x + shiftX, focus.y + shiftY, focus.z);
    this.uniforms.uFocus.value.copy(focus);
    this.uniforms.uTime.value = now / 1000;
    this.uniforms.uHold.value = this.hold;
    this.uniforms.uComplete.value = this.complete;

    const orb = this.orbCurve.getPoint(clamp(this.orbU / 4));
    this.trail.copyWithin(3, 0, 40 * 3);
    this.trail.set([orb.x, orb.y, orb.z], 0);
    this.orb.geometry.attributes.position.needsUpdate = true;
    this.path.geometry.setDrawRange(0, Math.max(1, Math.round(clamp(this.orbU / 4) * (this.pathPoints - 1)) + 1));

    if (this.composer && !this.reduced) this.composer.render(); else this.renderer.render(this.scene, this.camera);

    // Skip shader warm-up frames, then watch the rolling average frame time.
    this.frameCount += 1;
    if (this.frameCount > 30 && !this.reduced) {
      this.samples.push(delta);
      if (this.samples.length > 90) this.samples.shift();
      if (this.samples.length === 90 && this.samples.reduce((sum, value) => sum + value, 0) / 90 > 24) this.reduceLoad();
    }
    this.frame = requestAnimationFrame((time) => this.render(time));
  }

  reduceLoad() {
    this.reduced = true;
    this.particles.geometry.setDrawRange(0, REDUCED_COUNT);
    this.composer?.dispose();
    this.composer = null;
    this.section.dataset.particleCount = String(REDUCED_COUNT);
    this.section.dataset.performanceTier = "reduced";
    // Fewer, unbloomed particles need a little more size to keep each form legible.
    this.resize();
  }

  dispose() {
    this.stop();
    this.abort.abort();
    this.resizeObserver?.disconnect();
    this.intersectionObserver?.disconnect();
    this.scene?.traverse((object) => {
      object.geometry?.dispose?.();
      object.material?.dispose?.();
    });
    this.composer?.dispose?.();
    this.renderer?.dispose();
    this.renderer?.forceContextLoss();
    this.renderer = null;
    delete this.section.dataset.performanceTier;
  }
}

function initHowItWorks() {
  const section = document.querySelector("[data-how-it-works]");
  const page = section?.closest(".visionary-refresh");
  if (!section || !page) return;
  const tabs = [...section.querySelectorAll("[data-how-stage]")];
  const panelList = section.querySelector(".cinematic-how__panels");
  const panels = [...section.querySelectorAll("[data-how-panel]")];
  let journey = null;
  let trigger = null;
  let entryTrigger = null;
  let revealObserver = null;
  let abort = new AbortController();
  let activeIndex = 0;
  let entry = 0;
  let progress = 0;
  let lockedIndex = null;
  let lockTimer = 0;
  let mode = "";

  const resolveMode = () => {
    if (document.documentElement.dataset.persona !== "visionary") return "inactive";
    const cinematic = page.dataset.cinematicMode;
    if (cinematic === "full") return "pinned";
    if (cinematic === "adaptive" && innerWidth >= 768) return "flow";
    return "static";
  };

  function setListSemantics() {
    panelList.setAttribute("role", "list");
    panels.forEach((panel) => {
      panel.setAttribute("role", "listitem");
      panel.removeAttribute("aria-labelledby");
      panel.removeAttribute("aria-hidden");
      panel.removeAttribute("inert");
    });
  }

  function setTabSemantics() {
    panelList.removeAttribute("role");
    panels.forEach((panel, index) => {
      panel.setAttribute("role", "tabpanel");
      panel.setAttribute("aria-labelledby", tabs[index].id);
    });
  }

  function setActive(index, { focus = false } = {}) {
    activeIndex = clamp(index, 0, STAGES.length - 1);
    section.dataset.activeStage = STAGES[activeIndex];
    tabs.forEach((tab, tabIndex) => {
      const selected = tabIndex === activeIndex;
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
      tab.dataset.state = selected ? "active" : tabIndex < activeIndex ? "complete" : "upcoming";
    });
    if (mode === "pinned") {
      panels.forEach((panel, panelIndex) => {
        const selected = panelIndex === activeIndex;
        panel.setAttribute("aria-hidden", String(!selected));
        panel.toggleAttribute("inert", !selected);
      });
    }
    if (focus) tabs[activeIndex]?.focus();
  }

  function render() {
    const state = journeyAt(progress, Math.max(entry, progress > 0 ? 1 : 0));
    journey?.setState(state);
    section.style.setProperty("--how-progress", state.progress.toFixed(4));
    section.dataset.howPhase = state.phase;
    section.toggleAttribute("data-how-complete", state.phase === "complete");
    if (lockedIndex === null && state.index !== activeIndex) setActive(state.index);
  }

  function releaseLock() {
    clearTimeout(lockTimer);
    lockedIndex = null;
    render();
  }

  function goToStage(index) {
    setActive(index, { focus: true });
    if (!trigger) return;
    // Hold the chosen tab while the scroll travels past intermediate stages.
    lockedIndex = activeIndex;
    clearTimeout(lockTimer);
    lockTimer = setTimeout(releaseLock, 2200);
    smoothScrollTo(trigger.start + (trigger.end - trigger.start) * STAGE_POINTS[activeIndex], { onComplete: releaseLock });
  }

  function failToSvg() {
    journey = null;
    section.dataset.renderState = "fallback";
    section.dataset.webglFallback = "true";
  }

  function setupPinned() {
    setTabSemantics();
    setActive(activeIndex);
    journey = new SignalJourney(section, failToSvg);
    if (journey.failed) journey = null;
    const headerOffset = () => document.querySelector(".site-header")?.offsetHeight || 76;
    trigger = ScrollTrigger.create({
      trigger: section,
      start: () => `top ${headerOffset()}px`,
      end: () => `bottom bottom`,
      invalidateOnRefresh: true,
      onUpdate: (self) => { progress = self.progress; render(); },
      onRefresh: (self) => { progress = self.progress; render(); },
    });
    entryTrigger = ScrollTrigger.create({
      trigger: section,
      start: "top bottom",
      end: () => `top ${headerOffset()}px`,
      invalidateOnRefresh: true,
      onUpdate: (self) => { entry = self.progress; render(); },
      onRefresh: (self) => { entry = self.progress; render(); },
    });
    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => goToStage(index), { signal: abort.signal });
      tab.addEventListener("keydown", (event) => {
        let target;
        if (["ArrowDown", "ArrowRight"].includes(event.key)) target = Math.min(index + 1, tabs.length - 1);
        else if (["ArrowUp", "ArrowLeft"].includes(event.key)) target = Math.max(index - 1, 0);
        else if (event.key === "Home") target = 0;
        else if (event.key === "End") target = tabs.length - 1;
        else return;
        event.preventDefault();
        goToStage(target);
      }, { signal: abort.signal });
    });
    render();
  }

  function setupFlow() {
    setListSemantics();
    if (!("IntersectionObserver" in window)) { panels.forEach((panel) => panel.classList.add("is-revealed")); return; }
    revealObserver = new IntersectionObserver((entries, observer) => {
      entries.filter((item) => item.isIntersecting)
        .sort((a, b) => panels.indexOf(a.target) - panels.indexOf(b.target))
        .forEach((item, order) => {
          item.target.style.setProperty("--reveal-delay", `${order * 120}ms`);
          item.target.classList.add("is-revealed");
          observer.unobserve(item.target);
        });
    }, { threshold: .2, rootMargin: "0px 0px -8% 0px" });
    panels.forEach((panel) => revealObserver.observe(panel));
  }

  // Tablet and phone: a left-hand signal line fills as the reader scrolls through the stage cards.
  function setupListProgress() {
    let frame = 0;
    const update = () => {
      frame = 0;
      const bounds = panelList.getBoundingClientRect();
      const reach = innerHeight * .6 - bounds.top;
      panelList.style.setProperty("--how-list-progress", clamp(reach / Math.max(bounds.height, 1)).toFixed(4));
      panels.forEach((panel) => panel.toggleAttribute("data-reached", reach >= panel.offsetTop + 30));
      const reached = panels.filter((panel) => panel.hasAttribute("data-reached")).length;
      section.dataset.activeStage = STAGES[Math.max(0, reached - 1)];
    };
    const request = () => { if (!frame) frame = requestAnimationFrame(update); };
    addEventListener("scroll", request, { passive: true, signal: abort.signal });
    addEventListener("resize", request, { passive: true, signal: abort.signal });
    abort.signal.addEventListener("abort", () => cancelAnimationFrame(frame));
    update();
  }

  function teardown() {
    trigger?.kill(); trigger = null;
    entryTrigger?.kill(); entryTrigger = null;
    revealObserver?.disconnect(); revealObserver = null;
    journey?.dispose(); journey = null;
    clearTimeout(lockTimer); lockedIndex = null;
    abort.abort(); abort = new AbortController();
    panels.forEach((panel) => { panel.classList.remove("is-revealed"); panel.style.removeProperty("--reveal-delay"); panel.removeAttribute("data-reached"); });
    panelList.style.removeProperty("--how-list-progress");
    section.style.removeProperty("--how-progress");
    delete section.dataset.webglFallback;
    delete section.dataset.howPhase;
    delete section.dataset.particleCount;
    section.removeAttribute("data-how-complete");
  }

  function setup() {
    const next = resolveMode();
    if (next === mode) return;
    teardown();
    mode = next;
    section.dataset.howMode = next === "inactive" ? "static" : next;
    section.dataset.renderState = "idle";
    if (next === "pinned") setupPinned();
    else {
      setListSemantics();
      setActive(activeIndex);
      section.dataset.renderState = next === "inactive" ? "paused" : "fallback";
      if (next === "flow") setupFlow();
      if (next !== "inactive") setupListProgress();
    }
    requestAnimationFrame(() => ScrollTrigger.refresh());
  }

  addEventListener("ezrewards:cinematic-mode", setup);
  addEventListener("resize", () => { if (mode === "flow" || mode === "static") setup(); }, { passive: true });
  new MutationObserver(setup).observe(document.documentElement, { attributes: true, attributeFilter: ["data-persona"] });
  addEventListener("pagehide", () => { teardown(); mode = ""; }, { once: true });
  setup();
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initHowItWorks, { once: true });
else initHowItWorks();
