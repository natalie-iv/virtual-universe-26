// Ported from github-ui/packages/pull-requests/routes/stack-hero-mona.ts.
const palette = ["#5fed83", "#bba00a", "#ae85ff", "#f73678", "#c05200", "#583af7"];

const width = 66;

const height = 64;

const clamp = (value: number) => Math.max(0, Math.min(1, value));

const easeInOut = (value: number) => (1 - Math.cos(value * Math.PI)) / 2;

export type MonaSample = {
  position: { x: number; y: number };
  facing: number;
  scale: number;
  moving: boolean;
  start: number;
  arrive: number;
  idleStart: number;
  click: number;
  bob: number;
  stretch: number;
  trailDelay: number;
};

export function monaGlide(
  from: readonly [number, number],
  to: readonly [number, number],
  index: number,
  curved = true,
) {
  const dx = to[0] - from[0];

  const dy = to[1] - from[1];

  const distance = Math.hypot(dx, dy);

  const side = index % 2 === 0 ? 1 : -1;

  const firstOffset = curved ? (index === 1 ? 0.06 : distance < 300 ? 0.13 : 0.1) * side : 0;

  const secondOffset = distance < 300 || index === 1 ? firstOffset : -firstOffset;

  const first = [from[0] + dx / 3 - dy * firstOffset, from[1] + dy / 3 + dx * firstOffset];

  const second = [
    from[0] + (dx * 2) / 3 - dy * secondOffset,
    from[1] + (dy * 2) / 3 + dx * secondOffset,
  ];

  function positionAt(fraction: number): readonly [number, number] {
    const rest = 1 - fraction;

    const weights = [rest ** 3, 3 * rest ** 2 * fraction, 3 * rest * fraction ** 2, fraction ** 3];

    return [
      weights[0] * from[0] + weights[1] * first[0] + weights[2] * second[0] + weights[3] * to[0],
      weights[0] * from[1] + weights[1] * first[1] + weights[2] * second[1] + weights[3] * to[1],
    ];
  }

  const lengths = [0];

  let previous = from;

  for (let step = 1; step <= 128; step++) {
    const next = positionAt(step / 128);

    lengths.push(lengths[step - 1] + Math.hypot(next[0] - previous[0], next[1] - previous[1]));
    previous = next;
  }
  const length = lengths[128];

  const duration =
    Math.round(
      (Math.min(2200, Math.max(900, (length / ((1775 - 2) / 1440) / 480) * 1000)) * 0.95) / 10,
    ) * 10;

  return {
    duration,
    position(fraction: number) {
      const eased = (1 - Math.cos(clamp(fraction) * Math.PI)) / 2;

      const along = eased * length;

      const end = Math.max(
        1,
        lengths.findIndex((value) => value >= along),
      );

      const startLength = lengths[end - 1];

      const endLength = lengths[end];

      const partial =
        endLength === startLength ? 0 : (along - startLength) / (endLength - startLength);

      return positionAt((end - 1 + partial) / 128);
    },
    trailDelay: Math.min(10, 15.5 / ((Math.PI / 2) * (length / duration))),
  };
}

function trailColor(time: number, index: number) {
  const phase = time / 200;

  const step = Math.floor(phase);

  const mix = phase - step;

  const from = palette[(step + index) % palette.length];

  const to = palette[(step + index + 1) % palette.length];

  const components = [1, 3, 5].map((offset) => {
    const a = Number.parseInt(from.slice(offset, offset + 2), 16);

    const b = Number.parseInt(to.slice(offset, offset + 2), 16);

    return (a + (b - a) * mix) / 255;
  });

  const [red, green, blue] = components;

  const max = Math.max(red, green, blue);

  const min = Math.min(red, green, blue);

  const delta = max - min;

  const lightness = (max + min) / 2;

  const saturation = delta === 0 ? 0 : delta / (1 - Math.abs(2 * lightness - 1));

  const hue =
    delta === 0
      ? 0
      : max === red
        ? ((green - blue) / delta + 6) % 6
        : max === green
          ? (blue - red) / delta + 2
          : (red - green) / delta + 4;

  const offset = (index / 5) * 0.1;

  return `hsl(${hue * 60} ${clamp(saturation + offset) * 100}% ${clamp(lightness + offset) * 100}%)`;
}

export function buoyancy(time: number) {
  const lift = (1 - Math.cos((time / 2200) * Math.PI * 2)) / 2;

  return { bob: Math.round(2 - 4 * lift), stretch: Math.round(lift * 3) };
}

export function createMonaRenderer(canvas: HTMLCanvasElement, atlas: HTMLImageElement) {
  const context = canvas.getContext("2d");

  const silhouette = document.createElement("canvas");

  silhouette.width = width;
  silhouette.height = height;
  const mask = silhouette.getContext("2d");

  if (!context || !mask) throw new Error("Mona preview requires a 2D canvas");
  context.imageSmoothingEnabled = false;
  mask.imageSmoothingEnabled = false;

  function frame(time: number, sample: MonaSample) {
    if (!sample.moving) return { x: sample.stretch * 26, y: 0 };
    const glideFrames = [4, 5, 6, 5];

    return { x: glideFrames[Math.floor((time - sample.start) / 200) % 4] * 26, y: 0 };
  }

  function place(sample: MonaSample, draw: () => void) {
    if (!context) throw new Error("Missing Mona rendering context");
    context.save();
    context.translate(
      Math.round(sample.position.x + width / 2),
      Math.round(sample.position.y + sample.bob + height / 2),
    );
    context.scale(sample.scale * sample.facing, sample.scale);
    context.translate(-width / 2, -height / 2);
    draw();
    context.restore();
  }

  return (time: number, sampleAt: (milliseconds: number) => MonaSample) => {
    const sample = sampleAt(time);

    const clip = frame(time, sample);

    context.clearRect(0, 0, canvas.width, canvas.height);
    if (sample.moving) {
      for (let index = 5; index >= 0; index--) {
        const enter = easeInOut(clamp((time - sample.start - index * 30) / 350));

        const exitStart = sample.arrive - 425 + (5 - index) * 25;

        const exit = 1 - easeInOut(clamp((time - exitStart) / 300));

        const spread = Math.min(enter, exit);

        if (spread <= 0) continue;
        const delayedTime = Math.max(0, time - sample.trailDelay * (index + 1) * spread);

        const ghost = sampleAt(delayedTime);

        mask.clearRect(0, 0, width, height);
        mask.globalCompositeOperation = "source-over";
        mask.drawImage(atlas, clip.x, clip.y, 26, 27, 0, 0, width, height);
        mask.globalCompositeOperation = "source-in";
        mask.fillStyle = trailColor(time, index);
        mask.fillRect(0, 0, width, height);
        place(ghost, () => {
          context.globalAlpha = spread;
          context.drawImage(silhouette, 0, 0);
        });
      }
    }
    context.globalAlpha = 1;
    place(sample, () => context.drawImage(atlas, clip.x, clip.y, 26, 27, 0, 0, width, height));
    canvas.dataset.monaX = String(sample.position.x);
    canvas.dataset.monaY = String(sample.position.y + sample.bob);
    canvas.dataset.monaMoving = String(sample.moving);
    canvas.dataset.monaArrival = String(sample.arrive);
    canvas.dataset.monaTrailDelay = String(sample.trailDelay);
    canvas.dataset.monaFacing = String(sample.facing);
  };
}
