'use client'
import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: string
  message: string
  type: ToastType
  duration?: number
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType, duration?: number) => void
  success: (message: string) => void
  error: (message: string) => void
  warning: (message: string) => void
  info: (message: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const ICONS = {
  success: <CheckCircle2 className="w-4 h-4 flex-shrink-0" />,
  error:   <XCircle      className="w-4 h-4 flex-shrink-0" />,
  warning: <AlertTriangle className="w-4 h-4 flex-shrink-0" />,
  info:    <Info          className="w-4 h-4 flex-shrink-0" />,
}

const STYLES = {
  success: 'bg-green-500/15 border-green-500/30 text-green-400',
  error:   'bg-destructive/15 border-destructive/30 text-destructive',
  warning: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
  info:    'bg-blue-500/15 border-blue-500/30 text-blue-400',
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const show = setTimeout(() => setVisible(true), 10)
    const hide = setTimeout(() => { setVisible(false); setTimeout(() => onRemove(toast.id), 300) }, toast.duration ?? 3500)
    return () => { clearTimeout(show); clearTimeout(hide) }
  }, [toast, onRemove])

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-xl shadow-lg text-sm font-medium max-w-sm transition-all duration-300 ${STYLES[toast.type]} ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
      {ICONS[toast.type]}
      <span className="flex-1">{toast.message}</span>
      <button onClick={() => { setVisible(false); setTimeout(() => onRemove(toast.id), 300) }} className="opacity-60 hover:opacity-100 transition-opacity ml-1">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const remove = useCallback((id: string) => setToasts(t => t.filter(x => x.id !== id)), [])

  const toast = useCallback((message: string, type: ToastType = 'info', duration?: number) => {
    const id = Math.random().toString(36).slice(2)
    setToasts(t => [...t.slice(-4), { id, message, type, duration }])
  }, [])

  const success = useCallback((m: string) => toast(m, 'success'), [toast])
  const error   = useCallback((m: string) => toast(m, 'error'),   [toast])
  const warning = useCallback((m: string) => toast(m, 'warning'), [toast])
  const info    = useCallback((m: string) => toast(m, 'info'),    [toast])

  return (
    <ToastContext.Provider value={{ toast, success, error, warning, info }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem toast={t} onRemove={remove} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToastNotify() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToastNotify must be used inside ToastProvider')
  return ctx
}
