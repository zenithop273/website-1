'use client'

interface Props { password: string }

function getStrength(p: string): { score: number; label: string; color: string } {
  if (!p) return { score: 0, label: '', color: '' }
  let score = 0
  if (p.length >= 6)  score++
  if (p.length >= 10) score++
  if (/[A-Z]/.test(p)) score++
  if (/[0-9]/.test(p)) score++
  if (/[^A-Za-z0-9]/.test(p)) score++

  if (score <= 1) return { score, label: 'Weak',   color: 'bg-red-500' }
  if (score <= 2) return { score, label: 'Fair',   color: 'bg-amber-500' }
  if (score <= 3) return { score, label: 'Good',   color: 'bg-yellow-400' }
  if (score <= 4) return { score, label: 'Strong', color: 'bg-green-500' }
  return { score, label: 'Very Strong', color: 'bg-emerald-500' }
}

export function PasswordStrength({ password }: Props) {
  if (!password) return null
  const { score, label, color } = getStrength(password)
  const pct = Math.min((score / 5) * 100, 100)

  return (
    <div className="mt-1.5 space-y-1">
      <div className="h-1.5 w-full bg-secondary/60 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className={`text-xs font-medium ${
        score <= 1 ? 'text-red-400' :
        score <= 2 ? 'text-amber-400' :
        score <= 3 ? 'text-yellow-400' :
        'text-green-400'
      }`}>
        {label}
        {score <= 2 && password && (
          <span className="text-muted-foreground font-normal ml-1">
            — try adding uppercase, numbers or symbols
          </span>
        )}
      </p>
    </div>
  )
}
