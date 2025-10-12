import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY! // Usar service key para bypass RLS

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: NextRequest) {
  try {
    const { user_id, venue_id, type } = await request.json()

    if (!user_id || !venue_id || !type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verificar que no exista actividad del mismo día
    const today = new Date().toISOString().split('T')[0]
    
    const { data: existing } = await supabaseAdmin
      .from('activity_feed')
      .select('id')
      .eq('user_id', user_id)
      .eq('venue_id', venue_id)
      .gte('created_at', `${today}T00:00:00`)
      .lte('created_at', `${today}T23:59:59`)
      .single()

    if (existing) {
      return NextResponse.json(
        { message: 'Activity already exists for today' },
        { status: 200 }
      )
    }

    // Insertar nueva actividad
    const { data, error } = await supabaseAdmin
      .from('activity_feed')
      .insert({
        user_id,
        venue_id,
        type
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating activity:', error)
      return NextResponse.json(
        { error: 'Error creating activity' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
