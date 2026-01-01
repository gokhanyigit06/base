"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FeatureSectionProps {
    initialSettings?: Record<string, string>;
}

export function FeatureSection({ initialSettings = {} }: FeatureSectionProps) {
    const [isVideoOpen, setIsVideoOpen] = useState(false);

    // Dynamic Content State
    const [videoUrl, setVideoUrl] = useState(initialSettings['homepage_video_url'] ?? "https://videos.pexels.com/video-files/3129671/3129671-uhd_2560_1440_25fps.mp4");
    const [tagline, setTagline] = useState(initialSettings['hero_tagline'] ?? "LOOK AHEAD");
    const [headlineStart, setHeadlineStart] = useState(initialSettings['hero_headline_start'] ?? "IT STARTS AT THE BASE");
    const [headlineAccent, setHeadlineAccent] = useState(initialSettings['hero_headline_accent'] ?? "future");
    const [headlineEnd, setHeadlineEnd] = useState(initialSettings['hero_headline_end'] ?? "HAS ARRIVED.");
    const [description, setDescription] = useState(initialSettings['hero_description'] ?? "Awarded Branding & Web Design Agency.");
    const [accentColor, setAccentColor] = useState(initialSettings['hero_accent_color'] ?? "#CCF000");

    // Styling States
    const [taglineColor, setTaglineColor] = useState(initialSettings['hero_tagline_color'] ?? "#9CA3AF");
    const [taglineFont, setTaglineFont] = useState(initialSettings['hero_tagline_font'] ?? "font-mono");

    const [headlineColor, setHeadlineColor] = useState(initialSettings['hero_headline_color'] ?? "#FFFFFF");
    const [headlineFont, setHeadlineFont] = useState(initialSettings['hero_headline_font'] ?? "font-oswald");

    // Individual headline part fonts and colors
    const [headlineStartFont, setHeadlineStartFont] = useState(initialSettings['hero_headline_start_font'] ?? initialSettings['hero_headline_font'] ?? "font-oswald");
    const [headlineStartColor, setHeadlineStartColor] = useState(initialSettings['hero_headline_start_color'] ?? initialSettings['hero_headline_color'] ?? "#FFFFFF");

    const [headlineAccentFont, setHeadlineAccentFont] = useState(initialSettings['hero_headline_accent_font'] ?? "font-serif");
    const [headlineAccentColor, setHeadlineAccentColor] = useState(initialSettings['hero_headline_accent_color'] ?? initialSettings['hero_accent_color'] ?? "#CCF000");

    const [headlineEndFont, setHeadlineEndFont] = useState(initialSettings['hero_headline_end_font'] ?? initialSettings['hero_headline_font'] ?? "font-oswald");
    const [headlineEndColor, setHeadlineEndColor] = useState(initialSettings['hero_headline_end_color'] ?? initialSettings['hero_headline_color'] ?? "#FFFFFF");

    const [descriptionColor, setDescriptionColor] = useState(initialSettings['hero_description_color'] ?? "#9CA3AF");
    const [descriptionFont, setDescriptionFont] = useState(initialSettings['hero_description_font'] ?? "font-mono");

    const [heroOrder, setHeroOrder] = useState<string[]>(() => {
        try {
            return initialSettings['hero_elements_order'] ? JSON.parse(initialSettings['hero_elements_order']) : ['tagline', 'headline', 'description'];
        } catch {
            return ['tagline', 'headline', 'description'];
        }
    });

    return (
        <>
            <section className="w-full min-h-screen bg-black text-white py-24 px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-12 border-t border-white/10">

                {/* Left Column: Typography */}
                <div className="w-full md:w-1/2 flex flex-col gap-6 relative">
                    {heroOrder.map((item, index) => {
                        if (item === 'tagline') {
                            return (
                                <span
                                    key={item}
                                    className={`text-sm tracking-widest uppercase ${taglineFont}`}
                                    style={{ color: taglineColor }}
                                >
                                    {tagline}
                                </span>
                            );
                        }
                        if (item === 'headline') {
                            return (
                                <h2
                                    key={item}
                                    className="text-[12vw] md:text-[7vw] leading-[0.85] font-bold uppercase flex flex-col"
                                >
                                    <span
                                        className={`block ${headlineStartFont}`}
                                        style={{ color: headlineStartColor }}
                                    >
                                        {headlineStart}
                                    </span>
                                    <span
                                        className={`font-light lowercase ml-12 -mt-2 ${headlineAccentFont}`}
                                        style={{ color: headlineAccentColor }}
                                    >
                                        {headlineAccent}
                                    </span>
                                    <span
                                        className={`block ${headlineEndFont}`}
                                        style={{ color: headlineEndColor }}
                                    >
                                        {headlineEnd}
                                    </span>
                                </h2>
                            );
                        }
                        if (item === 'description') {
                            return (
                                <p
                                    key={item}
                                    className={`text-sm md:text-base tracking-wider uppercase border-l-2 border-brand-red pl-4 ${descriptionFont}`}
                                    style={{ color: descriptionColor }}
                                >
                                    {description}
                                </p>
                            );
                        }
                        return null; // Fallback
                    })}
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
