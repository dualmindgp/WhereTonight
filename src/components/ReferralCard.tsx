'use client'

import React, { useState, useEffect } from 'react'
import { Share2, Copy, Users, Gift, TrendingUp } from 'lucide-react'
import { 
  getUserReferralCode, 
  getReferralStats, 
  shareReferralCode,
  generateInviteLink 
} from '@/lib/referral-system'

interface ReferralCardProps {
  userId: string
  className?: string
}

export default function ReferralCard({ userId, className = '' }: ReferralCardProps) {
  const [code, setCode] = useState<string>('')
  const [stats, setStats] = useState({
    totalReferrals: 0,
    activeReferrals: 0,
    totalPointsEarned: 0
  })
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadReferralData()
  }, [userId])

  const loadReferralData = async () => {
    try {
      const [codeData, statsData] = await Promise.all([
        getUserReferralCode(userId),
        getReferralStats(userId)
      ])

      if (codeData) {
        setCode(codeData.code)
      }
      setStats(statsData)
    } catch (error) {
      console.error('Error loading referral data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCopyCode = async () => {
    try {
      const message = await shareReferralCode(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Error copying code:', error)
    }
  }

  const handleShare = async () => {
    const link = generateInviteLink(code)
    const text = `¡Únete a WhereTonight con mi código ${code} y gana 50 puntos! 🎉`

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'WhereTonight - Invitación',
          text: text,
          url: link
        })
      } catch (error) {
        console.error('Error sharing:', error)
      }
    } else {
      handleCopyCode()
    }
  }

  if (loading) {
    return (
      <div className={`bg-gradient-to-br from-pink-500/10 to-purple-500/10 border border-pink-500/20 rounded-2xl p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-white/10 rounded w-1/2" />
          <div className="h-12 bg-white/10 rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-gradient-to-br from-pink-500/10 to-purple-500/10 border border-pink-500/20 rounded-2xl p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 bg-gradient-to-br from-pink-500 to-purple-500 rounded-xl">
          <Gift className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Invita y Gana</h3>
          <p className="text-sm text-gray-400">Hasta 225 puntos por amigo</p>
        </div>
      </div>

      {/* Código de Referido */}
      <div className="bg-black/30 rounded-xl p-4 mb-4">
        <p className="text-xs text-gray-400 mb-2">Tu código de invitación</p>
        <div className="flex items-center justify-between gap-3">
          <code className="text-2xl font-bold text-white tracking-wider">
            {code}
          </code>
          <div className="flex gap-2">
            <button
              onClick={handleCopyCode}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              {copied ? (
                <span className="text-green-400 text-xs font-medium px-2">✓ Copiado</span>
              ) : (
                <Copy className="w-5 h-5 text-white" />
              )}
            </button>
            <button
              onClick={handleShare}
              className="p-2 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 rounded-lg transition-all"
            >
              <Share2 className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-black/20 rounded-lg p-3 text-center">
          <Users className="w-5 h-5 text-pink-400 mx-auto mb-1" />
          <p className="text-xl font-bold text-white">{stats.totalReferrals}</p>
          <p className="text-xs text-gray-400">Invitados</p>
        </div>
        <div className="bg-black/20 rounded-lg p-3 text-center">
          <TrendingUp className="w-5 h-5 text-purple-400 mx-auto mb-1" />
          <p className="text-xl font-bold text-white">{stats.activeReferrals}</p>
          <p className="text-xs text-gray-400">Activos</p>
        </div>
        <div className="bg-black/20 rounded-lg p-3 text-center">
          <Gift className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
          <p className="text-xl font-bold text-white">{stats.totalPointsEarned}</p>
          <p className="text-xs text-gray-400">Puntos</p>
        </div>
      </div>

      {/* Recompensas */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-gray-300 mb-2">Gana puntos cuando tu amigo:</p>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-green-400">✓</span>
          <span className="text-gray-300">Se registra:</span>
          <span className="ml-auto text-yellow-400 font-bold">+50 pts</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-green-400">✓</span>
          <span className="text-gray-300">Completa perfil:</span>
          <span className="ml-auto text-yellow-400 font-bold">+50 pts</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-green-400">✓</span>
          <span className="text-gray-300">Primera historia:</span>
          <span className="ml-auto text-yellow-400 font-bold">+75 pts</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-green-400">✓</span>
          <span className="text-gray-300">Primer ticket:</span>
          <span className="ml-auto text-yellow-400 font-bold">+100 pts</span>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <p className="text-xs text-center text-gray-400">
          Tu amigo también gana <span className="text-yellow-400 font-bold">50 puntos</span> al registrarse 🎁
        </p>
      </div>
    </div>
  )
}
