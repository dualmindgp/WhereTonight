import React, { useState, useEffect } from 'react'
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Users, ChevronLeft, Search, Bell, UserPlus, Trash2 } from 'lucide-react-native'
import { supabase } from '../lib/supabase'
import { useToastContext } from '../contexts/ToastContext'

interface Friend {
  id: string
  username: string | null
  avatar_url: string | null
}

interface FriendsScreenProps {
  userId: string
  onBack: () => void
  onFriendClick?: (friendId: string) => void
}

export default function FriendsScreen({ userId, onBack, onFriendClick }: FriendsScreenProps) {
  const toast = useToastContext()
  const [friends, setFriends] = useState<Friend[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [searchResults, setSearchResults] = useState<Friend[]>([])
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    loadFriends()
    loadPendingCount()
  }, [userId])

  useEffect(() => {
    if (searchQuery.trim()) {
      searchUsers()
    } else {
      setSearchResults([])
    }
  }, [searchQuery])

  const loadFriends = async () => {
    try {
      setLoading(true)
      const { data: friendships, error: friendError } = await supabase
        .from('friendships')
        .select('user_id, friend_id')
        .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
        .eq('status', 'accepted')

      if (friendError) throw friendError

      if (!friendships || friendships.length === 0) {
        setFriends([])
        return
      }

      const friendIds = friendships.map(f =>
        f.user_id === userId ? f.friend_id : f.user_id
      )

      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', friendIds)

      if (profileError) throw profileError
      setFriends(profiles || [])
    } catch (error) {
      console.error('Error loading friends:', error)
      toast.error('Error al cargar amigos')
    } finally {
      setLoading(false)
    }
  }

  const loadPendingCount = async () => {
    try {
      const { count, error } = await supabase
        .from('friendships')
        .select('*', { count: 'exact', head: true })
        .eq('friend_id', userId)
        .eq('status', 'pending')

      if (error) throw error
      setPendingCount(count || 0)
    } catch (error) {
      console.error('Error loading pending count:', error)
    }
  }

  const searchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .ilike('username', `%${searchQuery}%`)
        .limit(10)

      if (error) throw error
      setSearchResults(data || [])
    } catch (error) {
      console.error('Error searching users:', error)
    }
  }

  const sendFriendRequest = async (friendId: string) => {
    try {
      const { error } = await supabase
        .from('friendships')
        .insert({
          user_id: userId,
          friend_id: friendId,
          status: 'pending'
        })

      if (error) throw error
      toast.success('Solicitud enviada')
      setSearchQuery('')
      setSearchResults([])
    } catch (error) {
      console.error('Error sending request:', error)
      toast.error('Error al enviar solicitud')
    }
  }

  const removeFriend = async (friendId: string) => {
    try {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .or(`and(user_id.eq.${userId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${userId})`)
        .eq('status', 'accepted')

      if (error) throw error
      setFriends(friends.filter(f => f.id !== friendId))
      toast.success('Amigo eliminado')
    } catch (error) {
      console.error('Error removing friend:', error)
      toast.error('Error al eliminar amigo')
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-dark-primary">
      <View className="flex-row items-center justify-between px-4 py-4 bg-dark-card border-b border-neon-blue/20">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={onBack} className="p-2">
            <ChevronLeft className="w-6 h-6 text-text-light" />
          </TouchableOpacity>
          <Users className="w-6 h-6 text-neon-cyan" />
          <Text className="text-xl font-bold text-white">Amigos</Text>
        </View>
        <View className="flex-row gap-2">
          <TouchableOpacity onPress={() => setShowSearch(!showSearch)} className="p-2">
            <Search className="w-6 h-6 text-neon-cyan" />
          </TouchableOpacity>
          {pendingCount > 0 && (
            <View className="relative">
              <Bell className="w-6 h-6 text-neon-pink" />
              <View className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 items-center justify-center">
                <Text className="text-white text-xs font-bold">
                  {pendingCount > 9 ? '9+' : pendingCount}
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>

      {showSearch && (
        <View className="px-4 py-3 bg-dark-card border-b border-neon-blue/20">
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Buscar usuarios..."
            placeholderTextColor="#999"
            className="w-full px-4 py-2 bg-dark-secondary text-text-light rounded-lg border border-neon-blue/30"
          />
        </View>
      )}

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#00D9FF" />
        </View>
      ) : searchResults.length > 0 ? (
        <FlatList
          data={searchResults}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View className="mx-4 my-2 bg-dark-card rounded-2xl p-4 border border-neon-cyan/20 flex-row items-center justify-between">
              <TouchableOpacity
                onPress={() => onFriendClick?.(item.id)}
                className="flex-1 flex-row items-center gap-3"
              >
                <View className="w-12 h-12 rounded-full bg-gradient-to-br from-neon-cyan to-neon-blue items-center justify-center">
                  <Text className="text-white font-bold">
                    {(item.username || 'U').charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View>
                  <Text className="text-lg font-bold text-white">
                    {item.username || 'Usuario'}
                  </Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => sendFriendRequest(item.id)}
                className="p-2"
              >
                <UserPlus className="w-6 h-6 text-neon-cyan" />
              </TouchableOpacity>
            </View>
          )}
          contentContainerStyle={{ paddingVertical: 16 }}
        />
      ) : friends.length === 0 ? (
        <View className="flex-1 justify-center items-center px-6">
          <UserPlus className="w-16 h-16 text-text-secondary mb-4" />
          <Text className="text-xl font-bold text-text-light mb-2">Sin amigos</Text>
          <Text className="text-text-secondary text-center">
            Invita a tus amigos para conectar y ver dónde van esta noche
          </Text>
        </View>
      ) : (
        <FlatList
          data={friends}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View className="mx-4 my-2 bg-dark-card rounded-2xl p-4 border border-neon-cyan/20 flex-row items-center justify-between">
              <TouchableOpacity
                onPress={() => onFriendClick?.(item.id)}
                className="flex-1 flex-row items-center gap-3"
              >
                {item.avatar_url ? (
                  <View className="w-12 h-12 rounded-full bg-gray-300" />
                ) : (
                  <View className="w-12 h-12 rounded-full bg-gradient-to-br from-neon-cyan to-neon-blue items-center justify-center">
                    <Text className="text-white font-bold">
                      {(item.username || 'U').charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
                <View>
                  <Text className="text-lg font-bold text-white">
                    {item.username || 'Usuario'}
                  </Text>
                  <Text className="text-text-secondary text-sm">Amigo</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => removeFriend(item.id)}
                className="p-2"
              >
                <Trash2 className="w-6 h-6 text-red-500" />
              </TouchableOpacity>
            </View>
          )}
          contentContainerStyle={{ paddingVertical: 16 }}
        />
      )}
    </SafeAreaView>
  )
}
