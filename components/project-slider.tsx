"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import Image from "next/image";

interface SliderItem {
    src: string;
    mediaType?: string; // 'image' or 'video'
}

interface ProjectSliderProps {
    items: SliderItem[];
    aspectRatio?: string;
}

export function ProjectSlider({ items, aspectRatio = 'video' }: ProjectSliderProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Reset loop
    const resetTimeout = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
    };

    useEffect(() => {
        resetTimeout();
        timeoutRef.current = setTimeout(
            () =>
                setCurrentIndex((prevIndex) =>
                    prevIndex === items.length - 1 ? 0 : prevIndex + 1
                ),
            3000 // 3 seconds autoplay
        );

        return () => {
            resetTimeout();
        };
    }, [currentIndex, items.length]);

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev === items.length - 1 ? 0 : prev + 1));
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));
    };

    if (!items || items.length === 0) return null;

    let aspectClass = 'aspect-video';
    switch (aspectRatio) {
        case 'square': aspectClass = 'aspect-square'; break;
        case 'portrait': aspectClass = 'aspect-[3/4]'; break;
        case 'landscape': aspectClass = 'aspect-[4/3]'; break;
        case 'tall': aspectClass = 'aspect-[9/16]'; break;
        case '3-2': aspectClass = 'aspect-[3/2]'; break;
        default: aspectClass = 'aspect-video';
    }

    return (
        <div className={`w-full relative group ${aspectClass} rounded-[2rem] overflow-hidden bg-zinc-100 border border-black/5`}>
            <AnimatePresence>
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 w-full h-full"
                >
                    {renderSlide(items[currentIndex])}
                </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            {items.length > 1 && (
                <>
                    <button
                        onClick={(e) => { e.stopPropagation(); prevSlide(); }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white rounded-full flex items-center justify-center shadow-lg transform -translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 z-10 hover:scale-110"
                    >
                        <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 text-black" />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); nextSlide(); }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white rounded-full flex items-center justify-center shadow-lg transform translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 z-10 hover:scale-110"
                    >
                        <ArrowRight className="w-4 h-4 md:w-5 md:h-5 text-black" />
                    </button>

                    {/* Dots/Indicators */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                        {items.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentIndex(idx)}
                                className={`w-2 h-2 rounded-full transition-all ${idx === currentIndex ? 'bg-white w-4' : 'bg-white/50 hover:bg-white/80'}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

function renderSlide(item: SliderItem) {
    if (!item.src) return <div className="w-full h-full bg-gray-200" />;

    const isVideo = item.src.includes('.mp4');

    if (isVideo) {
        return (
            <video
                src={item.src}
                className="w-full h-full object-cover"
                autoPlay
                muted
                loop
                playsInline
            />
        );
    }

    return (
        <div className="relative w-full h-full">
            <img src={item.src} alt="Slide" className="w-full h-full object-cover" />
        </div>
    );
}
