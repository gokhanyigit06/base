"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";

export default function AdminLoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Temporary Mock Login for UI Demo
        if (email === "admin" && password === "admin") {
            router.push("/admin/dashboard");
        } else {
            alert("Invalid credentials (try admin/admin)");
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 p-8 rounded-2xl">
                <div className="flex flex-col items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-brand-yellow rounded-full flex items-center justify-center text-black">
                        <Lock className="w-6 h-6" />
                    </div>
                    <h1 className="text-2xl font-bold font-oswald uppercase tracking-wide">Admin Access</h1>
                </div>

                <form onSubmit={handleLogin} className="flex flex-col gap-4">
                    <div>
                        <label className="text-xs uppercase tracking-widest text-gray-500 mb-2 block">Username</label>
                        <input
                            type="text"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-3 focus:border-brand-yellow outline-none transition-colors"
                            placeholder="admin"
                        />
                    </div>
                    <div>
                        <label className="text-xs uppercase tracking-widest text-gray-500 mb-2 block">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-3 focus:border-brand-yellow outline-none transition-colors"
                            placeholder="admin"
                        />
                    </div>
                    <button className="bg-brand-yellow text-black font-bold py-4 rounded-lg uppercase tracking-widest hover:bg-white transition-colors mt-4">
                        Enter
                    </button>
                </form>
            </div>
        </div>
    );
}
