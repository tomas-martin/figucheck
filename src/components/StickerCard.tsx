'use client';

import React from 'react';
import { useAlbum } from '../context/AlbumContext';
import { Sticker } from '../types';
import { Check, Plus, Minus, Star, Shield } from 'lucide-react';

interface StickerCardProps {
  sticker: Sticker;
}

export default function StickerCard({ sticker }: StickerCardProps) {
  const { userStickers, incrementSticker, decrementSticker, teams } = useAlbum();

  const count = userStickers[sticker.number] || 0;
  const isObtained = count >= 1;
  const isRepeated = count > 1;
  const isSpecial = sticker.isSpecial;

  // Find team for logo
  const team = teams.find((t) => t.id === sticker.teamId);

  return (
    <div
      className={`relative group rounded-xl p-2.5 sm:p-3 transition-all duration-200 select-none flex flex-col justify-between cursor-pointer border ${
        isSpecial
          ? isRepeated
            ? 'bg-gradient-to-br from-amber-950/90 via-amber-900/90 to-yellow-900/90 border-amber-400/90 shadow-lg shadow-amber-500/20 ring-1 ring-amber-400/50'
            : isObtained
            ? 'bg-gradient-to-br from-amber-950/80 to-slate-900 border-amber-500/60 shadow-md shadow-amber-500/10'
            : 'bg-slate-900/70 border-amber-500/30 hover:border-amber-400/60'
          : isRepeated
          ? 'bg-gradient-to-br from-amber-950/70 via-slate-900 to-amber-950/50 border-amber-500/80 shadow-md shadow-amber-500/20'
          : isObtained
          ? 'bg-gradient-to-br from-emerald-950/70 via-slate-900 to-slate-900 border-emerald-500/70 shadow-md shadow-emerald-500/10'
          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
      }`}
      onClick={() => incrementSticker(sticker.number)}
    >
      {/* Top Header: Sticker Number & Status Indicator */}
      <div className="flex items-center justify-between gap-1 mb-2">
        <span
          className={`text-[10px] sm:text-xs font-black tracking-wider px-1.5 py-0.5 rounded-md ${
            isSpecial
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              : 'bg-slate-800 text-slate-300 border border-slate-700'
          }`}
        >
          #{sticker.number}
        </span>

        {/* Status Badge */}
        {isRepeated ? (
          <span className="flex items-center gap-0.5 text-[11px] font-black px-1.5 py-0.5 rounded-md bg-amber-500 text-slate-950 shadow-sm animate-pulse">
            x{count}
          </span>
        ) : isObtained ? (
          <span className="p-1 rounded-md bg-emerald-500 text-slate-950">
            <Check className="w-3 h-3 stroke-[3]" />
          </span>
        ) : (
          <span className="p-1 rounded-md text-slate-600 group-hover:text-emerald-400 transition-colors">
            <Plus className="w-3 h-3" />
          </span>
        )}
      </div>

      {/* Center Body: Shield/Logo & Player Slot */}
      <div className="flex flex-col items-center justify-center my-1.5 sm:my-2 text-center">
        <div className="relative w-9 h-9 sm:w-11 sm:h-11 mb-1.5 flex items-center justify-center">
          {isSpecial ? (
            <Star className={`w-8 h-8 ${isObtained ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`} />
          ) : team?.logoUrl ? (
            <img
              src={team.logoUrl}
              alt={team.name}
              className={`w-9 h-9 sm:w-10 sm:h-10 object-contain transition-all duration-300 ${
                isObtained ? 'opacity-100 scale-100 drop-shadow-md' : 'opacity-30 grayscale scale-95'
              }`}
              loading="lazy"
            />
          ) : (
            <Shield className={`w-8 h-8 ${isObtained ? 'text-emerald-400' : 'text-slate-600'}`} />
          )}
        </div>

        {/* Team Short Code + Slot Number */}
        <div className="text-[11px] sm:text-xs font-bold tracking-tight text-white line-clamp-1">
          {sticker.teamShortName} #{sticker.slotNumber}
        </div>
        <div className={`text-[9px] sm:text-[10px] font-medium line-clamp-1 ${isObtained ? 'text-slate-300' : 'text-slate-500'}`}>
          {sticker.playerName}
        </div>
      </div>

      {/* Bottom Footer & Increment/Decrement Controls */}
      <div className="mt-1 pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
        <span
          className={`font-semibold ${
            isRepeated
              ? 'text-amber-400 font-bold'
              : isObtained
              ? 'text-emerald-400'
              : 'text-slate-500'
          }`}
        >
          {isRepeated ? `Repetida (${count - 1})` : isObtained ? 'Tengo (1)' : 'Falta (0)'}
        </span>

        {/* Interactive +/- Buttons when owned */}
        {isObtained && (
          <div
            className="flex items-center gap-1"
            onClick={(e) => e.stopPropagation()} // Prevent card click trigger
          >
            <button
              onClick={() => decrementSticker(sticker.number)}
              className="p-1 rounded bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-300 border border-slate-700 transition-colors"
              title="Restar una figurita"
            >
              <Minus className="w-2.5 h-2.5" />
            </button>
            <button
              onClick={() => incrementSticker(sticker.number)}
              className="p-1 rounded bg-slate-800 hover:bg-emerald-900/60 text-slate-300 hover:text-emerald-300 border border-slate-700 transition-colors"
              title="Sumar otra figurita (repetida)"
            >
              <Plus className="w-2.5 h-2.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
