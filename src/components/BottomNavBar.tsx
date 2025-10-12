'use client'

import React from 'react'
import { Home, Search, User, MessageCircle } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

interface BottomNavBarProps {
  activeTab: string
  onChangeTab: (tab: string) => void
}

export default function BottomNavBar({ activeTab, onChangeTab }: BottomNavBarProps) {
  const { t } = useLanguage()
  
  const navItems = [
    { id: 'home', label: t('common.home'), icon: <Home /> },
    { id: 'search', label: t('common.search'), icon: <Search /> },
    { id: 'social', label: t('common.social'), icon: <MessageCircle /> },
    { id: 'profile', label: t('common.profile'), icon: <User /> },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-dark-primary border-t border-neon-blue/20 z-50">
      <div className="flex justify-around items-center">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onChangeTab(item.id)}
            className={`flex flex-col items-center justify-center py-3 px-3 flex-1 ${
              activeTab === item.id
                ? 'text-neon-cyan glow-text-cyan'
                : 'text-text-secondary'
            }`}
          >
            <div className={`w-6 h-6 mb-1 ${activeTab === item.id ? 'text-neon-cyan' : 'text-text-secondary'}`}>
              {item.icon}
            </div>
            <span className="text-xs">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
