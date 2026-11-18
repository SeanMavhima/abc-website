"use client";

/**
 * The homepage 3D landscape. Loaded only in the browser, only when the
 * visitor's device can draw it (see hero-experience.tsx).
 *
 * Everything here is procedural: geometry is generated from world.ts and
 * animated with small shader additions, so no model or texture files ship.
 */
import * as React from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import {
  BUDGET,
  CAMERA_PATH,
  CAMERA_TARGETS,
  THEMES,
  WORLD,
  ZONE_ANCHORS,
  heightAt,
  mulberry32,
  riverX,
  type Quality,
  type Theme,
  type ThemeName,
  type Zone,
} from "./world";

export type SceneProps = {
  theme: ThemeName;
  quality: Quality;
  /** Whether the hero is on screen. Rendering stops when it is not. */
  active: boolean;
  /** Scroll progress through the hero, 0 to 1. Read every frame. */
  progress: React.RefObject<number>;
  /** Pointer position, -1 to 1 on each axis. Read every frame. */
  pointer: React.RefObject<{ x: number; y: number }>;
  /** Zones of the information points, in the same order as `markers`. */
  zones: Zone[];
  /** DOM elements positioned over the canvas, one per information point. */
  markers: React.RefObject<(HTMLElement | null)[]>;
  onReady: () => void;
  /** Called when the device cannot keep an acceptable frame rate. */
  onStruggle: () => void;
};

const SUN_DIRECTION: Record<ThemeName, [number, number, number]> = {
  dawn: [0.22, 0.17, -1],
  day: [0.35, 0.8, -0.55],
  dusk: [-0.3, 0.06, -1],
};

const smoothstep = (a: number, b: number, v: number) => {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/* ------------------------------------------------------------------ */
/* Geometry builders                                                   */
/* ------------------------------------------------------------------ */

/** Paints every vertex of a geometry, optionally shading by height for a soft, grounded look. */
function paint(geo: THREE.BufferGeometry, color: THREE.Color, shade?: { from: number; to: number; min: number }) {
  const pos = geo.getAttribute("position");
  const colors = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) {
    const k = shade ? shade.min + (1 - shade.min) * smoothstep(shade.from, shade.to, pos.getY(i)) : 1;
    colors[i * 3] = color.r * k;
    colors[i * 3 + 1] = color.g * k;
    colors[i * 3 + 2] = color.b * k;
  }
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geo.deleteAttribute("uv");
  return geo;
}

function flat(geo: THREE.BufferGeometry) {
  const g = geo.index ? geo.toNonIndexed() : geo;
  g.computeVertexNormals();
  return g;
}

const BARK = new THREE.Color("#5a4230");
const WHITE = new THREE.Color("#ffffff");

function broadleafGeometry() {
  const trunk = paint(flat(new THREE.CylinderGeometry(0.07, 0.13, 1.2, 5).translate(0, 0.6, 0)), BARK);
  const crown = paint(flat(new THREE.IcosahedronGeometry(1, 1).scale(1, 0.86, 1).translate(0, 1.85, 0)), WHITE, { from: 1, to: 2.5, min: 0.58 });
  const side = paint(flat(new THREE.IcosahedronGeometry(0.62, 0).translate(0.62, 1.4, 0.18)), WHITE, { from: 0.8, to: 2, min: 0.55 });
  return mergeGeometries([trunk, crown, side]);
}

function acaciaGeometry() {
  const trunk = paint(flat(new THREE.CylinderGeometry(0.05, 0.11, 1.9, 5).translate(0, 0.95, 0)), BARK);
  const crown = paint(flat(new THREE.IcosahedronGeometry(1.35, 1).scale(1, 0.24, 1).translate(0, 2.05, 0)), WHITE, { from: 1.8, to: 2.3, min: 0.6 });
  return mergeGeometries([trunk, crown]);
}

function reedGeometry() {
  return paint(flat(new THREE.ConeGeometry(0.028, 1, 3).translate(0, 0.5, 0)), WHITE, { from: 0, to: 1, min: 0.7 });
}

