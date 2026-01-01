"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function FontInjector() {
    const [fontUrl, setFontUrl] = useState<string | null>(null);

    useEffect(() => {
        const fetchFont = async () => {
            const { data } = await supabase
                .from('site_settings')
                .select('value')
                .eq('key', 'custom_font_url')
                .single();

            if (data?.value) {
                setFontUrl(data.value);
            }
        };
        fetchFont();
    }, []);

    if (!fontUrl) return null;

    return (
        <style jsx global>{`
            @font-face {
                font-family: 'CustomFont';
                src: url('${fontUrl}') format('truetype');
                font-weight: normal;
                font-style: normal;
                font-display: swap;
            }
            @font-face {
                font-family: 'CustomFont';
                src: url('${fontUrl}') format('truetype');
                font-weight: bold;
                font-style: normal;
                font-display: swap;
            }
            .font-custom {
                font-family: 'CustomFont', sans-serif !important;
            }
        `}</style>
    );
}
