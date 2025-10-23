'use client'

import React, { useState, useEffect } from 'react'
import { Heart, MessageCircle, Share2, MoreVertical, Image as ImageIcon, X, Globe, Users as UsersIcon, Clock, Trash2 } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import ActivityFeed from './ActivityFeed'
import CitySelector from './CitySelector'
import { SocialPostWithUser } from '@/lib/database.types'

interface City {
  name: string
  lat: number
  lng: number
}

interface SocialFeedProps {
  onVenueClick?: (venueId: string) => void
  userId?: string
}

export default function SocialFeed({ onVenueClick, userId }: SocialFeedProps) {
  const { t } = useLanguage()
  const [selectedCity, setSelectedCity] = useState<City | null>(null)
  const [posts, setPosts] = useState<SocialPostWithUser[]>([])
  const [newPostContent, setNewPostContent] = useState('')
  const [showNewPost, setShowNewPost] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [audience, setAudience] = useState<'public' | 'friends_only'>('public')
  const [loading, setLoading] = useState(false)
  const [posting, setPosting] = useState(false)
  const [showActivities, setShowActivities] = useState(true)

  // Cargar posts cuando se selecciona una ciudad
  useEffect(() => {
    if (selectedCity) {
      loadPosts()
    } else {
      setPosts([])
    }
  }, [selectedCity, userId])

  const loadPosts = async () => {
    if (!selectedCity) return
    
    setLoading(true)
    try {
      const params = new URLSearchParams({
        city: selectedCity.name,
        ...(userId && { userId })
      })
      
      const response = await fetch(`/api/social-posts?${params}`)
      if (response.ok) {
        const data = await response.json()
        setPosts(data)
      }
    } catch (error) {
      console.error('Error loading posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setSelectedImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCreatePost = async () => {
    if (!newPostContent.trim() || !selectedCity || !userId) return

    setPosting(true)
    try {
      const response = await fetch('/api/social-posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          content: newPostContent,
          city: selectedCity.name,
          city_lat: selectedCity.lat,
          city_lng: selectedCity.lng,
          audience,
          image_url: selectedImage
        })
      })

      if (response.ok) {
        setNewPostContent('')
        setSelectedImage(null)
        setShowNewPost(false)
        setAudience('public')
        await loadPosts()
      }
    } catch (error) {
      console.error('Error creating post:', error)
    } finally {
      setPosting(false)
    }
  }

  const handleDeletePost = async (postId: string) => {
    if (!userId) return
    
    try {
      const response = await fetch(`/api/social-posts?id=${postId}&userId=${userId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        await loadPosts()
      }
    } catch (error) {
      console.error('Error deleting post:', error)
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const now = new Date()
    const postDate = new Date(timestamp)
    const diffMs = now.getTime() - postDate.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)

    if (diffMins < 1) {
      return 'Justo ahora'
    } else if (diffMins < 60) {
      return `Hace ${diffMins} min`
    } else if (diffHours < 24) {
      return `Hace ${diffHours}h`
    } else {
      return postDate.toLocaleDateString()
    }
  }

  return (
    <div className="h-full bg-dark-primary overflow-y-auto pb-20">
      {/* Header con gradiente */}
      <div className="sticky top-0 z-10 bg-gradient-to-r from-neon-pink/20 via-neon-blue/20 to-neon-pink/20 backdrop-blur-lg border-b border-neon-blue/30 p-6">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-pink to-neon-blue">
          {t('common.social')}
        </h1>
        <p className="text-text-secondary text-sm mt-1">{t('common.seeWhereGoing')}</p>
        
        {/* Selector de ciudad */}
        <div className="mt-4">
          <CitySelector
            selectedCity={selectedCity}
            onCitySelect={setSelectedCity}
            placeholder="Selecciona una ciudad para ver posts..."
          />
        </div>
      </div>

      {/* Botón flotante para crear publicación - solo si hay ciudad seleccionada y usuario logueado */}
      {selectedCity && userId && (
        <button
          onClick={() => setShowNewPost(!showNewPost)}
          className="fixed bottom-24 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-neon-pink to-neon-blue text-white shadow-lg hover:scale-110 transition-transform flex items-center justify-center text-3xl font-light"
          style={{ boxShadow: '0 0 30px rgba(255, 20, 147, 0.6)' }}
        >
          +
        </button>
      )}

      {/* New Post Form */}
      {showNewPost && selectedCity && userId && (
        <div className="px-4 pt-4 pb-4">
          <div className="bg-dark-card rounded-2xl p-4 border border-neon-pink/30 shadow-xl">
            <div className="mb-3 text-text-secondary text-sm flex items-center gap-2">
              <span>Publicando en:</span>
              <span className="text-neon-blue font-semibold">{selectedCity.name}</span>
            </div>
            
            <textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="¿Qué está pasando?"
              maxLength={500}
              className="w-full bg-dark-secondary text-text-light rounded-lg p-3 mb-3 min-h-[100px] resize-none focus:outline-none focus:ring-2 focus:ring-neon-blue"
            />
            <div className="text-right text-xs text-text-secondary mb-3">
              {newPostContent.length}/500
            </div>
            
            {/* Preview de imagen seleccionada */}
            {selectedImage && (
              <div className="mb-3 relative">
                <img src={selectedImage} alt="Preview" className="w-full rounded-lg max-h-64 object-cover" />
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-2 right-2 bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            )}
            
            {/* Selector de audiencia */}
            <div className="mb-3">
              <p className="text-text-secondary text-sm mb-2">¿Quién puede ver esto?</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setAudience('public')}
                  className={`flex-1 px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                    audience === 'public'
                      ? 'bg-neon-blue text-white'
                      : 'bg-dark-secondary text-text-light hover:bg-dark-hover'
                  }`}
                >
                  <Globe className="w-4 h-4" />
                  <span>Público</span>
                </button>
                <button
                  onClick={() => setAudience('friends_only')}
                  className={`flex-1 px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                    audience === 'friends_only'
                      ? 'bg-neon-pink text-white'
                      : 'bg-dark-secondary text-text-light hover:bg-dark-hover'
                  }`}
                >
                  <UsersIcon className="w-4 h-4" />
                  <span>Solo amigos</span>
                </button>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <label className="text-text-secondary hover:text-neon-blue transition-colors cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <ImageIcon className="w-5 h-5" />
              </label>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setShowNewPost(false)
                    setNewPostContent('')
                    setSelectedImage(null)
                    setAudience('public')
                  }}
                  className="px-4 py-2 rounded-lg bg-dark-secondary text-text-light hover:bg-dark-hover transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreatePost}
                  disabled={!newPostContent.trim() || posting}
                  className="px-4 py-2 rounded-lg bg-neon-pink text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {posting ? 'Publicando...' : 'Publicar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        <div className="space-y-4">
          {/* Posts sociales - Solo si hay ciudad seleccionada */}
          {selectedCity && (
            <>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-blue"></div>
                </div>
              ) : (
                <>
                  {posts.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-bold text-text-light">
                          Mensajes de la comunidad - {selectedCity.name}
                        </h2>
                        <span className="text-xs text-text-secondary bg-dark-secondary px-2 py-1 rounded-full">
                          ⏱️ Últimas 24h
                        </span>
                      </div>
                      {posts.map((post) => (
                        <div
                          key={post.id}
                          className="bg-dark-card rounded-2xl p-4 border border-neon-blue/20 hover:border-neon-pink/40 transition-all"
                        >
                          <div className="flex items-start space-x-3">
                            {/* Avatar */}
                            <div className="flex-shrink-0">
                              {post.avatar_url ? (
                                <img
                                  src={post.avatar_url}
                                  alt={post.username || 'User'}
                                  className="w-12 h-12 rounded-full object-cover border-2 border-neon-blue/30"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neon-pink to-neon-blue flex items-center justify-center text-white font-bold text-lg">
                                  {(post.username || 'U').charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-neon-blue">
                                  {post.username || 'Usuario'}
                                </span>
                                {post.audience === 'friends_only' && (
                                  <div className="flex items-center" title="Solo amigos">
                                    <UsersIcon className="w-4 h-4 text-neon-pink" />
                                  </div>
                                )}
                                {post.audience === 'public' && (
                                  <div className="flex items-center" title="Público">
                                    <Globe className="w-4 h-4 text-text-secondary" />
                                  </div>
                                )}
                              </div>
                              
                              <p className="text-text-light leading-relaxed mb-2">
                                {post.content}
                              </p>
                              
                              {post.image_url && (
                                <img
                                  src={post.image_url}
                                  alt="Post image"
                                  className="w-full rounded-lg max-h-96 object-cover mb-2"
                                />
                              )}
                              
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-1 text-text-secondary text-sm">
                                  <Clock className="w-4 h-4" />
                                  <span>{formatTimestamp(post.created_at)}</span>
                                </div>
                                
                                {userId === post.user_id && (
                                  <button
                                    onClick={() => handleDeletePost(post.id)}
                                    className="text-text-secondary hover:text-red-500 transition-colors p-1"
                                    title="Eliminar post"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {posts.length === 0 && (
                    <div className="text-center py-8 text-text-secondary">
                      <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No hay mensajes en {selectedCity.name} aún</p>
                      {userId && <p className="text-sm mt-1">¡Sé el primero en publicar!</p>}
                    </div>
                  )}
                  
                  {/* Divider */}
                  <div className="border-t border-neon-blue/20 my-6"></div>
                </>
              )}
            </>
          )}
          
          {/* Feed de actividades - Siempre visible */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-text-light">
                Actividad de amigos
                {selectedCity && <span className="text-text-secondary text-sm font-normal ml-2">en {selectedCity.name}</span>}
              </h2>
              <span className="text-xs text-text-secondary bg-dark-secondary px-2 py-1 rounded-full">
                ⏱️ Últimas 24h
              </span>
            </div>
            <ActivityFeed 
              onVenueClick={onVenueClick} 
              cityFilter={selectedCity}
            />
          </div>
          
          {/* Mensaje informativo si no hay ciudad seleccionada */}
          {!selectedCity && (
            <div className="mt-6 p-4 bg-dark-card rounded-lg border border-neon-blue/20 text-center">
              <Globe className="w-10 h-10 mx-auto mb-3 text-neon-blue opacity-50" />
              <p className="text-text-secondary text-sm">
                💡 <span className="text-text-light font-semibold">Tip:</span> Selecciona una ciudad arriba para ver mensajes de la comunidad y filtrar actividades por ubicación
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
