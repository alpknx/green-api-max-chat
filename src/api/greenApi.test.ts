import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  GreenApiError,
  deleteNotification,
  getSettings,
  parseIncomingTextNotification,
  receiveNotification,
  sendMessage,
} from './greenApi'

const creds = { idInstance: '123', apiTokenInstance: 'tok' }

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('getSettings', () => {
  it('calls the settings endpoint and returns json', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ wid: '123@c.us' }),
    })
    vi.stubGlobal('fetch', fetchMock)

    const result = await getSettings(creds)

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.green-api.com/waInstance123/getSettings/tok'
    )
    expect(result).toEqual({ wid: '123@c.us' })
  })

  it('throws GreenApiError on non-ok response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 401 }))
    await expect(getSettings(creds)).rejects.toBeInstanceOf(GreenApiError)
  })
})

describe('sendMessage', () => {
  it('posts chatId and message', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ idMessage: 'abc' }),
    })
    vi.stubGlobal('fetch', fetchMock)

    const result = await sendMessage(creds, '7900@c.us', 'hi')

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.green-api.com/waInstance123/sendMessage/tok',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId: '7900@c.us', message: 'hi' }),
      }
    )
    expect(result).toEqual({ idMessage: 'abc' })
  })
})

describe('receiveNotification', () => {
  it('returns null on empty body', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, text: async () => '' })
    )
    const result = await receiveNotification(creds)
    expect(result).toBeNull()
  })

  it('returns parsed json when present', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, text: async () => '{"receiptId":1}' })
    )
    const result = await receiveNotification(creds)
    expect(result).toEqual({ receiptId: 1 })
  })
})

describe('deleteNotification', () => {
  it('sends DELETE with receiptId in path', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true })
    vi.stubGlobal('fetch', fetchMock)

    await deleteNotification(creds, 42)

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.green-api.com/waInstance123/deleteNotification/tok/42',
      { method: 'DELETE' }
    )
  })
})

describe('parseIncomingTextNotification', () => {
  it('parses a valid incoming text webhook', () => {
    const raw = {
      receiptId: 5,
      body: {
        typeWebhook: 'incomingMessageReceived',
        timestamp: 1000,
        senderData: { chatId: '7900@c.us', senderName: 'Bob' },
        messageData: {
          typeMessage: 'textMessage',
          textMessageData: { textMessage: 'hello' },
        },
      },
    }
    expect(parseIncomingTextNotification(raw)).toEqual({
      receiptId: 5,
      chatId: '7900@c.us',
      senderName: 'Bob',
      text: 'hello',
      timestamp: 1000,
    })
  })

  it('returns null for non-text webhook types', () => {
    expect(
      parseIncomingTextNotification({ body: { typeWebhook: 'outgoingMessageStatus' } })
    ).toBeNull()
  })

  it('returns null for null input', () => {
    expect(parseIncomingTextNotification(null)).toBeNull()
  })
})
