"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, Star, StarOff, Loader2, GripVertical } from "lucide-react";
import Link from "next/link";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Project {
    id: string;
    title: string;
    category: string;
    is_featured: boolean;
    display_order: number;
}

function SortableRow({ project, onToggleFeatured }: { project: Project; onToggleFeatured: (id: string, status: boolean) => void }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: project.id });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <tr ref={setNodeRef} style={style} className="border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors group">
            <td className="p-6">
                <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing touch-none">
                    <GripVertical className="w-5 h-5 text-gray-600 group-hover:text-gray-400" />
                </div>
            </td>
            <td className="p-6">
                <button onClick={() => onToggleFeatured(project.id, project.is_featured)} title="Toggle Home Feature">
                    {project.is_featured ? (
                        <Star className="w-5 h-5 text-brand-yellow fill-brand-yellow" />
                    ) : (
                        <StarOff className="w-5 h-5 text-gray-600 hover:text-gray-400" />
                    )}
                </button>
            </td>
            <td className="p-6 font-bold text-white">{project.title}</td>
            <td className="p-6 text-gray-400 font-mono text-sm">{project.category}</td>
            <td className="p-6 text-right">
                <Link href={`/admin/dashboard/projects/edit/${project.id}`} className="text-gray-400 hover:text-white transition-colors text-sm font-bold uppercase tracking-wider underline">Edit</Link>
            </td>
        </tr>
    );
}

export default function DashboardPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const fetchProjects = async () => {
        try {
            const { data, error } = await supabase
                .from('projects')
                .select('*')
                .order('display_order', { ascending: true });

            if (error) throw error;
            if (data) setProjects(data);

        } catch (error) {
            console.error("Error fetching projects:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const toggleFeatured = async (id: string, currentStatus: boolean) => {
        try {
            const { error } = await supabase
                .from('projects')
                .update({ is_featured: !currentStatus })
                .eq('id', id);

            if (error) throw error;

            // Optimistic Update
            setProjects(projects.map(p => p.id === id ? { ...p, is_featured: !currentStatus } : p));

        } catch (error) {
            console.error("Error updating featured status:", error);
            alert("Failed to update status");
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = projects.findIndex(p => p.id === active.id);
            const newIndex = projects.findIndex(p => p.id === over.id);

            const newProjects = arrayMove(projects, oldIndex, newIndex);
            setProjects(newProjects);

            // Save new order to database
            setSaving(true);
            try {
                const updates = newProjects.map((project, index) => ({
                    id: project.id,
                    display_order: index + 1
                }));

                for (const update of updates) {
                    await supabase
                        .from('projects')
                        .update({ display_order: update.display_order })
                        .eq('id', update.id);
                }

            } catch (error) {
                console.error("Error saving order:", error);
                alert("Failed to save order");
                fetchProjects(); // Revert on error
            } finally {
                setSaving(false);
            }
        }
    };

    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold font-oswald uppercase text-white mb-2">Projects</h1>
                    <p className="text-gray-400">Manage your portfolio items. Drag to reorder.</p>
                </div>
                <Link href="/admin/dashboard/projects/new" className="bg-brand-yellow text-black px-6 py-3 rounded-full font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-white transition-colors">
                    <Plus className="w-5 h-5" />
                    New Project
                </Link>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
                    <span className="text-gray-500 uppercase text-xs tracking-widest block mb-2">Total Projects</span>
                    <span className="text-4xl font-bold text-white">{projects.length}</span>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
                    <span className="text-gray-500 uppercase text-xs tracking-widest block mb-2">Featured</span>
                    <span className="text-4xl font-bold text-white">{projects.filter(p => p.is_featured).length}</span>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl relative">
                    <span className="text-gray-500 uppercase text-xs tracking-widest block mb-2">Status</span>
                    <span className="text-4xl font-bold text-white">{saving ? "Saving..." : "Ready"}</span>
                    {saving && <Loader2 className="absolute top-6 right-6 w-5 h-5 animate-spin text-brand-yellow" />}
                </div>
            </div>

            {/* List Table */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden min-h-[400px]">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
                    </div>
                ) : (
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <table className="w-full text-left">
                            <thead className="bg-black/50 border-b border-zinc-800">
                                <tr>
                                    <th className="p-6 font-mono text-xs uppercase tracking-widest text-gray-500">Order</th>
                                    <th className="p-6 font-mono text-xs uppercase tracking-widest text-gray-500">Featured</th>
                                    <th className="p-6 font-mono text-xs uppercase tracking-widest text-gray-500">Project Name</th>
                                    <th className="p-6 font-mono text-xs uppercase tracking-widest text-gray-500">Category</th>
                                    <th className="p-6 font-mono text-xs uppercase tracking-widest text-gray-500 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <SortableContext items={projects.map(p => p.id)} strategy={verticalListSortingStrategy}>
                                    {projects.map((p) => (
                                        <SortableRow key={p.id} project={p} onToggleFeatured={toggleFeatured} />
                                    ))}
                                </SortableContext>
                                {projects.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="p-12 text-center text-gray-500 italic">No projects found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </DndContext>
                )}
            </div>
        </div>
    );
}
