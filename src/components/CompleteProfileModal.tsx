'use client'

import React, { useState } from 'react'
import { X, Save, Music, MapPin, Calendar } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useToastContext } from '@/contexts/ToastContext'

interface CompleteProfileModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  currentUsername: string
  onProfileUpdated: () => void
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

export default function CompleteProfileModal({
  isOpen,
  onClose,
  userId,
  currentUsername,
  onProfileUpdated
}: CompleteProfileModalProps) {
  const toast = useToastContext()
  const [loading, setLoading] = useState(false)
  
  // Form state
  const [username, setUsername] = useState(currentUsername || '')
  const [birthDate, setBirthDate] = useState('')
  const [city, setCity] = useState('')
  const [customCity, setCustomCity] = useState('')
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])

  // Helper para calcular edad a partir de fecha de nacimiento
  const calculateAge = (birthDateString: string): number | null => {
    if (!birthDateString) return null
    
    const birthDate = new Date(birthDateString)
    const today = new Date()
    
    // Validar que la fecha no sea futura
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
        : [...prev, genre].slice(0, 5) // Máximo 5 géneros
    )
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

      // Campos opcionales
      if (birthDate) {
        profileData.birth_date = birthDate
        // No guardamos age, se calculará en el frontend cada vez
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

      toast.success('¡Perfil completado!')
      onProfileUpdated()
      onClose()
    } catch (error) {
      console.error('Error saving profile:', error)
      toast.error('Error al guardar el perfil')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-3xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto border border-purple-500/20">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Completa tu perfil</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Username (obligatorio) */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nombre de usuario *
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Tu nombre"
              className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-purple-500/30 focus:outline-none focus:ring-2 focus:ring-purple-500"
              maxLength={30}
            />
            <p className="text-xs text-gray-500 mt-1">
              Esto aparecerá como @{username.toLowerCase().replace(/\s+/g, '_')}
            </p>
          </div>

          {/* Fecha de nacimiento (opcional) */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Fecha de nacimiento (opcional)
            </label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-purple-500/30 focus:outline-none focus:ring-2 focus:ring-purple-500"
              max={new Date().toISOString().split('T')[0]} // Máximo fecha actual
            />
            {birthDate && (
              <p className="text-xs text-gray-500 mt-1">
                Edad actual: {calculateAge(birthDate) || 'Fecha inválida'} años
              </p>
            )}
          </div>

          {/* Ciudad (opcional) */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Ciudad (opcional)
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

          {/* Géneros musicales (opcional) */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
              <Music className="w-4 h-4" />
              Música que te gusta (máx. 5)
            </label>
            <div className="flex flex-wrap gap-2">
              {MUSIC_GENRES.map(genre => (
                <button
                  key={genre}
                  onClick={() => toggleGenre(genre)}
                  className={`px-3 py-2 rounded-full text-sm transition-all ${
                    selectedGenres.includes(genre)
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-3 mt-8 mb-4">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Omitir por ahora
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !username.trim()}
            className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4" />
                Guardar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
