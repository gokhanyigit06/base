"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

import Image from "next/image";

export function ClientsSection() {
    const [clients, setClients] = useState<any[]>([]);

    useEffect(() => {
        const fetchClients = async () => {
            try {
                const res = await fetch('/api/clients');
                if (res.ok) {
                    const data = await res.json();
                    setClients(data);
                }
            } catch (error) {
                console.error('Failed to load clients', error);
            }
        };
        fetchClients();
    }, []);

    // If no clients yet, hide section or show placeholder?
    // Let's hide it if empty to avoid broken layout
    if (clients.length === 0) return null;

    return (
        <section className="w-full bg-[#f9f9f9] text-black py-32 px-6 md:px-12">
            <div className="max-w-[1920px] mx-auto flex flex-col xl:flex-row gap-20 xl:gap-40">
                {/* Left: Heading */}
                <div className="xl:w-1/3">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-[15vw] xl:text-[10rem] leading-[0.8] font-medium tracking-tighter"
                    >
                        Clients
                    </motion.h2>
                </div>

                {/* Right: Grid */}
                <div className="xl:w-2/3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-20 pt-4">
                    {clients.map((client, index) => (
                        <motion.div
                            key={client.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="flex flex-col gap-6"
                        >
                            {/* Logo / Name Area */}
                            <div className="h-16 flex items-center">
                                {client.logo_url ? (
                                    <div className="relative w-full h-full flex items-center justify-start">
                                        <Image
                                            src={client.logo_url}
                                            alt={client.name}
                                            width={160}
                                            height={64}
                                            className="object-contain object-left max-h-full"
                                        />
                                    </div>
                                ) : (
                                    <h3 className="text-2xl font-bold tracking-tight">{client.name}</h3>
                                )}
                            </div>

                            <p className="text-sm font-medium leading-relaxed text-gray-600 max-w-[280px]">
                                {client.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
