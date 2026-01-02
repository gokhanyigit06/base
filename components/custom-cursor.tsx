
"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

export function CustomCursor() {
    const pathname = usePathname();
    const [cursorUrl, setCursorUrl] = useState<string | null>(null);
    const [hoverCursorUrl, setHoverCursorUrl] = useState<string | null>(null);
    const [cursorSize, setCursorSize] = useState<string>("32");
    const [hoverCursorSize, setHoverCursorSize] = useState<string>("32");
    const [isVisible, setIsVisible] = useState(false);
    const [isHovering, setIsHovering] = useState(false);

    const cursorX = useMotionValue(-100);
    const cursorY = useMotionValue(-100);

    // Increased damping to remove wiggle/oscillation
    const springConfig = { damping: 50, stiffness: 400 };
    const cursorXSpring = useSpring(cursorX, springConfig);
    const cursorYSpring = useSpring(cursorY, springConfig);

    const [isMobile, setIsMobile] = useState(true); // Default to true to prevent flash on mobile

    useEffect(() => {
        // Check if device is mobile or touch
        const checkMobile = () => {
            const isTouch = window.matchMedia("(pointer: coarse)").matches;
            const isSmall = window.innerWidth < 768; // Tailwind md breakpoint
            setIsMobile(isTouch || isSmall);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        if (isMobile) return; // Tiny optimization: Don't fetch/listen if mobile

        const fetchCursor = async () => {
            const { data } = await supabase
                .from('site_settings')
                .select('key, value')
                .in('key', ['custom_cursor_url', 'custom_cursor_hover_url', 'cursor_size', 'cursor_hover_size']);

            if (data) {
                data.forEach(item => {
                    if (item.key === 'custom_cursor_url') setCursorUrl(item.value);
                    if (item.key === 'custom_cursor_hover_url') setHoverCursorUrl(item.value);
                    if (item.key === 'cursor_size') setCursorSize(item.value);
                    if (item.key === 'cursor_hover_size') setHoverCursorSize(item.value);
                });
            }
        };
        fetchCursor();

        const moveCursor = (e: MouseEvent) => {
            cursorX.set(e.clientX);
            cursorY.set(e.clientY);
            setIsVisible(true);
        };

        const checkHover = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            // Check if hovering over clickable elements
            const isClickable = target.closest('a, button, [role="button"], input, select, textarea, .cursor-pointer');
            setIsHovering(!!isClickable);
        };

        const handleMouseEnter = () => setIsVisible(true);
        const handleMouseLeave = () => setIsVisible(false);

        window.addEventListener("mousemove", moveCursor);
        window.addEventListener("mouseover", checkHover);
        document.body.addEventListener("mouseenter", handleMouseEnter);
        document.body.addEventListener("mouseleave", handleMouseLeave);

        return () => {
            window.removeEventListener("mousemove", moveCursor);
            window.removeEventListener("mouseover", checkHover);
            document.body.removeEventListener("mouseenter", handleMouseEnter);
            document.body.removeEventListener("mouseleave", handleMouseLeave);
        };
    }, [cursorX, cursorY, isMobile]); // Added isMobile to dependency array

    // Early returns MOVED HERE (after all hooks)
    if (pathname?.startsWith('/admin') || pathname?.startsWith('/labs')) return null;
    if (isMobile) return null;
    if (!cursorUrl) return null;

    const currentCursor = (isHovering && hoverCursorUrl) ? hoverCursorUrl : cursorUrl;
    const currentSize = (isHovering && hoverCursorUrl) ? parseInt(hoverCursorSize) : parseInt(cursorSize);

    return (
        <>
            <style jsx global>{`
body, a, button, input, select, textarea {
    cursor: none!important;
}
`}</style>
            <motion.div
                className="fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference flex items-center justify-center"
                style={{
                    x: cursorXSpring,
                    y: cursorYSpring,
                    translateX: "-50%",
                    translateY: "-50%",
                    opacity: isVisible ? 1 : 0,
                }}
            >
                <AnimatePresence mode="wait">
                    <motion.img
                        key={currentCursor}
                        src={currentCursor}
                        alt="cursor"
                        initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
                        animate={{ scale: 1, opacity: 1, rotate: 0 }}
                        exit={{ scale: 0.8, opacity: 0, rotate: 10 }}
                        transition={{ duration: 0.15 }}
                        style={{ width: currentSize, height: currentSize }}
                        className="object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] block"
                    />
                </AnimatePresence>
            </motion.div>
        </>
    );
}

