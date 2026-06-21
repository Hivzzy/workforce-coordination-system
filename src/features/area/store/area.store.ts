import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Area, Point } from "../types/area.types";

type AreaState = {
  areas: Area[];
  addArea: (area: Area) => void;
  removeArea: (id: string) => void;
  updateArea: (id: string, updatedFields: Partial<Area>) => void;
  /** Update a single point inside `points[]` or `waypoints[]` */
  updatePoint: (
    id: string,
    field: "points" | "waypoints",
    index: number,
    newPoint: Point,
  ) => void;
  /** Append a waypoint to a road */
  addWaypoint: (id: string, point: Point) => void;
  /** Remove a waypoint from a road by index */
  removeWaypoint: (id: string, index: number) => void;
  /** Translate every point of a polygon/road shape by a delta */
  translateShape: (
    id: string,
    field: "points" | "waypoints",
    dx: number,
    dy: number,
    origPoints: Point[],
  ) => void;
};

export const useAreaStore = create<AreaState>()(
  persist(
    (set) => ({
      areas: [],

      addArea: (area) =>
        set((state) => {
          let defaultW = 160;
          let defaultH = 120;
          let defaultLayer = 4;

          if (area.type === "field") {
            defaultW = 400;
            defaultH = 300;
            defaultLayer = 1;
          } else if (area.type === "building") {
            defaultW = 200;
            defaultH = 150;
            defaultLayer = 3;
          } else if (area.type === "road") {
            defaultW = 240;
            defaultH = 60;
            defaultLayer = 2;
          } else if (area.type === "parking") {
            defaultW = 180;
            defaultH = 120;
            defaultLayer = 2;
          } else if (area.type === "stand") {
            defaultW = 80;
            defaultH = 60;
            defaultLayer = 4;
          } else if (area.type === "zone") {
            defaultW = 160;
            defaultH = 120;
            defaultLayer = 4;
          }

          return {
            areas: [
              ...state.areas,
              {
                x: 10,
                y: 10,
                w: defaultW,
                h: defaultH,
                rotation: 0,
                layer: defaultLayer,
                type: "zone",
                ...area,
              },
            ],
          };
        }),

      removeArea: (id) =>
        set((state) => ({
          areas: state.areas.filter((a) => a.id !== id),
        })),

      updateArea: (id, updatedFields) =>
        set((state) => ({
          areas: state.areas.map((a) =>
            a.id === id ? { ...a, ...updatedFields } : a,
          ),
        })),

      updatePoint: (id, field, index, newPoint) =>
        set((state) => ({
          areas: state.areas.map((a) => {
            if (a.id !== id) return a;
            const arr = [...(a[field] || [])];
            arr[index] = newPoint;
            return { ...a, [field]: arr };
          }),
        })),

      addWaypoint: (id, point) =>
        set((state) => ({
          areas: state.areas.map((a) =>
            a.id === id
              ? { ...a, waypoints: [...(a.waypoints || []), point] }
              : a,
          ),
        })),

      removeWaypoint: (id, index) =>
        set((state) => ({
          areas: state.areas.map((a) => {
            if (a.id !== id) return a;
            const wps = [...(a.waypoints || [])];
            wps.splice(index, 1);
            return { ...a, waypoints: wps };
          }),
        })),

      translateShape: (id, field, dx, dy, origPoints) =>
        set((state) => ({
          areas: state.areas.map((a) => {
            if (a.id !== id) return a;
            const translated = origPoints.map((p) => ({
              x: p.x + dx,
              y: p.y + dy,
            }));
            return { ...a, [field]: translated };
          }),
        })),
    }),
    {
      name: "area-storage",
    },
  ),
);
