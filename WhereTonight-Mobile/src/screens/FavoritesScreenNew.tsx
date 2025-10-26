import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { VenueWithCount } from '../types/database.types';
import { useToastContext } from '../contexts/ToastContext';

interface FavoritesScreenNewProps {
  userId: string;
  onVenuePress?: (venue: VenueWithCount) => void;
  onClose?: () => void;
}

export default function FavoritesScreenNew({
  userId,
  onVenuePress,
  onClose
}: FavoritesScreenNewProps) {
  const toast = useToastContext();
  const [favorites, setFavorites] = useState<VenueWithCount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, [userId]);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      
      // Obtener favoritos del usuario
      const { data: favData, error: favError } = await supabase
        .from('favorites')
        .select('venue_id')
        .eq('user_id', userId);

      if (favError) throw favError;

      if (!favData || favData.length === 0) {
        setFavorites([]);
        return;
      }

      const venueIds = favData.map(f => f.venue_id);

      // Obtener información de venues
      const { data: venuesData, error: venuesError } = await supabase
        .from('venues')
        .select('*')
        .in('id', venueIds)
        .eq('is_active', true);

      if (venuesError) throw venuesError;

      // Obtener conteos de hoy
      const { data: ticketsData } = await supabase
        .rpc('tickets_count_today_euwarsaw');

      const countMap = new Map(
        (ticketsData || []).map((t: any) => [t.venue_id, t.count_today])
      );

      const venuesWithCount: VenueWithCount[] = (venuesData || []).map(venue => ({
        ...venue,
        count_today: countMap.get(venue.id) || 0
      }));

      setFavorites(venuesWithCount);
    } catch (error) {
      console.error('Error loading favorites:', error);
      toast.error('Error al cargar favoritos');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (venueId: string) => {
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('venue_id', venueId);

      if (error) throw error;

      setFavorites(prev => prev.filter(v => v.id !== venueId));
      toast.success('Favorito eliminado');
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast.error('Error al eliminar favorito');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00D9FF" />
          <Text style={styles.loadingText}>Cargando favoritos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color="#fff" />
          </TouchableOpacity>
        )}
        <View style={styles.headerTitle}>
          <Ionicons name="heart" size={24} color="#FF1493" />
          <Text style={styles.title}>Favoritos</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{favorites.length}</Text>
        </View>
      </View>

      {favorites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-outline" size={64} color="#00D9FF30" />
          <Text style={styles.emptyTitle}>Sin favoritos</Text>
          <Text style={styles.emptyText}>Guarda tus locales favoritos para acceder rápidamente</Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.venueCard}
              onPress={() => onVenuePress?.(item)}
            >
              <View style={styles.venueCardLeft}>
                <View style={styles.venueImage}>
                  <Text style={styles.venueImagePlaceholder}>📍</Text>
                </View>
              </View>

              <View style={styles.venueContent}>
                <Text style={styles.venueName} numberOfLines={1}>{item.name}</Text>
                <View style={styles.venueMetaRow}>
                  {item.rating && (
                    <Text style={styles.venueRating}>⭐ {item.rating.toFixed(1)}</Text>
                  )}
                  {item.type && (
                    <Text style={styles.venueType}>{item.type}</Text>
                  )}
                </View>
                {item.address && (
                  <Text style={styles.venueAddress} numberOfLines={1}>{item.address}</Text>
                )}
                {item.count_today && (
                  <Text style={styles.venueCount}>👥 {item.count_today} hoy</Text>
                )}
              </View>

              <TouchableOpacity 
                style={styles.removeButton}
                onPress={() => handleRemoveFavorite(item.id)}
              >
                <Ionicons name="close" size={20} color="#FF1493" />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#00D9FF20',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#00D9FF10',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  badge: {
    backgroundColor: '#FF1493',
    borderRadius: 12,
    minWidth: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#888',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  listContent: {
    padding: 12,
  },
  venueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#FF149330',
    gap: 12,
  },
  venueCardLeft: {
    width: 70,
    height: 70,
  },
  venueImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#FF1493',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  venueImagePlaceholder: {
    fontSize: 28,
  },
  venueContent: {
    flex: 1,
  },
  venueName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 6,
  },
  venueMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  venueRating: {
    fontSize: 12,
    color: '#FFD700',
    fontWeight: '600',
  },
  venueType: {
    fontSize: 11,
    color: '#00D9FF',
    backgroundColor: '#00D9FF10',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    fontWeight: '600',
  },
  venueAddress: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  venueCount: {
    fontSize: 12,
    color: '#00D9FF',
    fontWeight: '600',
  },
  removeButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#FF149310',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
