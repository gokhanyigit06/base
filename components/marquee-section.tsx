"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export function MarqueeSection() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"],
    });

    // Move content to the left as we scroll down
    const x = useTransform(scrollYProgress, [0, 1], ["0%", "-50%"]);

    return (
        <section
            ref={containerRef}
            className="w-full py-32 bg-white text-black overflow-hidden flex items-center"
        >
            <motion.div style={{ x }} className="flex whitespace-nowrap gap-12">
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
