'use client'

import React from 'react'
import { ChevronLeft, Globe, Bell, Shield, Info } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import LanguageSelector from './LanguageSelector'

interface SettingsScreenProps {
  onBack: () => void
}

export default function SettingsScreen({ onBack }: SettingsScreenProps) {
  const { t } = useLanguage()

  return (
    <div className="flex-1 bg-dark-primary overflow-y-auto pb-20">
      {/* Header */}
      <div className="bg-dark-card border-b border-neon-blue/20 px-4 py-4 flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 hover:bg-dark-secondary rounded-lg transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-text-light" />
        </button>
        <h1 className="text-xl font-bold text-white">Ajustes</h1>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        
        {/* Idioma */}
        <div className="bg-dark-card/50 backdrop-blur-sm rounded-2xl p-5 border border-neon-blue/20">
          <div className="flex items-center gap-3 mb-4">
            <Globe className="w-5 h-5 text-neon-blue" />
            <h3 className="text-lg font-bold text-white">Idioma</h3>
          </div>
          <LanguageSelector />
        </div>

        {/* Notificaciones */}
        <div className="bg-dark-card/50 backdrop-blur-sm rounded-2xl p-5 border border-neon-cyan/20">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="w-5 h-5 text-neon-cyan" />
            <h3 className="text-lg font-bold text-white">Notificaciones</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white font-medium">Notificaciones push</div>
                <div className="text-text-secondary text-sm">Recibe alertas en tu dispositivo</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-dark-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-neon-cyan"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-white font-medium">Amigos van a un local</div>
                <div className="text-text-secondary text-sm">Cuando tus amigos marcan que van</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-dark-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-neon-cyan"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-white font-medium">Nuevos locales</div>
                <div className="text-text-secondary text-sm">Cuando se añaden locales nuevos</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-dark-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-neon-cyan"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Privacidad */}
        <div className="bg-dark-card/50 backdrop-blur-sm rounded-2xl p-5 border border-neon-purple/20">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-5 h-5 text-neon-purple" />
            <h3 className="text-lg font-bold text-white">Privacidad</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white font-medium">Perfil público</div>
                <div className="text-text-secondary text-sm">Otros usuarios pueden ver tu perfil</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-dark-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-neon-purple"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-white font-medium">Mostrar mi ubicación</div>
                <div className="text-text-secondary text-sm">Los amigos ven dónde estás</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-dark-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-neon-purple"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-white font-medium">Análisis y datos</div>
                <div className="text-text-secondary text-sm">Ayuda a mejorar la app</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-dark-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-neon-purple"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Acerca de */}
        <div className="bg-dark-card/50 backdrop-blur-sm rounded-2xl p-5 border border-neon-blue/20">
          <div className="flex items-center gap-3 mb-4">
            <Info className="w-5 h-5 text-neon-blue" />
            <h3 className="text-lg font-bold text-white">Acerca de</h3>
          </div>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-text-secondary">Versión</span>
              <span className="text-white font-medium">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Build</span>
              <span className="text-white font-medium">2025.01.06</span>
            </div>
            <button className="w-full text-left text-neon-blue hover:underline">
              Términos y condiciones
            </button>
            <button className="w-full text-left text-neon-blue hover:underline">
              Política de privacidad
            </button>
            <button className="w-full text-left text-neon-blue hover:underline">
              Contactar soporte
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
