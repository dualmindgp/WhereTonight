'use client'

import { MapPin, List } from 'lucide-react'

interface MobileTabNavProps {
  activeTab: 'map' | 'list'
  onTabChange: (tab: 'map' | 'list') => void
  venuesCount: number
}

export default function MobileTabNav({ activeTab, onTabChange, venuesCount }: MobileTabNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex z-10 lg:hidden">
      <button
        onClick={() => onTabChange('map')}
        className={`flex-1 py-3 flex flex-col items-center justify-center ${
          activeTab === 'map' ? 'text-blue-600' : 'text-gray-500'
        }`}
      >
        <MapPin className={`w-6 h-6 ${activeTab === 'map' ? 'text-blue-600' : 'text-gray-500'}`} />
        <span className="text-xs mt-1">Mapa</span>
      </button>
      
      <button
        onClick={() => onTabChange('list')}
        className={`flex-1 py-3 flex flex-col items-center justify-center relative ${
          activeTab === 'list' ? 'text-blue-600' : 'text-gray-500'
        }`}
      >
        <List className={`w-6 h-6 ${activeTab === 'list' ? 'text-blue-600' : 'text-gray-500'}`} />
        <span className="text-xs mt-1">Locales</span>
        
        {venuesCount > 0 && (
          <div className="absolute top-2 right-1/3 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {venuesCount > 99 ? '99+' : venuesCount}
          </div>
        )}
      </button>
    </div>
  )
}
