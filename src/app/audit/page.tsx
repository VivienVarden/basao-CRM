'use client'
import { AppLayout } from '@/components/layout/AppLayout'
import { Header } from '@/components/layout/Header'
import { useApp } from '@/lib/context'
import { useSession } from 'next-auth/react'
import { formatRelativeDate } from '@/lib/utils'
import Link from 'next/link'

export default function AuditLogPage() {
  const { store } = useApp()
  const { data: session } = useSession()

  if (session?.user?.role !== 'admin') {
    return (
      <AppLayout>
        <Header title="Unauthorized" />
        <div className="page-body"><div className="empty-state"><div className="empty-state-icon">⛔</div><div className="empty-state-title">Access denied. Admin only.</div></div></div>
      </AppLayout>
    )
  }

  const allEvents = store.deals.flatMap(d => d.timeline.map(t => ({ ...t, dealId: d.id, dealName: d.name })))
  allEvents.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  return (
    <AppLayout>
      <Header title="Global Audit Trail" subtitle="God mode view of all activities across the system" />
      <div className="page-body animate-fade">
        <div className="card" style={{ maxWidth: 800 }}>
          <div className="card-header" style={{ marginBottom: 20 }}>
            <div className="card-title">🚨 System Event Logs</div>
            <div className="card-subtitle">Showing {allEvents.length} events from all deals</div>
          </div>
          <div className="timeline">
            {allEvents.map(event => (
              <div key={event.id} className="timeline-item" style={{ borderBottom: '1px solid var(--border)', paddingBottom: 16 }}>
                <div className="timeline-dot" style={{ background: 'var(--bg-card)' }}>{event.type === 'status_change' ? '🔄' : event.type === 'meeting' ? '☕' : event.type === 'call' ? '📞' : '📝'}</div>
                <div className="timeline-content" style={{ paddingLeft: 10 }}>
                  <div className="timeline-text" style={{ fontSize: 13.5, color: 'var(--text-primary)', marginBottom: 4 }}>
                    <Link href={`/deals/${event.dealId}`} style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>{event.dealName}</Link>: {event.content}
                  </div>
                  <div className="timeline-time" style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {formatRelativeDate(event.createdAt)} · Action by <strong>{event.createdBy}</strong>
                  </div>
                </div>
              </div>
            ))}
            {allEvents.length === 0 && <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)' }}>No logs found.</div>}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
