'use client'

import React from 'react'

interface ActionButtonProps {
  label: string
  onClick: () => void
  icon?: React.ReactNode
}

export default function ActionButton({ label, onClick, icon }: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className="bg-dark-primary border-2 border-neon-cyan rounded-full px-5 py-3 text-neon-cyan shadow-neon-cyan text-center font-medium transition-all duration-300 hover:bg-neon-cyan/20"
    >
      <div className="flex items-center justify-center space-x-2">
        {icon && icon}
        <span>{label}</span>
      </div>
    </button>
  )
}
