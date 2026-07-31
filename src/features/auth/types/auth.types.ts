export type User = {
  id: string;
  email: string;
  name: string;
  role: "admin" | "staff";
  staffId?: string; // Links to Staff record for staff-role users
};

export type AuthTokenData = {
  accessToken: string;
  tokenType: string;
  expiresIn?: number;
  issuedAt?: number;
};

export type LoginResponseData = User & {
  accessToken?: string;
  tokenType?: string;
  expiresIn?: number;
};
