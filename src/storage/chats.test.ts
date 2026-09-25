import { beforeEach, describe, expect, it } from 'vitest'
import {
  addMessage,
  createChat,
  loadChats,
  markMessageFailed,
  phoneToChatId,
  saveChats,
  type ChatsState,
} from './chats'

beforeEach(() => {
  localStorage.clear()
})

describe('phoneToChatId', () => {
  it('strips non-digits and appends @c.us', () => {
    expect(phoneToChatId('+7 900 123-45-67')).toBe('79001234567@c.us')
  })
})

describe('createChat', () => {
  it('adds a new chat keyed by chatId', () => {
    const state = createChat({}, '79001234567')
    expect(state['79001234567@c.us']).toEqual({
      id: '79001234567@c.us',
      phoneNumber: '79001234567',
      messages: [],
    })
  })

  it('is idempotent for an existing chat', () => {
    const first = createChat({}, '79001234567')
    const second = createChat(first, '79001234567')
    expect(second).toBe(first)
  })
})

describe('addMessage', () => {
  it('appends a message to an existing chat', () => {
    const withChat = createChat({}, '79001234567')
    const message = { id: 'm1', direction: 'out' as const, text: 'hi', timestamp: 1 }
    const result = addMessage(withChat, '79001234567@c.us', message)
    expect(result['79001234567@c.us'].messages).toEqual([message])
  })

  it('creates the chat if a message arrives for an unknown chatId', () => {
    const message = { id: 'm1', direction: 'in' as const, text: 'hi', timestamp: 1 }
    const result = addMessage({}, '79001234567@c.us', message)
    expect(result['79001234567@c.us'].messages).toEqual([message])
    expect(result['79001234567@c.us'].phoneNumber).toBe('79001234567')
  })

  it('does not duplicate a message with the same id', () => {
    const message = { id: 'm1', direction: 'out' as const, text: 'hi', timestamp: 1 }
    const once = addMessage({}, '79001234567@c.us', message)
    const twice = addMessage(once, '79001234567@c.us', message)
    expect(twice['79001234567@c.us'].messages).toHaveLength(1)
  })
})

describe('markMessageFailed', () => {
  it('sets failed=true on the matching message only', () => {
    let state: ChatsState = createChat({}, '1')
    state = addMessage(state, '1@c.us', { id: 'm1', direction: 'out', text: 'a', timestamp: 1 })
    state = addMessage(state, '1@c.us', { id: 'm2', direction: 'out', text: 'b', timestamp: 2 })
    const result = markMessageFailed(state, '1@c.us', 'm1')
    expect(result['1@c.us'].messages[0].failed).toBe(true)
    expect(result['1@c.us'].messages[1].failed).toBeUndefined()
  })
})

describe('loadChats / saveChats', () => {
  it('returns empty object when nothing stored', () => {
    expect(loadChats('123')).toEqual({})
  })

  it('round-trips state per idInstance', () => {
    const state = createChat({}, '79001234567')
    saveChats('123', state)
    expect(loadChats('123')).toEqual(state)
    expect(loadChats('456')).toEqual({})
  })
})
