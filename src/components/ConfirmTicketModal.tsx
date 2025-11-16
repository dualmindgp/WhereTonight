'use client'

import React, { useState } from 'react'
import { X, AlertCircle, Ticket, Share2 } from 'lucide-react'

interface ConfirmTicketModalProps {
  isOpen: boolean
  venueName: string
  onConfirm: (shareToStory: boolean) => void
  onCancel: () => void
}

export default function ConfirmTicketModal({ 
  isOpen, 
  venueName, 
  onConfirm, 
  onCancel 
}: ConfirmTicketModalProps) {
  const [shareToStory, setShareToStory] = useState(true)
  
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm p-4">
      <div className="bg-dark-card rounded-2xl shadow-2xl max-w-md w-full border border-neon-blue/30 overflow-hidden">
        {/* Header con icono */}
        <div className="bg-gradient-to-r from-neon-blue/20 to-neon-pink/20 p-6 text-center border-b border-neon-blue/20">
          <div className="flex justify-center mb-3">
            <div className="bg-neon-pink/20 rounded-full p-3">
              <Ticket className="w-8 h-8 text-neon-pink" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-text-light mb-1">¿Usar tu ticket diario?</h2>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-start space-x-3 mb-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
            <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-yellow-200 text-sm font-medium mb-1">
                Solo tienes un ticket por día
              </p>
              <p className="text-yellow-200/70 text-xs">
                Una vez usado, no podrás cambiar de local hasta mañana
              </p>
            </div>
          </div>

          <div className="bg-dark-secondary rounded-lg p-4 mb-6">
            <p className="text-text-secondary text-sm mb-2">
              Vas a usar tu ticket en:
            </p>
            <p className="text-text-light text-lg font-bold text-neon-pink">
              {venueName}
            </p>
          </div>

          <p className="text-text-secondary text-sm text-center mb-4">
            Tus amigos podrán ver que irás a este local esta noche
          </p>

          {/* Opción de compartir en historia */}
          <div className="bg-gradient-to-r from-neon-pink/10 to-neon-blue/10 rounded-lg p-4 mb-6 border border-neon-blue/20">
            <button
              onClick={() => setShareToStory(!shareToStory)}
              className="w-full flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                  shareToStory 
                    ? 'bg-neon-pink border-neon-pink' 
                    : 'border-gray-500'
                }`}>
                  {shareToStory && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-neon-blue" />
                    <span className="text-text-light font-semibold text-sm">Compartir en mi historia</span>
                  </div>
                  <p className="text-text-secondary text-xs mt-0.5">
                    Invita a tus amigos a unirse con un post automático
                  </p>
                </div>
              </div>
            </button>
          </div>

          {/* Botones de acción */}
          <div className="flex space-x-3">
            <button
              onClick={onCancel}
              className="flex-1 py-3 px-4 rounded-lg bg-dark-secondary text-text-light hover:bg-dark-hover transition-colors font-medium border border-gray-600"
            >
              Cancelar
            </button>
            <button
              onClick={() => onConfirm(shareToStory)}
              className="flex-1 py-3 px-4 rounded-lg bg-gradient-to-r from-neon-pink to-neon-pink/80 text-white hover:opacity-90 transition-opacity font-bold shadow-lg shadow-neon-pink/30"
            >
              Sí, voy a ir
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
