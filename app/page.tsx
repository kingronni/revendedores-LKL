'use client';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

                        </div >
    <button type="submit" className="w-full mt-8 bg-green-900/20 border border-green-500 text-green-500 py-3 text-sm font-bold hover:bg-green-500 hover:text-black transition-all duration-300 uppercase tracking-widest hover:shadow-[0_0_20px_rgba(0,255,65,0.4)]">
        ACESSAR PAINEL
    </button>
                    </form >
                </div >
            </main >
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
