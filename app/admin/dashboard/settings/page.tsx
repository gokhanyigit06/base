"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Save, Upload, Type, GripVertical } from "lucide-react";
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

        // Colors (Hex defaults matching brand colors)
        hero_accent_color: "#CCF000", // brand-yellow

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
                const newSettings: any = { ...settings };
                let loadedOrder = null;

                data.forEach((item: { key: string, value: string }) => {
                    if (Object.keys(newSettings).includes(item.key)) {
                        newSettings[item.key] = item.value;
                    }
                    if (item.key === 'hero_elements_order') {
                        try {
                            loadedOrder = JSON.parse(item.value);
                        } catch (e) {
                            console.error("Failed to parse hero order", e);
                        }
                    }
                });
                setSettings(newSettings);
                if (loadedOrder) setHeroOrder(loadedOrder);
            }
            setLoading(false);
        };
        fetchSettings();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setSettings({ ...settings, [e.target.name]: e.target.value });
    };

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
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Tagline (Small Top Text)</label>
                                                <input
                                                    name="hero_tagline"
                                                    value={settings.hero_tagline}
                                                    onChange={handleChange}
                                                    className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white placeholder:text-gray-700 focus:border-brand-yellow outline-none font-mono text-sm"
                                                />
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
                                                                className="absolute inset-0 w-[150%] h-[150%] -top-[25%] -left-[25%] cursor-pointer p-0 border-0"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {itemId === 'description' && (
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Bottom Description</label>
                                                <textarea
                                                    name="hero_description"
                                                    value={settings.hero_description}
                                                    onChange={handleChange}
                                                    className="w-full h-24 bg-black border border-zinc-700 rounded-lg p-3 text-gray-400 placeholder:text-gray-700 focus:border-brand-yellow outline-none font-mono text-sm resize-none"
                                                />
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

            </div>
        </div>
    );
}
