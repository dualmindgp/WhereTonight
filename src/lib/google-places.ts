interface PlaceSearchResult {
  places: Array<{
    id: string
    displayName: {
      text: string
    }
  }>
}

interface PlaceDetails {
  id: string
  displayName: {
    text: string
  }
  formattedAddress: string
  location: {
    latitude: number
    longitude: number
  }
  rating?: number
  priceLevel?: 'PRICE_LEVEL_FREE' | 'PRICE_LEVEL_INEXPENSIVE' | 'PRICE_LEVEL_MODERATE' | 'PRICE_LEVEL_EXPENSIVE' | 'PRICE_LEVEL_VERY_EXPENSIVE'
  photos?: Array<{
    name: string
  }>
  googleMapsUri?: string
  websiteUri?: string
}

export class GooglePlacesService {
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async findPlaceByText(query: string, locationBias?: string): Promise<string | null> {
    try {
      const url = 'https://places.googleapis.com/v1/places:searchText'
      
      const requestBody = {
        textQuery: query,
        maxResultCount: 1,
        locationBias: locationBias || {
          rectangle: {
            low: { latitude: 52.0977, longitude: 20.8638 }, // SW de Varsovia
            high: { latitude: 52.3678, longitude: 21.2708 }  // NE de Varsovia
          }
        }
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': this.apiKey,
          'X-Goog-FieldMask': 'places.id,places.displayName'
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        throw new Error(`Places API search error: ${response.status} ${response.statusText}`)
      }

      const data: PlaceSearchResult = await response.json()
      
      if (data.places && data.places.length > 0) {
        return data.places[0].id
      }

      return null
    } catch (error) {
      console.error('Error finding place by text:', error)
      throw error
    }
  }

  async getPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
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
        throw new Error(`Places API details error: ${response.status} ${response.statusText}`)
      }

      const data: PlaceDetails = await response.json()
      return data
    } catch (error) {
      console.error('Error getting place details:', error)
      throw error
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
