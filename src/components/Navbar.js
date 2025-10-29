'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { PenTool, LogOut, User, Home, Menu, X, Bell, Search } from 'lucide-react'
import { useState } from 'react'
import Logo from './Logo'

export default function Navbar() {
  const { user, logout } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="glass-effect sticky top-0 z-40 border-b border-neutral-200/50 safe-area-top">
      <div className="container-responsive">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <div className="flex items-center space-x-4 sm:space-x-8">
            <Link href="/" className="flex items-center touch-manipulation tap-highlight-none">
              <Logo size="default" />
            </Link>
            
            <div className="hidden md:flex items-center space-x-4 lg:space-x-6">
              <Link 
                href="/" 
                className="flex items-center space-x-2 text-neutral-600 hover:text-primary-600 transition-all duration-200 px-2 lg:px-3 py-2 rounded-lg hover:bg-primary-50 text-sm lg:text-base"
              >
                <Home className="h-4 w-4" />
                <span className="font-medium">Home</span>
              </Link>
              
              {user && (
                <Link 
                  href="/create" 
                  className="flex items-center space-x-2 text-neutral-600 hover:text-primary-600 transition-all duration-200 px-2 lg:px-3 py-2 rounded-lg hover:bg-primary-50 text-sm lg:text-base"
                >
                  <PenTool className="h-4 w-4" />
                  <span className="font-medium">New Note</span>
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            {user ? (
              <div className="flex items-center space-x-2 sm:space-x-4">
                <button className="relative p-1.5 sm:p-2 text-neutral-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200 touch-manipulation">
                  <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 sm:h-3 sm:w-3 bg-accent-500 rounded-full"></span>
                </button>
                
                <div className="flex items-center space-x-2 sm:space-x-3 bg-white/50 rounded-lg sm:rounded-xl px-2 sm:px-4 py-1.5 sm:py-2 border border-neutral-200/50">
                  <div className="h-6 w-6 sm:h-8 sm:w-8 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full flex items-center justify-center">
                    <User className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                  </div>
                  <div className="hidden sm:block">
                    <span className="text-xs sm:text-sm font-medium text-neutral-700 line-clamp-1">{user.name}</span>
                    <div className="text-xs text-neutral-500">Note Taker</div>
                  </div>
                </div>
                
                <button
                  onClick={logout}
                  className="flex items-center space-x-1 sm:space-x-2 text-neutral-600 hover:text-red-600 transition-all duration-200 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg hover:bg-red-50 touch-manipulation"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline font-medium text-sm">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 sm:space-x-4">
                <Link 
                  href="/login" 
                  className="text-neutral-600 hover:text-primary-600 font-medium transition-colors duration-200 text-sm sm:text-base px-2 py-1 rounded touch-manipulation"
                >
                  Login
                </Link>
                <Link 
                  href="/register" 
                  className="btn-primary"
                >
                  <span className="hidden sm:inline">Get Started</span>
                  <span className="sm:hidden">Join</span>
                </Link>
              </div>
            )}
            
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-1.5 sm:p-2 text-neutral-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200 touch-manipulation tap-highlight-none"
            >
              {isMenuOpen ? <X className="h-4 w-4 sm:h-5 sm:w-5" /> : <Menu className="h-4 w-4 sm:h-5 sm:w-5" />}
            </button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-neutral-200/50 animate-slide-up">
            <div className="flex flex-col space-y-2">
              <Link 
                href="/" 
                className="flex items-center space-x-2 text-neutral-600 hover:text-primary-600 px-3 py-2 rounded-lg hover:bg-primary-50 transition-all duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                <Home className="h-4 w-4" />
                <span>Home</span>
              </Link>
              
              {user && (
                <Link 
                  href="/create" 
                  className="flex items-center space-x-2 text-neutral-600 hover:text-primary-600 px-3 py-2 rounded-lg hover:bg-primary-50 transition-all duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <PenTool className="h-4 w-4" />
                  <span>New Note</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}