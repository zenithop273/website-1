'use client'
import { useEffect, useRef, useState } from 'react'
import { X, Download, Copy, Check, QrCode } from 'lucide-react'

interface QRModalProps {
  url: string
  username: string
  onClose: () => void
}

export function QRModal({ url, username, onClose }: QRModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [copied, setCopied] = useState(false)
  const [qrReady, setQrReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function generate() {
      try {
        const QRCode = (await import('qrcode')).default
        if (cancelled || !canvasRef.current) return
        await QRCode.toCanvas(canvasRef.current, url, {
          width: 260,
          margin: 2,
          color: { dark: '#1e1b4b', light: '#ffffff' },
          errorCorrectionLevel: 'H',
        })
        if (!cancelled) setQrReady(true)
      } catch (e) {
        console.error('QR generation failed', e)
      }
    }
    generate()
    return () => { cancelled = true }
  }, [url])

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `linknest-${username}-qr.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Close on backdrop click
  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={handleBackdrop}
    >
      <div className="w-full max-w-sm bg-card border border-border/60 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center">
              <QrCode className="w-4 h-4 text-primary" />
            </div>
            <span className="font-semibold text-sm">QR Code</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-secondary/60 text-muted-foreground hover:text-foreground transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* QR canvas */}
        <div className="flex flex-col items-center gap-4 px-6 py-6">
          <div className="relative">
            {!qrReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-white rounded-xl">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            <canvas
              ref={canvasRef}
              className="rounded-xl shadow-lg"
              style={{ opacity: qrReady ? 1 : 0, transition: 'opacity 0.3s' }}
            />
          </div>

          <div className="text-center">
            <p className="font-bold text-base">@{username}</p>
            <p className="text-xs text-muted-foreground mt-0.5 break-all">{url}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={handleCopyUrl}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border/60 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all"
          >
            {copied
              ? <><Check className="w-4 h-4 text-green-400" />Copied!</>
              : <><Copy className="w-4 h-4" />Copy URL</>
            }
          </button>
          <button
            onClick={handleDownload}
            disabled={!qrReady}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-indigo-500/20"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
        </div>
      </div>
    </div>
  )
}
