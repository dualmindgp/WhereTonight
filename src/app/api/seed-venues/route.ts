import { NextResponse } from 'next/server'
// import { seedVenues } from '../../../scripts/seed-venues'

export async function POST() {
  // Ruta deshabilitada temporalmente
  return NextResponse.json({ 
    success: false, 
    error: 'Seed route disabled' 
  }, { status: 503 })
  
  /*
  try {
    // Solo permitir en desarrollo
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Not allowed in production' }, { status: 403 })
    }

    console.log('🚀 Starting venue seeding via API...')
    await seedVenues()
    
    return NextResponse.json({ 
      success: true, 
      message: 'Venues seeded successfully' 
    })
  } catch (error) {
    console.error('Error seeding venues:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
  */
}
