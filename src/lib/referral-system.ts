import { supabase } from './supabase'
import { addPoints, PointAction } from './points-system'

/**
 * Sistema de Referidos - Gestión de códigos de invitación y recompensas
 */

export interface ReferralCode {
  id: string
  user_id: string
  code: string
  uses_count: number
  max_uses: number | null
  expires_at: string | null
  is_active: boolean
  created_at: string
}

export interface Referral {
  id: string
  referrer_id: string
  referred_id: string
  referral_code: string
  referrer_rewarded: boolean
  referred_rewarded: boolean
  referrer_reward_points: number
  referred_reward_points: number
  created_at: string
}

/**
 * Obtener código de referido del usuario
 */
export async function getUserReferralCode(userId: string): Promise<ReferralCode | null> {
  try {
    const { data, error } = await supabase
      .from('referral_codes')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      console.error('Error fetching referral code:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error in getUserReferralCode:', error)
    return null
  }
}

/**
 * Verificar si un código de referido es válido
 */
export async function validateReferralCode(code: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('referral_codes')
      .select('*')
      .eq('code', code)
      .eq('is_active', true)
      .single()

    if (error || !data) {
      return false
    }

    // Verificar expiración
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return false
    }

    // Verificar límite de usos
    if (data.max_uses && data.uses_count >= data.max_uses) {
      return false
    }

    return true
  } catch (error) {
    console.error('Error validating referral code:', error)
    return false
  }
}

/**
 * Aplicar código de referido al registrarse
 */
export async function applyReferralCode(
  userId: string,
  referralCode: string
): Promise<{ success: boolean; message: string }> {
  try {
    // Llamar a la función de Supabase que procesa el referido
    const { data, error } = await supabase.rpc('process_referral', {
      p_referred_id: userId,
      p_referral_code: referralCode
    })

    if (error) {
      console.error('Error processing referral:', error)
      return { 
        success: false, 
        message: 'Código de referido inválido o expirado' 
      }
    }

    if (!data) {
      return { 
        success: false, 
        message: 'No se pudo aplicar el código de referido' 
      }
    }

    return { 
      success: true, 
      message: '¡50 puntos de bienvenida! 🎉' 
    }
  } catch (error) {
    console.error('Error in applyReferralCode:', error)
    return { 
      success: false, 
      message: 'Error al procesar el código' 
    }
  }
}

/**
 * Obtener estadísticas de referidos del usuario
 */
export async function getReferralStats(userId: string): Promise<{
  totalReferrals: number
  activeReferrals: number
  totalPointsEarned: number
  referrals: Referral[]
}> {
  try {
    const { data, error } = await supabase
      .from('referrals')
      .select('*')
      .eq('referrer_id', userId)

    if (error) {
      console.error('Error fetching referral stats:', error)
      return {
        totalReferrals: 0,
        activeReferrals: 0,
        totalPointsEarned: 0,
        referrals: []
      }
    }

    const referrals = data || []
    const totalPointsEarned = referrals.reduce(
      (sum, ref) => sum + ref.referrer_reward_points, 
      0
    )

    return {
      totalReferrals: referrals.length,
      activeReferrals: referrals.filter(r => r.referrer_rewarded).length,
      totalPointsEarned,
      referrals
    }
  } catch (error) {
    console.error('Error in getReferralStats:', error)
    return {
      totalReferrals: 0,
      activeReferrals: 0,
      totalPointsEarned: 0,
      referrals: []
    }
  }
}

/**
 * Recompensar al referrer cuando el referido completa un milestone
 */
export async function rewardReferrerMilestone(
  userId: string,
  milestone: 'completed_profile' | 'first_story' | 'first_ticket'
): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('reward_referrer', {
      p_referred_id: userId,
      p_milestone: milestone
    })

    if (error) {
      console.error('Error rewarding referrer:', error)
      return false
    }

    return data || false
  } catch (error) {
    console.error('Error in rewardReferrerMilestone:', error)
    return false
  }
}

/**
 * Compartir código de referido
 */
export async function shareReferralCode(code: string): Promise<string> {
  const appName = 'WhereTonight'
  const message = `¡Únete a ${appName} con mi código ${code} y gana 50 puntos! 🎉\n\nDescarga la app: https://wheretonight.app/invite?code=${code}`
  
  // En web, copiar al portapapeles
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(message)
      return 'Código copiado al portapapeles'
    } catch (error) {
      console.error('Error copying to clipboard:', error)
    }
  }
  
  return message
}

/**
 * Generar link de invitación
 */
export function generateInviteLink(code: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://wheretonight.app'
  return `${baseUrl}/invite?code=${code}`
}

/**
 * Obtener top referrers (leaderboard de referidos)
 */
export async function getTopReferrers(limit: number = 10): Promise<Array<{
  user_id: string
  username: string
  avatar_url: string
  referral_count: number
  total_points_earned: number
}>> {
  try {
    const { data, error } = await supabase
      .from('referrals')
      .select(`
        referrer_id,
        referrer_reward_points
      `)

    if (error) {
      console.error('Error fetching top referrers:', error)
      return []
    }

    // Agrupar por referrer
    const referrerMap = new Map<string, { count: number; points: number }>()
    
    data?.forEach(ref => {
      const current = referrerMap.get(ref.referrer_id) || { count: 0, points: 0 }
      referrerMap.set(ref.referrer_id, {
        count: current.count + 1,
        points: current.points + ref.referrer_reward_points
      })
    })

    // Convertir a array y ordenar
    const sortedReferrers = Array.from(referrerMap.entries())
      .map(([user_id, stats]) => ({
        user_id,
        referral_count: stats.count,
        total_points_earned: stats.points
      }))
      .sort((a, b) => b.referral_count - a.referral_count)
      .slice(0, limit)

    // Obtener info de usuarios
    const userIds = sortedReferrers.map(r => r.user_id)
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, username, avatar_url')
      .in('id', userIds)

    // Combinar datos
    const profileMap = new Map(profiles?.map(p => [p.id, p]) || [])
    
    return sortedReferrers.map(ref => ({
      user_id: ref.user_id,
      username: profileMap.get(ref.user_id)?.username || 'Usuario',
      avatar_url: profileMap.get(ref.user_id)?.avatar_url || '',
      referral_count: ref.referral_count,
      total_points_earned: ref.total_points_earned
    }))
  } catch (error) {
    console.error('Error in getTopReferrers:', error)
    return []
  }
}
