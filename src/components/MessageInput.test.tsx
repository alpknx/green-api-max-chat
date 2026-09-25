import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { MessageInput } from './MessageInput'

describe('MessageInput', () => {
  it('disables send button when input is empty', () => {
    render(<MessageInput disabled={false} onSend={vi.fn()} />)
    expect(screen.getByRole('button', { name: /отправить/i })).toBeDisabled()
  })

  it('calls onSend with trimmed text and clears input', () => {
    const onSend = vi.fn()
    render(<MessageInput disabled={false} onSend={onSend} />)
    const input = screen.getByPlaceholderText(/сообщение/i)

    fireEvent.change(input, { target: { value: '  hi  ' } })
    fireEvent.click(screen.getByRole('button', { name: /отправить/i }))

    expect(onSend).toHaveBeenCalledWith('hi')
    expect((input as HTMLInputElement).value).toBe('')
  })

  it('disables input and button when disabled prop is true', () => {
    render(<MessageInput disabled={true} onSend={vi.fn()} />)
    expect(screen.getByPlaceholderText(/сообщение/i)).toBeDisabled()
    expect(screen.getByRole('button', { name: /отправить/i })).toBeDisabled()
  })
})
