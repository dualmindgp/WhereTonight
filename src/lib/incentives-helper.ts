/**
 * INCENTIVES HELPER
 * Funciones de ayuda para integrar el sistema de incentivos fácilmente
 */

import { addPoints, PointAction } from './points-system'
import { rewardReferrerMilestone } from './referral-system'
import { checkAndUnlockBadges } from './badge-system'
import { supabase } from './supabase'

/**
 * Handler completo para cuando un usuario crea una historia
 */
export async function handleStoryCreated(
  userId: string,
  storyData: {
    hasPhoto?: boolean
    hasVenue?: boolean
    venueId?: string
  }
): Promise<{
  totalPoints: number
  badges: any[]
  isFirstStory: boolean
}> {
  let totalPoints = 0
  const earnedPoints: number[] = []

  try {
    // Verificar si es la primera historia
    const { count } = await supabase
      .from('social_posts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    const isFirstStory = count === 1

    // Puntos base por crear historia
    const baseResult = await addPoints(userId, PointAction.STORY_CREATED)
    earnedPoints.push(baseResult.pointsAdded)

    // Bonus si es la primera historia
    if (isFirstStory) {
      const firstResult = await addPoints(userId, PointAction.FIRST_STORY)
      earnedPoints.push(firstResult.pointsAdded)
      
      // Recompensar al referrer si existe
      await rewardReferrerMilestone(userId, 'first_story')
    }

    // Bonus si tiene foto
    if (storyData.hasPhoto) {
      const photoResult = await addPoints(userId, PointAction.STORY_WITH_PHOTO)
      earnedPoints.push(photoResult.pointsAdded)
    }

    // Bonus si está en un venue
    if (storyData.hasVenue) {
      const venueResult = await addPoints(userId, PointAction.STORY_WITH_VENUE)
      earnedPoints.push(venueResult.pointsAdded)
    }

    totalPoints = earnedPoints.reduce((sum, pts) => sum + pts, 0)

    // Verificar y desbloquear badges automáticamente
    const newBadges = await checkAndUnlockBadges(userId)

    return {
      totalPoints,
      badges: newBadges,
      isFirstStory
    }
  } catch (error) {
    console.error('Error handling story creation:', error)
    return {
      totalPoints: 0,
      badges: [],
      isFirstStory: false
    }
  }
}

/**
 * Handler para cuando un usuario usa un ticket
 */
export async function handleTicketUsed(
  userId: string,
  venueId: string
): Promise<{
  totalPoints: number
  badges: any[]
  isFirstTicket: boolean
}> {
  try {
    // Verificar si es el primer ticket
    const { count } = await supabase
      .from('tickets')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    const isFirstTicket = count === 1

    // Puntos base
    const baseResult = await addPoints(userId, PointAction.TICKET_USED, {
      venue_id: venueId
    })

    let totalPoints = baseResult.pointsAdded

    // Bonus primer ticket
    if (isFirstTicket) {
      const firstResult = await addPoints(userId, PointAction.FIRST_TICKET)
      totalPoints += firstResult.pointsAdded

      // Recompensar al referrer
      await rewardReferrerMilestone(userId, 'first_ticket')
    }

    // Verificar badges
    const newBadges = await checkAndUnlockBadges(userId)

    return {
      totalPoints,
      badges: newBadges,
      isFirstTicket
    }
  } catch (error) {
    console.error('Error handling ticket use:', error)
    return {
      totalPoints: 0,
      badges: [],
      isFirstTicket: false
    }
  }
}

/**
 * Handler para cuando un usuario completa su perfil
 */
export async function handleProfileCompleted(userId: string): Promise<number> {
  try {
    // Verificar si ya se dio este bonus antes
    const { data: existingTransaction } = await supabase
      .from('points_transactions')
      .select('id')
      .eq('user_id', userId)
      .eq('action', PointAction.PROFILE_COMPLETED)
      .maybeSingle()

    if (existingTransaction) {
      return 0 // Ya se dio este bonus
    }

    // Dar puntos
    const result = await addPoints(userId, PointAction.PROFILE_COMPLETED)

    // Recompensar al referrer
    await rewardReferrerMilestone(userId, 'completed_profile')

    // Verificar badges
    await checkAndUnlockBadges(userId)

    return result.pointsAdded
  } catch (error) {
    console.error('Error handling profile completion:', error)
    return 0
  }
}

/**
 * Handler para login diario (actualiza streak automáticamente)
 */
export async function handleDailyLogin(userId: string): Promise<{
  streak: number
  pointsEarned: number
  bonusUnlocked: boolean
}> {
  try {
    const { data: streak } = await supabase.rpc('update_login_streak', {
      p_user_id: userId
    })

    // Los puntos se dan automáticamente en la función de BD
    let pointsEarned = 2 // Base diario

    // Verificar si desbloqueó bonus de streak
    let bonusUnlocked = false
    if (streak === 7) {
      pointsEarned += 50
      bonusUnlocked = true
    } else if (streak === 30) {
      pointsEarned += 200
      bonusUnlocked = true
    } else if (streak === 100) {
      pointsEarned += 1000
      bonusUnlocked = true
    }

    // Verificar badges de streaks
    await checkAndUnlockBadges(userId)

    return {
      streak: streak || 0,
      pointsEarned,
      bonusUnlocked
    }
  } catch (error) {
    console.error('Error handling daily login:', error)
    return {
      streak: 0,
      pointsEarned: 0,
      bonusUnlocked: false
    }
  }
}

/**
 * Handler para interacciones sociales
 */
export async function handleSocialInteraction(
  userId: string,
  type: 'like' | 'comment' | 'friend_added'
): Promise<number> {
  try {
    const actionMap = {
      like: PointAction.POST_LIKED,
      comment: PointAction.POST_COMMENTED,
      friend_added: PointAction.FRIEND_ADDED
    }

    const action = actionMap[type]
    const result = await addPoints(userId, action)

    return result.pointsAdded
  } catch (error) {
    console.error('Error handling social interaction:', error)
    return 0
  }
}

/**
 * Obtener resumen de puntos disponibles para el usuario
 */
export async function getUserPointsSummary(userId: string): Promise<{
  totalPoints: number
  level: number
  nextLevelPoints: number
  badges: number
  streak: number
  referrals: number
}> {
  try {
    // Puntos y nivel
    const { data: pointsData } = await supabase
      .from('user_points')
      .select('total_points, level')
      .eq('user_id', userId)
      .single()

    // Badges
    const { count: badgesCount } = await supabase
      .from('user_badges')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    // Streak
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

    const currentLevel = pointsData?.level || 1
    const currentPoints = pointsData?.total_points || 0
    
    // Calcular puntos para próximo nivel
    const nextLevelPoints = (currentLevel + 1) * 100

    return {
      totalPoints: currentPoints,
      level: currentLevel,
      nextLevelPoints: nextLevelPoints - currentPoints,
      badges: badgesCount || 0,
      streak: streakData?.current_login_streak || 0,
      referrals: referralsCount || 0
    }
  } catch (error) {
    console.error('Error getting points summary:', error)
    return {
      totalPoints: 0,
      level: 1,
      nextLevelPoints: 100,
      badges: 0,
      streak: 0,
      referrals: 0
    }
  }
}

/**
 * Verificar si el usuario debería ver una notificación de incentivo
 */
export async function checkIncentiveNotifications(userId: string): Promise<{
  shouldShow: boolean
  type: 'streak_reminder' | 'badge_close' | 'referral_prompt' | null
  message: string
}> {
  try {
    const summary = await getUserPointsSummary(userId)

    // Recordatorio de streak (día 6)
    if (summary.streak === 6) {
      return {
        shouldShow: true,
        type: 'streak_reminder',
        message: '¡Mañana completas 7 días y ganas 50 puntos! 🔥'
      }
    }

    // Badge cerca de desbloquearse
    // TODO: Implementar lógica específica

    // Prompt de referidos si no ha invitado a nadie
    if (summary.referrals === 0 && summary.totalPoints > 100) {
      return {
        shouldShow: true,
        type: 'referral_prompt',
        message: 'Invita amigos y gana hasta 275 puntos por cada uno 🎁'
      }
    }

    return {
      shouldShow: false,
      type: null,
      message: ''
    }
  } catch (error) {
    console.error('Error checking notifications:', error)
    return {
      shouldShow: false,
      type: null,
      message: ''
    }
  }
}
