"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

export function FeatureSection() {
    const [isVideoOpen, setIsVideoOpen] = useState(false);

    // Dynamic Content State
    const [videoUrl, setVideoUrl] = useState("https://videos.pexels.com/video-files/3129671/3129671-uhd_2560_1440_25fps.mp4");
    const [tagline, setTagline] = useState("Look Ahead");
    const [headlineStart, setHeadlineStart] = useState("THE");
    const [headlineAccent, setHeadlineAccent] = useState("future");
    const [headlineEnd, setHeadlineEnd] = useState("HAS ARRIVED.");
    const [description, setDescription] = useState("Awarded Branding & Web Design Agency.");
    const [accentColor, setAccentColor] = useState("#CCF000");

    useEffect(() => {
        const fetchSettings = async () => {
            const { data } = await supabase
                .from('site_settings')
                .select('key, value');

            if (data) {
                // Map settings to state
                const settingsMap: Record<string, (value: string) => void> = {
                    homepage_video_url: setVideoUrl,
                    hero_tagline: setTagline,
                    hero_headline_start: setHeadlineStart,
                    hero_headline_accent: setHeadlineAccent,
                    hero_headline_end: setHeadlineEnd,
                    hero_description: setDescription,
                    hero_accent_color: setAccentColor
                };

                data.forEach((item: { key: string, value: string }) => {
                    if (settingsMap[item.key] && typeof settingsMap[item.key] === 'function') {
                        // Typescript might complain about function type matching, calling simply:
                        (settingsMap[item.key] as any)(item.value);
                    }
                });
            }
        };
        fetchSettings();
    }, []);

    return (
        <>
            <section className="w-full min-h-screen bg-black text-white py-24 px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-12 border-t border-white/10">

                {/* Left Column: Typography */}
                <div className="w-full md:w-1/2 flex flex-col gap-6 relative">
                    <span className="text-sm font-mono tracking-widest text-gray-400 uppercase mb-4">
                        {tagline}
                    </span>

                    <h2 className="text-[12vw] md:text-[7vw] leading-[0.85] font-bold uppercase font-oswald flex flex-col">
                        <span className="block">{headlineStart}</span>
                        <span
                            className="font-playfair italic font-light lowercase ml-12 -mt-2"
                            style={{ color: accentColor }}
                        >
                            {headlineAccent}
                        </span>
                        <span className="block">{headlineEnd}</span>
                    </h2>

                    <p className="md:mt-12 text-sm md:text-base font-mono text-gray-400 tracking-wider uppercase border-l-2 border-brand-red pl-4">
                        {description}
                    </p>
                </div>

                {/* Right Column: Video Preview & Trigger */}
                <div className="w-full md:w-1/2 flex justify-center md:justify-end">
                    <div
                        onClick={() => setIsVideoOpen(true)}
                        className="relative w-full aspect-[4/3] md:w-[80%] rounded-[2rem] overflow-hidden group cursor-pointer border border-white/10"
                    >
                        {/* Auto-playing Preview Video */}
                        <div className="absolute inset-0 bg-zinc-900">
                            <video
                                className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 ease-out"
                                autoPlay
                                muted
                                loop
                                playsInline
                                src={videoUrl}
                            />
                        </div>



                        {/* Hover Hint */}
                        <div className="absolute bottom-8 left-8 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <span className="text-xs font-mono tracking-widest uppercase bg-black/50 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                                Click to Watch
                            </span>
                        </div>
                    </div>
                </div>

            </section>

            {/* Full Screen Video Modal */}
            <AnimatePresence>
                {isVideoOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4 sm:p-8"
                    >
                        {/* Close Button */}
                        <button
                            onClick={() => setIsVideoOpen(false)}
                            className="absolute top-8 right-8 z-50 text-white hover:text-brand-yellow transition-colors bg-white/10 rounded-full p-2"
                        >
                            <X className="w-8 h-8 md:w-10 md:h-10" />
                        </button>

                        {/* Video Player Container */}
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="w-full max-w-7xl aspect-video rounded-xl overflow-hidden shadow-2xl border border-white/10 relative bg-black"
                        >
                            <video
                                className="w-full h-full object-contain"
                                controls
                                autoPlay
                                src={videoUrl}
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
