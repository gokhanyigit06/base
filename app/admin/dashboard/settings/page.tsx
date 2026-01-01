"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";
import imageCompression from "browser-image-compression";

export default function HomepageSettingsPage() {
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [videoUrl, setVideoUrl] = useState("");
    const [currentUrl, setCurrentUrl] = useState("");

    // Fetch current setting
    useEffect(() => {
        const fetchSettings = async () => {
            const { data } = await supabase
                .from('site_settings')
                .select('value')
                .eq('key', 'homepage_video_url')
                .single();

            if (data?.value) {
                setVideoUrl(data.value);
                setCurrentUrl(data.value);
            }
            setLoading(false);
        };
        fetchSettings();
    }, []);

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

            // Save to DB
            const { error: dbError } = await supabase
                .from('site_settings')
                .upsert({ key: 'homepage_video_url', value: publicUrl }, { onConflict: 'key' });

            if (dbError) throw dbError;

            setVideoUrl(publicUrl);
            setCurrentUrl(publicUrl);
            alert("Video updated successfully!");

        } catch (error: any) {
            console.error(error);
            alert(`Error uploading video: ${error.message || error.error_description || "Unknown error"}`);
        } finally {
            setUploading(false);
        }
    };

    if (loading) return <div className="p-12"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="max-w-2xl">
            <h1 className="text-4xl font-bold font-oswald uppercase text-white mb-8">Homepage Settings</h1>

            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl">
                <h3 className="text-xl font-bold text-white mb-4">Feature Video</h3>
                <p className="text-gray-400 mb-6 text-sm">Upload the video that appears in the "The Future Has Arrived" section.</p>

                {currentUrl && (
                    <div className="mb-6 aspect-video rounded-lg overflow-hidden bg-black border border-zinc-700 relative">
                        <video src={currentUrl} className="w-full h-full object-cover" controls />
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
            </div>
        </div>
    );
}
