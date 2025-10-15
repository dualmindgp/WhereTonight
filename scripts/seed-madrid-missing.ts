/**
 * Script para añadir las discotecas que fallaron en el primer seeding
 */

import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
import { createClient } from '@supabase/supabase-js'

const VENUES_TO_SEARCH = [
  'Teatro Kapital Discoteca Madrid',
  'Fabrik Madrid Discoteca',
  'Joy Eslava Discoteca Madrid',
  'Mondo Disko Madrid'
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
            low: { latitude: 40.3, longitude: -3.85 },
            high: { latitude: 40.55, longitude: -3.55 }
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

async function seedMissingVenues() {
  console.log('🚀 Adding missing Madrid venues...\n')

  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const googleApiKey = process.env.GOOGLE_MAPS_API_KEY

  if (!supabaseUrl || !supabaseServiceKey || !googleApiKey) {
    throw new Error('❌ Missing environment variables')
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  const placesService = new GooglePlacesService(googleApiKey)
  const results = { inserted: 0, updated: 0, failed: 0, failedVenues: [] as string[] }

  for (const venueQuery of VENUES_TO_SEARCH) {
    try {
      console.log(`\n🔍 Searching for: ${venueQuery}`)
      
      const placeId = await placesService.findPlaceByText(venueQuery)
      if (!placeId) {
        console.log(`❌ No place found for: ${venueQuery}`)
        results.failed++
        results.failedVenues.push(venueQuery)
        continue
      }

      console.log(`✅ Found place_id: ${placeId}`)

      const placeDetails = await placesService.getPlaceDetails(placeId)
      if (!placeDetails) {
        console.log(`❌ No details found for place_id: ${placeId}`)
        results.failed++
        results.failedVenues.push(venueQuery)
        continue
      }

      let photoRef: string | undefined
      let photoRefs: string[] = []
      if (placeDetails.photos && placeDetails.photos.length > 0) {
        const firstPhotoName = placeDetails.photos[0].name
        photoRef = firstPhotoName.split('/').pop()
        
        photoRefs = placeDetails.photos
          .slice(0, 10)
          .map((photo: any) => photo.name.split('/').pop())
          .filter(Boolean) as string[]
      }

      const name = placeDetails.displayName.text
      const type: 'club' | 'bar' | 'other' = name.toLowerCase().includes('club') || 
                                             name.toLowerCase().includes('kapital') || 
                                             name.toLowerCase().includes('fabrik') || 
                                             name.toLowerCase().includes('joy') || 
                                             name.toLowerCase().includes('mondo') 
        ? 'club' 
        : 'bar'
      
      const avgPriceText = type === 'club' 
        ? 'Entrada: 15-30€, Copas: 10-18€'
        : 'Entrada: 10-20€, Copas: 8-15€'

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
        console.log(`✅ Upserted: ${venueData.name}`)
        results.updated++
      }

      await new Promise(resolve => setTimeout(resolve, 1000))

    } catch (error) {
      console.error(`❌ Error processing ${venueQuery}:`, error)
      results.failed++
      results.failedVenues.push(venueQuery)
    }
  }

  console.log('\n' + '='.repeat(50))
  console.log('🎉 MISSING VENUES SEEDING COMPLETED!')
  console.log('='.repeat(50))
  console.log(`📊 SUMMARY:`)
  console.log(`   ✅ Inserted: ${results.inserted}`)
  console.log(`   🔄 Updated: ${results.updated}`)
  console.log(`   ❌ Failed: ${results.failed}`)
  
  if (results.failedVenues.length > 0) {
    console.log(`\n💥 Failed venues:`)
    results.failedVenues.forEach(venue => console.log(`   - ${venue}`))
  }

  process.exit(0)
}

seedMissingVenues().catch((error) => {
  console.error('💥 Fatal error:', error)
  process.exit(1)
})
