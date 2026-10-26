export const animationBeats = {
  push: [],
  supply: [],
  scan: [],
  findings: [
    [500, 350],
    [800, 650],
    [1250, 250],
    [2400, 1800],
  ],
  activity: [],
  artifacts: [],
  projects: [],
  repository: [],
  connectors: [],
  fusion: [],
  automations: [],
} as const;

export type AnimationBeatName = keyof typeof animationBeats;

export function pacedTime(time: number, beats: readonly (readonly [number, number])[]) {
  let elapsed = time;

  for (const [at, hold] of beats) {
    if (elapsed < at) return elapsed;
    if (elapsed < at + hold) return at;
    elapsed -= hold;
  }
  return elapsed;
}

export function beatDuration(name?: AnimationBeatName) {
  return name ? animationBeats[name].reduce((sum, [, hold]) => sum + hold, 0) : 0;
}
