/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

// ── Hardcoded accounts (thêm user mới tại đây) ───────────────────
const ACCOUNTS = [
  { id: '1', username: 'Trung', password: 'REDACTED_PASSWORD', name: 'Trung', email: 'trung@crm.local', role: 'admin' },
  { id: '2', username: 'Sale01', password: 'REDACTED_PASSWORD', name: 'Nguyễn Văn Sales', email: 'sales@crm.local', role: 'sales' },
]

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: 'ID', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const account = ACCOUNTS.find(
          a => a.username === credentials?.username && a.password === credentials?.password
        )
        if (account) {
          return {
            id: account.id,
            name: account.name,
            email: account.email,
            role: account.role as 'admin' | 'sales',
          }
        }
        return null
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 giờ
  },
  callbacks: {
    async session({ session, token }: { session: any; token: any }) {
      if (session?.user) {
        session.user.id = token.sub ?? ''
        session.user.role = token.role ?? 'sales'
      }
      return session
    },
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}
