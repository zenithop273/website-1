// Auth utilities using Web Crypto API (no bcrypt - works in Cloudflare Workers)

const JWT_SECRET = process.env.JWT_SECRET || 'linknest_fallback_secret'

// Password hashing with PBKDF2
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  )
  const derivedBits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    256
  )
  const hashArray = Array.from(new Uint8Array(derivedBits))
  const saltArray = Array.from(salt)
  const combined = [...saltArray, ...hashArray]
  return btoa(String.fromCharCode(...combined))
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  try {
    const encoder = new TextEncoder()
    const combined = Uint8Array.from(atob(storedHash), c => c.charCodeAt(0))
    const salt = combined.slice(0, 16)
    const storedDerived = combined.slice(16)
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveBits']
    )
    const derivedBits = await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
      keyMaterial,
      256
    )
    const newDerived = new Uint8Array(derivedBits)
    if (newDerived.length !== storedDerived.length) return false
    let diff = 0
    for (let i = 0; i < newDerived.length; i++) {
      diff |= newDerived[i] ^ storedDerived[i]
    }
    return diff === 0
  } catch {
    return false
  }
}

// Simple JWT implementation using Web Crypto
async function getKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(JWT_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  )
}

function base64urlEncode(data: string): string {
  return btoa(data).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

function base64urlDecode(data: string): string {
  const padded = data.replace(/-/g, '+').replace(/_/g, '/') + '=='.slice((data.length % 4 || 4) - 2)
  return atob(padded)
}

export interface JWTPayload {
  userId: string
  email: string
  username: string
  iat?: number
  exp?: number
}

export async function signJWT(payload: JWTPayload): Promise<string> {
  const header = base64urlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const now = Math.floor(Date.now() / 1000)
  const body = base64urlEncode(JSON.stringify({ ...payload, iat: now, exp: now + 7 * 24 * 3600 }))
  const key = await getKey()
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(`${header}.${body}`)
  )
  const sigBase64 = base64urlEncode(String.fromCharCode(...new Uint8Array(signature)))
  return `${header}.${body}.${sigBase64}`
}

export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const [header, body, sig] = parts
    const key = await getKey()
    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      Uint8Array.from(base64urlDecode(sig), c => c.charCodeAt(0)),
      new TextEncoder().encode(`${header}.${body}`)
    )
    if (!valid) return null
    const payload = JSON.parse(base64urlDecode(body)) as JWTPayload
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null
    return payload
  } catch {
    return null
  }
}

export function getTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null
  return authHeader.slice(7)
}
