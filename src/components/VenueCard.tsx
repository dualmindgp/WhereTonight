'use client'

import { useState } from 'react'
import { VenueWithCount } from '@/lib/database.types'
import { MapPin, ExternalLink, Ticket, Users, Clock } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { logger, withErrorHandling } from '@/lib/logger'
import { useToastContext } from '@/contexts/ToastContext'

interface VenueCardProps {
  venue: VenueWithCount
  isAuthenticated: boolean
  hasUsedTicketToday: boolean
  onTicketUsed: () => void
  onAuthRequired: () => void
}

export default function VenueCard({ 
  venue, 
  isAuthenticated, 
  hasUsedTicketToday, 
  onTicketUsed,
  onAuthRequired 
}: VenueCardProps) {
  const toast = useToastContext()
  const [isUsingTicket, setIsUsingTicket] = useState(false)

  const handleUseTicket = async () => {
    if (!isAuthenticated) {
      onAuthRequired()
      return
    }

    if (hasUsedTicketToday) {
      return
    }

    setIsUsingTicket(true)
    
    const result = await withErrorHandling(
      async () => {
        const { data: { session } } = await supabase.auth.getSession()
        
        const response = await fetch('/api/ticket', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`
          },
          body: JSON.stringify({ venueId: venue.id })
        })

        const data = await response.json()

        if (response.ok) {
          return 'success'
        } else if (response.status === 409) {
          return 'already_used'
        } else {
          throw new Error(data.error || 'Error al usar el ticket')
        }
      },
      'Error al usar ticket',
      { venueId: venue.id }
    )

    setIsUsingTicket(false)
    
    if (result === 'success') {
      onTicketUsed()
      toast.success('¡Ticket usado exitosamente! 🎉')
      logger.trackEvent('ticket_used_venue_card', { venueId: venue.id, venueName: venue.name })
    } else if (result === 'already_used') {
      toast.warning('Ya usaste tu ticket hoy. ¡Espera hasta mañana!')
    } else {
      toast.error('Error al usar el ticket. Inténtalo de nuevo.')
    }
  }

  const getVenueTypeDisplay = (type: string) => {
    switch (type) {
      case 'club': return '🎵 Club'
      case 'bar': return '🍺 Bar'
      default: return '🏪 Local'
    }
  }

  const getButtonText = () => {
    if (!isAuthenticated) return 'Iniciar sesión para ir'
    if (hasUsedTicketToday) return 'Ticket ya usado'
    if (isUsingTicket) return 'Procesando...'
    return 'I\'m going'
  }

  const getButtonStyle = () => {
    if (!isAuthenticated) {
      return 'bg-dark-secondary border border-neon-blue hover:bg-neon-blue/20 text-text-light shadow-neon-blue'
    }
    if (hasUsedTicketToday) {
      return 'bg-sky-400/20 text-sky-300 border border-sky-400/40 cursor-not-allowed'
    }
    return 'bg-dark-primary border border-neon-cyan hover:bg-dark-primary hover:shadow-neon-cyan hover:border-neon-cyan text-neon-cyan glow-text-cyan font-medium'
  }

  return (
    <div className="bg-dark-card rounded-lg shadow-lg p-4 border border-dark-secondary hover:border-neon-blue transition-all duration-300">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-bold text-lg text-text-light">{venue.name}</h3>
          <span className="text-sm text-text-secondary">{getVenueTypeDisplay(venue.type)}</span>
        </div>
        <div className="flex items-center space-x-1 font-semibold">
          <div className="flex items-center justify-center rounded-full w-8 h-8 bg-dark-primary border border-neon-pink shadow-neon-pink">
            <span className="text-neon-pink">{venue.count_today}</span>
          </div>
        </div>
      </div>

      {/* Address */}
      {venue.address && (
        <div className="flex items-start space-x-2 mb-2">
          <MapPin className="w-4 h-4 text-text-muted mt-0.5 flex-shrink-0" />
          <span className="text-sm text-text-secondary">{venue.address}</span>
        </div>
      )}

      {/* Price info */}
      {venue.avg_price_text && (
        <div className="mb-3 text-sm text-text-light bg-dark-secondary p-2 rounded border border-neon-blue/30">
          💰 {venue.avg_price_text}
        </div>
      )}

      {/* Today count */}
      <div className="flex items-center space-x-2 mb-4 text-sm">
        <Clock className="w-4 h-4 text-neon-blue" />
        <span className="text-text-secondary">
          Hoy van: <strong className="text-neon-pink">{venue.count_today} personas</strong>
        </span>
      </div>

      {/* Action buttons */}
      <div className="space-y-2">
        {/* Go today button */}
        <button
          onClick={handleUseTicket}
          disabled={hasUsedTicketToday || isUsingTicket}
          className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-full font-medium transition-all ${getButtonStyle()}`}
        >
          <span className="text-lg">🚩</span> {/* Flag emoji */}
          <span>{getButtonText()}</span>
        </button>

        {/* External links */}
        <div className="flex space-x-2">
          {venue.maps_url && (
            <a
              href={venue.maps_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-dark-secondary text-text-light rounded-md hover:bg-dark-secondary/80 hover:shadow-neon-blue transition-all text-sm border border-neon-blue/20"
            >
              <MapPin className="w-4 h-4 text-neon-blue" />
              <span>Mapa</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
          
          {venue.tickets_url && (
            <a
              href={venue.tickets_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-dark-secondary text-text-light rounded-md hover:bg-dark-secondary/80 hover:shadow-neon-purple transition-all text-sm border border-neon-purple/20"
            >
              <Ticket className="w-4 h-4 text-neon-purple" />
              <span>Entradas</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>

      {/* Used ticket today indicator */}
      {hasUsedTicketToday && (
        <div className="mt-2 text-center text-sm text-neon-pink bg-dark-primary p-2 rounded border border-neon-pink/30 shadow-inner">
          ⏰ Ticket usado hoy. Recarga mañana a medianoche (Europa/Varsovia)
        </div>
      )}
    </div>
  )
}
