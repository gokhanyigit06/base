"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export function SiteFooter() {
    const [email, setEmail] = useState("hello@base.agency");
    const [phone, setPhone] = useState("+90 (212) 555 0123");
    const [address, setAddress] = useState("Levent, Istanbul\nTurkiye, 34330");
    const [copyright, setCopyright] = useState("© 2025 Base Agency. All rights reserved.");

    // Socials
    const [instagram, setInstagram] = useState("#");
    const [linkedin, setLinkedin] = useState("#");
    const [twitter, setTwitter] = useState("#");
    const [behance, setBehance] = useState("#");

    useEffect(() => {
        const fetchSettings = async () => {
            const { data } = await supabase
                .from('site_settings')
                .select('key, value');

            if (data) {
                const settingsMap: Record<string, (value: string) => void> = {
                    footer_email: setEmail,
                    footer_phone: setPhone,
                    footer_address: setAddress,
                    footer_copyright: setCopyright,
                    social_instagram: setInstagram,
                    social_linkedin: setLinkedin,
                    social_twitter: setTwitter,
                    social_behance: setBehance
                };

                data.forEach((item: { key: string, value: string }) => {
                    if (settingsMap[item.key]) {
                        settingsMap[item.key](item.value);
                    }
                });
            }
        };
        fetchSettings();
    }, []);

    return (
        <footer className="w-full bg-black text-white pt-24 pb-12 px-6 md:px-12 rounded-t-[3rem] -mt-12 relative z-10 border-t border-white/10">
            <div className="max-w-screen-2xl mx-auto flex flex-col">

                {/* Upper: Big CTA */}
                <div className="flex flex-col gap-8 mb-24">
                    <h2 className="text-[12vw] leading-[0.8] font-bold font-oswald uppercase tracking-tighter text-white">
                        HAVE AN IDEA?
                    </h2>
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-12">
                        <h2 className="text-[12vw] leading-[0.8] font-bold font-oswald uppercase tracking-tighter text-brand-yellow">
                            LET'S BUILD.
                        </h2>

                        <Link
                            href="/contact"
                            className="group relative px-12 py-6 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 transition-colors flex items-center gap-4"
                        >
                            <span className="text-xl md:text-2xl font-bold uppercase tracking-widest">Start a Project</span>
                            <ArrowUpRight className="w-8 h-8 group-hover:rotate-45 transition-transform duration-300" />
                        </Link>
                    </div>
                </div>

                {/* Divider */}
                <div className="w-full h-px bg-white/20 mb-12" />

                {/* Lower: Links & Info */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 text-sm font-mono tracking-wider text-gray-400">

                    {/* Column 1: Address */}
                    <div className="flex flex-col gap-4">
                        <span className="text-white font-bold mb-2 uppercase">Visit Us</span>
                        <p>
                            {address.split('\n').map((line, i) => (
                                <span key={i}>
                                    {line}
                                    <br />
                                </span>
                            ))}
                        </p>
                    </div>

                    {/* Column 2: Socials */}
                    <div className="flex flex-col gap-4">
                        <span className="text-white font-bold mb-2 uppercase">Follow</span>
                        <div className="flex flex-col gap-2">
                            <Link href={instagram} target="_blank" className="hover:text-brand-yellow transition-colors">Instagram</Link>
                            <Link href={linkedin} target="_blank" className="hover:text-brand-yellow transition-colors">LinkedIn</Link>
                            <Link href={twitter} target="_blank" className="hover:text-brand-yellow transition-colors">Twitter / X</Link>
                            <Link href={behance} target="_blank" className="hover:text-brand-yellow transition-colors">Behance</Link>
                        </div>
                    </div>

                    {/* Column 3: Contact */}
                    <div className="flex flex-col gap-4">
                        <span className="text-white font-bold mb-2 uppercase">Contact</span>
                        <Link href={`mailto:${email}`} className="text-xl text-white hover:text-brand-yellow transition-colors font-bold font-sans">
                            {email}
                        </Link>
                        <span className="text-white hover:text-brand-yellow transition-colors cursor-pointer">
                            {phone}
                        </span>
                    </div>

                    {/* Column 4: Back to Top */}
                    <div className="flex flex-col justify-end items-start md:items-end">
                        <button
                            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                            className="uppercase font-bold text-white border-b border-white hover:border-brand-yellow hover:text-brand-yellow transition-colors pb-1"
                        >
                            Back to Top
                        </button>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-24 pt-8 border-t border-white/10 text-xs text-gray-600 uppercase">
                    <span>{copyright}</span>
                    <div className="flex gap-8">
                        <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
                        <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
                    </div>
                </div>

            </div>
        </footer>
    );
}
