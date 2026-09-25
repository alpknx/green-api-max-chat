export interface GreenApiCredentials {
  idInstance: string
  apiTokenInstance: string
}

export interface SendMessageResult {
  idMessage: string
}

export interface IncomingTextNotification {
  receiptId: number
  chatId: string
  senderName: string
  text: string
  timestamp: number
}

const BASE_URL = 'https://api.green-api.com'

function buildUrl(
  creds: GreenApiCredentials,
  method: string,
  extraPath = ''
): string {
  return `${BASE_URL}/waInstance${creds.idInstance}/${method}/${creds.apiTokenInstance}${extraPath}`
}

export class GreenApiError extends Error {}

export async function getSettings(
  creds: GreenApiCredentials
): Promise<unknown> {
  const res = await fetch(buildUrl(creds, 'getSettings'))
  if (!res.ok) throw new GreenApiError(`getSettings failed: ${res.status}`)
  return res.json()
}

export async function sendMessage(
  creds: GreenApiCredentials,
  chatId: string,
  message: string
): Promise<SendMessageResult> {
  const res = await fetch(buildUrl(creds, 'sendMessage'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chatId, message }),
  })
  if (!res.ok) throw new GreenApiError(`sendMessage failed: ${res.status}`)
  return res.json()
}

export async function receiveNotification(
  creds: GreenApiCredentials
): Promise<unknown | null> {
  const res = await fetch(buildUrl(creds, 'receiveNotification'))
  if (!res.ok) {
    throw new GreenApiError(`receiveNotification failed: ${res.status}`)
  }
  const text = await res.text()
  if (!text) return null
  return JSON.parse(text)
}

export async function deleteNotification(
  creds: GreenApiCredentials,
  receiptId: number
): Promise<void> {
  const res = await fetch(buildUrl(creds, 'deleteNotification', `/${receiptId}`), {
    method: 'DELETE',
  })
  if (!res.ok) {
    throw new GreenApiError(`deleteNotification failed: ${res.status}`)
  }
}

export function parseIncomingTextNotification(
  raw: unknown
): IncomingTextNotification | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as {
    receiptId?: number
    body?: {
      typeWebhook?: string
      timestamp?: number
      senderData?: { chatId?: string; senderName?: string }
      messageData?: {
        typeMessage?: string
        textMessageData?: { textMessage?: string }
      }
    }
  }
  if (r.body?.typeWebhook !== 'incomingMessageReceived') return null
  if (r.body?.messageData?.typeMessage !== 'textMessage') return null
  const text = r.body?.messageData?.textMessageData?.textMessage
  const chatId = r.body?.senderData?.chatId
  if (!text || !chatId || r.receiptId == null) return null
  return {
    receiptId: r.receiptId,
    chatId,
    senderName: r.body?.senderData?.senderName ?? '',
    text,
    timestamp: r.body?.timestamp ?? 0,
  }
}
