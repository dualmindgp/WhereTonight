import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Cliente de Supabase con service_role para evitar RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = params.userId

    // Obtener todas las amistades aceptadas de este usuario
    const { data: friendshipsData, error: friendshipsError } = await supabaseAdmin
      .from('friendships')
      .select('user_id, friend_id, status')
      .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
      .eq('status', 'accepted')

    if (friendshipsError) {
      console.error('Error fetching friendships:', friendshipsError)
      return NextResponse.json({ error: 'Error fetching friendships' }, { status: 500 })
    }

    return NextResponse.json(friendshipsData || [])

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
