import { useState, type FormEvent } from 'react'
import type { ChatsState } from '../storage/chats'

interface SidebarProps {
  chats: ChatsState
  selectedChatId: string | null
  onSelect: (chatId: string) => void
  onCreateChat: (phoneNumber: string) => void
}

export function Sidebar({ chats, selectedChatId, onSelect, onCreateChat }: SidebarProps) {
  const [newNumber, setNewNumber] = useState('')

  function handleCreate(e: FormEvent) {
    e.preventDefault()
    const trimmed = newNumber.trim()
    if (!trimmed) return
    onCreateChat(trimmed)
    setNewNumber('')
  }

  const chatList = Object.values(chats).sort((a, b) => {
    const aLast = a.messages.at(-1)?.timestamp ?? 0
    const bLast = b.messages.at(-1)?.timestamp ?? 0
    return bLast - aLast
  })

  return (
    <aside className="sidebar">
      <form onSubmit={handleCreate} className="sidebar__new-chat">
        <input
          placeholder="Номер телефона"
          value={newNumber}
          onChange={(e) => setNewNumber(e.target.value)}
        />
        <button type="submit">+</button>
      </form>
      <ul className="sidebar__list">
        {chatList.map((chat) => (
          <li
            key={chat.id}
            className={chat.id === selectedChatId ? 'active' : ''}
            onClick={() => onSelect(chat.id)}
          >
            {chat.phoneNumber}
          </li>
        ))}
      </ul>
    </aside>
  )
}
