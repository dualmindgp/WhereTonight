import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, TouchableOpacity, FlatList, TextInput, Modal, ScrollView } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { useVenues } from '../contexts/VenueContext';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

interface FilterOptions {
  minRating: number;
  priceRange: string[];
  sortBy: 'popularity' | 'rating' | 'distance';
}

export default function MapScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [loading, setLoading] = useState(true);
  const { venues, isLoading: venuesLoading } = useVenues();
  const [showVenuesList, setShowVenuesList] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({
    minRating: 0,
    priceRange: [],
    sortBy: 'popularity'
  });
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        setLoading(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      setLoading(false);
    })();
  }, []);

  const filteredVenues = venues.filter(venue => {
    // Filtrar por búsqueda
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      if (!venue.name.toLowerCase().includes(query) && 
          !venue.type?.toLowerCase().includes(query)) {
        return false;
      }
    }

    // Filtrar por rating
    if (filters.minRating > 0 && (!venue.rating || venue.rating < filters.minRating)) {
      return false;
    }

    return true;
  }).sort((a, b) => {
    if (filters.sortBy === 'rating') {
      return (b.rating || 0) - (a.rating || 0);
    } else if (filters.sortBy === 'popularity') {
      return (b.count_today || 0) - (a.count_today || 0);
    }
    return 0;
  });

  const handleCenterOnVenue = (venue: any) => {
    mapRef.current?.animateToRegion({
      latitude: venue.lat,
      longitude: venue.lng,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    }, 500);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00D9FF" />
        <Text style={styles.loadingText}>Cargando mapa...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: location?.coords.latitude || 40.4168,
          longitude: location?.coords.longitude || -3.7038,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        showsUserLocation={true}
        showsMyLocationButton={true}
      >
        {filteredVenues.map((venue) => (
          <Marker
            key={venue.id}
            coordinate={{
              latitude: venue.lat,
              longitude: venue.lng,
            }}
            title={venue.name}
            description={venue.type}
            pinColor={venue.rating && venue.rating >= 4.5 ? '#00D9FF' : '#FF1493'}
          />
        ))}
      </MapView>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color="#00D9FF" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar locales..."
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Button */}
      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => setShowFilters(true)}
      >
        <Ionicons name="options" size={24} color="#fff" />
      </TouchableOpacity>

      {/* List Button */}
      <TouchableOpacity
        style={styles.listButton}
        onPress={() => setShowVenuesList(!showVenuesList)}
      >
        <Ionicons name="list" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Venues List */}
      {showVenuesList && (
        <View style={styles.venuesList}>
          <View style={styles.venuesListHeader}>
            <Text style={styles.venuesListTitle}>{filteredVenues.length} locales</Text>
            <TouchableOpacity onPress={() => setShowVenuesList(false)}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={filteredVenues}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.venueItem}
                onPress={() => handleCenterOnVenue(item)}
              >
                <View style={styles.venueItemContent}>
                  <Text style={styles.venueName}>{item.name}</Text>
                  <View style={styles.venueMetaRow}>
                    {item.rating && (
                      <Text style={styles.venueRating}>⭐ {item.rating.toFixed(1)}</Text>
                    )}
                    {item.count_today && (
                      <Text style={styles.venueCount}>👥 {item.count_today}</Text>
                    )}
                    {item.type && (
                      <Text style={styles.venueType}>{item.type}</Text>
                    )}
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#00D9FF" />
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* Filters Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        transparent={true}
      >
        <SafeAreaView style={styles.filterModal}>
          <View style={styles.filterHeader}>
            <Text style={styles.filterTitle}>Filtros</Text>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.filterContent}>
            {/* Rating Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Rating mínimo</Text>
              <View style={styles.ratingOptions}>
                {[0, 3, 3.5, 4, 4.5].map((rating) => (
                  <TouchableOpacity
                    key={rating}
                    style={[
                      styles.ratingButton,
                      filters.minRating === rating && styles.ratingButtonActive
                    ]}
                    onPress={() => setFilters({ ...filters, minRating: rating })}
                  >
                    <Text style={[
                      styles.ratingButtonText,
                      filters.minRating === rating && styles.ratingButtonTextActive
                    ]}>
                      {rating === 0 ? 'Todos' : `${rating}+`}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Sort By */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Ordenar por</Text>
              <View style={styles.sortOptions}>
                {(['popularity', 'rating', 'distance'] as const).map((sort) => (
                  <TouchableOpacity
                    key={sort}
                    style={[
                      styles.sortButton,
                      filters.sortBy === sort && styles.sortButtonActive
                    ]}
                    onPress={() => setFilters({ ...filters, sortBy: sort })}
                  >
                    <Text style={[
                      styles.sortButtonText,
                      filters.sortBy === sort && styles.sortButtonTextActive
                    ]}>
                      {sort === 'popularity' ? 'Popularidad' : sort === 'rating' ? 'Rating' : 'Distancia'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          <TouchableOpacity
            style={styles.applyButton}
            onPress={() => setShowFilters(false)}
          >
            <Text style={styles.applyButtonText}>Aplicar filtros</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#00D9FF',
  },
  searchBar: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#00D9FF30',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
    paddingVertical: 4,
  },
  filterButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#00D9FF20',
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#00D9FF40',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  listButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#FF1493',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  venuesList: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1a1a2e',
    maxHeight: '60%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderTopColor: '#00D9FF30',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  venuesListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#00D9FF20',
  },
  venuesListTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  venueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#00D9FF10',
  },
  venueItemContent: {
    flex: 1,
  },
  venueName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 6,
  },
  venueMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  venueRating: {
    fontSize: 12,
    color: '#FFD700',
    fontWeight: '600',
  },
  venueCount: {
    fontSize: 12,
    color: '#00D9FF',
    fontWeight: '600',
  },
  venueType: {
    fontSize: 11,
    color: '#888',
    backgroundColor: '#00D9FF10',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  filterModal: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#00D9FF20',
  },
  filterTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  filterContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00D9FF',
    marginBottom: 12,
  },
  ratingOptions: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  ratingButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00D9FF30',
    backgroundColor: 'transparent',
  },
  ratingButtonActive: {
    backgroundColor: '#00D9FF20',
    borderColor: '#00D9FF',
  },
  ratingButtonText: {
    fontSize: 12,
    color: '#888',
    fontWeight: '600',
  },
  ratingButtonTextActive: {
    color: '#00D9FF',
  },
  sortOptions: {
    gap: 8,
  },
  sortButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00D9FF30',
    backgroundColor: 'transparent',
  },
  sortButtonActive: {
    backgroundColor: '#00D9FF20',
    borderColor: '#00D9FF',
  },
  sortButtonText: {
    fontSize: 13,
    color: '#888',
    fontWeight: '600',
  },
  sortButtonTextActive: {
    color: '#00D9FF',
  },
  applyButton: {
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 14,
    backgroundColor: '#00D9FF',
    borderRadius: 12,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
});
