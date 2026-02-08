"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, Trash2, Edit, Save, Loader2, Image as ImageIcon, X } from "lucide-react";
import Image from "next/image";

interface Client {
    id: string;
    name: string;
    description: string;
    logo_url: string;
    display_order: number;
}

export default function ClientsPage() {
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [currentClient, setCurrentClient] = useState<Partial<Client>>({});
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('clients')
            .select('*')
            .order('display_order', { ascending: true });

        if (error) {
            console.error('Error fetching clients:', error);
        } else {
            setClients(data || []);
        }
        setLoading(false);
    };

    const handleSave = async () => {
        if (!currentClient.name) {
            alert("Name is required");
            return;
        }

        setSaving(true);
        try {
            const clientData = {
                name: currentClient.name,
                description: currentClient.description || "",
                logo_url: currentClient.logo_url || "",
                display_order: currentClient.display_order || 0
            };

            let error;
            if (currentClient.id) {
                // Update
                const { error: updateError } = await supabase
                    .from('clients')
                    .update(clientData)
                    .eq('id', currentClient.id);
                error = updateError;
            } else {
                // Insert
                const { error: insertError } = await supabase
                    .from('clients')
                    .insert([clientData]);
                error = insertError;
            }

            if (error) throw error;

            setIsEditing(false);
            setCurrentClient({});
            fetchClients();
        } catch (error: any) {
            console.error('Error saving client:', error);
            alert(`Error saving client: ${error.message}`);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this client?")) return;

        try {
            const { error } = await supabase
                .from('clients')
                .delete()
                .eq('id', id);

            if (error) throw error;
            fetchClients();
        } catch (error: any) {
            console.error('Error deleting client:', error);
            alert(`Error deleting client: ${error.message}`);
        }
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `client-${Date.now()}.${fileExt}`;
            const filePath = `clients/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('client-logos')
                .upload(filePath, file);

            if (uploadError) {
                // If bucket doesn't exist, try creating it first (or fallback to generic assets if policy allows)
                // But generally we expect the setup SQL to have run.
                // Let's try project-assets if client-logos fails, as a fallback? 
                // No, stick to one. But to be safe, I'll recommend the user to run the SQL.
                throw uploadError;
            }

            const { data } = supabase.storage.from('client-logos').getPublicUrl(filePath);
            setCurrentClient(prev => ({ ...prev, logo_url: data.publicUrl }));

        } catch (error: any) {
            console.error('Error uploading logo:', error);
            // Fallback attempt to project-assets just in case
            try {
                const fileExt = file.name.split('.').pop();
                const fileName = `client-${Date.now()}.${fileExt}`;
                const filePath = `clients/${fileName}`;
                const { error: uploadError } = await supabase.storage
                    .from('project-assets')
                    .upload(filePath, file);

                if (!uploadError) {
                    const { data } = supabase.storage.from('project-assets').getPublicUrl(filePath);
                    setCurrentClient(prev => ({ ...prev, logo_url: data.publicUrl }));
                    setUploading(false);
                    return;
                }
            } catch (fallbackError) { }

            alert(`Error uploading logo: ${error.message}. Please ensure the 'client-logos' bucket exists.`);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto pb-24">
            <div className="flex items-center justify-between mb-12">
                <h1 className="text-4xl font-bold font-oswald uppercase text-white">Clients Management</h1>
                <button
                    onClick={() => {
                        setCurrentClient({ display_order: clients.length });
                        setIsEditing(true);
                    }}
                    className="bg-brand-yellow text-black px-6 py-3 rounded-full font-bold uppercase tracking-wider hover:bg-white transition-colors flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Add New Client
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="w-8 h-8 animate-spin text-white" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {clients.map((client) => (
                        <div key={client.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col gap-4 group hover:border-brand-yellow/50 transition-colors">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold text-white">{client.name}</h3>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => {
                                            setCurrentClient(client);
                                            setIsEditing(true);
                                        }}
                                        className="p-2 bg-zinc-800 rounded-full hover:bg-white hover:text-black transition-colors"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(client.id)}
                                        className="p-2 bg-zinc-800 rounded-full text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {client.logo_url && (
                                <div className="h-16 relative bg-white/5 rounded-lg overflow-hidden flex items-center justify-center p-2">
                                    <Image
                                        src={client.logo_url}
                                        alt={client.name}
                                        width={100}
                                        height={50}
                                        className="object-contain max-h-full"
                                    />
                                </div>
                            )}

                            <p className="text-sm text-gray-400 line-clamp-2">{client.description}</p>

                            <div className="mt-auto pt-4 border-t border-zinc-800 flex justify-between items-center">
                                <span className="text-xs text-gray-600 uppercase tracking-wider">Order: {client.display_order}</span>
                            </div>
                        </div>
                    ))}

                    {clients.length === 0 && (
                        <div className="col-span-full py-20 text-center text-gray-500 border border-dashed border-zinc-800 rounded-xl">
                            No clients found. Add one to get started.
                        </div>
                    )}
                </div>
            )}

            {/* Edit/Add Modal */}
            {isEditing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 w-full max-w-lg relative max-h-[90vh] overflow-y-auto">
                        <button
                            onClick={() => setIsEditing(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <h2 className="text-2xl font-bold font-oswald uppercase text-white mb-8">
                            {currentClient.id ? 'Edit Client' : 'New Client'}
                        </h2>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Client Name</label>
                                <input
                                    value={currentClient.name || ''}
                                    onChange={(e) => setCurrentClient({ ...currentClient, name: e.target.value })}
                                    className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white placeholder:text-gray-700 focus:border-brand-yellow outline-none"
                                    placeholder="e.g. Huawei"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Description</label>
                                <textarea
                                    value={currentClient.description || ''}
                                    onChange={(e) => setCurrentClient({ ...currentClient, description: e.target.value })}
                                    rows={3}
                                    className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white placeholder:text-gray-700 focus:border-brand-yellow outline-none"
                                    placeholder="Brief description of work done..."
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Logo</label>
                                <div className="flex items-center gap-4">
                                    {currentClient.logo_url ? (
                                        <div className="w-20 h-20 bg-white/5 rounded-lg overflow-hidden flex items-center justify-center p-2 relative group">
                                            <Image
                                                src={currentClient.logo_url}
                                                alt="Preview"
                                                width={60}
                                                height={60}
                                                className="object-contain"
                                            />
                                            <button
                                                onClick={() => setCurrentClient({ ...currentClient, logo_url: '' })}
                                                className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Trash2 className="w-4 h-4 text-white" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="w-20 h-20 bg-black border border-zinc-700 border-dashed rounded-lg flex items-center justify-center text-gray-600">
                                            <ImageIcon className="w-6 h-6" />
                                        </div>
                                    )}

                                    <div className="flex-1">
                                        <label className="cursor-pointer bg-zinc-800 text-white px-4 py-2 rounded-lg hover:bg-zinc-700 transition-colors inline-block text-sm">
                                            {uploading ? (
                                                <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</span>
                                            ) : "Choose Image"}
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleLogoUpload}
                                                disabled={uploading}
                                            />
                                        </label>
                                        <p className="text-[10px] text-gray-500 mt-2">Recommended: transparent PNG or SVG.</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Display Order</label>
                                <input
                                    type="number"
                                    value={currentClient.display_order || 0}
                                    onChange={(e) => setCurrentClient({ ...currentClient, display_order: parseInt(e.target.value) })}
                                    className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white placeholder:text-gray-700 focus:border-brand-yellow outline-none"
                                />
                            </div>

                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="w-full bg-brand-yellow text-black py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-white transition-colors flex items-center justify-center gap-2 mt-8"
                            >
                                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                Save Client
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
