import { supabase } from './supabase'

/**
 * Tipos de acciones que otorgan puntos
 */
export enum PointAction {
  TICKET_USED = 'ticket_used',          // 10 puntos
  VENUE_SAVED = 'venue_saved',          // 5 puntos
  VENUE_SHARED = 'venue_shared',        // 5 puntos
  PROFILE_COMPLETED = 'profile_completed', // 20 puntos
  DAILY_LOGIN = 'daily_login',          // 2 puntos
  FIRST_TICKET = 'first_ticket',        // 50 puntos (logro)
  WEEK_STREAK = 'week_streak',          // 100 puntos (logro)
  MONTH_ACTIVE = 'month_active',        // 200 puntos (logro)
}

/**
 * Puntos otorgados por cada acción
 */
const POINTS_PER_ACTION: Record<PointAction, number> = {
  [PointAction.TICKET_USED]: 10,
  [PointAction.VENUE_SAVED]: 5,
  [PointAction.VENUE_SHARED]: 5,
  [PointAction.PROFILE_COMPLETED]: 20,
  [PointAction.DAILY_LOGIN]: 2,
  [PointAction.FIRST_TICKET]: 50,
  [PointAction.WEEK_STREAK]: 100,
  [PointAction.MONTH_ACTIVE]: 200,
}

/**
 * Obtener puntos totales del usuario
 */
export async function getUserPoints(userId: string): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('user_points')
      .select('total_points')
      .eq('user_id', userId)
      .single()

    if (error) {
      // Si no existe registro, crear uno
      if (error.code === 'PGRST116') {
        await supabase
          .from('user_points')
          .insert({
            user_id: userId,
            total_points: 0,
            level: 1
          })
        return 0
      }
      throw error
    }

    return data?.total_points || 0
  } catch (error) {
    console.error('Error getting user points:', error)
    return 0
  }
}

/**
 * Añadir puntos al usuario
 */
export async function addPoints(
  userId: string, 
  action: PointAction,
  metadata?: any
): Promise<{ success: boolean; newTotal: number; pointsAdded: number }> {
  try {
    const pointsToAdd = POINTS_PER_ACTION[action]

    // Obtener puntos actuales
    const { data: currentData, error: fetchError } = await supabase
      .from('user_points')
      .select('total_points')
      .eq('user_id', userId)
      .single()

    let currentPoints = 0
    let isNew = false

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        // Usuario no existe, se creará
        isNew = true
      } else {
        console.error('Error fetching points:', fetchError)
        // Continuar de todas formas
      }
    } else {
      currentPoints = currentData?.total_points || 0
    }

    const newTotal = currentPoints + pointsToAdd
    const newLevel = getLevelFromPoints(newTotal)

    // Actualizar o crear puntos del usuario
    if (isNew) {
      const { error: insertError } = await supabase
        .from('user_points')
        .insert({
          user_id: userId,
          total_points: newTotal,
          level: newLevel
        })
      
      if (insertError) {
        console.error('Error inserting points:', insertError)
      }
    } else {
      const { error: updateError } = await supabase
        .from('user_points')
        .update({
          total_points: newTotal,
          level: newLevel,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
      
      if (updateError) {
        console.error('Error updating points:', updateError)
      }
    }

    // Registrar la transacción (opcional, puede fallar sin afectar)
    try {
      await supabase
        .from('points_transactions')
        .insert({
          user_id: userId,
          action: action,
          points: pointsToAdd,
          metadata: metadata
        })
    } catch (transactionError) {
      console.error('Error logging transaction:', transactionError)
      // No es crítico, continuamos
    }

    return {
      success: true,
      newTotal: newTotal,
      pointsAdded: pointsToAdd
    }
  } catch (error) {
    console.error('Error adding points:', error)
    return {
      success: false,
      newTotal: 0,
      pointsAdded: 0
    }
  }
}

/**
 * Obtener nivel del usuario basado en puntos
 */
export function getLevelFromPoints(points: number): number {
  // Cada nivel requiere 100 puntos más que el anterior
  // Nivel 1: 0-99 puntos
  // Nivel 2: 100-299 puntos
  // Nivel 3: 300-599 puntos
  // etc.
  
  if (points < 100) return 1
  
  let level = 1
  let pointsRequired = 0
  
  while (pointsRequired <= points) {
    level++
    pointsRequired += level * 100
  }
  
  return level - 1
}

/**
 * Actualizar nivel del usuario
 */
async function updateUserLevel(userId: string): Promise<void> {
  try {
    const points = await getUserPoints(userId)
    const level = getLevelFromPoints(points)

    await supabase
      .from('user_points')
      .update({ level })
      .eq('user_id', userId)
  } catch (error) {
    console.error('Error updating user level:', error)
  }
}

/**
 * Obtener historial de puntos del usuario
 */
export async function getPointsHistory(userId: string, limit: number = 10) {
  try {
    const { data, error } = await supabase
      .from('points_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error

    return data || []
  } catch (error) {
    console.error('Error getting points history:', error)
    return []
  }
}

/**
 * Obtener ranking de usuarios por puntos
 */
export async function getLeaderboard(limit: number = 10) {
  try {
    const { data, error } = await supabase
      .from('user_points')
      .select(`
        user_id,
        total_points,
        level,
        users:user_id (
          username,
          avatar_url
        )
      `)
      .order('total_points', { ascending: false })
      .limit(limit)

    if (error) throw error

    return data || []
  } catch (error) {
    console.error('Error getting leaderboard:', error)
    return []
  }
}

/**
 * Verificar y otorgar logros
 */
export async function checkAndAwardAchievements(userId: string): Promise<void> {
  try {
    // Verificar primer ticket
    const { count: ticketCount } = await supabase
      .from('tickets')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    if (ticketCount === 1) {
      await addPoints(userId, PointAction.FIRST_TICKET)
    }

    // Verificar racha semanal
    const { data: weekTickets } = await supabase
      .from('tickets')
      .select('created_at')
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

    if (weekTickets && weekTickets.length >= 7) {
      await addPoints(userId, PointAction.WEEK_STREAK)
    }

  } catch (error) {
    console.error('Error checking achievements:', error)
  }
}

/**
 * Descripción legible de cada acción
 */
export function getActionDescription(action: PointAction): string {
  const descriptions: Record<PointAction, string> = {
    [PointAction.TICKET_USED]: 'Usaste un ticket',
    [PointAction.VENUE_SAVED]: 'Guardaste un lugar',
    [PointAction.VENUE_SHARED]: 'Compartiste un lugar',
    [PointAction.PROFILE_COMPLETED]: 'Completaste tu perfil',
    [PointAction.DAILY_LOGIN]: 'Inicio de sesión diario',
    [PointAction.FIRST_TICKET]: '¡Primer ticket usado! 🎉',
    [PointAction.WEEK_STREAK]: 'Racha de 7 días 🔥',
    [PointAction.MONTH_ACTIVE]: 'Mes activo 🌟',
  }
  
  return descriptions[action] || action
}