/** Adds wind to a material: instances lean with a slow travelling wave, more at the top than the base. */
function withWind<M extends THREE.Material>(material: M, time: { value: number }, strength: number): M {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = time;
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nuniform float uTime;")
      .replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
        #ifdef USE_INSTANCING
          vec3 root = (instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
          float lean = max(position.y, 0.0);
          lean *= lean;
          float gust = sin(uTime * 1.25 + root.x * 0.31 + root.z * 0.23) * 0.6 + sin(uTime * 2.3 + root.x * 0.9) * 0.25;
          transformed.x += gust * lean * ${strength.toFixed(4)};
          transformed.z += cos(uTime * 1.05 + root.z * 0.37) * lean * ${(strength * 0.6).toFixed(4)};
        #endif`,
      );
  };
  return material;
}

/* ------------------------------------------------------------------ */
/* World                                                               */
/* ------------------------------------------------------------------ */

type Built = {
  group: THREE.Group;
  time: { value: number };
  sky: THREE.Mesh;
  mist: THREE.Sprite[];
  birds: THREE.InstancedMesh;
  birdData: { cx: number; cy: number; cz: number; r: number; speed: number; phase: number }[];
  particles: THREE.ShaderMaterial;
  water: THREE.ShaderMaterial;
  dispose: () => void;
};

