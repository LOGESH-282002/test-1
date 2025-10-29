import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const JWT_SECRET = process.env.JWT_SECRET

export const hashPassword = async (password) => {
  return await bcrypt.hash(password, 12)
}

export const verifyPassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword)
}

export const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export const verifyToken = (token) => {
  try {
    if (!token) return null
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    console.error('Token verification error:', error.message)
    return null
  }
}

export const getTokenFromRequest = (req) => {
  const authHeader = req.headers.get('authorization')
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }
  
  return null
}