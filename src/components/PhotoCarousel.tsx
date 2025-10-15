'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PhotoCarouselProps {
  photos: string[]
  venueName: string
  venueType?: string
}

export default function PhotoCarousel({ photos, venueName, venueType = 'other' }: PhotoCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  if (!photos || photos.length === 0) {
    return (
      <div className="w-full aspect-video bg-dark-secondary flex items-center justify-center">
        <div className="text-text-secondary">No hay fotos disponibles</div>
      </div>
    )
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1))
  }

  return (
    <div className="relative w-full aspect-video bg-dark-secondary rounded-lg overflow-hidden">
      {/* Imagen actual */}
      <img
        src={`/api/photo?ref=${photos[currentIndex]}&type=${venueType}`}
        alt={`${venueName} - foto ${currentIndex + 1}`}
        className="w-full h-full object-cover"
        onError={(e) => {
          // Si falla, intentar recargar con fallback explícito
          if (!e.currentTarget.src.includes('fallback')) {
            e.currentTarget.src = `/api/photo?type=${venueType}&fallback=true`
          }
        }}
      />

      {/* Botones de navegación (solo si hay más de 1 foto) */}
      {photos.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all"
            aria-label="Foto anterior"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-all"
            aria-label="Siguiente foto"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Indicadores de página */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
            {photos.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? 'bg-white w-6'
                    : 'bg-white/50 hover:bg-white/75'
                }`}
                aria-label={`Ir a foto ${index + 1}`}
              />
            ))}
          </div>

          {/* Contador */}
          <div className="absolute top-3 right-3 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
            {currentIndex + 1} / {photos.length}
          </div>
        </>
      )}
    </div>
  )
}
