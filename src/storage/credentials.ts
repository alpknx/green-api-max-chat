import type { GreenApiCredentials } from '../api/greenApi'

const KEY = 'green-api-max-chat:credentials'

export function saveCredentials(creds: GreenApiCredentials): void {
  sessionStorage.setItem(KEY, JSON.stringify(creds))
}

export function loadCredentials(): GreenApiCredentials | null {
  const raw = sessionStorage.getItem(KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as GreenApiCredentials
  } catch {
    return null
  }
}

export function clearCredentials(): void {
  sessionStorage.removeItem(KEY)
}
