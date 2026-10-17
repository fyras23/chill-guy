export type TransitionType =
  | "crossfade"
  | "zoom-dissolve"
  | "drift-slide"
  | "iris-bloom"
  | "wisp-dissolve"
  | "warm-light-leak";

export interface TransitionParams {
  type: TransitionType;
  durationMs: number;
}

const ALL_TRANSITIONS: TransitionType[] = [
  "crossfade",
  "zoom-dissolve",
  "drift-slide",
  "iris-bloom",
  "wisp-dissolve",
  "warm-light-leak",
];

// Fallback flag if client dropped frames
let hasPerformanceDegraded = false;

export function markPerformanceDegraded() {
  hasPerformanceDegraded = true;
}

export function isPerformanceDegraded() {
  return hasPerformanceDegraded;
}

/**
 * Picks a random transition, never the same twice in a row.
 * Respects performance degradation fallback and transition feel duration.
 */
export function pickNextTransition(
  lastTransition?: TransitionType,
  feel: "soft" | "mixed" = "mixed"
): TransitionParams {
  if (hasPerformanceDegraded) {
    const minDur = feel === "soft" ? 4000 : 3000;
    const maxDur = 6000;
    const durationMs = minDur + Math.random() * (maxDur - minDur);
    return { type: "crossfade", durationMs };
  }

  const pool = ALL_TRANSITIONS.filter((t) => t !== lastTransition);
  const type = pool[Math.floor(Math.random() * pool.length)];

  // Soft: 4000-6000ms, Mixed: 3000-6000ms
  const minDur = feel === "soft" ? 4000 : 3000;
  const maxDur = 6000;
  const durationMs = Math.round(minDur + Math.random() * (maxDur - minDur));

  return {
    type,
    durationMs,
  };
}

export interface TransitionAnimationResult {
  cancel: () => void;
  finished: Promise<void>;
}

/**
 * Executes the selected transition using Web Animations API on incoming and outgoing elements.
 */
export function executeTransition(
  incomingEl: HTMLElement,
  outgoingEl: HTMLElement | null,
  params: TransitionParams,
  lightLeakOverlayEl?: HTMLElement | null
): TransitionAnimationResult {
  const duration = params.durationMs;
  const easing = "cubic-bezier(0.4, 0, 0.2, 1)";

  // Promote with will-change during animation
  incomingEl.style.willChange = "transform, opacity, clip-path";
  if (outgoingEl) {
    outgoingEl.style.willChange = "transform, opacity, clip-path";
  }

  const animations: Animation[] = [];

  switch (params.type) {
    case "zoom-dissolve": {
      // Incoming: 0.92 -> 1.0, opacity 0 -> 1
      animations.push(
        incomingEl.animate(
          [
            { transform: "scale(0.92)", opacity: 0 },
            { transform: "scale(1.0)", opacity: 1 },
          ],
          { duration, easing, fill: "forwards" }
        )
      );
      // Outgoing: 1.0 -> 1.08, opacity 1 -> 0
      if (outgoingEl) {
        animations.push(
          outgoingEl.animate(
            [
              { transform: "scale(1.0)", opacity: 1 },
              { transform: "scale(1.08)", opacity: 0 },
            ],
            { duration, easing, fill: "forwards" }
          )
        );
      }
      break;
    }

    case "drift-slide": {
      // Both move sideways 4 to 6%
      const slidePct = Math.random() > 0.5 ? 5 : -5;
      animations.push(
        incomingEl.animate(
          [
            { transform: `translateX(${-slidePct}%)`, opacity: 0 },
            { transform: "translateX(0%)", opacity: 1 },
          ],
          { duration, easing, fill: "forwards" }
        )
      );
      if (outgoingEl) {
        animations.push(
          outgoingEl.animate(
            [
              { transform: "translateX(0%)", opacity: 1 },
              { transform: `translateX(${slidePct}%)`, opacity: 0 },
            ],
            { duration, easing, fill: "forwards" }
          )
        );
      }
      break;
    }

    case "iris-bloom": {
      // Circular mask from random point
      const originX = Math.round(30 + Math.random() * 40);
      const originY = Math.round(30 + Math.random() * 40);
      animations.push(
        incomingEl.animate(
          [
            { clipPath: `circle(0% at ${originX}% ${originY}%)`, opacity: 1 },
            { clipPath: `circle(150% at ${originX}% ${originY}%)`, opacity: 1 },
          ],
          { duration, easing, fill: "forwards" }
        )
      );
      if (outgoingEl) {
        animations.push(
          outgoingEl.animate(
            [{ opacity: 1 }, { opacity: 0 }],
            { duration, easing, fill: "forwards" }
          )
        );
      }
      break;
    }

    case "wisp-dissolve": {
      // Organic wipe clip-path
      animations.push(
        incomingEl.animate(
          [
            { clipPath: "polygon(0 0, 100% 0, 100% 0, 0 0)", opacity: 0.3 },
            { clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)", opacity: 1 },
          ],
          { duration, easing, fill: "forwards" }
        )
      );
      if (outgoingEl) {
        animations.push(
          outgoingEl.animate(
            [{ opacity: 1 }, { opacity: 0 }],
            { duration, easing, fill: "forwards" }
          )
        );
      }
      break;
    }

    case "warm-light-leak": {
      // Crossfade plus warm orange-to-yellow glow peaking mid-transition
      animations.push(
        incomingEl.animate(
          [{ opacity: 0 }, { opacity: 1 }],
          { duration, easing, fill: "forwards" }
        )
      );
      if (outgoingEl) {
        animations.push(
          outgoingEl.animate(
            [{ opacity: 1 }, { opacity: 0 }],
            { duration, easing, fill: "forwards" }
          )
        );
      }
      if (lightLeakOverlayEl) {
        animations.push(
          lightLeakOverlayEl.animate(
            [
              { opacity: 0, transform: "scale(1)" },
              { opacity: 0.45, transform: "scale(1.05)" },
              { opacity: 0, transform: "scale(1.1)" },
            ],
            { duration, easing, fill: "forwards" }
          )
        );
      }
      break;
    }

    case "crossfade":
    default: {
      animations.push(
        incomingEl.animate(
          [{ opacity: 0 }, { opacity: 1 }],
          { duration, easing, fill: "forwards" }
        )
      );
      if (outgoingEl) {
        animations.push(
          outgoingEl.animate(
            [{ opacity: 1 }, { opacity: 0 }],
            { duration, easing, fill: "forwards" }
          )
        );
      }
      break;
    }
  }

  // FPS monitor delta sampling
  let frameCount = 0;
  const startTime = performance.now();
  let rafId: number | null = null;

  const checkFps = (time: number) => {
    frameCount++;
    if (time - startTime >= 1000) {
      const fps = (frameCount * 1000) / (time - startTime);
      if (fps < 48) {
        markPerformanceDegraded();
      }
      return;
    }
    rafId = requestAnimationFrame(checkFps);
  };
  rafId = requestAnimationFrame(checkFps);

  const cleanup = () => {
    if (rafId) cancelAnimationFrame(rafId);
    incomingEl.style.willChange = "auto";
    if (outgoingEl) {
      outgoingEl.style.willChange = "auto";
    }
  };

  const finished = Promise.all(animations.map((a) => a.finished))
    .then(() => cleanup())
    .catch(() => cleanup());

  return {
    cancel: () => {
      cleanup();
      animations.forEach((a) => {
        try {
          a.cancel();
        } catch {
          // ignore
        }
      });
    },
    finished,
  };
}

