export interface Message {
  id: string
  direction: 'in' | 'out'
  text: string
  timestamp: number
  failed?: boolean
}

export interface Chat {
  id: string
  phoneNumber: string
  messages: Message[]
}

export type ChatsState = Record<string, Chat>

function storageKey(idInstance: string): string {
  return `green-api-max-chat:chats:${idInstance}`
}

export function loadChats(idInstance: string): ChatsState {
  const raw = localStorage.getItem(storageKey(idInstance))
  if (!raw) return {}
  try {
    return JSON.parse(raw) as ChatsState
  } catch {
    return {}
  }
}

export function saveChats(idInstance: string, state: ChatsState): void {
  localStorage.setItem(storageKey(idInstance), JSON.stringify(state))
}

export function phoneToChatId(phoneNumber: string): string {
  const digits = phoneNumber.replace(/\D/g, '')
  return `${digits}@c.us`
}

export function createChat(state: ChatsState, phoneNumber: string): ChatsState {
  const chatId = phoneToChatId(phoneNumber)
  if (state[chatId]) return state
  return {
    ...state,
    [chatId]: { id: chatId, phoneNumber, messages: [] },
  }
}

export function addMessage(
  state: ChatsState,
  chatId: string,
  message: Message
): ChatsState {
  const existing = state[chatId] ?? {
    id: chatId,
    phoneNumber: chatId.replace('@c.us', ''),
    messages: [],
  }
  if (existing.messages.some((m) => m.id === message.id)) return state
  return {
    ...state,
    [chatId]: { ...existing, messages: [...existing.messages, message] },
  }
}

export function markMessageFailed(
  state: ChatsState,
  chatId: string,
  messageId: string
): ChatsState {
  const chat = state[chatId]
  if (!chat) return state
  return {
    ...state,
    [chatId]: {
      ...chat,
      messages: chat.messages.map((m) =>
        m.id === messageId ? { ...m, failed: true } : m
      ),
    },
  }
}
