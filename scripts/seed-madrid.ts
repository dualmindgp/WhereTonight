/**
 * 🏙️ SEED MADRID - Script para poblar la base de datos con locales de Madrid
 * 
 * 📋 Cómo funciona:
 * 1. Lee la lista de locales (VENUES_TO_SEARCH)
 * 2. Busca cada local en Google Places API
 * 3. Obtiene: fotos, ratings, coordenadas, precios, etc.
 * 4. Guarda todo en Supabase con upsert (actualiza si existe)
 * 
 * 🚀 Para ejecutar: npm run seed:madrid
 * 
 * 📝 Para replicar con otra ciudad:
 * 1. Copia este archivo y renómbralo (ej: seed-barcelona.ts)
 * 2. Cambia VENUES_TO_SEARCH con locales de la nueva ciudad
 * 3. Actualiza locationBias con las coordenadas de la ciudad
 * 4. Añade el comando en package.json
 */

import * as dotenv from 'dotenv'
// Cargar específicamente el archivo .env.local
dotenv.config({ path: '.env.local' })
import { createClient } from '@supabase/supabase-js'

// 📍 CONFIGURACIÓN - Lista de locales a buscar en Madrid
const VENUES_TO_SEARCH = [
  'Teatro Kapital Madrid',
  'Fabrik Club Madrid',
  'Joy Eslava Madrid',
  'Goya Social Club Madrid',
  'Barceló Teatro Madrid',
  'Mondo Disco Madrid',
  'Sala Cool Madrid',
  'El Sol Madrid',
  'Stardust Madrid',
  'Shoko Madrid',
  'Opium Madrid'
]

interface VenueData {
  place_id: string
  name: string
  address: string
  lat: number
  lng: number
  rating?: number
  price_level?: number
  photo_ref?: string
  photo_refs?: string[]
  maps_url: string
  website?: string
  is_active: boolean
  type: 'club' | 'bar' | 'other'
  avg_price_text?: string
  opening_hours?: string
}

