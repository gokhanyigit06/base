"use client";

import { use, useRef, useState, useEffect } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ArrowUpRight, Loader2 } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function ProjectDetail({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const [project, setProject] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const { scrollYProgress } = useScroll();

    const titleParallax = useTransform(scrollYProgress, [0, 0.5], [0, 100]);

    useEffect(() => {
        const fetchProject = async () => {
            try {
                const { data, error } = await supabase
                    .from('projects')
                    .select('*')
                    .eq('slug', slug)
                    .single();

                if (error) throw error;
                if (data) setProject(data);
            } catch (error) {
                console.error("Error fetching project:", error);
                // handle error (e.g. redirect to 404)
            } finally {
                setLoading(false);
            }
        };

        fetchProject();
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-black" />
            </div>
        );
    }

    if (!project) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center text-black">
                <h1 className="text-4xl font-bold font-oswald uppercase">Project Not Found</h1>
            </div>
        );
    }

    // ... imports and setup logic stays mostly the same until the returns

    // Helper to render media
    const renderMedia = (item: any) => {
        const isVideo = item.src && item.src.includes('.mp4'); // Simple toggle based on extension

        if (isVideo) {
            return (
                <video
                    src={item.src}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover"
                />
            );
        }
        // Fallback or Image
        return (
            <div className={`w-full h-full bg-gray-100 flex items-center justify-center text-center`}>
                {item.src && <img src={item.src} alt="" className="w-full h-full object-cover" />}
            </div>
        );
    };

    return (
        <main className="min-h-screen bg-white text-black selection:bg-brand-yellow selection:text-black">
            <SiteHeader />

            {loading ? (
                <div className="min-h-screen flex items-center justify-center">
                    <Loader2 className="w-12 h-12 animate-spin text-black" />
                </div>
            ) : !project ? (
                <div className="min-h-screen flex items-center justify-center text-black">
                    <h1 className="text-4xl font-bold font-oswald uppercase">Project Not Found</h1>
                </div>
            ) : (
                <>
                    {/* Cover Image Section */}
                    <section className="w-full px-6 md:px-12 pt-32 pb-8">
                        <div className="relative w-full aspect-video md:aspect-[2.4/1] rounded-[2rem] overflow-hidden bg-zinc-100">
                            {project.cover_image && (
                                <Image
                                    src={project.cover_image}
                                    alt={project.title}
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            )}
                        </div>
                    </section>

                    {/* Title & Info Section */}
                    <section className="px-6 md:px-12 pb-12">
                        {/* Header */}
                        <div className="flex flex-col gap-2 mb-8">
                            <span className="font-mono text-sm font-bold tracking-widest uppercase">Project</span>
                            <h1 className="text-4xl md:text-7xl font-bold font-oswald uppercase tracking-tighter leading-none">
                                {project.title} <span className="font-light text-gray-400 mx-2">|</span> {project.category}
                            </h1>
                        </div>

                        {/* Divider */}
                        <div className="w-full h-px bg-black mb-12"></div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-12 gap-x-8">

                            {/* Left Meta Section (Span 6) */}
                            <div className="lg:col-span-5 grid grid-cols-2 lg:grid-cols-3 gap-8">

                                {/* Col 1: Client & Client Type */}
                                <div className="flex flex-col gap-8">
                                    <div className="flex flex-col gap-1">
                                        <h4 className="font-oswald font-bold uppercase text-lg">Client</h4>
                                        <p className="text-sm text-gray-600 leading-snug">{project.client}</p>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <h4 className="font-oswald font-bold uppercase text-lg">Client Type</h4>
                                        <p className="text-sm text-gray-600 leading-snug">{project.category}</p>
                                    </div>
                                </div>

                                {/* Col 2: Market & Website */}
                                <div className="flex flex-col gap-8">
                                    <div className="flex flex-col gap-1">
                                        <h4 className="font-oswald font-bold uppercase text-lg">Year</h4>
                                        <p className="text-sm text-gray-600 leading-snug">{project.year}</p>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <h4 className="font-oswald font-bold uppercase text-lg">Website</h4>
                                        <a href="#" className="text-sm text-black underline underline-offset-4 decoration-1 font-medium hover:text-brand-yellow transition-colors">
                                            layersup.com
                                        </a>
                                    </div>
                                </div>

                                {/* Col 3: Services */}
                                <div className="flex flex-col gap-1 col-span-2 lg:col-span-1">
                                    <h4 className="font-oswald font-bold uppercase text-lg mb-2">Services</h4>
                                    <ul className="flex flex-col gap-2 text-sm text-gray-600 leading-snug">
                                        {project.services && project.services.split(',').map((service: string, i: number) => (
                                            <li key={i} className="flex items-center gap-2">
                                                {i === 2 && <span className="w-2 h-2 rounded-full bg-brand-purple shrink-0"></span>}
                                                <span>{service.trim()}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* Spacer */}
                            <div className="hidden lg:block lg:col-span-1"></div>

                            {/* Right Column: The Case (Span 6) */}
                            <div className="lg:col-span-6 flex flex-col gap-8">
                                <h2 className="text-6xl md:text-7xl font-oswald font-bold uppercase tracking-tighter leading-none">The Case</h2>
                                <div className="text-base md:text-lg text-gray-500 font-light leading-relaxed space-y-6">
                                    <p>
                                        {project.description}
                                    </p>
                                    {/* Additional paragraph simulation for design match if description is short */}
                                    <p>
                                        The main objective was to clearly convey the core principles of the company which revolves around 'time-saving' and 'employee happiness'.
                                    </p>
                                </div>

                                <div className="pt-4">
                                    <button className="border border-black/20 rounded-full px-6 py-2 text-xs font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors flex items-center gap-2">
                                        Read More <ArrowUpRight className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Content Area - Media Blocks */}
                    <section className="flex flex-col gap-6 md:gap-12 px-6 md:px-12 py-12 md:py-24">
                        {project.content && project.content.map((block: any, index: number) => {
                            if (block.type === 'full') {
                                return (
                                    <div key={index} className="w-full aspect-video rounded-[2rem] overflow-hidden relative border border-black/5">
                                        {renderMedia(block)}
                                    </div>
                                );
                            } else if (block.type === 'row') {
                                return (
                                    <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12">
                                        {block.items.map((item: any, i: number) => (
                                            <div key={i} className="w-full aspect-square rounded-[2rem] overflow-hidden relative border border-black/5">
                                                {renderMedia(item)}
                                            </div>
                                        ))}
                                    </div>
                                );
                            }
                        })}
                    </section>

                    {/* Conclusion */}
                    <div className="max-w-4xl mx-auto text-center py-24">
                        <h3 className="text-4xl md:text-6xl font-bold font-oswald uppercase mb-8">
                            "A redefined digital experience that sets a new standard."
                        </h3>
                        <p className="font-mono text-gray-500">
                            — Creative Director
                        </p>
                    </div>

                    {/* Next Project Nav (Static for now, can be dynamic later) */}
                    <section className="bg-black text-white py-32 px-6 md:px-12 flex flex-col items-center justify-center text-center border-t border-white/10 group cursor-pointer hover:bg-brand-red transition-colors duration-500">
                        <Link href="/works" className="flex flex-col items-center">
                            <span className="font-mono text-sm tracking-widest uppercase mb-4 opacity-50">All Projects</span>
                            <h2 className="text-[10vw] font-bold font-oswald uppercase tracking-tighter leading-none">
                                BACK TO WORKS
                            </h2>
                            <div className="mt-8 px-8 py-3 rounded-full border border-white/20 flex items-center gap-4 group-hover:bg-white group-hover:text-black transition-colors">
                                <span className="uppercase font-bold tracking-widest">View List</span>
                                <ArrowUpRight className="w-5 h-5" />
                            </div>
                        </Link>
                    </section>
                </>
            )}

            <SiteFooter />
        </main >
    );
}
