'use client'

import { createContext, useContext, useReducer, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { toast } from 'react-hot-toast'

const AuthContext = createContext()

const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_USER':
      return { ...state, user: action.payload, loading: false }
    case 'SET_TOKEN':
      return { ...state, token: action.payload }
    case 'LOGOUT':
      return { ...state, user: null, token: null, loading: false }
    default:
      return state
  }
}

const initialState = {
  user: null,
  token: null,
  loading: true,
}

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === 'loading') {
      dispatch({ type: 'SET_LOADING', payload: true })
      return
    }

    if (session?.user) {
      // User is signed in with NextAuth (Google)
      // Fetch JWT token for API calls
      fetchSessionToken()
    } else {
      // Check for stored JWT token
      const token = localStorage.getItem('token')
      const user = localStorage.getItem('user')
      
      if (token && user) {
        dispatch({ type: 'SET_TOKEN', payload: token })
        dispatch({ type: 'SET_USER', payload: JSON.parse(user) })
      } else {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    }
  }, [session, status])

  const fetchSessionToken = async () => {
    try {
      const response = await fetch('/api/auth/session')
      if (response.ok) {
        const data = await response.json()
        dispatch({ type: 'SET_TOKEN', payload: data.token })
        dispatch({ type: 'SET_USER', payload: data.user })
        
        // Store in localStorage for consistency
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
      } else {
        // If session fetch fails, clear any existing tokens
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    } catch (error) {
      console.error('Error fetching session token:', error)
      // Clear tokens on error
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const login = async (email, password) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Login failed')
      }

      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      
      dispatch({ type: 'SET_TOKEN', payload: data.token })
      dispatch({ type: 'SET_USER', payload: data.user })
      
      toast.success('Login successful!')
      return { success: true }
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false })
      toast.error(error.message)
      return { success: false, error: error.message }
    }
  }

  const register = async (name, email, password) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      
      dispatch({ type: 'SET_TOKEN', payload: data.token })
      dispatch({ type: 'SET_USER', payload: data.user })
      
      toast.success('Registration successful!')
      return { success: true }
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false })
      toast.error(error.message)
      return { success: false, error: error.message }
    }
  }

  const logout = async () => {
    if (session) {
      // Sign out from NextAuth
      await signOut({ redirect: false })
    }
    
    // Clear JWT token
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    dispatch({ type: 'LOGOUT' })
    toast.success('Logged out successfully')
  }

  const value = {
    ...state,
    login,
    register,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}