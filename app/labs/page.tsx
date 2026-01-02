"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Plus, ArrowRight, LayoutGrid } from "lucide-react";
import { motion } from "framer-motion";

interface Brand {
    id: string;
    name: string;
    logo_url: string | null;
}

export default function LabsPage() {
    const [brands, setBrands] = useState<Brand[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [newBrandName, setNewBrandName] = useState("");

    useEffect(() => {
        fetchBrands();
    }, []);

    const fetchBrands = async () => {
        try {
            const { data, error } = await supabase
                .from('brands')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setBrands(data || []);
        } catch (error: any) {
            console.error("Error fetching brands:", error.message || error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateBrand = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newBrandName.trim()) return;

        try {
            const { data, error } = await supabase
                .from('brands')
                .insert([{ name: newBrandName }])
                .select()
                .single();

            if (error) throw error;

            setBrands([data, ...brands]);
            setNewBrandName("");
            setIsCreating(false);
        } catch (error: any) {
            console.error("Error creating brand:", error);
            // Show the actual error message from Supabase
            alert(`Failed to create brand: ${error.message || "Unknown error"}`);
        }
    };

    return (
        <main className="min-h-screen bg-black text-white p-6 md:p-12 font-sans selection:bg-zinc-800">
            <header className="max-w-7xl mx-auto mb-16 flex items-end justify-between border-b border-zinc-800 pb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                        <h1 className="text-sm font-mono text-zinc-500 uppercase tracking-widest">base / labs</h1>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Active Brands</h2>
                </div>

                <button
                    onClick={() => setIsCreating(true)}
                    className="flex items-center gap-2 px-5 py-3 bg-white text-black hover:bg-zinc-200 transition-colors rounded-full font-medium text-sm"
                >
                    <Plus className="w-4 h-4" />
                    <span>New Brand</span>
                </button>
            </header>

            {/* Create Brand Modal / Inline Form */}
            {isCreating && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl w-full max-w-md"
                    >
                        <h3 className="text-xl font-bold mb-6">Initialize New Brand</h3>
                        <form onSubmit={handleCreateBrand} className="space-y-4">
                            <div>
                                <label className="block text-xs font-mono text-zinc-500 mb-2 uppercase">Brand Name</label>
                                <input
                                    autoFocus
                                    type="text"
                                    value={newBrandName}
                                    onChange={(e) => setNewBrandName(e.target.value)}
                                    placeholder="e.g. Acme Corp"
                                    className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-3 focus:outline-none focus:border-white transition-colors"
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsCreating(false)}
                                    className="flex-1 px-4 py-3 rounded-lg border border-zinc-800 hover:bg-zinc-800 transition-colors text-sm font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={!newBrandName.trim()}
                                    className="flex-1 px-4 py-3 rounded-lg bg-white text-black hover:bg-zinc-200 transition-colors text-sm font-medium disabled:opacity-50"
                                >
                                    Create Brand
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            <div className="max-w-7xl mx-auto">
                {isLoading ? (
                    <div className="text-zinc-500 font-mono text-sm animate-pulse">Loading protocols...</div>
                ) : brands.length === 0 ? (
                    <div className="text-center py-20 border border-dashed border-zinc-800 rounded-3xl">
                        <LayoutGrid className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                        <p className="text-zinc-500">No brands initialized yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {brands.map((brand) => (
                            <Link
                                key={brand.id}
                                href={`/labs/${brand.id}`}
                                className="group relative bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 p-8 rounded-2xl transition-all duration-300"
                            >
                                <div className="absolute top-8 right-8 text-zinc-600 group-hover:text-white transition-colors">
                                    <ArrowRight className="w-5 h-5 -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                                </div>

                                <div className="w-12 h-12 bg-zinc-800 rounded-full mb-6 flex items-center justify-center text-xl font-bold capitalize">
                                    {brand.name.substring(0, 2)}
                                </div>

                                <h3 className="text-xl font-bold mb-2 group-hover:tracking-wide transition-all">{brand.name}</h3>
                                <p className="text-zinc-500 text-sm font-mono">
                                    /labs/{brand.id.split('-')[0]}
                                </p>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
