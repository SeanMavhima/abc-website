/**
 * The procedural landscape behind the homepage: one river valley that runs
 * from forested highlands, past cultivated hills and a wetland, out to open
 * water. Everything is generated from the functions in this file, so there
 * are no 3D model files to license, download or keep up to date.
 *
 * Axes: x is across the valley, y is up, z runs along it. The camera starts
 * upstream (large z) and travels downstream (negative z). Water is at y = 0.
 */

export type ThemeName = "dawn" | "day" | "dusk";
export type ThemeSetting = ThemeName | "auto";
export type Zone = "canopy" | "hills" | "wetland" | "water" | "sky";
export type Quality = "high" | "low";

export const WORLD = { width: 190, length: 260, zStart: 86, zEnd: -92 };

const smoothstep = (a: number, b: number, v: number) => {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** Centre line of the river as it meanders down the valley. */
export function riverX(z: number) {
  return 15 * Math.sin(z * 0.034) + 5 * Math.sin(z * 0.081 + 1.7);
}

/** Terrain height at a point. Used for the mesh, for planting and for the camera. */
export function heightAt(x: number, z: number) {
  const d = Math.abs(x - riverX(z));
  // Slopes are tall upstream and sink away into the lake downstream.
  const amplitude = (7 + 17 * smoothstep(-15, 80, z)) * smoothstep(-96, -34, z);
  const slope = Math.pow(smoothstep(2.5, 52, d), 1.15);
  const rolling =
    3.4 * Math.sin(x * 0.052 + 1.3) * Math.cos(z * 0.047) +
    1.9 * Math.sin(x * 0.118 + z * 0.083) +
    0.9 * Math.sin(x * 0.27 - z * 0.21 + 0.6) +
    0.35 * Math.sin(x * 0.61 + z * 0.53);
  const lift = smoothstep(2, 20, d);
  // Wide, nearly flat marsh on either side of the river in the middle reach.
  const marsh = 1 - smoothstep(8, 26, d) * 1;
  const marshZone = smoothstep(-48, -30, z) * (1 - smoothstep(4, 22, z));
  const bank = -1.5 + 2.1 * smoothstep(1.2, 6.5, d);
  const land = bank + slope * amplitude + rolling * lift * (0.35 + 0.65 * smoothstep(-70, 20, z));
  const flattened = land * (1 - 0.72 * marsh * marshZone) + 0.25 * marsh * marshZone;
  // Downstream the valley floor drops below the water to form the lake.
  return flattened - 3.2 * (1 - smoothstep(-84, -46, z)) * (1 - smoothstep(10, 60, d) * 0.55);
}

/** Deterministic random numbers, so the landscape is the same on every visit. */
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ------------------------------------------------------------------ */
/* Camera journey                                                      */
/* ------------------------------------------------------------------ */

type V3 = [number, number, number];

/** Camera positions from the first frame (above the forest) to the last (at the water's edge). */
export const CAMERA_PATH: V3[] = [
  [riverX(84) + 3, 31, 84],
  [riverX(46) + 11, 17.5, 46],
  [riverX(8) - 9, 8.2, 8],
  [riverX(-26) + 5, 3.6, -26],
  [riverX(-50) - 1, 2.5, -50],
];

/** What the camera looks at, matching CAMERA_PATH point for point. */
export const CAMERA_TARGETS: V3[] = [
  [riverX(40), 6, 40],
  [riverX(6), 3, 4],
  [riverX(-30), 1.5, -32],
  [riverX(-60), 1.6, -64],
  [riverX(-100), 3.2, -110],
];

/** Where information points sit in the landscape. */
export const ZONE_ANCHORS: Record<Zone, V3> = {
  canopy: [riverX(48) + 27, heightAt(riverX(48) + 27, 48) + 5, 48],
  hills: [riverX(4) + 24, heightAt(riverX(4) + 24, 4) + 3.2, 4],
  wetland: [riverX(-30) + 9, 1.6, -32],
  water: [riverX(-66) + 7, 0.7, -70],
  sky: [riverX(-40) + 16, 15, -70],
};

/* ------------------------------------------------------------------ */
/* Visual themes                                                       */
/* ------------------------------------------------------------------ */

export type Theme = {
  skyTop: string;
  skyHorizon: string;
  sunGlow: string;
  fog: string;
  fogNear: number;
  fogFar: number;
  hemiSky: string;
  hemiGround: string;
  hemiIntensity: number;
  sun: string;
  sunIntensity: number;
  waterDeep: string;
  waterSky: string;
  mist: string;
  mistOpacity: number;
  particle: string;
  /** Fireflies blink; pollen drifts. */
  fireflies: boolean;
  /** Multiplies every land colour, so one palette serves all themes. */
  landTint: string;
};

export const THEMES: Record<ThemeName, Theme> = {
  dawn: {
    skyTop: "#31566a",
    skyHorizon: "#f7dfb4",
    sunGlow: "#ffe2ad",
    fog: "#ecdcbd",
    fogNear: 30,
    fogFar: 185,
    hemiSky: "#fff0d2",
    hemiGround: "#75845a",
    hemiIntensity: 1.9,
    sun: "#ffd9a6",
    sunIntensity: 1.7,
    waterDeep: "#2f5a55",
    waterSky: "#f6d7a3",
    mist: "#fff0d6",
    mistOpacity: 0.28,
    particle: "#fff2c9",
    fireflies: false,
    landTint: "#fff6e6",
  },
  day: {
    skyTop: "#4f97c0",
    skyHorizon: "#dcefe6",
    sunGlow: "#ffffff",
    fog: "#cfe6dc",
    fogNear: 34,
    fogFar: 205,
    hemiSky: "#f2fbff",
    hemiGround: "#7c8f5e",
    hemiIntensity: 1.9,
    sun: "#fff6e2",
    sunIntensity: 2.3,
    waterDeep: "#1f5b63",
    waterSky: "#cfeaf0",
    mist: "#ffffff",
    mistOpacity: 0.16,
    particle: "#f6ffd8",
    fireflies: false,
    landTint: "#ffffff",
  },
  dusk: {
    skyTop: "#081621",
    skyHorizon: "#3c5262",
    sunGlow: "#d98a62",
    fog: "#2b4557",
    fogNear: 26,
    fogFar: 170,
    hemiSky: "#7f9fc2",
    hemiGround: "#3f5a55",
    hemiIntensity: 2.1,
    sun: "#f0a878",
    sunIntensity: 1.4,
    waterDeep: "#0c2430",
    waterSky: "#5c7688",
    mist: "#9fb9cf",
    mistOpacity: 0.2,
    particle: "#ffe58a",
    fireflies: true,
    landTint: "#b9cbd6",
  },
};

/** "auto" follows the visitor's own clock: gold light early and late, clear by day, dusk at night. */
export function resolveTheme(setting: ThemeSetting, hour = new Date().getHours()): ThemeName {
  if (setting !== "auto") return setting;
  if (hour >= 5 && hour < 9) return "dawn";
  if (hour >= 9 && hour < 17) return "day";
  if (hour >= 17 && hour < 19) return "dawn";
  return "dusk";
}

export function isThemeSetting(v: unknown): v is ThemeSetting {
  return v === "auto" || v === "dawn" || v === "day" || v === "dusk";
}

/** Counts of things to draw. Lower-powered devices get a lighter landscape. */
export const BUDGET: Record<Quality, { trees: number; reeds: number; segX: number; segZ: number; particles: number; birds: number; dpr: number }> = {
  high: { trees: 1700, reeds: 3200, segX: 150, segZ: 210, particles: 420, birds: 16, dpr: 1.75 },
  low: { trees: 650, reeds: 1100, segX: 90, segZ: 126, particles: 160, birds: 8, dpr: 1.15 },
};
