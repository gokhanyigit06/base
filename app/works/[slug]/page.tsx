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
                    {/* Hero Section */}
                    <section className="relative h-[80vh] flex flex-col justify-end px-6 md:px-12 pb-12 pt-32">
                        <motion.div style={{ y: titleParallax }} className="flex flex-col gap-4">
                            <div className="flex flex-wrap gap-4 mb-4">
                                {project.category && project.category.split(',').map((tag: string, i: number) => (
                                    <span key={i} className="px-4 py-1 rounded-full border border-black/20 text-sm font-bold tracking-widest uppercase">
                                        {tag.trim()}
                                    </span>
                                ))}
                            </div>
                            <h1 className="text-[12vw] leading-[0.8] font-bold font-oswald uppercase tracking-tighter">
                                {project.title}
                            </h1>
                        </motion.div>
                    </section>

                    {/* Project Details Bar */}
                    <section className="border-y border-black/10 px-6 md:px-12 py-8 grid grid-cols-2 md:grid-cols-4 gap-8 font-mono text-sm uppercase tracking-wider text-gray-500">
                        <div className="flex flex-col gap-2">
                            <span className="text-black font-bold">Client</span>
                            <span>{project.client}</span>
                        </div>
                        <div className="flex flex-col gap-2">
                            <span className="text-black font-bold">Services</span>
                            <span>{project.services}</span>
                        </div>
                        <div className="flex flex-col gap-2">
                            <span className="text-black font-bold">Year</span>
                            <span>{project.year}</span>
                        </div>
                        <div className="flex flex-col gap-2 justify-end items-start md:items-end">
                            <a href="#" className="flex items-center gap-2 text-black hover:text-brand-purple transition-colors font-bold group">
                                Visit Live Site <ArrowUpRight className="w-4 h-4 group-hover:rotate-45 transition-transform" />
                            </a>
                        </div>
                    </section>

                    {/* Content Area */}
                    <section className="flex flex-col gap-6 md:gap-12 px-6 md:px-12 py-12 md:py-24">

                        {/* Intro Text */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-12">
                            <div className="md:col-span-8 md:col-start-3 text-center">
                                <h3 className="text-2xl md:text-4xl font-bold font-oswald uppercase mb-6">{project.subheading}</h3>
                                <p className="font-sans text-lg text-gray-600 leading-relaxed">
                                    {project.description}
                                </p>
                            </div>
                        </div>

                        {/* Dynamic Content Blocks */}
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
