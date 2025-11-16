'use client'

import React, { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Friend {
  id: string
  username: string
  avatar_url?: string
  has_active_posts: boolean
  last_post_time?: string
}

interface FriendStoriesProps {
  userId?: string
  selectedCity?: { name: string; lat: number; lng: number } | null
  onStoryClick: (friendId: string, username: string) => void
  onCreateStory: () => void
}

export default function FriendStories({ 
  userId, 
  selectedCity, 
  onStoryClick,
  onCreateStory 
}: FriendStoriesProps) {
  const [friends, setFriends] = useState<Friend[]>([])
  const [loading, setLoading] = useState(false)
  const [userHasStory, setUserHasStory] = useState(false)

  useEffect(() => {
    if (userId) {
      loadFriendStories()
      checkUserStory()
    }
  }, [userId, selectedCity])
  
  const checkUserStory = async () => {
    if (!userId) return
    
    try {
      const twentyFourHoursAgo = new Date()
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24)
      
      let query = supabase
        .from('social_posts')
        .select('id')
        .eq('user_id', userId)
        .gte('created_at', twentyFourHoursAgo.toISOString())
      
      if (selectedCity) {
        query = query.eq('city', selectedCity.name)
      }
      
      const { data, error } = await query.limit(1)
      
      if (!error && data && data.length > 0) {
        setUserHasStory(true)
      } else {
        setUserHasStory(false)
      }
    } catch (error) {
      console.error('Error checking user story:', error)
    }
  }

  const loadFriendStories = async () => {
    if (!userId) return
    
    setLoading(true)
    try {
      // Obtener amigos del usuario
      const { data: friendships, error: friendError } = await supabase
        .from('friendships')
        .select('user_id, friend_id')
        .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
        .eq('status', 'accepted')

      if (friendError) {
        console.error('Error loading friendships:', friendError)
        return
      }

      const friendIds: string[] = []
      friendships?.forEach((f) => {
        if (f.user_id === userId) {
          friendIds.push(f.friend_id)
        } else {
          friendIds.push(f.user_id)
        }
      })

      if (friendIds.length === 0) {
        setFriends([])
        return
      }

      // Obtener perfiles de amigos
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', friendIds)

      if (profilesError) {
        console.error('Error loading profiles:', profilesError)
        return
      }

      // Verificar quiénes tienen posts activos (últimas 24h)
      const twentyFourHoursAgo = new Date()
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24)

      let postsQuery = supabase
        .from('social_posts')
        .select('user_id, created_at')
        .in('user_id', friendIds)
        .gte('created_at', twentyFourHoursAgo.toISOString())

      // Filtrar por ciudad si está seleccionada
      if (selectedCity) {
        postsQuery = postsQuery.eq('city', selectedCity.name)
      }

      const { data: activePosts } = await postsQuery

      // Mapear amigos con información de posts activos
      const friendsWithPosts = profiles?.map((profile) => {
        const userPosts = activePosts?.filter((post) => post.user_id === profile.id) || []
        const lastPost = userPosts.length > 0 
          ? userPosts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
          : null

        return {
          id: profile.id,
          username: profile.username,
          avatar_url: profile.avatar_url,
          has_active_posts: userPosts.length > 0,
          last_post_time: lastPost?.created_at
        }
      }) || []

      // Ordenar: primero los que tienen posts activos
      friendsWithPosts.sort((a, b) => {
        if (a.has_active_posts && !b.has_active_posts) return -1
        if (!a.has_active_posts && b.has_active_posts) return 1
        if (a.has_active_posts && b.has_active_posts) {
          return new Date(b.last_post_time!).getTime() - new Date(a.last_post_time!).getTime()
        }
        return a.username.localeCompare(b.username)
      })

      setFriends(friendsWithPosts)
    } catch (error) {
      console.error('Error loading friend stories:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!userId) return null

  const handleUserStoryClick = async () => {
    if (userHasStory && userId) {
      // Abrir el visor de historias con las historias del usuario
      const { data: userData } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', userId)
        .single()
      
      onStoryClick(userId, userData?.username || 'Tu')
    } else {
      // Crear nueva historia
      onCreateStory()
    }
  }

  return (
    <div className="w-full bg-gradient-to-r from-dark-primary via-dark-secondary to-dark-primary border-b border-white/5 py-6 px-6 overflow-x-auto shadow-lg">
      <div className="max-w-7xl mx-auto">
        <div className="flex gap-5 min-w-max justify-end pr-4 md:pr-6 lg:pr-8">
          {/* Tu historia - Muestra avatar si tiene historias activas */}
          <button
            onClick={handleUserStoryClick}
            className="flex flex-col items-center gap-3 min-w-[80px] group"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-neon-pink to-neon-blue rounded-full blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>
              {userHasStory ? (
                // Si tiene historia, mostrar avatar con anillo de gradiente
                <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-neon-pink via-purple-500 to-neon-blue p-[3px] shadow-xl group-hover:scale-110 transition-transform animate-pulse">
                  <div className="w-full h-full rounded-full bg-dark-primary flex items-center justify-center overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-br from-neon-blue/20 to-neon-pink/20 flex items-center justify-center text-white font-bold text-2xl">
                      Tú
                    </div>
                  </div>
                </div>
              ) : (
                // Si no tiene historia, mostrar botón + para crear
                <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-neon-pink via-purple-500 to-neon-blue p-[3px] shadow-xl group-hover:scale-110 transition-transform">
                  <div className="w-full h-full rounded-full bg-dark-primary flex items-center justify-center">
                    <Plus className="w-8 h-8 text-neon-blue group-hover:text-neon-pink transition-colors" strokeWidth={2.5} />
                  </div>
                </div>
              )}
            </div>
            <span className="text-xs text-neon-blue group-hover:text-neon-pink transition-colors font-bold tracking-wide">
              Tu historia
            </span>
          </button>

          {/* Stories de amigos */}
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-neon-pink to-neon-blue rounded-full blur-lg opacity-50"></div>
                <div className="relative animate-spin rounded-full h-10 w-10 border-b-2 border-neon-blue"></div>
              </div>
            </div>
          ) : (
            <>
              {friends.map((friend) => (
                <button
                  key={friend.id}
                  onClick={() => onStoryClick(friend.id, friend.username)}
                  className="flex flex-col items-center gap-3 min-w-[80px] group"
                >
                  <div className="relative">
                    {/* Glow effect para posts activos */}
                    {friend.has_active_posts && (
                      <div className="absolute inset-0 bg-gradient-to-tr from-neon-pink via-purple-500 to-neon-blue rounded-full blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>
                    )}
                    
                    {/* Anillo de gradiente si tiene posts activos */}
                    {friend.has_active_posts ? (
                      <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-neon-pink via-purple-500 to-neon-blue p-[3px] shadow-xl group-hover:scale-110 transition-transform">
                        <div className="w-full h-full rounded-full bg-dark-primary p-[2px]">
                          {friend.avatar_url ? (
                            <img
                              src={friend.avatar_url}
                              alt={friend.username}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full rounded-full bg-gradient-to-br from-neon-pink/40 to-neon-blue/40 flex items-center justify-center text-white font-black text-2xl">
                              {friend.username.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="relative w-20 h-20 rounded-full border-2 border-white/10 p-[2px] group-hover:border-white/20 group-hover:scale-110 transition-all shadow-lg">
                        {friend.avatar_url ? (
                          <img
                            src={friend.avatar_url}
                            alt={friend.username}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full rounded-full bg-gradient-to-br from-dark-secondary to-dark-hover flex items-center justify-center text-text-secondary font-black text-2xl">
                            {friend.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <span className={`text-xs font-bold max-w-[80px] truncate transition-all ${
                    friend.has_active_posts 
                      ? 'text-neon-blue group-hover:text-neon-pink' 
                      : 'text-text-secondary/60 group-hover:text-text-secondary'
                  }`}>
                    {friend.username}
                  </span>
                </button>
              ))}
            </>
          )}

          {!loading && friends.length === 0 && (
            <div className="flex items-center justify-center py-4 px-8 text-text-secondary/60 text-sm italic">
              <p>Agrega amigos para ver sus historias</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
