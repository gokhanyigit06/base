"use client";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArrowDown, ArrowRight } from "lucide-react";

export default function AboutPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    const services = [
        {
            id: "01",
            title: "BRAND IDENTITY",
            desc: "We define your brand DNA; We ensure that your brand's communication is more than just a logo through custom static, kinetic, haptic and digital designs."
        },
        {
            id: "02",
            title: "WEBSITE DESIGN & DEV.",
            desc: "We make it our priority to provide the best user UX & UI experience across our digital services via custom-designed and developed website designs & App interface."
        },
        {
            id: "03",
            title: "MOTION DESIGN",
            desc: "For an enhanced visual interaction; We integrate motion and animation across our works."
        },
        {
            id: "04",
            title: "PRINT & PACKAGE DESIGN",
            desc: "We design in forms of; Stationary, product packaging and publishing."
        },
        {
            id: "05",
            title: "ILLUSTRATION & 3D",
            desc: "Visual storytelling through custom illustrations and high-fidelity 3D modeling for immersive experiences."
        },
        {
            id: "06",
            title: "3D MODELLING",
            desc: "Creating realistic product renders and environments that elevate your brand presentation."
        },
        {
            id: "07",
            title: "CONTENT CREATION",
            desc: "In a digital world that demands non-stop fuel for content-making; We provide narrative, visual and motion content solutions."
        },
        {
            id: "08",
            title: "PHOTOGRAPHY & DIRECTION",
            desc: "Visual showcase is everything when it comes to digital marketing; So we make sure that your brand has the strongest visual output with our in-house creative direction."
        }
    ];

    return (
        <main ref={containerRef} className="min-h-screen bg-black text-white selection:bg-brand-yellow selection:text-black">
            <SiteHeader />

            {/* HERO SECTION - "WHAT WE DO." */}
            <section className="relative h-screen flex flex-col justify-center items-center px-4 overflow-hidden pt-20">
                <motion.h1
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="text-[18vw] font-bold font-oswald leading-[0.85] tracking-tighter text-center uppercase"
                >
                    WHAT WE DO.
                </motion.h1>

                <div className="absolute bottom-12 right-12 flex flex-col items-center gap-2 animate-bounce">
                    <span className="text-xs font-mono uppercase tracking-widest">Scroll</span>
                    <ArrowDown className="w-4 h-4" />
                </div>
            </section>

            {/* SERVICES GRID SECTION */}
            <section className="bg-[#f2f2f2] text-black py-24 px-6 md:px-12 relative rounded-t-[3rem] z-10">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 max-w-7xl mx-auto">
                    {services.map((service, index) => (
                        <div key={index} className="bg-white border text-black p-8 md:p-12 rounded-[2rem] flex flex-col gap-8 hover:shadow-xl transition-shadow duration-300 relative group overflow-hidden">
                            <span className="font-mono text-sm font-bold opacity-50">{service.id}.</span>
                            <div className="flex flex-col gap-4 z-10">
                                <h3 className="text-4xl md:text-5xl font-bold font-oswald uppercase tracking-tighter leading-[0.9]">{service.title}</h3>
                                <p className="font-sans text-gray-500 leading-relaxed text-sm md:text-base max-w-sm">
                                    {service.desc}
                                </p>
                            </div>
                            {/* Hover Decoration */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-yellow blur-[60px] opacity-0 group-hover:opacity-20 transition-opacity duration-500 rounded-full translate-x-1/2 -translate-y-1/2" />
                        </div>
                    ))}
                </div>

                {/* Decorative Star Element between sections (Visual only) */}
                <div className="absolute left-1/2 bottom-0 -mb-12 -ml-12 w-24 h-24 bg-black rotate-45 z-20 hidden md:block" />

            </section>

            {/* CLIENTS SECTION */}
            <section className="bg-black text-white py-32 px-6 md:px-12 relative overflow-hidden">
                <div className="max-w-7xl mx-auto flex flex-col gap-24 relative z-10">

                    {/* Header with Sticker */}
                    <div className="relative">
                        <h2 className="text-[10vw] font-bold font-oswald uppercase leading-[0.9] tracking-tighter text-center md:text-left">
                            SOME OF <br />
                            <span className="font-serif italic font-light lowercase">our</span> <span className="font-serif italic font-light">clients...</span>
                        </h2>
                        {/* Sticker Element */}
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            className="absolute top-0 right-0 md:top-10 md:right-32 w-32 h-32 md:w-48 md:h-48 bg-brand-yellow rounded-full flex items-center justify-center text-black font-bold rotate-12 z-10 pointer-events-none hidden md:flex"
                        >
                            {/* Simple Face SVG */}
                            <svg viewBox="0 0 100 100" className="w-full h-full p-4">
                                <path d="M20,40 Q30,30 40,40" stroke="black" strokeWidth="3" fill="none" />
                                <path d="M60,40 Q70,30 80,40" stroke="black" strokeWidth="3" fill="none" />
                                <path d="M30,70 Q50,90 70,70" stroke="black" strokeWidth="3" fill="none" />
                            </svg>
                        </motion.div>
                    </div>

                    {/* Client Logos Grid (Text Placeholders for now) */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-24 opacity-50">
                        {["COOKSHOP", "CITY'S", "MEYDAN", "WAM", "b-good", "gais", "justwork", "ZUBIZU"].map((client, i) => (
                            <div key={i} className="flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-500">
                                <span className="text-2xl font-bold font-oswald uppercase tracking-widest">{client}</span>
                            </div>
                        ))}
                    </div>

                </div>
            </section>

            {/* MANIFESTO / TEXT SECTION */}
            <section className="bg-black text-white py-24 px-6 md:px-12 border-t border-white/10">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-start">

                    <div className="flex flex-col gap-8">
                        <h3 className="text-2xl font-bold uppercase leading-relaxed">
                            We design iconic brands with future impact. 🚀
                        </h3>
                        <p className="text-gray-400 leading-relaxed">
                            JUST DESIGN FX® is a new generation awarded branding and web design agency that specializes in creating the best possible brand experience for business owners and target users.
                        </p>
                    </div>

                    <div className="flex flex-col gap-8 relative">
                        <p className="text-gray-400 leading-relaxed text-right md:text-left">
                            At JUST DESIGN FX®, we work collaboratively with clients from all over the world. Our working methodology involves analyzing a brand's current position, understanding its design and marketing needs, and envisioning its best future.
                        </p>
                        <div className="flex items-center justify-end gap-2 text-brand-yellow mt-8">
                            <span className="vertical-rl text-xs font-mono tracking-widest uppercase rotate-180" style={{ writingMode: 'vertical-rl' }}>THE FUTURE IS NEAR</span>
                            <ArrowDown className="w-4 h-4" />
                        </div>
                    </div>

                </div>
            </section>

            <SiteFooter />
        </main>
    );
}
