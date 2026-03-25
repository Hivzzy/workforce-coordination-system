"use client";

import { useState } from "react";
import { login } from "@/features/auth/services/auth.services";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();
    const setUser = useAuthStore((state) => state.setUser);

    const handleLogin = async () => {
        const user = await login(email,password);

        if(user){
            setUser(user);
            router.push("/dashboard");
            alert("Login success: " + user.email);
        }else {
            alert("Login Failed");
        }
    };
    return (
        <div className="flex h-screen items-center justify-center">
            <div className="flex flex-col gap-4 p-6 border rounded-xl">
                <h1 className="text-xl font-bold">Login</h1>
                <input
                    type="email"
                    placeholder="Email"
                    className="border p-2 rounded"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password"
                    className="border p-2 rounded"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button
                    onClick={handleLogin}
                    className="bg-black text-white p-2 rounded"
                >
                    Login
                </button>
            </div>
        </div> 
    );
}