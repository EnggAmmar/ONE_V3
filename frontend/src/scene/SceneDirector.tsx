import { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import { gsap } from "gsap";
import * as THREE from "three";
import { useSceneStore } from "../store/sceneStore";

type Preset = {
  pos: [number, number, number];
  target: [number, number, number];
  duration: number;
};

const PRESETS: Record<string, Preset> = {
  landing: { pos: [0, 0.3, 14], target: [0, 0, 0], duration: 1.2 },
  payload: { pos: [6, 1.4, 9.5], target: [0, 0, 0], duration: 1.15 },
  roi: { pos: [0.4, 0.3, 6.6], target: [0, 0, 0], duration: 1.05 },
  parameters: { pos: [-5.6, 1.8, 10.2], target: [0, 0, 0], duration: 1.15 },
  result: { pos: [2.8, 1.2, 8.4], target: [0, 0, 0], duration: 1.2 },
};

export default function SceneDirector() {
  const step = useSceneStore((s) => s.step);
  const family = useSceneStore((s) => s.family);
  const { camera } = useThree();
  const targetRef = useRef(new THREE.Vector3(0, 0, 0));

  useEffect(() => {
    const preset = PRESETS[step] ?? PRESETS.landing;
    gsap.to(camera.position, {
      x: preset.pos[0],
      y: preset.pos[1],
      z: preset.pos[2],
      duration: preset.duration,
      ease: "power3.out",
    });
    gsap.to(targetRef.current, {
      x: preset.target[0],
      y: preset.target[1],
      z: preset.target[2],
      duration: preset.duration,
      ease: "power3.out",
      onUpdate: () => {
        camera.lookAt(targetRef.current);
      },
    });
  }, [camera, step]);

  useEffect(() => {
    // Subtle accent shift per mission family (kept in SceneWorld materials).
    document.documentElement.dataset.missionFamily = family ?? "";
  }, [family]);

  return null;
}

