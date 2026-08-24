'use client';

import React from 'react';
import { useAlbum } from '../context/AlbumContext';
import StickerCard from './StickerCard';
import { Shield, Star, SearchX } from 'lucide-react';

export default function StickerGrid() {
  const { filteredStickers, filters, teams, getTeamStats } = useAlbum();

  if (filteredStickers.length === 0) {
    return (
      <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-12 text-center my-8">
        <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-500">
          <SearchX className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-white mb-1">
          No hay figuritas para mostrar
        </h3>
        <p className="text-xs text-slate-400 max-w-xs mx-auto">
          Intenta cambiar el filtro de estado o la búsqueda para ver más figuritas.
        </p>
      </div>
    );
  }

  // If a single team is selected, show grid directly
  if (filters.teamId !== 'ALL') {
    const activeTeam = teams.find((t) => t.id === filters.teamId);
    const stat = activeTeam ? getTeamStats(activeTeam.id) : null;
    const isLeyendas = activeTeam?.slug === 'leyendas';

    return (
      <div className="mb-10">
        {/* Team Banner Header */}
        {activeTeam && (
          <div className={`rounded-xl p-4 mb-4 flex items-center justify-between border ${
            isLeyendas
              ? 'bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/80 border-amber-500/40'
              : 'bg-slate-800/80 border-slate-700'
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 relative flex items-center justify-center">
                {isLeyendas ? (
                  <Star className="w-7 h-7 text-amber-400 fill-amber-400" />
                ) : activeTeam.logoUrl ? (
                  <img src={activeTeam.logoUrl} alt={activeTeam.name} className="w-9 h-9 object-contain" />
                ) : (
                  <Shield className="w-8 h-8 text-slate-400" />
                )}
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                  {activeTeam.name}
                  <span className="text-xs font-semibold text-slate-400">({activeTeam.shortName})</span>
                </h2>
                <p className="text-xs text-slate-400">
                  {isLeyendas ? 'Jugadores Históricos Mendoza' : `${activeTeam.city}, ${activeTeam.country}`}
                </p>
              </div>
            </div>

            {stat && (
              <div className="text-right">
                <div className="text-sm font-black text-emerald-400">
                  {stat.obtained} / {stat.total}
                </div>
                <div className="text-[10px] font-bold text-slate-400">
                  {stat.percentage}% completado
                </div>
              </div>
            )}
          </div>
        )}

        {/* Sticker Cards Responsive Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {filteredStickers.map((sticker) => (
            <StickerCard key={sticker.number} sticker={sticker} />
          ))}
        </div>
      </div>
    );
  }

  // If ALL teams selected, group by Team
  // Create mapping of teams that have matching stickers
  const teamsWithStickers = teams.filter((t) =>
    filteredStickers.some((s) => s.teamId === t.id)
  );

  return (
    <div className="space-y-8 mb-12">
      {teamsWithStickers.map((team) => {
        const teamStickers = filteredStickers.filter((s) => s.teamId === team.id);
        const stat = getTeamStats(team.id);
        const isLeyendas = team.slug === 'leyendas';

        return (
          <div key={team.id} className="scroll-mt-20" id={`team-${team.slug}`}>
            {/* Team Section Title */}
            <div className="flex items-center justify-between gap-3 mb-3 pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 relative flex items-center justify-center">
                  {isLeyendas ? (
                    <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                  ) : team.logoUrl ? (
                    <img src={team.logoUrl} alt={team.name} className="w-6 h-6 object-contain" />
                  ) : (
                    <Shield className="w-5 h-5 text-slate-400" />
                  )}
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white">
                  {team.name}
                </h3>
                <span className="text-xs font-semibold text-slate-500">
                  ({team.shortName})
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-300">
                  {stat.obtained}/{stat.total}
                </span>
                <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden hidden xs:block">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${stat.percentage}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {teamStickers.map((sticker) => (
                <StickerCard key={sticker.number} sticker={sticker} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
