import { POST as registerPOST } from '@/app/api/auth/register/route'
import { POST as loginPOST } from '@/app/api/auth/login/route'
import { supabaseAdmin } from '@/lib/supabase'
import { hashPassword, verifyPassword } from '@/lib/auth'

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabaseAdmin: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
    })),
  },
}))

// Mock auth functions
jest.mock('@/lib/auth', () => ({
  hashPassword: jest.fn(),
  verifyPassword: jest.fn(),
  generateToken: jest.fn(() => 'mock-token'),
}))

describe('/api/auth/register', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should register a new user successfully', async () => {
    const mockUser = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
    }

    // Mock no existing user
    supabaseAdmin.from().select().eq().single.mockResolvedValue({
      data: null,
      error: { code: 'PGRST116' }, // Not found error
    })

    // Mock successful user creation
    supabaseAdmin.from().insert().select().single.mockResolvedValue({
      data: mockUser,
      error: null,
    })

    hashPassword.mockResolvedValue('hashed-password')

    const request = new Request('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      }),
    })

    const response = await registerPOST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.user).toEqual(mockUser)
    expect(data.token).toBe('mock-token')
  })

  it('should return error for invalid email', async () => {
    const request = new Request('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'John Doe',
        email: 'invalid-email',
        password: 'password123',
      }),
    })

    const response = await registerPOST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Please provide a valid email address')
  })
})

describe('/api/auth/login', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should login user successfully', async () => {
    const mockUser = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      password: 'hashed-password',
    }

    supabaseAdmin.from().select().eq().single.mockResolvedValue({
      data: mockUser,
      error: null,
    })

    verifyPassword.mockResolvedValue(true)

    const request = new Request('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'john@example.com',
        password: 'password123',
      }),
    })

    const response = await loginPOST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.user.email).toBe('john@example.com')
    expect(data.token).toBe('mock-token')
  })

  it('should return error for invalid credentials', async () => {
    supabaseAdmin.from().select().eq().single.mockResolvedValue({
      data: null,
      error: { code: 'PGRST116' },
    })

    const request = new Request('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'john@example.com',
        password: 'wrongpassword',
      }),
    })

    const response = await loginPOST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('Invalid email or password')
  })
})