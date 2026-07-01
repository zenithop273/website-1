'use client'
import { Sun, Moon } from 'lucide-react'
import { useThemeMode } from './ThemeProvider'

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { mode, toggle } = useThemeMode()
  return (
    <button
      onClick={toggle}
      title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`w-9 h-9 rounded-xl flex items-center justify-center border border-border/60
        bg-secondary/60 hover:bg-secondary transition-all text-muted-foreground hover:text-foreground ${className}`}
    >
      {mode === 'dark'
        ? <Sun  className="w-4 h-4" />
        : <Moon className="w-4 h-4" />
      }
    </button>
  )
}
