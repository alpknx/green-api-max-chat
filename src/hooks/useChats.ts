import { useCallback, useEffect, useState } from 'react'
import {
  addMessage,
  createChat,
  loadChats,
  markMessageFailed,
  saveChats,
  type ChatsState,
  type Message,
} from '../storage/chats'
import {
  deleteNotification,
  parseIncomingTextNotification,
  receiveNotification,
  sendMessage as sendMessageApi,
  type GreenApiCredentials,
} from '../api/greenApi'

const POLL_INTERVAL_MS = 3000

export function useChats(credentials: GreenApiCredentials) {
  const [chats, setChats] = useState<ChatsState>(() =>
    loadChats(credentials.idInstance)
  )

  useEffect(() => {
    saveChats(credentials.idInstance, chats)
  }, [chats, credentials.idInstance])

  useEffect(() => {
    let cancelled = false
    let timer: ReturnType<typeof setTimeout>

    async function poll() {
      try {
        const raw = await receiveNotification(credentials)
        if (raw) {
          const parsed = parseIncomingTextNotification(raw)
          if (parsed) {
            setChats((prev) =>
              addMessage(prev, parsed.chatId, {
                id: `in-${parsed.receiptId}`,
                direction: 'in',
                text: parsed.text,
                timestamp: parsed.timestamp,
              })
            )
          }
          const receiptId = (raw as { receiptId?: number }).receiptId
          if (receiptId != null) {
            await deleteNotification(credentials, receiptId)
          }
        }
      } catch {
        // network hiccup — next tick retries
      } finally {
        if (!cancelled) timer = setTimeout(poll, POLL_INTERVAL_MS)
      }
    }

    poll()
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [credentials])

  const startChat = useCallback((phoneNumber: string) => {
    setChats((prev) => createChat(prev, phoneNumber))
  }, [])

  const sendMessage = useCallback(
    async (chatId: string, text: string) => {
      const message: Message = {
        id: `out-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        direction: 'out',
        text,
        timestamp: Date.now(),
      }
      setChats((prev) => addMessage(prev, chatId, message))
      try {
        await sendMessageApi(credentials, chatId, text)
      } catch {
        setChats((prev) => markMessageFailed(prev, chatId, message.id))
      }
    },
    [credentials]
  )

  return { chats, startChat, sendMessage }
}
