'use client';

import React, { useState } from 'react';
import { useAlbum } from '../context/AlbumContext';
import { Share2, RefreshCw, Award, Trophy, Handshake, User, LogIn, LogOut, BookOpen } from 'lucide-react';
import ShareModal from './ShareModal';
import AuthModal from './AuthModal';
import ProfileModal from './ProfileModal';
import TradeMarketModal from './TradeMarketModal';
import UserManualModal from './UserManualModal';

export default function Navbar() {
  const { stats, isSyncing, user, signOut, syncCloud } = useAlbum();
  const [showShareModal, setShowShareModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo & Brand (Click to scroll top) */}
          <button
            onClick={scrollToTop}
            className="flex items-center gap-3 text-left focus:outline-none group cursor-pointer"
            title="Volver al inicio (scroll arriba)"
          >
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-emerald-500/30 ring-1 ring-emerald-500/40 bg-slate-900 flex-shrink-0 group-hover:scale-105 transition-transform">
              <img src="/logo.png" alt="FiguCheck Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-emerald-400 bg-clip-text text-transparent group-hover:from-emerald-300 group-hover:to-teal-300 transition-colors">
                  FiguCheck
                </span>
                <span className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hidden sm:inline">
                  Futsal Mendoza
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium hidden sm:block">
                Contador de figuritas 2026
              </p>
            </div>
          </button>

          {/* Center Progress pill (desktop) */}
          <div className="hidden lg:flex items-center gap-4 bg-slate-800/80 border border-slate-700/60 rounded-full px-4 py-1.5">
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
          <div className="flex items-center gap-2 sm:gap-2.5">
            
            {/* Manual Button */}
            <button
              onClick={() => setShowManualModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all active:scale-95 shadow-sm"
              title="Manual de Usuario"
            >
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Manual</span>
            </button>

            {/* Trade Market */}
            <button
              onClick={() => setShowTradeModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition-all active:scale-95 shadow-sm"
              title="Mercado de Intercambio"
            >
              <Handshake className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Canjes</span>
            </button>

            {/* Sync button (only when logged in) */}
            {user && (
              <button
                onClick={() => syncCloud()}
                disabled={isSyncing}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-all hidden md:flex"
                title="Sincronizar con la nube"
              >
                <RefreshCw className={`w-4 h-4 text-teal-400 ${isSyncing ? 'animate-spin' : ''}`} />
                <span className="text-[11px]">Sincronizar</span>
              </button>
            )}

            {/* User / Auth */}
            {user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowProfileModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-all"
                  title="Mi perfil"
                >
                  <div className="w-5 h-5 rounded-md bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-[10px] font-black flex items-center justify-center">
                    {user.username.slice(0, 1).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline font-semibold max-w-[80px] truncate">
                    {user.username}
                  </span>
                </button>
                <button
                  onClick={signOut}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 transition-all active:scale-95"
              >
                <LogIn className="w-4 h-4" />
                <span>Ingresar</span>
              </button>
            )}

            {/* Share */}
            <button
              onClick={() => setShowShareModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-all active:scale-95"
            >
              <Share2 className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Compartir</span>
            </button>
          </div>
        </div>
      </header>

      {/* Modals */}
      {showManualModal && <UserManualModal onClose={() => setShowManualModal(false)} />}
      {showShareModal && <ShareModal onClose={() => setShowShareModal(false)} />}
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      {showProfileModal && <ProfileModal onClose={() => setShowProfileModal(false)} />}
      {showTradeModal && (
        <TradeMarketModal
          onClose={() => setShowTradeModal(false)}
          onOpenAuth={() => {
            setShowTradeModal(false);
            setShowAuthModal(true);
          }}
        />
      )}
    </>
  );
}

