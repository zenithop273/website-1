'use client'
import { Component, type ReactNode } from 'react'
import Link from 'next/link'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

interface Props { children: ReactNode; fallback?: ReactNode }
interface State { hasError: boolean; error?: Error }

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error) {
    console.error('[ErrorBoundary]', error)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
            <p className="text-muted-foreground text-sm mb-2 leading-relaxed">
              An unexpected error occurred. Our team has been notified.
            </p>
            {this.state.error && (
              <p className="text-xs text-muted-foreground/60 font-mono bg-secondary/40 rounded-lg px-3 py-2 mb-6 text-left break-all">
                {this.state.error.message}
              </p>
            )}
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => this.setState({ hasError: false, error: undefined })}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-all"
              >
                <RefreshCw className="w-4 h-4" /> Try Again
              </button>
              <Link href="/" className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border/60 text-muted-foreground hover:text-foreground text-sm hover:bg-secondary/50 transition-all">
                <Home className="w-4 h-4" /> Go Home
              </Link>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
