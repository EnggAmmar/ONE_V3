import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Suspense } from "react";
import { useSceneStore } from "../store/sceneStore";
import SceneDirector from "./SceneDirector";
import SceneWorld from "./SceneWorld";

export default function SceneCanvas() {
  const interactiveGlobe = useSceneStore((s) => s.interactiveGlobe);

  return (
    <div className="sceneLayer" aria-hidden>
      <Canvas
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        camera={{ fov: 45, near: 0.1, far: 200, position: [0, 0, 10] }}
      >
        <color attach="background" args={["#05070d"]} />
        <fog attach="fog" args={["#05070d", 14, 60]} />
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 8, 6]} intensity={1.4} color="#bfe9ff" />
        <directionalLight position={[-12, -4, -6]} intensity={0.45} color="#2aa7ff" />

        <Suspense fallback={null}>
          <SceneDirector />
          <SceneWorld />
        </Suspense>

        <OrbitControls
          enabled={interactiveGlobe}
          enablePan={false}
          enableZoom={false}
          maxPolarAngle={Math.PI * 0.72}
          minPolarAngle={Math.PI * 0.28}
        />
      </Canvas>
    </div>
  );
}

