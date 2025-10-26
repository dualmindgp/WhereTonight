import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useToastContext } from '../contexts/ToastContext';

export function useFavorites(userId: string | undefined) {
  const toast = useToastContext();
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  // Cargar favoritos al iniciar
  useEffect(() => {
    if (userId) {
      loadFavorites();
    }
  }, [userId]);

  const loadFavorites = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('favorites')
        .select('venue_id')
        .eq('user_id', userId);

      if (error) throw error;

      const favoriteIds = new Set(data?.map(f => f.venue_id) || []);
      setFavorites(favoriteIds);
    } catch (error) {
      console.error('Error loading favorites:', error);
      toast.error('Error al cargar favoritos');
    } finally {
      setLoading(false);
    }
  };

  const addFavorite = async (venueId: string) => {
    if (!userId) {
      toast.error('Debes iniciar sesión');
      return;
    }

    try {
      const { error } = await supabase
        .from('favorites')
        .insert({
          user_id: userId,
          venue_id: venueId
        });

      if (error) throw error;

      setFavorites(prev => new Set([...prev, venueId]));
      toast.success('Agregado a favoritos');
    } catch (error) {
      console.error('Error adding favorite:', error);
      toast.error('Error al agregar favorito');
    }
  };

  const removeFavorite = async (venueId: string) => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('venue_id', venueId);

      if (error) throw error;

      setFavorites(prev => {
        const next = new Set(prev);
        next.delete(venueId);
        return next;
      });
      toast.success('Eliminado de favoritos');
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast.error('Error al eliminar favorito');
    }
  };

  const toggleFavorite = async (venueId: string) => {
    if (favorites.has(venueId)) {
      await removeFavorite(venueId);
    } else {
      await addFavorite(venueId);
    }
  };

  const isFavorite = (venueId: string) => favorites.has(venueId);

  return {
    favorites,
    loading,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    loadFavorites
  };
}
