import { NextRequest, NextResponse } from 'next/server'

// Cache de fotos en memoria (en producción, usar Redis o similar)
const photoCache = new Map<string, { data: Buffer; contentType: string; timestamp: number }>()
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 días en milisegundos

// Imágenes de fallback según tipo de venue
const FALLBACK_IMAGES = {
  club: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
  bar: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
  other: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80'
}

async function fetchFallbackImage(type: string = 'other'): Promise<{ buffer: Buffer; contentType: string }> {
  const fallbackUrl = FALLBACK_IMAGES[type as keyof typeof FALLBACK_IMAGES] || FALLBACK_IMAGES.other
  const response = await fetch(fallbackUrl)
  const buffer = Buffer.from(await response.arrayBuffer())
  return { buffer, contentType: 'image/jpeg' }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const photoRef = searchParams.get('ref')
  const venueType = searchParams.get('type') || 'other'

  if (!photoRef) {
    // Devolver imagen de fallback en lugar de error
    try {
      const { buffer, contentType } = await fetchFallbackImage(venueType)
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=604800',
        },
      })
    } catch (error) {
      console.error('Error fetching fallback image:', error)
      return new NextResponse('Image not found', { status: 404 })
    }
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY
  
  if (!apiKey) {
    console.warn('Google Maps API key not configured, using fallback image')
    // Devolver imagen de fallback
    try {
      const { buffer, contentType } = await fetchFallbackImage(venueType)
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=604800',
        },
      })
    } catch (error) {
      console.error('Error fetching fallback image:', error)
      return new NextResponse('Image not found', { status: 404 })
    }
  }

  // Verificar cache
  const cached = photoCache.get(photoRef)
  if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    return new NextResponse(cached.data, {
      headers: {
        'Content-Type': cached.contentType,
        'Cache-Control': 'public, max-age=604800, immutable',
      },
    })
  }

  try {
    // Usar SIEMPRE la API clásica de Google Places Photos
    const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photoRef}&key=${apiKey}`
    
    const response = await fetch(photoUrl)

    if (!response.ok) {
      console.error('Google Places API error:', response.status)
      // Usar fallback en lugar de devolver error
      const { buffer, contentType } = await fetchFallbackImage(venueType)
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=604800',
        },
      })
    }

    const imageBuffer = Buffer.from(await response.arrayBuffer())
    const contentType = response.headers.get('content-type') || 'image/jpeg'

    // Guardar en cache
    photoCache.set(photoRef, {
      data: imageBuffer,
      contentType,
      timestamp: Date.now()
    })

    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=604800, immutable',
      },
    })

  } catch (error) {
    console.error('Error fetching photo:', error instanceof Error ? error.message : String(error))
    
    // Devolver imagen de fallback en lugar de error
    try {
      const { buffer, contentType } = await fetchFallbackImage(venueType)
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=604800',
        },
      })
    } catch (fallbackError) {
      console.error('Error fetching fallback image:', fallbackError)
      return new NextResponse('Image not found', { status: 404 })
    }
  }
}
