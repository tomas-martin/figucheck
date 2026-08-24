'use client';

import React, { useState } from 'react';
import { useAlbum } from '../context/AlbumContext';
import { X, Copy, Check, MessageSquare } from 'lucide-react';

interface ShareModalProps {
  onClose: () => void;
}

export default function ShareModal({ onClose }: ShareModalProps) {
  const { generateWhatsAppShareText } = useAlbum();
  const [copied, setCopied] = useState(false);

  const textToShare = generateWhatsAppShareText();

  const handleCopy = () => {
    navigator.clipboard.writeText(textToShare);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsApp = () => {
    const encodedText = encodeURIComponent(textToShare);
    window.open(`https://wa.me/?text=${encodedText}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">
              Compartir Repetidas y Faltantes
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-300">
            Copia el siguiente mensaje o envíalo directamente por WhatsApp para intercambiar figuritas con tus amigos:
          </p>

          <div className="relative">
            <textarea
              readOnly
              rows={8}
              value={textToShare}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs font-mono text-slate-300 focus:outline-none resize-none scrollbar-thin scrollbar-thumb-slate-800"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={handleCopy}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 transition-all active:scale-95"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? '¡Copiado al portapapeles!' : 'Copiar Texto'}</span>
            </button>

            <button
              onClick={handleWhatsApp}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition-all active:scale-95"
            >
              <MessageSquare className="w-4 h-4 fill-white" />
              <span>Abrir en WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
