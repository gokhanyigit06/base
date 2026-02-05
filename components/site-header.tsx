"use client";

import Link from "next/link";
import Image from "next/image";
import { useScroll, useTransform, motion, useMotionValueEvent } from "framer-motion"; // Added useMotionValueEvent
import { useState } from "react";

export function SiteHeader({ theme = "dark" }: { theme?: "light" | "dark" }) {
    const { scrollY } = useScroll();
    const [isScrolled, setIsScrolled] = useState(false);

    useMotionValueEvent(scrollY, "change", (latest) => {
        setIsScrolled(latest > 50);
    });

    const textColor = theme === "light" ? "text-black" : "text-white";

    const navLinks = [
        { title: "work", href: "/works" },
        { title: "services", href: "#" },
        { title: "about", href: "/about" },
    ];

    return (
        <motion.header
            className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 transition-all duration-300 ease-in-out ${isScrolled
                    ? `h-20 ${theme === 'light' ? 'bg-white/80' : 'bg-black/80'} backdrop-blur-md scale-[0.98] origin-top`
                    : 'h-24 bg-transparent scale-100'
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

            {/* Center: Navigation Links */}
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

            {/* Right: Contact Us Button */}
            <div className="pr-12">
                <Link
                    href="/contact"
                    className={`text-4xl font-medium lowercase transition-colors duration-300 ${theme === 'light' ? 'text-blue-600' : 'text-blue-400 hover:text-blue-300'}`}
                >
                    contact us
                </Link>
            </div>
        </motion.header>
    );
}
