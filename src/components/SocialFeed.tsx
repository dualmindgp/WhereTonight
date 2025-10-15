'use client'

import React, { useState } from 'react'
import { Heart, MessageCircle, Share2, MoreVertical, Image as ImageIcon, X } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import ActivityFeed from './ActivityFeed'

interface Post {
  id: string
  user_name: string
  user_avatar?: string
  content: string
  image_url?: string
  likes: number
  comments: number
  timestamp: string
  isLiked: boolean
}

interface SocialFeedProps {
  onVenueClick?: (venueId: string) => void
}

// Posts de ejemplo (después se cargarán de Supabase)
const MOCK_POSTS: Post[] = [
  {
    id: '1',
    user_name: 'Ana García',
    content: '¡Increíble noche en Chicas & Gorillas! 🎉 La música estuvo genial y el ambiente espectacular. Totalmente recomendado para el viernes 🔥',
    image_url: undefined,
    likes: 24,
    comments: 5,
    timestamp: 'Hace 2 horas',
    isLiked: false
  },
  {
    id: '2',
    user_name: 'Carlos Ruiz',
    content: 'Buscando un buen lugar para esta noche. ¿Alguna recomendación? 🤔',
    likes: 8,
    comments: 12,
    timestamp: 'Hace 4 horas',
    isLiked: false
  },
  {
    id: '3',
    user_name: 'María López',
    content: 'El mejor plan de sábado: buenos amigos + buena música + Varsovia nocturna 🌃✨',
    likes: 31,
    comments: 7,
    timestamp: 'Hace 6 horas',
    isLiked: true
  }
]

export default function SocialFeed({ onVenueClick }: SocialFeedProps) {
  const { t } = useLanguage()
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS)
  const [newPostContent, setNewPostContent] = useState('')
  const [showNewPost, setShowNewPost] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [showActivities, setShowActivities] = useState(true)

  const handleLike = (postId: string) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          isLiked: !post.isLiked,
          likes: post.isLiked ? post.likes - 1 : post.likes + 1
        }
      }
      return post
    }))
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

  const handleCreatePost = () => {
    if (!newPostContent.trim() && !selectedImage) return

    const newPost: Post = {
      id: Date.now().toString(),
      user_name: 'Tú',
      content: newPostContent,
      image_url: selectedImage || undefined,
      likes: 0,
      comments: 0,
      timestamp: 'Justo ahora',
      isLiked: false
    }

    setPosts([newPost, ...posts])
    setNewPostContent('')
    setSelectedImage(null)
    setShowNewPost(false)
  }

  return (
    <div className="h-full bg-dark-primary overflow-y-auto pb-20">
      {/* Header con gradiente */}
      <div className="sticky top-0 z-10 bg-gradient-to-r from-neon-pink/20 via-neon-blue/20 to-neon-pink/20 backdrop-blur-lg border-b border-neon-blue/30 p-6">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-pink to-neon-blue">
          {t('common.social')}
        </h1>
        <p className="text-text-secondary text-sm mt-1">{t('common.seeWhereGoing')}</p>
      </div>

      {/* Botón flotante para crear publicación */}
      <button
        onClick={() => setShowNewPost(!showNewPost)}
        className="fixed bottom-24 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-neon-pink to-neon-blue text-white shadow-lg hover:scale-110 transition-transform flex items-center justify-center text-3xl font-light"
        style={{ boxShadow: '0 0 30px rgba(255, 20, 147, 0.6)' }}
      >
        +
      </button>

      {/* New Post Form */}
      {showNewPost && (
        <div className="px-4 pt-4 pb-4">
          <div className="bg-dark-card rounded-2xl p-4 border border-neon-pink/30 shadow-xl">
            <textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="¿Qué está pasando?"
              className="w-full bg-dark-secondary text-text-light rounded-lg p-3 mb-3 min-h-[100px] resize-none focus:outline-none focus:ring-2 focus:ring-neon-blue"
            />
            
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
                  onClick={() => setShowNewPost(false)}
                  className="px-4 py-2 rounded-lg bg-dark-secondary text-text-light hover:bg-dark-hover transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreatePost}
                  disabled={!newPostContent.trim() && !selectedImage}
                  className="px-4 py-2 rounded-lg bg-neon-pink text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Publicar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content - Solo feed de actividades */}
      <div className="p-4">
        <ActivityFeed onVenueClick={onVenueClick} />
      </div>
    </div>
  )
}
