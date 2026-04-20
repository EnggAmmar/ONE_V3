import { forwardRef } from "react";
import type { Group } from "three";
import { useSceneStore } from "../../store/sceneStore";
import * as THREE from "three";

function PayloadModule() {
  const payloadType = useSceneStore((s) => s.payloadType);

  switch (payloadType) {
    case "hyperspectral":
      return (
        <mesh position={[0, 0, -0.45]}>
          <cylinderGeometry args={[0.16, 0.16, 0.35, 24]} />
          <meshStandardMaterial color="#0e1824" emissive="#1ea7ff" emissiveIntensity={0.7} />
        </mesh>
      );

    case "sar":
      return (
        <mesh position={[0, -0.15, -0.5]}>
          <coneGeometry args={[0.28, 0.35, 24, 1, true]} />
          <meshStandardMaterial color="#0e1824" emissive="#1ea7ff" emissiveIntensity={0.6} />
        </mesh>
      );

    case "thermal":
      return (
        <mesh position={[0, 0, -0.42]}>
          <boxGeometry args={[0.25, 0.18, 0.18]} />
          <meshStandardMaterial color="#111826" emissive="#18a2ff" emissiveIntensity={0.5} />
        </mesh>
      );

    default:
      return (
        <mesh position={[0, 0, -0.42]}>
          <boxGeometry args={[0.22, 0.22, 0.16]} />
          <meshStandardMaterial color="#111826" emissive="#18a2ff" emissiveIntensity={0.4} />
        </mesh>
      );
  }
}

export const SatelliteHero = forwardRef<Group>(function SatelliteHero(_, ref) {
  return (
    <group ref={ref}>
      <mesh>
        <boxGeometry args={[0.7, 0.5, 0.9]} />
        <meshStandardMaterial
          color={new THREE.Color("#0b111b")}
          emissive="#1766c2"
          emissiveIntensity={0.25}
        />
      </mesh>

      <mesh position={[-0.95, 0, 0]}>
        <boxGeometry args={[1.1, 0.06, 0.4]} />
        <meshStandardMaterial color="#0d2d52" emissive="#1d8fff" emissiveIntensity={0.35} />
      </mesh>

      <mesh position={[0.95, 0, 0]}>
        <boxGeometry args={[1.1, 0.06, 0.4]} />
        <meshStandardMaterial color="#0d2d52" emissive="#1d8fff" emissiveIntensity={0.35} />
      </mesh>

      <PayloadModule />
    </group>
  );
});

