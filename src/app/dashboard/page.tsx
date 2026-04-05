'use client'
import { AppLayout } from '@/components/layout/AppLayout'
import { useApp } from '@/lib/context'
import Link from 'next/link'

function formatDays(isoDate: string) {
  const d = new Date(isoDate)
  const diff = Math.round((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24))
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  if (diff < 0) return `In ${Math.abs(diff)} days`
  return `${diff} days ago`
}

export default function DashboardPage() {
  const { store } = useApp()
  
  // Who should I talk to today?
  // Filter for Tier 1 & 2 people who haven't been interacted with recently or have high relationship scores
  const priorityPeople = [...store.people]
    .filter(p => p.tier_score <= 2)
    .sort((a, b) => b.relationship_score - a.relationship_score)
    .slice(0, 4)

  const recentInteractions = [...store.interactions]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5)

  const activeDealsLength = store.deals.filter(d => d.stage !== 'Close').length

  return (
    <AppLayout>
      <div className="page-body animate-fade">
        <header style={{ marginBottom: 40 }}>
          <h1 style={{ fontSize: 32, marginBottom: 8 }}>Intelligence Dashboard</h1>
          <p className="text-muted">AI-driven actionable insights across your network.</p>
        </header>

        {/* Top KPIs */}
        <div className="grid-3 mb-8">
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div className="text-muted text-sm mb-2 font-semibold" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Network Leverage</div>
            <div style={{ fontSize: 36, fontWeight: 800 }}>{store.relationships.length * 12} <span style={{ fontSize: 16, color: 'var(--accent)', fontWeight: 600 }}>nodes</span></div>
          </div>
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div className="text-muted text-sm mb-2 font-semibold" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Deal Flow</div>
            <div style={{ fontSize: 36, fontWeight: 800 }}>{activeDealsLength} <span style={{ fontSize: 16, color: 'var(--accent)', fontWeight: 600 }}>deals</span></div>
          </div>
          <div className="glass-panel" style={{ padding: '24px', background: 'rgba(77, 163, 255, 0.1)', borderColor: 'rgba(77, 163, 255, 0.2)' }}>
            <div style={{ color: 'var(--accent)', fontSize: 12, marginBottom: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>✦ AI Suggestion</div>
            <div style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.4 }}>You have a warm intro to Patrick Collison via Sam Altman. <Link href="/network" style={{ textDecoration: 'underline' }}>Execute it.</Link></div>
          </div>
        </div>

        <div className="grid-2">
          {/* Action Dashboard */}
          <div>
            <h3 style={{ fontSize: 18, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              🎯 Who should I talk to today?
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {priorityPeople.map(p => {
                const company = store.companies.find(o => o.id === p.company_id)
                return (
                  <div key={p.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px' }}>
                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--bg-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, border: '1px solid var(--border)' }}>
                      {p.name.charAt(0)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="flex-between mb-1">
                        <div style={{ fontWeight: 600, fontSize: 15 }}>{p.name}</div>
                        <div className="tag tag-accent">Score: {p.relationship_score}</div>
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{p.role} {company ? `at ${company.name}` : ''}</div>
                    </div>
                    <div>
                      <button className="btn btn-secondary btn-sm" style={{ padding: '6px 16px', fontSize: 12 }}>Interact</button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Recent Interactions Sync */}
          <div>
            <h3 style={{ fontSize: 18, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              📡 Intelligence Feed
            </h3>
            <div className="glass-panel" style={{ padding: '24px 24px 8px' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {recentInteractions.map((int, idx) => {
                  const person = store.people.find(p => p.id === int.personId)
                  return (
                    <div key={int.id} style={{ display: 'flex', gap: 16, paddingBottom: 24, position: 'relative' }}>
                      {idx !== recentInteractions.length - 1 && (
                        <div style={{ position: 'absolute', left: 16, top: 32, bottom: 0, width: 2, background: 'var(--border)' }}></div>
                      )}
                      <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--bg-base)', border: '2px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, zIndex: 1, flexShrink: 0 }}>
                        {int.type === 'Meeting' ? '🤝' : int.type === 'Intro' ? '⚡' : '✉️'}
                      </div>
                      <div>
                        <div style={{ marginBottom: 4 }}>
                          <span style={{ fontWeight: 600 }}>{int.type}</span> <span className="text-muted">with</span> <span style={{ fontWeight: 600 }}>{person?.name || 'Unknown'}</span>
                          <span style={{ color: 'var(--text-muted)', fontSize: 12, marginLeft: 8 }}>• {formatDays(int.timestamp)}</span>
                        </div>
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)', background: 'var(--bg-card)', padding: '10px 14px', borderRadius: 8, marginTop: 8, border: '1px solid var(--border)' }}>
                          {int.content}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
