'use client'

import { useState } from 'react'
import { VenueWithCount } from '@/lib/database.types'

interface VenueCardImageProps {
  venue: VenueWithCount
  count: number
  onClick?: () => void
}

export default function VenueCardImage({ venue, count, onClick }: VenueCardImageProps) {
  // Simular imágenes para el ejemplo (en una app real, vendrían de la API)
  const getImageUrl = () => {
    const type = venue.type
    if (type === 'club') {
      return 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80'
    } else if (type === 'bar') {
      return 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80'
    } else {
      return 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80'
    }
  }
  
  const getTypeLabel = () => {
    switch(venue.type) {
      case 'club': return 'Club'
      case 'bar': return venue.avg_price_text || 'Bar'
      default: return 'Food & drink'
    }
  }
  
  return (
    <div 
      className="relative rounded-xl overflow-hidden cursor-pointer transition-transform duration-200 hover:scale-105"
      onClick={onClick}
    >
      {/* Background Image */}
      <div 
        className="w-full h-32 relative"
        style={{
          backgroundImage: `url(${getImageUrl()})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* Overlay gradient */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 100%)'
          }}
        />
        
        {/* Venue count */}
        <div className="absolute top-2 left-2 flex items-center justify-center">
          <div className="text-xl font-bold text-yellow-400 glow-text-pink">
            {count}
          </div>
        </div>
        
        {/* Venue details at bottom */}
        <div className="absolute bottom-0 left-0 p-2 text-white">
          <div className="text-lg font-bold">{venue.name}</div>
          <div className="text-sm opacity-80">{getTypeLabel()}</div>
        </div>
      </div>
    </div>
  )
}
