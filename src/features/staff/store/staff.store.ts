import { create } from "zustand";
import { Staff } from "../types/staff.types";
import { apiFetch } from "@/utils/api-client";

type StaffState = {
  staffs: Staff[];
  fetchStaffs: () => Promise<void>;
  addStaff: (staff: Staff) => Promise<void>;
  removeStaff: (id: string) => Promise<void>;
  updateStaff: (staff: Staff) => Promise<void>;
  assignStaffToArea: (staffId: string, areaId: string) => Promise<void>;
};

export const useStaffStore = create<StaffState>((set, get) => ({
  staffs: [],

  fetchStaffs: async () => {
    try {
      const staffs = await apiFetch<Staff[]>("/staffs");
      set({ staffs: Array.isArray(staffs) ? staffs : [] });
    } catch (error) {
      console.error("fetchStaffs failed:", error);
    }
  },

  addStaff: async (staff) => {
    try {
      const saved = await apiFetch<Staff>("/staffs", {
        method: "POST",
        data: staff,
      });
      const newStaff = saved && saved.id ? saved : staff;
      set({ staffs: [...get().staffs, newStaff] });
    } catch (error) {
      console.error("addStaff failed:", error);
    }
  },

  removeStaff: async (id) => {
    try {
      await apiFetch(`/staffs/${id}`, {
        method: "DELETE",
      });
      set({ staffs: get().staffs.filter((s) => s.id !== id) });
    } catch (error) {
      console.error("removeStaff failed:", error);
    }
  },

  updateStaff: async (updatedStaff) => {
    try {
      await apiFetch(`/staffs/${updatedStaff.id}`, {
        method: "PUT",
        data: updatedStaff,
      });
      set({
        staffs: get().staffs.map((s) =>
          s.id === updatedStaff.id ? { ...s, ...updatedStaff } : s
        ),
      });
    } catch (error) {
      console.error("updateStaff failed:", error);
    }
  },

  assignStaffToArea: async (staffId, areaId) => {
    try {
      const staff = get().staffs.find((s) => s.id === staffId);
      if (!staff) return;
      await apiFetch(`/staffs/${staffId}`, {
        method: "PUT",
        data: { ...staff, assignedAreaId: areaId },
      });
      set({
        staffs: get().staffs.map((s) =>
          s.id === staffId ? { ...s, assignedAreaId: areaId } : s
        ),
      });
    } catch (error) {
      console.error("assignStaffToArea failed:", error);
    }
  },
}));
