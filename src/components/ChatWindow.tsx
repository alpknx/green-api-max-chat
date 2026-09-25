import type { Chat } from '../storage/chats'
import { MessageBubble } from './MessageBubble'
import { MessageInput } from './MessageInput'

interface ChatWindowProps {
  chat: Chat | null
  onSend: (text: string) => void
}

export function ChatWindow({ chat, onSend }: ChatWindowProps) {
  if (!chat) {
    return <div className="chat-window chat-window--empty">Выберите чат</div>
  }

  return (
    <div className="chat-window">
      <header className="chat-window__header">{chat.phoneNumber}</header>
      <div className="chat-window__messages">
        {chat.messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}
      </div>
      <MessageInput disabled={false} onSend={onSend} />
    </div>
  )
}
