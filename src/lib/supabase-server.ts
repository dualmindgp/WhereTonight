import { createClient } from '@supabase/supabase-js'

// Para usar en API routes del servidor
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

// Validación detallada de variables de entorno
if (!supabaseUrl) {
  console.error('❌ ERROR: SUPABASE_URL no está configurada')
  console.error('Variables disponibles:', {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'existe' : 'NO EXISTE',
    SUPABASE_URL: process.env.SUPABASE_URL ? 'existe' : 'NO EXISTE'
  })
  throw new Error('SUPABASE_URL is not configured. Please check your .env.local file.')
}

if (!supabaseKey) {
  console.error('❌ ERROR: SUPABASE_KEY no está configurada')
  console.error('Variables disponibles:', {
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'existe' : 'NO EXISTE',
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'existe' : 'NO EXISTE'
  })
  throw new Error('SUPABASE_KEY is not configured. Please check your .env.local file.')
}

// Validar formato de URL
try {
  new URL(supabaseUrl)
} catch (error) {
  console.error('❌ ERROR: SUPABASE_URL tiene formato inválido:', supabaseUrl)
  throw new Error(`Invalid SUPABASE_URL format: "${supabaseUrl}". Expected format: https://your-project.supabase.co`)
}

// Verificar que no sea el placeholder del ejemplo
if (supabaseUrl.includes('your-project') || supabaseUrl === 'https://your-project.supabase.co') {
  console.error('❌ ERROR: SUPABASE_URL contiene el valor de ejemplo')
  throw new Error('SUPABASE_URL is still set to the example value. Please update it with your actual Supabase project URL.')
}

if (supabaseKey.includes('your-') || supabaseKey.length < 20) {
  console.error('❌ ERROR: SUPABASE_KEY parece ser un valor de ejemplo o inválido')
  throw new Error('SUPABASE_KEY appears to be invalid. Please update it with your actual Supabase key.')
}

console.log('✅ Supabase configurado correctamente:', {
  url: supabaseUrl.substring(0, 30) + '...',
  keyLength: supabaseKey.length
})

export const supabaseServer = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
})
