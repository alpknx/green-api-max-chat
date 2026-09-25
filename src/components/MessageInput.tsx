import { useState, type FormEvent } from 'react'

interface MessageInputProps {
  disabled: boolean
  onSend: (text: string) => void
}

export function MessageInput({ disabled, onSend }: MessageInputProps) {
  const [text, setText] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) return
    onSend(trimmed)
    setText('')
  }

  return (
    <form className="message-input" onSubmit={handleSubmit}>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Сообщение"
        disabled={disabled}
      />
      <button type="submit" disabled={disabled || !text.trim()}>
        Отправить
      </button>
    </form>
  )
}
