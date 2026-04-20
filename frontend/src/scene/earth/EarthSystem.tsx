import { forwardRef, useRef } from "react";
import type { Group } from "three";
import { EarthBase } from "./EarthBase";
import { EarthDots } from "./EarthDots";
import { Atmosphere } from "./Atmosphere";
import { OrbitLayer } from "./OrbitLayer";
import { CountryPolygonOverlay } from "./CountryPolygonOverlay";
import { ROIControls } from "./ROIControls";
import { EarthRotationController } from "./EarthRotationController";

export const EarthSystem = forwardRef<Group>(function EarthSystem(_, ref) {
  const internalRef = useRef<Group>(null);

  return (
    <group ref={ref}>
      <group ref={internalRef}>
        <EarthBase radius={1} />
        <EarthDots radius={1.002} />
        <Atmosphere radius={1.04} />
        <OrbitLayer earthRadius={1} />
        <CountryPolygonOverlay radius={1.01} />
      </group>

      <EarthRotationController earthGroupRef={internalRef} />
      <ROIControls />
    </group>
  );
});
