"use client";

import { useState } from "react";

interface SloganSectionProps {
    initialSettings?: Record<string, string>;
}

export function SloganSection({ initialSettings = {} }: SloganSectionProps) {
    // Text States
    const [l1Start, setL1Start] = useState(initialSettings['slogan_l1_start'] ?? "WE DON'T JUST");
    const [l1Accent, setL1Accent] = useState(initialSettings['slogan_l1_accent'] ?? "design");
    const [l2Accent, setL2Accent] = useState(initialSettings['slogan_l2_accent'] ?? "we");
    const [l2Middle, setL2Middle] = useState(initialSettings['slogan_l2_middle'] ?? "DEFINE");
    const [l2End, setL2End] = useState(initialSettings['slogan_l2_end'] ?? "THE FUTURE.");

    // Style States
    const [l1StartFont, setL1StartFont] = useState(initialSettings['slogan_l1_start_font'] ?? "font-oswald");
    const [l1StartColor, setL1StartColor] = useState(initialSettings['slogan_l1_start_color'] ?? "#000000");

    const [l1AccentFont, setL1AccentFont] = useState(initialSettings['slogan_l1_accent_font'] ?? "font-serif");
    const [l1AccentColor, setL1AccentColor] = useState(initialSettings['slogan_l1_accent_color'] ?? "#000000");

    const [l2AccentFont, setL2AccentFont] = useState(initialSettings['slogan_l2_accent_font'] ?? "font-serif");
    const [l2AccentColor, setL2AccentColor] = useState(initialSettings['slogan_l2_accent_color'] ?? "#000000");

    const [l2MiddleFont, setL2MiddleFont] = useState(initialSettings['slogan_l2_middle_font'] ?? "font-oswald");
    const [l2MiddleColor, setL2MiddleColor] = useState(initialSettings['slogan_l2_middle_color'] ?? "#000000");

    const [l2EndFont, setL2EndFont] = useState(initialSettings['slogan_l2_end_font'] ?? "font-oswald");
    const [l2EndColor, setL2EndColor] = useState(initialSettings['slogan_l2_end_color'] ?? "#000000");

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
