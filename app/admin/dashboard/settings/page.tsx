"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, Save, Upload, Type } from "lucide-react";

export default function SettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

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
                data.forEach((item: { key: string, value: string }) => {
                    if (Object.keys(newSettings).includes(item.key)) {
                        newSettings[item.key] = item.value;
                    }
                });
                setSettings(newSettings);
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Top Tagline */}
                        <div className="col-span-2">
                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Tagline (Small Top Text)</label>
                            <input
                                name="hero_tagline"
                                value={settings.hero_tagline}
                                onChange={handleChange}
                                className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white placeholder:text-gray-700 focus:border-brand-yellow outline-none font-mono text-sm"
                            />
                        </div>

                        {/* Main Headline Parts */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Headline Part 1 (Block)</label>
                            <input
                                name="hero_headline_start"
                                value={settings.hero_headline_start}
                                onChange={handleChange}
                                className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white placeholder:text-gray-700 focus:border-brand-yellow outline-none font-oswald font-bold uppercase text-lg"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Headline Part 3 (Block)</label>
                            <input
                                name="hero_headline_end"
                                value={settings.hero_headline_end}
                                onChange={handleChange}
                                className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white placeholder:text-gray-700 focus:border-brand-yellow outline-none font-oswald font-bold uppercase text-lg"
                            />
                        </div>

                        {/* Accent Word & Color */}
                        <div className="col-span-2 grid grid-cols-1 md:grid-cols-[1fr_100px] gap-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Accent Word (Script Font)</label>
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

                        {/* Description */}
                        <div className="col-span-2">
                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Bottom Description</label>
                            <textarea
                                name="hero_description"
                                value={settings.hero_description}
                                onChange={handleChange}
                                className="w-full h-24 bg-black border border-zinc-700 rounded-lg p-3 text-gray-400 placeholder:text-gray-700 focus:border-brand-yellow outline-none font-mono text-sm resize-none"
                            />
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

            </div>
        </div>
    );
}
