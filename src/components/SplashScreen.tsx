'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

interface SplashScreenProps {
  onComplete: () => void
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // Mostrar el splash screen por 1.5 segundos
    const timer = setTimeout(() => {
      setIsVisible(false)
      // Esperar a que termine la animación de fade out antes de llamar onComplete
      setTimeout(onComplete, 300)
    }, 1500)

    return () => clearTimeout(timer)
  }, [onComplete])

  if (!isVisible) return null

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-dark-primary flex items-center justify-center transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div className="relative w-96 h-96 animate-pulse">
        <Image
          src="/logo.png"
          alt="WhereTonight Logo"
          fill
          className="object-contain"
          priority
        />
      </div>
    </div>
  )
}
