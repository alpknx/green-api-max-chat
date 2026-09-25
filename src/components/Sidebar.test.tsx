import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Sidebar } from './Sidebar'
import type { ChatsState } from '../storage/chats'

const chats: ChatsState = {
  '1@c.us': { id: '1@c.us', phoneNumber: '1', messages: [{ id: 'a', direction: 'out', text: 'x', timestamp: 1 }] },
  '2@c.us': { id: '2@c.us', phoneNumber: '2', messages: [{ id: 'b', direction: 'in', text: 'y', timestamp: 2 }] },
}

describe('Sidebar', () => {
  it('lists chats most-recent-first', () => {
    render(
      <Sidebar chats={chats} selectedChatId={null} onSelect={vi.fn()} onCreateChat={vi.fn()} />
    )
    const items = screen.getAllByRole('listitem')
    expect(items[0]).toHaveTextContent('2')
    expect(items[1]).toHaveTextContent('1')
  })

  it('calls onSelect when a chat is clicked', () => {
    const onSelect = vi.fn()
    render(
      <Sidebar chats={chats} selectedChatId={null} onSelect={onSelect} onCreateChat={vi.fn()} />
    )
    fireEvent.click(screen.getByText('1'))
    expect(onSelect).toHaveBeenCalledWith('1@c.us')
  })

  it('calls onCreateChat with the entered phone number and clears the field', () => {
    const onCreateChat = vi.fn()
    render(
      <Sidebar chats={{}} selectedChatId={null} onSelect={vi.fn()} onCreateChat={onCreateChat} />
    )
    const input = screen.getByPlaceholderText(/номер телефона/i)
    fireEvent.change(input, { target: { value: '79001234567' } })
    fireEvent.click(screen.getByRole('button', { name: '+' }))
    expect(onCreateChat).toHaveBeenCalledWith('79001234567')
    expect((input as HTMLInputElement).value).toBe('')
  })
})
