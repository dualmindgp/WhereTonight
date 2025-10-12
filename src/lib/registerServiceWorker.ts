export function registerServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('✅ PWA: Service Worker registrado exitosamente')
        
        // Actualizar el service worker si hay una nueva versión
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('🔄 PWA: Nueva versión disponible. Recarga la página para actualizar.')
              }
            })
          }
        })
      })
      .catch((error) => {
        console.error('❌ PWA: Error al registrar Service Worker:', error)
      })
  })
}

export function unregisterServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return
  }

  navigator.serviceWorker.ready.then((registration) => {
    registration.unregister()
  })
}
