import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Login } from './Login'
import * as greenApi from '../api/greenApi'

describe('Login', () => {
  it('calls onLogin with credentials when getSettings succeeds', async () => {
    vi.spyOn(greenApi, 'getSettings').mockResolvedValue({ wid: '1@c.us' })
    const onLogin = vi.fn()
    render(<Login onLogin={onLogin} />)

    fireEvent.change(screen.getByLabelText(/idInstance/i), { target: { value: '123' } })
    fireEvent.change(screen.getByLabelText(/apiTokenInstance/i), { target: { value: 'tok' } })
    fireEvent.click(screen.getByRole('button', { name: /войти/i }))

    await waitFor(() => {
      expect(onLogin).toHaveBeenCalledWith({ idInstance: '123', apiTokenInstance: 'tok' })
    })
  })

  it('shows an error banner when getSettings rejects', async () => {
    vi.spyOn(greenApi, 'getSettings').mockRejectedValue(new Error('401'))
    render(<Login onLogin={vi.fn()} />)

    fireEvent.change(screen.getByLabelText(/idInstance/i), { target: { value: '123' } })
    fireEvent.change(screen.getByLabelText(/apiTokenInstance/i), { target: { value: 'bad' } })
    fireEvent.click(screen.getByRole('button', { name: /войти/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/неверные данные/i)
  })
})
