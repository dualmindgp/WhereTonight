'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useLanguage } from '@/contexts/LanguageContext'
import { MapPin, Clock } from 'lucide-react'
import { logger, withErrorHandling } from '@/lib/logger'

interface Activity {
  id: string
  user_id: string
  venue_id: string
  type: string
  created_at: string
  username: string | null
  avatar_url: string | null
  venue_name: string
  lat: number
  lng: number
}

interface ActivityFeedProps {
  onVenueClick?: (venueId: string) => void
  limit?: number
  userId?: string // Si se proporciona, solo muestra actividades de ese usuario
  cityFilter?: { name: string; lat: number; lng: number } | null // Filtrar por ciudad
  onUserClick?: (userId: string, username: string | null) => void
}

export default function ActivityFeed({ onVenueClick, limit, userId, cityFilter, onUserClick }: ActivityFeedProps) {
  const { t } = useLanguage()
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadActivities()
  }, [userId, cityFilter])

  // Función para calcular distancia entre dos puntos
  const getDistanceFromLatLonInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371 // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  const loadActivities = async () => {
    const data = await withErrorHandling(
      async () => {
        // Calcular timestamp de hace 24 horas
        const twentyFourHoursAgo = new Date()
        twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24)
        const timestamp24h = twentyFourHoursAgo.toISOString()

        let query = supabase
          .from('activity_feed_view')
          .select('*')
          .gte('created_at', timestamp24h) // Solo actividades de las últimas 24h
          .order('created_at', { ascending: false })

        if (userId) {
          query = query.eq('user_id', userId)
        }

        if (limit) {
          query = query.limit(limit)
        } else {
          query = query.limit(50)
        }

        const { data, error } = await query

        if (error) throw error

        // Si hay filtro de ciudad, filtrar por proximidad (50km)
        if (cityFilter && data) {
          const RADIUS_KM = 50
          return data.filter((activity: Activity) => {
            if (!activity.lat || !activity.lng) return false
            const distance = getDistanceFromLatLonInKm(
              cityFilter.lat,
              cityFilter.lng,
              activity.lat,
              activity.lng
            )
            return distance <= RADIUS_KM
          })
        }

        return data || []
      },
      'Error al cargar actividad',
      { userId, limit, cityFilter: cityFilter?.name }
    )

    setLoading(false)
    if (data) {
      setActivities(data)
      logger.trackEvent('activities_loaded', { userId, count: data.length, city: cityFilter?.name })
    } else {
      setActivities([])
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const now = new Date()
    const activityDate = new Date(timestamp)
    const diffMs = now.getTime() - activityDate.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)

    if (diffMins < 1) {
      return t('feed.justNow')
    } else if (diffMins < 60) {
      return t('feed.minutesAgo', { minutes: diffMins.toString() })
    } else if (diffHours < 24) {
      return t('feed.hoursAgo', { hours: diffHours.toString() })
    } else {
      return activityDate.toLocaleDateString()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-blue"></div>
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-text-secondary">
        <MapPin className="w-16 h-16 mb-4 opacity-50" />
        <p className="text-lg">{t('feed.noActivities')}</p>
        <p className="text-sm">{t('feed.beFirstPost')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => (
        <button
          key={activity.id}
          onClick={() => onUserClick?.(activity.user_id, activity.username)}
          className="relative w-full overflow-hidden rounded-2xl border border-neon-blue/20 hover:border-neon-pink/40 transition-all text-left group cursor-pointer bg-dark-card"
        >
          {/* Fondo difuminado: avatar del usuario o imagen de fiesta por defecto */}
          <div className="absolute inset-0">
            {activity.avatar_url ? (
              <img
                src={activity.avatar_url}
                alt={activity.username || 'User'}
                className="w-full h-full object-cover scale-110 group-hover:scale-115 transition-transform duration-500"
              />
            ) : (
              <img
                src="/logo.png"
                alt="Fiesta"
                className="w-full h-full object-cover scale-110 group-hover:scale-115 transition-transform duration-500"
              />
            )}
            <div className="absolute inset-0 bg-black/70 group-hover:bg-black/60 transition-colors duration-300 backdrop-blur-md"></div>
          </div>

          <div className="relative p-4 flex items-start space-x-3">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {activity.avatar_url ? (
                <img
                  src={activity.avatar_url}
                  alt={activity.username || 'User'}
                  className="w-12 h-12 rounded-full object-cover border-2 border-neon-blue/60 shadow-lg"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neon-pink to-neon-blue flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {(activity.username || 'U').charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-text-light leading-relaxed">
                <span className="font-semibold text-neon-blue">
                  {activity.username || 'Usuario'}
                </span>{' '}
                va a{' '}
                <span className="font-semibold text-neon-pink">
                  {activity.venue_name}
                </span>
              </p>

              <div className="flex items-center justify-between mt-2 text-text-secondary text-sm">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>{formatTimestamp(activity.created_at)}</span>
                </div>

                {/* Icono para ir al local, manteniendo comportamiento actual */}
                <button
                  className="flex-shrink-0"
                  onClick={(e) => {
                    e.stopPropagation()
                    onVenueClick?.(activity.venue_id)
                  }}
                >
                  <div className="w-10 h-10 rounded-full bg-neon-pink/10 flex items-center justify-center hover:bg-neon-pink/20 transition-colors">
                    <MapPin className="w-5 h-5 text-neon-pink" />
                  </div>
                </button>
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  )
}
