'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useApp } from '@/lib/context'
import { t } from '@/lib/i18n'
import { getInitials, generateAvatarColor } from '@/lib/utils'

const navItems = [
  { href: '/', icon: '📊', key: 'nav.dashboard' as const },
  { href: '/pipeline', icon: '🔥', key: 'nav.pipeline' as const },
  { href: '/deals', icon: '💼', key: 'nav.deals' as const },
  { href: '/customers', icon: '👥', key: 'nav.customers' as const },
  { href: '/partners', icon: '🤝', key: 'nav.partners' as const },
  { href: '/tasks', icon: '✅', key: 'nav.tasks' as const },
  { href: '/brain', icon: '🧠', key: 'nav.brain' as const },
]

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const { locale, store } = useApp()

  const overdueTaskCount = store.tasks.filter(t => t.status !== 'done' && new Date(t.dueDate) < new Date()).length
  const user = session?.user

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">✨</div>
        <div>
          <div className="sidebar-logo-text">Basao CRM</div>
          <div className="sidebar-logo-sub">Deal Management</div>
        </div>
      </div>

      <div style={{ padding: '0 16px', marginBottom: 12 }}>
        <button 
          onClick={() => window.dispatchEvent(new Event('open-search'))}
          style={{ width: '100%', background: 'var(--bg-hover)', border: '1px solid var(--border)', padding: '10px 12px', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.2s', outline: 'none' }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>🔍</span>
            <span style={{ fontSize: 13, fontWeight: 500 }}>{locale === 'vi' ? 'Tìm kiếm nhanh...' : 'Quick search...'}</span>
          </div>
          <div style={{ fontSize: 11, background: 'var(--bg-base)', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>⌘K</div>
        </button>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section">
          <div className="sidebar-section-label">Menu</div>
          {navItems.map(item => {
            const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
            return (
              <Link key={item.href} href={item.href} className={`sidebar-link ${isActive ? 'active' : ''}`}>
                <span className="sidebar-link-icon">{item.icon}</span>
                <span>{item.key === 'nav.brain' ? 'Brain Graph' : item.key === 'nav.pipeline' ? 'Pipeline' : t(locale, item.key as any)}</span>
                {item.key === 'nav.tasks' && overdueTaskCount > 0 && (
                  <span className="sidebar-link-badge">{overdueTaskCount}</span>
                )}
              </Link>
            )
          })}
        </div>

        {session?.user?.role === 'admin' && (
          <div className="sidebar-section">
            <div className="sidebar-section-label">System</div>
            <Link href="/audit" className={`sidebar-link ${pathname === '/audit' ? 'active' : ''}`}>
              <span className="sidebar-link-icon">🚨</span>
              <span>Global Audit</span>
            </Link>
            <Link href="/settings" className={`sidebar-link ${pathname === '/settings' ? 'active' : ''}`}>
              <span className="sidebar-link-icon">⚙️</span>
              <span>{t(locale, 'nav.settings')}</span>
            </Link>
          </div>
        )}
      </nav>

      <div className="sidebar-bottom">
        <div className="sidebar-user" onClick={() => signOut({ callbackUrl: '/login' })}>
          {user?.image ? (
            <div className="avatar"><img src={user.image} alt={user.name || ''} /></div>
          ) : (
            <div className="avatar" style={{ background: generateAvatarColor(user?.name || 'U') }}>
              {getInitials(user?.name || 'User')}
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="sidebar-user-name truncate">{user?.name || 'User'}</div>
            <div className="sidebar-user-email truncate">{user?.email || ''}</div>
          </div>
          <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>↗</span>
        </div>
      </div>
    </aside>
  )
}
