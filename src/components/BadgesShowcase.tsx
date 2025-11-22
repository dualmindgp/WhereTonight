'use client'

import React, { useState, useEffect } from 'react'
import { Award, Lock, Star, TrendingUp } from 'lucide-react'
import { 
  getBadgeProgress, 
  Badge, 
  getBadgeColor, 
  getBadgeEmoji 
} from '@/lib/badge-system'

interface BadgesShowcaseProps {
  userId: string
  className?: string
  variant?: 'compact' | 'full'
}

export default function BadgesShowcase({ 
  userId, 
  className = '',
  variant = 'full' 
}: BadgesShowcaseProps) {
  const [badges, setBadges] = useState<Array<{
    badge: Badge
    progress: number
    total: number
    percentage: number
    unlocked: boolean
  }>>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all')

  useEffect(() => {
    loadBadges()
  }, [userId])

  const loadBadges = async () => {
    try {
      const progress = await getBadgeProgress(userId)
      setBadges(progress)
    } catch (error) {
      console.error('Error loading badges:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredBadges = badges.filter(b => {
    if (filter === 'unlocked') return b.unlocked
    if (filter === 'locked') return !b.unlocked
    return true
  })

  const unlockedCount = badges.filter(b => b.unlocked).length
  const totalCount = badges.length

  if (loading) {
    return (
      <div className={`bg-dark-secondary rounded-2xl p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-white/10 rounded w-1/3" />
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-white/10 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <div className={`bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-xl p-4 ${className}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-400" />
            <h3 className="font-bold text-white">Logros</h3>
          </div>
          <span className="text-sm text-gray-400">
            {unlockedCount}/{totalCount}
          </span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {badges.slice(0, 6).map((item, index) => (
            <div
              key={index}
              className={`flex-shrink-0 w-16 h-16 rounded-lg flex items-center justify-center ${
                item.unlocked 
                  ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30'
                  : 'bg-black/20 border border-white/10'
              }`}
            >
              <span className={`text-2xl ${item.unlocked ? 'grayscale-0' : 'grayscale opacity-30'}`}>
                {getBadgeEmoji(item.badge.category)}
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-dark-secondary rounded-2xl p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Logros</h2>
          <p className="text-sm text-gray-400">
            {unlockedCount} de {totalCount} desbloqueados
          </p>
        </div>
        <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl">
          <Award className="w-6 h-6 text-white" />
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-400">Progreso general</span>
          <span className="text-white font-medium">
            {Math.round((unlockedCount / totalCount) * 100)}%
          </span>
        </div>
        <div className="h-2 bg-black/30 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
            style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'all'
              ? 'bg-purple-500 text-white'
              : 'bg-black/20 text-gray-400 hover:bg-black/30'
          }`}
        >
          Todos
        </button>
        <button
          onClick={() => setFilter('unlocked')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'unlocked'
              ? 'bg-purple-500 text-white'
              : 'bg-black/20 text-gray-400 hover:bg-black/30'
          }`}
        >
          Desbloqueados ({unlockedCount})
        </button>
        <button
          onClick={() => setFilter('locked')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'locked'
              ? 'bg-purple-500 text-white'
              : 'bg-black/20 text-gray-400 hover:bg-black/30'
          }`}
        >
          Bloqueados ({totalCount - unlockedCount})
        </button>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {filteredBadges.map((item, index) => (
          <BadgeCard key={index} {...item} />
        ))}
      </div>

      {filteredBadges.length === 0 && (
        <div className="text-center py-12">
          <Lock className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">No hay badges en esta categoría</p>
        </div>
      )}
    </div>
  )
}

function BadgeCard({ 
  badge, 
  progress, 
  total, 
  percentage, 
  unlocked 
}: {
  badge: Badge
  progress: number
  total: number
  percentage: number
  unlocked: boolean
}) {
  const rarityColors = {
    common: 'from-gray-500/20 to-gray-600/20 border-gray-500/30',
    rare: 'from-blue-500/20 to-blue-600/20 border-blue-500/30',
    epic: 'from-purple-500/20 to-purple-600/20 border-purple-500/30',
    legendary: 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30'
  }

  const rarityText = {
    common: 'text-gray-400',
    rare: 'text-blue-400',
    epic: 'text-purple-400',
    legendary: 'text-yellow-400'
  }

  return (
    <div 
      className={`relative rounded-xl p-4 border ${
        unlocked 
          ? `bg-gradient-to-br ${rarityColors[badge.rarity]}`
          : 'bg-black/20 border-white/10'
      }`}
    >
      {/* Badge Icon */}
      <div className={`text-4xl mb-2 ${unlocked ? '' : 'grayscale opacity-30'}`}>
        {getBadgeEmoji(badge.category)}
      </div>

      {/* Badge Info */}
      <h4 className={`font-bold text-sm mb-1 ${unlocked ? 'text-white' : 'text-gray-500'}`}>
        {badge.name}
      </h4>
      <p className="text-xs text-gray-400 mb-2 line-clamp-2">
        {badge.description}
      </p>

      {/* Rarity */}
      <div className="flex items-center justify-between text-xs mb-2">
        <span className={`font-medium ${rarityText[badge.rarity]}`}>
          {badge.rarity.charAt(0).toUpperCase() + badge.rarity.slice(1)}
        </span>
        {badge.points_reward > 0 && (
          <span className="text-yellow-400 font-bold">
            +{badge.points_reward} pts
          </span>
        )}
      </div>

      {/* Progress */}
      {!unlocked && (
        <>
          <div className="h-1.5 bg-black/30 rounded-full overflow-hidden mb-1">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 text-center">
            {progress}/{total}
          </p>
        </>
      )}

      {/* Unlocked Badge */}
      {unlocked && (
        <div className="absolute top-2 right-2 p-1 bg-green-500 rounded-full">
          <Star className="w-3 h-3 text-white fill-current" />
        </div>
      )}

      {/* Locked Overlay */}
      {!unlocked && (
        <div className="absolute top-2 right-2">
          <Lock className="w-4 h-4 text-gray-600" />
        </div>
      )}
    </div>
  )
}
