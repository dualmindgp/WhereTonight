import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key must be provided!')
}

// Detectar si estamos en plataforma nativa (Capacitor)
const isNativePlatform = () => {
  if (typeof window === 'undefined') return false
  // Verifica si Capacitor está disponible
  return !!(window as any).Capacitor?.isNativePlatform?.()
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Para móvil: usar PKCE flow, para web: implicit
    flowType: isNativePlatform() ? 'pkce' : 'implicit',
    detectSessionInUrl: true
  }
})

// Helper para obtener la redirect URL correcta según la plataforma
export const getAuthRedirectUrl = () => {
  if (typeof window === 'undefined') return ''
  return isNativePlatform() 
    ? 'com.wheretonight.app://login-callback'
    : window.location.origin
}