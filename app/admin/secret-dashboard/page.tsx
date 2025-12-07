'use client';
import { useState, useEffect } from 'react';
import { Shield, Power, RefreshCw, X, Eye, Key, Users, Activity, TrendingUp, Plus, Globe } from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';
import StatsCard from '../components/StatsCard';
import TrendChart from '../components/TrendChart';

interface Reseller {
    id: string;
    name: string;
    secret_key: string;
    is_active: boolean;
    balance?: number; // Added balance
}

interface Transaction {
    id: string;
    amount: number;
    type: string;
    description: string;
    created_at: string;
}

interface SystemSettings {
    theme_config: { primary: string; secondary: string; bg: string; };
    credit_costs: { daily: number; weekly: number; monthly: number; };
    key_config: { prefix: string; length: number; };
}

interface ResellerKey {
    id: string;
    license_key: string;
    duration_type: string;
    created_at: string;
    status: string;
}

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [stats, setStats] = useState<any>(null);
    const [resellers, setResellers] = useState<Reseller[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedResellerKeys, setSelectedResellerKeys] = useState<ResellerKey[] | null>(null);
    const [viewingResellerName, setViewingResellerName] = useState('');

    // Settings & Credits
    const [settings, setSettings] = useState<SystemSettings | null>(null);
    const [savingSettings, setSavingSettings] = useState(false);

    // Credit Modal
    const [creditModalOpen, setCreditModalOpen] = useState(false);
    const [selectedResellerId, setSelectedResellerId] = useState('');
    const [creditAmount, setCreditAmount] = useState('');
    const [creditDescription, setCreditDescription] = useState('');
    const [creditTransactions, setCreditTransactions] = useState<Transaction[]>([]);

    // New Reseller Form
    const [newResellerName, setNewResellerName] = useState('');
    const [newResellerKey, setNewResellerKey] = useState('');
    const [creatingReseller, setCreatingReseller] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch Stats
            const resStats = await fetch('/api/admin/stats');
            const dataStats = await resStats.json();
            if (dataStats.stats) setStats(dataStats.stats);

            // Fetch Resellers
            const resResellers = await fetch('/api/admin/list');
            const dataResellers = await resResellers.json();
            if (dataResellers.resellers) setResellers(dataResellers.resellers);

            // Fetch Settings
            const resSettings = await fetch('/api/admin/settings');
            const dataSettings = await resSettings.json();
            if (dataSettings.settings) setSettings(dataSettings.settings);

        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    };

    const handleManageCredits = async (resellerId: string, name: string) => {
        setSelectedResellerId(resellerId);
        setViewingResellerName(name);
        setCreditModalOpen(true);
        // Fetch transactions
        const res = await fetch(`/api/admin/transactions?resellerId=${resellerId}`);
        const data = await res.json();
        setCreditTransactions(data.transactions || []);
    };

    const submitCreditTransaction = async (type: 'add' | 'deduct') => {
        if (!creditAmount) return;

        await fetch('/api/admin/credits', {
            method: 'POST',
            body: JSON.stringify({
                resellerId: selectedResellerId,
                amount: parseFloat(creditAmount),
                type,
                description: creditDescription || `Manual ${type}`
            })
        });

        setCreditAmount('');
        setCreditDescription('');
        fetchData(); // Refresh balances
        // Refresh transactions local list
        const res = await fetch(`/api/admin/transactions?resellerId=${selectedResellerId}`);
        const data = await res.json();
        setCreditTransactions(data.transactions || []);
    };

    const saveSettings = async () => {
        if (!settings) return;
        setSavingSettings(true);
        await fetch('/api/admin/settings', {
            method: 'POST',
            body: JSON.stringify(settings)
        });
        setSavingSettings(false);
        alert('Configurações salvas!');
    };

    useEffect(() => {
        fetchData();
    }, []);

    const toggleReseller = async (id: string, currentStatus: boolean) => {
        await fetch('/api/admin/toggle', {
            method: 'POST',
            body: JSON.stringify({ resellerId: id, isActive: !currentStatus }),
        });
        fetchData(); // Refresh data
    };

    const createReseller = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreatingReseller(true);
        try {
            await fetch('/api/admin/create-reseller', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newResellerName, secretKey: newResellerKey })
            });
            setNewResellerName('');
            setNewResellerKey('');
            alert('Revendedor criado com sucesso!');
            fetchData();
        } catch (e) {
            alert('Erro ao criar revendedor');
        }
        setCreatingReseller(false);
    };

    const viewKeys = async (resellerId: string, name: string) => {
        setViewingResellerName(name);
        const res = await fetch(`/api/admin/keys?resellerId=${resellerId}`);
        const data = await res.json();
        setSelectedResellerKeys(data.keys || []);
    };

    return (
        <div className="flex min-h-screen bg-black text-white font-mono">
            {/* SIDEBAR */}
            <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

            {/* MAIN CONTENT */}
            <main className="flex-1 ml-64 p-8 relative overflow-hidden">
                {/* Background Decor */}
                <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-green-500/10 blur-[100px] pointer-events-none" />

                {/* HEADER */}
                <header className="flex justify-between items-center mb-8 relative z-10">
                    <div>
                        <h2 className="text-3xl font-black text-white">Welcome, LKL</h2>
                        <p className="text-gray-500 text-sm">Painel de Controle Principal</p>
                    </div>
                    <button onClick={fetchData} className="p-2 bg-green-900/20 rounded-full hover:bg-green-500 hover:text-black hover:rotate-180 transition-all duration-500">
                        <RefreshCw size={20} />
                    </button>
                </header>

                {/* DASHBOARD TAB */}
                {activeTab === 'dashboard' && (
                    <div className="space-y-8 animate-fade-in relative z-10">
                        {/* STATS GRID */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatsCard title="Total Keys" value={stats?.totalKeys || 0} icon={<Key size={24} />} color="blue" />
                            <StatsCard title="Active Keys" value={stats?.activeKeys || 0} icon={<Activity size={24} />} color="green" />
                            <StatsCard title="Resellers" value={stats?.totalResellers || 0} icon={<Users size={24} />} color="purple" />
                            <StatsCard title="Weekly Growth" value="+12%" icon={<TrendingUp size={24} />} color="orange" />
                        </div>

                        {/* CHART SECTION */}
                        <div className="glass-panel p-6 rounded-lg border border-green-900/50">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <TrendingUp size={20} className="text-green-500" />
                                Key Generation Trend (Last 7 Days)
                            </h3>
                            <div className="w-full h-48 bg-black/40 rounded border border-gray-800 relative">
                                {stats?.chartData && <TrendChart data={stats.chartData} labels={stats.chartLabels} />}
                            </div>
                        </div>
                    </div>
                )}

                {/* RESELLERS TAB */}
                {(activeTab === 'resellers' || activeTab === 'dashboard') && (
                    <div className={`mt-8 animate-fade-in relative z-10 ${activeTab !== 'resellers' && 'hidden'}`}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <Users className="text-green-500" /> Gerenciar Revendedores
                            </h3>
                        </div>

                        {/* CREATE RESELLER FORM */}
                        <div className="glass-panel p-6 mb-8 border border-green-500/30">
                            <h4 className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-widest">Adicionar Novo Revendedor</h4>
                            <form onSubmit={createReseller} className="flex gap-4">
                                <input
                                    type="text"
                                    placeholder="Nome do Revendedor"
                                    value={newResellerName}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewResellerName(e.target.value)}
                                    className="flex-1 bg-black/50 border border-gray-700 p-3 rounded text-white focus:border-green-500 outline-none"
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="Definir Secret Key"
                                    value={newResellerKey}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewResellerKey(e.target.value)}
                                    className="flex-1 bg-black/50 border border-gray-700 p-3 rounded text-white focus:border-green-500 outline-none"
                                    required
                                />
                                <button disabled={creatingReseller} className="bg-green-600 hover:bg-green-500 text-black font-bold px-6 rounded flex items-center gap-2 transition">
                                    <Plus size={18} /> ADICIONAR
                                </button>
                            </form>
                        </div>

                        {/* RESELLERS LIST */}
                        <div className="grid gap-4">
                            {resellers.map((r) => (
                                <div key={r.id} className={`p-4 border rounded glass-panel flex flex-col md:flex-row justify-between items-center gap-4 ${r.is_active ? 'border-green-500/30' : 'border-red-500/30 opacity-70'}`}>
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${r.is_active ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                                            {r.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-bold text-lg">{r.name}</div>
                                            <div className="text-xs opacity-50 font-mono bg-black/30 p-1 px-2 rounded inline-block mt-1 tracking-wider text-green-400">{r.secret_key}</div>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => handleManageCredits(r.id, r.name)}
                                            className="px-4 py-2 rounded font-bold border border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10 transition flex items-center gap-2 text-xs uppercase"
                                        >
                                            💰 $: {r.balance?.toFixed(2) || '0.00'}
                                        </button>

                                        <button
                                            onClick={() => viewKeys(r.id, r.name)}
                                            className="px-4 py-2 rounded font-bold border border-blue-500/50 text-blue-400 hover:bg-blue-500/10 transition flex items-center gap-2 text-xs uppercase"
                                        >
                                            <Eye size={14} /> Ver Keys
                                        </button>

                                        <button
                                            onClick={() => toggleReseller(r.id, r.is_active)}
                                            className={`px-4 py-2 rounded font-bold flex items-center gap-2 transition text-xs uppercase ${r.is_active ? 'bg-red-900/30 text-red-500 border border-red-500 hover:bg-red-500 hover:text-black' : 'bg-green-900/30 text-green-500 border border-green-500 hover:bg-green-500 hover:text-black'}`}
                                        >
                                            <Power size={14} />
                                            {r.is_active ? 'Bloquear' : 'Ativar'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* EXTERNAL CONNECTIONS TAB */}
                {activeTab === 'connections' && (
                    <div className="space-y-8 animate-fade-in relative z-10">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <Globe className="text-blue-500" /> External Servers
                            </h3>
                            <button className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded flex items-center gap-2 transition text-sm">
                                <Plus size={16} /> ADD SERVER
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* DEMO CARD 1 */}
                            <div className="glass-panel p-6 border border-gray-700 hover:border-blue-500 transition-all rounded-lg group relative overflow-hidden">
                                <div className="absolute top-2 right-2 flex gap-1">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                </div>
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="p-3 bg-blue-500/20 text-blue-400 rounded-lg">
                                        <Activity size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white">Main Provider</h4>
                                        <p className="text-xs text-gray-400">api.provider-x.com</p>
                                    </div>
                                </div>
                                <div className="space-y-2 text-sm text-gray-400">
                                    <div className="flex justify-between">
                                        <span>Status:</span>
                                        <span className="text-green-400 font-bold">ONLINE</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Ping:</span>
                                        <span className="text-white">45ms</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Balance:</span>
                                        <span className="text-green-400">$1,250.00</span>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-700 flex gap-2">
                                    <button className="flex-1 bg-white/5 hover:bg-white/10 py-2 rounded text-xs font-bold transition">TEST CONNECTION</button>
                                    <button className="flex-1 bg-white/5 hover:bg-white/10 py-2 rounded text-xs font-bold transition">SYNC KEYS</button>
                                </div>
                            </div>

                            {/* DEMO CARD 2 (OFFLINE) */}
                            <div className="glass-panel p-6 border border-gray-700 hover:border-red-500 transition-all rounded-lg group opacity-70">
                                <div className="absolute top-2 right-2 flex gap-1">
                                    <div className="w-2 h-2 rounded-full bg-red-500" />
                                </div>
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="p-3 bg-red-500/20 text-red-500 rounded-lg">
                                        <Globe size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white">Backup Server</h4>
                                        <p className="text-xs text-gray-400">backend.backup-v2.net</p>
                                    </div>
                                </div>
                                <div className="space-y-2 text-sm text-gray-400">
                                    <div className="flex justify-between">
                                        <span>Status:</span>
                                        <span className="text-red-500 font-bold">TIMEOUT</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Ping:</span>
                                        <span className="text-red-500">999ms</span>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-700 flex gap-2">
                                    <button className="flex-1 bg-red-500/20 text-red-500 py-2 rounded text-xs font-bold transition">RETRY</button>
                                </div>
                            </div>

                            {/* ADD NEW PLACEHOLDER */}
                            <div className="border border-dashed border-gray-700 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:text-white hover:border-green-500 hover:bg-green-500/5 transition cursor-pointer p-8">
                                <Plus size={40} className="mb-2 opacity-50" />
                                <span className="text-sm font-bold">CONNECT NEW API</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* SETTINGS TAB */}
                {activeTab === 'settings' && settings && (
                    <div className="space-y-8 animate-fade-in relative z-10 glass-panel p-6 rounded border border-gray-800">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-white">Configurações do Sistema</h3>
                            <button
                                onClick={saveSettings}
                                disabled={savingSettings}
                                className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-2 rounded transition"
                            >
                                {savingSettings ? 'Salvando...' : 'Salvar Alterações'}
                            </button>
                        </div>

                        {/* THEME */}
                        <div className="mb-8">
                            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 border-b border-gray-800 pb-2">Tema e Aparência</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-xs uppercase text-gray-500 mb-1">Cor Primária</label>
                                    <div className="flex gap-2">
                                        <input type="color" value={settings.theme_config.primary} onChange={(e) => setSettings({ ...settings, theme_config: { ...settings.theme_config, primary: e.target.value } })} className="h-10 w-10 bg-transparent border-none" />
                                        <input type="text" value={settings.theme_config.primary} onChange={(e) => setSettings({ ...settings, theme_config: { ...settings.theme_config, primary: e.target.value } })} className="bg-black/50 border border-gray-700 p-2 rounded text-white text-sm w-full" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs uppercase text-gray-500 mb-1">Cor Secundária</label>
                                    <div className="flex gap-2">
                                        <input type="color" value={settings.theme_config.secondary} onChange={(e) => setSettings({ ...settings, theme_config: { ...settings.theme_config, secondary: e.target.value } })} className="h-10 w-10 bg-transparent border-none" />
                                        <input type="text" value={settings.theme_config.secondary} onChange={(e) => setSettings({ ...settings, theme_config: { ...settings.theme_config, secondary: e.target.value } })} className="bg-black/50 border border-gray-700 p-2 rounded text-white text-sm w-full" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* CREDITS COSTS */}
                        <div className="mb-8">
                            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 border-b border-gray-800 pb-2">Custo de Créditos (Por Chave)</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-xs uppercase text-gray-500 mb-1">Custo Diário</label>
                                    <input type="number" step="0.1" value={settings.credit_costs.daily} onChange={(e) => setSettings({ ...settings, credit_costs: { ...settings.credit_costs, daily: parseFloat(e.target.value) } })} className="bg-black/50 border border-gray-700 p-3 rounded text-white w-full focus:border-green-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs uppercase text-gray-500 mb-1">Custo Semanal</label>
                                    <input type="number" step="0.1" value={settings.credit_costs.weekly} onChange={(e) => setSettings({ ...settings, credit_costs: { ...settings.credit_costs, weekly: parseFloat(e.target.value) } })} className="bg-black/50 border border-gray-700 p-3 rounded text-white w-full focus:border-green-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs uppercase text-gray-500 mb-1">Custo Mensal</label>
                                    <input type="number" step="0.1" value={settings.credit_costs.monthly} onChange={(e) => setSettings({ ...settings, credit_costs: { ...settings.credit_costs, monthly: parseFloat(e.target.value) } })} className="bg-black/50 border border-gray-700 p-3 rounded text-white w-full focus:border-green-500 outline-none" />
                                </div>
                            </div>
                        </div>

                        {/* OTHER CONFIGS */}
                        <div>
                            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 border-b border-gray-800 pb-2">Configurações de Chave</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs uppercase text-gray-500 mb-1">Prefixo da Chave</label>
                                    <input type="text" value={settings.key_config.prefix} onChange={(e) => setSettings({ ...settings, key_config: { ...settings.key_config, prefix: e.target.value } })} className="bg-black/50 border border-gray-700 p-3 rounded text-white w-full focus:border-green-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs uppercase text-gray-500 mb-1">Tamanho da Chave</label>
                                    <input type="number" value={settings.key_config.length} onChange={(e) => setSettings({ ...settings, key_config: { ...settings.key_config, length: parseInt(e.target.value) } })} className="bg-black/50 border border-gray-700 p-3 rounded text-white w-full focus:border-green-500 outline-none" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* OTHER TABS PLACEHOLDERS */}
                {(activeTab === 'all_keys' || activeTab === 'games') && (
                    <div className="flex items-center justify-center h-64 text-gray-500 italic">
                        Funcionalidade em desenvolvimento...
                    </div>
                )}

                {/* CREDIT MANAGEMENT MODAL */}
                {creditModalOpen && (
                    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
                        <div className="bg-gray-900 border border-yellow-500/50 rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col shadow-[0_0_50px_rgba(255,255,0,0.1)]">
                            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-gray-800/50">
                                <h2 className="font-bold text-xl text-yellow-500 flex items-center gap-2">💰 Gerenciar Saldo: <span className="text-white">{viewingResellerName}</span></h2>
                                <button onClick={() => setCreditModalOpen(false)} className="text-gray-400 hover:text-white transition">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-black/40">
                                {/* Actions */}
                                <div className="glass-panel p-4 mb-6 border border-gray-800">
                                    <h4 className="text-sm font-bold text-gray-400 mb-4 uppercase">Adicionar / Remover Créditos</h4>
                                    <div className="flex gap-4 mb-4">
                                        <input
                                            type="number"
                                            placeholder="Valor"
                                            value={creditAmount}
                                            onChange={(e) => setCreditAmount(e.target.value)}
                                            className="flex-1 bg-black/50 border border-gray-700 p-3 rounded text-white focus:border-yellow-500 outline-none font-mono text-lg"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Descrição (Opcional)"
                                            value={creditDescription}
                                            onChange={(e) => setCreditDescription(e.target.value)}
                                            className="flex-[2] bg-black/50 border border-gray-700 p-3 rounded text-white focus:border-yellow-500 outline-none"
                                        />
                                    </div>
                                    <div className="flex gap-4">
                                        <button onClick={() => submitCreditTransaction('add')} className="flex-1 bg-green-900/40 border border-green-500 text-green-500 py-2 rounded font-bold hover:bg-green-500 hover:text-black transition uppercase">
                                            + Adicionar
                                        </button>
                                        <button onClick={() => submitCreditTransaction('deduct')} className="flex-1 bg-red-900/40 border border-red-500 text-red-500 py-2 rounded font-bold hover:bg-red-500 hover:text-black transition uppercase">
                                            - Remover
                                        </button>
                                    </div>
                                </div>

                                {/* History */}
                                <h4 className="text-sm font-bold text-gray-400 mb-4 uppercase flex justify-between">
                                    Histórico de Transações
                                </h4>
                                <div className="space-y-2">
                                    {creditTransactions.length === 0 ? (
                                        <div className="text-center opacity-50 py-8">Nenhuma transação encontrada.</div>
                                    ) : (
                                        creditTransactions.map((t) => (
                                            <div key={t.id} className="flex justify-between items-center p-3 rounded bg-white/5 border border-white/5 hover:border-gray-600 transition">
                                                <div className="flex flex-col">
                                                    <span className={`text-xs font-bold uppercase ${t.amount >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                        {t.type}
                                                    </span>
                                                    <span className="text-gray-400 text-xs">{t.description}</span>
                                                </div>
                                                <div className="text-right">
                                                    <div className={`font-mono font-bold ${t.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                        {t.amount >= 0 ? '+' : ''}{t.amount.toFixed(2)}
                                                    </div>
                                                    <div className="text-[10px] text-gray-600">{new Date(t.created_at).toLocaleString()}</div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* MODAL VIEW KEYS */}
                {selectedResellerKeys && (
                    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
                        <div className="bg-gray-900 border border-green-500/50 rounded-lg w-full max-w-4xl max-h-[80vh] flex flex-col shadow-[0_0_50px_rgba(0,255,0,0.1)]">
                            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-gray-800/50">
                                <h2 className="font-bold text-xl text-green-400 flex items-center gap-2"><Key size={18} /> Keys de: {viewingResellerName}</h2>
                                <button onClick={() => setSelectedResellerKeys(null)} className="text-gray-400 hover:text-white transition hover:rotate-90 duration-300">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="p-4 overflow-y-auto custom-scrollbar flex-1 bg-black/40">
                                {selectedResellerKeys.length === 0 ? (
                                    <div className="text-center opacity-50 py-20 text-sm tracking-widest uppercase">Nenhuma key gerada.</div>
                                ) : (
                                    <table className="w-full text-left text-sm border-separate border-spacing-y-1">
                                        <thead className="text-gray-500 uppercase text-xs">
                                            <tr>
                                                <th className="pb-3 pl-2">Key</th>
                                                <th className="pb-3 text-center">Tipo</th>
                                                <th className="pb-3 text-center">Data</th>
                                                <th className="pb-3 text-center">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedResellerKeys.map((k) => (
                                                <tr key={k.id} className="hover:bg-white/5 transition bg-white/[0.02]">
                                                    <td className="py-3 pl-4 text-green-400 font-mono font-bold tracking-wider border-l-2 border-green-500/0 hover:border-green-500 transition-all">{k.license_key}</td>
                                                    <td className="py-3 text-center opacity-70 uppercase text-xs">{k.duration_type}</td>
                                                    <td className="py-3 text-center opacity-50">{new Date(k.created_at).toLocaleDateString()}</td>
                                                    <td className="py-3 text-center">
                                                        <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold ${k.status === 'active' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                                                            {k.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
