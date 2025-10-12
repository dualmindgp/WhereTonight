'use client'

import { useEffect, useRef } from 'react'

interface SwipeOptions {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  threshold?: number
}

/**
 * Hook para detectar gestos de swipe en dispositivos táctiles
 */
export default function useSwipe(
  elementRef: React.RefObject<HTMLElement>, 
  options: SwipeOptions
) {
  const touchStartX = useRef<number | null>(null)
  const touchStartY = useRef<number | null>(null)
  
  useEffect(() => {
    const element = elementRef.current
    if (!element) return
    
    const threshold = options.threshold || 80 // píxeles
    
    const handleTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0].clientX
      touchStartY.current = e.touches[0].clientY
    }
    
    const handleTouchEnd = (e: TouchEvent) => {
      if (touchStartX.current === null || touchStartY.current === null) {
        return
      }
      
      const touchEndX = e.changedTouches[0].clientX
      const touchEndY = e.changedTouches[0].clientY
      
      const deltaX = touchEndX - touchStartX.current
      const deltaY = touchEndY - touchStartY.current
      
      // Determinar si fue un swipe horizontal o vertical
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Swipe horizontal
        if (Math.abs(deltaX) > threshold) {
          if (deltaX > 0 && options.onSwipeRight) {
            options.onSwipeRight()
          } else if (deltaX < 0 && options.onSwipeLeft) {
            options.onSwipeLeft()
          }
        }
      } else {
        // Swipe vertical
        if (Math.abs(deltaY) > threshold) {
          if (deltaY > 0 && options.onSwipeDown) {
            options.onSwipeDown()
          } else if (deltaY < 0 && options.onSwipeUp) {
            options.onSwipeUp()
          }
        }
      }
      
      touchStartX.current = null
      touchStartY.current = null
    }
    
    element.addEventListener('touchstart', handleTouchStart)
    element.addEventListener('touchend', handleTouchEnd)
    
    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchend', handleTouchEnd)
    }
  }, [elementRef, options])
}
