import React, { useState, useMemo } from 'react';
import { View, StyleSheet, TextInput, FlatList, Text, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useVenues } from '../contexts/VenueContext';
import { VenueWithCount } from '../types/database.types';
import { Ionicons } from '@expo/vector-icons';

interface FilterOptions {
  priceRange: string[];
  minRating: number;
  sortBy: 'popularity' | 'rating' | 'price';
  venueType?: string;
}

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({
    priceRange: [],
    minRating: 0,
    sortBy: 'popularity'
  });
  const [showFilters, setShowFilters] = useState(false);
  const { venues } = useVenues();

  const filteredVenues = useMemo(() => {
    let result = venues as VenueWithCount[];

    // Filtrar por búsqueda
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (venue) =>
          venue.name.toLowerCase().includes(query) ||
          venue.type?.toLowerCase().includes(query) ||
          venue.address?.toLowerCase().includes(query)
      );
    }

    // Filtrar por tipo de venue
    if (filters.venueType) {
      result = result.filter(v => v.type === filters.venueType);
    }

    // Filtrar por precio
    if (filters.priceRange.length > 0) {
      result = result.filter(v => {
        if (!v.price_level) return false;
        return filters.priceRange.some(price => v.price_level?.toString() === price);
      });
    }

    // Filtrar por rating
    if (filters.minRating > 0) {
      result = result.filter(v => (v.rating || 0) >= filters.minRating);
    }

    // Ordenar
    if (filters.sortBy === 'popularity') {
      result.sort((a, b) => (b.count_today || 0) - (a.count_today || 0));
    } else if (filters.sortBy === 'rating') {
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (filters.sortBy === 'price') {
      result.sort((a, b) => (a.price_level || 0) - (b.price_level || 0));
    }

    return result;
  }, [searchQuery, venues, filters]);

  const venueTypes = ['bar', 'club', 'restaurant', 'lounge'];

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Header */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Ionicons name="search" size={20} color="#00D9FF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar locales..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#666"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity 
          style={styles.filterBtn}
          onPress={() => setShowFilters(true)}
        >
          <Ionicons name="options" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Active Filters Display */}
      {(filters.minRating > 0 || filters.priceRange.length > 0 || filters.venueType) && (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.activeFiltersContainer}
          contentContainerStyle={styles.activeFiltersContent}
        >
          {filters.minRating > 0 && (
            <View style={styles.filterTag}>
              <Text style={styles.filterTagText}>⭐ {filters.minRating}+</Text>
              <TouchableOpacity onPress={() => setFilters({ ...filters, minRating: 0 })}>
                <Ionicons name="close" size={14} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
          {filters.venueType && (
            <View style={styles.filterTag}>
              <Text style={styles.filterTagText}>{filters.venueType}</Text>
              <TouchableOpacity onPress={() => setFilters({ ...filters, venueType: undefined })}>
                <Ionicons name="close" size={14} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
          {filters.priceRange.length > 0 && (
            <View style={styles.filterTag}>
              <Text style={styles.filterTagText}>💰 {filters.priceRange.join(',')}</Text>
              <TouchableOpacity onPress={() => setFilters({ ...filters, priceRange: [] })}>
                <Ionicons name="close" size={14} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      )}

      {/* Content */}
      {searchQuery.trim() === '' && !filters.minRating && !filters.venueType ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="search" size={64} color="#00D9FF30" />
          <Text style={styles.emptyTitle}>Busca locales</Text>
          <Text style={styles.emptyText}>Escribe el nombre de un bar, club o restaurante</Text>
        </View>
      ) : filteredVenues.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle" size={64} color="#FF1493" />
          <Text style={styles.emptyTitle}>Sin resultados</Text>
          <Text style={styles.emptyText}>Intenta con otros términos de búsqueda</Text>
        </View>
      ) : (
        <FlatList
          data={filteredVenues}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.venueCard}>
              <View style={styles.venueCardLeft}>
                {item.photo_ref ? (
                  <View style={styles.venueImage}>
                    <Text style={styles.venueImagePlaceholder}>📸</Text>
                  </View>
                ) : (
                  <View style={[styles.venueImage, { backgroundColor: '#00D9FF20' }]}>
                    <Text style={styles.venueImagePlaceholder}>🏢</Text>
                  </View>
                )}
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
              <Ionicons name="chevron-forward" size={20} color="#00D9FF" />
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.listContent}
        />
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

            {/* Venue Type Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Tipo de local</Text>
              <View style={styles.typeOptions}>
                {venueTypes.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeButton,
                      filters.venueType === type && styles.typeButtonActive
                    ]}
                    onPress={() => setFilters({ 
                      ...filters, 
                      venueType: filters.venueType === type ? undefined : type 
                    })}
                  >
                    <Text style={[
                      styles.typeButtonText,
                      filters.venueType === type && styles.typeButtonTextActive
                    ]}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Sort By */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Ordenar por</Text>
              <View style={styles.sortOptions}>
                {(['popularity', 'rating', 'price'] as const).map((sort) => (
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
                      {sort === 'popularity' ? 'Popularidad' : sort === 'rating' ? 'Rating' : 'Precio'}
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
            <Text style={styles.applyButtonText}>Aplicar ({filteredVenues.length})</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#00D9FF20',
    gap: 8,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#00D9FF30',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 14,
    color: '#fff',
  },
  filterBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#00D9FF20',
    borderWidth: 1,
    borderColor: '#00D9FF40',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeFiltersContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#00D9FF10',
  },
  activeFiltersContent: {
    gap: 8,
    paddingRight: 16,
  },
  filterTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00D9FF20',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#00D9FF40',
    gap: 6,
  },
  filterTagText: {
    fontSize: 12,
    color: '#00D9FF',
    fontWeight: '600',
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
    borderColor: '#00D9FF20',
    gap: 12,
  },
  venueCardLeft: {
    width: 80,
    height: 80,
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
    fontSize: 32,
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
    marginBottom: 6,
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
  typeOptions: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  typeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF1493',
    backgroundColor: 'transparent',
  },
  typeButtonActive: {
    backgroundColor: '#FF149320',
    borderColor: '#FF1493',
  },
  typeButtonText: {
    fontSize: 12,
    color: '#888',
    fontWeight: '600',
  },
  typeButtonTextActive: {
    color: '#FF1493',
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
