import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { SceneDirector } from "./SceneDirector";
import { CursorGlow } from "./effects/CursorGlow";

export function SceneCanvas() {
  const isAutomation = typeof navigator !== "undefined" && Boolean((navigator as any).webdriver);
  return (
    <div className="scene-root sceneLayer" aria-hidden>
      <Canvas
        frameloop={isAutomation ? "demand" : "always"}
        camera={{ position: [0, 0, 7], fov: 35 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <color attach="background" args={["#02060d"]} />
        <fog attach="fog" args={["#02060d", 8, 20]} />

        <ambientLight intensity={0.5} />
        <directionalLight position={[4, 4, 5]} intensity={1.5} color="#7fc8ff" />
        <pointLight position={[-5, 2, 3]} intensity={0.75} color="#2da8ff" />

        <Suspense fallback={null}>
          <SceneDirector />
        </Suspense>
      </Canvas>

      <CursorGlow />
    </div>
  );
}

export default SceneCanvas;
