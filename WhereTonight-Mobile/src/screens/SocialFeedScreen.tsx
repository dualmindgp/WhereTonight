import React, { useState, useEffect } from 'react'
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, TextInput, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Heart, MessageCircle, Trash2, Globe, Users as UsersIcon, Clock, MapPin } from 'lucide-react-native'
import { supabase } from '../lib/supabase'
import { SocialPostWithUser } from '../types/database.types'
import { useToastContext } from '../contexts/ToastContext'
import { useCityContext } from '../contexts/CityContext'
import CitySelector from '../components/CitySelector'

interface SocialFeedScreenProps {
  userId?: string
}

export default function SocialFeedScreen({ userId }: SocialFeedScreenProps) {
  const toast = useToastContext()
  const { selectedCity, setSelectedCity } = useCityContext()
  const [posts, setPosts] = useState<SocialPostWithUser[]>([])
  const [loading, setLoading] = useState(false)
  const [newPostContent, setNewPostContent] = useState('')
  const [posting, setPosting] = useState(false)
  const [audience, setAudience] = useState<'public' | 'friends_only'>('public')
  const [showCitySelector, setShowCitySelector] = useState(false)
  const [friendIds, setFriendIds] = useState<Set<string>>(new Set())

  // Cargar IDs de amigos
  useEffect(() => {
    if (userId) {
      loadFriendIds()
    }
  }, [userId])

  // Cargar posts cuando cambia la ciudad
  useEffect(() => {
    if (selectedCity) {
      loadPosts()
    } else {
      setPosts([])
    }
  }, [selectedCity, userId])

  const loadFriendIds = async () => {
    if (!userId) return

    try {
      const { data, error } = await supabase
        .from('friendships')
        .select('user_id, friend_id')
        .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
        .eq('status', 'accepted')

      if (error) throw error

      const ids = new Set<string>()
      data?.forEach((f) => {
        if (f.user_id === userId) {
          ids.add(f.friend_id)
        } else {
          ids.add(f.user_id)
        }
      })
      setFriendIds(ids)
    } catch (error) {
      console.error('Error loading friends:', error)
    }
  }

  const loadPosts = async () => {
    if (!selectedCity) return

    setLoading(true)
    try {
      // Calcular timestamp de hace 24 horas
      const twentyFourHoursAgo = new Date()
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24)
      const timestamp24h = twentyFourHoursAgo.toISOString()

      const { data, error } = await supabase
        .from('social_posts_with_user')
        .select('*')
        .eq('city', selectedCity.name)
        .gte('created_at', timestamp24h) // Solo posts de últimas 24h
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error

      // Filtrar posts según privacidad
      let filteredData = data || []
      if (userId) {
        filteredData = data?.filter((post) => {
          // Posts públicos: todos pueden ver
          if (post.audience === 'public') return true
          // Posts propios: siempre visibles
          if (post.user_id === userId) return true
          // Posts de amigos: solo si es amigo
          if (post.audience === 'friends_only' && friendIds.has(post.user_id)) return true
          return false
        }) || []
      } else {
        // Sin userId, solo mostrar públicos
        filteredData = data?.filter((post) => post.audience === 'public') || []
      }

      setPosts(filteredData)
    } catch (error) {
      console.error('Error loading posts:', error)
      toast.error('Error al cargar posts')
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePost = async () => {
    if (!newPostContent.trim() || !selectedCity || !userId) {
      toast.error('Completa todos los campos')
      return
    }

    setPosting(true)
    try {
      const { error } = await supabase
        .from('social_posts')
        .insert({
          user_id: userId,
          content: newPostContent,
          city: selectedCity.name,
          city_lat: selectedCity.lat,
          city_lng: selectedCity.lng,
          audience
        })

      if (error) throw error

      setNewPostContent('')
      setAudience('public')
      toast.success('Post publicado')
      await loadPosts()
    } catch (error) {
      console.error('Error creating post:', error)
      toast.error('Error al publicar')
    } finally {
      setPosting(false)
    }
  }

  const handleDeletePost = async (postId: string) => {
    if (!userId) return

    try {
      const { error } = await supabase
        .from('social_posts')
        .delete()
        .eq('id', postId)
        .eq('user_id', userId)

      if (error) throw error

      setPosts(posts.filter(p => p.id !== postId))
      toast.success('Post eliminado')
    } catch (error) {
      console.error('Error deleting post:', error)
      toast.error('Error al eliminar')
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

  return (
    <SafeAreaView className="flex-1 bg-dark-primary">
      <View className="sticky top-0 z-10 bg-gradient-to-r from-neon-pink/20 via-neon-blue/20 to-neon-pink/20 backdrop-blur-lg border-b border-neon-blue/30 p-6">
        <Text className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-pink to-neon-blue">
          Social
        </Text>
        <TouchableOpacity 
          onPress={() => setShowCitySelector(true)}
          className="flex-row items-center gap-2 mt-2"
        >
          <MapPin color="#00D9FF" size={16} />
          <Text className="text-text-secondary text-sm">
            {selectedCity ? selectedCity.name : 'Selecciona una ciudad'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* City Selector Modal */}
      <CitySelector
        visible={showCitySelector}
        onClose={() => setShowCitySelector(false)}
        onSelect={(city) => setSelectedCity(city)}
        selectedCity={selectedCity}
      />

      {selectedCity && userId && (
        <View className="px-4 pt-4 pb-4">
          <View className="bg-dark-card rounded-2xl p-4 border border-neon-pink/30">
            <TextInput
              value={newPostContent}
              onChangeText={setNewPostContent}
              placeholder="¿Qué está pasando?"
              placeholderTextColor="#999"
              maxLength={500}
              multiline
              className="w-full bg-dark-secondary text-text-light rounded-lg p-3 mb-3 min-h-[100px]"
            />
            <Text className="text-right text-xs text-text-secondary mb-3">
              {newPostContent.length}/500
            </Text>

            <View className="mb-3">
              <Text className="text-text-secondary text-sm mb-2">¿Quién puede ver esto?</Text>
              <View className="flex-row gap-2">
                <TouchableOpacity
                  onPress={() => setAudience('public')}
                  className={`flex-1 px-4 py-2 rounded-lg flex-row items-center justify-center gap-2 ${
                    audience === 'public' ? 'bg-neon-blue' : 'bg-dark-secondary'
                  }`}
                >
                  <Globe className="w-4 h-4" color={audience === 'public' ? 'white' : '#999'} />
                  <Text className={audience === 'public' ? 'text-white' : 'text-text-light'}>
                    Público
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setAudience('friends_only')}
                  className={`flex-1 px-4 py-2 rounded-lg flex-row items-center justify-center gap-2 ${
                    audience === 'friends_only' ? 'bg-neon-pink' : 'bg-dark-secondary'
                  }`}
                >
                  <UsersIcon className="w-4 h-4" color={audience === 'friends_only' ? 'white' : '#999'} />
                  <Text className={audience === 'friends_only' ? 'text-white' : 'text-text-light'}>
                    Amigos
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View className="flex-row justify-end gap-2">
              <TouchableOpacity
                onPress={() => setNewPostContent('')}
                className="px-4 py-2 rounded-lg bg-dark-secondary"
              >
                <Text className="text-text-light">Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCreatePost}
                disabled={!newPostContent.trim() || posting}
                className={`px-4 py-2 rounded-lg ${
                  posting || !newPostContent.trim() ? 'bg-neon-pink/50' : 'bg-neon-pink'
                }`}
              >
                <Text className="text-white font-bold">
                  {posting ? 'Publicando...' : 'Publicar'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#00D9FF" />
        </View>
      ) : posts.length === 0 ? (
        <View className="flex-1 justify-center items-center px-6">
          <MessageCircle className="w-16 h-16 text-text-secondary mb-4" />
          <Text className="text-xl font-bold text-text-light mb-2">
            {selectedCity ? 'Sin posts' : 'Selecciona una ciudad'}
          </Text>
          <Text className="text-text-secondary text-center">
            {selectedCity ? '¡Sé el primero en publicar!' : 'Elige una ciudad para ver posts'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View className="mx-4 my-2 bg-dark-card rounded-2xl p-4 border border-neon-blue/20">
              <View className="flex-row items-start gap-3 mb-3">
                {item.avatar_url ? (
                  <Image
                    source={{ uri: item.avatar_url }}
                    className="w-12 h-12 rounded-full"
                  />
                ) : (
                  <View className="w-12 h-12 rounded-full bg-gradient-to-br from-neon-pink to-neon-blue items-center justify-center">
                    <Text className="text-white font-bold">
                      {(item.username || 'U').charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
                <View className="flex-1">
                  <View className="flex-row items-center gap-2">
                    <Text className="font-bold text-neon-blue">
                      {item.username || 'Usuario'}
                    </Text>
                    {item.audience === 'friends_only' && (
                      <UsersIcon className="w-4 h-4 text-neon-pink" />
                    )}
                    {item.audience === 'public' && (
                      <Globe className="w-4 h-4 text-text-secondary" />
                    )}
                  </View>
                  <Text className="text-text-light mt-1">{item.content}</Text>
                  {item.image_url && (
                    <Image
                      source={{ uri: item.image_url }}
                      className="w-full h-48 rounded-lg mt-2"
                    />
                  )}
                  <View className="flex-row items-center justify-between mt-2">
                    <View className="flex-row items-center gap-1">
                      <Clock className="w-4 h-4 text-text-secondary" />
                      <Text className="text-text-secondary text-sm">
                        {formatTimestamp(item.created_at)}
                      </Text>
                    </View>
                    {userId === item.user_id && (
                      <TouchableOpacity onPress={() => handleDeletePost(item.id)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            </View>
          )}
          contentContainerStyle={{ paddingVertical: 16 }}
        />
      )}
    </SafeAreaView>
  )
}
