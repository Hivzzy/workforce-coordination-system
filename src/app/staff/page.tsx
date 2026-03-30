"use client";

import { useStaffStore } from "@/features/staff/store/staff.store";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAreaStore } from "@/features/area/store/area.store";

export default function StaffPage() {
  const user = useAuthStore((state) => state.user);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const { staffs, addStaff, removeStaff, updateStaff } = useStaffStore();
  const router = useRouter();
  const { areas } = useAreaStore();
  const { assignStaffToArea } = useStaffStore();

  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (!hasHydrated) return;

    if (!user) {
      router.push("/login");
    } else if (user.role !== "admin") {
      router.push("/dashboard");
    }
  }, [user, hasHydrated, router]);

  if (!hasHydrated) return null;
  if (!user || user.role !== "admin") return null;

  const handleSave = () => {
    if (!name || !role) return;

    if (editingId) {
      const existingStaff = staffs.find((s) => s.id === editingId);
      updateStaff({
        id: editingId,
        name,
        role,
        assignedAreaId: existingStaff?.assignedAreaId,
      });
      setEditingId(null);
    } else {
      addStaff({
        id: Date.now().toString(),
        name,
        role,
      });
    }

    setName("");
    setRole("");
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Staff Management</h1>

      <div className="flex gap-2 mb-4">
        <input
          placeholder="Name"
          className="border p-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="border p-2"
        >
          <option value="">Select Role</option>
          <option value="cleaning">Cleaning</option>
          <option value="security">Security</option>
        </select>

        <button onClick={handleSave} className="bg-black text-white px-4">
          {editingId ? "Update" : "Add"}
        </button>
      </div>

      {staffs.length === 0 && <p>No staff yet</p>}

      <ul>
        {staffs.map((staff) => (
          <li key={staff.id} className="flex justify-between border p-2 mb-2">
            <span>
              {staff.name} - {staff.role}
              {staff.assignedAreaId && (
                <span>
                  ({areas.find((a) => a.id === staff.assignedAreaId)?.name})
                </span>
              )}
            </span>
            <select
              value={staff.assignedAreaId}
              onChange={(e) => assignStaffToArea(staff.id, e.target.value)}
              className="border ml-2"
            >
              <option value="">Unassigned</option>
              {areas.map((area) => (
                <option key={area.id} value={area.id}>
                  {area.name}
                </option>
              ))}
            </select>
            <button
              onClick={() => {
                setEditingId(staff.id);
                setName(staff.name);
                setRole(staff.role);
              }}
              className="text-blue-500 mr-2"
            >
              Edit
            </button>
            <button
              onClick={() => removeStaff(staff.id)}
              className="text-red-500"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
