import { create } from "zustand";
import { Staff } from "../types/staff.types";

type StaffState = {
  staffs: Staff[];
  addStaff: (staff: Staff) => void;
  removeStaff: (id: string) => void;
};

export const useStaffStore = create<StaffState>((set) => ({
  staffs: [],
  addStaff: (staff) =>
    set((state) => ({
      staffs: [...state.staffs, staff],
    })),
  removeStaff: (id) =>
    set((state) => ({
      staffs: state.staffs.filter((s) => s.id !== id),
    })),
}));
