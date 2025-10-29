import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { hashPassword, generateToken } from '@/lib/auth'
import { validateEmail, validatePassword, validateName, sanitizeInput } from '@/lib/validation'

export const dynamic = 'force-dynamic'

export async function POST(request) {
  try {
    const { name, email, password } = await request.json()

    // Validate input
    if (!validateName(name)) {
      return NextResponse.json(
        { error: 'Name must be at least 2 characters long' },
        { status: 400 }
      )
    }

    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      )
    }

    if (!validatePassword(password)) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    // Sanitize input
    const sanitizedName = sanitizeInput(name)
    const sanitizedEmail = sanitizeInput(email.toLowerCase())

    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', sanitizedEmail)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .insert([
        {
          name: sanitizedName,
          email: sanitizedEmail,
          password: hashedPassword,
        },
      ])
      .select('id, name, email')
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to create user account' },
        { status: 500 }
      )
    }

    // Generate JWT token
    const token = generateToken({ userId: user.id, email: user.email })

    return NextResponse.json({
      message: 'User registered successfully',
      user: { id: user.id, name: user.name, email: user.email },
      token,
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}