'use client';

export default function TrendChart({ data, labels }: { data: number[], labels: string[] }) {
    const max = Math.max(...data, 1);
    const height = 150;
    const width = 1000;

    // Generate SVG path points
    const points = data.map((val, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - (val / max) * height; // Invert y for SVG
        return `${x},${y}`;
    }).join(' ');

    return (
        <div className="w-full h-full p-4 relative">
            <div className="absolute top-0 left-0 w-full h-full bg-grid opacity-10 pointer-events-none" />

            {/* Simple Line Chart SVG */}
            <svg viewBox={`0 0 ${width} ${height + 20}`} className="w-full h-48 overflow-visible">
                {/* Gradient Definition */}
                <defs>
                    <linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#22c55e" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
                    </linearGradient>
                </defs>

                {/* Fill Area */}
                <path
                    d={`M0,${height} ${points} M${width},${height} Z`}
                    fill="url(#gradient)"
                    stroke="none"
                />

                {/* Line */}
                <polyline
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="3"
                    points={points}
                    className="drop-shadow-[0_0_10px_rgba(34,197,94,0.8)]"
                />

                {/* Points */}
                {data.map((val, i) => {
                    const x = (i / (data.length - 1)) * width;
                    const y = height - (val / max) * height;
                    return (
                        <circle key={i} cx={x} cy={y} r="4" fill="#000" stroke="#22c55e" strokeWidth="2" className="hover:r-6 transition-all" />
                    )
                })}
            </svg>

            {/* X Axis Labels */}
            <div className="flex justify-between mt-2 text-xs text-gray-500 font-mono">
                {labels.map((date, i) => (
                    <span key={i}>{date}</span>
                ))}
            </div>
        </div>
    );
}
