"use client";

import { LayoutDashboard, FolderPlus, Settings, LogOut, Package } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    const menu = [
        { title: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },

        { title: "New Project", href: "/admin/dashboard/projects/new", icon: FolderPlus },
        { title: "Settings", href: "/admin/dashboard/settings", icon: Settings },
    ];

    return (
        <div className="flex min-h-screen bg-black text-white font-sans">
            {/* Sidebar */}
            <aside className="w-64 border-r border-zinc-800 p-6 flex flex-col justify-between sticky top-0 h-screen">
                <div>
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold font-oswald uppercase text-brand-yellow">BASE ADMIN</h2>
                    </div>
                    <nav className="flex flex-col gap-2">
                        {menu.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-brand-yellow text-black font-bold' : 'text-gray-400 hover:text-white hover:bg-zinc-900'}`}
                                >
                                    <item.icon className="w-5 h-5" />
                                    <span className="uppercase text-sm tracking-wider">{item.title}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <button className="flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-zinc-900 rounded-lg transition-colors">
                    <LogOut className="w-5 h-5" />
                    <span className="uppercase text-sm tracking-wider font-bold">Logout</span>
                </button>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 md:p-12 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
