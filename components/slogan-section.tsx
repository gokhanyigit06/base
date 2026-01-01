"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function SloganSection() {
    // Text States
    const [l1Start, setL1Start] = useState("WE DON'T JUST");
    const [l1Accent, setL1Accent] = useState("design");
    const [l2Accent, setL2Accent] = useState("we");
    const [l2Middle, setL2Middle] = useState("DEFINE");
    const [l2End, setL2End] = useState("THE FUTURE.");

    // Style States
    const [l1StartFont, setL1StartFont] = useState("font-oswald");
    const [l1StartColor, setL1StartColor] = useState("#000000");

    const [l1AccentFont, setL1AccentFont] = useState("font-serif");
    const [l1AccentColor, setL1AccentColor] = useState("#000000");

    const [l2AccentFont, setL2AccentFont] = useState("font-serif");
    const [l2AccentColor, setL2AccentColor] = useState("#000000");

    const [l2MiddleFont, setL2MiddleFont] = useState("font-oswald");
    const [l2MiddleColor, setL2MiddleColor] = useState("#000000");

    const [l2EndFont, setL2EndFont] = useState("font-oswald");
    const [l2EndColor, setL2EndColor] = useState("#000000");

    useEffect(() => {
        const fetchSettings = async () => {
            const { data } = await supabase.from('site_settings').select('key, value');
            if (data) {
                const map: any = {
                    slogan_l1_start: setL1Start,
                    slogan_l1_accent: setL1Accent,
                    slogan_l2_accent: setL2Accent,
                    slogan_l2_middle: setL2Middle,
                    slogan_l2_end: setL2End,

                    slogan_l1_start_font: setL1StartFont,
                    slogan_l1_start_color: setL1StartColor,
                    slogan_l1_accent_font: setL1AccentFont,
                    slogan_l1_accent_color: setL1AccentColor,
                    slogan_l2_accent_font: setL2AccentFont,
                    slogan_l2_accent_color: setL2AccentColor,
                    slogan_l2_middle_font: setL2MiddleFont,
                    slogan_l2_middle_color: setL2MiddleColor,
                    slogan_l2_end_font: setL2EndFont,
                    slogan_l2_end_color: setL2EndColor,
                };

                data.forEach(item => {
                    if (map[item.key]) map[item.key](item.value);
                });
            }
        };
        fetchSettings();
    }, []);

    return (
        <section className="w-full bg-white text-black py-32 flex flex-col items-center justify-center text-center px-4">
            <div className="max-w-5xl mx-auto leading-[0.9]">
                {/* Line 1 */}
                <div className="flex flex-wrap justify-center items-baseline gap-4 md:gap-6 mb-2 md:mb-4">
                    <span
                        className={`text-[10vw] md:text-[7vw] font-bold uppercase tracking-tighter ${l1StartFont}`}
                        style={{ color: l1StartColor }}
                    >
                        {l1Start}
                    </span>
                    <span
                        className={`text-[10vw] md:text-[7vw] italic font-light lowercase ${l1AccentFont}`}
                        style={{ color: l1AccentColor }}
                    >
                        {l1Accent}
                    </span>
                </div>

                {/* Line 2 */}
                <div className="flex flex-wrap justify-center items-baseline gap-4 md:gap-6">
                    <span
                        className={`text-[10vw] md:text-[7vw] italic font-light lowercase ${l2AccentFont}`}
                        style={{ color: l2AccentColor }}
                    >
                        {l2Accent}
                    </span>
                    <span
                        className={`text-[12vw] md:text-[9vw] font-bold uppercase tracking-tighter transform -rotate-2 ${l2MiddleFont}`}
                        style={{ color: l2MiddleColor }}
                    >
                        {l2Middle}
                    </span>
                    <span
                        className={`text-[10vw] md:text-[7vw] font-bold uppercase tracking-tighter ${l2EndFont}`}
                        style={{ color: l2EndColor }}
                    >
                        {l2End}
                    </span>
                </div>
            </div>
        </section>
    );
}
