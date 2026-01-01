"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Save, Loader2, Type, GripVertical, MousePointer2, ImagePlus, Upload } from "lucide-react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableBlock({ id, children }: { id: string, children: React.ReactNode }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
    const style = { transform: CSS.Transform.toString(transform), transition };

    return (
        <div ref={setNodeRef} style={style} className="relative group bg-zinc-950/50 rounded-xl border border-zinc-800/50 p-4 hover:border-zinc-700 transition-colors">
            <div {...attributes} {...listeners} className="absolute left-1/2 -top-3 -translate-x-1/2 cursor-grab active:cursor-grabbing z-20 bg-zinc-800 rounded-full p-1 border border-zinc-700 text-gray-400 hover:text-white shadow-xl opacity-0 group-hover:opacity-100 transition-opacity touch-none">
                <GripVertical className="w-4 h-4" />
            </div>
            {children}
        </div>
    );
}

export default function SettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    // DnD State
    const [heroOrder, setHeroOrder] = useState(['tagline', 'headline', 'description']);
    const [customFonts, setCustomFonts] = useState<Array<{ id: string; name: string; font_url: string; font_family: string }>>([]);

    // DnD Sensors
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setHeroOrder((items) => {
                const oldIndex = items.indexOf(active.id as string);
                const newIndex = items.indexOf(over.id as string);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    // Form State
    const [settings, setSettings] = useState({
        // Video
        homepage_video_url: "",

        // Hero Text
        hero_tagline: "Look Ahead",
        hero_headline_start: "THE",
        hero_headline_accent: "future",
        hero_headline_end: "HAS ARRIVED.",
        hero_description: "Awarded Branding & Web Design Agency.",

        // Works Section
        works_section_title: "Latest Works",
        marquee_text: "LATEST WORKS",
        marquee_speed: "5",

        // Cursor
        custom_cursor_url: "",
        custom_cursor_hover_url: "",
        cursor_size: "32",
        cursor_hover_size: "32",

        // Colors (Hex defaults matching brand colors)
        hero_accent_color: "#CCF000", // brand-yellow
        hero_tagline_color: "#9CA3AF",
        hero_headline_color: "#FFFFFF", // Legacy/fallback
        hero_headline_start_color: "#FFFFFF", // NEW: Headline Part 1
        hero_headline_accent_color: "#CCF000", // NEW: Accent Word (yellow by default)
        hero_headline_end_color: "#FFFFFF", // NEW: Headline Part 3
        hero_description_color: "#9CA3AF",

        // Fonts
        custom_font_url: "",
        hero_tagline_font: "font-mono",
        hero_headline_font: "font-oswald", // Legacy/fallback
        hero_headline_start_font: "font-oswald", // NEW: Headline Part 1
        hero_headline_accent_font: "font-oswald", // NEW: Accent Word
        hero_headline_end_font: "font-oswald", // NEW: Headline Part 3
        hero_description_font: "font-mono",

        // Slogan Section
        slogan_l1_start: "WE DON'T JUST",
        slogan_l1_accent: "design",
        slogan_l2_accent: "we",
        slogan_l2_middle: "DEFINE",
        slogan_l2_end: "THE FUTURE.",

        // Slogan Styles
        slogan_l1_start_font: "font-oswald",
        slogan_l1_start_color: "#000000",
        slogan_l1_accent_font: "font-serif",
        slogan_l1_accent_color: "#000000",
        slogan_l2_accent_font: "font-serif",
        slogan_l2_accent_color: "#000000",
        slogan_l2_middle_font: "font-oswald",
        slogan_l2_middle_color: "#000000",
        slogan_l2_end_font: "font-oswald",
        slogan_l2_end_color: "#000000",

        // Footer CTA
        cta_text_1: "HAVE AN IDEA?",
        cta_text_1_font: "font-oswald",
        cta_text_1_color: "#FFFFFF",
        cta_text_2: "LET'S BUILD.",
        cta_text_2_font: "font-oswald",
        cta_text_2_color: "#CCF000",
        cta_btn_text: "Start a Project",
        cta_btn_font: "font-sans",
        cta_btn_text_color: "#FFFFFF",
        cta_btn_bg_color: "#18181b",
        cta_btn_border_color: "#3f3f46",

        // Footer Settings
        footer_email: "hello@base.agency",
        footer_phone: "+90 (212) 555 0123",
        footer_address: "Levent, Istanbul\nTurkiye, 34330",
        footer_copyright: "© 2025 Base Agency. All rights reserved.",
        social_instagram: "#",
        social_linkedin: "#",
        social_twitter: "#",
        social_behance: "#",
    });

    // Fetch initial settings
    useEffect(() => {
        const fetchSettings = async () => {
            const { data } = await supabase
                .from('site_settings')
                .select('key, value');

            if (data) {
                const settingsMap = {
                    homepage_video_url: (val: string) => setSettings(prev => ({ ...prev, homepage_video_url: val })),
                    hero_tagline: (val: string) => setSettings(prev => ({ ...prev, hero_tagline: val })),
                    hero_headline_start: (val: string) => setSettings(prev => ({ ...prev, hero_headline_start: val })),
                    hero_headline_accent: (val: string) => setSettings(prev => ({ ...prev, hero_headline_accent: val })),
                    hero_headline_end: (val: string) => setSettings(prev => ({ ...prev, hero_headline_end: val })),
                    hero_description: (val: string) => setSettings(prev => ({ ...prev, hero_description: val })),
                    hero_accent_color: (val: string) => setSettings(prev => ({ ...prev, hero_accent_color: val })),
                    hero_tagline_color: (val: string) => setSettings(prev => ({ ...prev, hero_tagline_color: val })),
                    hero_headline_color: (val: string) => setSettings(prev => ({ ...prev, hero_headline_color: val })),
                    hero_headline_start_color: (val: string) => setSettings(prev => ({ ...prev, hero_headline_start_color: val })),
                    hero_headline_accent_color: (val: string) => setSettings(prev => ({ ...prev, hero_headline_accent_color: val })),
                    hero_headline_end_color: (val: string) => setSettings(prev => ({ ...prev, hero_headline_end_color: val })),
                    hero_description_color: (val: string) => setSettings(prev => ({ ...prev, hero_description_color: val })),
                    hero_tagline_font: (val: string) => setSettings(prev => ({ ...prev, hero_tagline_font: val })),
                    hero_headline_font: (val: string) => setSettings(prev => ({ ...prev, hero_headline_font: val })),
                    hero_headline_start_font: (val: string) => setSettings(prev => ({ ...prev, hero_headline_start_font: val })),
                    hero_headline_accent_font: (val: string) => setSettings(prev => ({ ...prev, hero_headline_accent_font: val })),
                    hero_headline_end_font: (val: string) => setSettings(prev => ({ ...prev, hero_headline_end_font: val })),
                    hero_description_font: (val: string) => setSettings(prev => ({ ...prev, hero_description_font: val })),
                    custom_font_url: (val: string) => setSettings(prev => ({ ...prev, custom_font_url: val })),

                    slogan_l1_start: (val: string) => setSettings(prev => ({ ...prev, slogan_l1_start: val })),
                    slogan_l1_accent: (val: string) => setSettings(prev => ({ ...prev, slogan_l1_accent: val })),
                    slogan_l2_accent: (val: string) => setSettings(prev => ({ ...prev, slogan_l2_accent: val })),
                    slogan_l2_middle: (val: string) => setSettings(prev => ({ ...prev, slogan_l2_middle: val })),
                    slogan_l2_end: (val: string) => setSettings(prev => ({ ...prev, slogan_l2_end: val })),

                    slogan_l1_start_font: (val: string) => setSettings(prev => ({ ...prev, slogan_l1_start_font: val })),
                    slogan_l1_start_color: (val: string) => setSettings(prev => ({ ...prev, slogan_l1_start_color: val })),
                    slogan_l1_accent_font: (val: string) => setSettings(prev => ({ ...prev, slogan_l1_accent_font: val })),
                    slogan_l1_accent_color: (val: string) => setSettings(prev => ({ ...prev, slogan_l1_accent_color: val })),
                    slogan_l2_accent_font: (val: string) => setSettings(prev => ({ ...prev, slogan_l2_accent_font: val })),
                    slogan_l2_accent_color: (val: string) => setSettings(prev => ({ ...prev, slogan_l2_accent_color: val })),
                    slogan_l2_middle_font: (val: string) => setSettings(prev => ({ ...prev, slogan_l2_middle_font: val })),
                    slogan_l2_middle_color: (val: string) => setSettings(prev => ({ ...prev, slogan_l2_middle_color: val })),
                    slogan_l2_end_font: (val: string) => setSettings(prev => ({ ...prev, slogan_l2_end_font: val })),
                    slogan_l2_end_color: (val: string) => setSettings(prev => ({ ...prev, slogan_l2_end_color: val })),

                    cta_text_1: (val: string) => setSettings(prev => ({ ...prev, cta_text_1: val })),
                    cta_text_1_font: (val: string) => setSettings(prev => ({ ...prev, cta_text_1_font: val })),
                    cta_text_1_color: (val: string) => setSettings(prev => ({ ...prev, cta_text_1_color: val })),
                    cta_text_2: (val: string) => setSettings(prev => ({ ...prev, cta_text_2: val })),
                    cta_text_2_font: (val: string) => setSettings(prev => ({ ...prev, cta_text_2_font: val })),
                    cta_text_2_color: (val: string) => setSettings(prev => ({ ...prev, cta_text_2_color: val })),
                    cta_btn_text: (val: string) => setSettings(prev => ({ ...prev, cta_btn_text: val })),
                    cta_btn_font: (val: string) => setSettings(prev => ({ ...prev, cta_btn_font: val })),
                    cta_btn_text_color: (val: string) => setSettings(prev => ({ ...prev, cta_btn_text_color: val })),
                    cta_btn_bg_color: (val: string) => setSettings(prev => ({ ...prev, cta_btn_bg_color: val })),
                    cta_btn_border_color: (val: string) => setSettings(prev => ({ ...prev, cta_btn_border_color: val })),

                    footer_email: (val: string) => setSettings(prev => ({ ...prev, footer_email: val })),
                    footer_phone: (val: string) => setSettings(prev => ({ ...prev, footer_phone: val })),
                    footer_address: (val: string) => setSettings(prev => ({ ...prev, footer_address: val })),
                    footer_copyright: (val: string) => setSettings(prev => ({ ...prev, footer_copyright: val })),
                    social_instagram: (val: string) => setSettings(prev => ({ ...prev, social_instagram: val })),
                    social_linkedin: (val: string) => setSettings(prev => ({ ...prev, social_linkedin: val })),
                    social_twitter: (val: string) => setSettings(prev => ({ ...prev, social_twitter: val })),
                    social_behance: (val: string) => setSettings(prev => ({ ...prev, social_behance: val })),
                    works_section_title: (val: string) => setSettings(prev => ({ ...prev, works_section_title: val })),
                    marquee_text: (val: string) => setSettings(prev => ({ ...prev, marquee_text: val })),
                    marquee_speed: (val: string) => setSettings(prev => ({ ...prev, marquee_speed: val })),
                    custom_cursor_url: (val: string) => setSettings(prev => ({ ...prev, custom_cursor_url: val })),
                    custom_cursor_hover_url: (val: string) => setSettings(prev => ({ ...prev, custom_cursor_hover_url: val })),
                    cursor_size: (val: string) => setSettings(prev => ({ ...prev, cursor_size: val })),
                    cursor_hover_size: (val: string) => setSettings(prev => ({ ...prev, cursor_hover_size: val }))
                };

                data.forEach((item: { key: string, value: string }) => {
                    if (settingsMap[item.key as keyof typeof settingsMap] && typeof settingsMap[item.key as keyof typeof settingsMap] === 'function') {
                        // Typescript might complain about function type matching, calling simply:
                        (settingsMap[item.key as keyof typeof settingsMap] as any)(item.value);
                    }
                    if (item.key === 'hero_elements_order') {
                        try {
                            setHeroOrder(JSON.parse(item.value));
                        } catch (e) {
                            console.error("Failed to parse hero order", e);
                        }
                    }
                });
            }
            setLoading(false);
        };

        const fetchCustomFonts = async () => {
            const { data } = await supabase
                .from('custom_fonts')
                .select('*')
                .order('created_at', { ascending: true });

            if (data) setCustomFonts(data);
        };

        fetchSettings();
        fetchCustomFonts();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setSettings({ ...settings, [e.target.name]: e.target.value });
    };

    // Helper to render font options with custom fonts
    const renderFontOptions = () => (
        <>
            <option value="font-sans">Sans Serif</option>
            <option value="font-serif">Serif (Playfair)</option>
            <option value="font-mono">Monospace</option>
            <option value="font-oswald">Oswald (Bold)</option>
            {customFonts.map((font) => (
                <option key={font.id} value={font.font_family}>
                    {font.name}
                </option>
            ))}
        </>
    );

    const handleSave = async () => {
        setSaving(true);
        try {
            // Prepare upsert array
            const updates = Object.entries(settings).map(([key, value]) => ({
                key,
                value
            }));

            // Add Order
            updates.push({
                key: 'hero_elements_order',
                value: JSON.stringify(heroOrder)
            });

            const { error } = await supabase
                .from('site_settings')
                .upsert(updates, { onConflict: 'key' });

            if (error) throw error;
            alert("Settings saved successfully!");
        } catch (error) {
            console.error(error);
            alert("Error saving settings.");
        } finally {
            setSaving(false);
        }
    };

    const handleCursorUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `cursor-${Date.now()}.${fileExt}`;
            const filePath = `site-assets/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('project-assets')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from('project-assets').getPublicUrl(filePath);
            const publicUrl = data.publicUrl;

            // Persist immediately
            const { error: dbError } = await supabase
                .from('site_settings')
                .upsert({ key: 'custom_cursor_url', value: publicUrl }, { onConflict: 'key' });

            if (dbError) throw dbError;

            setSettings(prev => ({ ...prev, custom_cursor_url: publicUrl }));
            alert("Cursor updated successfully!");

        } catch (error: any) {
            console.error(error);
            alert(`Error uploading cursor: ${error.message || "Unknown error"}`);
        } finally {
            setUploading(false);
        }
    };

    const handleCursorHoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `cursor-hover-${Date.now()}.${fileExt}`;
            const filePath = `site-assets/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('project-assets')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from('project-assets').getPublicUrl(filePath);
            const publicUrl = data.publicUrl;

            // Persist immediately
            const { error: dbError } = await supabase
                .from('site_settings')
                .upsert({ key: 'custom_cursor_hover_url', value: publicUrl }, { onConflict: 'key' });

            if (dbError) throw dbError;

            setSettings(prev => ({ ...prev, custom_cursor_hover_url: publicUrl }));
            alert("Hover Cursor updated successfully!");

        } catch (error: any) {
            console.error(error);
            alert(`Error uploading hover cursor: ${error.message || "Unknown error"}`);
        } finally {
            setUploading(false);
        }
    };

    const handleFontUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `font-${Date.now()}.${fileExt}`;
            const filePath = `site-assets/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('project-assets')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from('project-assets').getPublicUrl(filePath);
            const publicUrl = data.publicUrl;

            // Persist immediately
            const { error: dbError } = await supabase
                .from('site_settings')
                .upsert({ key: 'custom_font_url', value: publicUrl }, { onConflict: 'key' });

            if (dbError) throw dbError;

            setSettings(prev => ({ ...prev, custom_font_url: publicUrl }));
            alert("Custom Font uploaded successfully! Please refresh the page to see changes.");

        } catch (error: any) {
            console.error(error);
            alert(`Error uploading font: ${error.message || "Unknown error"}`);
        } finally {
            setUploading(false);
        }
    };

    const handleCustomFontUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const fontName = prompt("Enter a name for this font (e.g., 'Montserrat Bold'):");
        if (!fontName || fontName.trim() === "") {
            alert("Font name is required!");
            return;
        }

        setUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `custom-font-${Date.now()}.${fileExt}`;
            const filePath = `site-assets/fonts/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('project-assets')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from('project-assets').getPublicUrl(filePath);
            const publicUrl = data.publicUrl;

            // Generate unique font-family class
            const fontFamily = `font-custom-${Date.now()}`;

            // Save to custom_fonts table
            const { error: dbError } = await supabase
                .from('custom_fonts')
                .insert({
                    name: fontName.trim(),
                    font_url: publicUrl,
                    font_family: fontFamily
                });

            if (dbError) throw dbError;

            // Refresh custom fonts list
            const { data: fontsData } = await supabase
                .from('custom_fonts')
                .select('*')
                .order('created_at', { ascending: true });

            if (fontsData) setCustomFonts(fontsData);

            alert(`Font "${fontName}" uploaded successfully!`);

        } catch (error: any) {
            console.error(error);
            alert(`Error uploading font: ${error.message || "Unknown error"}`);
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteCustomFont = async (fontId: string, fontName: string) => {
        if (!confirm(`Are you sure you want to delete "${fontName}"?`)) return;

        try {
            const { error } = await supabase
                .from('custom_fonts')
                .delete()
                .eq('id', fontId);

            if (error) throw error;

            setCustomFonts(customFonts.filter(f => f.id !== fontId));
            alert(`Font "${fontName}" deleted successfully!`);

        } catch (error: any) {
            console.error(error);
            alert(`Error deleting font: ${error.message || "Unknown error"}`);
        }
    };

    const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `homepage-video-${Date.now()}.${fileExt}`;
            const filePath = `site-assets/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('project-assets')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from('project-assets').getPublicUrl(filePath);
            const publicUrl = data.publicUrl;

            // Update local state handles the UI updates, save will persist it or we persist immediately?
            // Let's persist immediately for video upload to match previous UX
            const { error: dbError } = await supabase
                .from('site_settings')
                .upsert({ key: 'homepage_video_url', value: publicUrl }, { onConflict: 'key' });

            if (dbError) throw dbError;

            setSettings(prev => ({ ...prev, homepage_video_url: publicUrl }));
            alert("Video updated successfully!");

        } catch (error: any) {
            console.error(error);
            alert(`Error uploading video: ${error.message || "Unknown error"}`);
        } finally {
            setUploading(false);
        }
    };

    if (loading) return <div className="p-12"><Loader2 className="animate-spin text-white" /></div>;

    return (
        <div className="max-w-4xl mx-auto pb-24">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-4xl font-bold font-oswald uppercase text-white">Site Settings</h1>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-brand-yellow text-black px-6 py-3 rounded-full font-bold uppercase tracking-wider hover:bg-white transition-colors flex items-center gap-2"
                >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    Save Changes
                </button>
            </div>

            <div className="grid grid-cols-1 gap-8">

                {/* --- HOME HERO TEXT --- */}
                <section className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl">
                    <div className="flex items-center gap-4 mb-6 border-b border-zinc-800 pb-4">
                        <Type className="text-brand-yellow w-6 h-6" />
                        <h3 className="text-xl font-bold text-white uppercase tracking-wider">Homepage Hero Text</h3>
                    </div>

                    <p className="text-gray-500 text-xs mb-6 italic">Drag and drop the blocks below to reorder the sections on the homepage.</p>

                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={heroOrder} strategy={verticalListSortingStrategy}>
                            <div className="flex flex-col gap-4">
                                {heroOrder.map((itemId) => (
                                    <SortableBlock key={itemId} id={itemId}>
                                        {itemId === 'tagline' && (
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Tagline (Small Top Text)</label>
                                                    <input
                                                        name="hero_tagline"
                                                        value={settings.hero_tagline}
                                                        onChange={handleChange}
                                                        className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white placeholder:text-gray-700 focus:border-brand-yellow outline-none font-mono text-sm"
                                                    />
                                                </div>
                                                <div className="flex gap-4">
                                                    <div className="flex-1">
                                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-1">Font Family</label>
                                                        <select
                                                            name="hero_tagline_font"
                                                            value={settings.hero_tagline_font}
                                                            onChange={handleChange}
                                                            className="w-full bg-black border border-zinc-700 rounded-lg p-2 text-xs text-white outline-none focus:border-brand-yellow"
                                                        >
                                                            {renderFontOptions()}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-1">Color</label>
                                                        <input
                                                            type="color"
                                                            name="hero_tagline_color"
                                                            value={settings.hero_tagline_color}
                                                            onChange={handleChange}
                                                            className="h-9 w-20 bg-black border border-zinc-700 rounded-lg cursor-pointer"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {itemId === 'headline' && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Headline Part 1</label>
                                                    <input
                                                        name="hero_headline_start"
                                                        value={settings.hero_headline_start}
                                                        onChange={handleChange}
                                                        className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white placeholder:text-gray-700 focus:border-brand-yellow outline-none font-oswald font-bold uppercase text-lg"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Headline Part 3</label>
                                                    <input
                                                        name="hero_headline_end"
                                                        value={settings.hero_headline_end}
                                                        onChange={handleChange}
                                                        className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white placeholder:text-gray-700 focus:border-brand-yellow outline-none font-oswald font-bold uppercase text-lg"
                                                    />
                                                </div>
                                                <div className="col-span-2 grid grid-cols-[1fr_100px] gap-4">
                                                    <div>
                                                        <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Accent Word</label>
                                                        <input
                                                            name="hero_headline_accent"
                                                            value={settings.hero_headline_accent}
                                                            onChange={handleChange}
                                                            className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-brand-yellow placeholder:text-gray-700 focus:border-brand-yellow outline-none font-serif italic text-lg"
                                                            style={{ color: settings.hero_accent_color }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Color</label>
                                                        <div className="h-[50px] w-full relative rounded-lg overflow-hidden border border-zinc-700">
                                                            <input
                                                                type="color"
                                                                name="hero_accent_color"
                                                                value={settings.hero_accent_color}
                                                                onChange={handleChange}
                                                                className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] cursor-pointer p-0 m-0 border-none"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-span-2 grid grid-cols-[1fr_100px] gap-4 pt-4 border-t border-zinc-800 mt-2">
                                                    <div>
                                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-1">Headline Font Family</label>
                                                        <select
                                                            name="hero_headline_font"
                                                            value={settings.hero_headline_font}
                                                            onChange={handleChange}
                                                            className="w-full bg-black border border-zinc-700 rounded-lg p-2 text-xs text-white outline-none focus:border-brand-yellow"
                                                        >
                                                            {renderFontOptions()}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-1">Main Color</label>
                                                        <input
                                                            type="color"
                                                            name="hero_headline_color"
                                                            value={settings.hero_headline_color}
                                                            onChange={handleChange}
                                                            className="h-9 w-full bg-black border border-zinc-700 rounded-lg cursor-pointer"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {itemId === 'description' && (
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Description Text</label>
                                                    <textarea
                                                        name="hero_description"
                                                        value={settings.hero_description}
                                                        onChange={handleChange}
                                                        rows={2}
                                                        className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white placeholder:text-gray-700 focus:border-brand-yellow outline-none font-mono text-sm"
                                                    />
                                                </div>
                                                <div className="flex gap-4">
                                                    <div className="flex-1">
                                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-1">Font Family</label>
                                                        <select
                                                            name="hero_description_font"
                                                            value={settings.hero_description_font}
                                                            onChange={handleChange}
                                                            className="w-full bg-black border border-zinc-700 rounded-lg p-2 text-xs text-white outline-none focus:border-brand-yellow"
                                                        >
                                                            {renderFontOptions()}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-1">Color</label>
                                                        <input
                                                            type="color"
                                                            name="hero_description_color"
                                                            value={settings.hero_description_color}
                                                            onChange={handleChange}
                                                            className="h-9 w-20 bg-black border border-zinc-700 rounded-lg cursor-pointer"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </SortableBlock>
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                </section>


                {/* --- WORKS SECTION --- */}
                <section className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl">
                    <div className="flex items-center gap-4 mb-6 border-b border-zinc-800 pb-4">
                        <Type className="text-brand-yellow w-6 h-6" />
                        <h3 className="text-xl font-bold text-white uppercase tracking-wider">Works Section</h3>
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Section Title</label>
                        <input
                            name="works_section_title"
                            value={settings.works_section_title}
                            onChange={handleChange}
                            className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white placeholder:text-gray-700 focus:border-brand-yellow outline-none font-mono text-sm"
                        />
                    </div>

                    <div className="mt-6">
                        <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Marquee Text (Scrolling Text)</label>
                        <input
                            name="marquee_text"
                            value={settings.marquee_text}
                            onChange={handleChange}
                            className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white placeholder:text-gray-700 focus:border-brand-yellow outline-none font-mono text-sm"
                        />
                    </div>

                    <div className="mt-6">
                        <div className="flex justify-between mb-2">
                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500">Marquee Speed</label>
                            <span className="text-xs font-mono text-brand-yellow">{settings.marquee_speed}%</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="50"
                            step="1"
                            name="marquee_speed"
                            value={settings.marquee_speed}
                            onChange={handleChange}
                            className="w-full accent-brand-yellow cursor-pointer"
                        />
                        <p className="text-[10px] text-gray-600 mt-1">Controls how fast the text moves when scrolling.</p>
                    </div>
                </section>


                {/* --- SLOGAN SECTION --- */}
                <section className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl">
                    <div className="flex items-center gap-4 mb-6 border-b border-zinc-800 pb-4">
                        <Type className="text-brand-yellow w-6 h-6" />
                        <h3 className="text-xl font-bold text-white uppercase tracking-wider">Slogan Section Typography</h3>
                    </div>

                    <div className="space-y-4">
                        {[
                            { label: "Line 1 - Start", key: "slogan_l1_start" },
                            { label: "Line 1 - Accent", key: "slogan_l1_accent" },
                            { label: "Line 2 - Start", key: "slogan_l2_accent" },
                            { label: "Line 2 - Middle", key: "slogan_l2_middle" },
                            { label: "Line 2 - End", key: "slogan_l2_end" },
                        ].map((item) => (
                            <div key={item.key} className="bg-black p-4 rounded-xl border border-zinc-800">
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                                    <div className="md:col-span-6">
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-1">{item.label}</label>
                                        <input
                                            name={item.key}
                                            value={(settings as any)[item.key]}
                                            onChange={handleChange}
                                            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-white outline-none focus:border-brand-yellow text-sm"
                                        />
                                    </div>
                                    <div className="md:col-span-4">
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-1">Font Family</label>
                                        <select
                                            name={`${item.key}_font`}
                                            value={(settings as any)[`${item.key}_font`]}
                                            onChange={handleChange}
                                            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-xs text-white outline-none focus:border-brand-yellow"
                                        >
                                            {renderFontOptions()}
                                        </select>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-1">Color</label>
                                        <input
                                            type="color"
                                            name={`${item.key}_color`}
                                            value={(settings as any)[`${item.key}_color`]}
                                            onChange={handleChange}
                                            className="h-9 w-full bg-zinc-900 border border-zinc-700 rounded-lg cursor-pointer p-0"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>


                {/* --- FOOTER CTA (CONTACT) --- */}
                <section className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl">
                    <div className="flex items-center gap-4 mb-6 border-b border-zinc-800 pb-4">
                        <Type className="text-brand-yellow w-6 h-6" />
                        <h3 className="text-xl font-bold text-white uppercase tracking-wider">Footer CTA Section</h3>
                    </div>

                    <div className="space-y-4">
                        {/* Line 1 */}
                        <div className="bg-black p-4 rounded-xl border border-zinc-800">
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                                <div className="md:col-span-6">
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-1">Line 1 Text</label>
                                    <input name="cta_text_1" value={settings.cta_text_1} onChange={handleChange} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-white outline-none focus:border-brand-yellow text-sm" />
                                </div>
                                <div className="md:col-span-4">
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-1">Font</label>
                                    <select name="cta_text_1_font" value={settings.cta_text_1_font} onChange={handleChange} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-xs text-white outline-none focus:border-brand-yellow">
                                        {renderFontOptions()}
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-1">Color</label>
                                    <input type="color" name="cta_text_1_color" value={settings.cta_text_1_color} onChange={handleChange} className="h-9 w-full bg-zinc-900 border-zinc-700 rounded-lg cursor-pointer p-0" />
                                </div>
                            </div>
                        </div>

                        {/* Line 2 */}
                        <div className="bg-black p-4 rounded-xl border border-zinc-800">
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                                <div className="md:col-span-6">
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-1">Line 2 Text</label>
                                    <input name="cta_text_2" value={settings.cta_text_2} onChange={handleChange} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-white outline-none focus:border-brand-yellow text-sm" />
                                </div>
                                <div className="md:col-span-4">
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-1">Font</label>
                                    <select name="cta_text_2_font" value={settings.cta_text_2_font} onChange={handleChange} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-xs text-white outline-none focus:border-brand-yellow">
                                        {renderFontOptions()}
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-1">Color</label>
                                    <input type="color" name="cta_text_2_color" value={settings.cta_text_2_color} onChange={handleChange} className="h-9 w-full bg-zinc-900 border-zinc-700 rounded-lg cursor-pointer p-0" />
                                </div>
                            </div>
                        </div>

                        {/* CTA Button */}
                        <div className="bg-black p-4 rounded-xl border border-zinc-800">
                            <h4 className="text-gray-500 text-xs uppercase tracking-widest font-bold mb-4">Button Styling</h4>
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end mb-4">
                                <div className="md:col-span-6">
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-1">Button Text</label>
                                    <input name="cta_btn_text" value={settings.cta_btn_text} onChange={handleChange} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-white outline-none focus:border-brand-yellow text-sm" />
                                </div>
                                <div className="md:col-span-4">
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-1">Font</label>
                                    <select name="cta_btn_font" value={settings.cta_btn_font} onChange={handleChange} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-xs text-white outline-none focus:border-brand-yellow">
                                        {renderFontOptions()}
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-1">Text Color</label>
                                    <input type="color" name="cta_btn_text_color" value={settings.cta_btn_text_color} onChange={handleChange} className="h-9 w-full bg-zinc-900 border-zinc-700 rounded-lg cursor-pointer p-0" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-1">Background Color</label>
                                    <div className="flex items-center gap-2">
                                        <input type="color" name="cta_btn_bg_color" value={settings.cta_btn_bg_color} onChange={handleChange} className="h-9 w-full bg-zinc-900 border-zinc-700 rounded-lg cursor-pointer p-0" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-600 mb-1">Border Color</label>
                                    <div className="flex items-center gap-2">
                                        <input type="color" name="cta_btn_border_color" value={settings.cta_btn_border_color} onChange={handleChange} className="h-9 w-full bg-zinc-900 border-zinc-700 rounded-lg cursor-pointer p-0" />
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </section>


                {/* --- FONT MANAGER --- */}
                <section className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl">
                    <div className="flex items-center justify-between mb-6 border-b border-zinc-800 pb-4">
                        <div className="flex items-center gap-4">
                            <Type className="text-brand-yellow w-6 h-6" />
                            <h3 className="text-xl font-bold text-white uppercase tracking-wider">Font Manager</h3>
                        </div>
                        <span className="text-xs text-gray-500 font-mono">{customFonts.length} Custom Fonts</span>
                    </div>

                    {/* Upload New Font */}
                    <div className="border-2 border-dashed border-zinc-800 rounded-xl p-8 text-center hover:border-brand-yellow transition-colors cursor-pointer relative group mb-6">
                        <input
                            type="file"
                            accept=".ttf, .otf, .woff, .woff2"
                            onChange={handleCustomFontUpload}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                        />
                        <div className="flex flex-col items-center justify-center gap-4 relative z-10">
                            <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center">
                                <span className="text-2xl font-bold text-gray-400">Aa</span>
                            </div>
                            <div className="text-center">
                                <p className="text-white font-bold uppercase tracking-widest text-sm mb-1">
                                    Upload New Font
                                </p>
                                <p className="text-gray-500 text-xs">
                                    .ttf, .otf, .woff, .woff2
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Font List */}
                    {customFonts.length > 0 && (
                        <div className="space-y-3">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4">Uploaded Fonts</h4>
                            {customFonts.map((font) => (
                                <div key={font.id} className="bg-black border border-zinc-800 rounded-xl p-4 flex items-center justify-between group hover:border-brand-yellow transition-colors">
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center">
                                            <Type className="w-5 h-5 text-gray-400" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-white font-bold text-sm">{font.name}</p>
                                            <p className="text-gray-500 text-xs font-mono">{font.font_family}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteCustomFont(font.id, font.name)}
                                        className="px-4 py-2 bg-red-500/10 text-red-500 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-red-500 hover:text-white transition-colors"
                                    >
                                        Delete
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {customFonts.length === 0 && (
                        <div className="text-center py-8">
                            <p className="text-gray-500 text-sm">No custom fonts uploaded yet.</p>
                        </div>
                    )}
                </section>


                {/* --- CUSTOM CURSOR --- */}
                <section className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl">
                    <div className="flex items-center gap-4 mb-6 border-b border-zinc-800 pb-4">
                        <MousePointer2 className="text-brand-yellow w-6 h-6" />
                        <h3 className="text-xl font-bold text-white uppercase tracking-wider">Custom Mouse Cursor</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Normal State */}
                        <div className="flex flex-col gap-4">
                            <div className="border-2 border-dashed border-zinc-800 rounded-xl p-8 text-center hover:border-brand-yellow transition-colors cursor-pointer relative group h-full flex flex-col items-center justify-center">
                                <input
                                    type="file"
                                    accept="image/png, image/svg+xml, .svg"
                                    onChange={handleCursorUpload}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                                />
                                <div className="flex flex-col items-center justify-center gap-4 relative z-10">
                                    {settings.custom_cursor_url ? (
                                        <div className="relative w-16 h-16">
                                            <img src={settings.custom_cursor_url} alt="Custom Cursor" className="w-full h-full object-contain" />
                                        </div>
                                    ) : (
                                        <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center">
                                            <ImagePlus className="w-8 h-8 text-gray-500" />
                                        </div>
                                    )}
                                    <div className="text-center">
                                        <p className="text-white font-bold uppercase tracking-widest text-sm mb-1">Normal State</p>
                                        <p className="text-gray-500 text-xs">Standard cursor icon</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-black p-4 rounded-xl border border-zinc-800">
                                <div className="flex justify-between mb-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Size (px)</label>
                                    <span className="text-brand-yellow font-mono text-xs">{settings.cursor_size}px</span>
                                </div>
                                <input
                                    type="range"
                                    min="16"
                                    max="128"
                                    name="cursor_size"
                                    value={settings.cursor_size}
                                    onChange={handleChange}
                                    className="w-full accent-brand-yellow cursor-pointer"
                                />
                            </div>
                        </div>

                        {/* Hover State */}
                        <div className="flex flex-col gap-4">
                            <div className="border-2 border-dashed border-zinc-800 rounded-xl p-8 text-center hover:border-brand-yellow transition-colors cursor-pointer relative group h-full flex flex-col items-center justify-center">
                                <input
                                    type="file"
                                    accept="image/png, image/svg+xml, .svg"
                                    onChange={handleCursorHoverUpload}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                                />
                                <div className="flex flex-col items-center justify-center gap-4 relative z-10">
                                    {settings.custom_cursor_hover_url ? (
                                        <div className="relative w-16 h-16">
                                            <img src={settings.custom_cursor_hover_url} alt="Hover Cursor" className="w-full h-full object-contain" />
                                        </div>
                                    ) : (
                                        <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center">
                                            <ImagePlus className="w-8 h-8 text-gray-500" />
                                        </div>
                                    )}
                                    <div className="text-center">
                                        <p className="text-white font-bold uppercase tracking-widest text-sm mb-1">Hover State</p>
                                        <p className="text-gray-500 text-xs">Icon when hovering links</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-black p-4 rounded-xl border border-zinc-800">
                                <div className="flex justify-between mb-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Hover Size (px)</label>
                                    <span className="text-brand-yellow font-mono text-xs">{settings.cursor_hover_size}px</span>
                                </div>
                                <input
                                    type="range"
                                    min="16"
                                    max="192"
                                    name="cursor_hover_size"
                                    value={settings.cursor_hover_size}
                                    onChange={handleChange}
                                    className="w-full accent-brand-yellow cursor-pointer"
                                />
                            </div>
                        </div>
                    </div>
                </section>


                {/* --- FOOTER SETTINGS --- */}
                <section className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl">
                    <div className="flex items-center gap-4 mb-6 border-b border-zinc-800 pb-4">
                        <Type className="text-brand-yellow w-6 h-6" />
                        <h3 className="text-xl font-bold text-white uppercase tracking-wider">Footer Settings</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Contact Info */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Email Address</label>
                            <input
                                name="footer_email"
                                value={settings.footer_email}
                                onChange={handleChange}
                                className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white placeholder:text-gray-700 focus:border-brand-yellow outline-none font-mono text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Phone Number</label>
                            <input
                                name="footer_phone"
                                value={settings.footer_phone}
                                onChange={handleChange}
                                className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white placeholder:text-gray-700 focus:border-brand-yellow outline-none font-mono text-sm"
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Address</label>
                            <textarea
                                name="footer_address"
                                value={settings.footer_address}
                                onChange={handleChange}
                                className="w-full h-24 bg-black border border-zinc-700 rounded-lg p-3 text-white placeholder:text-gray-700 focus:border-brand-yellow outline-none font-mono text-sm resize-none"
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Copyright Text</label>
                            <input
                                name="footer_copyright"
                                value={settings.footer_copyright}
                                onChange={handleChange}
                                className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white placeholder:text-gray-700 focus:border-brand-yellow outline-none font-mono text-sm"
                            />
                        </div>

                        {/* Social Links */}
                        <div className="col-span-2 mt-4">
                            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-zinc-800 pb-2">Social Media Links</h4>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Instagram URL</label>
                            <input
                                name="social_instagram"
                                value={settings.social_instagram}
                                onChange={handleChange}
                                className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white placeholder:text-gray-700 focus:border-brand-yellow outline-none text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">LinkedIn URL</label>
                            <input
                                name="social_linkedin"
                                value={settings.social_linkedin}
                                onChange={handleChange}
                                className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white placeholder:text-gray-700 focus:border-brand-yellow outline-none text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Twitter / X URL</label>
                            <input
                                name="social_twitter"
                                value={settings.social_twitter}
                                onChange={handleChange}
                                className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white placeholder:text-gray-700 focus:border-brand-yellow outline-none text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Behance URL</label>
                            <input
                                name="social_behance"
                                value={settings.social_behance}
                                onChange={handleChange}
                                className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white placeholder:text-gray-700 focus:border-brand-yellow outline-none text-sm"
                            />
                        </div>
                    </div>
                </section>

                {/* --- VIDEO SECTION --- */}
                <section className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl">
                    <div className="flex items-center gap-4 mb-6 border-b border-zinc-800 pb-4">
                        <Upload className="text-brand-yellow w-6 h-6" />
                        <h3 className="text-xl font-bold text-white uppercase tracking-wider">Feature Video</h3>
                    </div>

                    <p className="text-gray-400 mb-6 text-sm">Upload the video that appears in the "The Future Has Arrived" section.</p>

                    {settings.homepage_video_url && (
                        <div className="mb-6 aspect-video rounded-lg overflow-hidden bg-black border border-zinc-700 relative">
                            <video src={settings.homepage_video_url} className="w-full h-full object-cover" controls />
                        </div>
                    )}

                    <div className="relative">
                        <input
                            type="file"
                            accept="video/mp4,video/webm"
                            onChange={handleVideoUpload}
                            className="hidden"
                            id="video-upload"
                            disabled={uploading}
                        />
                        <label
                            htmlFor="video-upload"
                            className={`inline-flex items-center justify-center px-6 py-3 rounded-full font-bold uppercase tracking-wider cursor-pointer transition-colors ${uploading ? 'bg-zinc-700 text-gray-500 cursor-not-allowed' : 'bg-brand-yellow text-black hover:bg-white'}`}
                        >
                            {uploading ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" /> Uploading...
                                </span>
                            ) : "Upload New Video"}
                        </label>
                    </div>
                </section>

            </div >
        </div >
    );
}
