'use client'

import React, { useState } from 'react'
import { X, DollarSign } from 'lucide-react'

interface FilterModalProps {
  isOpen: boolean
  onClose: () => void
  onApplyFilters: (filters: FilterOptions) => void
}

export interface FilterOptions {
  priceRange: string[]
  minRating: number
  sortBy: 'popularity' | 'rating' | 'price'
}

export default function FilterModal({ isOpen, onClose, onApplyFilters }: FilterModalProps) {
  const [selectedPrices, setSelectedPrices] = useState<string[]>([])
  const [minRating, setMinRating] = useState<number>(0)
  const [sortBy, setSortBy] = useState<'popularity' | 'rating' | 'price'>('popularity')

  if (!isOpen) return null

  const priceOptions = [
    { label: '$ - Barato', value: '$', symbol: '$' },
    { label: '$$ - Moderado', value: '$$', symbol: '$$' },
    { label: '$$$ - Caro', value: '$$$', symbol: '$$$' },
    { label: '$$$$ - Muy caro', value: '$$$$', symbol: '$$$$' }
  ]

  const handlePriceToggle = (value: string) => {
    if (selectedPrices.includes(value)) {
      setSelectedPrices(selectedPrices.filter(p => p !== value))
    } else {
      setSelectedPrices([...selectedPrices, value])
    }
  }

  const handleApply = () => {
    onApplyFilters({
      priceRange: selectedPrices,
      minRating,
      sortBy
    })
    onClose()
  }

  const handleReset = () => {
    setSelectedPrices([])
    setMinRating(0)
    setSortBy('popularity')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-dark-card rounded-t-3xl shadow-2xl border-t border-neon-blue/30 animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neon-blue/20">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-pink to-neon-blue">
            Filtros
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-dark-secondary transition-colors"
          >
            <X className="w-6 h-6 text-text-secondary" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Precio */}
          <div>
            <h3 className="text-lg font-semibold text-text-light mb-3">Rango de precio</h3>
            <div className="grid grid-cols-2 gap-3">
              {priceOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handlePriceToggle(option.value)}
                  className={`
                    p-4 rounded-xl border-2 transition-all
                    ${selectedPrices.includes(option.value)
                      ? 'border-neon-pink bg-neon-pink/10 text-neon-pink'
                      : 'border-neon-blue/20 bg-dark-secondary text-text-secondary hover:border-neon-blue/40'
                    }
                  `}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <DollarSign className="w-5 h-5" />
                    <span className="font-medium">{option.symbol}</span>
                  </div>
                  <div className="text-xs mt-1 opacity-70">{option.label.split(' - ')[1]}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Rating mínimo */}
          <div>
            <h3 className="text-lg font-semibold text-text-light mb-3">
              Rating mínimo: {minRating > 0 ? `${minRating}.0` : 'Todos'}
            </h3>
            <div className="flex space-x-2">
              {[0, 3, 4].map((rating) => (
                <button
                  key={rating}
                  onClick={() => setMinRating(rating)}
                  className={`
                    flex-1 py-3 rounded-lg border-2 transition-all
                    ${minRating === rating
                      ? 'border-neon-blue bg-neon-blue/10 text-neon-blue'
                      : 'border-neon-blue/20 bg-dark-secondary text-text-secondary hover:border-neon-blue/40'
                    }
                  `}
                >
                  {rating === 0 ? 'Todos' : `${rating}.0+`}
                </button>
              ))}
            </div>
          </div>

          {/* Ordenar por */}
          <div>
            <h3 className="text-lg font-semibold text-text-light mb-3">Ordenar por</h3>
            <div className="space-y-2">
              {[
                { value: 'popularity', label: '🔥 Popularidad (más asistentes)' },
                { value: 'rating', label: '⭐ Mejor valorados' },
                { value: 'price', label: '💰 Precio (menor a mayor)' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSortBy(option.value as any)}
                  className={`
                    w-full p-4 rounded-lg border-2 text-left transition-all
                    ${sortBy === option.value
                      ? 'border-neon-pink bg-neon-pink/10 text-neon-pink'
                      : 'border-neon-blue/20 bg-dark-secondary text-text-secondary hover:border-neon-blue/40'
                    }
                  `}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-neon-blue/20 flex space-x-3">
          <button
            onClick={handleReset}
            className="flex-1 py-3 rounded-lg bg-dark-secondary text-text-light hover:bg-dark-hover transition-colors"
          >
            Resetear
          </button>
          <button
            onClick={handleApply}
            className="flex-1 py-3 rounded-lg bg-gradient-to-r from-neon-pink to-neon-blue text-white font-semibold hover:opacity-90 transition-opacity"
          >
            Aplicar filtros
          </button>
        </div>
      </div>
    </div>
  )
}
