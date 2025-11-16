'use client'

import React, { useState, useEffect } from 'react'
import { X, ChevronLeft, ChevronRight, Clock, Globe, Users as UsersIcon, Heart, MessageCircle, MapPin, Edit2, Save } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { SocialPostWithUser } from '@/lib/database.types'

interface StoryViewerProps {
  friendId: string
  friendUsername: string
  onClose: () => void
  selectedCity?: { name: string; lat: number; lng: number } | null
  currentUserId?: string
  onVenueClick?: (venueId: string) => void
}

export default function StoryViewer({ 
  friendId, 
  friendUsername, 
  onClose,
  selectedCity,
  currentUserId,
  onVenueClick
}: StoryViewerProps) {
  const [posts, setPosts] = useState<SocialPostWithUser[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState(0)
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    loadFriendPosts()
  }, [friendId, selectedCity])

  // Auto-avanzar cada 5 segundos (pausar cuando está editando)
  useEffect(() => {
    if (posts.length === 0 || isEditing) return // Pausar si está editando

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNext()
          return 0
        }
        return prev + 2 // 2% cada 100ms = 5 segundos total
      })
    }, 100)

    return () => clearInterval(interval)
  }, [currentIndex, posts.length, isEditing]) // Añadir isEditing a las dependencias

  const loadFriendPosts = async () => {
    setLoading(true)
    try {
      const twentyFourHoursAgo = new Date()
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24)

      let query = supabase
        .from('social_posts_with_user')
        .select('*')
        .eq('user_id', friendId)
        .gte('created_at', twentyFourHoursAgo.toISOString())
        .order('created_at', { ascending: false })

      if (selectedCity) {
        query = query.eq('city', selectedCity.name)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error loading friend posts:', error)
      } else {
        setPosts(data || [])
      }
    } catch (error) {
      console.error('Error loading friend posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleNext = () => {
    if (currentIndex < posts.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setProgress(0)
    } else {
      onClose()
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setProgress(0)
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const now = new Date()
    const postDate = new Date(timestamp)
    const diffMs = now.getTime() - postDate.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)

    if (diffMins < 1) return 'Justo ahora'
    if (diffMins < 60) return `Hace ${diffMins} min`
    if (diffHours < 24) return `Hace ${diffHours}h`
    return postDate.toLocaleDateString()
  }

  const handleBackgroundClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    if (target.classList.contains('story-container')) {
      handleNext()
    }
  }

  const handleEditClick = () => {
    setIsEditing(true)
    setEditedContent(currentPost.content || '')
  }

  const handleSaveEdit = async () => {
    if (!currentPost || !currentUserId) return
    
    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('social_posts')
        .update({ content: editedContent })
        .eq('id', currentPost.id)
        .eq('user_id', currentUserId) // Asegurar que solo puede editar sus propios posts
      
      if (error) {
        console.error('Error updating post:', error)
        alert('Error al guardar los cambios')
      } else {
        // Actualizar el post localmente
        const updatedPosts = [...posts]
        updatedPosts[currentIndex] = { ...currentPost, content: editedContent }
        setPosts(updatedPosts)
        setIsEditing(false)
        console.log('✅ Historia actualizada exitosamente')
      }
    } catch (error) {
      console.error('Error saving edit:', error)
      alert('Error al guardar los cambios')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditedContent('')
  }

  const isOwnStory = currentUserId && friendId === currentUserId
  const currentPost = posts[currentIndex]

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-blue"></div>
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-light mb-4">
            {friendUsername} no tiene publicaciones recientes
            {selectedCity && ` en ${selectedCity.name}`}
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-neon-blue text-black rounded-lg hover:opacity-90 transition-opacity"
          >
            Cerrar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
      {/* Botón cerrar */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-colors"
      >
        <X className="w-6 h-6 text-white" />
      </button>

      {/* Botón editar (solo para historias propias) */}
      {isOwnStory && !isEditing && (
        <button
          onClick={handleEditClick}
          className="absolute top-4 right-16 z-10 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-colors"
        >
          <Edit2 className="w-5 h-5 text-white" />
        </button>
      )}

      {/* Botón guardar (cuando está editando) */}
      {isEditing && (
        <button
          onClick={handleSaveEdit}
          disabled={isSaving}
          className="absolute top-4 right-16 z-10 w-10 h-10 rounded-full bg-neon-pink hover:bg-neon-pink/80 flex items-center justify-center transition-colors disabled:opacity-50"
        >
          <Save className="w-5 h-5 text-white" />
        </button>
      )}

      {/* Botones de navegación */}
      {currentIndex > 0 && (
        <button
          onClick={handlePrevious}
          className="absolute left-4 z-10 w-12 h-12 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-colors"
        >
          <ChevronLeft className="w-8 h-8 text-white" />
        </button>
      )}

      {currentIndex < posts.length - 1 && (
        <button
          onClick={handleNext}
          className="absolute right-4 z-10 w-12 h-12 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-colors"
        >
          <ChevronRight className="w-8 h-8 text-white" />
        </button>
      )}

      {/* Contenedor principal */}
      <div 
        className="relative max-w-lg w-full h-[80vh] bg-dark-card rounded-2xl overflow-hidden"
        onClick={handleBackgroundClick}
      >
        {/* Barras de progreso */}
        <div className="absolute top-0 left-0 right-0 z-10 flex gap-1 p-2">
          {posts.map((_, index) => (
            <div
              key={index}
              className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden"
            >
              <div
                className="h-full bg-white transition-all duration-100"
                style={{
                  width: index < currentIndex ? '100%' : index === currentIndex ? `${progress}%` : '0%'
                }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-4 left-0 right-0 z-10 px-4 mt-4">
          <div className="flex items-center gap-3">
            {currentPost.avatar_url ? (
              <img
                src={currentPost.avatar_url}
                alt={friendUsername}
                className="w-10 h-10 rounded-full object-cover border-2 border-neon-blue"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-pink to-neon-blue flex items-center justify-center text-white font-bold border-2 border-neon-blue">
                {friendUsername.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1">
              <p className="text-white font-semibold text-sm">{friendUsername}</p>
              <div className="flex items-center gap-2 text-xs text-white/70">
                <Clock className="w-3 h-3" />
                <span>{formatTimestamp(currentPost.created_at)}</span>
                {currentPost.audience === 'friends_only' ? (
                  <UsersIcon className="w-3 h-3" />
                ) : (
                  <Globe className="w-3 h-3" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Contenido del post */}
        <div className="h-full flex flex-col justify-center p-6 pt-24 pb-20">
          {/* Formato especial para historias de tickets */}
          {(currentPost as any).is_ticket_story && (currentPost as any).venue_photo && (currentPost as any).venue_name ? (
            <div className="flex-1 flex flex-col justify-center items-center">
              {/* Imagen del venue */}
              <div className="w-full max-w-md mb-6 relative">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70 rounded-2xl z-10"></div>
                <img
                  src={(currentPost as any).venue_photo}
                  alt={(currentPost as any).venue_name}
                  className="w-full h-[50vh] object-cover rounded-2xl shadow-2xl"
                />
                <div className="absolute bottom-6 left-6 right-6 z-20">
                  <h3 className="text-white text-3xl font-black mb-2 drop-shadow-2xl">
                    {(currentPost as any).venue_name}
                  </h3>
                  <p className="text-white/90 text-lg drop-shadow-lg">{currentPost.content}</p>
                </div>
              </div>
              
              {/* Botón Te apuntas? */}
              {(currentPost as any).venue_id && onVenueClick && (
                <button
                  onClick={() => {
                    onVenueClick((currentPost as any).venue_id)
                    onClose()
                  }}
                  className="bg-gradient-to-r from-neon-pink to-neon-blue text-white px-10 py-4 rounded-2xl font-black text-lg shadow-2xl hover:scale-105 transition-transform flex items-center gap-3 animate-pulse"
                  style={{
                    boxShadow: '0 0 40px rgba(255, 20, 147, 0.6), 0 0 80px rgba(0, 217, 255, 0.4)'
                  }}
                >
                  <MapPin className="w-6 h-6" />
                  ¿Te apuntas?
                </button>
              )}
            </div>
          ) : (
            // Formato normal para posts regulares
            <>
              {currentPost.image_url ? (
                <img
                  src={currentPost.image_url}
                  alt="Post"
                  className="w-full max-h-[50vh] object-contain rounded-lg mb-4"
                />
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center px-6">
                    <p className="text-white text-xl leading-relaxed">
                      {currentPost.content}
                    </p>
                  </div>
                </div>
              )}

              {currentPost.image_url && currentPost.content && !isEditing && (
                <div className="bg-black/50 rounded-lg p-4 backdrop-blur-sm">
                  <p className="text-white leading-relaxed">{currentPost.content}</p>
                </div>
              )}
              
              {/* Textarea de edición */}
              {isEditing && (
                <div className="bg-black/70 rounded-lg p-4 backdrop-blur-sm">
                  <textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className="w-full bg-transparent text-white leading-relaxed resize-none focus:outline-none min-h-[100px] border border-neon-blue/30 rounded p-2"
                    placeholder="Escribe tu texto..."
                    autoFocus
                  />
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={handleSaveEdit}
                      disabled={isSaving}
                      className="flex-1 py-2 px-4 bg-neon-pink hover:bg-neon-pink/80 text-white rounded-lg transition-colors disabled:opacity-50 font-bold"
                    >
                      {isSaving ? 'Guardando...' : 'Guardar'}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="flex-1 py-2 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors font-bold"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer con ciudad */}
        {currentPost.city && (
          <div className="absolute bottom-4 left-4 right-4 z-10">
            <div className="bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white/90">
                <span className="text-sm">📍 {currentPost.city}</span>
              </div>
              <div className="text-xs text-white/70">
                {currentIndex + 1} / {posts.length}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
