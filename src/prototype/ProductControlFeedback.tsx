import { useLayoutEffect, useRef } from "react";
import styles from "./ProductInteraction.module.css";

// Recolor only the screenshot's control surface; preserve its real text, icons and border.
export function ProductControlFeedback({
  image,
  rect,
  hovered,
  pressed,
  primary = false,
  enabled = false,
  variant = "default",
  target,
  radius = 6,
}: {
  image: string;
  rect: readonly [number, number, number, number];
  hovered: boolean;
  pressed: boolean;
  primary?: boolean;
  enabled?: boolean;
  variant?: "default" | "track" | "invisible" | "link";
  target?: string;
  radius?: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  const [x, y, width, height] = rect;

  useLayoutEffect(() => {
    const canvas = ref.current;

    if (!canvas) return;
    const context = canvas.getContext("2d");

    if (!context) throw new Error("Canvas is required for screenshot control feedback.");
    const colorCanvas = document.createElement("canvas");

    colorCanvas.width = 1;
    colorCanvas.height = 1;
    const colorContext = colorCanvas.getContext("2d");

    if (!colorContext) throw new Error("Canvas is required to resolve product interaction colors.");
    const source = new Image();

    let disposed = false;

    const draw = () => {
      if (disposed) return;
      const hoveredNow = canvas.dataset.hover === "true";

      const pressedNow = canvas.dataset.pressed === "true";

      canvas.style.opacity = hoveredNow || pressedNow || enabled ? "1" : "0";
      if ((!hoveredNow && !pressedNow && !enabled) || !source.complete || !source.naturalWidth)
        return;
      context.drawImage(source, x, y, width, height, 0, 0, width, height);
      const pixels = context.getImageData(0, 0, width, height);

      const color = getComputedStyle(canvas)
        .getPropertyValue(
          variant === "link"
            ? "--fgColor-accent"
            : `--${variant === "track" ? "controlTrack" : variant === "invisible" ? "control-transparent" : primary ? "button-primary" : "button-default"}-bgColor-${pressedNow ? "active" : hoveredNow ? "hover" : "rest"}`,
        )
        .trim();

      if (!color || !CSS.supports("color", color))
        throw new Error(`Missing or invalid Primer product interaction token: ${color}`);
      colorContext.clearRect(0, 0, 1, 1);
      colorContext.fillStyle = color;
      colorContext.fillRect(0, 0, 1, 1);
      const replacement = colorContext.getImageData(0, 0, 1, 1).data;

      const alpha = replacement[3] / 255;

      for (let i = 0; i < pixels.data.length; i += 4) {
        const [r, g, b] = pixels.data.slice(i, i + 3);

        const surface =
          variant === "link"
            ? b > r * 1.5 && b > g
            : variant === "track"
              ? Math.min(r, g, b) > 170 && Math.max(r, g, b) < 245
              : primary
                ? g > r * 1.5 && g > b * 1.2
                : Math.min(r, g, b) > 225;

        if (surface)
          replacement.slice(0, 3).forEach((value, channel) => {
            pixels.data[i + channel] = Math.round(
              value * alpha + pixels.data[i + channel] * (1 - alpha),
            );
          });
      }
      context.putImageData(pixels, 0, 0);
      if (variant === "link") {
        context.fillStyle = color;
        context.fillRect(2, height - 4, width - 4, 2);
      }
    };
    source.onload = draw;
    source.onerror = () => {
      throw new Error(`Unable to load control screenshot: ${image}`);
    };
    source.src = image;
    const observer = new MutationObserver(draw);

    observer.observe(canvas, { attributes: true, attributeFilter: ["data-hover", "data-pressed"] });
    draw();
    return () => {
      disposed = true;
      observer.disconnect();
    };
  }, [image, x, y, width, height, hovered, pressed, primary, enabled, variant]);

  return (
    <canvas
      ref={ref}
      width={width}
      height={height}
      aria-hidden="true"
      data-cursor-target={target}
      data-hover={hovered}
      data-pressed={pressed}
      className={`${styles.tokens} ${styles.feedback}`}
      style={{
        left: x,
        top: y,
        width,
        height,
        opacity: hovered || pressed || enabled ? 1 : 0,
        borderRadius:
          variant === "link" ? 0 : variant === "track" ? "var(--borderRadius-full)" : radius,
        boxShadow: primary && pressed ? "var(--button-primary-shadow-selected)" : undefined,
      }}
    />
  );
}
