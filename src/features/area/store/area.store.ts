import { create } from "zustand";
import { Area } from "../types/area.types";
import { apiFetch } from "@/utils/api-client";

type AreaState = {
  areas: Area[];
  fetchAreas: () => Promise<void>;
  addArea: (area: Area) => Promise<void>;
  removeArea: (id: string) => Promise<void>;
  updateArea: (id: string, updatedFields: Partial<Area>) => Promise<void>;
};

export const useAreaStore = create<AreaState>((set, get) => ({
  areas: [],

  fetchAreas: async () => {
    try {
      const areas = await apiFetch<Area[]>("/areas");
      set({ areas: Array.isArray(areas) ? areas : [] });
    } catch (error) {
      console.error("fetchAreas failed:", error);
    }
  },

  addArea: async (area) => {
    try {
      const savedArea = await apiFetch<Area>("/areas", {
        method: "POST",
        data: area,
      });
      const newArea = savedArea && savedArea.id ? savedArea : area;
      set({ areas: [...get().areas, newArea] });
    } catch (error) {
      console.error("addArea failed:", error);
    }
  },

  removeArea: async (id) => {
    try {
      await apiFetch(`/areas/${id}`, {
        method: "DELETE",
      });
      set({ areas: get().areas.filter((a) => a.id !== id) });
    } catch (error) {
      console.error("removeArea failed:", error);
    }
  },

  updateArea: async (id, updatedFields) => {
    try {
      await apiFetch(`/areas/${id}`, {
        method: "PUT",
        data: updatedFields,
      });
      set({
        areas: get().areas.map((a) =>
          a.id === id ? { ...a, ...updatedFields } : a
        ),
      });
    } catch (error) {
      console.error("updateArea failed:", error);
    }
  },
}));
