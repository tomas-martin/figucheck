'use client';

import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import ProgressBar from '../components/ProgressBar';
import TeamSelector from '../components/TeamSelector';
import FilterBar from '../components/FilterBar';
import StickerGrid from '../components/StickerGrid';
import { useAlbum } from '../context/AlbumContext';
import { Trophy, Trash2, HelpCircle } from 'lucide-react';

export default function Home() {
  const { resetAllStickers, stats } = useAlbum();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Progress Dashboard */}
        <ProgressBar />

        {/* Team Selector Strip */}
        <TeamSelector />

        {/* Status Filter & Search Bar */}
        <FilterBar />

        {/* Sticker Album Grid */}
        <StickerGrid />

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-900/50 py-8 px-4 text-center text-xs text-slate-400 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-center sm:text-left">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="FiguCheck Logo" className="w-6 h-6 rounded-md object-cover ring-1 ring-emerald-500/30" />
              <span className="font-semibold text-slate-300">FiguCheck Mendoza</span>
            </div>
            <span className="hidden sm:inline text-slate-600">•</span>
            <span className="text-slate-500">252 Figuritas (16 Equipos + Leyendas)</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6">
            <p className="text-slate-400 font-medium">
              © 2026 <span className="font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">TottiDev</span> · Developed by <span className="text-slate-200 font-semibold">Tomás Martín</span>
            </p>

            <button
              onClick={() => setShowResetConfirm(true)}
              className="flex items-center gap-1.5 text-rose-400 hover:text-rose-300 transition-colors font-medium text-xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reiniciar Álbum</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-white mb-1">
                ¿Reiniciar todo el álbum?
              </h3>
              <p className="text-xs text-slate-400">
                Esta acción borrará todas las figuritas marcadas ({stats.obtained} marcadas actualmente). Esta acción no se puede deshacer.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  resetAllStickers();
                  setShowResetConfirm(false);
                }}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30"
              >
                Sí, Reiniciar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
