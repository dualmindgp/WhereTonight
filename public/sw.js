// Service Worker para WhereTonight PWA
const CACHE_NAME = 'wheretonight-v1'
const OFFLINE_URL = '/offline.html'

// Recursos que queremos cachear inmediatamente
const PRECACHE_URLS = [
  '/',
  '/manifest.json',
]

// Instalación: cachear recursos básicos
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS)
    })
  )
  self.skipWaiting()
})

// Activación: limpiar caches antiguos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  self.clients.claim()
})

// Fetch: estrategia Network First con cache fallback
self.addEventListener('fetch', (event) => {
  // Solo cachear peticiones GET
  if (event.request.method !== 'GET') {
    return
  }

  // Ignorar peticiones a Chrome extensions y Supabase auth
  if (
    event.request.url.startsWith('chrome-extension://') ||
    event.request.url.includes('supabase.co/auth')
  ) {
    return
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Si la respuesta es válida, cachearla
        if (response && response.status === 200) {
          const responseToCache = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache)
          })
        }
        return response
      })
      .catch(() => {
        // Si falla la red, intentar desde cache
        return caches.match(event.request).then((response) => {
          if (response) {
            return response
          }
          
          // Si es una navegación y no hay cache, mostrar página offline
          if (event.request.mode === 'navigate') {
            return caches.match(OFFLINE_URL)
          }
        })
      })
  )
})
