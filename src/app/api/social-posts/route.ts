import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET: Obtener posts filtrados por ciudad y audiencia
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const city = searchParams.get('city')
    const userId = searchParams.get('userId') // Para filtrar posts de amigos

    if (!city) {
      return NextResponse.json(
        { error: 'City parameter is required' },
        { status: 400 }
      )
    }

    // Calcular timestamp de hace 24 horas
    const twentyFourHoursAgo = new Date()
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24)
    const timestamp24h = twentyFourHoursAgo.toISOString()

    let query = supabase
      .from('social_posts_with_user')
      .select('*')
      .eq('city', city)
      .gte('created_at', timestamp24h) // Solo posts de las últimas 24h
      .order('created_at', { ascending: false })
      .limit(50)

    const { data, error } = await query

    if (error) {
      console.error('Error fetching social posts:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    // Si hay userId, filtrar posts según visibilidad
    if (userId && data) {
      // Obtener IDs de amigos del usuario
      const { data: friendships } = await supabase
        .from('friendships')
        .select('user_id, friend_id')
        .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
        .eq('status', 'accepted')

      const friendIds = new Set<string>()
      if (friendships) {
        friendships.forEach((f) => {
          if (f.user_id === userId) {
            friendIds.add(f.friend_id)
          } else {
            friendIds.add(f.user_id)
          }
        })
      }

      // Filtrar posts: públicos + propios + de amigos
      const filteredData = data.filter((post) => {
        if (post.audience === 'public') return true
        if (post.user_id === userId) return true
        if (post.audience === 'friends_only' && friendIds.has(post.user_id)) return true
        return false
      })

      return NextResponse.json(filteredData)
    }

    // Si no hay userId, solo devolver posts públicos
    const publicData = data?.filter((post) => post.audience === 'public') || []

    return NextResponse.json(publicData)
  } catch (error) {
    console.error('Error in GET /api/social-posts:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST: Crear un nuevo post social
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, content, city, city_lat, city_lng, audience, image_url } = body

    // Validaciones
    if (!user_id || !content || !city || city_lat === undefined || city_lng === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (content.length > 500) {
      return NextResponse.json(
        { error: 'Content exceeds maximum length of 500 characters' },
        { status: 400 }
      )
    }

    if (audience && !['public', 'friends_only'].includes(audience)) {
      return NextResponse.json(
        { error: 'Invalid audience value' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('social_posts')
      .insert({
        user_id,
        content,
        city,
        city_lat,
        city_lng,
        audience: audience || 'public',
        image_url: image_url || null
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating social post:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/social-posts:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE: Eliminar un post
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const postId = searchParams.get('id')
    const userId = searchParams.get('userId')

    if (!postId || !userId) {
      return NextResponse.json(
        { error: 'Post ID and User ID are required' },
        { status: 400 }
      )
    }

    // Verificar que el post pertenece al usuario
    const { data: post } = await supabase
      .from('social_posts')
      .select('user_id')
      .eq('id', postId)
      .single()

    if (!post || post.user_id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    const { error } = await supabase
      .from('social_posts')
      .delete()
      .eq('id', postId)

    if (error) {
      console.error('Error deleting social post:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/social-posts:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
