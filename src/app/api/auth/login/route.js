import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyPassword, generateToken } from '@/lib/auth'
import { validateEmail, sanitizeInput } from '@/lib/validation'

export const dynamic = 'force-dynamic'

export async function POST(request) {
  try {
    const { email, password } = await request.json()

    // Validate input
    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      )
    }

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      )
    }

    const sanitizedEmail = sanitizeInput(email.toLowerCase())

    // Find user
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, name, email, password')
      .eq('email', sanitizedEmail)
      .single()

    if (error || !user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Generate JWT token
    const token = generateToken({ userId: user.id, email: user.email })

    return NextResponse.json({
      message: 'Login successful',
      user: { id: user.id, name: user.name, email: user.email },
      token,
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}