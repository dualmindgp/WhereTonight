'use client'

import React from 'react'
import { X, AlertCircle, Ticket } from 'lucide-react'

interface ConfirmTicketModalProps {
  isOpen: boolean
  venueName: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmTicketModal({ 
  isOpen, 
  venueName, 
  onConfirm, 
  onCancel 
}: ConfirmTicketModalProps) {
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

          <p className="text-text-secondary text-sm text-center mb-6">
            Tus amigos podrán ver que irás a este local esta noche
          </p>

          {/* Botones de acción */}
          <div className="flex space-x-3">
            <button
              onClick={onCancel}
              className="flex-1 py-3 px-4 rounded-lg bg-dark-secondary text-text-light hover:bg-dark-hover transition-colors font-medium border border-gray-600"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
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
