import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, ActivityIndicator, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { VenueWithCount } from '../types/database.types';
import { supabase } from '../lib/supabase';

interface VenueDetailScreenProps {
  venue: VenueWithCount;
  onClose: () => void;
  onAddFavorite?: (venueId: string) => void;
  onRemoveFavorite?: (venueId: string) => void;
  isFavorite?: boolean;
}

export default function VenueDetailScreen({
  venue,
  onClose,
  onAddFavorite,
  onRemoveFavorite,
  isFavorite = false
}: VenueDetailScreenProps) {
  const [loading, setLoading] = useState(false);
  const [userCount, setUserCount] = useState(0);

  useEffect(() => {
    loadVenueStats();
  }, [venue.id]);

  const loadVenueStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { count } = await supabase
        .from('tickets')
        .select('*', { count: 'exact', head: true })
        .eq('venue_id', venue.id)
        .eq('local_date', today);
      
      setUserCount(count || 0);
    } catch (error) {
      console.error('Error loading venue stats:', error);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Mira este local: ${venue.name}\n${venue.address || ''}`,
        title: venue.name,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleFavoriteToggle = () => {
    if (isFavorite) {
      onRemoveFavorite?.(venue.id);
    } else {
      onAddFavorite?.(venue.id);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={28} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            onPress={handleFavoriteToggle}
            style={[styles.actionButton, isFavorite && styles.actionButtonActive]}
          >
            <Ionicons 
              name={isFavorite ? "heart" : "heart-outline"} 
              size={24} 
              color={isFavorite ? "#FF1493" : "#fff"} 
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleShare} style={styles.actionButton}>
            <Ionicons name="share-social" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View style={styles.heroImage}>
          <Text style={styles.heroImagePlaceholder}>📸</Text>
        </View>

        {/* Title and Rating */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>{venue.name}</Text>
          <View style={styles.ratingRow}>
            {venue.rating && (
              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={16} color="#FFD700" />
                <Text style={styles.ratingText}>{venue.rating.toFixed(1)}</Text>
              </View>
            )}
            {venue.type && (
              <View style={styles.typeBadge}>
                <Text style={styles.typeText}>{venue.type.toUpperCase()}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="people" size={24} color="#00D9FF" />
            <Text style={styles.statValue}>{userCount}</Text>
            <Text style={styles.statLabel}>Hoy</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="location" size={24} color="#FF1493" />
            <Text style={styles.statValue}>-</Text>
            <Text style={styles.statLabel}>Distancia</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="pricetag" size={24} color="#FFD700" />
            <Text style={styles.statValue}>{venue.price_level || '-'}</Text>
            <Text style={styles.statLabel}>Precio</Text>
          </View>
        </View>

        {/* Address */}
        {venue.address && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ubicación</Text>
            <View style={styles.addressCard}>
              <Ionicons name="location-outline" size={20} color="#00D9FF" />
              <Text style={styles.addressText}>{venue.address}</Text>
            </View>
          </View>
        )}

        {/* Phone */}
        {venue.phone && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contacto</Text>
            <TouchableOpacity style={styles.contactCard}>
              <Ionicons name="call-outline" size={20} color="#00D9FF" />
              <Text style={styles.contactText}>{venue.phone}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Website */}
        {venue.website && (
          <View style={styles.section}>
            <TouchableOpacity style={styles.contactCard}>
              <Ionicons name="globe-outline" size={20} color="#00D9FF" />
              <Text style={styles.contactText} numberOfLines={1}>{venue.website}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Hours */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Horario</Text>
          <View style={styles.hoursCard}>
            <Text style={styles.hoursText}>Abierto ahora</Text>
            <Text style={styles.hoursSubtext}>Cierra a las 02:00</Text>
          </View>
        </View>

        {/* Description */}
        {venue.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Descripción</Text>
            <Text style={styles.descriptionText}>{venue.description}</Text>
          </View>
        )}

        {/* Amenities */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Servicios</Text>
          <View style={styles.amenitiesGrid}>
            {['WiFi', 'Parking', 'Terraza', 'Música en vivo'].map((amenity, index) => (
              <View key={index} style={styles.amenityTag}>
                <Text style={styles.amenityText}>{amenity}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Action Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.primaryButton}>
          <Ionicons name="checkmark-circle" size={20} color="#000" />
          <Text style={styles.primaryButtonText}>Registrar visita</Text>
        </TouchableOpacity>
      </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#00D9FF20',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#00D9FF10',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#00D9FF10',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonActive: {
    backgroundColor: '#FF149320',
  },
  content: {
    flex: 1,
  },
  heroImage: {
    width: '100%',
    height: 240,
    backgroundColor: '#FF1493',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroImagePlaceholder: {
    fontSize: 80,
  },
  titleSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#00D9FF10',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD70020',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  ratingText: {
    color: '#FFD700',
    fontWeight: '600',
    fontSize: 14,
  },
  typeBadge: {
    backgroundColor: '#00D9FF20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  typeText: {
    color: '#00D9FF',
    fontWeight: '600',
    fontSize: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#00D9FF20',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 11,
    color: '#888',
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#00D9FF',
    marginBottom: 12,
  },
  addressCard: {
    flexDirection: 'row',
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#00D9FF20',
    gap: 12,
    alignItems: 'flex-start',
  },
  addressText: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
  },
  contactCard: {
    flexDirection: 'row',
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#00D9FF20',
    gap: 12,
    alignItems: 'center',
  },
  contactText: {
    flex: 1,
    color: '#00D9FF',
    fontSize: 14,
    fontWeight: '600',
  },
  hoursCard: {
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#00D9FF20',
  },
  hoursText: {
    color: '#00D9FF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  hoursSubtext: {
    color: '#888',
    fontSize: 12,
  },
  descriptionText: {
    color: '#ccc',
    fontSize: 14,
    lineHeight: 20,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  amenityTag: {
    backgroundColor: '#00D9FF10',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00D9FF30',
  },
  amenityText: {
    color: '#00D9FF',
    fontSize: 12,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#00D9FF20',
  },
  primaryButton: {
    backgroundColor: '#00D9FF',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  primaryButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
  },
});
