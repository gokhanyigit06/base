"use client";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ArrowUpRight, Search, ChevronDown, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function WorksPage() {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch Projects from Supabase
    useEffect(() => {
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

        fetchProjects();
    }, []);

    // Helper to render media (Image or Placeholder)
    const renderCardMedia = (project: any) => {
        // If links to a real image
        if (project.cover_image) {
            return (
                <div className="w-full h-full relative">
                    <Image src={project.cover_image} alt={project.title} fill className="object-cover" />
                </div>
            );
        }

        // Fallback: Colored Box (Generated randomly or from data)
        return (
            <div className={`w-full h-full bg-zinc-100 flex items-center justify-center p-8 text-center`}>
                <h3 className="text-4xl font-bold font-oswald uppercase tracking-tighter text-black/20">
                    {project.title}
                </h3>
            </div>
        );
    };

    return (
        <main className="min-h-screen bg-[#f2f2f2] text-black selection:bg-brand-yellow selection:text-black">
            <SiteHeader />

            <div className="pt-32 pb-12 px-6 md:px-12 max-w-[1920px] mx-auto">

                {/* HEADER & FILTERS */}
                <div className="flex flex-col xl:flex-row items-start xl:items-end justify-between gap-8 mb-20">

                    <h1 className="text-[12vw] xl:text-[8vw] leading-[0.85] font-bold font-oswald uppercase tracking-tighter">
                        OUR WORKS
                    </h1>

                    <div className="w-full xl:w-auto flex flex-col md:flex-row items-center gap-4 xl:pb-4">
                        {/* Filter Dropdowns */}
                        <div className="flex gap-4 w-full md:w-auto">
                            <button className="flex items-center justify-between px-6 py-3 bg-transparent border border-black rounded-full min-w-[180px] hover:bg-black hover:text-white transition-colors group">
                                <span className="font-mono text-sm uppercase">Type of Work</span>
                                <ChevronDown className="w-4 h-4 group-hover:rotate-180 transition-transform" />
                            </button>
                        </div>

                        {/* Search */}
                        <div className="relative w-full md:w-[300px] border-b border-black/20 focus-within:border-black transition-colors">
                            <input
                                type="text"
                                placeholder="Search work by client, type..."
                                className="w-full py-3 pl-8 bg-transparent outline-none font-mono text-sm placeholder:text-gray-400"
                            />
                            <Search className="w-4 h-4 absolute left-0 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>
                    </div>
                </div>

                {/* WORKS GRID */}
                {loading ? (
                    <div className="min-h-[40vh] flex items-center justify-center">
                        <Loader2 className="w-12 h-12 animate-spin text-gray-400" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
                        {projects.map((project, index) => (
                            <Link href={`/works/${project.slug}`} key={project.id} className="group block cursor-pointer">
                                {/* Card Container */}
                                <div
                                    className="w-full aspect-[4/3] rounded-[2rem] overflow-hidden relative shadow-sm hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-white"
                                    onMouseEnter={() => setHoveredIndex(index)}
                                    onMouseLeave={() => setHoveredIndex(null)}
                                >
                                    {/* Media */}
                                    <motion.div
                                        className="w-full h-full"
                                        whileHover={{ scale: 1.05 }}
                                        transition={{ duration: 0.7, ease: [0.33, 1, 0.68, 1] }}
                                    >
                                        {renderCardMedia(project)}
                                    </motion.div>

                                    {/* Checkmark / Icon Overlay (Optional branding touch) */}
                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <ArrowUpRight className="w-5 h-5 text-black" />
                                    </div>
                                </div>

                                {/* Title Label */}
                                <div className="mt-6 text-center">
                                    <h3 className="text-xl font-bold font-oswald uppercase tracking-wide group-hover:text-brand-purple transition-colors">
                                        {project.title}
                                    </h3>
                                    <span className="text-xs font-mono text-gray-500 uppercase tracking-widest mt-1 block">{project.category}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {projects.length === 0 && !loading && (
                    <div className="text-center py-20 text-gray-400 font-mono text-sm uppercase tracking-widest">
                        No projects found yet.
                    </div>
                )}

            </div>

            <SiteFooter />
        </main>
    );
}
