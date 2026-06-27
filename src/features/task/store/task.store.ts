import { create } from "zustand";

export interface Task {
  id: string;
  title: string;
  description: string | null;
  assignedStaffId: string | null;
  assignedAreaId: string | null;
  status: "pending" | "in_progress" | "completed";
  createdAt?: string;
  staffName?: string | null;
  areaName?: string | null;
}

type TaskState = {
  tasks: Task[];
  fetchTasks: (staffId?: string) => Promise<void>;
  addTask: (task: Omit<Task, "createdAt">) => Promise<void>;
  updateTaskStatus: (id: string, status: Task["status"]) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
};

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  fetchTasks: async (staffId) => {
    try {
      const url = staffId ? `/api/tasks?staffId=${staffId}` : "/api/tasks";
      const res = await fetch(url);
      if (res.ok) {
        const tasks = await res.json();
        set({ tasks });
      }
    } catch (error) {
      console.error("fetchTasks failed:", error);
    }
  },
  addTask: async (task) => {
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(task),
      });
      if (res.ok) {
        const url = "/api/tasks";
        const refRes = await fetch(url);
        if (refRes.ok) {
          const tasks = await refRes.json();
          set({ tasks });
        }
      }
    } catch (error) {
      console.error("addTask failed:", error);
    }
  },
  updateTaskStatus: async (id, status) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        set({
          tasks: get().tasks.map((t) => (t.id === id ? { ...t, status } : t)),
        });
      }
    } catch (error) {
      console.error("updateTaskStatus failed:", error);
    }
  },
  deleteTask: async (id) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        set({ tasks: get().tasks.filter((t) => t.id !== id) });
      }
    } catch (error) {
      console.error("deleteTask failed:", error);
    }
  },
}));
