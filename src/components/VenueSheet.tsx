'use client'

import React, { useState, useEffect } from 'react'
import { X, Star, DollarSign, MapPin, Globe, Image, ExternalLink, Bookmark, Navigation } from 'lucide-react'
import { VenueWithCount } from '@/lib/database.types'
import { useLanguage } from '@/contexts/LanguageContext'
import { supabase } from '@/lib/supabase'
import PhotoCarousel from './PhotoCarousel'
import ConfirmTicketModal from './ConfirmTicketModal'
import { logger, withErrorHandling } from '@/lib/logger'
import { useToastContext } from '@/contexts/ToastContext'

interface VenueSheetProps {
  venue: VenueWithCount
  isOpen: boolean
  onClose: () => void
  onUseTicket: (venueId: string) => Promise<boolean>
  hasUsedTicketToday: boolean
  userId?: string | null
}

export default function VenueSheet({ 
  venue, 
  isOpen, 
  onClose,
  onUseTicket,
  hasUsedTicketToday,
  userId
}: VenueSheetProps) {
  const { t } = useLanguage()
  const toast = useToastContext()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Verificar si el venue está guardado
  useEffect(() => {
    const checkIfSaved = async () => {
      if (!userId || !venue.id) return
      
      try {
        const { data, error } = await supabase
          .from('favorites')
          .select('id')
          .eq('user_id', userId)
          .eq('venue_id', venue.id)
          .single()
        
        setIsSaved(!!data)
      } catch (error) {
        // No está guardado
        setIsSaved(false)
      }
    }

    if (isOpen) {
      checkIfSaved()
    }
  }, [userId, venue.id, isOpen])
  
  // Si no está abierto, no renderizamos nada
  if (!isOpen) return null

  const handleClickGoingButton = () => {
    if (hasUsedTicketToday || isSubmitting) return
    setShowConfirmModal(true)
  }

  const handleConfirmTicket = async () => {
    setShowConfirmModal(false)
    setIsSubmitting(true)
    
    logger.info('Usuario usando ticket', { venueId: venue.id, userId })
    
    try {
      const success = await onUseTicket(venue.id)
      if (success) {
        toast.success('¡Nos vemos allí!')
        logger.trackEvent('ticket_used', { venueId: venue.id, venueName: venue.name })
      } else {
        toast.error('No se pudo usar el ticket')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancelTicket = () => {
    setShowConfirmModal(false)
  }

  const handleSaveVenue = async () => {
    if (!userId) {
      toast.warning('Debes iniciar sesión para guardar favoritos')
      return
    }

    setIsSaving(true)

    const action = isSaved ? 'remove' : 'add'
    
    const success = await withErrorHandling(
      async () => {
        if (isSaved) {
          // Quitar de favoritos
          const { error } = await supabase
            .from('favorites')
            .delete()
            .eq('user_id', userId)
            .eq('venue_id', venue.id)

          if (error) throw error
          return 'removed'
        } else {
          // Añadir a favoritos
          const { error } = await supabase
            .from('favorites')
            .insert({
              user_id: userId,
              venue_id: venue.id
            })

          if (error) throw error
          return 'added'
        }
      },
      `Error al ${action === 'add' ? 'guardar' : 'quitar'} favorito`,
      { userId, venueId: venue.id, action }
    )

    setIsSaving(false)

    if (success === 'added') {
      setIsSaved(true)
      toast.success('¡Guardado en favoritos!')
      logger.trackEvent('venue_favorited', { venueId: venue.id, venueName: venue.name })
    } else if (success === 'removed') {
      setIsSaved(false)
      toast.info('Quitado de favoritos')
      logger.trackEvent('venue_unfavorited', { venueId: venue.id })
    } else {
      toast.error('Error al guardar el local')
    }
  }

  const handleOpenNavigation = () => {
    // Abrir Google Maps con navegación
    const destination = `${venue.lat},${venue.lng}`
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}`
    window.open(mapsUrl, '_blank')
  }

  // Manejar errores de carga de imagen
  const handleImageError = () => {
    setImageError(true)
  }

  const handleImageLoad = () => {
    setImageLoaded(true)
  }
  
  // Renderizar estrellas para el rating
  const renderStars = (rating?: number) => {
    if (!rating) return null
    
    const fullStars = Math.floor(rating)
    const halfStar = rating % 1 >= 0.5
    const stars = []
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)
    }
    
    if (halfStar) {
      stars.push(
        <div key="half" className="relative w-4 h-4">
          <Star className="absolute w-4 h-4 text-gray-300" />
          <div className="absolute overflow-hidden w-2 h-4">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          </div>
        </div>
      )
    }
    
    const emptyStars = 5 - stars.length
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />)
    }
    
    return stars
  }
  
  // Renderizar nivel de precio
  const renderPriceLevel = (priceLevel?: number | null) => {
    if (priceLevel === undefined || priceLevel === null) return null
    
    const dollars = []
    for (let i = 0; i < 4; i++) {
      dollars.push(
        <DollarSign 
          key={i} 
          className={`w-4 h-4 ${i < priceLevel ? 'text-green-500' : 'text-gray-300'}`}
        />
      )
    }
    
    return dollars
  }
  
  return (
    <div className="fixed inset-0 z-40 bg-black bg-opacity-50 backdrop-blur-sm sm:flex sm:justify-end">
      {/* Mobile: Bottom sheet | Desktop: Side panel */}
      <div 
        className={`
          fixed bottom-0 left-0 right-0 
          sm:static sm:w-[420px]
          h-[75vh] sm:h-screen
          bg-dark-card rounded-t-2xl sm:rounded-none
          shadow-lg flex flex-col
          transform transition-transform duration-300
          ${isOpen ? 'translate-y-0' : 'translate-y-full sm:translate-x-full'}
        `}
      >
        {/* Header with close button */}
        <div className="flex justify-between items-center p-4 border-b border-neon-blue/20">
          <h2 className="text-xl font-bold text-text-light">{t('venue.details')}</h2>
          <button 
            onClick={onClose}
            className="rounded-full p-1 hover:bg-dark-secondary"
          >
            <X className="w-6 h-6 text-text-light" />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Photo Carousel */}
          <div className="mb-4">
            <PhotoCarousel 
              photos={venue.photo_refs || (venue.photo_ref ? [venue.photo_ref] : [])} 
              venueName={venue.name}
              venueType={venue.type}
            />
          </div>
          
          {/* Venue details */}
          <h1 className="text-2xl font-bold text-text-light mb-2">{venue.name}</h1>
          
          {/* Rating and price level */}
          <div className="flex items-center space-x-4 mb-3">
            {venue.rating && (
              <div className="flex items-center space-x-1">
                {renderStars(venue.rating)}
                <span className="text-text-light ml-1">{venue.rating.toFixed(1)}</span>
              </div>
            )}
            
            {venue.price_level !== undefined && (
              <div className="flex items-center space-x-1">
                {renderPriceLevel(venue.price_level)}
              </div>
            )}
          </div>
          
          {/* Address */}
          <div className="flex items-start space-x-2 mb-4">
            <MapPin className="w-5 h-5 text-neon-blue mt-0.5" />
            <p className="text-text-secondary">{venue.address}</p>
          </div>
          
          {/* People count */}
          <div className="bg-dark-secondary rounded-lg p-3 mb-4">
            <div className="text-text-light">
              {venue.count_today === 1 ? (
                <>
                  <span className="text-neon-pink font-bold">{venue.count_today}</span> {t('venue.personUsedTicket')}
                </>
              ) : (
                <>
                  <span className="text-neon-pink font-bold">{venue.count_today || 0}</span> {t('venue.peopleUsedTicket')}
                </>
              )}
            </div>
          </div>
          
          {/* Venue type and avg price */}
          {venue.avg_price_text && (
            <div className="mb-4">
              <p className="text-text-secondary">{venue.avg_price_text}</p>
            </div>
          )}
        </div>
        
        {/* Action buttons */}
        <div className="p-4 pb-20 border-t border-neon-blue/20">
          {/* Botones principales */}
          <div className="flex space-x-3 mb-4">
            {/* I'm going button */}
            <button
              onClick={handleClickGoingButton}
              disabled={hasUsedTicketToday || isSubmitting}
              className={`
                flex-1 py-3 px-6 rounded-lg
                ${hasUsedTicketToday 
                  ? 'bg-gray-700 text-gray-400' 
                  : 'bg-neon-pink text-white hover:bg-opacity-90'}
                font-medium transition-colors
                flex items-center justify-center
              `}
            >
              {isSubmitting ? t('venue.processing') : hasUsedTicketToday ? t('venue.ticketUsedToday') : t('venue.imGoing')}
            </button>
            
            {/* Botón de guardar */}
            <button
              onClick={handleSaveVenue}
              className="py-3 px-4 rounded-lg transition-colors bg-dark-secondary text-text-light hover:bg-dark-hover flex items-center justify-center"
            >
              <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current text-yellow-400' : ''}`} />
            </button>
          </div>
          
          {/* External links */}
          <div className="flex space-x-3">
            {/* Botón de navegación */}
            <button
              onClick={handleOpenNavigation}
              className="flex-1 py-2 px-4 rounded-lg bg-dark-secondary text-text-light hover:bg-dark-hover text-center flex items-center justify-center"
            >
              <Navigation className="w-4 h-4 mr-2" />
              Navegar
            </button>
            
            {venue.website && (
              <a 
                href={venue.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2 px-4 rounded-lg bg-dark-secondary text-text-light hover:bg-dark-hover text-center flex items-center justify-center"
              >
                <Globe className="w-4 h-4 mr-2" />
                Website
              </a>
            )}
          </div>
        </div>
      </div>
      

      {/* Confirmation Modal */}
      <ConfirmTicketModal
        isOpen={showConfirmModal}
        venueName={venue.name}
        onConfirm={handleConfirmTicket}
        onCancel={handleCancelTicket}
      />
    </div>
  )
}
