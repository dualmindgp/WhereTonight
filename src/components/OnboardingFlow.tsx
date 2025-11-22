'use client'

import React, { useState } from 'react'
import { ChevronRight, ChevronLeft, X, Calendar, Music, User } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useToastContext } from '@/contexts/ToastContext'

interface OnboardingFlowProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  currentUsername: string
  onComplete: () => void
}

const MUSIC_GENRES = [
  'Techno', 'House', 'Trance', 'Drum & Bass', 'Dubstep',
  'Pop', 'Rock', 'Indie', 'Hip Hop', 'R&B', 'Jazz',
  'Reggaeton', 'Salsa', 'Bachata', 'Flamenco', 'Electrónica'
]

const CITIES = [
  'Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Bilbao',
  'Málaga', 'Murcia', 'Palma', 'Las Palmas', 'Zaragoza',
  'Otra'
]

export default function OnboardingFlow({
  isOpen,
  onClose,
  userId,
  currentUsername,
  onComplete
}: OnboardingFlowProps) {
  const toast = useToastContext()
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  
  // Form state
  const [username, setUsername] = useState(currentUsername || '')
  const [birthDate, setBirthDate] = useState('')
  const [city, setCity] = useState('')
  const [customCity, setCustomCity] = useState('')
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])

  const steps = [
    { title: 'Tu nombre', icon: User, description: '¿Cómo quieres que te llamemos?' },
    { title: 'Tu cumpleaños', icon: Calendar, description: '¿Cuándo naciste?' },
    { title: 'Tu música', icon: Music, description: '¿Qué géneros te gustan?' }
  ]

  // Helper para calcular edad desde birth_date
  const calculateAge = (birthDateString: string): number | null => {
    if (!birthDateString) return null
    
    const birthDate = new Date(birthDateString)
    const today = new Date()
    
    if (birthDate > today) return null
    
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    return age
  }

  // Validación de edad estricta
  const validateBirthDate = (birthDateString: string): { isValid: boolean; error?: string } => {
    if (!birthDateString) {
      return { isValid: true } // Opcional
    }

    const birthDate = new Date(birthDateString)
    const today = new Date()
    
    // No permitir fechas futuras
    if (birthDate > today) {
      return { isValid: false, error: 'La fecha de nacimiento no puede ser en el futuro' }
    }
    
    // No permitir fechas muy antiguas (más de 120 años)
    const maxAgeDate = new Date()
    maxAgeDate.setFullYear(today.getFullYear() - 120)
    if (birthDate < maxAgeDate) {
      return { isValid: false, error: 'La fecha de nacimiento no es válida' }
    }
    
    // Calcular edad y verificar mínimo 16 años
    const age = calculateAge(birthDateString)
    if (age === null || age < 16) {
      return { isValid: false, error: 'Debes tener al menos 16 años para usar la aplicación' }
    }
    
    return { isValid: true }
  }

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev => 
      prev.includes(genre) 
        ? prev.filter(g => g !== genre)
        : [...prev, genre].slice(0, 5)
    )
  }

  const canGoNext = () => {
    switch (currentStep) {
      case 0: return username.trim().length > 0
      case 1: return birthDate !== ''
      case 2: return true // Los géneros son opcionales
      default: return false
    }
  }

  const handleNext = () => {
    if (canGoNext() && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    if (!username.trim()) {
      toast.error('El nombre de usuario es obligatorio')
      return
    }

    // Validar fecha de nacimiento si se proporciona
    if (birthDate) {
      const validation = validateBirthDate(birthDate)
      if (!validation.isValid) {
        toast.error(validation.error || 'Fecha de nacimiento inválida')
        return
      }
    }

    setLoading(true)
    
    try {
      const profileData: any = {
        username: username.trim(),
        custom_handle: username.toLowerCase().replace(/\s+/g, '_')
      }

      if (birthDate) {
        profileData.birth_date = birthDate
      }
      if (city === 'Otra' && customCity) {
        profileData.city = customCity.trim()
      } else if (city && city !== 'Otra') {
        profileData.city = city
      }
      if (selectedGenres.length > 0) {
        profileData.music_genres = selectedGenres
      }

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          ...profileData
        })

      if (error) throw error

      toast.success('¡Bienvenido a Tonight!')
      onComplete()
      onClose()
    } catch (error) {
      console.error('Error saving profile:', error)
      toast.error('Error al guardar el perfil')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const currentStepData = steps[currentStep]
  const CurrentIcon = currentStepData.icon

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-3xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto border border-purple-500/20">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
              <CurrentIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{currentStepData.title}</h2>
              <p className="text-sm text-gray-400">{currentStepData.description}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Progress dots */}
        <div className="flex gap-2 mb-8">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`flex-1 h-1 rounded-full transition-colors ${
                index <= currentStep ? 'bg-purple-600' : 'bg-gray-700'
              }`}
            />
          ))}
        </div>

        {/* Step content */}
        <div className="min-h-[300px]">
          {currentStep === 0 && (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nombre de usuario *
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Tu nombre"
                className="w-full px-4 py-4 bg-gray-800 text-white rounded-lg border border-purple-500/30 focus:outline-none focus:ring-2 focus:ring-purple-500 text-lg"
                maxLength={30}
                autoFocus
              />
              <p className="text-xs text-gray-500">
                Esto aparecerá como @{username.toLowerCase().replace(/\s+/g, '_')}
              </p>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Fecha de nacimiento
              </label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full px-4 py-4 bg-gray-800 text-white rounded-lg border border-purple-500/30 focus:outline-none focus:ring-2 focus:ring-purple-500 text-lg"
                max={new Date().toISOString().split('T')[0]}
                autoFocus
              />
              {birthDate && (
                <p className="text-sm text-gray-400">
                  Tendrás {calculateAge(birthDate) || 'Fecha inválida'} años
                </p>
              )}
              
              {/* Ciudad (opcional en este paso) */}
              <div className="pt-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  ¿De dónde eres? (opcional)
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-purple-500/30 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Selecciona tu ciudad</option>
                  {CITIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                
                {city === 'Otra' && (
                  <input
                    type="text"
                    value={customCity}
                    onChange={(e) => setCustomCity(e.target.value)}
                    placeholder="Nombre de tu ciudad"
                    className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-purple-500/30 focus:outline-none focus:ring-2 focus:ring-purple-500 mt-2"
                  />
                )}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                ¿Qué música te gusta? (máx. 5)
              </label>
              <div className="flex flex-wrap gap-2">
                {MUSIC_GENRES.map(genre => (
                  <button
                    key={genre}
                    onClick={() => toggleGenre(genre)}
                    className={`px-4 py-3 rounded-full text-sm transition-all ${
                      selectedGenres.includes(genre)
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {genre}
                  </button>
                ))}
              </div>
              {selectedGenres.length > 0 && (
                <p className="text-sm text-gray-400">
                  Seleccionados: {selectedGenres.join(', ')}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Navigation buttons */}
        <div className="flex gap-3 mt-8">
          {currentStep > 0 && (
            <button
              onClick={handlePrevious}
              className="px-6 py-3 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </button>
          )}
          
          <div className="flex-1" />
          
          {currentStep < steps.length - 1 ? (
            <button
              onClick={handleNext}
              disabled={!canGoNext()}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              Siguiente
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading || !username.trim()}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                '¡Comenzar!'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
