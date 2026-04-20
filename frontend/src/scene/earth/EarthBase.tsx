import { useEffect, useMemo, useRef } from "react";
import type { Mesh } from "three";
import * as THREE from "three";

type Props = {
  radius: number;
};

export function EarthBase({ radius }: Props) {
  const ref = useRef<Mesh>(null);

  const material = useMemo(() => {
    const { map, emissiveMap } = getAtlasTextures();
    const m = new THREE.MeshStandardMaterial({
      map,
      roughness: 0.92,
      metalness: 0.03,
      emissive: new THREE.Color("#1dd3ff"),
      emissiveMap,
      emissiveIntensity: 0.22,
    });
    (m.map as THREE.Texture).anisotropy = 8;
    (m.emissiveMap as THREE.Texture).anisotropy = 8;
    return m;
  }, []);

  useEffect(() => {
    return () => {
      material.dispose();
    };
  }, [material]);

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[radius, 96, 96]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}

function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

function hash2(ix: number, iy: number, seed: number) {
  const h = Math.sin(ix * 127.1 + iy * 311.7 + seed * 0.123) * 43758.5453123;
  return h - Math.floor(h);
}

function valueNoise2(x: number, y: number, seed: number) {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;

  const a = hash2(ix, iy, seed);
  const b = hash2(ix + 1, iy, seed);
  const c = hash2(ix, iy + 1, seed);
  const d = hash2(ix + 1, iy + 1, seed);

  const u = fx * fx * (3 - 2 * fx);
  const v = fy * fy * (3 - 2 * fy);

  const ab = a + (b - a) * u;
  const cd = c + (d - c) * u;
  return ab + (cd - ab) * v;
}

function fbm(x: number, y: number, seed: number) {
  let amp = 0.55;
  let freq = 1.0;
  let sum = 0;
  let norm = 0;
  for (let o = 0; o < 4; o += 1) {
    sum += valueNoise2(x * freq, y * freq, seed + o * 97) * amp;
    norm += amp;
    amp *= 0.55;
    freq *= 2.0;
  }
  return sum / Math.max(1e-6, norm);
}

function setTextureSrgb(tex: THREE.CanvasTexture) {
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
}

let ATLAS_CACHE:
  | {
      map: THREE.CanvasTexture;
      emissiveMap: THREE.CanvasTexture;
    }
  | null = null;

function getAtlasTextures() {
  if (ATLAS_CACHE) return ATLAS_CACHE;
  ATLAS_CACHE = createAtlasTextures(512, 1337);
  return ATLAS_CACHE;
}

function createAtlasTextures(size = 512, seed = 1337) {
  const w = size;
  const h = Math.floor(size / 2);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) throw new Error("Failed to create canvas 2D context");

  const emissiveCanvas = document.createElement("canvas");
  emissiveCanvas.width = w;
  emissiveCanvas.height = h;
  const ectx = emissiveCanvas.getContext("2d", { alpha: false });
  if (!ectx) throw new Error("Failed to create emissive 2D context");

  const img = ctx.getImageData(0, 0, w, h);
  const eimg = ectx.getImageData(0, 0, w, h);
  const data = img.data;
  const edata = eimg.data;

  const ocean = new THREE.Color("#040b14");
  const ocean2 = new THREE.Color("#061423");
  const land = new THREE.Color("#0b2b36");
  const land2 = new THREE.Color("#12485b");
  const coast = new THREE.Color("#1dd3ff");

  for (let y = 0; y < h; y += 1) {
    const v = y / (h - 1);
    const lat = (v - 0.5) * Math.PI;
    const pole = Math.abs(Math.sin(lat));

    for (let x = 0; x < w; x += 1) {
      const u = x / (w - 1);

      const nx = u * 4.35 + 0.06 * Math.sin(lat * 2.2);
      const ny = v * 2.55 + 0.08 * Math.cos(u * Math.PI * 2);
      const n0 = fbm(nx, ny, seed);
      const n1 = fbm(nx * 1.8 + 12.3, ny * 1.8 - 8.4, seed + 19);
      const n = (n0 * 0.7 + n1 * 0.3) * (1.0 - pole * 0.22);

      const landMask = smoothstep(0.515, 0.575, n);
      const oceanNoise = fbm(u * 10.0, v * 6.0, seed + 201);
      const landNoise = fbm(u * 12.0 + 2.1, v * 7.0 - 1.7, seed + 402);

      const oceanCol = ocean.clone().lerp(ocean2, 0.22 + oceanNoise * 0.32);
      const landCol = land.clone().lerp(land2, 0.32 + landNoise * 0.62);
      const col = oceanCol.clone().lerp(landCol, landMask);

      const coastBand = smoothstep(0.42, 0.78, landMask) - smoothstep(0.78, 0.98, landMask);
      const coastAmt = coastBand * 0.12;
      col.lerp(coast, coastAmt);

      // Grid + dotted land emissive for a premium digital-atlas feel.
      const lonDeg = u * 360;
      const latDeg = v * 180 - 90;
      const gridLon = Math.abs(((lonDeg + 180) % 15) - 7.5);
      const gridLat = Math.abs(((latDeg + 90) % 15) - 7.5);
      const grid = Math.max(0, 1 - Math.min(gridLon, gridLat) / 7.5);
      col.offsetHSL(0, 0, grid * 0.03);

      let em = 0;
      if (landMask > 0.6) {
        const dots = valueNoise2(u * 220, v * 110, seed + 777);
        em += dots > 0.74 ? 0.14 : 0;
        em += grid * 0.07;
      }

      const i = (y * w + x) * 4;
      data[i + 0] = Math.round(col.r * 255);
      data[i + 1] = Math.round(col.g * 255);
      data[i + 2] = Math.round(col.b * 255);
      data[i + 3] = 255;

      const e = clamp01(em);
      edata[i + 0] = Math.round(0x1d * e);
      edata[i + 1] = Math.round(0xd3 * e);
      edata[i + 2] = Math.round(0xff * e);
      edata[i + 3] = 255;
    }
  }

  ctx.putImageData(img, 0, 0);
  ectx.putImageData(eimg, 0, 0);

  const map = new THREE.CanvasTexture(canvas);
  const emissiveMap = new THREE.CanvasTexture(emissiveCanvas);
  setTextureSrgb(map);
  setTextureSrgb(emissiveMap);
  return { map, emissiveMap };
}
