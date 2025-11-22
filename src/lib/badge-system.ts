import { supabase } from './supabase'
import { addPoints, PointAction } from './points-system'

/**
 * Sistema de Badges - Logros y recompensas gamificadas
 */

export interface Badge {
  id: string
  slug: string
  name: string
  description: string
  icon_name: string | null
  category: 'social' | 'explorer' | 'influencer' | 'loyalty' | 'referral' | 'premium'
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  points_reward: number
  unlock_conditions: Record<string, any>
  is_active: boolean
  created_at: string
}

export interface UserBadge {
  id: string
  user_id: string
  badge_id: string
  unlocked_at: string
  badge?: Badge
}

/**
 * Obtener todos los badges disponibles
 */
export async function getAllBadges(): Promise<Badge[]> {
  try {
    const { data, error } = await supabase
      .from('badges')
      .select('*')
      .eq('is_active', true)
      .order('rarity', { ascending: false })
      .order('category')

    if (error) {
      console.error('Error fetching badges:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in getAllBadges:', error)
    return []
  }
}

/**
 * Obtener badges desbloqueados por un usuario
 */
export async function getUserBadges(userId: string): Promise<UserBadge[]> {
  try {
    const { data, error } = await supabase
      .from('user_badges')
      .select(`
        *,
        badge:badges(*)
      `)
      .eq('user_id', userId)
      .order('unlocked_at', { ascending: false })

    if (error) {
      console.error('Error fetching user badges:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in getUserBadges:', error)
    return []
  }
}

/**
 * Verificar si un usuario tiene un badge específico
 */
export async function hasUserBadge(userId: string, badgeSlug: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('user_badges')
      .select('id, badge:badges!inner(slug)')
      .eq('user_id', userId)
      .eq('badge.slug', badgeSlug)
      .maybeSingle()

    if (error) {
      console.error('Error checking user badge:', error)
      return false
    }

    return !!data
  } catch (error) {
    console.error('Error in hasUserBadge:', error)
    return false
  }
}

/**
 * Desbloquear un badge para un usuario
 */
export async function unlockBadge(
  userId: string, 
  badgeSlug: string
): Promise<{ success: boolean; badge?: Badge; pointsEarned?: number }> {
  try {
    // Verificar si ya tiene el badge
    const alreadyHas = await hasUserBadge(userId, badgeSlug)
    if (alreadyHas) {
      return { success: false }
    }

    // Obtener info del badge
    const { data: badge, error: badgeError } = await supabase
      .from('badges')
      .select('*')
      .eq('slug', badgeSlug)
      .single()

    if (badgeError || !badge) {
      console.error('Badge not found:', badgeSlug)
      return { success: false }
    }

    // Insertar badge desbloqueado
    const { error: insertError } = await supabase
      .from('user_badges')
      .insert({
        user_id: userId,
        badge_id: badge.id
      })

    if (insertError) {
      console.error('Error unlocking badge:', insertError)
      return { success: false }
    }

    // Dar puntos de recompensa
    if (badge.points_reward > 0) {
      await addPoints(userId, PointAction.BADGE_UNLOCKED, {
        badge_slug: badgeSlug,
        badge_name: badge.name,
        points: badge.points_reward
      })
    }

    return { 
      success: true, 
      badge,
      pointsEarned: badge.points_reward 
    }
  } catch (error) {
    console.error('Error in unlockBadge:', error)
    return { success: false }
  }
}

/**
 * Verificar y desbloquear badges automáticamente basados en estadísticas
 */
export async function checkAndUnlockBadges(userId: string): Promise<Badge[]> {
  const unlockedBadges: Badge[] = []

  try {
    // Obtener estadísticas del usuario
    const stats = await getUserStats(userId)

    // Definir condiciones de badges
    const badgeChecks: Array<{ slug: string; condition: boolean }> = [
      // Social
      { slug: 'first_story', condition: stats.stories_count >= 1 },
      { slug: 'storyteller', condition: stats.stories_count >= 10 },
      { slug: 'influencer', condition: stats.stories_count >= 50 },
      { slug: 'viral', condition: stats.stories_count >= 100 },
      
      // Explorer
      { slug: 'night_owl', condition: stats.venues_visited >= 5 },
      { slug: 'city_explorer', condition: stats.venues_visited >= 20 },
      { slug: 'nightlife_expert', condition: stats.venues_visited >= 50 },
      
      // Loyalty
      { slug: 'week_warrior', condition: stats.login_streak >= 7 },
      { slug: 'month_master', condition: stats.login_streak >= 30 },
      { slug: 'dedicated', condition: stats.login_streak >= 100 },
      
      // Referral
      { slug: 'recruiter', condition: stats.referrals >= 1 },
      { slug: 'talent_scout', condition: stats.referrals >= 5 },
      { slug: 'ambassador', condition: stats.referrals >= 20 },
    ]

    // Verificar cada condición
    for (const check of badgeChecks) {
      if (check.condition) {
        const result = await unlockBadge(userId, check.slug)
        if (result.success && result.badge) {
          unlockedBadges.push(result.badge)
        }
      }
    }
  } catch (error) {
    console.error('Error checking badges:', error)
  }

  return unlockedBadges
}

/**
 * Obtener estadísticas del usuario para badges
 */
async function getUserStats(userId: string): Promise<{
  stories_count: number
  venues_visited: number
  login_streak: number
  referrals: number
  tickets_used: number
}> {
  try {
    // Historias
    const { count: storiesCount } = await supabase
      .from('social_posts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    // Venues visitados (tickets usados en diferentes venues)
    const { data: venuesData } = await supabase
      .from('tickets')
      .select('venue_id')
      .eq('user_id', userId)
      .not('venue_id', 'is', null)
    
    const uniqueVenues = new Set(venuesData?.map(t => t.venue_id) || [])

    // Racha de login
    const { data: streakData } = await supabase
      .from('user_streaks')
      .select('current_login_streak')
      .eq('user_id', userId)
      .single()

    // Referidos
    const { count: referralsCount } = await supabase
      .from('referrals')
      .select('*', { count: 'exact', head: true })
      .eq('referrer_id', userId)

    // Tickets usados
    const { count: ticketsCount } = await supabase
      .from('tickets')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    return {
      stories_count: storiesCount || 0,
      venues_visited: uniqueVenues.size,
      login_streak: streakData?.current_login_streak || 0,
      referrals: referralsCount || 0,
      tickets_used: ticketsCount || 0
    }
  } catch (error) {
    console.error('Error getting user stats:', error)
    return {
      stories_count: 0,
      venues_visited: 0,
      login_streak: 0,
      referrals: 0,
      tickets_used: 0
    }
  }
}

/**
 * Obtener progreso hacia badges no desbloqueados
 */
export async function getBadgeProgress(userId: string): Promise<Array<{
  badge: Badge
  progress: number
  total: number
  percentage: number
  unlocked: boolean
}>> {
  try {
    const [allBadges, userBadges, stats] = await Promise.all([
      getAllBadges(),
      getUserBadges(userId),
      getUserStats(userId)
    ])

    const unlockedBadgeIds = new Set(userBadges.map(ub => ub.badge_id))

    return allBadges.map(badge => {
      const unlocked = unlockedBadgeIds.has(badge.id)
      const conditions = badge.unlock_conditions

      let progress = 0
      let total = 1

      // Calcular progreso según condiciones
      if (conditions.stories_count) {
        total = conditions.stories_count
        progress = Math.min(stats.stories_count, total)
      } else if (conditions.venues_visited) {
        total = conditions.venues_visited
        progress = Math.min(stats.venues_visited, total)
      } else if (conditions.login_streak) {
        total = conditions.login_streak
        progress = Math.min(stats.login_streak, total)
      } else if (conditions.referrals) {
        total = conditions.referrals
        progress = Math.min(stats.referrals, total)
      }

      return {
        badge,
        progress: unlocked ? total : progress,
        total,
        percentage: unlocked ? 100 : Math.round((progress / total) * 100),
        unlocked
      }
    })
  } catch (error) {
    console.error('Error getting badge progress:', error)
    return []
  }
}

/**
 * Obtener color según rareza del badge
 */
export function getBadgeColor(rarity: Badge['rarity']): string {
  const colors = {
    common: '#9ca3af', // gray-400
    rare: '#3b82f6', // blue-500
    epic: '#a855f7', // purple-500
    legendary: '#f59e0b' // amber-500
  }
  return colors[rarity]
}

/**
 * Obtener emoji según categoría del badge
 */
export function getBadgeEmoji(category: Badge['category']): string {
  const emojis = {
    social: '📸',
    explorer: '🗺️',
    influencer: '⭐',
    loyalty: '🔥',
    referral: '🎁',
    premium: '💎'
  }
  return emojis[category]
}
