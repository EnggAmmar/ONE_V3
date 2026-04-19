import { Stars } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useSceneStore } from "../store/sceneStore";

function Atmosphere() {
  const mat = useMemo(() => {
    const material = new THREE.ShaderMaterial({
      transparent: true,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uColor: { value: new THREE.Color("#2aa7ff") },
        uPower: { value: 2.4 },
        uIntensity: { value: 0.45 },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vWorldPos;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec4 wp = modelMatrix * vec4(position, 1.0);
          vWorldPos = wp.xyz;
          gl_Position = projectionMatrix * viewMatrix * wp;
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        varying vec3 vWorldPos;
        uniform vec3 uColor;
        uniform float uPower;
        uniform float uIntensity;
        void main() {
          vec3 viewDir = normalize(cameraPosition - vWorldPos);
          float fres = pow(1.0 - max(0.0, dot(vNormal, viewDir)), uPower);
          gl_FragColor = vec4(uColor, fres * uIntensity);
        }
      `,
    });
    return material;
  }, []);

  return (
    <mesh scale={1.05}>
      <sphereGeometry args={[2.25, 64, 64]} />
      <primitive object={mat} attach="material" />
    </mesh>
  );
}

function OrbitRings() {
  const group = useRef<THREE.Group>(null);
  const step = useSceneStore((s) => s.step);
  const roiType = useSceneStore((s) => s.roiType);
  const revisitHours = useSceneStore((s) => s.revisitHours);

  const rings = useMemo(() => {
    const base = [
      { r: 3.2, color: "#1dd3ff", opacity: 0.12, tilt: 0.2 },
      { r: 4.2, color: "#00a3ff", opacity: 0.08, tilt: -0.35 },
      { r: 5.2, color: "#00a3ff", opacity: 0.06, tilt: 0.55 },
    ];
    return base;
  }, []);

  useFrame((_, dt) => {
    if (!group.current) return;
    const revisitBoost =
      revisitHours && revisitHours > 0 ? Math.min(1.0, 24 / revisitHours) * 0.12 : 0.0;
    const speed = (step === "result" ? 0.22 : 0.12) + revisitBoost;
    group.current.rotation.y += dt * speed;
    group.current.rotation.x += dt * speed * 0.2;
  });

  const extra = roiType === "global" ? 1 : 0;

  return (
    <group ref={group}>
      {rings.map((ring, idx) => (
        <mesh key={idx} rotation={[ring.tilt, 0, 0]}>
          <torusGeometry args={[ring.r, 0.008, 8, 260]} />
          <meshBasicMaterial
            color={ring.color}
            transparent
            opacity={ring.opacity + extra * 0.02}
          />
        </mesh>
      ))}
      {step === "roi" ? (
        <mesh rotation={[0, 0, 0]}>
          <torusGeometry args={[3.5, 0.012, 10, 260]} />
          <meshBasicMaterial color="#1dd3ff" transparent opacity={0.16} />
        </mesh>
      ) : null}
    </group>
  );
}

function Earth() {
  const earth = useRef<THREE.Mesh>(null);
  const step = useSceneStore((s) => s.step);
  const payloadType = useSceneStore((s) => s.payloadType);

  useFrame((_, dt) => {
    if (!earth.current) return;
    const base = step === "roi" ? 0.05 : 0.12;
    const boost = payloadType === "my_payload" ? 0.03 : 0.0;
    earth.current.rotation.y += dt * (base + boost);
  });

  return (
    <group>
      <mesh ref={earth}>
        <sphereGeometry args={[2.2, 64, 64]} />
        <meshStandardMaterial
          color="#0a2038"
          roughness={0.65}
          metalness={0.05}
          emissive="#062a3f"
          emissiveIntensity={0.55}
        />
      </mesh>
      <Atmosphere />
    </group>
  );
}

function Satellites() {
  const step = useSceneStore((s) => s.step);
  const satellites = useSceneStore((s) => s.satellites);
  const count = step === "result" && satellites ? Math.min(6, Math.max(1, satellites)) : 1;

  const group = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.getElapsedTime();
    group.current.rotation.y = t * 0.35;
  });

  const items = Array.from({ length: count });
  return (
    <group ref={group} position={[0, 0, 0]}>
      {items.map((_, i) => {
        const angle = (i / count) * Math.PI * 2;
        const r = 5.0;
        const x = Math.cos(angle) * r;
        const z = Math.sin(angle) * r;
        return (
          <group key={i} position={[x, 0.2 * Math.sin(angle * 2), z]} rotation={[0, angle, 0]}>
            <mesh>
              <boxGeometry args={[0.32, 0.22, 0.28]} />
              <meshStandardMaterial
                color="#0b1220"
                emissive="#0a3355"
                emissiveIntensity={0.45}
                roughness={0.45}
              />
            </mesh>
            <mesh position={[0.55, 0, 0]}>
              <boxGeometry args={[0.75, 0.02, 0.35]} />
              <meshStandardMaterial color="#0b2e4d" emissive="#00a3ff" emissiveIntensity={0.25} />
            </mesh>
            <mesh position={[-0.55, 0, 0]}>
              <boxGeometry args={[0.75, 0.02, 0.35]} />
              <meshStandardMaterial color="#0b2e4d" emissive="#00a3ff" emissiveIntensity={0.25} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

export default function SceneWorld() {
  return (
    <>
      <Stars radius={90} depth={30} count={2200} factor={2.2} saturation={0} fade speed={0.8} />
      <OrbitRings />
      <Earth />
      <Satellites />
    </>
  );
}
