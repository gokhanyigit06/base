"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform, useVelocity, useSpring } from "framer-motion";

export function MarqueeSection() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [marqueeText, setMarqueeText] = useState("LATEST WORKS");
    const [speed, setSpeed] = useState(5);

    const { scrollYProgress, scrollY } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"],
    });

    const x = useTransform(scrollYProgress, [0, 1], ["0%", `-${speed}%`]);

    const scrollVelocity = useVelocity(scrollY);
    const smoothVelocity = useSpring(scrollVelocity, {
        damping: 50,
        stiffness: 400
    });

    const skewX = useTransform(smoothVelocity, [-2000, 0, 2000], [15, 0, -15]);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch('/api/settings');
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data)) {
                        data.forEach((item: any) => {
                            if (item.key === 'marquee_text') setMarqueeText(item.value);
                            if (item.key === 'marquee_speed') setSpeed(Number(item.value));
                        });
                    }
                }
            } catch (e) {
                console.error("Marquee settings fetch failed", e);
            }
        };
        fetchSettings();
    }, []);

    return (
        <section
            ref={containerRef}
            className="w-full py-32 bg-white text-black overflow-hidden flex items-center"
        >
            <motion.div style={{ x, skewX }} className="flex whitespace-nowrap gap-12">
                <h2 className="text-[15vw] font-bold uppercase tracking-tighter leading-none font-oswald flex items-center gap-12">
                    {[...Array(4)].map((_, i) => (
                        <span key={i} className="flex items-center gap-12">
                            <span>{marqueeText}</span>
                            <span className={`text-[8vw] ${i % 3 === 0 ? 'text-brand-yellow' : i % 3 === 1 ? 'text-brand-purple' : 'text-brand-red'}`}>●</span>
                        </span>
                    ))}
                </h2>
            </motion.div>
        </section>
    );
}
