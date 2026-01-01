"use client";

import { useState, useEffect } from "react";
import { Loader2, Sparkles, Image as ImageIcon, Download, Video, Film, Info } from "lucide-react";
import { generateImage, generateVideo } from "./actions";

// Tabs for the Studio
type StudioTab = "image" | "video";

export default function OfficePanel() {
    const [activeTab, setActiveTab] = useState<StudioTab>("image");

    // --- SHARED STATE ---
    const [prompt, setPrompt] = useState("");
    const [loading, setLoading] = useState(false);
    const [cost, setCost] = useState(0);

    // --- IMAGE STATE ---
    const [negativePrompt, setNegativePrompt] = useState("");
    const [aspectRatio, setAspectRatio] = useState("16:9");
    const [style, setStyle] = useState("photorealistic");
    const [refImage, setRefImage] = useState<string | null>(null);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);

    // --- VIDEO STATE ---
    const [duration, setDuration] = useState("4"); // 4 seconds (standard for short clips)
    const [fps, setFps] = useState("24");
    const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);

    // --- COST ESTIMATION ---
    useEffect(() => {
        // Approximate costs for Google Vertex AI (Imagen)
        if (activeTab === "image") {
            setCost(0.03); // ~$0.03 per image
        } else {
            // ~$0.10 - $0.20 per second is a safe estimate for high quality video gen
            setCost(Number(duration) * 0.15);
        }
    }, [activeTab, duration]);


    const handleGenerate = async () => {
        if (!prompt.trim()) return;

        setLoading(true);
        setGeneratedImage(null);
        setGeneratedVideo(null);

        try {
            if (activeTab === "image") {
                const formData = {
                    prompt,
                    negativePrompt,
                    aspectRatio,
                    style,
                    refImage
                };
                const resultUrl = await generateImage(formData);
                setGeneratedImage(resultUrl);
            } else {
                const formData = {
                    prompt,
                    duration: Number(duration),
                    fps: Number(fps),
                    aspectRatio
                };
                const resultUrl = await generateVideo(formData);
                setGeneratedVideo(resultUrl);
            }
        } catch (error) {
            console.error(error);
            alert("Oluşturma hatası: " + (error as any).message);
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setRefImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <main className="min-h-screen bg-black text-white flex flex-col md:flex-row font-sans overflow-hidden">

            {/* Sidebar Controls */}
            <aside className="w-full md:w-[420px] border-r border-zinc-800 flex flex-col h-screen bg-zinc-900/50 backdrop-blur-xl z-20 shadow-2xl">

                {/* Header & Tabs */}
                <div className="p-6 pb-0 flex flex-col gap-6">
                    <div className="flex items-center gap-3 text-brand-yellow">
                        <Sparkles className="w-6 h-6" />
                        <h1 className="text-2xl font-oswald font-bold uppercase">Base Studio</h1>
                    </div>

                    {/* Tab Switcher */}
                    <div className="grid grid-cols-2 bg-black rounded-lg p-1 border border-zinc-800">
                        <button
                            onClick={() => setActiveTab("image")}
                            className={`flex items-center justify-center gap-2 py-3 rounded-md text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'image' ? 'bg-zinc-800 text-white shadow-md' : 'text-gray-500 hover:text-white'}`}
                        >
                            <ImageIcon className="w-4 h-4" /> Image
                        </button>
                        <button
                            onClick={() => setActiveTab("video")}
                            className={`flex items-center justify-center gap-2 py-3 rounded-md text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'video' ? 'bg-zinc-800 text-white shadow-md' : 'text-gray-500 hover:text-white'}`}
                        >
                            <Video className="w-4 h-4" /> Video
                        </button>
                    </div>
                </div>

                {/* Scrollable Form Area */}
                <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar">

                    {/* --- COMMON: PROMPT --- */}
                    <div className="flex flex-col gap-3">
                        <div className="flex justify-between items-center">
                            <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Prompt</label>
                            <span className="text-[10px] text-gray-600 bg-black px-2 py-1 rounded border border-zinc-800">Vertex AI {activeTab === 'image' ? 'Imagen 3' : 'Imagen 2 Video'}</span>
                        </div>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder={activeTab === 'image'
                                ? "A futuristic branding agency office, neon lights, dark mode..."
                                : "Cinematic drone shot of a futuristic city flight, sunset, 4k..."}
                            className="w-full h-32 bg-black border border-zinc-700 rounded-xl p-4 text-white placeholder:text-gray-700 focus:border-brand-yellow outline-none resize-none text-sm transition-colors"
                        />
                    </div>

                    {/* --- IMAGE SPECIFIC --- */}
                    {activeTab === 'image' && (
                        <>
                            <div className="flex flex-col gap-3">
                                <label className="text-xs font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
                                    Negative Prompt <span className="text-[10px] bg-zinc-800 px-2 py-0.5 rounded text-gray-400">Optional</span>
                                </label>
                                <input
                                    value={negativePrompt}
                                    onChange={(e) => setNegativePrompt(e.target.value)}
                                    placeholder="blur, distortion, low quality, watermark..."
                                    className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white placeholder:text-gray-700 focus:border-brand-yellow outline-none text-sm"
                                />
                            </div>

                            <div className="flex flex-col gap-3">
                                <label className="text-xs font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
                                    Reference Image <span className="text-[10px] bg-zinc-800 px-2 py-0.5 rounded text-gray-400">Img2Img</span>
                                </label>
                                <div className="relative">
                                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="ref-image-upload" />
                                    <label htmlFor="ref-image-upload" className="w-full h-24 bg-black border border-dashed border-zinc-700 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-900 transition-colors relative overflow-hidden group">
                                        {refImage ? (
                                            <>
                                                <img src={refImage} alt="Ref" className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
                                                <div className="absolute inset-0 flex items-center justify-center"><span className="bg-black/80 px-2 py-1 rounded text-[10px] font-bold uppercase">Change</span></div>
                                            </>
                                        ) : (
                                            <>
                                                <ImageIcon className="w-6 h-6 text-gray-500 mb-2" />
                                                <span className="text-xs text-gray-600 uppercase font-bold">Upload</span>
                                            </>
                                        )}
                                    </label>
                                    {refImage && <button onClick={(e) => { e.preventDefault(); setRefImage(null); }} className="text-[10px] text-red-500 underline mt-1 text-right block w-full">Remove</button>}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Aspect Ratio</label>
                                    <select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)} className="bg-black border border-zinc-700 rounded-lg p-3 text-sm text-white focus:border-brand-yellow outline-none cursor-pointer">
                                        <option value="1:1">1:1 (Square)</option>
                                        <option value="16:9">16:9 (Landscape)</option>
                                        <option value="9:16">9:16 (Portrait)</option>
                                        <option value="4:3">4:3 (Standard)</option>
                                        <option value="3:4">3:4 (Vertical)</option>
                                    </select>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Style</label>
                                    <select value={style} onChange={(e) => setStyle(e.target.value)} className="bg-black border border-zinc-700 rounded-lg p-3 text-sm text-white focus:border-brand-yellow outline-none cursor-pointer">
                                        <option value="photorealistic">Cinematic / Real</option>
                                        <option value="digital-art">3D Render</option>
                                        <option value="anime">Illustration</option>
                                        <option value="minimalist">Minimalist</option>
                                    </select>
                                </div>
                            </div>
                        </>
                    )}

                    {/* --- VIDEO SPECIFIC --- */}
                    {activeTab === 'video' && (
                        <>
                            <div className="p-4 bg-blue-900/20 border border-blue-500/20 rounded-lg flex gap-3 items-start">
                                <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                                <p className="text-xs text-blue-200 leading-relaxed">
                                    Video generation takes significantly longer (approx 1-2 mins). Please be patient while the AI renders your clip.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Duration</label>
                                    <select value={duration} onChange={(e) => setDuration(e.target.value)} className="bg-black border border-zinc-700 rounded-lg p-3 text-sm text-white focus:border-brand-yellow outline-none cursor-pointer">
                                        <option value="4">4 Seconds (Standard)</option>
                                        <option value="8">8 Seconds (Extended)</option>
                                    </select>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-gray-500">FPS</label>
                                    <select value={fps} onChange={(e) => setFps(e.target.value)} className="bg-black border border-zinc-700 rounded-lg p-3 text-sm text-white focus:border-brand-yellow outline-none cursor-pointer">
                                        <option value="24">24 FPS (Cinematic)</option>
                                        <option value="30">30 FPS (TV)</option>
                                    </select>
                                </div>
                            </div>
                        </>
                    )}

                </div>

                {/* Footer / Cost / Action */}
                <div className="p-6 pt-0 mt-auto bg-zinc-900/50 backdrop-blur-md border-t border-zinc-800">
                    <div className="flex justify-between items-center mb-4 text-xs font-mono text-gray-400">
                        <span>Est. Cost:</span>
                        <span className="text-white font-bold text-lg">${cost.toFixed(2)}</span>
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={loading || !prompt.trim()}
                        className="w-full bg-brand-yellow text-black py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-white transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
                    >
                        {loading && <div className="absolute inset-0 bg-white/20 animate-pulse" />}
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            activeTab === 'image' ? <Sparkles className="w-5 h-5" /> : <Film className="w-5 h-5" />
                        )}
                        <span>{loading ? (activeTab === 'image' ? 'Generating Image...' : 'Rendering Video...') : (activeTab === 'image' ? 'Generate Image' : 'Render Video')}</span>
                    </button>
                    {loading && activeTab === 'video' && <p className="text-[10px] text-center text-gray-500 mt-2 animate-pulse">This might take a while...</p>}
                </div>
            </aside>

            {/* Main Preview Area */}
            <main className="flex-1 flex flex-col items-center justify-center relative bg-black">
                {/* Background Grid Pattern */}
                <div className="absolute inset-0 z-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

                {/* --- DISPLAY CONTENT --- */}
                <div className="relative z-10 w-full h-full flex items-center justify-center p-8 md:p-12">

                    {/* Placeholder State */}
                    {!generatedImage && !generatedVideo && !loading && (
                        <div className="text-center opacity-30 flex flex-col items-center gap-4">
                            <div className="w-24 h-24 rounded-full border-2 border-dashed border-white/50 flex items-center justify-center">
                                <Sparkles className="w-10 h-10" />
                            </div>
                            <h2 className="text-3xl font-oswald font-bold uppercase tracking-widest">Base Studio AI</h2>
                            <p className="font-mono text-sm max-w-md">Select your medium, configure your parameters, and let Vertex AI generate professional assets.</p>
                        </div>
                    )}

                    {/* Image Result */}
                    {generatedImage && activeTab === 'image' && !loading && (
                        <div className="relative max-w-full max-h-full rounded-2xl overflow-hidden shadow-2xl border border-zinc-800 animate-in zoom-in-95 duration-500 group">
                            <img src={generatedImage} alt={prompt} className="max-h-[85vh] w-auto object-contain bg-zinc-900" />
                            <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => window.open(generatedImage, '_blank')} className="bg-white text-black px-6 py-3 rounded-full font-bold uppercase flex items-center gap-2 hover:bg-brand-yellow scale-90 hover:scale-100 transition-all shadow-xl">
                                    <Download className="w-5 h-5" /> Download Asset
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Video Result */}
                    {generatedVideo && activeTab === 'video' && !loading && (
                        <div className="relative max-w-full max-h-full rounded-2xl overflow-hidden shadow-2xl border border-zinc-800 animate-in zoom-in-95 duration-500 group">
                            <video src={generatedVideo} controls autoPlay loop className="max-h-[85vh] w-auto object-contain bg-zinc-900" />
                            <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => window.open(generatedVideo, '_blank')} className="bg-white text-black px-6 py-3 rounded-full font-bold uppercase flex items-center gap-2 hover:bg-brand-yellow scale-90 hover:scale-100 transition-all shadow-xl">
                                    <Download className="w-5 h-5" /> Download Clip
                                </button>
                            </div>
                        </div>
                    )}
                </div>

            </main>
        </main>
    );
}
