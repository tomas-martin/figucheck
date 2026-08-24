'use client';

import React, { useState, useEffect } from 'react';
import { useAlbum } from '../context/AlbumContext';
import { TradeMatch } from '../types';
import { isSupabaseConfigured } from '../lib/supabase';
import { Handshake, MessageSquare, MapPin, RefreshCw, X, Sparkles, CheckCircle2, Copy, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface TradeMarketModalProps {
  onClose: () => void;
  onOpenAuth: () => void;
}

export default function TradeMarketModal({ onClose, onOpenAuth }: TradeMarketModalProps) {
  const { user, getTradeMatches, generateTradeProposalWhatsAppText, stickers } = useAlbum();
  const [matches, setMatches] = useState<TradeMatch[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadMatches = async () => {
    setIsLoading(true);
    const result = await getTradeMatches();
    setMatches(result);
    setIsLoading(false);
  };

  useEffect(() => {
    if (user) loadMatches();
    else setIsLoading(false);
  }, [user]);

  const handleSendWhatsAppProposal = (match: TradeMatch) => {
    const text = generateTradeProposalWhatsAppText(match);
    const encoded = encodeURIComponent(text);
    if (match.phoneWhatsapp) {
      const cleanPhone = match.phoneWhatsapp.replace(/[^0-9]/g, '');
      window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, '_blank');
    } else {
      window.open(`https://wa.me/?text=${encoded}`, '_blank');
    }
  };

  const handleCopyProposal = (match: TradeMatch) => {
    const text = generateTradeProposalWhatsAppText(match);
    navigator.clipboard.writeText(text);
    setCopiedId(match.userId);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const getStickerLabel = (num: number) => {
    const s = stickers.find((item) => item.number === num);
    return s ? `${s.teamShortName} #${s.slotNumber}` : `#${num}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Handshake className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Mercado de Intercambio
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                  Canjes
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Encontrá coincidencias con otros coleccionistas
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Not logged in warning */}
        {!user && (
          <div className="bg-amber-950/40 border-b border-amber-500/30 px-6 py-3 flex items-center justify-between text-xs text-amber-200">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>Tenés que iniciar sesión para usar el Mercado de Canjes.</span>
            </div>
            <button
              onClick={() => { onClose(); onOpenAuth(); }}
              className="font-bold underline text-amber-300 hover:text-white"
            >
              Iniciar Sesión
            </button>
          </div>
        )}

        {/* Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
          {user && (
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Coleccionistas Compatibles ({matches.length})
              </span>
              <button
                onClick={loadMatches}
                disabled={isLoading}
                className="flex items-center gap-1.5 text-xs text-teal-400 hover:text-teal-300 font-semibold"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Actualizar</span>
              </button>
            </div>
          )}

          {!isSupabaseConfigured && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-slate-400 space-y-2">
              <div className="font-bold text-slate-200 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>¿Cómo funciona?</span>
              </div>
              <p>
                Conectá Supabase para que la app busque usuarios que tienen las figuritas que te faltan y necesitan las que vos tenés repetidas.
              </p>
            </div>
          )}

          {isLoading && user ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-amber-400" />
              <p className="text-xs">Buscando coincidencias...</p>
            </div>
          ) : !user ? null : matches.length === 0 ? (
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center mx-auto text-slate-500">
                <Handshake className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white mb-1">
                  No hay coincidencias todavía
                </h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Cuando otros usuarios se registren y sincronicen sus figuritas, vas a ver acá las coincidencias de canje automáticamente.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {matches.map((match) => {
                const isExpanded = expandedUser === match.userId;

                return (
                  <div key={match.userId} className="bg-slate-950/80 border border-slate-800 hover:border-amber-500/40 rounded-xl p-4 transition-all">
                    {/* User Summary */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 text-slate-950 font-black text-sm flex items-center justify-center shadow-md shadow-amber-500/20">
                          {match.username.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-bold text-sm text-white">{match.username}</span>
                          {match.phoneWhatsapp && (
                            <div className="text-xs text-slate-400 mt-0.5">📱 WhatsApp disponible</div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSendWhatsAppProposal(match)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition-all active:scale-95"
                        >
                          <MessageSquare className="w-3.5 h-3.5 fill-white" />
                          <span>Proponer Canje</span>
                        </button>
                        <button
                          onClick={() => setExpandedUser(isExpanded ? null : match.userId)}
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Match pills */}
                    <div className="mt-3 pt-3 border-t border-slate-900 flex flex-wrap items-center gap-2 text-xs">
                      <span className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2.5 py-1 rounded-md font-medium">
                        Tiene <strong className="font-bold">{match.stickersTheyHaveThatINeed.length}</strong> que te faltan
                      </span>
                      <span className="bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2.5 py-1 rounded-md font-medium">
                        Busca <strong className="font-bold">{match.stickersIHaveThatTheyNeed.length}</strong> de tus repetidas
                      </span>
                    </div>

                    {/* Expanded detail */}
                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-3 text-xs">
                        {match.stickersTheyHaveThatINeed.length > 0 && (
                          <div>
                            <div className="text-[11px] font-bold text-emerald-400 mb-1.5">
                              📌 Tiene para darte ({match.stickersTheyHaveThatINeed.length}):
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {match.stickersTheyHaveThatINeed.map((num) => (
                                <span key={num} className="bg-emerald-950/80 text-emerald-200 border border-emerald-500/30 px-2 py-0.5 rounded text-[11px] font-mono">
                                  {getStickerLabel(num)}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {match.stickersIHaveThatTheyNeed.length > 0 && (
                          <div>
                            <div className="text-[11px] font-bold text-amber-400 mb-1.5">
                              🔁 Vos tenés para darle ({match.stickersIHaveThatTheyNeed.length}):
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {match.stickersIHaveThatTheyNeed.map((num) => (
                                <span key={num} className="bg-amber-950/80 text-amber-200 border border-amber-500/30 px-2 py-0.5 rounded text-[11px] font-mono">
                                  {getStickerLabel(num)}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="pt-2 flex justify-end">
                          <button
                            onClick={() => handleCopyProposal(match)}
                            className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-slate-200"
                          >
                            {copiedId === match.userId ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                            <span>{copiedId === match.userId ? '¡Copiado!' : 'Copiar mensaje'}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
