import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { supabaseAdmin } from '@/lib/supabase'

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account.provider === 'google') {
        try {
          // Check if user exists in our database
          const { data: existingUser } = await supabaseAdmin
            .from('users')
            .select('id, name, email')
            .eq('email', user.email)
            .single()

          if (!existingUser) {
            // Create new user in our database
            const { data: newUser, error } = await supabaseAdmin
              .from('users')
              .insert([
                {
                  name: user.name,
                  email: user.email,
                  google_id: user.id,
                },
              ])
              .select('id, name, email')
              .single()

            if (error) {
              console.error('Error creating user:', error)
              return false
            }
            
            user.dbId = newUser.id
          } else {
            user.dbId = existingUser.id
          }
          
          return true
        } catch (error) {
          console.error('Sign in error:', error)
          return false
        }
      }
      return true
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.dbId = user.dbId
      }
      return token
    },
    async session({ session, token }) {
      session.user.id = token.dbId
      return session
    },
  },
  pages: {
    signIn: '/login',
    signUp: '/register',
  },
  session: {
    strategy: 'jwt',
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }