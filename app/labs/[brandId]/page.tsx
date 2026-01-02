"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
    ArrowLeft, Calendar as CalendarIcon, Image as ImageIcon,
    MoreHorizontal, Clock, CheckCircle, Smartphone, Layout,
    Plus, Settings, GripVertical, Trash2, X, Sparkles, Loader2, Upload, Rocket
} from "lucide-react";
import Link from "next/link";
import {
    DndContext, DragOverlay, closestCorners, KeyboardSensor,
    PointerSensor, useSensor, useSensors, DragStartEvent, DragEndEvent,
    useDraggable, useDroppable
} from "@dnd-kit/core";

// --- TYPES ---
interface Post {
    id: string;
    type: 'post' | 'story';
    content_text: string;
    media_url: string | null;
    scheduled_at: string | null;
    status: 'draft' | 'scheduled' | 'published';
}

interface Brand {
    id: string;
    name: string;
}

const DEFAULT_SLOTS = ['09:00', '13:00', '18:00', '21:00'];

// Helper to get next N days
const getNextDays = (count: number = 30) => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < count; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        days.push(date);
    }
    return days;
};

// --- COMPONENTS ---

// 1. Draggable Post Card
function PostCard({
    post,
    isOverlay = false,
    onClick,
    isSelectionMode,
    isSelected,
    onToggleSelect
}: {
    post: Post,
    isOverlay?: boolean,
    onClick?: () => void,
    isSelectionMode?: boolean,
    isSelected?: boolean,
    onToggleSelect?: (id: string) => void
}) {
    // Disable drag if published or selecting
    const isDraggable = !isSelectionMode && post.status !== 'published';

    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: post.id,
        data: { post },
        disabled: !isDraggable
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined;

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isSelectionMode && onToggleSelect) {
            onToggleSelect(post.id);
        } else if (onClick) {
            onClick();
        }
    };

    const isPublished = post.status === 'published';

    return (
        <div
            ref={setNodeRef}
            style={style}
            onClick={handleClick}
            className={`
                bg-zinc-900 border rounded-lg p-2 shadow-lg group relative transition-all
                ${isOverlay ? 'border-blue-500 shadow-blue-500/20 rotate-3 z-50 w-48' : ''}
                ${isSelected ? 'border-blue-500 bg-blue-900/10 ring-1 ring-blue-500' :
                    isPublished ? 'border-green-500/50 bg-green-900/10' : 'border-zinc-700 hover:border-zinc-500'}
                ${isSelectionMode || isPublished ? '' : 'cursor-grab active:cursor-grabbing'}
            `}
        >
            {/* Selection Checkbox */}
            {isSelectionMode && (
                <div className="absolute top-2 left-2 z-20 pointer-events-none">
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-blue-500 border-blue-500' : 'bg-black/50 border-white/50'}`}>
                        {isSelected && <CheckCircle className="w-3 h-3 text-white" />}
                    </div>
                </div>
            )}

            {/* Published Badge */}
            {isPublished && (
                <div className="absolute top-2 left-2 z-20 pointer-events-none bg-green-500 text-black text-[10px] font-bold px-1.5 py-0.5 rounded">
                    PUBLISHED
                </div>
            )}

            {/* Drag Handle (Only show if draggable) */}
            {isDraggable && (
                <div {...listeners} {...attributes} className="absolute top-2 right-2 p-1 hover:bg-zinc-800 rounded z-10">
                    <GripVertical className="w-4 h-4 text-zinc-500" />
                </div>
            )}

            {/* Content Area */}
            <div className={isSelectionMode ? 'pointer-events-none' : 'cursor-pointer'}>
                {post.media_url ? (
                    <div className="aspect-square w-full bg-zinc-800 rounded mb-2 overflow-hidden relative">
                        <img src={post.media_url} alt="media" className={`object-cover w-full h-full transition-opacity ${isPublished ? 'opacity-70 grayscale' : 'hover:opacity-90'}`} />
                        <div className={`absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold ${post.type === 'story' ? 'bg-purple-900/80 text-purple-200' : 'bg-blue-900/80 text-blue-200'
                            }`}>
                            {post.type}
                        </div>
                    </div>
                ) : (
                    <div className="h-24 bg-zinc-800 rounded mb-2 flex items-center justify-center text-zinc-600">
                        <ImageIcon className="w-6 h-6" />
                    </div>
                )}

                <p className="text-[10px] text-zinc-400 line-clamp-2 px-1">
                    {post.content_text || "Add caption..."}
                </p>
            </div>
        </div>
    );
}

