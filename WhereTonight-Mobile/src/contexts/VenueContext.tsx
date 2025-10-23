import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Venue {
  id: string;
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  address?: string;
  image_url?: string;
  rating?: number;
  category?: string;
}

interface VenueContextType {
  venues: Venue[];
  setVenues: (venues: Venue[]) => void;
  loadVenues: () => Promise<void>;
  isLoading: boolean;
  selectedVenue: Venue | null;
  setSelectedVenue: (venue: Venue | null) => void;
}

const VenueContext = createContext<VenueContextType | undefined>(undefined);

export function VenueProvider({ children }: { children: ReactNode }) {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);

  const loadVenues = async () => {
    if (isLoading) return;

    try {
      setIsLoading(true);
      // Aquí irá la lógica para cargar venues desde Supabase
      // Por ahora, datos de ejemplo
      const mockVenues: Venue[] = [
        {
          id: '1',
          name: 'Bar Central',
          description: 'Bar moderno en el centro',
          latitude: 40.4168,
          longitude: -3.7038,
          address: 'Calle Principal 123',
          rating: 4.5,
          category: 'bar',
        },
        {
          id: '2',
          name: 'Discoteca Noche',
          description: 'Discoteca con música en vivo',
          latitude: 40.4200,
          longitude: -3.7000,
          address: 'Avenida del Paseo 456',
          rating: 4.2,
          category: 'nightclub',
        },
      ];
      setVenues(mockVenues);
    } catch (error) {
      console.error('Error loading venues:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadVenues();
  }, []);

  return (
    <VenueContext.Provider
      value={{
        venues,
        setVenues,
        loadVenues,
        isLoading,
        selectedVenue,
        setSelectedVenue,
      }}
    >
      {children}
    </VenueContext.Provider>
  );
}

export function useVenues() {
  const context = useContext(VenueContext);
  if (context === undefined) {
    throw new Error('useVenues must be used within a VenueProvider');
  }
  return context;
}
