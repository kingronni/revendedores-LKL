```javascript
// STATS CALCULATION
    const stats = history.reduce((acc, item) => {
        if (item.status === 'active') acc.active++;
        else acc.expired++;
        
        if (item.duration_type === 'permanent') acc.permanent++;
        return acc;
    }, { active: 0, expired: 0, permanent: 0 });

    const StatCard = ({ title, value, color, icon }: any) => {
        const borderClass = color === 'green' ? 'border-green-500' : color === 'red' ? 'border-red-500' : 'border-blue-500';
        const textClass = color === 'green' ? 'text-green-500' : color === 'red' ? 'text-red-500' : 'text-blue-500';
        const bgGlow = color === 'green' ? 'hover:bg-green-900/10' : color === 'red' ? 'hover:bg-red-900/10' : 'hover:bg-blue-900/10';

        return (
            <div className={`glass - panel p - 6 rounded - lg border ${ borderClass } relative overflow - hidden group ${ bgGlow } transition - all`}>
                <div className="relative z-10 flex justify-between items-start">
                    <div>
                        <h3 className="text-gray-400 text-xs uppercase font-bold tracking-widest mb-2">{title}</h3>
                        <div className={`text - 4xl font - black ${ textClass } `}>{value}</div>
                         <div className={`w - full h - 1 mt - 4 bg - gray - 800 rounded - full overflow - hidden`}>
                            <div className={`h - full ${ color === 'green' ? 'bg-green-500' : color === 'red' ? 'bg-red-500' : 'bg-blue-500' } `} style={{ width: '70%' }}></div>
                         </div>
                    </div>
                    <div className={`p - 2 rounded bg - black / 50 ${ textClass } `}>
                        {icon}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <main className="min-h-screen flex flex-col items-center p-4 sm:p-8 bg-black text-white font-mono relative overflow-hidden">
            <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none opacity-20" />
            
            {renderFlags()}

            {/* HEADER */}
            <header className="w-full max-w-7xl flex flex-col md:flex-row justify-between items-center mb-8 z-10 gap-6 md:gap-0 mt-8">
                <div className="text-center md:text-left">
                    <h1 className="text-4xl md:text-7xl font-black text-white tracking-tighter glitch" data-text="LKL XIT LIOS">LKL XIT LIOS</h1>
                    <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
                        <span className={`w - 2 h - 2 rounded - full animate - pulse ${ serverStatus ? 'bg-green-500' : 'bg-red-500' } `}></span>
                        <p className={`text - xs uppercase tracking - [0.2em] ${ serverStatus ? 'text-green-500' : 'text-red-500' } `}>
                            {serverStatus ? t.serverOnline : t.serverOffline}
                        </p>
                    </div>
                </div>
                <div className="flex gap-4">
                     <button onClick={() => setShowNewClientModal(true)} className="bg-green-600 text-black px-6 py-3 font-bold uppercase tracking-wider hover:bg-green-500 transition shadow-[0_0_20px_rgba(0,255,65,0.3)]">
                        {t.newClientBtn}
                    </button>
                    <button onClick={logout} className="glass-panel px-4 py-3 text-red-500 border-red-900 hover:bg-red-500 hover:text-black transition font-bold text-xs uppercase tracking-wider hover-glow">
                        {t.logoutBtn}
                    </button>
                </div>
            </header>

            {/* STATS CARDS */}
            <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 z-10">
                <StatCard 
                    title={t.stats_active} 
                    value={stats.active} 
                    color="green" 
                    icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>} 
                />
                <StatCard 
                    title={t.stats_expired} 
                    value={stats.expired} 
                    color="red" 
                    icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>} 
                />
                <StatCard 
                    title={t.stats_permanent} 
                    value={stats.permanent} 
                    color="blue" 
                    icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>} 
                />
            </div>

            {/* HISTORY TABLE */}
            <div className="w-full max-w-7xl glass-panel border border-gray-800 overflow-hidden z-10">
    );
}
```
