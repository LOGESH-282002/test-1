import { render, screen, fireEvent } from '@testing-library/react'
import PostCard from '@/components/PostCard'
import { useAuth } from '@/contexts/AuthContext'

// Mock the AuthContext
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}))

// Mock Next.js Link
jest.mock('next/link', () => {
  return ({ children, href }) => <a href={href}>{children}</a>
})

const mockPost = {
  id: 1,
  title: 'Test Post Title',
  excerpt: 'This is a test post excerpt...',
  created_at: '2024-01-01T00:00:00Z',
  users: {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
  },
}

describe('PostCard', () => {
  const mockOnDelete = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders post information correctly', () => {
    useAuth.mockReturnValue({
      user: null,
    })

    render(<PostCard post={mockPost} onDelete={mockOnDelete} />)

    expect(screen.getByText('Test Post Title')).toBeInTheDocument()
    expect(screen.getByText('This is a test post excerpt...')).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('January 1, 2024')).toBeInTheDocument()
  })

  it('shows edit and delete buttons for post author', () => {
    useAuth.mockReturnValue({
      user: { id: 1, name: 'John Doe' },
    })

    render(<PostCard post={mockPost} onDelete={mockOnDelete} />)

    expect(screen.getByRole('link', { href: '/posts/1/edit' })).toBeInTheDocument()
    expect(screen.getByRole('button')).toBeInTheDocument() // Delete button
  })

  it('does not show edit and delete buttons for non-author', () => {
    useAuth.mockReturnValue({
      user: { id: 2, name: 'Jane Doe' },
    })

    render(<PostCard post={mockPost} onDelete={mockOnDelete} />)

    expect(screen.queryByRole('link', { href: '/posts/1/edit' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('calls onDelete when delete button is clicked and confirmed', () => {
    useAuth.mockReturnValue({
      user: { id: 1, name: 'John Doe' },
    })

    global.confirm = jest.fn(() => true)

    render(<PostCard post={mockPost} onDelete={mockOnDelete} />)

    const deleteButton = screen.getByRole('button')
    fireEvent.click(deleteButton)

    expect(global.confirm).toHaveBeenCalledWith('Are you sure you want to delete this post?')
    expect(mockOnDelete).toHaveBeenCalledWith(1)
  })

  it('does not call onDelete when delete is cancelled', () => {
    useAuth.mockReturnValue({
      user: { id: 1, name: 'John Doe' },
    })

    global.confirm = jest.fn(() => false)

    render(<PostCard post={mockPost} onDelete={mockOnDelete} />)

    const deleteButton = screen.getByRole('button')
    fireEvent.click(deleteButton)

    expect(global.confirm).toHaveBeenCalled()
    expect(mockOnDelete).not.toHaveBeenCalled()
  })
})