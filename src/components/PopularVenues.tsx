'use client'

import React from 'react'
import { VenueWithCount } from '@/lib/database.types'

interface PopularVenuesProps {
  venues: VenueWithCount[]
  onVenueClick: (venue: VenueWithCount) => void
}

export default function PopularVenues({ venues, onVenueClick }: PopularVenuesProps) {
  // Ordenar lugares por popularidad
  const sortedVenues = React.useMemo(() => {
    return [...venues].sort((a, b) => b.count_today - a.count_today).slice(0, 3)
  }, [venues])
  
  const getFallbackImage = (type: string) => {
    if (type === 'club') {
      return 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
    } else if (type === 'bar') {
      return 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
    } else {
      return 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
    }
  }
  
  const getTypeLabel = (venue: VenueWithCount) => {
    switch(venue.type) {
      case 'club': return 'Club'
      case 'bar': return venue.avg_price_text || 'Bar'
      default: return 'Food & drink'
    }
  }
  
  return (
    <div className="mt-4 mb-16">
      <div className="flex overflow-x-auto px-4 pb-2 gap-3 snap-x">
        {sortedVenues.map((venue) => {
          const imageUrl = venue.photo_ref 
            ? `/api/photo?ref=${venue.photo_ref}&type=${venue.type}`
            : getFallbackImage(venue.type)
          
          return (
            <div 
              key={venue.id} 
              className="flex-shrink-0 snap-start cursor-pointer"
              onClick={() => onVenueClick(venue)}
              style={{ width: '280px' }}
            >
              <div
                className="relative rounded-2xl overflow-hidden"
                style={{
                  width: '280px',
                  height: '200px',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  background: 'linear-gradient(135deg, rgba(13, 7, 22, 0.9) 0%, rgba(26, 26, 46, 0.9) 100%)'
                }}
              >
                {/* Imagen de fondo */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: `url(${imageUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: 'brightness(0.7)'
                  }}
                />
                
                {/* Overlay gradient */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 100%)'
                  }}
                />

                {/* Contador en la esquina superior izquierda */}
                <div
                  style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <div
                    style={{
                      fontSize: '20px',
                      fontWeight: 'bold',
                      color: '#fbbf24',
                      textShadow: '0 0 10px rgba(251, 191, 36, 0.5)'
                    }}
                  >
                    {venue.count_today}
                  </div>
                </div>

                {/* Detalles del venue en la parte inferior */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    padding: '12px',
                    color: 'white',
                    zIndex: 10
                  }}
                >
                  <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '4px' }}>
                    {venue.name}
                  </div>
                  <div style={{ fontSize: '14px', opacity: 0.8 }}>
                    {getTypeLabel(venue)}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
