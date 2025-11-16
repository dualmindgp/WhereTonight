import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'
import { VenueWithCount } from '@/lib/database.types'

// Deshabilitar cache para obtener siempre datos frescos
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    console.log('🔵 [/api/venues] Iniciando consulta de venues...')
    
    // Obtener venues activos
    const { data: venues, error: venuesError } = await supabaseServer
      .from('venues')
      .select('*')
      .eq('is_active', true)
      .order('name')

    if (venuesError) {
      console.error('❌ [/api/venues] Error fetching venues:', {
        message: venuesError.message,
        details: venuesError.details,
        hint: venuesError.hint,
        code: venuesError.code
      })
      return NextResponse.json({ 
        error: 'Error fetching venues',
        message: venuesError.message,
        details: venuesError.details,
        hint: venuesError.hint,
        code: venuesError.code
      }, { status: 500 })
    }

    console.log(`✅ [/api/venues] Venues obtenidos: ${venues?.length || 0}`)

    // Obtener fecha actual en formato YYYY-MM-DD (UTC)
    const today = new Date().toISOString().split('T')[0]
    
    // Consultar TODOS los tickets del día directamente
    const { data: allTickets } = await supabaseServer
      .from('tickets')
      .select('venue_id')
      .eq('local_date', today)
    
    // Contar por venue_id
    const ticketCounts: { [key: string]: number } = {}
    if (allTickets && allTickets.length > 0) {
      allTickets.forEach((ticket: any) => {
        if (ticket.venue_id) {
          ticketCounts[ticket.venue_id] = (ticketCounts[ticket.venue_id] || 0) + 1
        }
      })
    }

    // Combinar venues con sus conteos
    const venuesWithCounts: VenueWithCount[] = venues.map(venue => {
      const count = ticketCounts[venue.id] || 0
      return {
        ...venue,
        count_today: count
      }
    })

    // Ordenar por conteo descendente (los más populares primero)
    venuesWithCounts.sort((a, b) => b.count_today - a.count_today)

    return NextResponse.json(venuesWithCounts)

  } catch (error) {
    console.error('❌ [/api/venues] Unexpected error:', error)
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      type: typeof error,
      error: JSON.stringify(error, null, 2)
    })
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error ? error.stack : String(error)
    }, { status: 500 })
  }
}
