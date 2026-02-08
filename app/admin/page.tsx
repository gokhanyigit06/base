"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Loader2 } from "lucide-react";

export default function AdminLoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (res.ok) {
                router.push("/admin/dashboard");
            } else {
                setError(data.error || "Login failed");
            }
        } catch (err) {
            setError("Network error. Please try again.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 p-8 rounded-2xl shadow-2xl">
                <div className="flex flex-col items-center gap-4 mb-8">
                    <div className="w-12 h-12 bg-brand-yellow rounded-full flex items-center justify-center text-black">
                        <Lock className="w-6 h-6" />
                    </div>
                    <h1 className="text-2xl font-bold font-oswald uppercase tracking-wide">Admin Access</h1>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg mb-6 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="flex flex-col gap-4">
                    <div>
                        <label className="text-xs uppercase tracking-widest text-gray-500 mb-2 block">Username / Email</label>
                        <input
                            type="text"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-3 focus:border-brand-yellow outline-none transition-colors text-white"
                            placeholder="admin"
                            disabled={loading}
                        />
                    </div>
                    <div>
                        <label className="text-xs uppercase tracking-widest text-gray-500 mb-2 block">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-3 focus:border-brand-yellow outline-none transition-colors text-white"
                            placeholder="••••••••"
                            disabled={loading}
                        />
                    </div>
                    <button
                        disabled={loading}
                        className="bg-brand-yellow text-black font-bold py-4 rounded-lg uppercase tracking-widest hover:bg-white transition-colors mt-4 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                        {loading ? 'Authenticating...' : 'Enter Dashboard'}
                    </button>
                </form>
            </div>
        </div>
    );
}
