"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { X, Menu } from "lucide-react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";

export function SiteHeader() {
    const [isOpen, setIsOpen] = useState(false);
    const { scrollY } = useScroll();

    // Transform for Logo: Fades out and moves up slightly when scrolling starts
    const logoOpacity = useTransform(scrollY, [0, 100], [1, 0]);
    const logoY = useTransform(scrollY, [0, 100], [0, -20]);
    const logoPointerEvents = useTransform(scrollY, (y) => y > 50 ? "none" : "auto");

    // Menu items
    const menuItems = [
        { title: "ABOUT", href: "/about" },
        { title: "WORKS", href: "/works" },
        { title: "LET'S TALK", href: "/contact" },
    ];

    const toggleMenu = () => setIsOpen(!isOpen);

    // 3-Panel Curtain Animation Variants (Horizontal)
    const panelVariants = {
        closed: { width: "0%" },
        open: { width: "33.333%" },
        exit: {
            width: "0%",
            transition: {
                duration: 0.5,

                delay: 0.2 // Wait for content to fade out
            }
        }
    };

    return (
        <>
            <header className="fixed top-0 left-0 right-0 z-50 h-24 flex items-center justify-between px-6 pointer-events-none">
                <motion.div
                    style={{ opacity: logoOpacity, y: logoY, pointerEvents: logoPointerEvents }}
                    className="pointer-events-auto"
                >
                    <Link
                        href="/"
                        className="relative z-50 pl-4 block w-32 h-12"
                    >
                        <Image
                            src="/base-logo.png"
                            alt="BASE Creative"
                            fill
                            className="object-contain object-left"
                            priority
                        />
                    </Link>
                </motion.div>

                <button
                    onClick={toggleMenu}
                    className="group flex items-center gap-3 text-sm font-bold tracking-widest uppercase hover:text-brand-yellow transition-colors text-white relative z-50 pr-2 pointer-events-auto mix-blend-difference"
                >
                    {isOpen ? "Close" : "Menu"}
                    <div className={`p-2 border border-white/20 rounded-full transition-all ${isOpen ? 'bg-black text-brand-yellow border-black' : 'group-hover:border-brand-yellow group-hover:bg-brand-yellow group-hover:text-black'}`}>
                        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </div>
                </button>
            </header>


            {/* Full Screen Menu Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-40 flex h-screen w-screen">

                        {/* 3 Sliding Panels from Left to Right */}
                        <div className="absolute inset-0 flex w-full h-full z-0 pointer-events-none">
                            {[...Array(3)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    variants={panelVariants}
                                    initial="closed"
                                    animate="open"
                                    exit="exit"
                                    transition={{
                                        duration: 0.5,
                                        ease: [0.22, 1, 0.36, 1],
                                        delay: i * 0.05
                                    }}
                                    className="h-full bg-[#CCF000] border-r border-black/5 last:border-none origin-left"
                                />
                            ))}
                        </div>

                        {/* Content Container */}
                        <motion.div
                            className="relative z-10 w-full h-full flex flex-col md:flex-row items-center justify-center md:justify-between px-6 md:px-24"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0, transition: { duration: 0.2 } }}
                            transition={{ delay: 0.2, duration: 0.3 }}
                        >

                            {/* Left Side: Big Brand Logo */}
                            <div className="hidden md:flex w-1/3 flex-col justify-center items-center">
                                <Link href="/" onClick={toggleMenu} className="group relative">
                                    <div className="w-[30vw] h-[30vw] border-[1px] border-black rounded-full flex items-center justify-center relative hover:scale-105 transition-transform duration-500">
                                        {/* Rotating Text around circle could go here, for now just a big central logo */}
                                        <span className="text-[10vw] font-bold font-oswald text-black tracking-tighter transform -rotate-12 group-hover:rotate-0 transition-transform duration-500">
                                            BASE
                                        </span>

                                        {/* Decorative elements to match 'balloon' feel */}
                                        <div className="absolute top-1/4 right-1/4 w-12 h-12 bg-black rounded-full animate-bounce delay-75" />
                                    </div>
                                </Link>
                            </div>

                            {/* Right Side: Menu Items */}
                            <nav className="flex flex-col items-center md:items-end w-full md:w-1/2 gap-2 md:gap-4">
                                {menuItems.map((item, index) => (
                                    <Link
                                        key={item.title}
                                        href={item.href}
                                        onClick={toggleMenu}
                                        className="group relative perspective-text"
                                    >
                                        <motion.span
                                            className="block text-[15vw] md:text-[8vw] leading-[0.85] font-bold uppercase tracking-tighter text-black cursor-pointer origin-center hover:text-white transition-colors duration-300"
                                            whileHover={{
                                                scale: 1.15,
                                                y: -10,
                                                rotate: index % 2 === 0 ? 3 : -3,
                                                transition: { type: "spring", stiffness: 400, damping: 10 }
                                            }}
                                        >
                                            {item.title}
                                        </motion.span>
                                    </Link>
                                ))}
                            </nav>

                            {/* Address/Footer inside Menu - Bottom Left */}
                            <motion.div
                                className="absolute bottom-8 left-8 text-black font-mono text-xs hidden md:block"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <p>ISTANBUL, TR</p>
                                <p>© 2025</p>
                            </motion.div>

                        </motion.div>

                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
