import {
  type RefObject,
  type SetStateAction,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { animationBeats, beatDuration, pacedTime, type AnimationBeatName } from "./AnimationBeats";

export const LOOP_RESET_MS = 1000;

export const ANIMATION_PRESS_MS = 70;

export const ANIMATION_RELEASE_MS = 140;

export function loopTransition(time: number, duration: number) {
  const fadeOut = Math.max(0, Math.min(1, (time - duration + 200) / 400)) ** 3;

  const fadeIn = 1 - (1 - Math.max(0, Math.min(1, (time - duration - 200) / 400))) ** 3;

  const returning = time >= duration + 200;

  return {
    returning,
    opacity: returning ? fadeIn : 1 - fadeOut,
    translate: `${returning ? -10 * (1 - fadeIn) : 10 * fadeOut}% 0`,
  };
}

export function animationClick(time: number, start: number) {
  return {
    age: time - start,
    pressing: time >= start && time < start + ANIMATION_PRESS_MS,
    released: time >= start + ANIMATION_PRESS_MS,
    release: start + ANIMATION_PRESS_MS,
  };
}

export function cursorPressScale(age: number) {
  if (age < 0 || age >= ANIMATION_PRESS_MS + ANIMATION_RELEASE_MS) return 1;
  if (age < ANIMATION_PRESS_MS) return 1 - 0.1 * clickEase(age / ANIMATION_PRESS_MS);
  return 0.9 + 0.1 * clickEase((age - ANIMATION_PRESS_MS) / ANIMATION_RELEASE_MS);
}

function clickEase(value: number) {
  if (value <= 0) return 0;
  if (value >= 1) return 1;
  let low = 0;

  let high = 1;

  for (let index = 0; index < 20; index++) {
    const t = (low + high) / 2;

    const x = 0.6 * (1 - t) ** 2 * t + t ** 3;

    if (x < value) low = t;
    else high = t;
  }
  const t = (low + high) / 2;

  return 3 * (1 - t) * t ** 2 + t ** 3;
}

export function motionEase(value: number) {
  const t = Math.max(0, Math.min(1, value));

  return t < 0.5 ? 16 * t ** 5 : 1 - (-2 * t + 2) ** 5 / 2;
}

function characterDelay(character: string, index: number, meanDelay = 70) {
  if (meanDelay !== 70) return meanDelay + ((index * 17 + 11) % 21) - 10;
  return 70 + ((index * 17 + 11) % 31) - 15 + (/[\s.,:;!?=_#@]/.test(character) ? 35 : 0);
}

export function typingDuration(text: string, meanDelay = 70) {
  return Array.from(text).reduce(
    (duration, character, index) => duration + characterDelay(character, index, meanDelay),
    0,
  );
}

export function typedLength(text: string, elapsed: number, meanDelay = 70) {
  let next = 0;

  let count = 0;

  for (const [index, character] of Array.from(text).entries()) {
    next += characterDelay(character, index, meanDelay);
    if (elapsed < next) break;
    count++;
  }
  return count;
}

export function typingCaretVisible(text: string, elapsed: number, meanDelay = 70) {
  const duration = typingDuration(text, meanDelay);

  if (elapsed >= 0 && elapsed < duration) return true;
  const idle = elapsed < 0 ? -elapsed : elapsed - duration;

  return Math.floor(idle / 530) % 2 === 0;
}

// Primer Overlay and ToggleSwitch easing, evaluated identically when seeking.
export function productEase(value: number, kind: "overlay" | "toggle" = "overlay") {
  if (value <= 0) return 0;
  if (value >= 1) return 1;
  const [x1, x2] = kind === "toggle" ? [0.5, 0.89] : [0.33, 0.68];

  let low = 0;
  let high = 1;

  for (let index = 0; index < 20; index++) {
    const t = (low + high) / 2;

    const x = 3 * (1 - t) ** 2 * t * x1 + 3 * (1 - t) * t ** 2 * x2 + t ** 3;

    if (x < value) low = t;
    else high = t;
  }
  return 1 - (1 - (low + high) / 2) ** 3;
}

export function cursorCurve(
  from: readonly [number, number],
  to: readonly [number, number],
  progress: number,
  side = 1,
): [number, number] {
  const t = motionEase(progress);

  const distance = Math.hypot(to[0] - from[0], to[1] - from[1]);

  const bend = distance * 0.18 * side;

  const bendX = distance > 0 ? ((to[1] - from[1]) / distance) * bend : 0;

  const bendY = distance > 0 ? (-(to[0] - from[0]) / distance) * bend : 0;

  const cubic = (start: number, controlOne: number, controlTwo: number, end: number) =>
    (1 - t) ** 3 * start +
    3 * (1 - t) ** 2 * t * controlOne +
    3 * (1 - t) * t ** 2 * controlTwo +
    t ** 3 * end;

  return [
    cubic(
      from[0],
      from[0] + (to[0] - from[0]) / 3 + bendX,
      to[0] - (to[0] - from[0]) / 3 + bendX,
      to[0],
    ),
    cubic(
      from[1],
      from[1] + (to[1] - from[1]) / 3 + bendY,
      to[1] - (to[1] - from[1]) / 3 + bendY,
      to[1],
    ),
  ];
}

export function cursorPath(
  time: number,
  points: readonly (readonly [number, number, number])[],
  curved = true,
) {
  for (let index = 1; index < points.length; index++) {
    const [end, x, y] = points[index];

    const [start, previousX, previousY] = points[index - 1];

    if (time <= end)
      return cursorCurve(
        [previousX, previousY],
        [x, y],
        (time - start) / (end - start),
        curved ? (index % 2 ? 1 : -1) : 0,
      );
  }
  return points[points.length - 1].slice(1);
}

// The seek event freezes the clock, so exports render the same React state at every frame.
export function useAnimationTime(duration: number, loop = true, beats?: AnimationBeatName) {
  const [elapsed, updateElapsed] = useState(0);

  const seeking = useRef(false);

  const setElapsed = useCallback(
    (next: SetStateAction<number>) => {
      if (seeking.current) return;
      updateElapsed((previous) => {
        const value = typeof next === "function" ? next(previous) : next;

        return loop ? value % (duration + beatDuration(beats) + LOOP_RESET_MS) : value;
      });
    },
    [duration, loop, beats],
  );

  useLayoutEffect(() => {
    function seek(event: Event) {
      if (!(event instanceof CustomEvent) || typeof event.detail !== "number") return;
      seeking.current = true;
      updateElapsed(event.detail);
    }

    window.addEventListener("universe-animation-seek", seek);
    return () => window.removeEventListener("universe-animation-seek", seek);
  }, []);

  const time = beats ? pacedTime(elapsed, animationBeats[beats]) : elapsed;

  return [loop && time >= duration + 750 ? 0 : time, setElapsed] as const;
}

// Dip through the scene background so different layouts never double-expose.
export function useLoopReset(
  ref: RefObject<HTMLDivElement | null>,
  elapsed: number,
  duration: number,
  enabled = true,
) {
  const snapshot = useRef<HTMLElement | null>(null);

  useLayoutEffect(() => {
    const element = ref.current;

    if (!element || !enabled) return;
    const initial = element.cloneNode(true) as HTMLElement;

    element.dataset.loopReset = "true";
    initial.removeAttribute("data-loop-reset");
    initial.dataset.initialFrame = "true";
    initial.removeAttribute("data-animation-time");
    initial.removeAttribute("role");
    initial.setAttribute("aria-hidden", "true");
    initial.inert = true;
    initial.querySelectorAll("[role='status']").forEach((node) => node.remove());
    Object.assign(initial.style, {
      position: "absolute",
      inset: "0",
      width: "100%",
      height: "100%",
      margin: "0",
      pointerEvents: "none",
      opacity: "0",
      zIndex: "50",
    });
    element.append(initial);
    initial.getAnimations({ subtree: true }).forEach((animation) => {
      animation.pause();
      animation.currentTime = 0;
    });
    snapshot.current = initial;
    return () => {
      initial.remove();
      snapshot.current = null;
      delete element.dataset.loopReset;
      element.style.removeProperty("--animation-live-filter");
      element.style.removeProperty("--animation-live-slide");
    };
  }, [ref, enabled]);

  useLayoutEffect(() => {
    if (snapshot.current) {
      const fadeOut = Math.max(0, Math.min(1, (elapsed - duration + 200) / 400)) ** 3;

      const entryProgress = Math.max(0, Math.min(1, (elapsed - duration - 200) / 400));

      const fadeIn = 1 - (1 - entryProgress) ** 3;

      snapshot.current.style.opacity = String(fadeIn);
      snapshot.current.style.translate = `${-10 * (1 - fadeIn)}% 0`;
      ref.current?.style.setProperty("--animation-live-slide", `${fadeOut * 10}% 0`);
      ref.current?.style.setProperty(
        "--animation-live-filter",
        fadeOut === 0 ? "none" : `opacity(${1 - fadeOut})`,
      );
    }
  }, [elapsed, duration, ref]);
}
