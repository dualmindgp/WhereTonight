/**
 * Script para verificar que todas las variables de entorno estén configuradas
 */

import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const requiredVars = {
  'SUPABASE_URL': process.env.SUPABASE_URL,
  'SUPABASE_SERVICE_ROLE_KEY': process.env.SUPABASE_SERVICE_ROLE_KEY,
  'GOOGLE_MAPS_API_KEY': process.env.GOOGLE_MAPS_API_KEY
}

console.log('🔍 Verificando variables de entorno...\n')

let allConfigured = true

for (const [varName, value] of Object.entries(requiredVars)) {
  if (!value) {
    console.log(`❌ ${varName}: NO CONFIGURADA`)
    allConfigured = false
  } else {
    const preview = value.substring(0, 20) + '...'
    console.log(`✅ ${varName}: ${preview}`)
  }
}

console.log('\n' + '='.repeat(50))

if (allConfigured) {
  console.log('✅ TODAS LAS VARIABLES ESTÁN CONFIGURADAS')
  console.log('🚀 Puedes ejecutar: npm run seed:madrid')
} else {
  console.log('❌ FALTAN VARIABLES DE ENTORNO')
  console.log('\nAñade las variables faltantes en .env.local:')
  console.log(`
# Supabase
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...tu_service_role_key

# Google Places API
GOOGLE_MAPS_API_KEY=AIza...tu_google_api_key
  `)
}

console.log('='.repeat(50))

process.exit(allConfigured ? 0 : 1)
