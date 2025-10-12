import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { VenueWithCount } from '@/lib/database.types'

// Deshabilitar cache para obtener siempre datos frescos
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    // Obtener venues activos
    const { data: venues, error: venuesError } = await supabase
      .from('venues')
      .select('*')
      .eq('is_active', true)
      .order('name')

    if (venuesError) {
      console.error('Error fetching venues:', venuesError)
      return NextResponse.json({ error: 'Error fetching venues' }, { status: 500 })
    }

    // Obtener fecha actual en formato YYYY-MM-DD (UTC)
    const today = new Date().toISOString().split('T')[0]
    
    // Consultar TODOS los tickets del día directamente
    const { data: allTickets } = await supabase
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
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
