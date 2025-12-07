'use client';

export default function StatsCard({ title, value, icon, color = 'green' }: { title: string, value: string | number, icon: React.ReactNode, color?: string }) {
    const borderColor = color === 'blue' ? 'border-blue-500' : color === 'red' ? 'border-red-500' : typeof color === 'string' && color.includes('#') ? `border-[${color}]` : 'border-green-500';
    const textColor = color === 'blue' ? 'text-blue-500' : color === 'red' ? 'text-red-500' : 'text-green-500';
    const glowColor = color === 'blue' ? 'rgba(59,130,246,0.1)' : 'rgba(34,197,94,0.1)';

    return (
        <div className={`glass-panel p-6 rounded-lg border ${borderColor} relative overflow-hidden group hover:bg-[${glowColor}] transition-all`}>
            <div className="relative z-10 flex justify-between items-start">
                <div>
                    <h3 className="text-gray-400 text-xs uppercase font-bold tracking-widest mb-2">{title}</h3>
                    <div className="text-3xl font-black text-white">{value}</div>
                </div>
                <div className={`p-3 rounded bg-black/50 ${textColor}`}>
                    {icon}
                </div>
            </div>
            {/* Background Glow */}
            <div className={`absolute -bottom-10 -right-10 w-32 h-32 rounded-full blur-[50px] opacity-20 bg-${color === 'blue' ? 'blue' : 'green'}-500/30 group-hover:opacity-40 transition-opacity`} />
        </div>
    );
}
