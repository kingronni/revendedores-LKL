'use client';
import { LayoutDashboard, Users, Key, Gamepad2, Settings, Power, Trash, LogOut } from 'lucide-react';

export default function AdminSidebar({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (t: string) => void }) {
    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { id: 'all_keys', label: 'All Keys', icon: <Key size={20} /> },
        { id: 'resellers', label: 'Resellers', icon: <Users size={20} /> },
        { id: 'games', label: 'Games', icon: <Gamepad2 size={20} /> },
        { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
    ];

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-black/90 border-r border-green-900/50 flex flex-col z-50 glass-panel">
            <div className="p-6 border-b border-green-900/30">
                <h1 className="text-2xl font-black text-white glitch tracking-tighter" data-text="LKL JOAO PAINEL">LKL ADMIN</h1>
            </div>

            <nav className="flex-1 py-6 space-y-2">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center gap-4 px-6 py-3 text-sm font-bold transition-all relative group ${activeTab === item.id
                                ? 'text-black bg-green-500'
                                : 'text-gray-400 hover:text-green-400 hover:bg-green-900/20'
                            }`}
                    >
                        {item.icon}
                        <span>{item.label}</span>
                        {activeTab === item.id && <div className="absolute right-0 top-0 h-full w-1 bg-white animate-pulse" />}
                    </button>
                ))}
            </nav>

            <div className="p-6 border-t border-green-900/30">
                <button
                    onClick={() => window.location.href = '/'}
                    className="w-full flex items-center gap-2 text-red-500 hover:text-red-400 font-bold text-sm uppercase"
                >
                    <LogOut size={18} /> Logout
                </button>
            </div>
        </aside>
    );
}
