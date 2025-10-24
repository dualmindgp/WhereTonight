import { useState } from 'react';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '../lib/supabase';
import { useToastContext } from '../contexts/ToastContext';

WebBrowser.maybeCompleteAuthSession();

export function useGoogleAuth() {
  const [loading, setLoading] = useState(false);
  const toast = useToastContext();

  const signInWithGoogle = async () => {
    console.log('🔐 [GoogleAuth] Starting Google Sign In...');
    setLoading(true);

    try {
      // Usar el mismo método que la web - simple y directo
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'wheretonight://auth/callback',
        },
      });

      if (error) {
        console.error('❌ [GoogleAuth] Error:', error);
        toast.error(error.message || 'Error al iniciar sesión con Google');
        setLoading(false);
        return;
      }

      if (data?.url) {
        console.log('🌐 [GoogleAuth] Opening browser...');
        
        // Abrir el navegador para OAuth
        const result = await WebBrowser.openAuthSessionAsync(
          data.url,
          'wheretonight://auth/callback'
        );

        console.log('📱 [GoogleAuth] Result:', result.type);

        if (result.type === 'success' && result.url) {
          console.log('✅ [GoogleAuth] OAuth callback received');
          
          // Extraer tokens del hash fragment (formato estándar de OAuth)
          const urlObj = new URL(result.url);
          const hash = urlObj.hash.substring(1);
          const params = new URLSearchParams(hash);
          
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');

          if (accessToken && refreshToken) {
            console.log('🔑 [GoogleAuth] Setting session...');
            const { error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (sessionError) {
              throw sessionError;
            }

            console.log('✅ [GoogleAuth] Login successful!');
            toast.success('¡Sesión iniciada con Google!');
          } else {
            throw new Error('No se recibieron tokens de autenticación');
          }
        } else if (result.type === 'cancel') {
          console.log('⚠️ [GoogleAuth] User cancelled');
          toast.info('Autenticación cancelada');
        }
      }
    } catch (err: any) {
      console.error('❌ [GoogleAuth] Error:', err);
      toast.error(err.message || 'Error al iniciar sesión con Google');
    } finally {
      setLoading(false);
    }
  };

  return { signInWithGoogle, loading };
}
