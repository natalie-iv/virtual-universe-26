import { type RefObject, useLayoutEffect, useRef } from "react";
import { buoyancy, createMonaRenderer, monaGlide, type MonaSample } from "./MonaTrail";
import strip from "./mona-bob4-strip.png";
import styles from "./ProductInteraction.module.css";

export type MonaStop = {
  arrive: number;
  leave: number;
  x: number;
  y: number;
  click?: number;
  target?: RefObject<HTMLElement | null>;
  targetName?: string;
  perchBelow?: boolean;
  focusX?: number;
  flightDuration?: number;
  curved?: boolean;
  trailSpacing?: number;
};

export function PixelMona({ time, stops, end }: { time: number; stops: MonaStop[]; end: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  const atlas = useRef<HTMLImageElement | null>(null);

  const renderer = useRef<ReturnType<typeof createMonaRenderer> | null>(null);

  const positions = useRef(new Map<number, readonly [number, number]>());

  useLayoutEffect(() => {
    const canvas = ref.current;

    if (!canvas) return;
    const context = canvas.getContext("2d");

    if (!context) throw new Error("Canvas is required for the pixel Mona guide.");
    if (!atlas.current) {
      atlas.current = new Image();
      atlas.current.src = strip;
    }
    const image = atlas.current;

    const resolved = stops.map((stop, index) => {
      if (!stop.target && !stop.targetName) positions.current.delete(index);

      const target =
        stop.target?.current ??
        (stop.targetName
          ? canvas.parentElement?.querySelector<HTMLElement>(
              `[data-cursor-target="${stop.targetName}"]`,
            )
          : undefined);

      if (target && target.getBoundingClientRect().width > 0) {
        const bounds = canvas.getBoundingClientRect();

        const rect = target.getBoundingClientRect();

        positions.current.set(index, [
          ((rect.left - bounds.left) * 2000) / bounds.width - 74,
          stop.perchBelow
            ? ((rect.bottom - bounds.top) * 1025) / bounds.height + 8
            : ((rect.top + rect.height / 2 - bounds.top) * 1025) / bounds.height - 32,
        ]);
      }
      const point = positions.current.get(index);

      return { ...stop, x: point?.[0] ?? stop.x, y: point?.[1] ?? stop.y };
    });

    function sample(at: number): MonaSample {
      let from: readonly [number, number] = [-100, resolved[0].y];

      let departure = 250;

      for (const [index, stop] of resolved.entries()) {
        const glide = monaGlide(from, [stop.x, stop.y], index, stop.curved);

        const flightDuration = stop.flightDuration ?? glide.duration;

        const arrive = Math.max(stop.arrive, departure + flightDuration);

        const start = arrive - flightDuration;

        if (at < arrive) {
          const point = glide.position((at - start) / flightDuration);

          return {
            position: { x: point[0], y: point[1] },
            moving: at >= start,
            facing: stop.x >= from[0] ? 1 : -1,
            scale: 1,
            start,
            arrive,
            idleStart: arrive,
            click: -1,
            ...buoyancy(at),
            trailDelay:
              glide.trailDelay * (flightDuration / glide.duration) * (stop.trailSpacing ?? 1),
          };
        }
        if (at < stop.leave) {
          return {
            position: { x: stop.x, y: stop.y },
            moving: false,
            facing: (stop.focusX ?? stop.x + 100) > stop.x + 33 ? 1 : -1,
            scale: 1,
            start,
            arrive,
            idleStart: arrive,
            click: -1,
            ...buoyancy(at),
            trailDelay: 0,
          };
        }
        from = [stop.x, stop.y];
        departure = stop.leave;
      }
      const glide = monaGlide(from, [2100, from[1] - 80], resolved.length);

      const point = glide.position((at - departure) / glide.duration);

      return {
        position: { x: point[0], y: point[1] },
        moving: at < departure + glide.duration,
        facing: 1,
        scale: 1,
        start: departure,
        arrive: departure + glide.duration,
        idleStart: departure + glide.duration,
        click: -1,
        ...buoyancy(at),
        trailDelay: glide.trailDelay,
      };
    }

    function draw() {
      if (!canvas || !context || !image.complete || !image.naturalWidth) return;
      context.clearRect(0, 0, 2000, 1025);
      context.imageSmoothingEnabled = false;
      if (time < 250 || time >= end) return;
      renderer.current ??= createMonaRenderer(canvas, image);
      renderer.current(time, sample);
      canvas.dataset.monaHops = String(
        resolved.length + Number(resolved[resolved.length - 1].leave < end),
      );
    }
    image.onload = draw;
    draw();
  }, [time, stops, end]);

  return (
    <canvas ref={ref} width={2000} height={1025} className={styles.sprite} aria-hidden="true" />
  );
}
