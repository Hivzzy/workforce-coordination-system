/** Absolute pixel coordinate on the 1200×800 canvas */
export type Point = { x: number; y: number };

export type AreaType = "zone" | "building" | "road" | "parking" | "field" | "stand";

export type Area = {
  id: string;
  name: string;
  type?: AreaType;
  color?: string;
  rotation?: number; // Rotation in degrees (0 to 360)
  layer?: number;    // Z-Index render layer level (1 to 4)

  // --- RECT MODE (buildings, stands, zones, parking) ---
  x?: number;       // Position as % of canvas width
  y?: number;       // Position as % of canvas height
  w?: number;       // Width in pixels
  h?: number;       // Height in pixels

  // --- POLYGON MODE (field / custom base maps) ---
  points?: Point[]; // Vertices defining a closed polygon shape

  // --- PATH MODE (roads / corridors) ---
  waypoints?: Point[];  // Ordered points the road passes through
  roadWidth?: number;   // Visual thickness in px (default 24)
};
