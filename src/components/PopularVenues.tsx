'use client'

import React from 'react'
import { VenueWithCount } from '@/lib/database.types'
import VenueCardImage from './VenueCardImage'

interface PopularVenuesProps {
  venues: VenueWithCount[]
  onVenueClick: (venue: VenueWithCount) => void
}

export default function PopularVenues({ venues, onVenueClick }: PopularVenuesProps) {
  // Ordenar lugares por popularidad
  const sortedVenues = React.useMemo(() => {
    return [...venues].sort((a, b) => b.count_today - a.count_today).slice(0, 3)
  }, [venues])
  
  return (
    <div className="mt-4 mb-16"> {/* Añadimos margen inferior para la barra de navegación */}
      <div className="flex overflow-x-auto px-4 pb-2 gap-3 snap-x">
        {sortedVenues.map((venue) => (
          <div 
            key={venue.id} 
            className="w-48 flex-shrink-0 snap-start"
            onClick={() => onVenueClick(venue)}
          >
            <VenueCardImage 
              venue={venue}
              count={venue.count_today}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
