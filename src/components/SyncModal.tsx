'use client';

import React, { useState } from 'react';
import { useAlbum } from '../context/AlbumContext';
import { isSupabaseConfigured } from '../lib/supabase';
import { X, Smartphone, RefreshCw, Check, Cloud, Key, AlertCircle } from 'lucide-react';

interface SyncModalProps {
  onClose: () => void;
}

export default function SyncModal({ onClose }: SyncModalProps) {
  const { syncCode, setSyncCode, syncCloud, isSyncing, lastSyncTime } = useAlbum();
  const [inputCode, setInputCode] = useState(syncCode);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleApplyAndSync = async () => {
    if (!inputCode.trim()) return;
    setSyncCode(inputCode);
    setSyncStatus('idle');
    
    const success = await syncCloud();
    if (success) {
      setSyncStatus('success');
      setTimeout(() => setSyncStatus('idle'), 3000);
    } else {
      setSyncStatus('error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-teal-400" />
            <h3 className="text-base font-bold text-white">
              Sincronización Celular / PC
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 space-y-2">
            <div className="flex items-start gap-2 text-teal-300 font-bold">
              <Cloud className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
              <span>¿Cómo funciona la sincronización?</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Ingresá el mismo **Código de Sincronización** en tu celular y en tu PC. Tus figuritas se guardarán en Supabase y se mantendrán sincronizadas en todos tus dispositivos.
            </p>
          </div>

          {!isSupabaseConfigured && (
            <div className="bg-amber-950/40 border border-amber-500/30 rounded-xl p-3 flex items-start gap-2.5 text-xs text-amber-300">
              <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Modo Local Activo:</span> Para habilitar Supabase en la nube, configura las variables `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` en Vercel. Por ahora tus datos se guardan de forma segura en la memoria de este navegador.
              </div>
            </div>
          )}

          {/* Sync Code Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span>Tu Código de Sincronización</span>
              <Key className="w-3.5 h-3.5 text-slate-500" />
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                placeholder="Ej: FIGU-8492"
                maxLength={10}
                className="flex-1 bg-slate-950 border border-slate-700 focus:border-teal-400 rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold text-center tracking-widest text-teal-300 outline-none uppercase"
              />
            </div>
          </div>

          {/* Sync Feedback */}
          {lastSyncTime && (
            <div className="text-[11px] text-slate-400 text-center font-medium">
              Última sincronización exitosa: <span className="text-teal-400 font-bold">{lastSyncTime}</span>
            </div>
          )}

          {syncStatus === 'success' && (
            <div className="bg-emerald-950/50 border border-emerald-500/40 rounded-xl p-2.5 text-xs font-bold text-emerald-300 text-center flex items-center justify-center gap-2">
              <Check className="w-4 h-4" />
              <span>¡Sincronización completada!</span>
            </div>
          )}

          {/* Sync Action Button */}
          <button
            onClick={handleApplyAndSync}
            disabled={isSyncing || !inputCode.trim()}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-slate-950 shadow-lg shadow-teal-600/20 transition-all active:scale-95"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Sincronizando con Supabase...' : 'Sincronizar Ahora'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
