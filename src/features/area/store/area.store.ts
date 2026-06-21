import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Area } from "../types/area.types";

type AreaState = {
  areas: Area[];
  addArea: (area: Area) => void;
  removeArea: (id: string) => void;
  updateArea: (id: string, updatedFields: Partial<Area>) => void;
};

export const useAreaStore = create<AreaState>()(
  persist(
    (set) => ({
      areas: [],
      addArea: (area) =>
        set((state) => {
          let defaultW = 160;
          let defaultH = 120;

          if (area.type === "building") {
            defaultW = 200;
            defaultH = 150;
          } else if (area.type === "road") {
            defaultW = 240;
            defaultH = 60;
          } else if (area.type === "parking") {
            defaultW = 180;
            defaultH = 120;
          }

          return {
            areas: [
              ...state.areas,
              {
                x: 10,
                y: 10,
                w: defaultW,
                h: defaultH,
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
            a.id === id
              ? {
                  ...a,
                  ...updatedFields,
                }
              : a
          ),
        })),
    }),
    {
      name: "area-storage",
    },
  ),
);
