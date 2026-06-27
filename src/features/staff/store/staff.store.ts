import { create } from "zustand";
import { Staff } from "../types/staff.types";

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
      const res = await fetch("/api/staffs");
      if (res.ok) {
        const staffs = await res.json();
        set({ staffs });
      }
    } catch (error) {
      console.error("fetchStaffs failed:", error);
    }
  },
  addStaff: async (staff) => {
    try {
      const res = await fetch("/api/staffs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(staff),
      });
      if (res.ok) {
        set({ staffs: [...get().staffs, staff] });
      }
    } catch (error) {
      console.error("addStaff failed:", error);
    }
  },
  removeStaff: async (id) => {
    try {
      const res = await fetch(`/api/staffs/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        set({ staffs: get().staffs.filter((s) => s.id !== id) });
      }
    } catch (error) {
      console.error("removeStaff failed:", error);
    }
  },
  updateStaff: async (updatedStaff) => {
    try {
      const res = await fetch(`/api/staffs/${updatedStaff.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedStaff),
      });
      if (res.ok) {
        set({
          staffs: get().staffs.map((s) =>
            s.id === updatedStaff.id ? { ...s, ...updatedStaff } : s
          ),
        });
      }
    } catch (error) {
      console.error("updateStaff failed:", error);
    }
  },
  assignStaffToArea: async (staffId, areaId) => {
    try {
      const staff = get().staffs.find((s) => s.id === staffId);
      if (!staff) return;
      const res = await fetch(`/api/staffs/${staffId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...staff, assignedAreaId: areaId }),
      });
      if (res.ok) {
        set({
          staffs: get().staffs.map((s) =>
            s.id === staffId ? { ...s, assignedAreaId: areaId } : s
          ),
        });
      }
    } catch (error) {
      console.error("assignStaffToArea failed:", error);
    }
  },
}));
