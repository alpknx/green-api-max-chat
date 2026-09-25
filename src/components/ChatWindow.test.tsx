import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ChatWindow } from './ChatWindow'

describe('ChatWindow', () => {
  it('shows an empty state when no chat is selected', () => {
    render(<ChatWindow chat={null} onSend={vi.fn()} />)
    expect(screen.getByText(/выберите чат/i)).toBeInTheDocument()
  })

  it('renders messages and forwards sends for the selected chat', () => {
    const onSend = vi.fn()
    render(
      <ChatWindow
        chat={{
          id: '1@c.us',
          phoneNumber: '1',
          messages: [{ id: 'm1', direction: 'out', text: 'hi', timestamp: 1 }],
        }}
        onSend={onSend}
      />
    )
    expect(screen.getByText('hi')).toBeInTheDocument()

    fireEvent.change(screen.getByPlaceholderText(/сообщение/i), { target: { value: 'yo' } })
    fireEvent.click(screen.getByRole('button', { name: /отправить/i }))
    expect(onSend).toHaveBeenCalledWith('yo')
  })
})
