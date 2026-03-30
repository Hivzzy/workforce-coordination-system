import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Area } from "../types/area.types";

type AreaState = {
  areas: Area[];
  addArea: (area: Area) => void;
  removeArea: (id: string) => void;
};

export const useAreaStore = create<AreaState>()(
  persist(
    (set) => ({
      areas: [],
      addArea: (area) =>
        set((state) => ({
          areas: [...state.areas, area],
        })),
      removeArea: (id) =>
        set((state) => ({
          areas: state.areas.filter((a) => a.id !== id),
        })),
    }),
    {
      name: "area-storage",
    },
  ),
);
