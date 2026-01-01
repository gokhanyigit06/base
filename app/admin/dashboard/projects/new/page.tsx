"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { ImagePlus, Save, Loader2, Trash2 } from "lucide-react";
import Image from "next/image";
import imageCompression from "browser-image-compression";

export default function NewProjectPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState(""); // Feedback text

    // Form State
    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        category: "",
        client: "",
        year: new Date().getFullYear().toString(),
        services: "",
        description: "",
        subheading: "",
        cover_image: "",
        is_featured: false
    });

    // Content Blocks State
    const [contentBlocks, setContentBlocks] = useState<any[]>([]);

    // Handle Image Upload
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isCover: boolean = false, blockIndex: number = -1, itemIndex: number = -1) => {
        // ... (existing logic)

        if (!e.target.files || e.target.files.length === 0) return;

        const originalFile = e.target.files[0];
        setUploading(true);
        setUploadStatus("Optimizing...");

        // Separate Logic for Images vs Videos
        let fileToUpload = originalFile;
        const isImage = originalFile.type.startsWith('image/');

        if (isImage) {
            try {
                // Compression Options
                const options = {
                    maxSizeMB: 1,           // Target max size ~1MB
                    maxWidthOrHeight: 1920, // Downscale huge images (e.g. 4k raw photos)
                    useWebWorker: true,
                    fileType: originalFile.type // Preserve type (png/jpg/webp) to match behavior
                };

                const compressedFile = await imageCompression(originalFile, options);
                fileToUpload = compressedFile;
                // console.log(`Original: ${originalFile.size / 1024 / 1024} MB, Compressed: ${compressedFile.size / 1024 / 1024} MB`);

            } catch (error) {
                console.error("Compression failed, using original file.", error);
                // Fallback to original file
            }
        }

        setUploadStatus("Uploading...");

        const fileExt = originalFile.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${fileName}`;

        try {
            const { error: uploadError } = await supabase.storage.from('project-assets').upload(filePath, fileToUpload);

            if (uploadError) throw uploadError;

            // Get Public URL
            const { data: { publicUrl } } = supabase.storage.from('project-assets').getPublicUrl(filePath);

            if (isCover) {
                setFormData({ ...formData, cover_image: publicUrl });
            } else if (blockIndex !== -1) {
                // Update Content Block
                const newBlocks = [...contentBlocks];
                if (itemIndex !== -1) {
                    // It's a row item
                    newBlocks[blockIndex].items[itemIndex].src = publicUrl;
                } else {
                    // It's a full block
                    newBlocks[blockIndex].src = publicUrl;
                }
                setContentBlocks(newBlocks);
            }

        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Error uploading image');
        } finally {
            setUploading(false);
            setUploadStatus("");
        }
    };

    // Add Content Block
    // Add Content Block
    const addBlock = (type: 'full' | 'row' | 'slider') => {
        if (type === 'full') {
            setContentBlocks([...contentBlocks, { type: 'full', mediaType: 'image', src: '', text: '' }]);
        } else if (type === 'slider') {
            setContentBlocks([...contentBlocks, { type: 'slider', items: [{ mediaType: 'image', src: '' }] }]);
        } else {
            setContentBlocks([...contentBlocks, { type: 'row', layout: '2-even', aspectRatio: 'square', items: [{ mediaType: 'image', src: '' }, { mediaType: 'image', src: '' }] }]);
        }
    };

    // Remove Block
    const removeBlock = (index: number) => {
        const newBlocks = contentBlocks.filter((_, i) => i !== index);
        setContentBlocks(newBlocks);
    };

    // Save Project
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Auto-generate slug if empty
        const finalSlug = formData.slug || formData.title.toLowerCase().replace(/ /g, '-');

        try {
            const { error } = await supabase
                .from('projects')
                .insert([
                    {
                        ...formData,
                        slug: finalSlug,
                        content: contentBlocks
                    }
                ]);

            if (error) throw error;

            alert("Project Created Successfully!");
            router.push('/admin/dashboard');

        } catch (error: any) {
            console.error('Error saving project:', error);
            alert('Error saving project: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto pb-24">
            <h1 className="text-3xl font-oswald font-bold uppercase mb-8 text-white">New Project</h1>

            <form onSubmit={handleSubmit} className="flex flex-col gap-12">

                {/* 1. Basic Info Section */}
                <div className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800 flex flex-col gap-6">
                    <h2 className="text-xl font-bold text-brand-yellow uppercase tracking-widest">Basic Information</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs uppercase text-gray-500">Project Title</label>
                            <input required type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="bg-black border border-zinc-700 p-3 rounded text-white focus:border-brand-yellow" placeholder="e.g. OneOff" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs uppercase text-gray-500">Slug (URL)</label>
                            <input type="text" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} className="bg-black border border-zinc-700 p-3 rounded text-white focus:border-brand-yellow" placeholder="e.g. one-off (optional)" />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 bg-black border border-zinc-700 p-4 rounded-lg">
                        <input
                            type="checkbox"
                            id="is_featured"
                            checked={formData.is_featured}
                            onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                            className="w-5 h-5 accent-brand-yellow cursor-pointer"
                        />
                        <label htmlFor="is_featured" className="text-white text-sm font-bold uppercase cursor-pointer select-none">
                            Feature on Homepage
                        </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs uppercase text-gray-500">Client</label>
                            <input required type="text" value={formData.client} onChange={(e) => setFormData({ ...formData, client: e.target.value })} className="bg-black border border-zinc-700 p-3 rounded text-white" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs uppercase text-gray-500">Year</label>
                            <input type="text" value={formData.year} onChange={(e) => setFormData({ ...formData, year: e.target.value })} className="bg-black border border-zinc-700 p-3 rounded text-white" />
                        </div>
                        <div className="flex flex-col gap-2 md:col-span-2">
                            <label className="text-xs uppercase text-gray-500">Category</label>
                            <input required type="text" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="bg-black border border-zinc-700 p-3 rounded text-white" placeholder="e.g. BRANDING, WEB" />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-xs uppercase text-gray-500">Services List</label>
                        <input type="text" value={formData.services} onChange={(e) => setFormData({ ...formData, services: e.target.value })} className="bg-black border border-zinc-700 p-3 rounded text-white" placeholder="e.g. Strategy, UI/UX, Development" />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-xs uppercase text-gray-500">Description</label>
                        <textarea required rows={4} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="bg-black border border-zinc-700 p-3 rounded text-white" />
                    </div>
                </div>

                {/* 2. Cover Image */}
                <div className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800 flex flex-col gap-6">
                    <h2 className="text-xl font-bold text-brand-yellow uppercase tracking-widest">Cover Image</h2>
                    <div className="flex items-center gap-6">
                        <div className="w-64 aspect-video bg-black border border-zinc-700 rounded-lg overflow-hidden flex items-center justify-center relative group">
                            {formData.cover_image ? (
                                formData.cover_image.includes('.mp4') ? (
                                    <video src={formData.cover_image} className="w-full h-full object-cover" autoPlay muted loop playsInline />
                                ) : (
                                    <Image src={formData.cover_image} alt="Cover" fill className="object-cover" />
                                )
                            ) : (
                                <span className="text-gray-600 text-xs uppercase">No Media</span>
                            )}
                            {uploading && <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-2">
                                <Loader2 className="w-6 h-6 animate-spin text-brand-yellow" />
                                <span className="text-xs text-brand-yellow font-bold uppercase tracking-widest">{uploadStatus}</span>
                            </div>}
                        </div>
                        <label className="bg-white text-black px-4 py-2 rounded cursor-pointer font-bold uppercase text-sm hover:bg-gray-200 transition-colors">
                            <input type="file" accept="image/*,video/*" className="hidden" onChange={(e) => handleImageUpload(e, true)} />
                            Upload Cover (Img/Vid)
                        </label>
                    </div>
                </div>

                {/* 3. Content Blocks Builder */}
                <div className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800 flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-brand-yellow uppercase tracking-widest">Content Blocks</h2>
                        <div className="flex gap-2">
                            <button type="button" onClick={() => addBlock('full')} className="bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-1 rounded text-xs uppercase font-bold border border-zinc-700">
                                + Full Width
                            </button>
                            <button type="button" onClick={() => addBlock('row')} className="bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-1 rounded text-xs uppercase font-bold border border-zinc-700">
                                + 2 Columns
                            </button>
                            <button type="button" onClick={() => addBlock('slider')} className="bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-1 rounded text-xs uppercase font-bold border border-zinc-700">
                                + Slider
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        {contentBlocks.map((block, index) => (
                            <div key={index} className="bg-black border border-zinc-800 p-4 rounded-xl relative group">
                                <button type="button" onClick={() => removeBlock(index)} className="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-black rounded-full p-1 border border-red-900">
                                    <Trash2 className="w-4 h-4" />
                                </button>

                                {block.type === 'full' ? (
                                    <div className="flex flex-col gap-2">
                                        <span className="text-xs text-gray-500 uppercase font-bold">Full Width Block</span>
                                        <div className="h-32 bg-zinc-900 rounded border border-zinc-800 flex items-center justify-center relative overflow-hidden">
                                            {block.src && (block.src.includes('.mp4') ? <video src={block.src} className="w-full h-full object-cover" /> : <img src={block.src} className="w-full h-full object-cover" />)}
                                            <label className="absolute inset-0 flex items-center justify-center cursor-pointer hover:bg-white/10 transition-colors">
                                                <input type="file" accept="image/*,video/*" className="hidden" onChange={(e) => handleImageUpload(e, false, index)} />
                                                {!block.src && <ImagePlus className="w-6 h-6 text-gray-500" />}
                                            </label>
                                            {uploading && !isCoverForBlock(index) && <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-2">
                                                <Loader2 className="w-6 h-6 animate-spin text-brand-yellow" />
                                                {/* Global spinner state used for simplicity, ideally local */}
                                            </div>}
                                        </div>
                                    </div>
                                ) : block.type === 'slider' ? (
                                    <div className="flex flex-col gap-4">
                                        <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                                            <span className="text-xs text-brand-yellow uppercase font-bold tracking-widest">Slider Gallery</span>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newBlocks = [...contentBlocks];
                                                    newBlocks[index].items.push({ mediaType: 'image', src: '' });
                                                    setContentBlocks(newBlocks);
                                                }}
                                                className="bg-zinc-800 hover:bg-zinc-700 text-white px-2 py-1 rounded text-[10px] uppercase font-bold border border-zinc-700"
                                            >
                                                + Add Slide
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {block.items.map((item: any, i: number) => (
                                                <div key={i} className="aspect-video bg-zinc-900 rounded border border-zinc-800 flex items-center justify-center relative overflow-hidden group/item">
                                                    {item.src && (item.src.includes('.mp4') ? <video src={item.src} className="w-full h-full object-cover" /> : <img src={item.src} className="w-full h-full object-cover" />)}
                                                    <label className="absolute inset-0 flex items-center justify-center cursor-pointer hover:bg-white/10 transition-colors">
                                                        <input type="file" accept="image/*,video/*" className="hidden" onChange={(e) => handleImageUpload(e, false, index, i)} />
                                                        {!item.src && <ImagePlus className="w-6 h-6 text-gray-500" />}
                                                    </label>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const newBlocks = [...contentBlocks];
                                                            newBlocks[index].items = newBlocks[index].items.filter((_: any, idx: number) => idx !== i);
                                                            setContentBlocks(newBlocks);
                                                        }}
                                                        className="absolute top-1 right-1 bg-black/50 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover/item:opacity-100 transition-all"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                    <span className="absolute bottom-1 right-2 text-[10px] font-mono text-white/50 bg-black/50 px-1 rounded">{i + 1}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-4">
                                        <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                                            <span className="text-xs text-gray-500 uppercase font-bold">Grid Layout</span>
                                            <div className="flex gap-2">
                                                {[
                                                    { id: '2-even', label: '2 Col' },
                                                    { id: '3-even', label: '3 Col' },
                                                    { id: '2-left', label: 'Left Wide' },
                                                    { id: '2-right', label: 'Right Wide' }
                                                ].map(layout => (
                                                    <button
                                                        key={layout.id}
                                                        type="button"
                                                        onClick={() => {
                                                            const newBlocks = [...contentBlocks];
                                                            const isThree = layout.id === '3-even';
                                                            const currentItems = newBlocks[index].items;

                                                            // Adjust items array size
                                                            let newItems = [...currentItems];
                                                            if (isThree && currentItems.length < 3) {
                                                                newItems.push({ mediaType: 'image', src: '' });
                                                            } else if (!isThree && currentItems.length > 2) {
                                                                newItems = newItems.slice(0, 2);
                                                            }

                                                            newBlocks[index] = { ...newBlocks[index], layout: layout.id, items: newItems };
                                                            setContentBlocks(newBlocks);
                                                        }}
                                                        className={`text-[10px] uppercase font-bold px-2 py-1 rounded border ${block.layout === layout.id ? 'bg-brand-yellow text-black border-brand-yellow' : 'bg-zinc-900 text-gray-400 border-zinc-700 hover:text-white'}`}
                                                    >
                                                        {layout.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Aspect Ratio Selector */}
                                        <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                                            <span className="text-xs text-gray-500 uppercase font-bold">Aspect Ratio</span>
                                            <div className="flex gap-2">
                                                {[
                                                    { id: 'square', label: '1:1' },
                                                    { id: 'portrait', label: '3:4' },
                                                    { id: 'landscape', label: '4:3' },
                                                    { id: 'video', label: '16:9' },
                                                    { id: 'tall', label: '9:16' }
                                                ].map(ratio => (
                                                    <button
                                                        key={ratio.id}
                                                        type="button"
                                                        onClick={() => {
                                                            const newBlocks = [...contentBlocks];
                                                            newBlocks[index] = { ...newBlocks[index], aspectRatio: ratio.id };
                                                            setContentBlocks(newBlocks);
                                                        }}
                                                        className={`text-[10px] uppercase font-bold px-2 py-1 rounded border ${block.aspectRatio === ratio.id ? 'bg-brand-yellow text-black border-brand-yellow' : 'bg-zinc-900 text-gray-400 border-zinc-700 hover:text-white'}`}
                                                    >
                                                        {ratio.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className={`grid gap-4 ${block.layout === '3-even' ? 'grid-cols-3' :
                                            block.layout === '2-left' ? 'grid-cols-[2fr_1fr]' :
                                                block.layout === '2-right' ? 'grid-cols-[1fr_2fr]' :
                                                    'grid-cols-2'
                                            }`}>
                                            {block.items.map((item: any, i: number) => {
                                                const aspectClass =
                                                    block.aspectRatio === 'portrait' ? 'aspect-[3/4]' :
                                                        block.aspectRatio === 'landscape' ? 'aspect-[4/3]' :
                                                            block.aspectRatio === 'video' ? 'aspect-video' :
                                                                block.aspectRatio === 'tall' ? 'aspect-[9/16]' :
                                                                    'aspect-square'; // Default

                                                return (
                                                    <div key={i} className={`w-full ${aspectClass} bg-zinc-900 rounded border border-zinc-800 flex items-center justify-center relative overflow-hidden group/item`}>
                                                        {item.src && (item.src.includes('.mp4') ? <video src={item.src} className="w-full h-full object-cover" /> : <img src={item.src} className="w-full h-full object-cover" />)}
                                                        <label className="absolute inset-0 flex items-center justify-center cursor-pointer hover:bg-white/10 transition-colors">
                                                            <input type="file" accept="image/*,video/*" className="hidden" onChange={(e) => handleImageUpload(e, false, index, i)} />
                                                            {!item.src && <ImagePlus className="w-6 h-6 text-gray-500" />}
                                                        </label>
                                                        {item.src && (
                                                            <div className="absolute top-1 right-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                                                {/* Optional clear button could go here */}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                        {contentBlocks.length === 0 && (
                            <div className="text-center py-8 text-gray-600 italic text-sm border-2 border-dashed border-zinc-800 rounded-xl">
                                No contents yet. Add blocks above.
                            </div>
                        )}
                    </div>
                </div>

                {/* Submit Action */}
                <div className="sticky bottom-6 flex justify-end">
                    <button disabled={loading} className="bg-brand-yellow text-black px-8 py-4 rounded-full font-bold uppercase tracking-widest shadow-xl hover:bg-white transition-colors flex items-center gap-2">
                        {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                        {loading ? 'Saving...' : 'Publish Project'}
                    </button>
                </div>

            </form>
        </div>
    );

    // Helper to check if global uploading spinner should show on a specific block (simplified for now to global)
    function isCoverForBlock(index: number) { return false; }
}
