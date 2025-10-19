'use client'

import React, { useState, useEffect } from 'react'
import { ChevronLeft, Bookmark, MapPin, Star } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import { VenueWithCount } from '@/lib/database.types'
import { logger, withErrorHandling } from '@/lib/logger'
import { useToastContext } from '@/contexts/ToastContext'

interface FavoritesScreenProps {
  user: User
  onBack: () => void
  onVenueClick: (venue: VenueWithCount) => void
}

export default function FavoritesScreen({ user, onBack, onVenueClick }: FavoritesScreenProps) {
  const toast = useToastContext()
  const [favorites, setFavorites] = useState<VenueWithCount[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFavorites()
  }, [user.id])

  const loadFavorites = async () => {
    logger.info('Cargando favoritos', { userId: user.id })
    
    const data = await withErrorHandling(
      async () => {
        // Primero obtenemos los IDs de venues favoritos
        const { data: favoritesData, error: favError } = await supabase
          .from('favorites')
          .select('venue_id')
          .eq('user_id', user.id)

        if (favError) throw favError

        if (!favoritesData || favoritesData.length === 0) {
          logger.info('Usuario sin favoritos', { userId: user.id })
          return []
        }

        const venueIds = favoritesData.map(f => f.venue_id)

        // Luego obtenemos los detalles de esos venues
        const { data: venuesData, error: venuesError } = await supabase
          .from('venues')
          .select('*')
          .in('id', venueIds)

        if (venuesError) throw venuesError

        // Obtener conteos
        const { data: counts } = await supabase.rpc('tickets_count_today_euwarsaw')
        const countsMap = new Map(counts?.map((c: any) => [c.venue_id, c.count_today]) || [])

        const venuesWithCounts = (venuesData || []).map(venue => ({
          ...venue,
          count_today: countsMap.get(venue.id) || 0
        }))

        return venuesWithCounts
      },
      'Error al cargar favoritos',
      { userId: user.id }
    )

    setLoading(false)
    
    if (data) {
      setFavorites(data)
      logger.trackEvent('favorites_loaded', { userId: user.id, count: data.length })
    } else {
      setFavorites([])
      toast.error('Error al cargar favoritos')
    }
  }

  const removeFavorite = async (venueId: string) => {
    const success = await withErrorHandling(
      async () => {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('venue_id', venueId)
        
        if (error) throw error
        return true
      },
      'Error al quitar favorito',
      { userId: user.id, venueId }
    )

    if (success) {
      setFavorites(favorites.filter(v => v.id !== venueId))
      toast.info('Quitado de favoritos')
      logger.trackEvent('favorite_removed', { userId: user.id, venueId })
    } else {
      toast.error('Error al quitar de favoritos')
    }
  }

  return (
    <div className="flex-1 bg-dark-primary overflow-y-auto pb-20">
      {/* Header */}
      <div className="bg-dark-card border-b border-neon-blue/20 px-4 py-4 flex items-center gap-3 sticky top-0 z-10">
        <button
          onClick={onBack}
          className="p-2 hover:bg-dark-secondary rounded-lg transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-text-light" />
        </button>
        <Bookmark className="w-6 h-6 text-neon-pink" />
        <h1 className="text-xl font-bold text-white">Favoritos</h1>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-neon-pink border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-text-secondary">Cargando favoritos...</p>
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-12">
            <Bookmark className="w-16 h-16 text-text-secondary mx-auto mb-4" />
            <h3 className="text-xl font-bold text-text-light mb-2">Sin favoritos</h3>
            <p className="text-text-secondary">
              Guarda tus locales favoritos para acceder rápidamente a ellos
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {favorites.map((venue) => (
              <div
                key={venue.id}
                className="bg-dark-card/50 backdrop-blur-sm rounded-2xl p-4 border border-neon-pink/20 hover:border-neon-pink/40 transition-all cursor-pointer"
                onClick={() => onVenueClick(venue)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-1">{venue.name}</h3>
                    <div className="flex items-center gap-2 text-text-secondary text-sm">
                      <MapPin className="w-4 h-4" />
                      <span>{venue.address}</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removeFavorite(venue.id)
                    }}
                    className="p-2 rounded-lg hover:bg-dark-hover transition-colors"
                  >
                    <Bookmark className="w-5 h-5 text-neon-pink fill-current" />
                  </button>
                </div>

                {venue.rating && (
                  <div className="flex items-center gap-1 mb-2">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-text-light text-sm">{venue.rating.toFixed(1)}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-dark-secondary">
                  <span className="text-text-secondary text-sm">{venue.type}</span>
                  <div className="text-sm">
                    <span className="text-neon-pink font-bold">{venue.count_today || 0}</span>
                    <span className="text-text-secondary"> personas van hoy</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
