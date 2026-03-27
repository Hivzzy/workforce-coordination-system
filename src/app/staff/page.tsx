"use client";

import { useStaffStore } from "@/features/staff/store/staff.store";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function StaffPage() {
  const user = useAuthStore((state) => state.user);
  const { staffs, addStaff, removeStaff } = useStaffStore();
  const router = useRouter();

  const [name, setName] = useState("");
  const [role, setRole] = useState("");

  useEffect(() => {
    if (!user) {
      router.push("/login");
    } else if (user.role !== "admin") {
      router.push("/dashboard");
    }
  }, [user, router]);

  if (!user || user.role !== "admin") return null;

  const handleAdd = () => {
    if (!name || !role) return;

    addStaff({
      id: Date.now().toString(),
      name,
      role,
    });

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

        <button onClick={handleAdd} className="bg-black text-white px-4">
          Add
        </button>
      </div>

      {staffs.length === 0 && <p>No staff yet</p>}

      <ul>
        {staffs.map((staff) => (
          <li key={staff.id} className="flex justify-between border p-2 mb-2">
            <span>
              {staff.name} - {staff.role}
            </span>

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