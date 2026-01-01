"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useVelocity, useSpring } from "framer-motion";

export function MarqueeSection() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress, scrollY } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"],
    });

    // 1. Slower horizontal movement (Reduced to -5% for ultra-slow flow)
    const x = useTransform(scrollYProgress, [0, 1], ["0%", "-5%"]);

    // 2. Velocity-based Skew (Italic Effect)
    const scrollVelocity = useVelocity(scrollY);
    const smoothVelocity = useSpring(scrollVelocity, {
        damping: 50,
        stiffness: 400
    });

    // Map velocity to skew degrees. 
    // Moving down (positive velocity) -> Skew negative (forward slant)
    const skewX = useTransform(smoothVelocity, [-2000, 0, 2000], [15, 0, -15]);

    return (
        <section
            ref={containerRef}
            className="w-full py-32 bg-white text-black overflow-hidden flex items-center"
        >
            <motion.div style={{ x, skewX }} className="flex whitespace-nowrap gap-12">
                <h2 className="text-[15vw] font-bold uppercase tracking-tighter leading-none font-oswald flex items-center gap-12">
                    <span>LATEST WORKS</span>
                    <span className="text-brand-yellow text-[8vw]">●</span>
                    <span>LATEST WORKS</span>
                    <span className="text-brand-purple text-[8vw]">●</span>
                    <span>LATEST WORKS</span>
                    <span className="text-brand-red text-[8vw]">●</span>
                    <span>LATEST WORKS</span>
                </h2>
            </motion.div>
        </section>
    );
}
