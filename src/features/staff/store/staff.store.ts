import { create } from "zustand";
import { Staff } from "../types/staff.types";
import { persist } from "zustand/middleware";

type StaffState = {
  staffs: Staff[];
  addStaff: (staff: Staff) => void;
  removeStaff: (id: string) => void;
  updateStaff: (staff: Staff) => void;
};

export const useStaffStore = create<StaffState>()(
  persist(
    (set) => ({
      staffs: [],
      addStaff: (staff) =>
        set((state) => ({
          staffs: [...state.staffs, staff],
        })),
      removeStaff: (id) =>
        set((state) => ({
          staffs: state.staffs.filter((s) => s.id !== id),
        })),
      updateStaff: (updatedStaff: Staff) =>
        set((state) => ({
          staffs: state.staffs.map((s) =>
            s.id === updatedStaff.id ? updatedStaff : s,
          ),
        })),
    }),
    {
      name: "staff-storage",
    },
  ),
);
