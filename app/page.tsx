'use client';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

export default function ResellerPanel() {
    const [secretKey, setSecretKey] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [serverStatus, setServerStatus] = useState(true);
    const [mounted, setMounted] = useState(false);

    // Modals State
    const [showNewClientModal, setShowNewClientModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedKey, setSelectedKey] = useState<any>(null);

    // Form State
    const [formData, setFormData] = useState({
        clientName: '',
        whatsapp: '',
        durationType: 'monthly',
        maxIps: 1
    });

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const loginCanvasRef = useRef<HTMLCanvasElement>(null);

    // ... (Keep existing Effect hooks and Matrix logic unchanged if possible, re-included here for completeness of context)
    // FIX HYDRATION
    useEffect(() => {
        setMounted(true);
    }, []);

    const initMatrix = (canvas: HTMLCanvasElement) => {
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZLKLXITLIOS';
        const fontSize = 14;
        const columns = Math.floor(canvas.width / fontSize);
        const drops = Array(columns).fill(1);

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
        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', handleResize);

        return () => {
            clearInterval(interval);
            window.removeEventListener('resize', handleResize);
        }
    };

    useEffect(() => {
        if (!mounted) return;
        if (isAuthenticated && canvasRef.current) {
            return initMatrix(canvasRef.current);
        } else if (!isAuthenticated && loginCanvasRef.current) {
            return initMatrix(loginCanvasRef.current);
        }
    }, [isAuthenticated, mounted]);

    // LOAD SESSION
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedKey = localStorage.getItem('reseller_secret');
            if (savedKey) {
                setSecretKey(savedKey);
                setIsAuthenticated(true);
            }
        }
        fetchServerStatus();
    }, []);

    // LOAD HISTORY
    useEffect(() => {
        if (isAuthenticated && secretKey) fetchHistory();
    }, [isAuthenticated, secretKey]);

    const fetchServerStatus = async () => {
        try {
            const { data } = await supabase.from('settings').select('value').eq('key', 'server_status').single();
            if (data && data.value) setServerStatus(data.value.enabled);
        } catch (e) {
            console.error("Erro status", e);
        }
    };

    const fetchHistory = async () => {
        try {
            const res = await fetch('/api/reseller/my-keys', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ secretKey })
            });
            const data = await res.json();
            if (data.keys && Array.isArray(data.keys)) setHistory(data.keys);
        } catch (e) {
            console.error("Erro historico", e);
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

    // ACTIONS
    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    secretKey,
                    durationType: formData.durationType,
                    clientName: formData.clientName,
                    whatsapp: formData.whatsapp,
                    maxIps: formData.maxIps
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Erro desconhecido');

            alert(`SUCESSO! KEY: ${data.key}`);
            setShowNewClientModal(false);
            setFormData({ clientName: '', whatsapp: '', durationType: 'monthly', maxIps: 1 });
            fetchHistory();
        } catch (err: any) {
            alert(err.message || 'Erro ao gerar');
        } finally {
            setLoading(false);
        }
    };

    const handleManage = async (action: string, keyId: string, extraData?: any) => {
        if (action === 'delete' && !confirm('Tem certeza que deseja DELETAR esta chave?')) return;

        try {
            const res = await fetch('/api/reseller/manage-key', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    secretKey,
                    action,
                    keyId,
                    ...extraData
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            if (action === 'delete' || action === 'update') {
                setShowEditModal(false);
                setSelectedKey(null);
            }
            if (action === 'reset_ip') alert('IP Resetado com Sucesso!');

            fetchHistory();
        } catch (e: any) {
            alert(e.message);
        }
    };

    const openEditModal = (key: any) => {
        setSelectedKey(key);
        setFormData({
            clientName: key.client_name || '',
            whatsapp: key.whatsapp || '',
            durationType: key.duration_type || 'monthly',
            maxIps: key.max_ips || 1
        });
        setShowEditModal(true);
    };

    if (!mounted) return <div className="min-h-screen bg-black text-white flex items-center justify-center font-mono">CARREGANDO SISTEMA...</div>;

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

            {/* HEADER */}
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
                <div className="flex gap-4">
                    <button onClick={() => setShowNewClientModal(true)} className="bg-green-600 text-black px-6 py-3 font-bold uppercase tracking-wider hover:bg-green-500 transition shadow-[0_0_20px_rgba(0,255,65,0.3)]">
                        NOVO CLIENTE
                    </button>
                    <button onClick={logout} className="glass-panel px-4 py-3 text-red-500 border-red-900 hover:bg-red-500 hover:text-black transition font-bold text-xs uppercase tracking-wider hover-glow">
                        LOGOUT
                    </button>
                </div>
            </header>

            {/* HISTORY TABLE */}
            <div className="w-full max-w-7xl glass-panel border border-gray-800 overflow-hidden z-10">
                <div className="p-4 border-b border-gray-800 bg-black/40 flex justify-between items-center">
                    <h2 className="text-gray-400 text-xs uppercase tracking-widest font-bold">MEUS CLIENTES</h2>
                    <button onClick={fetchHistory} className="text-xs text-green-500 hover:text-white uppercase font-bold">ATUALIZAR LISTA</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="text-xs uppercase text-gray-500 border-b border-gray-800/50">
                            <tr>
                                <th className="p-4">STATUS</th>
                                <th className="p-4">NOME</th>
                                <th className="p-4">WHATSAPP</th>
                                <th className="p-4">PLANO</th>
                                <th className="p-4">IPS</th>
                                <th className="p-4">VENCIMENTO</th>
                                <th className="p-4 text-right">AÇÕES</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm text-gray-400 divide-y divide-gray-800/30">
                            {history.length === 0 ? (
                                <tr><td colSpan={7} className="p-8 text-center text-gray-700 uppercase text-xs tracking-widest">NENHUM REGISTRO ENCONTRADO</td></tr>
                            ) : (
                                history.map((item: any) => (
                                    <tr key={item.id} className="table-row-hover transition-colors hover:bg-white/5">
                                        <td className="p-4">
                                            <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded ${item.status === 'active' ? 'text-green-500' : 'text-red-500'}`}>
                                                {item.status === 'active' ? 'ATIVO' : 'EXPIRADO'}
                                            </span>
                                        </td>
                                        <td className="p-4 font-bold text-white">{item.client_name || '---'}</td>
                                        <td className="p-4 font-mono text-xs text-gray-500">{item.whatsapp || '---'}</td>
                                        <td className="p-4 text-xs uppercase text-neon-green">{item.duration_type}</td>
                                        <td className="p-4 text-xs font-mono">
                                            <span className={(item.used_ips?.length || 0) >= item.max_ips ? 'text-red-500' : 'text-green-500'}>
                                                {item.used_ips?.length || 0}/{item.max_ips || 1}
                                            </span>
                                        </td>
                                        <td className="p-4 text-xs font-mono opacity-70">{new Date(item.expires_at).toLocaleDateString()}</td>
                                        <td className="p-4 text-right flex justify-end gap-2">
                                            <button title="Editar" onClick={() => openEditModal(item)} className="text-blue-500 hover:text-white transition"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></button>

                                            <button title="Resetar IP" onClick={() => handleManage('reset_ip', item.id)} className="text-yellow-500 hover:text-white transition"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3"></path></svg></button>

                                            <button title="Copiar Key" onClick={() => { navigator.clipboard.writeText(item.license_key); alert('Copiado!'); }} className="text-gray-400 hover:text-white transition"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg></button>

                                            <button title="Excluir" onClick={() => handleManage('delete', item.id)} className="text-red-500 hover:text-white transition"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* NEW CLIENT MODAL */}
            {showNewClientModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="glass-panel p-8 w-full max-w-md border border-green-500 shadow-[0_0_50px_rgba(0,255,65,0.2)]">
                        <h2 className="text-xl font-bold text-green-500 mb-6 uppercase tracking-wider border-b border-green-900 pb-2">NOVO CLIENTE</h2>
                        <form onSubmit={handleGenerate} className="space-y-4">
                            <div>
                                <label className="text-xs text-green-700 font-bold uppercase block mb-1">Nome do Cliente</label>
                                <input required type="text" className="w-full bg-black/50 border border-gray-800 text-white p-2 text-sm focus:border-green-500 outline-none"
                                    value={formData.clientName} onChange={e => setFormData({ ...formData, clientName: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-xs text-green-700 font-bold uppercase block mb-1">WhatsApp (Opcional)</label>
                                <input type="text" className="w-full bg-black/50 border border-gray-800 text-white p-2 text-sm focus:border-green-500 outline-none"
                                    value={formData.whatsapp} onChange={e => setFormData({ ...formData, whatsapp: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-xs text-green-700 font-bold uppercase block mb-1">Duração</label>
                                <select className="w-full bg-black/50 border border-gray-800 text-white p-2 text-sm focus:border-green-500 outline-none"
                                    value={formData.durationType} onChange={e => setFormData({ ...formData, durationType: e.target.value })}>
                                    <option value="daily">Diário (24h)</option>
                                    <option value="weekly">Semanal (7 Dias)</option>
                                    <option value="monthly">Mensal (30 Dias)</option>
                                    <option value="permanent">Permanente</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-green-700 font-bold uppercase block mb-1">Max IPs</label>
                                <input type="number" min="1" max="10" className="w-full bg-black/50 border border-gray-800 text-white p-2 text-sm focus:border-green-500 outline-none"
                                    value={formData.maxIps} onChange={e => setFormData({ ...formData, maxIps: parseInt(e.target.value) })} />
                            </div>
                            <div className="flex gap-4 mt-8">
                                <button type="submit" disabled={loading} className="flex-1 bg-green-600 text-black font-bold py-3 uppercase hover:bg-green-500 transition">CRIAR</button>
                                <button type="button" onClick={() => setShowNewClientModal(false)} className="flex-1 border border-gray-700 text-gray-400 font-bold py-3 uppercase hover:text-white transition">CANCELAR</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* EDIT MODAL */}
            {showEditModal && selectedKey && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="glass-panel p-8 w-full max-w-md border border-blue-500 shadow-[0_0_50px_rgba(0,100,255,0.2)]">
                        <h2 className="text-xl font-bold text-blue-500 mb-6 uppercase tracking-wider border-b border-blue-900 pb-2">EDITAR CLIENTE</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-blue-700 font-bold uppercase block mb-1">Nome do Cliente</label>
                                <input type="text" className="w-full bg-black/50 border border-gray-800 text-white p-2 text-sm focus:border-blue-500 outline-none"
                                    value={formData.clientName} onChange={e => setFormData({ ...formData, clientName: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-xs text-blue-700 font-bold uppercase block mb-1">WhatsApp</label>
                                <input type="text" className="w-full bg-black/50 border border-gray-800 text-white p-2 text-sm focus:border-blue-500 outline-none"
                                    value={formData.whatsapp} onChange={e => setFormData({ ...formData, whatsapp: e.target.value })} />
                            </div>
                            <div className="flex gap-4 mt-8">
                                <button onClick={() => handleManage('update', selectedKey.id, { clientName: formData.clientName, whatsapp: formData.whatsapp })} className="flex-1 bg-blue-600 text-white font-bold py-3 uppercase hover:bg-blue-500 transition">SALVAR</button>
                                <button onClick={() => setShowEditModal(false)} className="flex-1 border border-gray-700 text-gray-400 font-bold py-3 uppercase hover:text-white transition">CANCELAR</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
