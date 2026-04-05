'use client'
import { AppLayout } from '@/components/layout/AppLayout'
import { useApp } from '@/lib/context'
import { OutreachStatus } from '@/lib/types'

function formatDate(isoRaw?: string) {
  if (!isoRaw) return 'N/A'
  return new Date(isoRaw).toLocaleDateString()
}

export default function OutreachPage() {
  const { store } = useApp()

  const formatStatus = (s: OutreachStatus) => {
    return s.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  }

  const getStatusColor = (s: OutreachStatus) => {
    switch (s) {
      case 'not_contacted': return 'var(--text-muted)'
      case 'contacted': return 'var(--color-amber)'
      case 'replied': return 'var(--accent)'
      case 'meeting_booked': return 'var(--status-positive)'
      default: return 'var(--text-primary)'
    }
  }

  return (
    <AppLayout>
      <div className="page-body animate-fade">
        <header style={{ marginBottom: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: 32, marginBottom: 8 }}>Outreach Engine</h1>
            <p className="text-muted">Manage your touchpoints, sequences, and follow-ups securely.</p>
          </div>
          <button className="btn btn-primary">New Campaign</button>
        </header>

        <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr>
                <th style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', fontWeight: 600, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Person</th>
                <th style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', fontWeight: 600, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Company</th>
                <th style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', fontWeight: 600, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                <th style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', fontWeight: 600, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Last Contact</th>
                <th style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', fontWeight: 600, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Follow-up</th>
                <th style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)' }}></th>
              </tr>
            </thead>
            <tbody>
              {store.outreachOutcomes.map(item => {
                const person = store.people.find(p => p.id === item.personId)
                const company = person ? store.companies.find(o => o.id === person.company_id) : null
                
                return (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '16px 24px', fontWeight: 600 }}>{person?.name || 'Unknown'}</td>
                    <td style={{ padding: '16px 24px', color: 'var(--text-secondary)' }}>{company?.name || 'N/A'}</td>
                    <td style={{ padding: '16px 24px' }}>
                      <span className="tag" style={{ color: getStatusColor(item.status), borderColor: getStatusColor(item.status) }}>
                        {formatStatus(item.status)}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px', color: 'var(--text-secondary)' }}>{formatDate(item.lastContactedAt)}</td>
                    <td style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: 600 }}>{formatDate(item.followUpDate)}</td>
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      <button className="btn btn-secondary btn-sm" style={{ padding: '6px 12px' }}>Log Activity</button>
                    </td>
                  </tr>
                )
              })}
              {store.outreachOutcomes.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: '32px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>No outreach data.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  )
}
