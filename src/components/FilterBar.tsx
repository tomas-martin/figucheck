'use client';

import React from 'react';
import { useAlbum } from '../context/AlbumContext';
import { StickerStatusFilter } from '../types';
import { Search, Filter, CheckCircle2, HelpCircle, Copy, X } from 'lucide-react';

export default function FilterBar() {
  const { filters, setFilterStatus, setSearchQuery, filteredStickers, stats } = useAlbum();

  const statusOptions: { id: StickerStatusFilter; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'ALL', label: 'Todas', icon: <Filter className="w-3.5 h-3.5" />, count: stats.total },
    { id: 'HAVE', label: 'Tengo', icon: <CheckCircle2 className="w-3.5 h-3.5" />, count: stats.obtained },
    { id: 'MISSING', label: 'Faltan', icon: <HelpCircle className="w-3.5 h-3.5" />, count: stats.missing },
    { id: 'REPEATED', label: 'Repetidas', icon: <Copy className="w-3.5 h-3.5" />, count: stats.repeatedTotal }
  ];

  return (
    <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-3 mb-6 backdrop-blur-sm">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {statusOptions.map((opt) => {
            const isActive = filters.status === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setFilterStatus(opt.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  isActive
                    ? opt.id === 'MISSING'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : opt.id === 'REPEATED'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : opt.id === 'HAVE'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                    : 'bg-slate-900/60 hover:bg-slate-900 text-slate-400 border border-transparent'
                }`}
              >
                {opt.icon}
                <span>{opt.label}</span>
                {opt.count !== undefined && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? 'bg-slate-900/60 text-white' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {opt.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search Bar & Result counter */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por N°, equipo o jugador..."
              className="w-full bg-slate-900/90 border border-slate-700/80 focus:border-emerald-500 rounded-lg pl-8 pr-8 py-1.5 text-xs text-slate-200 placeholder-slate-500 outline-none transition-colors"
            />
            {filters.searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <span className="text-[11px] font-semibold text-slate-400 whitespace-nowrap hidden sm:inline">
            {filteredStickers.length} figus
          </span>
        </div>
      </div>
    </div>
  );
}
