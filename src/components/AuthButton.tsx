'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import { LogIn, LogOut, User as UserIcon } from 'lucide-react'
import { logger } from '@/lib/logger'
import { useToastContext } from '@/contexts/ToastContext'

export default function AuthButton() {
  const toast = useToastContext()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [authLoading, setAuthLoading] = useState(false)

  useEffect(() => {
    // Obtener sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Escuchar cambios de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignIn = async () => {
    setAuthLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    
    if (error) {
      logger.error('Error al iniciar sesión', error)
      toast.error('Error al iniciar sesión. Inténtalo de nuevo.')
    } else {
      logger.trackEvent('sign_in_initiated', { provider: 'google' })
    }
    setAuthLoading(false)
  }

  const handleSignOut = async () => {
    setAuthLoading(true)
    const { error } = await supabase.auth.signOut()
    if (error) {
      logger.error('Error al cerrar sesión', error)
      toast.error('Error al cerrar sesión')
    } else {
      logger.trackEvent('sign_out', { userId: user?.id })
      toast.info('Sesión cerrada')
    }
    setAuthLoading(false)
  }

  if (loading) {
    return (
      <div className="animate-pulse bg-gray-200 rounded-md h-10 w-32"></div>
    )
  }

  if (user) {
    return (
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <UserIcon className="w-4 h-4" />
          <span className="hidden sm:inline truncate max-w-[120px]" title={user.email || ''}>
            {user.email}
          </span>
        </div>
        <button
          onClick={handleSignOut}
          disabled={authLoading}
          className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Salir</span>
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={handleSignIn}
      disabled={authLoading}
      className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
    >
      <LogIn className="w-4 h-4" />
      <span className="hidden sm:inline">{authLoading ? 'Iniciando...' : 'Iniciar Sesión'}</span>
      <span className="sm:hidden">{authLoading ? '...' : 'Entrar'}</span>
    </button>
  )
}
