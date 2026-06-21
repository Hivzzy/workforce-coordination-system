export type AreaType = "zone" | "building" | "road" | "parking";

export type Area = {
  id: string;
  name: string;
  type?: AreaType;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  color?: string;
};
