import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, TouchableOpacity, FlatList } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { useVenues } from '../contexts/VenueContext';
import { Ionicons } from '@expo/vector-icons';

export default function MapScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [loading, setLoading] = useState(true);
  const { venues, isLoading: venuesLoading } = useVenues();
  const [showVenuesList, setShowVenuesList] = useState(false);

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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
        <Text style={styles.loadingText}>Cargando mapa...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
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
        {venues
          .filter((venue) => {
            // Filtrar venues con coordenadas válidas
            const lat = typeof venue.lat === 'number' ? venue.lat : parseFloat(String(venue.lat || 0));
            const lng = typeof venue.lng === 'number' ? venue.lng : parseFloat(String(venue.lng || 0));
            return !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;
          })
          .map((venue) => {
            const latitude = typeof venue.lat === 'number' ? venue.lat : parseFloat(String(venue.lat || 0));
            const longitude = typeof venue.lng === 'number' ? venue.lng : parseFloat(String(venue.lng || 0));
            
            return (
              <Marker
                key={venue.id}
                coordinate={{
                  latitude,
                  longitude,
                }}
                title={venue.name}
                description={venue.address || ''}
              />
            );
          })}
      </MapView>

      {/* Botón para mostrar lista de venues */}
      <TouchableOpacity
        style={styles.listButton}
        onPress={() => setShowVenuesList(!showVenuesList)}
      >
        <Ionicons name="list" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Lista de venues */}
      {showVenuesList && (
        <View style={styles.venuesList}>
          <FlatList
            data={venues}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.venueItem}>
                <Text style={styles.venueName}>{item.name}</Text>
                <Text style={styles.venueDesc}>{item.address || 'Sin dirección'}</Text>
                {item.rating && (
                  <Text style={styles.venueRating}>⭐ {item.rating}</Text>
                )}
              </View>
            )}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  listButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#8B5CF6',
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
    backgroundColor: '#fff',
    maxHeight: 300,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  venueItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  venueName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5,
  },
  venueDesc: {
    fontSize: 13,
    color: '#666',
    marginBottom: 5,
  },
  venueRating: {
    fontSize: 12,
    color: '#8B5CF6',
    fontWeight: '600',
  },
});
