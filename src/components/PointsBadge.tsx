'use client'

import React, { useState, useEffect } from 'react'
import { Star, TrendingUp } from 'lucide-react'
import { getUserPoints, getLevelFromPoints } from '@/lib/points-system'

interface PointsBadgeProps {
  userId: string
  className?: string
}

export default function PointsBadge({ userId, className = '' }: PointsBadgeProps) {
  const [points, setPoints] = useState(0)
  const [level, setLevel] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPoints()
  }, [userId])

  const loadPoints = async () => {
    try {
      const totalPoints = await getUserPoints(userId)
      setPoints(totalPoints)
      setLevel(getLevelFromPoints(totalPoints))
    } catch (error) {
      console.error('Error loading points:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg bg-dark-secondary/50 ${className}`}>
        <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 ${className}`}>
      <Star className="w-4 h-4 text-yellow-400 fill-current" />
      <span className="text-yellow-400 font-bold text-sm">{points}</span>
      <div className="w-px h-4 bg-yellow-500/30" />
      <TrendingUp className="w-3.5 h-3.5 text-orange-400" />
      <span className="text-orange-400 font-medium text-xs">Nv.{level}</span>
    </div>
  )
}
