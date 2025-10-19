'use client'

import React, { useState, useEffect } from 'react'
import { ChevronLeft, Clock, MapPin, Star, Calendar } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import { VenueWithCount } from '@/lib/database.types'
import { logger, withErrorHandling } from '@/lib/logger'
import { useToastContext } from '@/contexts/ToastContext'

interface HistoryScreenProps {
  user: User
  onBack: () => void
  onVenueClick: (venue: VenueWithCount) => void
}

interface TicketWithVenue extends VenueWithCount {
  ticket_date: string
}

export default function HistoryScreen({ user, onBack, onVenueClick }: HistoryScreenProps) {
  const toast = useToastContext()
  const [history, setHistory] = useState<TicketWithVenue[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadHistory()
  }, [user.id])

  const loadHistory = async () => {
    logger.info('Cargando historial', { userId: user.id })
    
    const data = await withErrorHandling(
      async () => {
        // Obtener tickets del usuario ordenados por fecha
        const { data: ticketsData, error: ticketsError } = await supabase
          .from('tickets')
          .select('venue_id, local_date')
          .eq('user_id', user.id)
          .order('local_date', { ascending: false })
          .limit(50) // Últimos 50 tickets

        if (ticketsError) throw ticketsError

        if (!ticketsData || ticketsData.length === 0) {
          logger.info('Usuario sin historial', { userId: user.id })
          return []
        }

        // Obtener detalles de venues
        const venueIds = Array.from(new Set(ticketsData.map(t => t.venue_id)))
        const { data: venuesData, error: venuesError } = await supabase
          .from('venues')
          .select('*')
          .in('id', venueIds)

        if (venuesError) throw venuesError

        // Obtener conteos actuales
        const { data: counts } = await supabase.rpc('tickets_count_today_euwarsaw')
        const countsMap = new Map(counts?.map((c: any) => [c.venue_id, c.count_today]) || [])

        // Crear mapa de venues
        const venuesMap = new Map((venuesData || []).map(v => [v.id, v]))

        // Combinar tickets con venues
        const historyWithVenues = ticketsData
          .map(ticket => {
            const venue = venuesMap.get(ticket.venue_id)
            if (!venue) return null
            return {
              ...venue,
              count_today: countsMap.get(venue.id) || 0,
              ticket_date: ticket.local_date
            }
          })
          .filter(Boolean) as TicketWithVenue[]

        return historyWithVenues
      },
      'Error al cargar historial',
      { userId: user.id }
    )

    setLoading(false)
    if (data) {
      setHistory(data)
      logger.trackEvent('history_loaded', { userId: user.id, count: data.length })
    } else {
      setHistory([])
      toast.error('Error al cargar historial')
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Hoy'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ayer'
    } else {
      return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
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
        <Clock className="w-6 h-6 text-neon-blue" />
        <h1 className="text-xl font-bold text-white">Historial Reciente</h1>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-neon-blue border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-text-secondary">Cargando historial...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="w-16 h-16 text-text-secondary mx-auto mb-4" />
            <h3 className="text-xl font-bold text-text-light mb-2">Sin historial</h3>
            <p className="text-text-secondary">
              Usa tu ticket en un local para que aparezca aquí
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((item, index) => (
              <div
                key={`${item.id}-${index}`}
                className="bg-dark-card/50 backdrop-blur-sm rounded-2xl p-4 border border-neon-blue/20 hover:border-neon-blue/40 transition-all cursor-pointer"
                onClick={() => onVenueClick(item)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-1">{item.name}</h3>
                    <div className="flex items-center gap-2 text-text-secondary text-sm mb-2">
                      <MapPin className="w-4 h-4" />
                      <span>{item.address}</span>
                    </div>
                    <div className="flex items-center gap-2 text-neon-cyan text-sm">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(item.ticket_date)}</span>
                    </div>
                  </div>
                </div>

                {item.rating && (
                  <div className="flex items-center gap-1 mb-2">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-text-light text-sm">{item.rating.toFixed(1)}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-dark-secondary">
                  <span className="text-text-secondary text-sm">{item.type}</span>
                  <div className="text-sm">
                    <span className="text-neon-pink font-bold">{item.count_today || 0}</span>
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
