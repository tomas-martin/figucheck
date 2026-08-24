'use client';

import React, { useState } from 'react';
import { useAlbum } from '../context/AlbumContext';
import { Share2, RefreshCw, Smartphone, Award, Trophy, RotateCcw } from 'lucide-react';
import ShareModal from './ShareModal';
import SyncModal from './SyncModal';

export default function Navbar() {
  const { stats, isSyncing, syncCode } = useAlbum();
  const [showShareModal, setShowShareModal] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-emerald-400 bg-clip-text text-transparent">
                  FiguCheck
                </span>
                <span className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Futsal Mendoza
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium hidden sm:block">
                Contador de figuritas 2026
              </p>
            </div>
          </div>

          {/* Center Progress pill (desktop) */}
          <div className="hidden md:flex items-center gap-4 bg-slate-800/80 border border-slate-700/60 rounded-full px-4 py-1.5">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold text-slate-300">Progreso:</span>
              <span className="text-sm font-bold text-emerald-400">
                {stats.obtained} / {stats.total}
              </span>
              <span className="text-xs font-bold text-slate-400">({stats.percentage}%)</span>
            </div>
            <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                style={{ width: `${stats.percentage}%` }}
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Sync Cloud button */}
            <button
              onClick={() => setShowSyncModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-all"
              title="Sincronizar Celular / PC"
            >
              <Smartphone className="w-4 h-4 text-teal-400" />
              <span className="hidden sm:inline font-mono">{syncCode}</span>
              {isSyncing && <RefreshCw className="w-3.5 h-3.5 animate-spin text-teal-400" />}
            </button>

            {/* Share WhatsApp button */}
            <button
              onClick={() => setShowShareModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition-all active:scale-95"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden xs:inline">Compartir</span>
            </button>
          </div>
        </div>
      </header>

      {/* Modals */}
      {showShareModal && <ShareModal onClose={() => setShowShareModal(false)} />}
      {showSyncModal && <SyncModal onClose={() => setShowSyncModal(false)} />}
    </>
  );
}
