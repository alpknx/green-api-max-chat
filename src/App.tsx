import { useState } from 'react'
import { Login } from './components/Login'
import { Sidebar } from './components/Sidebar'
import { ChatWindow } from './components/ChatWindow'
import { useChats } from './hooks/useChats'
import { loadCredentials, saveCredentials } from './storage/credentials'
import { phoneToChatId } from './storage/chats'
import type { GreenApiCredentials } from './api/greenApi'
import './App.css'

export function App() {
  const [credentials, setCredentials] = useState<GreenApiCredentials | null>(() =>
    loadCredentials()
  )

  if (!credentials) {
    return (
      <Login
        onLogin={(creds) => {
          saveCredentials(creds)
          setCredentials(creds)
        }}
      />
    )
  }

  return <ChatScreen credentials={credentials} />
}

function ChatScreen({ credentials }: { credentials: GreenApiCredentials }) {
  const { chats, startChat, sendMessage } = useChats(credentials)
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)
  const selectedChat = selectedChatId ? chats[selectedChatId] ?? null : null

  return (
    <div className="app">
      <Sidebar
        chats={chats}
        selectedChatId={selectedChatId}
        onSelect={setSelectedChatId}
        onCreateChat={(phoneNumber) => {
          startChat(phoneNumber)
          setSelectedChatId(phoneToChatId(phoneNumber))
        }}
      />
      <ChatWindow
        chat={selectedChat}
        onSend={(text) => {
          if (selectedChatId) sendMessage(selectedChatId, text)
        }}
      />
    </div>
  )
}
