'use client'

import React, { useState } from 'react'
import { X, QrCode, Share2, Copy, Check } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { logger } from '@/lib/logger'
import { useToastContext } from '@/contexts/ToastContext'

interface AddFriendModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  username?: string
}

export default function AddFriendModal({ 
  isOpen, 
  onClose, 
  userId,
  username 
}: AddFriendModalProps) {
  const { t } = useLanguage()
  const toast = useToastContext()
  const [selectedTab, setSelectedTab] = useState<'qr' | 'link'>('qr')
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  // Generar enlace único del perfil
  const profileLink = typeof window !== 'undefined' 
    ? `${window.location.origin}/add-friend/${userId}`
    : `https://wheretonight.app/add-friend/${userId}`

  // URL del QR usando QuickChart API (no requiere instalación)
  const qrCodeUrl = `https://quickchart.io/qr?text=${encodeURIComponent(profileLink)}&size=300&margin=2&dark=00BFFF&light=1a1a1a`

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(profileLink)
      setCopied(true)
      toast.success('Enlace copiado al portapapeles')
      setTimeout(() => setCopied(false), 2000)
      logger.trackEvent('profile_link_copied', { userId })
    } catch (error) {
      logger.error('Error al copiar enlace', error as Error, { userId })
      toast.error('No se pudo copiar el enlace')
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Añade a ${username || 'este usuario'} en WhereTonight`,
          text: `¡Únete a mi red en WhereTonight!`,
          url: profileLink
        })
        logger.trackEvent('profile_shared', { userId, method: 'native_share' })
      } catch (error) {
        // Usuario canceló el share - no es un error real
        if ((error as Error).name !== 'AbortError') {
          logger.error('Error al compartir', error as Error, { userId })
        }
      }
    } else {
      // Fallback: copiar enlace
      handleCopyLink()
    }
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg bg-dark-card rounded-t-3xl shadow-2xl border-t border-neon-blue/30 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neon-blue/20">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-pink to-neon-blue">
            Añadir Amigo
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-dark-secondary transition-colors"
          >
            <X className="w-6 h-6 text-text-secondary" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-neon-blue/20">
          <button
            onClick={() => setSelectedTab('qr')}
            className={`flex-1 flex items-center justify-center gap-2 py-4 font-medium transition-colors ${
              selectedTab === 'qr'
                ? 'text-neon-blue border-b-2 border-neon-blue'
                : 'text-text-secondary hover:text-text-light'
            }`}
          >
            <QrCode className="w-5 h-5" />
            Código QR
          </button>
          <button
            onClick={() => setSelectedTab('link')}
            className={`flex-1 flex items-center justify-center gap-2 py-4 font-medium transition-colors ${
              selectedTab === 'link'
                ? 'text-neon-blue border-b-2 border-neon-blue'
                : 'text-text-secondary hover:text-text-light'
            }`}
          >
            <Share2 className="w-5 h-5" />
            Enlace
          </button>
        </div>

        {/* Content */}
        <div className="p-6 pb-24">
          {selectedTab === 'qr' ? (
            <div className="flex flex-col items-center space-y-4">
              <p className="text-text-secondary text-center text-sm">
                Muestra este código QR para que otros usuarios te añadan como amigo
              </p>
              
              {/* QR Code */}
              <div className="p-6 bg-white rounded-2xl shadow-lg shadow-neon-blue/20">
                <img 
                  src={qrCodeUrl}
                  alt="QR Code"
                  className="w-64 h-64"
                />
              </div>

              <div className="text-center">
                <p className="text-text-light font-medium">@{username || 'usuario'}</p>
                <p className="text-text-secondary text-xs mt-1">Escanea para agregar</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-text-secondary text-sm">
                Comparte este enlace para que otros usuarios te añadan como amigo
              </p>

              {/* Link Display */}
              <div className="bg-dark-secondary rounded-xl p-4 border border-neon-blue/30">
                <p className="text-text-light text-sm break-all">
                  {profileLink}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleCopyLink}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-dark-secondary hover:bg-dark-hover border border-neon-blue/30 text-text-light transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-5 h-5 text-green-400" />
                      <span>¡Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5" />
                      <span>Copiar</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleShare}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-neon-pink to-neon-blue text-white font-semibold hover:opacity-90 transition-opacity"
                >
                  <Share2 className="w-5 h-5" />
                  <span>Compartir</span>
                </button>
              </div>

              {/* Share Options */}
              <div className="pt-4 border-t border-neon-blue/20">
                <p className="text-xs text-text-secondary text-center mb-3">
                  O comparte directamente en:
                </p>
                <div className="flex justify-center gap-3">
                  <a
                    href={`whatsapp://send?text=¡Únete a mi red en WhereTonight! ${profileLink}`}
                    className="p-3 rounded-full bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="text-2xl">💬</span>
                  </a>
                  <a
                    href={`https://t.me/share/url?url=${encodeURIComponent(profileLink)}&text=¡Únete a mi red en WhereTonight!`}
                    className="p-3 rounded-full bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="text-2xl">✈️</span>
                  </a>
                  <a
                    href={`https://twitter.com/intent/tweet?text=¡Únete a mi red en WhereTonight!&url=${encodeURIComponent(profileLink)}`}
                    className="p-3 rounded-full bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/30 transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="text-2xl">🐦</span>
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
