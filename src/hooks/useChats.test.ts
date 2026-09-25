import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useChats } from './useChats'

const creds = { idInstance: '1', apiTokenInstance: 'tok' }

beforeEach(() => {
  localStorage.clear()
  vi.useFakeTimers({ shouldAdvanceTime: true })
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

function mockFetchSequence(responses: Array<() => Promise<unknown> | unknown>) {
  let call = 0
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => {
      const handler = responses[Math.min(call, responses.length - 1)]
      call += 1
      return handler()
    })
  )
}

describe('useChats', () => {
  it('startChat creates a chat immediately', () => {
    mockFetchSequence([() => ({ ok: true, text: async () => '' })])
    const { result } = renderHook(() => useChats(creds))

    act(() => {
      result.current.startChat('79001234567')
    })

    expect(result.current.chats['79001234567@c.us']).toBeDefined()
  })

  it('sendMessage optimistically adds the message then confirms via API', async () => {
    mockFetchSequence([
      () => ({ ok: true, text: async () => '' }), // initial poll
      () => ({ ok: true, json: async () => ({ idMessage: 'm1' }) }), // sendMessage
    ])
    const { result } = renderHook(() => useChats(creds))

    act(() => {
      result.current.startChat('79001234567')
    })

    await act(async () => {
      await result.current.sendMessage('79001234567@c.us', 'hello')
    })

    expect(result.current.chats['79001234567@c.us'].messages).toHaveLength(1)
    expect(result.current.chats['79001234567@c.us'].messages[0]).toMatchObject({
      direction: 'out',
      text: 'hello',
    })
    expect(result.current.chats['79001234567@c.us'].messages[0].failed).toBeUndefined()
  })

  it('marks a message failed when sendMessage rejects', async () => {
    mockFetchSequence([
      () => ({ ok: true, text: async () => '' }),
      () => ({ ok: false, status: 500 }),
    ])
    const { result } = renderHook(() => useChats(creds))

    act(() => {
      result.current.startChat('79001234567')
    })

    await act(async () => {
      await result.current.sendMessage('79001234567@c.us', 'hello')
    })

    expect(result.current.chats['79001234567@c.us'].messages[0].failed).toBe(true)
  })

  it('polling appends an incoming message and deletes the notification', async () => {
    const fetchMock = vi.fn()
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        text: async () =>
          JSON.stringify({
            receiptId: 7,
            body: {
              typeWebhook: 'incomingMessageReceived',
              timestamp: 123,
              senderData: { chatId: '79001234567@c.us', senderName: 'Bob' },
              messageData: {
                typeMessage: 'textMessage',
                textMessageData: { textMessage: 'yo' },
              },
            },
          }),
      })
      .mockResolvedValueOnce({ ok: true }) // deleteNotification
      .mockResolvedValue({ ok: true, text: async () => '' }) // subsequent polls
    vi.stubGlobal('fetch', fetchMock)

    const { result } = renderHook(() => useChats(creds))

    await waitFor(() => {
      expect(result.current.chats['79001234567@c.us']).toBeDefined()
    })
    expect(result.current.chats['79001234567@c.us'].messages[0]).toMatchObject({
      direction: 'in',
      text: 'yo',
    })
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.green-api.com/waInstance1/deleteNotification/tok/7',
      { method: 'DELETE' }
    )
  })
})
