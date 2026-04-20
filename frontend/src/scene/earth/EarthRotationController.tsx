import type { RefObject } from "react";
import { useEffect } from "react";
import type { Group } from "three";
import { useFrame } from "@react-three/fiber";
import { gsap } from "gsap";
import { useSceneStore } from "../../store/sceneStore";
import { rotationForCountryFocus } from "../../lib/geo/globeProjection";

type Props = {
  earthGroupRef: RefObject<Group>;
};

export function EarthRotationController({ earthGroupRef }: Props) {
  const step = useSceneStore((s) => s.step);
  const selectedRegion = useSceneStore((s) => s.selectedRegion);
  const earthAutoRotate = useSceneStore((s) => s.earthAutoRotate);
  const setEarthAutoRotate = useSceneStore((s) => s.setEarthAutoRotate);
  const setEarthFocused = useSceneStore((s) => s.setEarthFocused);

  useEffect(() => {
    const group = earthGroupRef.current;
    if (!group) return;

    // Keep cinematic steps predictable.
    if (step !== "roi") {
      setEarthAutoRotate(true);
      setEarthFocused(false);
      gsap.to(group.rotation, { x: 0, y: 0, z: 0, duration: 1.2, ease: "power3.inOut" });
      return;
    }

    if (!selectedRegion?.lat || !selectedRegion?.lon) return;

    setEarthAutoRotate(false);
    const { x, y } = rotationForCountryFocus(selectedRegion.lat, selectedRegion.lon);

    gsap.to(group.rotation, {
      x,
      y,
      duration: 1.25,
      ease: "power3.inOut",
      onComplete: () => setEarthFocused(true),
    });
  }, [earthGroupRef, selectedRegion?.lat, selectedRegion?.lon, setEarthAutoRotate, setEarthFocused, step]);

  useFrame((_, delta) => {
    const group = earthGroupRef.current;
    if (!group) return;
    if (earthAutoRotate) {
      group.rotation.y += delta * 0.06;
    }
  });

  return null;
}

