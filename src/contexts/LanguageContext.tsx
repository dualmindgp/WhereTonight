'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import esMessages from '../../messages/es.json'
import enMessages from '../../messages/en.json'

type Language = 'es' | 'en'

interface LanguageContextType {
  locale: Language
  setLocale: (locale: Language) => void
  t: (key: string, params?: Record<string, string | number>) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const messages: Record<Language, any> = {
  es: esMessages,
  en: enMessages
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Language>('es')
  const [userId, setUserId] = useState<string | null>(null)

  // Cargar idioma inicial
  useEffect(() => {
    const loadLanguage = async () => {
      // 1. Intentar obtener de cookie
      const cookieLang = localStorage.getItem('language') as Language
      
      // 2. Intentar obtener del usuario logueado
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
        const { data: profile } = await supabase
          .from('profiles')
          .select('language')
          .eq('id', user.id)
          .single()
        
        if (profile?.language) {
          setLocaleState(profile.language as Language)
          return
        }
      }
      
      // 3. Usar cookie o navegador
      if (cookieLang) {
        setLocaleState(cookieLang)
      } else {
        const browserLang = navigator.language.startsWith('es') ? 'es' : 'en'
        setLocaleState(browserLang)
      }
    }
    
    loadLanguage()
  }, [])

  const setLocale = async (newLocale: Language) => {
    setLocaleState(newLocale)
    localStorage.setItem('language', newLocale)
    
    // Si está logueado, actualizar en BD
    if (userId) {
      await supabase
        .from('profiles')
        .update({ language: newLocale })
        .eq('id', userId)
    }
  }

  // Función de traducción
  const t = (key: string, params?: Record<string, string | number>): string => {
    const keys = key.split('.')
    let value: any = messages[locale]
    
    for (const k of keys) {
      value = value?.[k]
    }
    
    if (typeof value !== 'string') {
      return key
    }
    
    // Reemplazar parámetros
    if (params) {
      return value.replace(/\{(\w+)\}/g, (match, param) => {
        return params[param]?.toString() || match
      })
    }
    
    return value
  }

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}
