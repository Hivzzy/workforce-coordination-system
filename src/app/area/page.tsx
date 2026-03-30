"use client";

import { useAreaStore } from "@/features/area/store/area.store";
import { useState } from "react";

export default function AreaPage() {
  const { areas, addArea, removeArea } = useAreaStore();
  const [name, setName] = useState("");

  const handleAdd = () => {
    if (!name) return;

    addArea({
      id: Date.now().toString(),
      name,
    });

    setName("");
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
          {areas.map((area) => (
            <li key={area.id} className="flex justify-between border p-2  mb-2">
              <span>{area.name}</span>
              <button
                onClick={() => removeArea(area.id)}
                className="text-red-500"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