function buildWorld(theme: Theme, themeName: ThemeName, quality: Quality): Built {
  const budget = BUDGET[quality];
  const rand = mulberry32(20261115);
  const group = new THREE.Group();
  const time = { value: 0 };
  const disposables: { dispose: () => void }[] = [];
  const keep = <T extends { dispose: () => void }>(o: T) => (disposables.push(o), o);
  const tint = new THREE.Color(theme.landTint);
  const sunDir = new THREE.Vector3(...SUN_DIRECTION[themeName]).normalize();

  /* Lights */
  group.add(new THREE.HemisphereLight(theme.hemiSky, theme.hemiGround, theme.hemiIntensity));
  const sun = new THREE.DirectionalLight(theme.sun, theme.sunIntensity);
  sun.position.copy(sunDir).multiplyScalar(100);
  group.add(sun);

  /* Sky */
  const skyMaterial = keep(
    new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      fog: false,
      uniforms: {
        uTop: { value: new THREE.Color(theme.skyTop) },
        uHorizon: { value: new THREE.Color(theme.skyHorizon) },
        uGlow: { value: new THREE.Color(theme.sunGlow) },
        uSun: { value: sunDir },
      },
      vertexShader: `varying vec3 vDir;
        void main() {
          vDir = normalize(position);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: `uniform vec3 uTop; uniform vec3 uHorizon; uniform vec3 uGlow; uniform vec3 uSun;
        varying vec3 vDir;
        void main() {
          vec3 d = normalize(vDir);
          float h = clamp(d.y * 1.5 + 0.06, 0.0, 1.0);
          vec3 col = mix(uHorizon, uTop, pow(h, 0.62));
          float s = max(dot(d, uSun), 0.0);
          col += uGlow * (pow(s, 32.0) * 0.6 + pow(s, 5.0) * 0.2);
          gl_FragColor = vec4(col, 1.0);
          #include <colorspace_fragment>
        }`,
    }),
  );
  const sky = new THREE.Mesh(keep(new THREE.SphereGeometry(390, 24, 16)), skyMaterial);
  sky.renderOrder = -10;
  sky.frustumCulled = false;
  group.add(sky);

  /* Terrain */
  const terrainGeo = keep(new THREE.PlaneGeometry(WORLD.width, WORLD.length, budget.segX, budget.segZ));
  terrainGeo.rotateX(-Math.PI / 2);
  terrainGeo.translate(0, 0, (WORLD.zStart + WORLD.zEnd) / 2 + 12);
  {
    const pos = terrainGeo.getAttribute("position");
    const colors = new Float32Array(pos.count * 3);
    const sand = new THREE.Color("#a9aa7a");
    const mud = new THREE.Color("#56634a");
    const marsh = new THREE.Color("#86a84f");
    const grass = new THREE.Color("#7a9a48");
    const field = new THREE.Color("#b3ad63");
    const forest = new THREE.Color("#2f5233");
    const ridge = new THREE.Color("#536b45");
    const c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const h = heightAt(x, z);
      pos.setY(i, h);
      const d = Math.abs(x - riverX(z));
      const forestness = smoothstep(-4, 34, z) * smoothstep(1.5, 7, h);
      // Terraced fields: bands that follow the contour of the middle hills.
      const terraces = (0.5 + 0.5 * Math.sin(h * 2.6 + Math.sin(x * 0.2) * 0.8)) * smoothstep(2, 6, h) * (1 - forestness) * smoothstep(-60, -20, z);
      c.copy(grass).lerp(field, terraces * 0.75);
      c.lerp(marsh, (1 - smoothstep(8, 26, d)) * (1 - smoothstep(1.2, 3, h)));
      c.lerp(forest, forestness * 0.92);
      c.lerp(ridge, smoothstep(17, 26, h) * 0.7);
      c.lerp(sand, 1 - smoothstep(0.0, 0.4, h));
      c.lerp(mud, 1 - smoothstep(-0.9, 0.05, h));
      // A little variation so large areas do not look flat.
      const speckle = 0.93 + 0.07 * Math.sin(x * 1.7 + z * 2.3) * Math.sin(x * 0.63 - z * 0.41);
      colors[i * 3] = c.r * tint.r * speckle;
      colors[i * 3 + 1] = c.g * tint.g * speckle;
      colors[i * 3 + 2] = c.b * tint.b * speckle;
    }
    terrainGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    terrainGeo.computeVertexNormals();
  }
  group.add(new THREE.Mesh(terrainGeo, keep(new THREE.MeshLambertMaterial({ vertexColors: true }))));

  /* Water */
  const waterMaterial = keep(
    new THREE.ShaderMaterial({
      fog: true,
      uniforms: THREE.UniformsUtils.merge([
        THREE.UniformsLib.fog,
        {
          uDeep: { value: new THREE.Color(theme.waterDeep) },
          uSky: { value: new THREE.Color(theme.waterSky) },
          uSunColor: { value: new THREE.Color(theme.sunGlow) },
          uSun: { value: sunDir.clone() },
          uTime: { value: 0 },
        },
      ]),
      vertexShader: `varying vec3 vWorld;
        #include <fog_pars_vertex>
        void main() {
          vec4 world = modelMatrix * vec4(position, 1.0);
          vWorld = world.xyz;
          vec4 mvPosition = viewMatrix * world;
          gl_Position = projectionMatrix * mvPosition;
          #include <fog_vertex>
        }`,
      fragmentShader: `uniform vec3 uDeep; uniform vec3 uSky; uniform vec3 uSunColor; uniform vec3 uSun; uniform float uTime;
        varying vec3 vWorld;
        #include <fog_pars_fragment>
        float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        float noise(vec2 p) {
          vec2 i = floor(p); vec2 f = fract(p);
          f = f * f * (3.0 - 2.0 * f);
          return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
        }
        void main() {
          vec3 view = normalize(cameraPosition - vWorld);
          vec2 p = vWorld.xz;
          float n = noise(p * 0.32 + vec2(uTime * 0.11, uTime * 0.06)) * 0.6 + noise(p * 1.25 - vec2(uTime * 0.18, 0.0)) * 0.4;
          // Tilt the surface slightly with the ripples, then reflect the sky.
          vec3 normal = normalize(vec3((n - 0.5) * 0.22, 1.0, (noise(p * 0.9 + uTime * 0.1) - 0.5) * 0.22));
          float fresnel = pow(1.0 - max(dot(view, normal), 0.0), 3.0);
          vec3 col = mix(uDeep, uSky, clamp(fresnel * 0.92 + 0.06, 0.0, 1.0));
          vec3 reflected = reflect(-view, normal);
          float glint = pow(max(dot(reflected, normalize(uSun)), 0.0), 90.0);
          col += uSunColor * glint * 0.9;
          gl_FragColor = vec4(col, 1.0);
          #include <colorspace_fragment>
          #include <fog_fragment>
        }`,
    }),
  );
  const water = new THREE.Mesh(keep(new THREE.PlaneGeometry(900, 900).rotateX(-Math.PI / 2)), waterMaterial);
  water.position.set(0, 0, -120);
  group.add(water);

  /* Trees */
  const forestTints = ["#2f5d34", "#3d6b35", "#4b7a3a", "#2a5140", "#5c8440"].map((h) => new THREE.Color(h));
  const acaciaTints = ["#6b8a3c", "#7d9444", "#5f7f3a"].map((h) => new THREE.Color(h));
  const broadleaf: THREE.Matrix4[] = [];
  const broadleafColor: THREE.Color[] = [];
  const acacia: THREE.Matrix4[] = [];
  const acaciaColor: THREE.Color[] = [];
  const dummy = new THREE.Object3D();
  for (let tries = 0; tries < budget.trees * 14 && broadleaf.length + acacia.length < budget.trees; tries++) {
    const x = (rand() - 0.5) * (WORLD.width - 8);
    const z = WORLD.zEnd + 18 + rand() * (WORLD.zStart - WORLD.zEnd + 14);
    const h = heightAt(x, z);
    if (h < 0.9) continue;
    const d = Math.abs(x - riverX(z));
    if (d < (z < 20 ? 13 : 7)) continue; // keep the camera's corridor clear
    const forestness = smoothstep(-8, 30, z);
    if (rand() > 0.1 + 0.9 * forestness) continue;
    const isAcacia = z < 0 && rand() < 0.75;
    const scale = isAcacia ? 1.3 + rand() * 1.1 : 1.3 + rand() * 1.5 + forestness * 0.9;
    dummy.position.set(x, h - 0.08, z);
    dummy.rotation.set(0, rand() * Math.PI * 2, 0);
    dummy.scale.set(scale * (0.85 + rand() * 0.3), scale, scale * (0.85 + rand() * 0.3));
    dummy.updateMatrix();
    const palette = isAcacia ? acaciaTints : forestTints;
    const color = palette[Math.floor(rand() * palette.length)].clone().multiply(tint).multiplyScalar(0.82 + rand() * 0.36);
    if (isAcacia) {
      acacia.push(dummy.matrix.clone());
      acaciaColor.push(color);
    } else {
      broadleaf.push(dummy.matrix.clone());
      broadleafColor.push(color);
    }
  }
  const plant = (geo: THREE.BufferGeometry, matrices: THREE.Matrix4[], colors: THREE.Color[], wind: number) => {
    if (matrices.length === 0) return;
    const material = withWind(keep(new THREE.MeshLambertMaterial({ vertexColors: true })), time, wind);
    const mesh = new THREE.InstancedMesh(keep(geo), material, matrices.length);
    matrices.forEach((m, i) => {
      mesh.setMatrixAt(i, m);
      mesh.setColorAt(i, colors[i]);
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.frustumCulled = false;
    group.add(mesh);
  };
  plant(broadleafGeometry(), broadleaf, broadleafColor, 0.011);
  plant(acaciaGeometry(), acacia, acaciaColor, 0.009);

  /* Reeds along the banks and across the marsh */
  const reedTints = ["#a3c05e", "#b9c96a", "#d4c97c", "#93b458"].map((h) => new THREE.Color(h));
  const reeds: THREE.Matrix4[] = [];
  const reedColor: THREE.Color[] = [];
  for (let tries = 0; tries < budget.reeds * 10 && reeds.length < budget.reeds; tries++) {
    const z = -74 + rand() * 108;
    const x = riverX(z) + (rand() - 0.5) * 46;
    const h = heightAt(x, z);
    if (h < -0.25 || h > 1.5) continue;
    const s = 0.7 + rand() * 1.3;
    dummy.position.set(x, Math.max(h, -0.05) - 0.05, z);
    dummy.rotation.set((rand() - 0.5) * 0.25, rand() * Math.PI * 2, (rand() - 0.5) * 0.25);
    dummy.scale.set(1.4, s, 1.4);
    dummy.updateMatrix();
    reeds.push(dummy.matrix.clone());
    reedColor.push(reedTints[Math.floor(rand() * reedTints.length)].clone().multiply(tint).multiplyScalar(0.8 + rand() * 0.4));
  }
  plant(reedGeometry(), reeds, reedColor, 0.22);

  /* Mist */
  const mistCanvas = document.createElement("canvas");
  mistCanvas.width = mistCanvas.height = 128;
  const ctx = mistCanvas.getContext("2d");
  if (ctx) {
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.45, "rgba(255,255,255,0.42)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
  }
  const mistTexture = keep(new THREE.CanvasTexture(mistCanvas));
  const mist: THREE.Sprite[] = [];
  for (let i = 0; i < (quality === "high" ? 11 : 6); i++) {
    const z = 62 - i * (quality === "high" ? 13 : 24) + rand() * 6;
    const material = keep(
      new THREE.SpriteMaterial({ map: mistTexture, color: theme.mist, transparent: true, opacity: theme.mistOpacity * (0.6 + rand() * 0.5), depthWrite: false, fog: false }),
    );
    const sprite = new THREE.Sprite(material);
    sprite.position.set(riverX(z) + (rand() - 0.5) * 34, 2.2 + rand() * 4.5, z);
    sprite.scale.set(46 + rand() * 40, 9 + rand() * 9, 1);
    sprite.userData.x = sprite.position.x;
    sprite.userData.phase = rand() * 10;
    mist.push(sprite);
    group.add(sprite);
  }

  /* Particles: pollen by day, fireflies at dusk */
  const count = budget.particles;
  const positions = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const z = WORLD.zEnd + 20 + rand() * (WORLD.zStart - WORLD.zEnd - 10);
    positions[i * 3] = riverX(z) + (rand() - 0.5) * 60;
    positions[i * 3 + 1] = 0.6 + rand() * (theme.fireflies ? 5 : 16);
    positions[i * 3 + 2] = z;
    seeds[i] = rand();
  }
  const particleGeo = keep(new THREE.BufferGeometry());
  particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  particleGeo.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
  const particles = keep(
    new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: time,
        uColor: { value: new THREE.Color(theme.particle) },
        uScale: { value: 400 },
        uBlink: { value: theme.fireflies ? 1 : 0 },
        uSize: { value: theme.fireflies ? 0.34 : 0.16 },
      },
      vertexShader: `attribute float aSeed; uniform float uTime; uniform float uScale; uniform float uBlink; uniform float uSize;
        varying float vAlpha;
        void main() {
          vec3 p = position;
          p.y += sin(uTime * 0.45 + aSeed * 6.283) * 0.7;
          p.x += sin(uTime * 0.21 + aSeed * 41.0) * 1.1;
          p.z += cos(uTime * 0.17 + aSeed * 23.0) * 0.9;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mv;
          float depth = -mv.z;
          gl_PointSize = uSize * (0.5 + aSeed) * uScale / max(depth, 0.1);
          float blink = mix(1.0, smoothstep(0.35, 1.0, sin(uTime * (1.2 + aSeed * 2.0) + aSeed * 60.0)), uBlink);
          vAlpha = blink * smoothstep(1.5, 6.0, depth) * (1.0 - smoothstep(55.0, 95.0, depth)) * mix(0.42, 1.0, uBlink);
        }`,
      fragmentShader: `uniform vec3 uColor; varying float vAlpha;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          float a = smoothstep(0.5, 0.0, d);
          gl_FragColor = vec4(uColor, a * a * vAlpha);
          #include <colorspace_fragment>
        }`,
    }),
  );
  const points = new THREE.Points(particleGeo, particles);
  points.frustumCulled = false;
  group.add(points);

  /* Birds: a loose flock circling above the valley */
  const birdGeo = keep(new THREE.BufferGeometry());
  birdGeo.setAttribute(
    "position",
    new THREE.BufferAttribute(new Float32Array([0, 0, 0.26, 0, 0, -0.2, -0.6, 0, -0.08, 0, 0, 0.26, 0.6, 0, -0.08, 0, 0, -0.2]), 3),
  );
  const birdMaterial = keep(new THREE.MeshBasicMaterial({ color: theme.fireflies ? "#9fb4c4" : "#1f2b27", side: THREE.DoubleSide }));
  birdMaterial.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = time;
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nuniform float uTime;")
      .replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
        #ifdef USE_INSTANCING
          float phase = instanceMatrix[3].x * 0.7 + instanceMatrix[3].z * 0.3;
          transformed.y += abs(position.x) * sin(uTime * 8.5 + phase) * 0.75;
        #endif`,
      );
  };
  const birds = new THREE.InstancedMesh(birdGeo, birdMaterial, budget.birds);
  birds.frustumCulled = false;
  const birdData = Array.from({ length: budget.birds }, (_, i) => {
    const z = 30 - (i % 4) * 26 + rand() * 10;
    return { cx: riverX(z) + (rand() - 0.5) * 22, cy: 11 + rand() * 9 - (i % 4) * 1.6, cz: z, r: 7 + rand() * 13, speed: (0.12 + rand() * 0.12) * (rand() < 0.5 ? -1 : 1), phase: rand() * Math.PI * 2 };
  });
  group.add(birds);

  return {
    group,
    time,
    sky,
    mist,
    birds,
    birdData,
    particles,
    water: waterMaterial,
    dispose: () => disposables.forEach((d) => d.dispose()),
  };
}

