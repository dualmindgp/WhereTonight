'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { validateReferralCode } from '@/lib/referral-system'
import { Gift, Star, Users, TrendingUp, ArrowRight } from 'lucide-react'

function InviteContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const code = searchParams.get('code') || ''
  const [valid, setValid] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (code) {
      checkCode()
    } else {
      setValid(false)
      setLoading(false)
    }
  }, [code])

  const checkCode = async () => {
    setLoading(true)
    const isValid = await validateReferralCode(code)
    setValid(isValid)
    setLoading(false)

    if (isValid) {
      // Guardar código en localStorage para usar al registrarse
      localStorage.setItem('referral_code', code)
    }
  }

  const handleSignUp = () => {
    // Redirigir a la página principal que mostrará el modal de auth
    router.push('/')
    // El AuthModal detectará el código guardado en localStorage
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark-primary to-dark-secondary">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-neon-blue"></div>
      </div>
    )
  }

  if (!valid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark-primary to-dark-secondary p-4">
        <div className="max-w-md w-full bg-dark-card rounded-2xl shadow-2xl p-8 border border-red-500/30 text-center">
          <div className="w-20 h-20 bg-red-500/20 rounded-full mx-auto mb-6 flex items-center justify-center">
            <span className="text-4xl">❌</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">
            Código Inválido
          </h1>
          <p className="text-text-secondary mb-6">
            Este código de invitación no es válido o ha expirado
          </p>
          <button
            onClick={() => router.push('/')}
            className="w-full py-3 bg-neon-blue text-white rounded-lg hover:bg-neon-blue/80 transition-colors font-medium"
          >
            Ir a Inicio
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark-primary via-dark-secondary to-dark-primary p-4">
      <div className="max-w-md w-full">
        
        {/* Header animado */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="w-24 h-24 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full mx-auto mb-6 flex items-center justify-center shadow-2xl shadow-pink-500/50 animate-bounce-slow">
            <Gift className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-3 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
            ¡Te invitaron!
          </h1>
          <p className="text-text-secondary text-lg">
            a <span className="text-neon-blue font-bold">WhereTonight</span>
          </p>
        </div>

        {/* Código de invitación */}
        <div className="bg-dark-card/80 backdrop-blur-lg rounded-2xl p-6 border border-neon-blue/30 shadow-2xl mb-6">
          <p className="text-text-secondary text-sm text-center mb-2">
            Código de invitación
          </p>
          <div className="bg-dark-primary rounded-lg p-4 text-center">
            <code className="text-2xl font-bold text-neon-pink tracking-wider">
              {code}
            </code>
          </div>
        </div>

        {/* Beneficios */}
        <div className="space-y-3 mb-8">
          <div className="bg-dark-card/50 backdrop-blur-sm rounded-xl p-4 border border-yellow-500/30 flex items-start gap-4">
            <div className="bg-gradient-to-br from-yellow-500 to-orange-500 p-3 rounded-lg flex-shrink-0">
              <Star className="w-6 h-6 text-white fill-current" />
            </div>
            <div>
              <h3 className="font-bold text-white mb-1">50 Puntos de Bienvenida</h3>
              <p className="text-sm text-text-secondary">
                Comienza con puntos para canjear por tickets gratis
              </p>
            </div>
          </div>

          <div className="bg-dark-card/50 backdrop-blur-sm rounded-xl p-4 border border-purple-500/30 flex items-start gap-4">
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-3 rounded-lg flex-shrink-0">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white mb-1">Descubre la Vida Nocturna</h3>
              <p className="text-sm text-text-secondary">
                Encuentra los mejores clubs, bares y eventos
              </p>
            </div>
          </div>

          <div className="bg-dark-card/50 backdrop-blur-sm rounded-xl p-4 border border-neon-blue/30 flex items-start gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-3 rounded-lg flex-shrink-0">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white mb-1">Conecta con Amigos</h3>
              <p className="text-sm text-text-secondary">
                Ve dónde están tus amigos y únete a la diversión
              </p>
            </div>
          </div>
        </div>

        {/* CTA Principal */}
        <button
          onClick={handleSignUp}
          className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-pink-500/50 hover:shadow-pink-500/70 flex items-center justify-center gap-2 group"
        >
          <span>Registrarme y Ganar 50 Puntos</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>

        <p className="text-center text-xs text-text-secondary mt-4">
          Al registrarte, aceptas nuestros términos y condiciones
        </p>

      </div>
    </div>
  )
}

export default function InvitePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark-primary to-dark-secondary">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-neon-blue"></div>
      </div>
    }>
      <InviteContent />
    </Suspense>
  )
}
