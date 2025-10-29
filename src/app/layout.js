import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import Providers from '@/components/Providers'
import Navbar from '@/components/Navbar'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'InkFlow - Where Stories Come to Life',
  description: 'A beautiful storytelling platform where writers share their journeys and readers discover amazing stories. Built with Next.js and modern design.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </main>
            
            {/* Background decorative elements */}
            <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
              <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-200/20 rounded-full blur-3xl"></div>
              <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary-200/20 rounded-full blur-3xl"></div>
              <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-accent-200/20 rounded-full blur-3xl"></div>
            </div>
          </div>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                color: '#fff',
                borderRadius: '12px',
                boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.15)',
              },
              success: {
                style: {
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                },
              },
              error: {
                style: {
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}