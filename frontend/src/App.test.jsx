import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import App from './App.jsx'

describe('App', () => {
  it('renders the title', () => {
    render(<App />)
    expect(screen.getByText('AeroReborn')).toBeInTheDocument()
  })

  it('increments the counter', () => {
    render(<App />)
    const button = screen.getByRole('button', { name: /count is/i })
    expect(button).toHaveTextContent('Count is 0')
    fireEvent.click(button)
    expect(button).toHaveTextContent('Count is 1')
  })
})