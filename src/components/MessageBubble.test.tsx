import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MessageBubble } from './MessageBubble'

describe('MessageBubble', () => {
  it('renders outgoing message text with outgoing class', () => {
    render(
      <MessageBubble
        message={{ id: '1', direction: 'out', text: 'hi', timestamp: 1 }}
      />
    )
    const bubble = screen.getByText('hi').closest('div')
    expect(bubble).toHaveClass('bubble--out')
  })

  it('renders incoming message with incoming class', () => {
    render(
      <MessageBubble
        message={{ id: '1', direction: 'in', text: 'hey', timestamp: 1 }}
      />
    )
    const bubble = screen.getByText('hey').closest('div')
    expect(bubble).toHaveClass('bubble--in')
  })

  it('shows a failed label when message.failed is true', () => {
    render(
      <MessageBubble
        message={{ id: '1', direction: 'out', text: 'hi', timestamp: 1, failed: true }}
      />
    )
    expect(screen.getByText(/не доставлено/i)).toBeInTheDocument()
  })
})
