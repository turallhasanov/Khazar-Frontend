import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { AuthPasswordField } from '../AuthShell.jsx'

describe('AuthPasswordField', () => {
  it('toggles between masked and visible text without submitting the form', async () => {
    const onSubmit = vi.fn((e) => e.preventDefault())
    render(
      <form onSubmit={onSubmit}>
        <AuthPasswordField label="Şifrə" defaultValue="secret123" placeholder="pw" />
      </form>,
    )
    const input = screen.getByPlaceholderText('pw')
    const toggle = screen.getByRole('button', { name: 'Şifrəni göstər' })
    expect(toggle).toHaveAttribute('type', 'button')
    expect(input).toHaveAttribute('type', 'password')

    await userEvent.click(toggle)
    expect(input).toHaveAttribute('type', 'text')

    await userEvent.click(screen.getByRole('button', { name: 'Şifrəni gizlət' }))
    expect(input).toHaveAttribute('type', 'password')
    expect(onSubmit).not.toHaveBeenCalled()
  })
})
