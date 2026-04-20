import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { gsap } from "gsap";
import type { Group } from "three";
import { Vector3 } from "three";
import { useSceneStore } from "../store/sceneStore";
import type { ScenePose, SceneStep } from "../types/scene";
import { EarthSystem } from "./earth/EarthSystem";
import { SatelliteHero } from "./satellite/SatelliteHero";

function getPose(step: SceneStep): ScenePose {
  switch (step) {
    case "missionType":
      return {
        cameraPosition: [0, 0.4, 7],
        cameraTarget: [0, 0, 0],
        earthPosition: [-1.0, 0.4, 0],
        earthScale: 1.2,
        satellitePosition: [-3.2, -0.7, 1.2],
        satelliteRotation: [0.4, -0.8, 0.2],
        satelliteVisible: true,
      };
    case "payloadSelection":
      return {
        cameraPosition: [0.3, 0.2, 6.2],
        cameraTarget: [0.2, 0.1, 0],
        earthPosition: [-0.2, 0.1, 0],
        earthScale: 1.05,
        satellitePosition: [2.3, -0.1, 1.0],
        satelliteRotation: [0.15, -1.1, 0.1],
        satelliteVisible: true,
      };
    case "roi":
      return {
        cameraPosition: [0, 0, 3.7],
        cameraTarget: [0, 0, 0],
        earthPosition: [0, 0, 0],
        earthScale: 1.5,
        satellitePosition: [3.8, -0.15, 1.5],
        satelliteRotation: [0.1, -1.3, 0],
        satelliteVisible: false,
      };
    case "missionParameters":
      return {
        cameraPosition: [0, 0.2, 5.2],
        cameraTarget: [0, 0, 0],
        earthPosition: [0.5, 0, 0],
        earthScale: 1.2,
        satellitePosition: [2.7, -0.1, 0.9],
        satelliteRotation: [0.2, -1.0, 0],
        satelliteVisible: true,
      };
    case "results":
      return {
        cameraPosition: [0.6, 0.1, 6.4],
        cameraTarget: [0.4, 0, 0],
        earthPosition: [0.8, 0, 0],
        earthScale: 1.1,
        satellitePosition: [3.2, -0.3, 1.2],
        satelliteRotation: [0.1, -1.2, 0],
        satelliteVisible: true,
      };
  }
}

export function SceneDirector() {
  const { camera } = useThree();
  const step = useSceneStore((s) => s.step);
  const earthRef = useRef<Group>(null);
  const satelliteRef = useRef<Group>(null);

  const pose = useMemo(() => getPose(step), [step]);

  useEffect(() => {
    gsap.to(camera.position, {
      x: pose.cameraPosition[0],
      y: pose.cameraPosition[1],
      z: pose.cameraPosition[2],
      duration: 1.2,
      ease: "power3.inOut",
    });
  }, [camera, pose]);

  useFrame(() => {
    const target = new Vector3(...pose.cameraTarget);
    camera.lookAt(target);

    if (earthRef.current) {
      earthRef.current.position.lerp(new Vector3(...pose.earthPosition), 0.08);
      earthRef.current.scale.lerp(new Vector3(pose.earthScale, pose.earthScale, pose.earthScale), 0.08);
    }

    if (satelliteRef.current) {
      satelliteRef.current.visible = pose.satelliteVisible;
      satelliteRef.current.position.lerp(new Vector3(...pose.satellitePosition), 0.08);
      satelliteRef.current.rotation.x += (pose.satelliteRotation[0] - satelliteRef.current.rotation.x) * 0.08;
      satelliteRef.current.rotation.y += (pose.satelliteRotation[1] - satelliteRef.current.rotation.y) * 0.08;
      satelliteRef.current.rotation.z += (pose.satelliteRotation[2] - satelliteRef.current.rotation.z) * 0.08;
    }
  });

  return (
    <>
      <EarthSystem ref={earthRef} />
      <SatelliteHero ref={satelliteRef} />
    </>
  );
}
