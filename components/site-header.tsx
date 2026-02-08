"use client";

import Link from "next/link";
import Image from "next/image";
import { useScroll, useTransform, motion, useMotionValueEvent } from "framer-motion"; // Added useMotionValueEvent
import { useState } from "react";

export function SiteHeader({ theme = "dark", forceDarkBackground = false }: { theme?: "light" | "dark", forceDarkBackground?: boolean }) {
    const { scrollY } = useScroll();
    const [isScrolled, setIsScrolled] = useState(false);

    useMotionValueEvent(scrollY, "change", (latest) => {
        setIsScrolled(latest > 50);
    });

    const textColor = theme === "light" ? "text-black" : "text-white";

    const navLinks = [
        { title: "work", href: "/works" },
        { title: "about", href: "/about" },
    ];

    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <motion.header
            className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 transition-all duration-300 ease-in-out ${isScrolled
                ? `h-20 ${theme === 'light' ? 'bg-white/80' : 'bg-black/80'} backdrop-blur-md`
                : `h-24 ${forceDarkBackground ? 'bg-black/80 backdrop-blur-sm' : 'bg-transparent'}`
                }`}
            initial={{ y: -100 }}
            animate={{ y: 0 }}
        >
            {/* Left: Logo */}
            <div>
                <Link
                    href="/"
                    className="relative z-50 pl-4 block w-32 h-12"
                >
                    <Image
                        src="/base-logo.png"
                        alt="BASE Creative"
                        fill
                        className={`object-contain object-left ${theme === 'light' ? 'invert' : ''}`}
                        priority
                    />
                </Link>
            </div>

            {/* Center: Desktop Navigation Links */}
            <nav className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-10">
                {navLinks.map((link) => (
                    <Link
                        key={link.title}
                        href={link.href}
                        className={`text-4xl font-medium lowercase hover:text-brand-purple transition-colors ${textColor}`}
                    >
                        {link.title}
                    </Link>
                ))}
            </nav>

            {/* Right: Desktop Contact Us Button */}
            <div className="hidden md:block pr-12">
                <Link
                    href="/contact"
                    className={`text-4xl font-medium lowercase transition-colors duration-300 ${theme === 'light' ? 'text-blue-600' : 'text-blue-400 hover:text-blue-300'}`}
                >
                    contact us
                </Link>
            </div>

            {/* Mobile Hamburger Button */}
            <button
                className={`md:hidden z-50 p-2 relative`}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
                <div className="w-8 h-8 flex flex-col justify-center gap-1.5 items-end">
                    <motion.span
                        animate={isMenuOpen ? { rotate: 45, y: 8, backgroundColor: "#ffffff" } : { rotate: 0, y: 0 }}
                        className={`w-8 h-0.5 ${theme === 'light' && !isMenuOpen ? 'bg-black' : 'bg-white'} block origin-center`}
                    />
                    <motion.span
                        animate={isMenuOpen ? { opacity: 0 } : { opacity: 1 }}
                        className={`w-8 h-0.5 ${theme === 'light' && !isMenuOpen ? 'bg-black' : 'bg-white'} block`}
                    />
                    <motion.span
                        animate={isMenuOpen ? { rotate: -45, y: -8, backgroundColor: "#ffffff" } : { rotate: 0, y: 0 }}
                        className={`w-8 h-0.5 ${theme === 'light' && !isMenuOpen ? 'bg-black' : 'bg-white'} block origin-center`}
                    />
                </div>
            </button>

            {/* Mobile Menu Overlay */}
            <motion.div
                initial={{ x: "100%" }}
                animate={{ x: isMenuOpen ? 0 : "100%" }}
                transition={{ type: "tween", duration: 0.3 }}
                className="fixed inset-0 z-40 bg-black text-white md:hidden flex flex-col items-center justify-center gap-8"
            >
                {navLinks.map((link) => (
                    <Link
                        key={link.title}
                        href={link.href}
                        onClick={() => setIsMenuOpen(false)}
                        className="text-5xl font-bold lowercase hover:text-brand-yellow transition-colors"
                    >
                        {link.title}
                    </Link>
                ))}

                <Link
                    href="/contact"
                    onClick={() => setIsMenuOpen(false)}
                    className="text-5xl font-bold lowercase text-white hover:text-brand-yellow mt-8 decoration-2 underline underline-offset-8 decoration-brand-yellow"
                >
                    contact us
                </Link>
            </motion.div>
        </motion.header>
    );
}
