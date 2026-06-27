import { create } from "zustand";
import { Area, Point } from "../types/area.types";

type AreaState = {
  areas: Area[];
  fetchAreas: () => Promise<void>;
  addArea: (area: Area) => Promise<void>;
  removeArea: (id: string) => Promise<void>;
  updateArea: (id: string, updatedFields: Partial<Area>) => Promise<void>;
  /** Update a single point inside `points[]` or `waypoints[]` */
  updatePoint: (
    id: string,
    field: "points" | "waypoints",
    index: number,
    newPoint: Point,
  ) => Promise<void>;
  /** Append a waypoint to a road */
  addWaypoint: (id: string, point: Point) => Promise<void>;
  /** Remove a waypoint from a road by index */
  removeWaypoint: (id: string, index: number) => Promise<void>;
  /** Translate every point of a polygon/road shape by a delta */
  translateShape: (
    id: string,
    field: "points" | "waypoints",
    dx: number,
    dy: number,
    origPoints: Point[],
  ) => Promise<void>;
};

export const useAreaStore = create<AreaState>((set, get) => ({
  areas: [],

  fetchAreas: async () => {
    try {
      const res = await fetch("/api/areas");
      if (res.ok) {
        const areas = await res.json();
        set({ areas });
      }
    } catch (error) {
      console.error("fetchAreas failed:", error);
    }
  },

  addArea: async (area) => {
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

    const fullArea: Area = {
      x: 10,
      y: 10,
      w: defaultW,
      h: defaultH,
      rotation: 0,
      layer: defaultLayer,
      type: area.type || "zone",
      ...area,
    };

    try {
      const res = await fetch("/api/areas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fullArea),
      });
      if (res.ok) {
        set({ areas: [...get().areas, fullArea] });
      }
    } catch (error) {
      console.error("addArea failed:", error);
    }
  },

  removeArea: async (id) => {
    try {
      const res = await fetch(`/api/areas/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        set({ areas: get().areas.filter((a) => a.id !== id) });
      }
    } catch (error) {
      console.error("removeArea failed:", error);
    }
  },

  updateArea: async (id, updatedFields) => {
    try {
      const res = await fetch(`/api/areas/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedFields),
      });
      if (res.ok) {
        set({
          areas: get().areas.map((a) =>
            a.id === id ? { ...a, ...updatedFields } : a
          ),
        });
      }
    } catch (error) {
      console.error("updateArea failed:", error);
    }
  },

  updatePoint: async (id, field, index, newPoint) => {
    const area = get().areas.find((a) => a.id === id);
    if (!area) return;
    const arr = [...(area[field] || [])];
    arr[index] = newPoint;

    try {
      const res = await fetch(`/api/areas/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: arr }),
      });
      if (res.ok) {
        set({
          areas: get().areas.map((a) =>
            a.id === id ? { ...a, [field]: arr } : a
          ),
        });
      }
    } catch (error) {
      console.error("updatePoint failed:", error);
    }
  },

  addWaypoint: async (id, point) => {
    const area = get().areas.find((a) => a.id === id);
    if (!area) return;
    const wps = [...(area.waypoints || []), point];

    try {
      const res = await fetch(`/api/areas/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ waypoints: wps }),
      });
      if (res.ok) {
        set({
          areas: get().areas.map((a) =>
            a.id === id ? { ...a, waypoints: wps } : a
          ),
        });
      }
    } catch (error) {
      console.error("addWaypoint failed:", error);
    }
  },

  removeWaypoint: async (id, index) => {
    const area = get().areas.find((a) => a.id === id);
    if (!area) return;
    const wps = [...(area.waypoints || [])];
    wps.splice(index, 1);

    try {
      const res = await fetch(`/api/areas/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ waypoints: wps }),
      });
      if (res.ok) {
        set({
          areas: get().areas.map((a) =>
            a.id === id ? { ...a, waypoints: wps } : a
          ),
        });
      }
    } catch (error) {
      console.error("removeWaypoint failed:", error);
    }
  },

  translateShape: async (id, field, dx, dy, origPoints) => {
    const translated = origPoints.map((p) => ({
      x: p.x + dx,
      y: p.y + dy,
    }));

    try {
      const res = await fetch(`/api/areas/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: translated }),
      });
      if (res.ok) {
        set({
          areas: get().areas.map((a) =>
            a.id === id ? { ...a, [field]: translated } : a
          ),
        });
      }
    } catch (error) {
      console.error("translateShape failed:", error);
    }
  },
}));
