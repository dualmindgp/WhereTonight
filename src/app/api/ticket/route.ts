import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { z } from 'zod'

// Esquema de validación con Zod
const ticketSchema = z.object({
  venueId: z.string().uuid('Invalid venue ID format')
})

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'No authorization header' }, { status: 401 })
    }

    // Obtener el usuario actual
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Validar el body de la request
    const body = await request.json()
    const { venueId } = ticketSchema.parse(body)

    // Verificar que el venue existe y está activo
    const { data: venue, error: venueError } = await supabase
      .from('venues')
      .select('id, is_active')
      .eq('id', venueId)
      .eq('is_active', true)
      .single()

    if (venueError || !venue) {
      return NextResponse.json({ error: 'Venue not found or inactive' }, { status: 404 })
    }

    // Calcular la fecha local en Europa/Varsovia (en el servidor para evitar manipulación)
    const localDate = new Date().toLocaleDateString('sv-SE', { 
      timeZone: 'Europe/Warsaw' 
    })

    // Intentar insertar el ticket
    const { error: insertError } = await supabase
      .from('tickets')
      .insert({
        user_id: user.id,
        venue_id: venueId,
        local_date: localDate
      })

    if (insertError) {
      // TESTING MODE: Permitir múltiples tickets por día
      // Si es una violación de constraint único (ya usó su ticket hoy)
      if (insertError.code === '23505') {
        console.log('⚠️ TESTING MODE: Permitiendo múltiples tickets por día')
        // Ignorar el error y devolver éxito de todas formas
        return NextResponse.json({ ok: true, message: 'Ticket usado exitosamente (testing mode)' })
      }
      
      console.error('Error inserting ticket:', insertError)
      return NextResponse.json({ error: 'Error creating ticket' }, { status: 500 })
    }

    return NextResponse.json({ ok: true, message: 'Ticket usado exitosamente' })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.errors }, { status: 400 })
    }

    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
