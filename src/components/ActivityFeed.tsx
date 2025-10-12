'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useLanguage } from '@/contexts/LanguageContext'
import { MapPin, Clock } from 'lucide-react'

interface Activity {
  id: string
  user_id: string
  venue_id: string
  type: string
  created_at: string
  username: string | null
  avatar_url: string | null
  venue_name: string
}

interface ActivityFeedProps {
  onVenueClick?: (venueId: string) => void
  limit?: number
  userId?: string // Si se proporciona, solo muestra actividades de ese usuario
}

export default function ActivityFeed({ onVenueClick, limit, userId }: ActivityFeedProps) {
  const { t } = useLanguage()
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadActivities()
  }, [userId])

  const loadActivities = async () => {
    try {
      let query = supabase
        .from('activity_feed_view')
        .select('*')
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

      if (error) {
        console.error('Error loading activities:', error)
        return
      }

      setActivities(data || [])
    } catch (error) {
      console.error('Error loading activities:', error)
    } finally {
      setLoading(false)
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
        <div
          key={activity.id}
          className="bg-dark-card rounded-2xl p-4 border border-neon-blue/20 hover:border-neon-pink/40 transition-all cursor-pointer"
          onClick={() => onVenueClick?.(activity.venue_id)}
        >
          <div className="flex items-start space-x-3">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {activity.avatar_url ? (
                <img
                  src={activity.avatar_url}
                  alt={activity.username || 'User'}
                  className="w-12 h-12 rounded-full object-cover border-2 border-neon-blue/30"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neon-pink to-neon-blue flex items-center justify-center text-white font-bold text-lg">
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
                {t('feed.goingTonight')
                  .replace('{username}', '')
                  .replace('{venueName}', activity.venue_name)}
                <span className="font-semibold text-neon-pink">
                  {activity.venue_name}
                </span>
              </p>
              
              <div className="flex items-center space-x-2 mt-2 text-text-secondary text-sm">
                <Clock className="w-4 h-4" />
                <span>{formatTimestamp(activity.created_at)}</span>
              </div>
            </div>

            {/* Icon */}
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-neon-pink/10 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-neon-pink" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
