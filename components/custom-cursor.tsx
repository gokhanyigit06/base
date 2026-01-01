"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { supabase } from "@/lib/supabase";

export function CustomCursor() {
    const [cursorUrl, setCursorUrl] = useState<string | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    const cursorX = useMotionValue(-100);
    const cursorY = useMotionValue(-100);

    const springConfig = { damping: 25, stiffness: 700 };
    const cursorXSpring = useSpring(cursorX, springConfig);
    const cursorYSpring = useSpring(cursorY, springConfig);

    useEffect(() => {
        const fetchCursor = async () => {
            const { data } = await supabase
                .from('site_settings')
                .select('value')
                .eq('key', 'custom_cursor_url')
                .single();

            if (data?.value) {
                setCursorUrl(data.value);
            }
        };
        fetchCursor();

        const moveCursor = (e: MouseEvent) => {
            cursorX.set(e.clientX);
            cursorY.set(e.clientY);
            setIsVisible(true);
        };

        const handleMouseEnter = () => setIsVisible(true);
        const handleMouseLeave = () => setIsVisible(false);

        window.addEventListener("mousemove", moveCursor);
        document.body.addEventListener("mouseenter", handleMouseEnter);
        document.body.addEventListener("mouseleave", handleMouseLeave);

        return () => {
            window.removeEventListener("mousemove", moveCursor);
            document.body.removeEventListener("mouseenter", handleMouseEnter);
            document.body.removeEventListener("mouseleave", handleMouseLeave);
        };
    }, [cursorX, cursorY]);

    if (!cursorUrl) return null;

    return (
        <>
            {/* Global Style to hide default cursor when this is active */}
            <style jsx global>{`
                body, a, button, input {
                    cursor: none !important;
                }
            `}</style>

            <motion.div
                className="fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference"
                style={{
                    x: cursorXSpring,
                    y: cursorYSpring,
                    translateX: "-50%",
                    translateY: "-50%",
                    opacity: isVisible ? 1 : 0,
                }}
            >
                {/* Render uploaded cursor */}
                <img
                    src={cursorUrl}
                    alt="cursor"
                    className="w-12 h-12 object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" // Default size 48px (12 * 4)
                />
            </motion.div>
        </>
    );
}
