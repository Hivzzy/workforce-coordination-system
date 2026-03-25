import { User } from "../types/auth.types";

export const login = async (email: string, password: string): Promise<User | null> => {
    // dummy logic 
    if(email == "admin@gmail.com" && password === "admin") {
        return {
            id: "1",
            email,
            role: "admin"
        }
    }
    return null;
};