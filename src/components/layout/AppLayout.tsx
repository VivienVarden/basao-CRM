'use client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Sidebar } from './Sidebar'
import { BasaoAiChat } from './BasaoAiChat'
import { CommandPalette } from './CommandPalette'

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login')
    }
  }, [status, router])

  // Hiển thị loading spinner trong khi kiểm tra session
  if (status === 'loading') {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'var(--bg-base)',
        flexDirection: 'column',
        gap: 16,
      }}>
        <div style={{
          width: 48,
          height: 48,
          background: 'linear-gradient(135deg,#3b82f6,#6366f1)',
          borderRadius: 14,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 24,
          animation: 'pulse 2s infinite',
        }}>💹</div>
        <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Đang xác thực...</div>
      </div>
    )
  }

  // Không render gì nếu chưa authenticated (redirect đang xử lý)
  if (!session) return null

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        {children}
      </main>
      <BasaoAiChat />
      <CommandPalette />
    </div>
  )
}