// 2. Droppable Calendar Slot
function CalendarSlot({ date, time, children }: { date: Date, time: string, children: React.ReactNode }) {
    const dateStr = date.toISOString().split('T')[0];
    const slotId = `${dateStr}_${time}`;

    const { setNodeRef, isOver } = useDroppable({
        id: slotId,
        data: { date: dateStr, time }
    });

    return (
        <div
            ref={setNodeRef}
            className={`
                h-32 border border-zinc-800/50 rounded-lg p-2 transition-all overflow-y-auto scrollbar-hide
                ${isOver ? 'bg-blue-500/10 border-blue-500/30 ring-1 ring-blue-500/30' : 'bg-black'}
            `}
        >
            {children}
        </div>
    );
}

// 3. Edit Modal
function EditModal({ post, isOpen, onClose, onSave, onDelete, onPublish, brandName }: {
    post: Post | null,
    isOpen: boolean,
    onClose: () => void,
    onSave: (id: string, updates: Partial<Post>) => void,
    onDelete: (id: string) => void,
    onPublish: (id: string) => void,
    brandName: string
}) {
    const [caption, setCaption] = useState(post?.content_text || "");
    const [type, setType] = useState<'post' | 'story'>(post?.type || 'post');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);

    useEffect(() => {
        if (post) {
            setCaption(post.content_text || "");
            setType(post.type);
        }
    }, [post]);

    if (!isOpen || !post) return null;

    const handleAiGenerate = async () => {
        setIsGenerating(true);
        try {
            const response = await fetch('/api/ai/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    brandName: brandName,
                    topic: "Generate a creative caption for this image", // Ideally pass image description
                    type: type
                })
            });
            const data = await response.json();
            if (data.caption) setCaption(data.caption);
        } catch (e) {
            alert("AI generation failed");
        } finally {
            setIsGenerating(false);
        }
    };

    const handlePublishClick = async () => {
        if (!confirm("Are you sure you want to publish this post immediately?")) return;
        setIsPublishing(true);
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        onPublish(post.id);
        setIsPublishing(false);
        onClose();
    };

    const isPublished = post.status === 'published';

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-zinc-900 border border-zinc-700 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]" onClick={e => e.stopPropagation()}>

                {/* Media Preview */}
                <div className="w-full md:w-1/2 bg-black flex items-center justify-center p-4 border-b md:border-b-0 md:border-r border-zinc-800 relative">
                    {post.media_url ? (
                        <img src={post.media_url} alt="preview" className={`max-h-[60vh] object-contain rounded-lg ${isPublished ? 'grayscale opacity-70' : ''}`} />
                    ) : (
                        <div className="text-zinc-600 flex flex-col items-center">
                            <ImageIcon className="w-12 h-12 mb-2" />
                            <span className="text-sm">No Media</span>
                        </div>
                    )}
                    {isPublished && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                            <div className="bg-green-500 text-black font-bold px-4 py-2 rounded-lg shadow-xl text-xl rotate-[-10deg] border-2 border-white/20">
                                PUBLISHED
                            </div>
                        </div>
                    )}
                </div>

                {/* Edit Controls */}
                <div className="w-full md:w-1/2 p-6 flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-lg">Edit Post Details</h3>
                        <button onClick={onClose}><X className="w-5 h-5 text-zinc-500 hover:text-white" /></button>
                    </div>

                    {!isPublished ? (
                        <>
                            <div className="flex gap-2 mb-6">
                                <button onClick={() => setType('post')} className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${type === 'post' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>Post</button>
                                <button onClick={() => setType('story')} className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${type === 'story' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>Story</button>
                            </div>

                            <div className="flex-1 mb-6 relative">
                                <label className="text-xs font-mono text-zinc-500 uppercase block mb-2">Caption</label>
                                <textarea
                                    value={caption}
                                    onChange={(e) => setCaption(e.target.value)}
                                    className="w-full h-40 bg-black border border-zinc-800 rounded-xl p-4 text-sm focus:outline-none focus:border-blue-500 resize-none"
                                    placeholder="Write a caption..."
                                />
                                <button
                                    onClick={handleAiGenerate}
                                    className="absolute bottom-4 right-4 text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 bg-indigo-500/10 px-3 py-1.5 rounded-full border border-indigo-500/20"
                                >
                                    {isGenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                                    AI Magic
                                </button>
                            </div>

                            <div className="flex gap-3 mt-auto flex-col sm:flex-row">
                                <div className="flex gap-3 w-full">
                                    <button
                                        onClick={() => onDelete(post.id)}
                                        className="p-3 rounded-xl border border-red-900/30 text-red-500 hover:bg-red-900/20 transition-colors"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => {
                                            onSave(post.id, { content_text: caption, type: type });
                                            onClose();
                                        }}
                                        className="flex-1 bg-zinc-800 text-white font-bold rounded-xl hover:bg-zinc-700 transition-colors text-sm"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                                <button
                                    onClick={handlePublishClick}
                                    disabled={isPublishing}
                                    className="w-full sm:w-auto px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                                >
                                    {isPublishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
                                    Publish Now
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-4">
                            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-2">
                                <CheckCircle className="w-8 h-8 text-green-500" />
                            </div>
                            <div>
                                <h4 className="text-xl font-bold text-white mb-2">Published!</h4>
                                <p className="text-zinc-500 text-sm">This post has been successfully published.</p>
                            </div>
                            <div className="w-full bg-zinc-900/50 rounded-lg p-4 text-left border border-zinc-800 mt-4">
                                <p className="text-xs text-zinc-500 mb-1">Caption</p>
                                <p className="text-sm text-zinc-300 line-clamp-4">{post.content_text}</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="mt-auto px-6 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700"
                            >
                                Close
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// 4. Time Slot Manager Modal
function TimeSlotManager({
    isOpen,
    onClose,
    slots,
    onAdd,
    onRemove
}: {
    isOpen: boolean;
    onClose: () => void;
    slots: string[];
    onAdd: (time: string) => void;
    onRemove: (time: string) => void;
}) {
    const [newTime, setNewTime] = useState("");

    if (!isOpen) return null;

    const handleAdd = () => {
        if (!newTime) return;
        onAdd(newTime);
        setNewTime("");
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-zinc-900 border border-zinc-700 w-full max-w-sm rounded-2xl p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-lg">Manage Time Slots</h3>
                    <button onClick={onClose}><X className="w-5 h-5 text-zinc-500 hover:text-white" /></button>
                </div>

                <div className="flex gap-2 mb-6">
                    <input
                        type="time"
                        value={newTime}
                        onChange={(e) => setNewTime(e.target.value)}
                        className="flex-1 bg-black border border-zinc-800 rounded-lg px-3 text-sm focus:outline-none focus:border-blue-500"
                    />
                    <button
                        onClick={handleAdd}
                        disabled={!newTime}
                        className="px-4 py-2 bg-white text-black font-bold rounded-lg text-sm hover:bg-zinc-200 disabled:opacity-50"
                    >
                        Add
                    </button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                    {slots.sort().map(slot => (
                        <div key={slot} className="flex items-center justify-between p-3 bg-black/50 rounded-lg border border-zinc-800/50">
                            <span className="font-mono text-sm">{slot}</span>
                            <button
                                onClick={() => onRemove(slot)}
                                className="text-zinc-500 hover:text-red-500 transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                    {slots.length === 0 && <p className="text-zinc-500 text-xs text-center">No slots defined.</p>}
                </div>
            </div>
        </div>
    );
}

// --- MAIN PAGE ---
export default function VisualPlannerPage() {
    const params = useParams();
    const brandId = params.brandId as string;
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Data State
    const [brand, setBrand] = useState<Brand | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);

    // UI State
    const [activeDragId, setActiveDragId] = useState<string | null>(null);
    const [activePost, setActivePost] = useState<Post | null>(null);
    const [editingPost, setEditingPost] = useState<Post | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [timeSlots, setTimeSlots] = useState<string[]>(DEFAULT_SLOTS);
    const [isSlotManagerOpen, setIsSlotManagerOpen] = useState(false);

    // NEW STATES
    const [viewMode, setViewMode] = useState<'all' | 'post' | 'story'>('all');
    const [uploadType, setUploadType] = useState<'post' | 'story'>('post');

    // SELECTION STATE
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedPostIds, setSelectedPostIds] = useState<Set<string>>(new Set());

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor)
    );

    const periodDays = getNextDays(30); // 30 Days View

    useEffect(() => {
        if (brandId) {
            fetchBrand();
            fetchPosts();
        }
    }, [brandId]);

    const fetchBrand = async () => {
        const { data } = await supabase.from('brands').select('*').eq('id', brandId).single();
        if (data) setBrand(data);
    };

    const fetchPosts = async () => {
        const { data } = await supabase.from('scheduled_posts').select('*').eq('brand_id', brandId);
        if (data) setPosts(data);
    };

    // --- ACTIONS ---

    // 1. Handle File Upload
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;
        setIsUploading(true);

        const files = Array.from(e.target.files);
        const newPosts: Post[] = [];

        for (const file of files) {
            try {
                // Upload to Supabase Storage
                const fileExt = file.name.split('.').pop();
                const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
                const filePath = `${brandId}/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('labs_media')
                    .upload(filePath, file);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('labs_media')
                    .getPublicUrl(filePath);

                // Create Draft in DB (Using selected uploadType)
                const { data: postData, error: dbError } = await supabase
                    .from('scheduled_posts')
                    .insert([{
                        brand_id: brandId,
                        type: uploadType, // Uses the selected type from UI
                        content_text: '',
                        media_url: publicUrl,
                        status: 'draft',
                        scheduled_at: new Date().toISOString()
                    }])
                    .select()
                    .single();

                if (dbError) throw dbError;
                if (postData) newPosts.push(postData);

            } catch (error: any) {
                console.error("Upload failed for file:", file.name, error);
                alert(`Failed to upload ${file.name}: ${error.message}`);
            }
        }

        if (newPosts.length > 0) {
            setPosts(prev => [...prev, ...newPosts]);
        }
        setIsUploading(false);
        // Reset input
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    // 2. Delete Single Post
    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this post?")) return;

        const { error } = await supabase.from('scheduled_posts').delete().eq('id', id);
        if (!error) {
            setPosts(prev => prev.filter(p => p.id !== id));
            setEditingPost(null);
        } else {
            alert("Delete failed");
        }
    };

    // 3. Clear All Drafts
    const handleClearDrafts = async () => {
        if (!drafts.length) return;
        if (!confirm(`Are you sure you want to delete all ${drafts.length} drafts? This cannot be undone.`)) return;

        try {
            const draftIds = drafts.map(d => d.id);
            const { error } = await supabase
                .from('scheduled_posts')
                .delete()
                .in('id', draftIds);

            if (error) throw error;
            setPosts(prev => prev.filter(p => !draftIds.includes(p.id)));
        } catch (error) {
            console.error("Failed to clear drafts", error);
            alert("Failed to clear drafts");
        }
    };

    // 3. Update Post (Caption/Type)
    const handleUpdate = async (id: string, updates: Partial<Post>) => {
        const { error } = await supabase
            .from('scheduled_posts')
            .update(updates)
            .eq('id', id);

        if (!error) {
            setPosts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
        }
    };

    const handleBulkDelete = async () => {
        if (selectedPostIds.size === 0) return;
        if (!confirm(`Delete ${selectedPostIds.size} selected items?`)) return;

        const ids = Array.from(selectedPostIds);
        const { error } = await supabase.from('scheduled_posts').delete().in('id', ids);

        if (!error) {
            setPosts(prev => prev.filter(p => !selectedPostIds.has(p.id)));
            setSelectedPostIds(new Set());
            setIsSelectionMode(false);
        } else {
            alert("Bulk delete failed");
        }
    };

    const toggleSelection = (id: string) => {
        const newSet = new Set(selectedPostIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedPostIds(newSet);
    };

    // 5. Handle Manual Publish (REAL API)
    const handlePublish = async (id: string) => {
        const post = posts.find(p => p.id === id);
        if (!post || !post.media_url) {
            alert("No media to publish");
            return;
        }

        try {
            // 1. Call our Next.js API Proxy asking for Specific Brand Credentials
            const response = await fetch('/api/instagram/publish', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    imageUrl: post.media_url,
                    caption: post.content_text || '',
                    brandId: brandId // Pass the brand ID to fetch correct tokens
                })
            });

            const data = await response.json();

            if (!response.ok) {
                alert(`Publish Failed: ${data.error}`);
                return;
            }

            // 2. If successful, update DB status
            const { error } = await supabase
                .from('scheduled_posts')
                .update({ status: 'published' }) // Store real IG ID if needed later: instagram_id: data.id 
                .eq('id', id);

            if (!error) {
                setPosts(prev => prev.map(p => p.id === id ? { ...p, status: 'published' } : p));
                alert("Published Successfully! 🚀");
            } else {
                alert("Published on IG but failed to update DB status");
            }

        } catch (e) {
            alert("Network error during publishing");
        }
    };

    // 4. Handle Drag End
    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveDragId(null);
        setActivePost(null);

        if (!over) return;

        const postId = active.id as string;
        const post = posts.find(p => p.id === postId);
        if (!post) return;

        // CASE 1: Dropped back to Draft Pool
        if (over.id === 'draft-pool') {
            const updatedPosts = posts.map(p =>
                p.id === postId ? { ...p, status: 'draft' as const } : p
            );
            setPosts(updatedPosts);

            await supabase
                .from('scheduled_posts')
                .update({ status: 'draft' }) // Keep scheduled_at as is or set new date? Usually keep history or reset. Let's keep it but status rules.
                .eq('id', postId);
            return;
        }

        // CASE 2: Dropped into a Calendar Slot
        const slotId = over.id as string;
        const [dateStr, timeStr] = slotId.split('_');
        if (!dateStr || !timeStr) return;

        const newScheduledAt = new Date(`${dateStr}T${timeStr}:00`).toISOString();

        // Optimistic Update
        const updatedPosts = posts.map(p =>
            p.id === postId ? { ...p, status: 'scheduled' as const, scheduled_at: newScheduledAt } : p
        );
        setPosts(updatedPosts);

        // DB Update
        await supabase
            .from('scheduled_posts')
            .update({ status: 'scheduled', scheduled_at: newScheduledAt })
            .eq('id', postId);
    };

    const handleDragStart = (event: DragStartEvent) => {
        setActiveDragId(event.active.id as string);
        const post = posts.find(p => p.id === event.active.id);
        if (post) setActivePost(post);
    };

    // Slot Management
    const addSlot = (time: string) => {
        if (!timeSlots.includes(time)) setTimeSlots(prev => [...prev, time].sort());
    };
    const removeSlot = (time: string) => {
        setTimeSlots(prev => prev.filter(t => t !== time));
    };

    // DRAG POOL DROP ZONE
    function DraftPoolDroppable({ children }: { children: React.ReactNode }) {
        const { setNodeRef, isOver } = useDroppable({
            id: 'draft-pool',
        });

        return (
            <div ref={setNodeRef} className={`flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin scrollbar-thumb-zinc-800 transition-colors ${isOver ? 'bg-blue-900/10' : ''}`}>
                {children}
            </div>
        )
    }

    if (!brand) return <div className="min-h-screen bg-black text-zinc-500 flex items-center justify-center">Loading Planner...</div>;

    // Filter Logic based on ViewMode
    const filteredPosts = viewMode === 'all'
        ? posts
        : posts.filter(p => p.type === viewMode);

    const drafts = filteredPosts.filter(p => p.status === 'draft');

    // Grid Mapping
    const scheduledMap = new Map<string, Post[]>();
    filteredPosts.filter(p => p.status === 'scheduled').forEach(p => {
        if (!p.scheduled_at) return;
        const date = new Date(p.scheduled_at);
        const dateStr = date.toISOString().split('T')[0];
        const hour = date.getHours().toString().padStart(2, '0') + ":" + date.getMinutes().toString().padStart(2, '0');
        const key = `${dateStr}_${hour}`;
        if (!scheduledMap.has(key)) scheduledMap.set(key, []);
        scheduledMap.get(key)?.push(p);
    });

    // Dynamic Width: 30 days * ~140px per day + 80px label column
    const gridWidth = (periodDays.length * 150) + 80;

    return (
        <main className="min-h-screen bg-black text-white font-sans overflow-hidden flex flex-col relative">
            <EditModal
                post={editingPost}
                isOpen={!!editingPost}
                onClose={() => setEditingPost(null)}
                onSave={handleUpdate}
                onDelete={handleDelete}
                onPublish={handlePublish}
                brandName={brand.name}
            />

            <TimeSlotManager
                isOpen={isSlotManagerOpen}
                onClose={() => setIsSlotManagerOpen(false)}
                slots={timeSlots}
                onAdd={addSlot}
                onRemove={removeSlot}
            />

            {/* Header */}
            <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-6 bg-black z-20">
                <div className="flex items-center gap-4">
                    <Link href="/labs" className="p-2 hover:bg-zinc-900 rounded-full text-zinc-500 hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="font-bold text-lg hidden md:block">{brand.name}</h1>

                    {/* View Mode Switcher */}
                    <div className="flex bg-zinc-900 rounded-lg p-1 border border-zinc-800">
                        <button onClick={() => setViewMode('all')} className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${viewMode === 'all' ? 'bg-zinc-700 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'}`}>All</button>
                        <button onClick={() => setViewMode('post')} className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${viewMode === 'post' ? 'bg-blue-900/50 text-blue-200 shadow' : 'text-zinc-500 hover:text-zinc-300'}`}>Posts</button>
                        <button onClick={() => setViewMode('story')} className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${viewMode === 'story' ? 'bg-purple-900/50 text-purple-200 shadow' : 'text-zinc-500 hover:text-zinc-300'}`}>Stories</button>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => {
                            setIsSelectionMode(!isSelectionMode);
                            setSelectedPostIds(new Set());
                        }}
                        className={`flex items-center gap-2 px-3 py-1.5 border rounded-lg text-xs font-medium transition-colors ${isSelectionMode
                            ? 'bg-blue-900/20 border-blue-500 text-blue-400'
                            : 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-400'
                            }`}
                    >
                        <CheckCircle className="w-3 h-3" />
                        {isSelectionMode ? 'Done' : 'Select'}
                    </button>

                    <button onClick={() => setIsSlotManagerOpen(true)} className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 rounded-lg text-xs font-medium transition-colors">
                        <Clock className="w-3 h-3" /> <span className="hidden sm:inline">Times</span>
                    </button>
                    <button className="p-2 hover:bg-zinc-900 rounded-full text-zinc-500 hover:text-white"><Settings className="w-5 h-5" /></button>
                </div>
            </header>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="flex-1 flex overflow-hidden">

                    {/* LEFT: POOL (Drafts) */}
                    <div className="w-64 border-r border-zinc-800 bg-zinc-900/10 flex flex-col shrink-0">
                        <div className="p-4 border-b border-zinc-800">
                            <h2 className="font-bold text-zinc-400 flex items-center gap-2 text-sm mb-4">
                                <ImageIcon className="w-4 h-4" /> Drafts ({drafts.length})
                            </h2>

                            {/* Upload Type Selector */}
                            <div className="flex gap-2 mb-4">
                                <button
                                    onClick={() => setUploadType('post')}
                                    className={`flex-1 py-1.5 text-xs font-medium rounded border transition-colors ${uploadType === 'post' ? 'bg-blue-900/30 border-blue-500/50 text-blue-300' : 'border-zinc-800 text-zinc-500 hover:border-zinc-700'}`}
                                >
                                    Post
                                </button>
                                <button
                                    onClick={() => setUploadType('story')}
                                    className={`flex-1 py-1.5 text-xs font-medium rounded border transition-colors ${uploadType === 'story' ? 'bg-purple-900/30 border-purple-500/50 text-purple-300' : 'border-zinc-800 text-zinc-500 hover:border-zinc-700'}`}
                                >
                                    Story
                                </button>
                            </div>

                            <div className="relative">
                                <input
                                    type="file" multiple accept="image/*" className="hidden"
                                    ref={fileInputRef} onChange={handleFileUpload}
                                />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploading}
                                    className={`w-full py-2 flex items-center justify-center gap-2 rounded-lg text-xs font-bold transition-all disabled:opacity-50 ${uploadType === 'post' ? 'bg-blue-600 hover:bg-blue-500' : 'bg-purple-600 hover:bg-purple-500'
                                        } text-white`}
                                >
                                    {isUploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-4 h-4" />}
                                    Upload {uploadType === 'post' ? 'Posts' : 'Stories'}
                                </button>
                            </div>
                        </div>

                        {/* DROPPABLE DRAFT POOL */}
                        <DraftPoolDroppable>
                            <div className="grid grid-cols-2 gap-2">
                                {drafts.map(post => (
                                    <PostCard
                                        key={post.id} post={post} onClick={() => setEditingPost(post)}
                                        isSelectionMode={isSelectionMode}
                                        isSelected={selectedPostIds.has(post.id)}
                                        onToggleSelect={toggleSelection}
                                    />
                                ))}
                            </div>
                            {drafts.length === 0 && !isUploading && (
                                <div className="text-center py-10 text-zinc-600 text-xs px-4">
                                    Upload images or drag scheduled posts back here.
                                </div>
                            )}
                        </DraftPoolDroppable>
                    </div>

                    {/* RIGHT: CALENDAR GRID */}
                    <div className="flex-1 overflow-auto bg-black p-6">
                        <div style={{ minWidth: `${gridWidth}px` }}>
                            {/* Days Header */}
                            <div className="grid gap-4 mb-4 sticky top-0 bg-black z-10 py-2 border-b border-zinc-900"
                                style={{ gridTemplateColumns: `80px repeat(${periodDays.length}, 1fr)` }}>
                                <div></div>
                                {periodDays.map((day, i) => (
                                    <div key={i} className="text-center min-w-[140px]">
                                        <div className={`text-xs uppercase font-bold mb-1 ${day.toDateString() === new Date().toDateString() ? 'text-blue-500' : 'text-zinc-500'
                                            }`}>
                                            {day.toLocaleDateString('en-US', { weekday: 'short' })}
                                        </div>
                                        <div className={`text-xl font-light ${day.toDateString() === new Date().toDateString() ? 'text-white' : 'text-zinc-400'
                                            }`}>
                                            {day.getDate()} <span className="text-xs text-zinc-600">{day.toLocaleDateString('en-US', { month: 'short' })}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Time Slots Rows */}
                            <div className="space-y-4">
                                {timeSlots.sort().map((time) => (
                                    <div key={time} className="grid gap-4" style={{ gridTemplateColumns: `80px repeat(${periodDays.length}, 1fr)` }}>
                                        {/* Time Label */}
                                        <div className="flex items-start justify-center pt-2 text-zinc-500 font-mono text-sm relative">
                                            <span className="bg-zinc-900 px-2 rounded py-0.5 text-xs">{time}</span>
                                            <div className="absolute top-5 w-full h-px bg-zinc-900/50 -z-10 translate-x-10"></div>
                                        </div>

                                        {/* Drop Zones */}
                                        {periodDays.map((day, i) => {
                                            const dateStr = day.toISOString().split('T')[0];
                                            const slotKey = `${dateStr}_${time}`;
                                            const slotPosts = scheduledMap.get(slotKey) || [];

                                            return (
                                                <CalendarSlot key={slotKey} date={day} time={time}>
                                                    {slotPosts.map(post => (
                                                        <div key={post.id} className="mb-2 last:mb-0">
                                                            <PostCard
                                                                post={post} onClick={() => setEditingPost(post)}
                                                                isSelectionMode={isSelectionMode}
                                                                isSelected={selectedPostIds.has(post.id)}
                                                                onToggleSelect={toggleSelection}
                                                            />
                                                        </div>
                                                    ))}
                                                </CalendarSlot>
                                            );
                                        })}
                                    </div>
                                ))}
                                {timeSlots.length === 0 && (
                                    <div className="text-center py-20 text-zinc-600">
                                        No time slots configured. Click "Manage Times" to add slots.
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>

                </div>

                <DragOverlay>
                    {activePost ? <PostCard post={activePost} isOverlay /> : null}
                </DragOverlay>
            </DndContext>

            {/* BULK ACTION BAR */}
            {isSelectionMode && selectedPostIds.size > 0 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 bg-zinc-900 border border-zinc-700 rounded-full px-6 py-3 shadow-2xl flex items-center gap-4 animate-in slide-in-from-bottom-5">
                    <span className="text-sm font-bold text-white">{selectedPostIds.size} Selected</span>
                    <div className="w-px h-4 bg-zinc-700"></div>
                    <button onClick={handleBulkDelete} className="text-red-400 hover:text-red-300 font-bold text-sm flex items-center gap-2">
                        <Trash2 className="w-4 h-4" /> Delete
                    </button>
                </div>
            )}
        </main>
    );
}