function World({ theme, quality, progress, pointer, zones, markers, onReady, onStruggle }: Omit<SceneProps, "active">) {
  const { scene, camera, size, gl, setDpr } = useThree();
  const palette = THEMES[theme];
  const built = React.useMemo(() => buildWorld(palette, theme, quality), [palette, theme, quality]);

  const path = React.useMemo(() => new THREE.CatmullRomCurve3(CAMERA_PATH.map((p) => new THREE.Vector3(...p)), false, "catmullrom", 0.4), []);
  const targets = React.useMemo(() => new THREE.CatmullRomCurve3(CAMERA_TARGETS.map((p) => new THREE.Vector3(...p)), false, "catmullrom", 0.4), []);
  const anchors = React.useMemo(() => {
    const seen = new Map<Zone, number>();
    return zones.map((zone) => {
      const n = seen.get(zone) ?? 0;
      seen.set(zone, n + 1);
      const [x, y, z] = ZONE_ANCHORS[zone] ?? ZONE_ANCHORS.hills;
      // Several points in one zone are spread out so they do not overlap.
      return new THREE.Vector3(x + n * 7, y + n * 0.6, z - n * 5);
    });
  }, [zones]);

  const state = React.useRef({ p: 0, px: 0, py: 0, frames: 0, elapsed: 0, lowered: false, reported: false, ready: false });
  const scratch = React.useMemo(() => ({ pos: new THREE.Vector3(), look: new THREE.Vector3(), v: new THREE.Vector3(), right: new THREE.Vector3(), dummy: new THREE.Object3D() }), []);

  React.useEffect(() => {
    scene.fog = new THREE.Fog(palette.fog, palette.fogNear, palette.fogFar);
    scene.background = new THREE.Color(palette.fog);
    scene.add(built.group);
    return () => {
      scene.remove(built.group);
      built.dispose();
    };
  }, [scene, built, palette]);

  useFrame((_, rawDelta) => {
    const dt = Math.min(rawDelta, 0.1);
    const s = state.current;
    built.time.value += dt;
    const t = built.time.value;

    /* Camera: ease towards the scroll position, with a little drift and pointer parallax */
    const target = Math.min(1, Math.max(0, progress.current ?? 0));
    s.p += (target - s.p) * (1 - Math.exp(-dt * 3.4));
    const eased = s.p * s.p * (3 - 2 * s.p);
    path.getPoint(eased, scratch.pos);
    targets.getPoint(eased, scratch.look);
    const ptr = pointer.current ?? { x: 0, y: 0 };
    s.px += (ptr.x - s.px) * (1 - Math.exp(-dt * 2.5));
    s.py += (ptr.y - s.py) * (1 - Math.exp(-dt * 2.5));
    scratch.v.subVectors(scratch.look, scratch.pos).normalize();
    scratch.right.crossVectors(scratch.v, camera.up).normalize();
    scratch.pos.addScaledVector(scratch.right, s.px * 1.5 + Math.sin(t * 0.19) * 0.35);
    scratch.pos.y += -s.py * 0.7 + Math.sin(t * 0.27) * 0.18;
    scratch.pos.y = Math.max(scratch.pos.y, heightAt(scratch.pos.x, scratch.pos.z) + 1.7, 1.5);
    camera.position.copy(scratch.pos);
    camera.lookAt(scratch.look);

    built.sky.position.copy(camera.position);
    built.particles.uniforms.uScale.value = size.height * 0.9;

    built.water.uniforms.uTime.value = t;

    /* Mist drifts across the valley */
    for (const m of built.mist) m.position.x = m.userData.x + Math.sin(t * 0.05 + m.userData.phase) * 9;

    /* Birds */
    built.birdData.forEach((b, i) => {
      const a = b.phase + t * b.speed;
      const x = b.cx + Math.cos(a) * b.r;
      const z = b.cz + Math.sin(a) * b.r * 1.5;
      const y = b.cy + Math.sin(a * 2 + i) * 0.9;
      scratch.dummy.position.set(x, y, z);
      const ahead = a + Math.sign(b.speed) * 0.2;
      scratch.dummy.lookAt(b.cx + Math.cos(ahead) * b.r, y, b.cz + Math.sin(ahead) * b.r * 1.5);
      scratch.dummy.rotateZ(Math.sign(b.speed) * -0.35);
      scratch.dummy.scale.setScalar(0.85);
      scratch.dummy.updateMatrix();
      built.birds.setMatrixAt(i, scratch.dummy.matrix);
    });
    built.birds.instanceMatrix.needsUpdate = true;

    /* Information points: project each anchor to the screen and move its DOM marker */
    const els = markers.current ?? [];
    for (let i = 0; i < anchors.length; i++) {
      const el = els[i];
      if (!el) continue;
      scratch.v.copy(anchors[i]);
      const distance = scratch.v.distanceTo(camera.position);
      scratch.v.project(camera);
      const onScreen = scratch.v.z < 1 && Math.abs(scratch.v.x) < 0.88 && scratch.v.y > -0.12 && scratch.v.y < 0.66 && distance > 9 && distance < 105;
      if (onScreen) {
        const x = (scratch.v.x * 0.5 + 0.5) * size.width;
        const y = (-scratch.v.y * 0.5 + 0.5) * size.height;
        el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
        el.style.opacity = String(Math.min(1, smoothstep(105, 80, distance), smoothstep(9, 16, distance)));
        el.style.visibility = "visible";
      } else if (el.style.visibility !== "hidden") {
        el.style.opacity = "0";
        el.style.visibility = "hidden";
      }
    }

    /* First frame drawn: tell the page, so the poster can fade away */
    if (!s.ready) {
      s.ready = true;
      onReady();
    }

    /* Frame-rate guard: lower the resolution once, and give up if that is not enough */
    if (t > 1.2 && !s.reported) {
      s.frames++;
      s.elapsed += rawDelta;
      if (s.frames >= 75) {
        const fps = s.frames / s.elapsed;
        s.frames = 0;
        s.elapsed = 0;
        if (fps < 24 && !s.lowered) {
          s.lowered = true;
          setDpr(Math.min(1, gl.getPixelRatio()));
        } else if (fps < 15 && s.lowered) {
          s.reported = true;
          onStruggle();
        }
      }
    }
  });

  return null;
}

/** Catches WebGL start-up failures so the page can switch to its photographic hero. */
class SceneBoundary extends React.Component<{ onError: () => void; children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export default function Scene({ active, ...props }: SceneProps) {
  const budget = BUDGET[props.quality];
  return (
    <SceneBoundary onError={props.onStruggle}>
      <Canvas
        flat
        frameloop={active ? "always" : "never"}
        dpr={[1, Math.min(budget.dpr, typeof window === "undefined" ? 1 : window.devicePixelRatio || 1)]}
        gl={{ antialias: props.quality === "high", alpha: false, powerPreference: "high-performance", stencil: false }}
        camera={{ fov: 46, near: 0.5, far: 460, position: CAMERA_PATH[0] }}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener("webglcontextlost", (e) => {
            e.preventDefault();
            props.onStruggle();
          });
        }}
        aria-hidden="true"
        tabIndex={-1}
      >
        <World {...props} />
      </Canvas>
    </SceneBoundary>
  );
}
