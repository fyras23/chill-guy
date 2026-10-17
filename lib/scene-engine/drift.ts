export type DriftType =
  | "zoom-in"
  | "zoom-out"
  | "pan-left"
  | "pan-right"
  | "pan-up"
  | "pan-down";

export interface DriftKeyframes {
  type: DriftType;
  startTransform: string;
  endTransform: string;
  scale: number;
}

/**
 * Generates random drift keyframes strictly adhering to:
 * - Scale between 1.06 and 1.16
 * - Translation strictly <= ((scale - 1) / 2) * 100% per axis, guaranteeing no edges show
 */
export function generateDriftKeyframes(forcedType?: DriftType): DriftKeyframes {
  const types: DriftType[] = [
    "zoom-in",
    "zoom-out",
    "pan-left",
    "pan-right",
    "pan-up",
    "pan-down",
  ];
  const type = forcedType || types[Math.floor(Math.random() * types.length)];

  // Scale between 1.06 and 1.16
  const scale = 1.06 + Math.random() * (1.16 - 1.06);
  // Max safe translate percentage along either axis
  const maxTranslatePercent = ((scale - 1) / 2) * 100;

  // Use 80% of max safe range to be completely safe against rounding
  const safeT = maxTranslatePercent * 0.8;
  const slightJitter = (Math.random() * 2 - 1) * (safeT * 0.3);

  let startTransform = "";
  let endTransform = "";

  switch (type) {
    case "zoom-in":
      startTransform = `scale(1.02) translate(0%, 0%)`;
      endTransform = `scale(${scale.toFixed(4)}) translate(${slightJitter.toFixed(2)}%, ${slightJitter.toFixed(2)}%)`;
      break;

    case "zoom-out":
      startTransform = `scale(${scale.toFixed(4)}) translate(${slightJitter.toFixed(2)}%, ${slightJitter.toFixed(2)}%)`;
      endTransform = `scale(1.03) translate(0%, 0%)`;
      break;

    case "pan-left":
      startTransform = `scale(${scale.toFixed(4)}) translate(${safeT.toFixed(2)}%, ${slightJitter.toFixed(2)}%)`;
      endTransform = `scale(${scale.toFixed(4)}) translate(-${safeT.toFixed(2)}%, ${slightJitter.toFixed(2)}%)`;
      break;

    case "pan-right":
      startTransform = `scale(${scale.toFixed(4)}) translate(-${safeT.toFixed(2)}%, ${slightJitter.toFixed(2)}%)`;
      endTransform = `scale(${scale.toFixed(4)}) translate(${safeT.toFixed(2)}%, ${slightJitter.toFixed(2)}%)`;
      break;

    case "pan-up":
      startTransform = `scale(${scale.toFixed(4)}) translate(${slightJitter.toFixed(2)}%, ${safeT.toFixed(2)}%)`;
      endTransform = `scale(${scale.toFixed(4)}) translate(${slightJitter.toFixed(2)}%, -${safeT.toFixed(2)}%)`;
      break;

    case "pan-down":
      startTransform = `scale(${scale.toFixed(4)}) translate(${slightJitter.toFixed(2)}%, -${safeT.toFixed(2)}%)`;
      endTransform = `scale(${scale.toFixed(4)}) translate(${slightJitter.toFixed(2)}%, ${safeT.toFixed(2)}%)`;
      break;
  }

  return {
    type,
    startTransform,
    endTransform,
    scale,
  };
}

/**
 * Attaches drift animation using Web Animations API.
 */
export function applyDriftAnimation(
  element: HTMLElement,
  keyframes: DriftKeyframes,
  durationMs: number
): Animation | null {
  if (typeof window === "undefined" || !element.animate) {
    return null;
  }

  try {
    const animation = element.animate(
      [
        { transform: keyframes.startTransform },
        { transform: keyframes.endTransform },
      ],
      {
        duration: durationMs,
        fill: "forwards",
        easing: "linear",
      }
    );

    return animation;
  } catch (err) {
    console.error("Failed applying drift animation:", err);
    return null;
  }
}

