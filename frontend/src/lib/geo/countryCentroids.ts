type Position = [number, number]; // [lon, lat]

function averagePositions(points: Position[]): Position {
  if (!points.length) return [0, 0];

  let lon = 0;
  let lat = 0;

  for (const [x, y] of points) {
    lon += x;
    lat += y;
  }

  return [lon / points.length, lat / points.length];
}

export function polygonCentroid(ring: Position[]): Position {
  return averagePositions(ring);
}

export function multiPolygonCentroid(polygons: Position[][][]): Position {
  const samples: Position[] = [];

  for (const poly of polygons) {
    if (poly[0]?.length) {
      samples.push(polygonCentroid(poly[0]));
    }
  }

  return averagePositions(samples);
}

export function featureCentroid(geometry: any): Position {
  if (!geometry) return [0, 0];

  if (geometry.type === "Polygon") {
    return polygonCentroid(geometry.coordinates[0] ?? []);
  }

  if (geometry.type === "MultiPolygon") {
    return multiPolygonCentroid(geometry.coordinates ?? []);
  }

  return [0, 0];
}

