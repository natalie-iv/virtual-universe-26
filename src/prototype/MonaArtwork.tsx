import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import foreground from "./mona-foreground.png";
import green from "./mona-green.png";
import purple from "./mona-purple.png";
import orange from "./mona-orange.png";
import pink from "./mona-pink.png";
import violet from "./mona-violet.png";
import ctaForeground from "./cta-mona-foreground.png";
import ctaTrail0 from "./cta-mona-trail-0.png";
import ctaTrail1 from "./cta-mona-trail-1.png";
import ctaTrail2 from "./cta-mona-trail-2.png";
import ctaTrail3 from "./cta-mona-trail-3.png";
import ctaTrail4 from "./cta-mona-trail-4.png";
import ctaTrail5 from "./cta-mona-trail-5.png";
import ctaTrail6 from "./cta-mona-trail-6.png";
import styles from "./styles.module.css";

const trails = [green, purple, orange, pink, violet];

const ctaTrails = [ctaTrail6, ctaTrail5, ctaTrail4, ctaTrail3, ctaTrail2, ctaTrail1, ctaTrail0];

const spring = { stiffness: 180, damping: 21, mass: 0.65 };

const pixels = [
  ["green", ">"],
  ["purple", "+"],
  ["orange", "/"],
  ["pink", "{"],
  ["violet", "*"],
  ["yellow", "}"],
] as const;

function ArtworkLayer({
  src,
  order = 0,
  isForeground = false,
  reducedMotion,
  revealOnView = false,
}: {
  src: string;
  order?: number;
  isForeground?: boolean;
  reducedMotion: boolean;
  revealOnView?: boolean;
}) {
  const image = useRef<HTMLImageElement>(null);

  const revealed = useRef(false);

  useLayoutEffect(() => {
    const element = image.current;

    if (!element) return;

    let animation: Animation | undefined;

    const initial = {
      opacity: isForeground ? 1 : 0,
      transform: isForeground
        ? "translateY(100%) rotate(-2deg) scale(0.97)"
        : "translateY(var(--base-size-24)) rotate(-4deg) scale(1)",
    };

    const final = { opacity: 1, transform: "translateY(0) rotate(0deg) scale(1)" };

    element.style.opacity = "1";
    element.style.transform = final.transform;

    if (reducedMotion || revealed.current) {
      revealed.current = true;
      return;
    }

    element.style.opacity = String(initial.opacity);
    element.style.transform = initial.transform;

    function reveal() {
      if (!element || revealed.current) return;
      revealed.current = true;
      element.style.opacity = "1";
      element.style.transform = final.transform;
      animation = element.animate([initial, final], {
        duration: isForeground ? 380 : 280,
        delay: isForeground ? 0 : 180 + order * 80,
        easing: "cubic-bezier(0.16, 1, 0.3, 1)",
        fill: "backwards",
      });
    }

    const observer =
      revealOnView && typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver((entries) => {
            if (entries.some((entry) => entry.isIntersecting)) {
              reveal();
              observer?.disconnect();
            }
          })
        : null;

    if (observer) observer.observe(element);
    else reveal();

    return () => {
      observer?.disconnect();
      if (animation && animation.playState !== "finished") revealed.current = false;
      animation?.cancel();
    };
  }, [isForeground, order, reducedMotion, revealOnView]);

  return (
    <span
      className={styles.monaLayer}
      data-mona-layer={isForeground ? "foreground" : order}
      style={{ transformOrigin: "45% 100%" }}
    >
      <img ref={image} src={src} alt="" draggable={false} style={{ transformOrigin: "45% 100%" }} />
    </span>
  );
}

