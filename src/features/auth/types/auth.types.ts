export type User = {
  id: string;
  email: string;
  name: string;
  role: "admin" | "staff";
  staffId?: string; // Links to Staff record for staff-role users
};
