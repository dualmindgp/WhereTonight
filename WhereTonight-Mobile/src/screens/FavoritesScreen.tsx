import React, { useState } from 'react';
import { View, StyleSheet, Text, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const MOCK_FAVORITES = [
  {
    id: '1',
    name: 'Bar Central',
    description: 'Bar moderno en el centro',
    rating: 4.5,
    category: 'bar',
  },
];

export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState(MOCK_FAVORITES);

  const removeFavorite = (id: string) => {
    setFavorites(favorites.filter((fav) => fav.id !== id));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>❤️ Mis Favoritos</Text>
      </View>

      {favorites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-outline" size={48} color="#ddd" />
          <Text style={styles.emptyText}>Aún no tienes favoritos guardados</Text>
          <Text style={styles.emptySubtext}>
            Guarda tus locales favoritos para acceder rápidamente
          </Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.favoriteCard}>
              <View style={styles.favoriteContent}>
                <Text style={styles.favoriteName}>{item.name}</Text>
                <Text style={styles.favoriteDesc}>{item.description}</Text>
                <View style={styles.favoriteFooter}>
                  <Text style={styles.favoriteRating}>⭐ {item.rating}</Text>
                  <Text style={styles.favoriteCategory}>{item.category}</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => removeFavorite(item.id)}
                style={styles.removeButton}
              >
                <Ionicons name="heart" size={24} color="#FF6B6B" />
              </TouchableOpacity>
            </View>
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
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  listContent: {
    padding: 15,
  },
  favoriteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#FFE0E0',
  },
  favoriteContent: {
    flex: 1,
  },
  favoriteName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5,
  },
  favoriteDesc: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  favoriteFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  favoriteRating: {
    fontSize: 12,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  favoriteCategory: {
    fontSize: 11,
    backgroundColor: '#FFE0E0',
    color: '#FF6B6B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  removeButton: {
    padding: 8,
  },
});
