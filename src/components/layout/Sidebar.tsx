'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useApp } from '@/lib/context'

const navItems = [
  { href: '/dashboard', icon: '🧠', label: 'Intelligence' },
  { href: '/deals', icon: '⚡️', label: 'Deal Engine' },
  { href: '/network', icon: '🕸', label: 'Network' },
  { href: '/outreach', icon: '📤', label: 'Outreach' },
]

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const { store } = useApp()

  const overdueTaskCount = 0 // tasks feature not yet implemented

  const user = session?.user as { name?: string | null; email?: string | null; role?: string; image?: string } | undefined

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">▲</div>
        <div>
          <div className="sidebar-logo-text" style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>Basao Intel</div>
          <div className="sidebar-logo-sub" style={{ color: 'var(--accent)', fontSize: 11, fontWeight: 600 }}>Deal Engine V2</div>
        </div>
      </div>

      <nav className="sidebar-nav" style={{ marginTop: 24 }}>
        {navItems.map(item => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link key={item.href} href={item.href} className={`sidebar-nav-item ${isActive ? 'active' : ''}`}>
              <span className="sidebar-link-icon" style={{ fontSize: 18 }}>{item.icon}</span>
              <span>{item.label}</span>
              {item.href === '/deals' && overdueTaskCount > 0 && (
                <span style={{
                  marginLeft: 'auto',
                  background: '#ef4444',
                  color: '#fff',
                  fontSize: 10,
                  fontWeight: 700,
                  borderRadius: 99,
                  padding: '2px 7px',
                }}>{overdueTaskCount}</span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* User info & Sign Out */}
      <div
        style={{
          padding: '24px 16px',
          borderTop: '1px solid var(--border)',
          cursor: 'pointer',
        }}
        onClick={() => signOut({ callbackUrl: '/login' })}
        title="Nhấn để đăng xuất"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36,
            height: 36,
            background: 'var(--bg-card)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            color: '#fff',
            border: '1px solid var(--border)',
          }}>
            {user?.name ? user.name.charAt(0).toUpperCase() : '?'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name ?? 'Unknown'}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              {user?.email ?? ''}
            </div>
          </div>
          {/* Sign out icon */}
          <div title="Đăng xuất" style={{ color: 'var(--text-muted)', fontSize: 14, flexShrink: 0 }}>→</div>
        </div>
      </div>
    </aside>
  )
}
