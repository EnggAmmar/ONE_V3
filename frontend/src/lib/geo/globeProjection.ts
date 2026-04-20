import * as THREE from "three";

export function latLonToVector3(radius: number, latDeg: number, lonDeg: number): THREE.Vector3 {
  const lat = THREE.MathUtils.degToRad(latDeg);
  const lon = THREE.MathUtils.degToRad(lonDeg);

  const x = radius * Math.cos(lat) * Math.sin(lon);
  const y = radius * Math.sin(lat);
  const z = radius * Math.cos(lat) * Math.cos(lon);

  return new THREE.Vector3(x, y, z);
}

export function lonLatToVector3(radius: number, lonDeg: number, latDeg: number): THREE.Vector3 {
  return latLonToVector3(radius, latDeg, lonDeg);
}

export function rotationForCountryFocus(latDeg: number, lonDeg: number) {
  const targetY = -THREE.MathUtils.degToRad(lonDeg);
  const targetX = THREE.MathUtils.degToRad(latDeg) * 0.28;
  return { x: targetX, y: targetY };
}

export function ringToSpherePoints(ring: [number, number][], radius: number): THREE.Vector3[] {
  return ring.map(([lon, lat]) => lonLatToVector3(radius, lon, lat));
}

