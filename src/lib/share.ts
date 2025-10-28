import { Share } from '@capacitor/share'

export interface ShareVenueOptions {
  venueName: string
  venueType?: string
  address?: string
  url?: string
}

export interface ShareEventOptions {
  eventName: string
  venueName?: string
  date?: string
  url?: string
}

/**
 * Verificar si estamos en plataforma nativa
 */
function isNativePlatform(): boolean {
  if (typeof window === 'undefined') return false
  return !!(window as any).Capacitor?.isNativePlatform?.()
}

/**
 * Compartir un venue en redes sociales
 */
export async function shareVenue(options: ShareVenueOptions): Promise<boolean> {
  try {
    const { venueName, venueType, address, url } = options
    
    // Construir el texto a compartir
    let text = `🎉 ¡Mira este lugar en WhereTonight!\n\n`
    text += `📍 ${venueName}`
    
    if (venueType) {
      text += ` (${venueType})`
    }
    
    if (address) {
      text += `\n📌 ${address}`
    }
    
    text += `\n\n¿Te apuntas? 🍻`
    
    // Compartir
    if (isNativePlatform()) {
      // En móvil, usar el plugin nativo de Share
      await Share.share({
        title: venueName,
        text: text,
        url: url || 'https://wheretonight.app',
        dialogTitle: 'Compartir en...'
      })
    } else {
      // En web, usar Web Share API si está disponible
      if (navigator.share) {
        await navigator.share({
          title: venueName,
          text: text,
          url: url || window.location.href
        })
      } else {
        // Fallback: copiar al portapapeles
        await navigator.clipboard.writeText(text + '\n' + (url || window.location.href))
        alert('¡Enlace copiado al portapapeles!')
      }
    }
    
    return true
  } catch (error: any) {
    // Usuario canceló o error
    if (error?.message !== 'Share canceled') {
      console.error('Error sharing venue:', error)
    }
    return false
  }
}

/**
 * Compartir un evento en redes sociales
 */
export async function shareEvent(options: ShareEventOptions): Promise<boolean> {
  try {
    const { eventName, venueName, date, url } = options
    
    // Construir el texto a compartir
    let text = `🎊 ¡Evento en WhereTonight!\n\n`
    text += `🎵 ${eventName}`
    
    if (venueName) {
      text += `\n📍 ${venueName}`
    }
    
    if (date) {
      text += `\n📅 ${date}`
    }
    
    text += `\n\n¡No te lo pierdas! 🚀`
    
    // Compartir
    if (isNativePlatform()) {
      await Share.share({
        title: eventName,
        text: text,
        url: url || 'https://wheretonight.app',
        dialogTitle: 'Compartir evento'
      })
    } else {
      if (navigator.share) {
        await navigator.share({
          title: eventName,
          text: text,
          url: url || window.location.href
        })
      } else {
        await navigator.clipboard.writeText(text + '\n' + (url || window.location.href))
        alert('¡Enlace copiado al portapapeles!')
      }
    }
    
    return true
  } catch (error: any) {
    if (error?.message !== 'Share canceled') {
      console.error('Error sharing event:', error)
    }
    return false
  }
}

/**
 * Compartir texto genérico
 */
export async function shareText(text: string, title?: string): Promise<boolean> {
  try {
    if (isNativePlatform()) {
      await Share.share({
        title: title || 'WhereTonight',
        text: text,
        dialogTitle: 'Compartir'
      })
    } else {
      if (navigator.share) {
        await navigator.share({
          title: title || 'WhereTonight',
          text: text
        })
      } else {
        await navigator.clipboard.writeText(text)
        alert('¡Texto copiado al portapapeles!')
      }
    }
    
    return true
  } catch (error: any) {
    if (error?.message !== 'Share canceled') {
      console.error('Error sharing text:', error)
    }
    return false
  }
}

/**
 * Verificar si el dispositivo soporta sharing nativo
 */
export function canShare(): boolean {
  if (typeof window === 'undefined') return false
  if (isNativePlatform()) return true
  return 'share' in navigator || 'clipboard' in navigator
}
