'use client';

import React from 'react';
import { useAlbum } from '../context/AlbumContext';
import { Shield, Star, Grid } from 'lucide-react';
import Image from 'next/image';

export default function TeamSelector() {
  const { teams, filters, setFilterTeam, getTeamStats, stats } = useAlbum();

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Equipos ({teams.length})
        </h3>
        {filters.teamId !== 'ALL' && (
          <button
            onClick={() => setFilterTeam('ALL')}
            className="text-xs font-semibold text-emerald-400 hover:underline"
          >
            Ver todos
          </button>
        )}
      </div>

      {/* Horizontal Scroll Bar for Teams */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-3 pt-1 scrollbar-thin scrollbar-thumb-slate-700 no-scrollbar">
        
        {/* Option 1: ALL TEAMS */}
        <button
          onClick={() => setFilterTeam('ALL')}
          className={`flex-shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
            filters.teamId === 'ALL'
              ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-600/30 ring-2 ring-emerald-400/50'
              : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border-slate-700/70'
          }`}
        >
          <Grid className="w-4 h-4" />
          <span>Todos</span>
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
            filters.teamId === 'ALL' ? 'bg-emerald-700 text-emerald-100' : 'bg-slate-700 text-slate-300'
          }`}>
            {stats.obtained}/{stats.total}
          </span>
        </button>

        {/* 16 Teams + Leyendas list */}
        {teams.map((team) => {
          const isSelected = filters.teamId === team.id;
          const isLeyendas = team.slug === 'leyendas';
          const teamStat = getTeamStats(team.id);
          const isCompleted = teamStat.obtained === teamStat.total;

          return (
            <button
              key={team.id}
              onClick={() => setFilterTeam(team.id)}
              className={`flex-shrink-0 flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                isSelected
                  ? isLeyendas
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/30 ring-2 ring-amber-400/50'
                    : 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-600/30 ring-2 ring-emerald-400/50'
                  : isLeyendas
                  ? 'bg-amber-950/40 hover:bg-amber-900/60 text-amber-200 border-amber-500/40'
                  : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border-slate-700/70'
              }`}
            >
              {/* Team Logo / Icon */}
              <div className="relative w-6 h-6 flex-shrink-0 flex items-center justify-center">
                {isLeyendas ? (
                  <Star className={`w-5 h-5 fill-amber-400 text-amber-400`} />
                ) : team.logoUrl ? (
                  <img
                    src={team.logoUrl}
                    alt={team.name}
                    className="w-6 h-6 object-contain drop-shadow-sm"
                    loading="lazy"
                    onError={(e) => {
                      // Fallback icon if URL fails
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <Shield className="w-5 h-5 text-slate-400" />
                )}
              </div>

              {/* Team Name */}
              <span className="whitespace-nowrap font-medium">{team.name}</span>

              {/* Team Progress Badge */}
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  isCompleted
                    ? 'bg-emerald-400/20 text-emerald-300 border border-emerald-500/40'
                    : isSelected
                    ? isLeyendas
                      ? 'bg-amber-700/40 text-amber-950'
                      : 'bg-emerald-700 text-emerald-100'
                    : 'bg-slate-700/70 text-slate-300'
                }`}
              >
                {teamStat.obtained}/{teamStat.total}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
