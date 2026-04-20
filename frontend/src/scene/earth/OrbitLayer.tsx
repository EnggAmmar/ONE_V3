import { useEffect, useMemo, useRef } from "react";
import type { Vector3 } from "three";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

type Props = {
  earthRadius: number;
};

type OrbitDef = {
  radius: number;
  tiltX: number;
  tiltZ: number;
  speed: number;
  phase: number;
};

function buildOrbitPoints(radius: number, segments = 256) {
  const points: Vector3[] = [];
  for (let i = 0; i <= segments; i += 1) {
    const a = (i / segments) * Math.PI * 2;
    const x = Math.cos(a) * radius;
    const y = 0;
    const z = Math.sin(a) * radius;
    points.push(new THREE.Vector3(x, y, z));
  }
  return points;
}

function OrbitTrack({ radius, tiltX, tiltZ }: { radius: number; tiltX: number; tiltZ: number }) {
  const line = useMemo(() => {
    const points = buildOrbitPoints(radius);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color: new THREE.Color("#2f8df6"),
      transparent: true,
      opacity: 0.32,
    });
    const l = new THREE.Line(geometry, material);
    const wrap = new THREE.Group();
    wrap.rotation.set(tiltX, 0, tiltZ);
    wrap.add(l);
    return { wrap, geometry, material };
  }, [radius, tiltX, tiltZ]);

  useEffect(() => {
    return () => {
      line.geometry.dispose();
      line.material.dispose();
    };
  }, [line]);

  return <primitive object={line.wrap} />;
}

function OrbitSatellite({ orbit }: { orbit: OrbitDef }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime() * orbit.speed + orbit.phase;
    const x = Math.cos(t) * orbit.radius;
    const y = 0;
    const z = Math.sin(t) * orbit.radius;

    ref.current.position.set(x, y, z);
    ref.current.rotation.y = -t;
    ref.current.parent?.rotation.set(orbit.tiltX, 0, orbit.tiltZ);
  });

  return (
    <group>
      <mesh ref={ref}>
        <sphereGeometry args={[0.018, 12, 12]} />
        <meshBasicMaterial color="#d7e9ff" />
      </mesh>
    </group>
  );
}

function OrbitPulse({ orbit }: { orbit: OrbitDef }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime() * orbit.speed + orbit.phase;
    const x = Math.cos(t) * orbit.radius;
    const y = 0;
    const z = Math.sin(t) * orbit.radius;

    const pulse = 0.05 + Math.sin(state.clock.getElapsedTime() * 4 + orbit.phase) * 0.01;
    ref.current.position.set(x, y, z);
    ref.current.scale.setScalar(1 + pulse);
    ref.current.parent?.rotation.set(orbit.tiltX, 0, orbit.tiltZ);
  });

  return (
    <group>
      <mesh ref={ref}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshBasicMaterial color="#6ebdff" transparent opacity={0.12} />
      </mesh>
    </group>
  );
}

export function OrbitLayer({ earthRadius }: Props) {
  const orbits = useMemo<OrbitDef[]>(
    () => [
      { radius: earthRadius + 0.08, tiltX: 0.3, tiltZ: 0.0, speed: 0.65, phase: 0 },
      { radius: earthRadius + 0.13, tiltX: 0.95, tiltZ: 0.35, speed: 0.52, phase: 1.4 },
      { radius: earthRadius + 0.18, tiltX: -0.55, tiltZ: 0.5, speed: 0.44, phase: 2.3 },
    ],
    [earthRadius],
  );

  return (
    <group>
      {orbits.map((orbit, idx) => (
        <group key={idx}>
          <OrbitTrack radius={orbit.radius} tiltX={orbit.tiltX} tiltZ={orbit.tiltZ} />
          <OrbitPulse orbit={orbit} />
          <OrbitSatellite orbit={orbit} />
        </group>
      ))}
    </group>
  );
}
