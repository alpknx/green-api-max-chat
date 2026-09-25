import { beforeEach, describe, expect, it } from 'vitest'
import { clearCredentials, loadCredentials, saveCredentials } from './credentials'

beforeEach(() => {
  sessionStorage.clear()
})

describe('credentials storage', () => {
  it('returns null when nothing stored', () => {
    expect(loadCredentials()).toBeNull()
  })

  it('round-trips saved credentials', () => {
    saveCredentials({ idInstance: '1', apiTokenInstance: 'tok' })
    expect(loadCredentials()).toEqual({ idInstance: '1', apiTokenInstance: 'tok' })
  })

  it('clears credentials', () => {
    saveCredentials({ idInstance: '1', apiTokenInstance: 'tok' })
    clearCredentials()
    expect(loadCredentials()).toBeNull()
  })

  it('returns null on corrupted storage', () => {
    sessionStorage.setItem('green-api-max-chat:credentials', 'not-json')
    expect(loadCredentials()).toBeNull()
  })
})
