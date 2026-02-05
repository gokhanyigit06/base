"use client";

import Link from "next/link";
import Image from "next/image";
import { useScroll, useTransform, motion } from "framer-motion";

export function SiteHeader({ theme = "dark" }: { theme?: "light" | "dark" }) {
    const { scrollY } = useScroll();

    // Transform for Logo: Fades out and moves up slightly when scrolling starts
    const logoOpacity = useTransform(scrollY, [0, 100], [1, 0]);
    const logoY = useTransform(scrollY, [0, 100], [0, -20]);
    const logoPointerEvents = useTransform(scrollY, (y) => y > 50 ? "none" : "auto");

    const textColor = theme === "light" ? "text-black" : "text-white";

    const navLinks = [
        { title: "work", href: "/works" },
        { title: "services", href: "#" },
        { title: "about", href: "/about" },
    ];

    return (
        <header className="fixed top-0 left-0 right-0 z-50 h-24 px-6 flex items-center justify-between pointer-events-none">
            {/* Left: Logo */}
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
                        className={`object-contain object-left ${theme === 'light' ? 'invert' : ''}`}
                        priority
                    />
                </Link>
            </motion.div>

            {/* Center: Navigation Links */}
            <nav className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-10 pointer-events-auto">
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
            <div className="pointer-events-auto pr-12">
                <Link
                    href="/contact"
                    className={`text-4xl font-medium lowercase transition-colors duration-300 ${theme === 'light' ? 'text-blue-600' : 'text-blue-400 hover:text-blue-300'}`}
                >
                    contact us
                </Link>
            </div>
        </header>
    );
}
