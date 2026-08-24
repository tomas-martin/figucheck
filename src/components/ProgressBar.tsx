'use client';

import React from 'react';
import { useAlbum } from '../context/AlbumContext';
import { CheckCircle2, HelpCircle, Copy, Percent, Sparkles } from 'lucide-react';

export default function ProgressBar() {
  const { stats } = useAlbum();

  return (
    <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 sm:p-6 backdrop-blur-sm mb-6 shadow-xl">
      {/* Main Bar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-400" />
          <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
            Estado de la Colección
          </h2>
        </div>
        <div className="text-xs font-semibold text-slate-400">
          Total del Álbum: <span className="text-white font-bold">{stats.total} figuritas</span>
        </div>
      </div>

      {/* Main Animated Progress Bar */}
      <div className="relative w-full h-4 bg-slate-900/80 rounded-full overflow-hidden p-0.5 border border-slate-700/80 mb-6">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 rounded-full transition-all duration-700 ease-out shadow-lg shadow-emerald-500/30"
          style={{ width: `${stats.percentage}%` }}
        />
      </div>

      {/* 4 Stat Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Tengo */}
        <div className="bg-slate-900/70 border border-emerald-500/30 rounded-xl p-3.5 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Tengo</div>
            <div className="text-lg sm:text-xl font-black text-emerald-400">
              {stats.obtained}
            </div>
          </div>
        </div>

        {/* Faltan */}
        <div className="bg-slate-900/70 border border-rose-500/20 rounded-xl p-3.5 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Faltan</div>
            <div className="text-lg sm:text-xl font-black text-rose-400">
              {stats.missing}
            </div>
          </div>
        </div>

        {/* Repetidas */}
        <div className="bg-slate-900/70 border border-amber-500/20 rounded-xl p-3.5 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Copy className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Repetidas</div>
            <div className="text-lg sm:text-xl font-black text-amber-400">
              {stats.repeatedTotal}
            </div>
          </div>
        </div>

        {/* Porcentaje */}
        <div className="bg-slate-900/70 border border-teal-500/20 rounded-xl p-3.5 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20">
            <Percent className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Completado</div>
            <div className="text-lg sm:text-xl font-black text-teal-300">
              {stats.percentage}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
