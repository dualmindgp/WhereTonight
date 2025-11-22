'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, TrendingUp, Gift, Sparkles } from 'lucide-react'

interface PointsRewardNotificationProps {
  points: number
  message: string
  show: boolean
  onClose: () => void
  type?: 'default' | 'badge' | 'streak' | 'referral'
}

export default function PointsRewardNotification({
  points,
  message,
  show,
  onClose,
  type = 'default'
}: PointsRewardNotificationProps) {
  const [localShow, setLocalShow] = useState(show)

  useEffect(() => {
    setLocalShow(show)
    if (show) {
      const timer = setTimeout(() => {
        setLocalShow(false)
        setTimeout(onClose, 300)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [show, onClose])

  const iconMap = {
    default: Star,
    badge: Gift,
    streak: TrendingUp,
    referral: Sparkles
  }

  const Icon = iconMap[type]

  const gradients = {
    default: 'from-yellow-500 to-orange-500',
    badge: 'from-purple-500 to-pink-500',
    streak: 'from-red-500 to-orange-500',
    referral: 'from-blue-500 to-cyan-500'
  }

  return (
    <AnimatePresence>
      {localShow && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999]"
        >
          <div className={`bg-gradient-to-r ${gradients[type]} p-[2px] rounded-2xl shadow-2xl`}>
            <div className="bg-dark-primary rounded-2xl px-6 py-4 flex items-center gap-4">
              {/* Icon */}
              <motion.div
                initial={{ rotate: -180, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className={`p-3 bg-gradient-to-br ${gradients[type]} rounded-xl`}
              >
                <Icon className="w-6 h-6 text-white" />
              </motion.div>

              {/* Content */}
              <div>
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-white font-medium"
                >
                  {message}
                </motion.p>
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4, type: 'spring' }}
                  className="flex items-center gap-1 mt-1"
                >
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-yellow-400 font-bold text-lg">
                    +{points}
                  </span>
                  <span className="text-gray-400 text-sm">puntos</span>
                </motion.div>
              </div>

              {/* Sparkles */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-2 -right-2"
              >
                <Sparkles className="w-5 h-5 text-yellow-400" />
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Hook para usar las notificaciones fácilmente
export function usePointsNotification() {
  const [notification, setNotification] = useState<{
    points: number
    message: string
    show: boolean
    type: 'default' | 'badge' | 'streak' | 'referral'
  }>({
    points: 0,
    message: '',
    show: false,
    type: 'default'
  })

  const showNotification = (
    points: number, 
    message: string, 
    type: 'default' | 'badge' | 'streak' | 'referral' = 'default'
  ) => {
    setNotification({ points, message, show: true, type })
  }

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, show: false }))
  }

  return {
    notification,
    showNotification,
    hideNotification
  }
}
