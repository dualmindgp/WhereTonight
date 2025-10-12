import { NextRequest, NextResponse } from 'next/server'

// Cache de fotos en memoria (en producción, usar Redis o similar)
const photoCache = new Map<string, { data: Buffer; contentType: string; timestamp: number }>()
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 días en milisegundos

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const photoRef = searchParams.get('ref')

  if (!photoRef) {
    return NextResponse.json({ error: 'Photo reference required' }, { status: 400 })
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY
  
  if (!apiKey) {
    console.error('Google Maps API key not found in environment')
    return new NextResponse(JSON.stringify({ error: 'API key not configured' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
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
      
      // Devolver un error claro en lugar de una imagen corrupta
      return NextResponse.json({ 
        error: 'Google Places API rechazó la petición',
        status: 403,
        solution: 'Habilita Places API en Google Cloud Console'
      }, { status: 403 })
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
    
    return new NextResponse(JSON.stringify({ 
      error: 'Failed to fetch photo',
      details: error instanceof Error ? error.message : String(error)
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
