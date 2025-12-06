'use client';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

export default function ResellerPanel() {
    const [secretKey, setSecretKey] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [history, setHistory] = useState<any[]>([]);
    const [generatedKey, setGeneratedKey] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [serverStatus, setServerStatus] = useState(true); // Default to on
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const loginCanvasRef = useRef<HTMLCanvasElement>(null);

    // MATRIX EFFECT
    const initMatrix = (canvas: HTMLCanvasElement) => {
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZLKLXITLIOS';
        const fontSize = 14;
        const columns = canvas.width / fontSize;
        const drops = Array(Math.floor(columns)).fill(1);

        const draw = () => {
            ctx.fillStyle = 'rgba(5, 5, 5, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#0F0';
            ctx.font = fontSize + 'px monospace';
            for (let i = 0; i < drops.length; i++) {
                const text = chars.charAt(Math.floor(Math.random() * chars.length));
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);
                if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
                drops[i]++;
            }
        };
        const interval = setInterval(draw, 33);
        return () => clearInterval(interval);
    };

    useEffect(() => {
        if (isAuthenticated && canvasRef.current) initMatrix(canvasRef.current);
        else if (!isAuthenticated && loginCanvasRef.current) initMatrix(loginCanvasRef.current);
    }, [isAuthenticated]);

    // LOAD SESSION & SERVER STATUS
    useEffect(() => {
        const savedKey = localStorage.getItem('reseller_secret');
        if (savedKey) {
            setSecretKey(savedKey);
            setIsAuthenticated(true);
        }
        fetchServerStatus();
    }, []);

    // LOAD HISTORY
    useEffect(() => {
        if (isAuthenticated && secretKey) {
            fetchHistory();
        }
    }, [isAuthenticated, secretKey]);

    const fetchServerStatus = async () => {
        const { data } = await supabase.from('settings').select('value').eq('key', 'server_status').single();
        if (data && data.value) setServerStatus(data.value.enabled);
    };

    const fetchHistory = async () => {
        try {
            const res = await fetch('/api/reseller/my-keys', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ secretKey })
            });
            const data = await res.json();
            if (data.keys) setHistory(data.keys);
        } catch (e) {
            console.error(e);
        }
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (secretKey.length > 3) {
            localStorage.setItem('reseller_secret', secretKey);
            setIsAuthenticated(true);
        }
    };

    const logout = () => {
        localStorage.removeItem('reseller_secret');
        setSecretKey('');
        setIsAuthenticated(false);
        setHistory([]);
    };

    const generateKey = async (duration: string) => {
        setLoading(true);
        setGeneratedKey(null);
        try {
            const res = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ secretKey, durationType: duration }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Erro');
            setGeneratedKey(data.key);
            fetchHistory();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <main className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-black text-white font-mono">
                <canvas ref={loginCanvasRef} className="fixed inset-0 pointer-events-none opacity-20" />
                <div className="glass-panel p-10 rounded-lg border border-green-900 shadow-[0_0_50px_rgba(0,255,65,0.1)] w-full max-w-md text-center relative z-10">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-50" />
                    <h1 className="text-4xl font-black text-white mb-2 tracking-tighter glitch" data-text="LKL XIT LIOS">LKL XIT LIOS</h1>
                    <p className="text-xs text-green-500 uppercase tracking-[0.3em] mb-8">Área do Revendedor</p>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="relative group">
                            <input
                                type="password"
                                placeholder="SECRET KEY"
                                value={secretKey}
                                onChange={(e) => setSecretKey(e.target.value)}
                                className="w-full bg-black/50 border border-gray-800 text-center text-white p-3 text-sm focus:border-green-500 outline-none transition-colors tracking-widest font-bold placeholder-gray-700"
                            />
                            <div className="absolute bottom-0 left-0 w-0 h-[1px] bg-green-500 transition-all duration-300 group-hover:w-full"></div>
                        </div>
                        <button type="submit" className="w-full mt-8 bg-green-900/20 border border-green-500 text-green-500 py-3 text-sm font-bold hover:bg-green-500 hover:text-black transition-all duration-300 uppercase tracking-widest hover:shadow-[0_0_20px_rgba(0,255,65,0.4)]">
                            ACESSAR PAINEL
                        </button>
                    </form>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen flex flex-col items-center p-4 sm:p-8 bg-black text-white font-mono relative overflow-hidden">
            <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none opacity-20" />

            <header className="w-full max-w-7xl flex flex-col md:flex-row justify-between items-center mb-8 md:mb-12 z-10 gap-6 md:gap-0">
                <div className="text-center md:text-left">
                    <h1 className="text-4xl md:text-7xl font-black text-white tracking-tighter glitch" data-text="LKL XIT LIOS">LKL XIT LIOS</h1>
                    <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
                        <span className={`w-2 h-2 rounded-full animate-pulse ${serverStatus ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        <p className={`text-xs uppercase tracking-[0.2em] ${serverStatus ? 'text-green-500' : 'text-red-500'}`}>
                            SERVER {serverStatus ? 'ONLINE' : 'OFFLINE'}
                        </p>
                    </div>
                </div>
                <button onClick={logout} className="glass-panel px-4 py-3 text-red-500 border-red-900 hover:bg-red-500 hover:text-black transition font-bold text-xs uppercase tracking-wider hover-glow">
                    LOGOUT
                </button>
            </header>

            {/* GENERATOR */}
            <div className="w-full max-w-7xl glass-panel p-6 md:p-8 mb-8 z-10 border-l-4 border-neon-green">
                <h2 className="text-xl font-bold text-neon-green mb-6 tracking-widest uppercase border-b border-green-900/50 pb-2">GERAR LICENÇA</h2>

                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <button onClick={() => generateKey('monthly')} disabled={loading} className="flex-1 bg-green-900/20 border border-green-500 text-green-500 py-4 font-bold hover:bg-green-500 hover:text-black transition uppercase tracking-widest hover:shadow-[0_0_20px_rgba(0,255,65,0.2)]">
                        MENSAL (30 DIAS)
                    </button>
                    <button onClick={() => generateKey('weekly')} disabled={loading} className="flex-1 bg-green-900/20 border border-green-500 text-green-500 py-4 font-bold hover:bg-green-500 hover:text-black transition uppercase tracking-widest hover:shadow-[0_0_20px_rgba(0,255,65,0.2)]">
                        SEMANAL (7 DIAS)
                    </button>
                </div>

                {loading && <div className="text-center text-green-500 animate-pulse font-bold tracking-widest">GERANDO KEY...</div>}

                {generatedKey && (
                    <div className="bg-black/50 border border-green-500 p-6 rounded text-center mt-4 relative group cursor-pointer" onClick={() => navigator.clipboard.writeText(generatedKey)}>
                        <p className="text-xs text-green-700 uppercase font-bold mb-2">CLIQUE PARA COPIAR</p>
                        <p className="text-2xl md:text-4xl font-black text-white tracking-widest drop-shadow-[0_0_10px_rgba(0,255,65,0.8)]">{generatedKey}</p>
                    </div>
                )}
            </div>

            {/* HISTORY TABLE */}
            <div className="w-full max-w-7xl glass-panel border border-gray-800 overflow-hidden z-10">
                <div className="p-4 border-b border-gray-800 bg-black/40 flex justify-between items-center">
                    <h2 className="text-gray-400 text-xs uppercase tracking-widest font-bold">HISTÓRICO DE GERAÇÃO</h2>
                    <button onClick={fetchHistory} className="text-xs text-green-500 hover:text-white uppercase font-bold">ATUALIZAR</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <tbody className="text-sm text-gray-400 divide-y divide-gray-800/30">
                            {history.length === 0 ? (
                                <tr><td className="p-8 text-center text-gray-700 uppercase text-xs tracking-widest">NENHUM REGISTRO ENCONTRADO</td></tr>
                            ) : (
                                history.map((item: any) => (
                                    <tr key={item.id} className="table-row-hover transition-colors">
                                        <td className="p-4 font-bold text-green-400 font-mono tracking-wider select-all">{item.license_key}</td>
                                        <td className="p-4 text-xs uppercase">{item.duration_type}</td>
                                        <td className="p-4 text-xs font-mono opacity-70">{new Date(item.created_at).toLocaleDateString()}</td>
                                        <td className="p-4 text-right">
                                            <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded ${item.status === 'active' ? 'bg-green-900/20 text-green-500' : 'bg-red-900/20 text-red-500'}`}>
                                                {item.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    );
}
