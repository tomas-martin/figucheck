'use client';

import React, { useState } from 'react';
import { useAlbum } from '../context/AlbumContext';
import { X, User, Lock, Phone, LogIn, UserPlus, Eye, EyeOff, AlertCircle } from 'lucide-react';

interface AuthModalProps {
  onClose: () => void;
}

export default function AuthModal({ onClose }: AuthModalProps) {
  const { signUp, signIn, authError } = useAlbum();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [phoneWhatsapp, setPhoneWhatsapp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!username.trim() || !password.trim()) {
      setLocalError('Completá el usuario y la contraseña.');
      return;
    }

    if (mode === 'register' && password.length < 6) {
      setLocalError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setIsLoading(true);

    let ok = false;
    if (mode === 'register') {
      ok = await signUp(username.trim(), password, phoneWhatsapp.trim() || undefined);
    } else {
      ok = await signIn(username.trim(), password);
    }

    setIsLoading(false);

    if (ok) {
      setSuccess(true);
      setTimeout(() => onClose(), 800);
    }
  };

  const displayError = localError || authError;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              {mode === 'login' ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
            </div>
            <h3 className="text-base font-bold text-white">
              {mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Username */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-emerald-400" />
              <span>Usuario</span>
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value.replace(/\s/g, ''))}
              placeholder="Ej: juanfutsal"
              maxLength={30}
              className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-400 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none transition-colors"
              autoComplete="username"
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Contraseña</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'register' ? 'Mínimo 6 caracteres' : '••••••'}
                minLength={mode === 'register' ? 6 : 1}
                className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-400 rounded-xl px-3.5 py-2.5 pr-10 text-sm text-white outline-none transition-colors"
                autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* WhatsApp (only on register) */}
          {mode === 'register' && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>WhatsApp (opcional)</span>
              </label>
              <input
                type="text"
                value={phoneWhatsapp}
                onChange={(e) => setPhoneWhatsapp(e.target.value)}
                placeholder="Ej: +54 9 261 555-1234"
                className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-400 rounded-xl px-3.5 py-2.5 text-sm text-white outline-none transition-colors"
              />
              <p className="text-[10px] text-slate-500">
                Así otros usuarios te pueden contactar para intercambiar figuritas.
              </p>
            </div>
          )}

          {/* Error */}
          {displayError && (
            <div className="bg-rose-950/50 border border-rose-500/30 rounded-xl p-2.5 flex items-center gap-2 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{displayError}</span>
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="bg-emerald-950/50 border border-emerald-500/30 rounded-xl p-2.5 text-xs text-emerald-300 text-center font-bold">
              ¡{mode === 'register' ? 'Cuenta creada' : 'Sesión iniciada'} correctamente! ✅
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
          >
            {mode === 'login' ? (
              <LogIn className="w-4 h-4" />
            ) : (
              <UserPlus className="w-4 h-4" />
            )}
            <span>
              {isLoading
                ? 'Cargando...'
                : mode === 'login'
                ? 'Iniciar Sesión'
                : 'Crear Cuenta'}
            </span>
          </button>

          {/* Toggle mode */}
          <div className="text-center text-xs text-slate-400 pt-1">
            {mode === 'login' ? (
              <span>
                ¿No tenés cuenta?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('register'); setLocalError(null); }}
                  className="text-emerald-400 font-bold hover:underline"
                >
                  Registrate
                </button>
              </span>
            ) : (
              <span>
                ¿Ya tenés cuenta?{' '}
                <button
                  type="button"
                  onClick={() => { setMode('login'); setLocalError(null); }}
                  className="text-emerald-400 font-bold hover:underline"
                >
                  Iniciá Sesión
                </button>
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
