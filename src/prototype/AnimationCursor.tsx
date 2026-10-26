import { type RefObject, useLayoutEffect, useRef, useState } from "react";
import { cursorPath, cursorPressScale } from "./AnimationTimeline";
import styles from "./styles.module.css";

export type CursorWaypoint = readonly [number, number, number, string?, number?, number?];

export function useMeasuredCursorPath(
  ref: RefObject<HTMLDivElement | null>,
  time: number,
  points: readonly CursorWaypoint[],
  curved = true,
) {
  const [targets, setTargets] = useState<Record<string, readonly [number, number]>>({});

  useLayoutEffect(() => {
    const root = ref.current;

    const ownerSelector = "[data-animation-time], [data-projects-time]";

    const owner = root?.closest(ownerSelector);

    const cursor = [...(root?.querySelectorAll("[data-animation-cursor]") ?? [])].find(
      (candidate) =>
        !candidate.closest("[data-initial-frame]") && candidate.closest(ownerSelector) === owner,
    );

    const scene = cursor?.parentElement?.parentElement;

    if (!root || !scene) return;
    const bounds = scene.getBoundingClientRect();

    const scaleX = bounds.width / scene.offsetWidth;

    const scaleY = bounds.height / scene.offsetHeight;

    if (!(scaleX > 0 && scaleY > 0)) return;
    const measured = { ...targets };

    let changed = false;

    for (const [, , , name] of points) {
      if (!name) continue;
      const target = [...root.querySelectorAll(`[data-cursor-target="${name}"]`)].find(
        (candidate) =>
          !candidate.closest("[data-initial-frame]") && candidate.closest(ownerSelector) === owner,
      );

      if (!target) continue;
      const rect = target.getBoundingClientRect();

      if (!rect.width || !rect.height) continue;
      const center = [
        (rect.left + rect.width / 2 - bounds.left) / scaleX,
        (rect.top + rect.height / 2 - bounds.top) / scaleY,
      ] as const;

      if (
        !targets[name] ||
        Math.abs(targets[name][0] - center[0]) > 0.01 ||
        Math.abs(targets[name][1] - center[1]) > 0.01
      ) {
        measured[name] = center;
        changed = true;
      }
    }
    if (changed) setTargets(measured);
    if (!cursor) return;
    const hotspot = cursor.getBoundingClientRect();

    for (const target of root.querySelectorAll<HTMLElement>("[data-cursor-target]")) {
      if (target.closest("[data-initial-frame]") || target.closest(ownerSelector) !== owner)
        continue;
      const rect = target.getBoundingClientRect();

      const hovered =
        !target.matches(":disabled, [aria-disabled='true']") &&
        rect.width > 0 &&
        rect.height > 0 &&
        hotspot.left >= rect.left &&
        hotspot.left < rect.right &&
        hotspot.top >= rect.top &&
        hotspot.top < rect.bottom;

      target.dataset.hover = String(hovered);
    }
  }, [ref, time, points, targets]);

  return cursorPath(
    time,
    points.map(([at, x, y, name, offsetX = 0, offsetY = 0]) => {
      const target = name && targets[name];

      return [at, (target ? target[0] : x) + offsetX, (target ? target[1] : y) + offsetY] as const;
    }),
    curved,
  );
}

export function useAnimationCursorSize(ref: RefObject<SVGSVGElement | null>) {
  useLayoutEffect(() => {
    const cursor = ref.current;

    const page = cursor?.closest<HTMLElement>(`.${styles.page.split(" ")[0]}`);

    const scene = cursor?.parentElement?.classList.contains(styles.aiFindingsCursor)
      ? cursor.parentElement.parentElement
      : cursor?.parentElement;

    if (!cursor || !page || !scene) return;

    function updateSize() {
      if (!cursor || !page || !scene) return;

      const sceneStyle = getComputedStyle(scene);

      const sceneWidth =
        parseFloat(sceneStyle.width) +
        (sceneStyle.boxSizing === "border-box"
          ? 0
          : parseFloat(sceneStyle.paddingLeft) +
            parseFloat(sceneStyle.paddingRight) +
            parseFloat(sceneStyle.borderLeftWidth) +
            parseFloat(sceneStyle.borderRightWidth));

      const scale = scene.getBoundingClientRect().width / sceneWidth;

      if (!Number.isFinite(scale) || scale <= 0) return;

      // Match the source video's measured 28 x 45px painted silhouette at 1600px.
      const referenceScale = Math.min(800, page.getBoundingClientRect().width) / 2000;

      cursor.style.setProperty("--animation-cursor-width", `${(63.64 * referenceScale) / scale}px`);
      cursor.style.setProperty(
        "--animation-cursor-height",
        `${(77.33 * referenceScale) / scale}px`,
      );
    }

    updateSize();

    const observer = new ResizeObserver(updateSize);

    observer.observe(page);
    observer.observe(scene);
    return () => observer.disconnect();
  });
}

export function AnimationCursor({ clickAge = -1 }: { clickAge?: number }) {
  const cursorRef = useRef<SVGSVGElement>(null);

  useAnimationCursorSize(cursorRef);

  return (
    <svg
      ref={cursorRef}
      className={styles.securityStyleCursor}
      width="24"
      height="29"
      viewBox="2 1.5 20 24"
      preserveAspectRatio="none"
      data-animation-cursor=""
      style={{ overflow: "visible", transform: `scale(${cursorPressScale(clickAge)})` }}
      aria-hidden="true"
    >
      <path
        d="M2 1.5v18.2l4.6-4.4 3 6.9 3.1-1.3-3-6.8h6.4z"
        fill="#1f2328"
        stroke="#fff"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}
