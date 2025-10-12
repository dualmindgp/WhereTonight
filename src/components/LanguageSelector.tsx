'use client'

import React, { useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { Globe, RefreshCw } from 'lucide-react'

export default function LanguageSelector() {
  const { locale, setLocale, t } = useLanguage()
  const [showReloadMessage, setShowReloadMessage] = useState(false)

  const handleLanguageChange = (newLocale: 'es' | 'en') => {
    if (newLocale !== locale) {
      setLocale(newLocale)
      setShowReloadMessage(true)
    }
  }

  const handleReload = () => {
    window.location.reload()
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <Globe className="w-5 h-5 text-text-secondary" />
        <div className="flex bg-dark-secondary rounded-lg p-1">
          <button
            onClick={() => handleLanguageChange('es')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              locale === 'es'
                ? 'bg-neon-blue text-white'
                : 'text-text-secondary hover:text-text-light'
            }`}
          >
            ES
          </button>
          <button
            onClick={() => handleLanguageChange('en')}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              locale === 'en'
                ? 'bg-neon-blue text-white'
                : 'text-text-secondary hover:text-text-light'
            }`}
          >
            EN
          </button>
        </div>
      </div>

      {/* Mensaje de recarga */}
      {showReloadMessage && (
        <div className="bg-neon-blue/10 border border-neon-blue/30 rounded-lg p-3 animate-slide-up">
          <p className="text-sm text-text-light mb-2">
            {locale === 'es' 
              ? 'Para aplicar el cambio de idioma completamente, recarga la aplicación' 
              : 'To fully apply the language change, reload the app'}
          </p>
          <button
            onClick={handleReload}
            className="flex items-center gap-2 px-4 py-2 bg-neon-blue text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium w-full justify-center"
          >
            <RefreshCw className="w-4 h-4" />
            {locale === 'es' ? 'Recargar ahora' : 'Reload now'}
          </button>
        </div>
      )}
    </div>
  )
}
