import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { App } from './App'
import * as greenApi from './api/greenApi'

beforeEach(() => {
  sessionStorage.clear()
  localStorage.clear()
  vi.spyOn(greenApi, 'receiveNotification').mockResolvedValue(null)
})

describe('App', () => {
  it('shows Login when there are no stored credentials', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: /max chat/i })).toBeInTheDocument()
  })

  it('shows the chat screen after a successful login', async () => {
    vi.spyOn(greenApi, 'getSettings').mockResolvedValue({ wid: '1@c.us' })
    render(<App />)

    fireEvent.change(screen.getByLabelText(/idInstance/i), { target: { value: '1' } })
    fireEvent.change(screen.getByLabelText(/apiTokenInstance/i), { target: { value: 'tok' } })
    fireEvent.click(screen.getByRole('button', { name: /войти/i }))

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/номер телефона/i)).toBeInTheDocument()
    })
  })

  it('creating a chat selects it and shows the chat window', async () => {
    vi.spyOn(greenApi, 'getSettings').mockResolvedValue({ wid: '1@c.us' })
    render(<App />)

    fireEvent.change(screen.getByLabelText(/idInstance/i), { target: { value: '1' } })
    fireEvent.change(screen.getByLabelText(/apiTokenInstance/i), { target: { value: 'tok' } })
    fireEvent.click(screen.getByRole('button', { name: /войти/i }))

    const numberInput = await screen.findByPlaceholderText(/номер телефона/i)
    fireEvent.change(numberInput, { target: { value: '79001234567' } })
    fireEvent.click(screen.getByRole('button', { name: '+' }))

    expect(await screen.findAllByText('79001234567')).toHaveLength(2)
    expect(screen.getByPlaceholderText(/сообщение/i)).toBeInTheDocument()
  })
})
