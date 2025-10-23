import React, { useState, useEffect } from 'react'
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Heart, ChevronLeft } from 'lucide-react-native'
import { supabase } from '../lib/supabase'
import { VenueWithCount } from '../types/database.types'
import { useToastContext } from '../contexts/ToastContext'

interface FavoritesScreenProps {
  userId: string
  onBack: () => void
  onVenueClick?: (venue: VenueWithCount) => void
}

export default function FavoritesScreen({ userId, onBack, onVenueClick }: FavoritesScreenProps) {
  const toast = useToastContext()
  const [favorites, setFavorites] = useState<VenueWithCount[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFavorites()
  }, [userId])

  const loadFavorites = async () => {
    try {
      setLoading(true)
      const { data: favoriteIds, error: favError } = await supabase
        .from('favorites')
        .select('venue_id')
        .eq('user_id', userId)

      if (favError) throw favError

      if (!favoriteIds || favoriteIds.length === 0) {
        setFavorites([])
        return
      }

      const venueIds = favoriteIds.map(f => f.venue_id)

      const { data: venues, error: venueError } = await supabase
        .from('venues')
        .select('*')
        .in('id', venueIds)

      if (venueError) throw venueError

      const { data: ticketsData } = await supabase
        .rpc('tickets_count_today_euwarsaw')

      const countMap = new Map(
        (ticketsData || []).map((t: any) => [t.venue_id, t.count_today])
      )

      const venuesWithCount = (venues || []).map(venue => ({
        ...venue,
        count_today: countMap.get(venue.id) || 0
      }))

      setFavorites(venuesWithCount)
    } catch (error) {
      console.error('Error loading favorites:', error)
      toast.error('Error al cargar favoritos')
    } finally {
      setLoading(false)
    }
  }

  const removeFavorite = async (venueId: string) => {
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('venue_id', venueId)

      if (error) throw error

      setFavorites(favorites.filter(v => v.id !== venueId))
      toast.success('Eliminado de favoritos')
    } catch (error) {
      console.error('Error removing favorite:', error)
      toast.error('Error al eliminar favorito')
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-dark-primary">
      <View className="flex-row items-center gap-3 px-4 py-4 bg-dark-card border-b border-neon-blue/20">
        <TouchableOpacity onPress={onBack} className="p-2">
          <ChevronLeft className="w-6 h-6 text-text-light" />
        </TouchableOpacity>
        <Heart className="w-6 h-6 text-neon-pink" />
        <Text className="text-xl font-bold text-white">Mis Favoritos</Text>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#00D9FF" />
        </View>
      ) : favorites.length === 0 ? (
        <View className="flex-1 justify-center items-center px-6">
          <Heart className="w-16 h-16 text-text-secondary mb-4" />
          <Text className="text-xl font-bold text-text-light mb-2">Sin favoritos</Text>
          <Text className="text-text-secondary text-center">
            Guarda tus locales favoritos para acceder rápidamente
          </Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => onVenueClick?.(item)}
              className="mx-4 my-2 bg-dark-card rounded-2xl p-4 border border-neon-pink/20 flex-row items-center gap-4"
            >
              <View className="flex-1">
                <Text className="text-lg font-bold text-white">{item.name}</Text>
                <Text className="text-text-secondary text-sm">{item.address}</Text>
                <View className="flex-row gap-2 mt-2">
                  {item.rating && (
                    <Text className="text-neon-blue text-xs">⭐ {item.rating}</Text>
                  )}
                  {item.count_today > 0 && (
                    <Text className="text-neon-cyan text-xs">👥 {item.count_today} hoy</Text>
                  )}
                </View>
              </View>
              <TouchableOpacity
                onPress={() => removeFavorite(item.id)}
                className="p-2"
              >
                <Heart className="w-6 h-6 text-neon-pink fill-neon-pink" />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingVertical: 16 }}
        />
      )}
    </SafeAreaView>
  )
}
