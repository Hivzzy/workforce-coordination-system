"use client";

import { useAreaStore } from "@/features/area/store/area.store";
import { useStaffStore } from "@/features/staff/store/staff.store";
import { useState } from "react";

export default function AreaPage() {
  const { areas, addArea, removeArea } = useAreaStore();
  const [name, setName] = useState("");
  const { staffs } = useStaffStore();

  const handleAdd = () => {
    if (!name) return;

    addArea({
      id: Date.now().toString(),
      name,
    });

    setName("");
  };

  const getStaffByArea = (areaId: string) => {
    return staffs.filter((s) => s.assignedAreaId === areaId);
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Area Management</h1>
      <div className="flex gap-2 mb-4">
        <input
          placeholder="Name"
          className="border p-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button onClick={handleAdd} className="bg-black text-white px-4">
          Add
        </button>

        {areas.length === 0 && <p>No area yet</p>}

        <ul>
          {areas.map((area) => {
            const assignedStaff = getStaffByArea(area.id);
            return (
              <li key={area.id} className="border p-2  mb-2">
                <div className="flex justify-between">
                  <h2 className="font-semibold">{area.name}</h2>
                  <button
                    onClick={() => removeArea(area.id)}
                    className="text-red-500"
                  >
                    Delete
                  </button>
                </div>

                {/* Staff Inside Area */}

                <div className="mt-2 ml-4">
                  {assignedStaff.length === 0 ? (
                    <p className="text-sm text-gray-400">No staff assigned</p>
                  ) : (
                    assignedStaff.map((staff) => (
                      <p key={staff.id} className="text-sm">
                        - {staff.name} ({staff.role})
                      </p>
                    ))
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
