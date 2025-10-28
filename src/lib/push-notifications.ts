import { PushNotifications, Token, PushNotificationSchema, ActionPerformed } from '@capacitor/push-notifications'

/**
 * Verificar si estamos en plataforma nativa
 */
function isNativePlatform(): boolean {
  if (typeof window === 'undefined') return false
  return !!(window as any).Capacitor?.isNativePlatform?.()
}

/**
 * Inicializar notificaciones push
 */
export async function initPushNotifications(): Promise<void> {
  if (!isNativePlatform()) {
    console.log('Push notifications only work on native platforms')
    return
  }

  try {
    // Solicitar permisos
    let permStatus = await PushNotifications.checkPermissions()

    if (permStatus.receive === 'prompt') {
      permStatus = await PushNotifications.requestPermissions()
    }

    if (permStatus.receive !== 'granted') {
      console.log('User denied permissions for push notifications')
      return
    }

    // Registrar para recibir notificaciones
    await PushNotifications.register()

    console.log('Push notifications initialized successfully')
  } catch (error) {
    console.error('Error initializing push notifications:', error)
  }
}

/**
 * Configurar listeners de notificaciones push
 */
export function setupPushNotificationListeners(
  onToken: (token: string) => void,
  onNotification: (notification: PushNotificationSchema) => void,
  onAction: (action: ActionPerformed) => void
): void {
  if (!isNativePlatform()) return

  // Listener para cuando se registra y obtiene el token
  PushNotifications.addListener('registration', (token: Token) => {
    console.log('Push registration success, token:', token.value)
    onToken(token.value)
  })

  // Listener para errores de registro
  PushNotifications.addListener('registrationError', (error: any) => {
    console.error('Error on registration:', error)
  })

  // Listener para cuando llega una notificación (app en foreground)
  PushNotifications.addListener(
    'pushNotificationReceived',
    (notification: PushNotificationSchema) => {
      console.log('Push notification received:', notification)
      onNotification(notification)
    }
  )

  // Listener para cuando el usuario toca una notificación
  PushNotifications.addListener(
    'pushNotificationActionPerformed',
    (action: ActionPerformed) => {
      console.log('Push notification action performed:', action)
      onAction(action)
    }
  )
}

/**
 * Remover todos los listeners
 */
export async function removePushNotificationListeners(): Promise<void> {
  if (!isNativePlatform()) return
  await PushNotifications.removeAllListeners()
}

/**
 * Obtener las notificaciones entregadas
 */
export async function getDeliveredNotifications() {
  if (!isNativePlatform()) return []
  
  const notificationList = await PushNotifications.getDeliveredNotifications()
  return notificationList.notifications
}

/**
 * Eliminar todas las notificaciones entregadas
 */
export async function removeAllDeliveredNotifications(): Promise<void> {
  if (!isNativePlatform()) return
  await PushNotifications.removeAllDeliveredNotifications()
}

/**
 * Guardar token en Supabase (para enviar notificaciones después)
 */
export async function savePushToken(userId: string, token: string, supabase: any): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('push_tokens')
      .upsert({
        user_id: userId,
        token: token,
        platform: 'android', // o 'ios' dependiendo del dispositivo
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,platform'
      })

    if (error) {
      console.error('Error saving push token:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error saving push token:', error)
    return false
  }
}
