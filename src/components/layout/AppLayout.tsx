'use client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Sidebar } from './Sidebar'
import { BasaoAiChat } from './BasaoAiChat'
import { CommandPalette } from './CommandPalette'

export function AppLayout({ children }: { children: React.ReactNode }) {
  const session = { user: { name: 'Trung (Admin)', role: 'admin', email: 'trung@crm.local' } }
  const status = 'authenticated'

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-content">
        {children}
        <BasaoAiChat />
        <CommandPalette />
      </main>
    </div>
  )
}
