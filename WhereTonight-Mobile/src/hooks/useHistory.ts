import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useToastContext } from '../contexts/ToastContext';

export interface HistoryEntry {
  id: string;
  venue_id: string;
  venue_name: string;
  local_date: string;
  created_at: string;
}

export function useHistory(userId: string | undefined) {
  const toast = useToastContext();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalVisits, setTotalVisits] = useState(0);

  // Cargar historial al iniciar
  useEffect(() => {
    if (userId) {
      loadHistory();
    }
  }, [userId]);

  const loadHistory = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tickets')
        .select('id, venue_id, local_date, created_at')
        .eq('user_id', userId)
        .order('local_date', { ascending: false })
        .limit(100);

      if (error) throw error;

      setHistory(data || []);
      setTotalVisits(data?.length || 0);
    } catch (error) {
      console.error('Error loading history:', error);
      toast.error('Error al cargar historial');
    } finally {
      setLoading(false);
    }
  };

  const recordVisit = async (venueId: string) => {
    if (!userId) {
      toast.error('Debes iniciar sesión');
      return;
    }

    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { error } = await supabase
        .from('tickets')
        .insert({
          user_id: userId,
          venue_id: venueId,
          local_date: today
        });

      if (error) throw error;

      toast.success('Visita registrada');
      await loadHistory();
    } catch (error) {
      console.error('Error recording visit:', error);
      toast.error('Error al registrar visita');
    }
  };

  const clearHistory = async () => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from('tickets')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;

      setHistory([]);
      setTotalVisits(0);
      toast.success('Historial eliminado');
    } catch (error) {
      console.error('Error clearing history:', error);
      toast.error('Error al limpiar historial');
    }
  };

  return {
    history,
    loading,
    totalVisits,
    recordVisit,
    clearHistory,
    loadHistory
  };
}
