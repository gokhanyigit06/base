"use client";

import { useEffect, useState } from "react";


interface CustomFont {
    id: string;
    name: string;
    font_url: string;
    font_family: string;
}

export function FontInjector() {
    const [customFonts, setCustomFonts] = useState<CustomFont[]>([]);

    useEffect(() => {
        const fetchFonts = async () => {
            try {
                const res = await fetch('/api/custom-fonts');
                if (res.ok) {
                    const data = await res.json();
                    setCustomFonts(data);
                }
            } catch (error) {
                console.error("Error fetching fonts:", error);
            }
        };
        fetchFonts();
    }, []);

    if (customFonts.length === 0) return null;

    // Generate @font-face rules for each custom font
    const fontFaceRules = customFonts.map((font) => `
        @font-face {
            font-family: '${font.font_family}';
            src: url('${font.font_url}') format('truetype');
            font-weight: normal;
            font-style: normal;
            font-display: swap;
        }
        @font-face {
            font-family: '${font.font_family}';
            src: url('${font.font_url}') format('truetype');
            font-weight: bold;
            font-style: normal;
            font-display: swap;
        }
        .${font.font_family} {
            font-family: '${font.font_family}', sans-serif !important;
        }
    `).join('\n');

    return (
        <style jsx global>{fontFaceRules}</style>
    );
}
