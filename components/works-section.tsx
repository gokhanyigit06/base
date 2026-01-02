"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function WorksSection() {
    const [featuredProjects, setFeaturedProjects] = useState<any[]>([]);
    const [sectionTitle, setSectionTitle] = useState("Latest Works");

    useEffect(() => {
        const fetchData = async () => {
            // Fetch Featured Projects
            const { data: projects } = await supabase
                .from('projects')
                .select('*')
                .eq('is_featured', true)
                .order('display_order', { ascending: true });

            if (projects) setFeaturedProjects(projects);

            // Fetch Section Title
            const { data: settings } = await supabase
                .from('site_settings')
                .select('value')
                .eq('key', 'works_section_title')
                .single();

            if (settings) setSectionTitle(settings.value);
        };
        fetchData();
    }, []);

    if (featuredProjects.length === 0) return null; // Don't show section if no featured items

    return (
        <section className="w-full bg-white text-black px-6 md:px-12 pb-32">
            <h2 className="text-sm font-mono uppercase tracking-widest text-gray-500 mb-12">{sectionTitle}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-24">
                {featuredProjects.map((project, index) => {
                    return (
                        <Link href={`/works/${project.slug}`} key={project.id} className="group cursor-pointer flex flex-col gap-6">
                            {/* Visual Container (Image/Video) */}
                            <div className="relative w-full aspect-[4/3] rounded-[2rem] overflow-hidden bg-zinc-100 border border-black/5">
                                {/* Overlay for hover effect */}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500 z-10" />

                                {/* Content */}
                                <div className="w-full h-full group-hover:scale-105 transition-transform duration-700 ease-out flex items-center justify-center relative">
                                    {project.cover_video ? (
                                        <video
                                            src={project.cover_video}
                                            autoPlay
                                            muted
                                            loop
                                            playsInline
                                            className="w-full h-full object-cover"
                                        />
                                    ) : project.cover_image ? (
                                        <Image
                                            src={project.cover_image}
                                            alt={project.title}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <span className="text-black/20 font-bold text-4xl uppercase tracking-widest px-8 text-center">
                                            {project.title}
                                        </span>
                                    )}
                                </div>

                                {/* Arrow Icon that appears on hover */}
                                <div className="absolute top-8 right-8 z-20 w-12 h-12 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-lg">
                                    <ArrowUpRight className="w-6 h-6 text-black" />
                                </div>
                            </div>

                            {/* Info */}
                            <div className="flex flex-col gap-4">
                                <h3 className="text-6xl md:text-7xl font-bold font-oswald uppercase tracking-tighter">
                                    {project.title}
                                </h3>
                                <div className="flex flex-wrap gap-3">
                                    {project.category && project.category.split(',').map((cat: string, i: number) => (
                                        <span
                                            key={i}
                                            className="px-4 py-1 rounded-full border border-black/20 text-xs font-bold tracking-widest uppercase hover:bg-black hover:text-white transition-colors"
                                        >
                                            {cat.trim()}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}
