import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { VenueWithCount, Venue } from '../types/database.types';
import { supabase } from '../lib/supabase';

interface VenueContextType {
  venues: VenueWithCount[];
  setVenues: (venues: VenueWithCount[]) => void;
  loadVenues: () => Promise<void>;
  isLoading: boolean;
  selectedVenue: VenueWithCount | null;
  setSelectedVenue: (venue: VenueWithCount | null) => void;
}

const VenueContext = createContext<VenueContextType | undefined>(undefined);

export function VenueProvider({ children }: { children: ReactNode }) {
  const [venues, setVenues] = useState<VenueWithCount[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState<VenueWithCount | null>(null);

  const loadVenues = async () => {
    if (isLoading) return;

    try {
      setIsLoading(true);
      const { data: venuesData, error: venuesError } = await supabase
        .from('venues')
        .select('*')
        .eq('is_active', true) as { data: Venue[] | null; error: any };

      if (venuesError) throw venuesError;

      if (!venuesData) {
        setVenues([]);
        return;
      }

      const { data: ticketsData } = await supabase
        .rpc('tickets_count_today_euwarsaw');

      const countMap = new Map(
        (ticketsData || []).map((t: any) => [t.venue_id, t.count_today])
      );

      const venuesWithCount: VenueWithCount[] = (venuesData as Venue[]).map(venue => ({
        ...venue,
        count_today: countMap.get(venue.id) || 0
      }));

      setVenues(venuesWithCount);
    } catch (error) {
      console.error('Error loading venues:', error);
      setVenues([]);
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
