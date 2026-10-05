// Scroll-progress anchors for the Operator pinned scenes. Dependency-free so tests can import the
// exact arrays the engine uses instead of mirroring them.
export const CATEGORY_ANCHORS = [.12, .50, .88];
export const LOOP_ANCHORS = [.06, .26, .50, .74, .94];
export const CAPABILITY_ANCHORS = [.04, .17, .30, .43, .56, .69, .82, .95];
// Particle illustration shown on the capability phone for each point, in card order.
export const CAPABILITY_SHAPES = ["recognition", "ai-message", "feed", "catalogue", "assignment", "onboarding", "reporting", "assistant"];
export const OUTCOME_ANCHORS = [.11, .38, .65, .90];
export const VISION_ANCHORS = [.18, .46, .78];
export const ACCESS_ANCHORS = [.15, .30, .45, .60, .75];
export const PROBLEM_ANCHORS = [.08, .26, .44, .62];

// full: desktop pinned scenes. compact: single-column pinned scenes for tablets, phones and short
// laptops. flow: normal layout with reveals (viewports too short to pin). static: motionless.
export function operatorMode({ reduced, full, compact, active }) {
  if (reduced || !active) return "static";
  if (full) return "full";
  return compact ? "compact" : "flow";
}
export const isPinnedMode = (mode) => mode === "full" || mode === "compact";

export const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

// Linear 0→1 ramp of `progress` across [start, start + length].
export const range = (progress, start, length) => clamp((progress - start) / length);

// Each stage owns the span between the midpoints of its neighbouring anchors.
export function stageAt(anchors, progress) {
  const value = clamp(progress);
  for (let index = 0; index < anchors.length - 1; index += 1) {
    if (value < (anchors[index] + anchors[index + 1]) / 2) return index;
  }
  return anchors.length - 1;
}

// Number of anchors already passed: used where stages accumulate rather than replace each other.
export const passedAt = (anchors, progress) => anchors.filter((anchor) => clamp(progress) >= anchor).length;

export const categoryAt = (progress) => stageAt(CATEGORY_ANCHORS, progress);
export const loopStageAt = (progress) => stageAt(LOOP_ANCHORS, progress);
export const capabilityAt = (progress) => stageAt(CAPABILITY_ANCHORS, progress);
export const outcomeAt = (progress) => stageAt(OUTCOME_ANCHORS, progress);
export const visionBeatsAt = (progress) => passedAt(VISION_ANCHORS, progress);
export const accessTicksAt = (progress) => passedAt(ACCESS_ANCHORS, progress);
export const problemCardsAt = (progress) => passedAt(PROBLEM_ANCHORS, progress);