class GooglePlacesService {
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async findPlaceByText(query: string): Promise<string | null> {
    try {
      const url = 'https://places.googleapis.com/v1/places:searchText'
      
      const requestBody = {
        textQuery: query,
        maxResultCount: 1,
        locationBias: {
          rectangle: {
            low: { latitude: 40.3, longitude: -3.85 },  // SW de Madrid
            high: { latitude: 40.55, longitude: -3.55 }  // NE de Madrid
          }
        }
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': this.apiKey,
          'X-Goog-FieldMask': 'places.id'
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Places API search error: ${response.status} ${response.statusText} - ${errorText}`)
      }

      const data = await response.json()
      
      if (data.places && data.places.length > 0) {
        return data.places[0].id
      }

      return null
    } catch (error) {
      console.error('Error finding place by text:', error)
      return null
    }
  }

  async getPlaceDetails(placeId: string) {
    try {
      const url = `https://places.googleapis.com/v1/places/${placeId}`
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-Goog-Api-Key': this.apiKey,
          'X-Goog-FieldMask': 'id,displayName,formattedAddress,location,rating,priceLevel,photos,googleMapsUri,websiteUri'
        }
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Places API details error: ${response.status} ${response.statusText} - ${errorText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error getting place details:', error)
      return null
    }
  }

  convertPriceLevel(priceLevel?: string): number {
    switch (priceLevel) {
      case 'PRICE_LEVEL_FREE': return 0
      case 'PRICE_LEVEL_INEXPENSIVE': return 1
      case 'PRICE_LEVEL_MODERATE': return 2
      case 'PRICE_LEVEL_EXPENSIVE': return 3
      case 'PRICE_LEVEL_VERY_EXPENSIVE': return 4
      default: return 0
    }
  }
}

async function seedMadridVenues() {
  console.log('🚀 Starting Madrid venues seeding process with Google Places API...\n')

  // Verificar variables de entorno
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const googleApiKey = process.env.GOOGLE_MAPS_API_KEY

  if (!supabaseUrl) {
    throw new Error('❌ SUPABASE_URL not found in environment variables')
  }

  if (!supabaseServiceKey) {
    throw new Error('❌ SUPABASE_SERVICE_ROLE_KEY not found in environment variables')
  }

  if (!googleApiKey) {
    throw new Error('❌ GOOGLE_MAPS_API_KEY not found in environment variables')
  }

  // Crear cliente de Supabase con SERVICE ROLE KEY
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  console.log('✅ Supabase client initialized with SERVICE ROLE KEY')

  const placesService = new GooglePlacesService(googleApiKey)
  const results = {
    inserted: 0,
    updated: 0,
    failed: 0,
    failedVenues: [] as string[]
  }

  // Procesar cada local
  for (const venueQuery of VENUES_TO_SEARCH) {
    try {
      console.log(`\n🔍 Searching for: ${venueQuery}`)
      
      // 1. Buscar el place_id
      const placeId = await placesService.findPlaceByText(venueQuery)
      if (!placeId) {
        console.log(`❌ No place found for: ${venueQuery}`)
        results.failed++
        results.failedVenues.push(venueQuery)
        continue
      }

      console.log(`✅ Found place_id: ${placeId}`)

      // 2. Obtener detalles del lugar
      const placeDetails = await placesService.getPlaceDetails(placeId)
      if (!placeDetails) {
        console.log(`❌ No details found for place_id: ${placeId}`)
        results.failed++
        results.failedVenues.push(venueQuery)
        continue
      }

      // 3. Extraer photo references (hasta 10 fotos)
      let photoRef: string | undefined
      let photoRefs: string[] = []
      if (placeDetails.photos && placeDetails.photos.length > 0) {
        // Primera foto como principal
        const firstPhotoName = placeDetails.photos[0].name
        photoRef = firstPhotoName.split('/').pop()
        
        // Todas las fotos (máximo 10)
        photoRefs = placeDetails.photos
          .slice(0, 10)
          .map((photo: any) => photo.name.split('/').pop())
          .filter(Boolean) as string[]
      }

      // 4. Determinar el tipo de local y precio estimado
      const name = placeDetails.displayName.text.toLowerCase()
      let type: 'club' | 'bar' | 'other' = 'other'
      let avgPriceText: string | undefined

      // Detectar tipo según nombre
      if (name.includes('club') || name.includes('fabrik') || name.includes('kapital') || 
          name.includes('joy') || name.includes('goya') || name.includes('shoko') || 
          name.includes('opium') || name.includes('mondo')) {
        type = 'club'
        avgPriceText = 'Entrada: 15-30€, Copas: 10-18€'
      } else if (name.includes('bar') || name.includes('pub') || name.includes('sala') || 
                 name.includes('teatro') || name.includes('stardust') || name.includes('el sol')) {
        type = 'bar'
        avgPriceText = 'Entrada: 10-20€, Copas: 8-15€'
      }

      // 5. Construir maps_url
      const mapsUrl = `https://www.google.com/maps/place/?q=place_id:${placeId}`

      const venueData: VenueData = {
        place_id: placeId,
        name: placeDetails.displayName.text,
        address: placeDetails.formattedAddress,
        lat: placeDetails.location.latitude,
        lng: placeDetails.location.longitude,
        rating: placeDetails.rating,
        price_level: placesService.convertPriceLevel(placeDetails.priceLevel),
        photo_ref: photoRef,
        photo_refs: photoRefs.length > 0 ? photoRefs : undefined,
        maps_url: mapsUrl,
        website: placeDetails.websiteUri,
        is_active: true,
        type,
        avg_price_text: avgPriceText
      }

      console.log(`✅ Processed: ${venueData.name}`)
      console.log(`   📍 ${venueData.address}`)
      console.log(`   ⭐ Rating: ${venueData.rating || 'N/A'}`)
      console.log(`   💰 Price Level: ${venueData.price_level}`)
      console.log(`   📸 Photos: ${photoRefs.length} images`)
      console.log(`   🗺️  Maps URL: ${venueData.maps_url}`)

      // 6. Hacer upsert en Supabase
      const { data, error } = await supabase
        .from('venues')
        .upsert(venueData, { 
          onConflict: 'place_id',
          ignoreDuplicates: false 
        })
        .select()

      if (error) {
        console.error(`❌ Error saving ${venueData.name}:`, error)
        results.failed++
        results.failedVenues.push(venueQuery)
      } else {
        if (data && data.length > 0) {
          console.log(`✅ Upserted: ${venueData.name}`)
          results.updated++
        } else {
          console.log(`✅ Inserted: ${venueData.name}`)
          results.inserted++
        }
      }

      // Delay para evitar rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000))

    } catch (error) {
      console.error(`❌ Error processing ${venueQuery}:`, error)
      results.failed++
      results.failedVenues.push(venueQuery)
    }
  }

  // Resumen final
  console.log('\n' + '='.repeat(50))
  console.log('🎉 MADRID VENUES SEEDING COMPLETED!')
  console.log('='.repeat(50))
  console.log(`📊 SUMMARY:`)
  console.log(`   ✅ Inserted: ${results.inserted}`)
  console.log(`   🔄 Updated: ${results.updated}`)
  console.log(`   ❌ Failed: ${results.failed}`)
  
  if (results.failedVenues.length > 0) {
    console.log(`\n💥 Failed venues:`)
    results.failedVenues.forEach(venue => console.log(`   - ${venue}`))
  }

  console.log(`\n🔗 Next steps:`)
  console.log(`   1. Check your Supabase dashboard to see the Madrid venues`)
  console.log(`   2. Photos should display automatically with place_id`)
  console.log(`   3. Run your app to see the venues on the map`)

  process.exit(0)
}

// Ejecutar el script
seedMadridVenues().catch((error) => {
  console.error('💥 Fatal error:', error)
  process.exit(1)
})