function AnimatedArtwork({
  reducedMotion,
  variant,
}: {
  reducedMotion: boolean;
  variant: "hero" | "cta";
}) {
  const scope = useRef<HTMLDivElement>(null);

  const [section, setSection] = useState<HTMLElement | null>(null);

  const [active, setActive] = useState(false);

  useEffect(() => {
    setSection(scope.current?.closest<HTMLElement>("[data-mona-section]") ?? null);
  }, []);

  useEffect(() => {
    if (!section) return;

    if (typeof IntersectionObserver === "undefined") {
      setActive(true);
      return;
    }

    const observer = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting));

    observer.observe(section);
    return () => observer.disconnect();
  }, [section]);

  const pixelRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const pixelAnimations = useRef(new Map<HTMLSpanElement, Animation>());

  const pixelIndex = useRef(0);

  const lastCell = useRef<string | null>(null);

  useEffect(() => {
    if (!section) return;

    const layers = Array.from(
      scope.current?.querySelectorAll<HTMLElement>("[data-mona-layer]") ?? [],
    );

    const animations = pixelAnimations.current;

    const position = { x: 0, y: 0 };

    const velocity = { x: 0, y: 0 };

    const target = { x: 0, y: 0 };

    let frame = 0;

    let previousTime = 0;

    function renderParallax() {
      layers.forEach((layer) => {
        const order = layer.dataset.monaLayer;

        const depth = order === "foreground" ? 1.15 : 0.7 - Number(order) * 0.1;

        layer.style.transform = `translate(${position.x * depth}px, ${position.y * depth}px) rotate(${position.x * depth * 0.14}deg)`;
      });
    }

    function step(time: number) {
      let remaining = previousTime ? Math.min((time - previousTime) / 1000, 0.064) : 1 / 60;

      previousTime = time;
      while (remaining > 0) {
        const dt = Math.min(remaining, 1 / 120);

        for (const axis of ["x", "y"] as const) {
          const force =
            spring.stiffness * (target[axis] - position[axis]) - spring.damping * velocity[axis];

          velocity[axis] += (force / spring.mass) * dt;
          position[axis] += velocity[axis] * dt;
        }
        remaining -= dt;
      }

      const settled = (["x", "y"] as const).every(
        (axis) =>
          Math.abs(target[axis] - position[axis]) < 0.001 && Math.abs(velocity[axis]) < 0.01,
      );

      if (settled) {
        position.x = target.x;
        position.y = target.y;
        velocity.x = 0;
        velocity.y = 0;
      }
      renderParallax();
      frame = settled ? 0 : requestAnimationFrame(step);
    }

    function startSpring() {
      if (frame) return;
      previousTime = 0;
      frame = requestAnimationFrame(step);
    }

    function clearPixels() {
      lastCell.current = null;
      animations.forEach((animation, pixel) => {
        animation.cancel();
        pixel.style.opacity = "0";
        pixel.style.transform = "scale(1)";
      });
      animations.clear();
    }

    function resetParallax() {
      clearPixels();
      target.x = 0;
      target.y = 0;
      startSpring();
    }

    function moveParallax(event: PointerEvent) {
      if (!section || !active || reducedMotion || event.pointerType !== "mouse") return;

      const bounds = section.getBoundingClientRect();

      if (!bounds.width || !bounds.height) return;
      target.x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 24;
      target.y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 6;
      startSpring();

      const cellX = Math.floor((event.clientX - bounds.left) / 16) * 16;

      const cellY = Math.floor((event.clientY - bounds.top) / 16) * 16;

      const cell = `${cellX}:${cellY}`;

      if (lastCell.current === cell) return;
      lastCell.current = cell;

      const pixel = pixelRefs.current[pixelIndex.current++ % pixels.length];

      if (!pixel) return;
      animations.get(pixel)?.cancel();
      pixel.style.left = `${cellX}px`;
      pixel.style.top = `${cellY}px`;
      const animation = pixel.animate(
        [
          { opacity: 1, transform: "scale(1)", offset: 0 },
          { opacity: 1, transform: "scale(1)", offset: 0.55, easing: "ease-out" },
          { opacity: 0, transform: "scale(0.3)", offset: 1 },
        ],
        { duration: 700 },
      );

      animations.set(pixel, animation);
      animation.onfinish = () => {
        if (animations.get(pixel) === animation) animations.delete(pixel);
      };
    }

    renderParallax();
    clearPixels();
    if (active && !reducedMotion) {
      section.addEventListener("pointermove", moveParallax);
      section.addEventListener("pointerleave", resetParallax);
      section.addEventListener("pointercancel", resetParallax);
    }
    return () => {
      section.removeEventListener("pointermove", moveParallax);
      section.removeEventListener("pointerleave", resetParallax);
      section.removeEventListener("pointercancel", resetParallax);
      cancelAnimationFrame(frame);
      clearPixels();
      position.x = 0;
      position.y = 0;
      renderParallax();
    };
  }, [section, active, reducedMotion]);

  return (
    <div
      ref={scope}
      className={`${styles.monaArtwork} ${variant === "cta" ? styles.keynoteMona : ""}`}
      aria-hidden="true"
    >
      <div className={`${styles.monaStage} ${variant === "cta" ? styles.keynoteMonaStage : ""}`}>
        {(variant === "cta" ? ctaTrails : trails)
          .map((src, order) => (
            <ArtworkLayer
              key={src}
              src={src}
              order={order}
              reducedMotion={reducedMotion}
              revealOnView={variant === "cta"}
            />
          ))
          .reverse()}
        <ArtworkLayer
          src={variant === "cta" ? ctaForeground : foreground}
          isForeground
          reducedMotion={reducedMotion}
          revealOnView={variant === "cta"}
        />
      </div>
      {section &&
        createPortal(
          <span className={styles.pixelTrail} data-mona-pixel-trail aria-hidden="true">
            {pixels.map(([color, glyph], index) => (
              <span
                key={color}
                ref={(element) => {
                  pixelRefs.current[index] = element;
                }}
                className={styles.pixel}
                data-color={color}
              >
                {glyph}
              </span>
            ))}
          </span>,
          section,
        )}
    </div>
  );
}

export function MonaArtwork({ variant = "hero" }: { variant?: "hero" | "cta" }) {
  const [reducedMotion, setReducedMotion] = useState(true);

  const [ready, setReady] = useState(false);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");

    const update = () => setReducedMotion(preference.matches);

    update();
    setReady(true);
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);

  // Wait for the preference before mounting the reveal.
  return ready ? <AnimatedArtwork reducedMotion={reducedMotion} variant={variant} /> : null;
}
