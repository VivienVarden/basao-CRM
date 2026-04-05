/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'

// ── Accounts loaded from environment variables (KHÔNG hardcode credentials) ──
// Mật khẩu được hash bằng bcrypt, salt rounds = 12
// Để thêm user mới: hash mật khẩu bằng `node -e "console.log(require('bcryptjs').hashSync('PASSWORD', 12))"`
// rồi thêm vào .env.local
const ACCOUNTS = [
  {
    id: '1',
    username: process.env.ADMIN_USERNAME ?? '',
    passwordHash: process.env.ADMIN_PASSWORD_HASH ?? '',
    name: 'Trung',
    email: 'trung@crm.local',
    role: 'admin' as const,
  },
  {
    id: '2',
    username: process.env.SALES_USERNAME ?? '',
    passwordHash: process.env.SALES_PASSWORD_HASH ?? '',
    name: 'Nguyễn Văn Sales',
    email: 'sales@crm.local',
    role: 'sales' as const,
  },
]

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: 'Tên đăng nhập', type: 'text' },
        password: { label: 'Mật khẩu', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null

        const account = ACCOUNTS.find(
          (a) => a.username !== '' && a.username === credentials.username
        )

        if (!account || !account.passwordHash) return null

        // So sánh mật khẩu bằng bcrypt (chống timing attack)
        const isValid = await bcrypt.compare(credentials.password, account.passwordHash)
        if (!isValid) return null

        return {
          id: account.id,
          name: account.name,
          email: account.email,
          role: account.role,
        }
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60, // 8 giờ (giảm từ 24h)
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
