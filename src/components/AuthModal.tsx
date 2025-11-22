'use client'

import { useState, useEffect } from 'react'
import { supabase, getAuthRedirectUrl } from '@/lib/supabase'
import { applyReferralCode } from '@/lib/referral-system'
import { X, Mail, Lock, Chrome, Gift } from 'lucide-react'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [referralCode, setReferralCode] = useState<string | null>(null)

  useEffect(() => {
    // Capturar código de referido de localStorage (guardado desde /invite?code=X)
    const savedCode = localStorage.getItem('referral_code')
    if (savedCode) {
      setReferralCode(savedCode)
    }
  }, [])

  if (!isOpen) return null

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      if (isSignUp) {
        // Registro
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: getAuthRedirectUrl(),
          },
        })
        
        if (error) throw error
        
        // Aplicar código de referido si existe
        if (data.user?.id && referralCode) {
          const result = await applyReferralCode(data.user.id, referralCode)
          if (result.success) {
            localStorage.removeItem('referral_code') // Limpiar después de usar
            setMessage('¡Cuenta creada! Has ganado 50 puntos de bienvenida 🎉')
          } else {
            setMessage('¡Cuenta creada! Revisa tu email para confirmar tu cuenta.')
          }
        } else {
          setMessage('¡Cuenta creada! Revisa tu email para confirmar tu cuenta.')
        }
        
        setEmail('')
        setPassword('')
        setReferralCode(null)
      } else {
        // Login
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        
        if (error) throw error
        setMessage('¡Sesión iniciada correctamente!')
        setTimeout(() => onClose(), 1000)
      }
    } catch (err: any) {
      setError(err.message || 'Error al autenticar')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleAuth = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: getAuthRedirectUrl(),
        },
      })
      
      if (error) throw error
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión con Google')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-dark-card rounded-2xl shadow-2xl max-w-md w-full border border-neon-blue/30">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-neon-blue/20">
          <h2 className="text-2xl font-bold text-text-light">
            {isSignUp ? 'Crear Cuenta' : 'Iniciar Sesión'}
          </h2>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-light transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Código de Referido Banner */}
          {isSignUp && referralCode && (
            <div className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-pink-500 to-purple-500 p-2 rounded-lg">
                  <Gift className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">¡Código de invitación aplicado!</p>
                  <p className="text-white/70 text-xs">Ganarás 50 puntos al registrarte</p>
                </div>
              </div>
            </div>
          )}
          {/* Google Auth */}
          <button
            onClick={handleGoogleAuth}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 py-3 rounded-lg hover:bg-gray-100 transition-colors font-medium disabled:opacity-50"
          >
            <Chrome className="w-5 h-5" />
            Continuar con Google
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neon-blue/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-dark-card text-text-secondary">o</span>
            </div>
          </div>

          {/* Email Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div>
              <label className="block text-text-light text-sm font-medium mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-dark-secondary text-text-light border border-neon-blue/30 rounded-lg focus:outline-none focus:border-neon-blue"
                  placeholder="tu@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-text-light text-sm font-medium mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full pl-10 pr-4 py-3 bg-dark-secondary text-text-light border border-neon-blue/30 rounded-lg focus:outline-none focus:border-neon-blue"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {message && (
              <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-lg text-sm">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-neon-blue text-white py-3 rounded-lg hover:bg-neon-blue/80 transition-colors font-medium disabled:opacity-50"
            >
              {loading ? 'Cargando...' : (isSignUp ? 'Crear Cuenta' : 'Iniciar Sesión')}
            </button>
          </form>

          {/* Toggle Sign Up / Sign In */}
          <div className="text-center text-sm text-text-secondary">
            {isSignUp ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}
            {' '}
            <button
              onClick={() => {
                setIsSignUp(!isSignUp)
                setError(null)
                setMessage(null)
              }}
              className="text-neon-blue hover:underline font-medium"
            >
              {isSignUp ? 'Inicia sesión' : 'Regístrate'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
