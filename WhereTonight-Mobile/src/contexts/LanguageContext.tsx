import React, { createContext, useContext, useState, ReactNode } from 'react'

const translations = {
  es: {
    common: {
      home: 'Inicio',
      search: 'Buscar',
      social: 'Social',
      profile: 'Perfil',
      login: 'Iniciar Sesión',
      logout: 'Cerrar Sesión',
      loading: 'Cargando...',
      error: 'Error',
      success: 'Éxito',
      cancel: 'Cancelar',
      save: 'Guardar',
      delete: 'Eliminar',
      edit: 'Editar'
    },
    profile: {
      welcome: '¡Bienvenido!',
      welcomeMessage: 'Inicia sesión para acceder a todas las funciones'
    },
    search: {
      placeholder: 'Buscar locales...',
      noResults: 'No se encontraron resultados',
      filters: 'Filtros'
    }
  },
  en: {
    common: {
      home: 'Home',
      search: 'Search',
      social: 'Social',
      profile: 'Profile',
      login: 'Sign In',
      logout: 'Sign Out',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit'
    },
    profile: {
      welcome: 'Welcome!',
      welcomeMessage: 'Sign in to access all features'
    },
    search: {
      placeholder: 'Search venues...',
      noResults: 'No results found',
      filters: 'Filters'
    }
  }
}

type Language = 'es' | 'en'
type Translations = typeof translations.es

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('es')

  const t = (key: string): string => {
    const keys = key.split('.')
    let value: any = translations[language]

    for (const k of keys) {
      value = value?.[k]
    }

    return value || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
