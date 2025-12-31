"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, Star, StarOff, Loader2 } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchProjects = async () => {
        try {
            const { data, error } = await supabase
                .from('projects')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            if (data) setProjects(data);

        } catch (error) {
            console.error("Error fetching projects:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const toggleFeatured = async (id: string, currentStatus: boolean) => {
        try {
            const { error } = await supabase
                .from('projects')
                .update({ is_featured: !currentStatus })
                .eq('id', id);

            if (error) throw error;

            // Optimistic Update
            setProjects(projects.map(p => p.id === id ? { ...p, is_featured: !currentStatus } : p));

        } catch (error) {
            console.error("Error updating featured status:", error);
            alert("Failed to update status");
        }
    };

    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold font-oswald uppercase text-white mb-2">Projects</h1>
                    <p className="text-gray-400">Manage your portfolio items.</p>
                </div>
                <Link href="/admin/dashboard/projects/new" className="bg-brand-yellow text-black px-6 py-3 rounded-full font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-white transition-colors">
                    <Plus className="w-5 h-5" />
                    New Project
                </Link>
            </div>

            {/* Stats Overview (Static for now, can be dynamic later) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
                    <span className="text-gray-500 uppercase text-xs tracking-widest block mb-2">Total Projects</span>
                    <span className="text-4xl font-bold text-white">{projects.length}</span>
                </div>
                {/* ... other stats ... */}
            </div>

            {/* List Table */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden min-h-[400px]">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
                    </div>
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-black/50 border-b border-zinc-800">
                            <tr>
                                <th className="p-6 font-mono text-xs uppercase tracking-widest text-gray-500">Featured</th>
                                <th className="p-6 font-mono text-xs uppercase tracking-widest text-gray-500">Project Name</th>
                                <th className="p-6 font-mono text-xs uppercase tracking-widest text-gray-500">Category</th>
                                <th className="p-6 font-mono text-xs uppercase tracking-widest text-gray-500 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {projects.map((p) => (
                                <tr key={p.id} className="border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors">
                                    <td className="p-6">
                                        <button onClick={() => toggleFeatured(p.id, p.is_featured)} title="Toggle Home Feature">
                                            {p.is_featured ? (
                                                <Star className="w-5 h-5 text-brand-yellow fill-brand-yellow" />
                                            ) : (
                                                <StarOff className="w-5 h-5 text-gray-600 hover:text-gray-400" />
                                            )}
                                        </button>
                                    </td>
                                    <td className="p-6 font-bold text-white">{p.title}</td>
                                    <td className="p-6 text-gray-400 font-mono text-sm">{p.category}</td>
                                    <td className="p-6 text-right">
                                        <Link href={`/admin/dashboard/projects/edit/${p.id}`} className="text-gray-400 hover:text-white transition-colors text-sm font-bold uppercase tracking-wider underline">Edit</Link>
                                    </td>
                                </tr>
                            ))}
                            {projects.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="p-12 text-center text-gray-500 italic">No projects found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
