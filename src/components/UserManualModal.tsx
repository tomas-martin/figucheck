'use client';

import React, { useState } from 'react';
import { X, BookOpen, ArrowUp, Plus, Minus, Check, Repeat, Search, Handshake, Cloud, Share2, Trash2 } from 'lucide-react';

interface UserManualModalProps {
  onClose: () => void;
}

export default function UserManualModal({ onClose }: UserManualModalProps) {
  const [activeTab, setActiveTab] = useState<'inicio' | 'marcado' | 'filtros' | 'canjes' | 'cuenta'>('inicio');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white">Manual de Usuario</h2>
              <p className="text-xs text-slate-400">Aprende a usar todas las funciones de FiguCheck</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-4 overflow-x-auto scrollbar-none gap-1">
          <button
            onClick={() => setActiveTab('inicio')}
            className={`px-3 py-2.5 text-xs font-bold whitespace-nowrap border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'inicio'
                ? 'border-emerald-400 text-emerald-400 bg-emerald-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ArrowUp className="w-3.5 h-3.5" />
            <span>Volver Arriba</span>
          </button>

          <button
            onClick={() => setActiveTab('marcado')}
            className={`px-3 py-2.5 text-xs font-bold whitespace-nowrap border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'marcado'
                ? 'border-emerald-400 text-emerald-400 bg-emerald-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Marcado de Figus</span>
          </button>

          <button
            onClick={() => setActiveTab('filtros')}
            className={`px-3 py-2.5 text-xs font-bold whitespace-nowrap border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'filtros'
                ? 'border-emerald-400 text-emerald-400 bg-emerald-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Filtros y Búsqueda</span>
          </button>

          <button
            onClick={() => setActiveTab('canjes')}
            className={`px-3 py-2.5 text-xs font-bold whitespace-nowrap border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'canjes'
                ? 'border-emerald-400 text-emerald-400 bg-emerald-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Handshake className="w-3.5 h-3.5" />
            <span>Mercado de Canjes</span>
          </button>

          <button
            onClick={() => setActiveTab('cuenta')}
            className={`px-3 py-2.5 text-xs font-bold whitespace-nowrap border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'cuenta'
                ? 'border-emerald-400 text-emerald-400 bg-emerald-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>Nube y Cuenta</span>
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 text-slate-300 text-sm">
          
          {activeTab === 'inicio' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300 flex-shrink-0">
                  <ArrowUp className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Atajo: Clic en el Logo para volver al inicio</h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Cuando estés navegando o scrolleando hacia abajo en la lista de figuritas y desees volver arriba de todo inmediatamente, haz clic en el <strong>Logo de FiguCheck</strong> en la barra superior.
                  </p>
                </div>
              </div>

              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/60 space-y-2">
                <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider">¿Por qué usar este botón?</h4>
                <ul className="list-disc list-inside text-xs text-slate-400 space-y-1">
                  <li>Evita tener que hacer scroll hacia arriba manualmente.</li>
                  <li>Funciona tanto en computadoras como en teléfonos móviles.</li>
                  <li>Realiza un desplazamiento suave (smooth scroll) al inicio del álbum.</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'marcado' && (
            <div className="space-y-4">
              <h3 className="font-bold text-white text-base">¿Cómo marcar tus figuritas?</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/70 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded bg-emerald-500 text-slate-950">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </span>
                    <span className="font-bold text-emerald-400 text-xs">Marcar como Tengo (1)</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Haz un clic sobre cualquier figurita vacía (con signo <strong>+</strong>). La figurita se iluminará en verde.
                  </p>
                </div>

                <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/70 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded text-[11px] font-black bg-amber-500 text-slate-950">
                      x2
                    </span>
                    <span className="font-bold text-amber-400 text-xs">Marcar Repetidas (x2, x3...)</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Toca de nuevo sobre la tarjeta o presiona el botón <strong>+</strong> en el pie de la figurita para añadir repetidas.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/70 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded bg-slate-700 text-rose-400">
                    <Minus className="w-3.5 h-3.5" />
                  </span>
                  <span className="font-bold text-rose-300 text-xs">Restar o Eliminar</span>
                </div>
                <p className="text-xs text-slate-400">
                  Usa el botón <strong>-</strong> en las tarjetas obtenidas para reducir la cantidad o removerla de tu álbum si te equivocaste.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'filtros' && (
            <div className="space-y-3">
              <h3 className="font-bold text-white text-base">Filtros y Búsqueda Avanzada</h3>

              <div className="space-y-2 text-xs">
                <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/60">
                  <strong className="text-emerald-400">Carrusel de Equipos:</strong> Elige cualquier equipo (Jockey, Talleres, Regatas, Cementista, etc.) para ver solo sus jugadores o las Leyendas.
                </div>
                <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/60">
                  <strong className="text-emerald-400">Pestañas de Estado:</strong> Filtra rápidamente entre <em>Todas</em>, <em>Tengo</em>, <em>Faltan</em> o <em>Repetidas</em>.
                </div>
                <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/60">
                  <strong className="text-emerald-400">Buscador en tiempo real:</strong> Escribe el apellido del jugador o el número de figurita (ej: #42 o "Pérez") en la barra de búsqueda.
                </div>
              </div>
            </div>
          )}

          {activeTab === 'canjes' && (
            <div className="space-y-3">
              <h3 className="font-bold text-white text-base">Mercado de Canjes (Intercambio)</h3>
              <p className="text-xs text-slate-400">
                Conecta con la comunidad de Futsal Mendoza para intercambiar tus figuritas duplicadas.
              </p>
              <ul className="list-disc list-inside text-xs text-slate-300 space-y-1.5 pl-1">
                <li>Haz clic en el botón <strong>Canjes</strong> en la barra superior.</li>
                <li>Explora las ofertas publicadas por otros coleccionistas.</li>
                <li>Publica tus figuritas repetidas o aquellas que estás buscando desesperadamente.</li>
                <li>Contacta a otros coleccionistas directamente por WhatsApp o teléfono.</li>
              </ul>
            </div>
          )}

          {activeTab === 'cuenta' && (
            <div className="space-y-3">
              <h3 className="font-bold text-white text-base">Sincronización en la Nube y Perfil</h3>
              <div className="space-y-2 text-xs">
                <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/60">
                  <strong className="text-teal-400">Sincronización automática:</strong> Al iniciar sesión, todas las figuritas marcadas se respaldan automáticamente en la nube.
                </div>
                <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/60">
                  <strong className="text-teal-400">Acceso Multidispositivo:</strong> Entra desde tu teléfono o tu computadora con tu misma cuenta para ver siempre tu progreso actualizado.
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
          >
            Entendido
          </button>
        </div>

      </div>
    </div>
  );
}
