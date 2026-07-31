import { create } from "zustand";
import { apiFetch } from "@/utils/api-client";

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
      const endpoint = staffId ? `/tasks?staffId=${staffId}` : "/tasks";
      const tasks = await apiFetch<Task[]>(endpoint);
      set({ tasks: Array.isArray(tasks) ? tasks : [] });
    } catch (error) {
      console.error("fetchTasks failed:", error);
    }
  },

  addTask: async (task) => {
    try {
      await apiFetch<Task>("/tasks", {
        method: "POST",
        data: task,
      });
      const tasks = await apiFetch<Task[]>("/tasks");
      set({ tasks: Array.isArray(tasks) ? tasks : [] });
    } catch (error) {
      console.error("addTask failed:", error);
    }
  },

  updateTaskStatus: async (id, status) => {
    try {
      await apiFetch(`/tasks/${id}`, {
        method: "PUT",
        data: { status },
      });
      set({
        tasks: get().tasks.map((t) => (t.id === id ? { ...t, status } : t)),
      });
    } catch (error) {
      console.error("updateTaskStatus failed:", error);
    }
  },

  deleteTask: async (id) => {
    try {
      await apiFetch(`/tasks/${id}`, {
        method: "DELETE",
      });
      set({ tasks: get().tasks.filter((t) => t.id !== id) });
    } catch (error) {
      console.error("deleteTask failed:", error);
    }
  },
}));
