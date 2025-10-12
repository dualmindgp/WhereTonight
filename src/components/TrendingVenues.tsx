'use client'

import React from 'react'
import { VenueWithCount } from '@/lib/database.types'
import { MapPin } from 'lucide-react'

interface TrendingVenuesProps {
  venues: VenueWithCount[]
  onVenueClick: (venue: VenueWithCount) => void
}

export default function TrendingVenues({ venues, onVenueClick }: TrendingVenuesProps) {
  // Ordenar venues por popularidad
  const sortedVenues = [...venues].sort((a, b) => b.count_today - a.count_today)
  // Tomar solo los 3 principales
  const topVenues = sortedVenues.slice(0, 5)
  
  // Determinar el color basado en la popularidad
  const getVenueColor = (count: number) => {
    if (count > 90) return 'shadow-neon-pink text-neon-pink'
    if (count > 70) return 'shadow-neon-blue text-neon-blue'
    return 'shadow-neon-cyan text-neon-cyan'
  }

  // Determinar el tamaño basado en la posición
  const getVenueSize = (index: number) => {
    switch(index) {
      case 0: return 'text-3xl'
      case 1: return 'text-2xl'
      default: return 'text-xl'
    }
  }

  return (
    <div className="bg-dark-primary bg-opacity-90 rounded-lg p-4 mb-4">
      <h3 className="text-text-light text-lg font-bold mb-4 border-b border-neon-blue pb-2">
        <span className="glow-text-blue">Tonight in Warsaw — live now</span>
      </h3>
      
      {topVenues.length === 0 ? (
        <p className="text-text-secondary text-sm">No hay lugares populares ahora mismo.</p>
      ) : (
        <div className="flex flex-col space-y-4">
          {topVenues.map((venue, index) => (
            <div 
              key={venue.id} 
              className={`flex items-center cursor-pointer hover:bg-dark-secondary rounded-lg p-2 transition-colors`}
              onClick={() => onVenueClick(venue)}
            >
              <div className={`mr-4 ${getVenueSize(index)}`}>
                <div 
                  className={`flex items-center justify-center w-12 h-12 rounded-full ${getVenueColor(venue.count_today)}`}
                  style={{
                    background: index === 0 ? 
                      'linear-gradient(135deg, #0A0A1A 0%, #16163A 100%)' :
                      '#0A0A1A',
                    boxShadow: venue.count_today > 70 ? 
                      `0 0 10px ${venue.count_today > 90 ? '#FF00FF' : '#00BFFF'}` : 
                      'none'
                  }}
                >
                  <span className={`font-bold ${getVenueColor(venue.count_today)}`}>
                    {venue.count_today}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-text-light font-bold">{venue.name}</p>
                <div className="flex items-center text-text-secondary text-xs">
                  <span>{venue.type === 'club' ? '🎵 Club' : venue.type === 'bar' ? '🍺 Bar' : '🏪 Local'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
