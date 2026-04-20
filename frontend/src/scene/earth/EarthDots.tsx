import { useMemo } from "react";
import { isApproxLand, sphericalToCartesian } from "../../lib/geo/geoUtils";

type Props = {
  radius: number;
};

function seededRand(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

export function EarthDots({ radius }: Props) {
  const positions = useMemo(() => {
    const pts: number[] = [];

    // v1 land-distribution approximation (continent-like density).
    // This is intentionally coarse and will be replaced with a real land mask later.
    const rand = seededRand(1337);
    for (let lat = -80; lat <= 80; lat += 2.2) {
      for (let lon = -180; lon <= 180; lon += 2.2) {
        const land = isApproxLand(lat, lon);
        if (!land) continue;

        const jitterLat = lat + (rand() - 0.5) * 0.9;
        const jitterLon = lon + (rand() - 0.5) * 0.9;

        const [x, y, z] = sphericalToCartesian(radius, jitterLat, jitterLon);
        pts.push(x, y, z);
      }
    }

    return new Float32Array(pts);
  }, [radius]);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.011}
        color="#aebdcc"
        transparent
        opacity={0.82}
        depthWrite={false}
      />
    </points>
  );
}
