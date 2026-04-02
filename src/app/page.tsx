'use client'
import { AppLayout } from '@/components/layout/AppLayout'
import { Header } from '@/components/layout/Header'
import { useApp } from '@/lib/context'
import { t } from '@/lib/i18n'
import { formatCompactCurrency, formatCurrency } from '@/lib/currencies'
import { formatDate, daysUntilDeadline } from '@/lib/utils'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'

const STATUS_COLORS: Record<string, string> = {
  new: '#3b82f6', processing: '#f59e0b', negotiating: '#8b5cf6',
  closed_won: '#10b981', closed_lost: '#ef4444',
}

export default function DashboardPage() {
  const { store, locale, currency } = useApp()
  const session = { user: { name: 'Trung (Admin)', role: 'admin', email: 'trung@crm.local' } }
  const { deals, customers, tasks } = store

  // Stats
  const activeDeals = deals.filter(d => !['closed_won', 'closed_lost'].includes(d.status))
  const closedWon = deals.filter(d => d.status === 'closed_won')
  const pipelineValue = activeDeals.reduce((s, d) => s + d.value, 0)
  const wonValue = closedWon.reduce((s, d) => s + d.value, 0)
  const newLeads = customers.filter(c => c.status === 'lead').length
  const overdueTasks = tasks.filter(t => t.status !== 'done' && new Date(t.dueDate) < new Date()).length
  const conversionRate = deals.length > 0 ? Math.round((closedWon.length / deals.length) * 100) : 0

  // Chart: Revenue by month (mock distribution from deals)
  const months = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12']
  const revenueByMonth = months.map((m, i) => {
    const pipeline = Math.round(pipelineValue * (0.05 + Math.random() * 0.15));
    const closed = Math.round(wonValue * (0.03 + Math.random() * 0.12));
    const forecast = Math.round(pipeline * 0.8 + closed * 1.5 + Math.random() * 50000); // Admin Forecast
    return { name: m, pipeline, closed, forecast };
  })

  // Chart: Deals by status (pie)
  const dealsByStatus = [
    { name: t(locale, 'deals.status.new'), value: deals.filter(d => d.status === 'new').length, color: '#3b82f6' },
    { name: t(locale, 'deals.status.processing'), value: deals.filter(d => d.status === 'processing').length, color: '#f59e0b' },
    { name: t(locale, 'deals.status.negotiating'), value: deals.filter(d => d.status === 'negotiating').length, color: '#8b5cf6' },
    { name: t(locale, 'deals.status.closed_won'), value: closedWon.length, color: '#10b981' },
    { name: t(locale, 'deals.status.closed_lost'), value: deals.filter(d => d.status === 'closed_lost').length, color: '#ef4444' },
  ].filter(d => d.value > 0)

  // Top deals
  const topDeals = [...activeDeals].sort((a, b) => b.value - a.value).slice(0, 5)

  // Upcoming deadlines
  const upcoming = deals
    .filter(d => !['closed_won', 'closed_lost'].includes(d.status) && daysUntilDeadline(d.deadline) <= 14)
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 5)

  // Today's tasks
  const todayTasks = tasks.filter(t => t.status !== 'done').sort((a, b) =>
    new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  ).slice(0, 5)

  // Sales Top-tier: Daily Focus Widget data
  const upcomingDeals = store.deals.filter(d => ['new', 'processing', 'negotiating'].includes(d.status)).sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()).slice(0, 3)
  const priorityTasks = store.tasks.filter(t => t.status !== 'done' && t.priority === 'urgent').slice(0, 2)

  const stats = [
    { label: t(locale, 'dashboard.totalDeals'), value: deals.length, icon: '💼', sub: `${activeDeals.length} ${t(locale, 'dashboard.active')}`, color: '#0ea5e9', bg: 'rgba(14, 165, 233, 0.1)' },
    { label: t(locale, 'dashboard.pipelineValue'), value: formatCompactCurrency(pipelineValue, currency), icon: '📈', sub: `${activeDeals.length} ${t(locale, 'dashboard.dealsCount')}`, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    { label: t(locale, 'dashboard.closedWon'), value: formatCompactCurrency(wonValue, currency), icon: '🏆', sub: `${closedWon.length} ${t(locale, 'dashboard.dealsCount')}`, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
    { label: t(locale, 'dashboard.newLeads'), value: newLeads, icon: '🎯', sub: t(locale, 'dashboard.customersCount'), color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
    { label: t(locale, 'dashboard.tasksOverdue'), value: overdueTasks, icon: '⚠️', sub: t(locale, 'dashboard.needAttention'), color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
    { label: t(locale, 'dashboard.conversionRate'), value: `${conversionRate}%`, icon: '🔄', sub: t(locale, 'dashboard.winRate'), color: '#06b6d4', bg: 'rgba(6,182,212,0.1)' },
  ]

  const customTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', fontSize: 12 }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: 6 }}>{label}</p>
          {payload.map((p: any, i: number) => (
            <p key={i} style={{ color: p.color, fontWeight: 600 }}>{p.name}: {formatCompactCurrency(p.value, currency)}</p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <AppLayout>
      <Header title={t(locale, 'dashboard.title')} subtitle="Basao CRM — B2B Deal Management" />
      <div className="page-body animate-fade">

        {/* Stats grid */}
        <div className="stats-grid">
          {stats.map((s, i) => (
            <div key={i} className="stat-card" style={{ '--stat-color': s.color, '--stat-bg': s.bg } as React.CSSProperties}>
              <div className="stat-icon" style={{ background: s.bg }}>{s.icon}</div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
              <div className="stat-change up">↑ {s.sub}</div>
            </div>
          ))}
        </div>

        {/* Sales Feature 3: My Focus Mode */}
        {session?.user?.role === 'sales' && (
          <div style={{ background: 'linear-gradient(135deg, rgba(14,165,233,0.08), rgba(99,102,241,0.05))', borderRadius: 16, border: '1px solid rgba(14,165,233,0.3)', padding: 24, marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ fontSize: 24 }}>🎯</div>
              <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: 'var(--accent)' }}>Daily Focus Mode</h2>
            </div>
            <div className="grid-2" style={{ gap: 16 }}>
              {/* Deals Block */}
              <div style={{ background: 'var(--bg-surface)', padding: 16, borderRadius: 12, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-red)', marginBottom: 12, display: 'flex', justifyContent: 'space-between' }}>
                  <span>⏰ SẮP HẾT HẠN</span>
                  <span>{upcomingDeals.length} Deal</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {upcomingDeals.map(d => (
                    <Link key={d.id} href={`/deals/${d.id}`} style={{ display: 'flex', justifyContent: 'space-between', padding: 8, background: 'var(--bg-base)', borderRadius: 8, textDecoration: 'none', color: 'inherit' }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{d.name.length > 30 ? d.name.substring(0,30) + '...' : d.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--color-amber)', fontWeight: 700 }}>{new Date(d.deadline).toLocaleDateString()}</div>
                    </Link>
                  ))}
                  {upcomingDeals.length === 0 && <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Mọi thứ trong tầm kiểm soát!</div>}
                </div>
              </div>
              
              {/* Tasks Block */}
              <div style={{ background: 'var(--bg-surface)', padding: 16, borderRadius: 12, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-amber)', marginBottom: 12, display: 'flex', justifyContent: 'space-between' }}>
                  <span>🔥 TASK KHẨN CẤP</span>
                  <span>{priorityTasks.length} Task</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {priorityTasks.length === 0 ? <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Bạn đã hoàn thành mọi task khẩn cấp!</div> :
                    priorityTasks.map(t => (
                    <div key={t.id} style={{ display: 'flex', flexDirection: 'column', padding: 8, background: 'var(--bg-base)', borderRadius: 8 }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{t.title}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Charts Row */}
        <div className="grid-2" style={{ marginBottom: 20 }}>
          {/* Revenue chart */}
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {t(locale, 'dashboard.revenueChart')}
                  {session?.user?.role === 'admin' && <span style={{ fontSize: 11, color: '#8b5cf6', background: 'rgba(139,92,246,0.1)', padding: '2px 8px', borderRadius: 12 }}>✨ AI Forecast Enabled</span>}
                </div>
                <div className="card-subtitle">{t(locale, 'dashboard.revenueChartSub')}</div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={revenueByMonth}>
                <defs>
                  <linearGradient id="gPipeline" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gClosed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => formatCompactCurrency(v, currency)} />
                <Tooltip content={customTooltip} />
                <Area type="monotone" dataKey="pipeline" name="Pipeline" stroke="#0ea5e9" strokeWidth={2} fill="url(#gPipeline)" />
                <Area type="monotone" dataKey="closed" name="Closed Won" stroke="#10b981" strokeWidth={2} fill="url(#gClosed)" />
                {session?.user?.role === 'admin' && (
                  <Area type="monotone" dataKey="forecast" name="AI Forecast (Admin)" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="5 5" fill="none" />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Deals by status pie */}
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">{t(locale, 'dashboard.dealsByStatus')}</div>
                <div className="card-subtitle">{t(locale, 'dashboard.dealsByStatusSub').replace('{count}', deals.length.toString())}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <ResponsiveContainer width="50%" height={200}>
                <PieChart>
                  <Pie data={dealsByStatus} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" strokeWidth={0}>
                    {dealsByStatus.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div style={{ flex: 1 }}>
                {dealsByStatus.map((d, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)', flex: 1 }}>{d.name}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid-3" style={{ '--cols': 3 } as React.CSSProperties}>

          {/* Top Deals */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">{t(locale, 'dashboard.topDeals')}</div>
              <Link href="/deals" style={{ fontSize: 12, color: 'var(--accent)' }}>{t(locale, 'general.viewAll')}</Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {topDeals.map(deal => (
                <Link key={deal.id} href={`/deals/${deal.id}`} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'var(--bg-hover)', borderRadius: 'var(--radius-sm)', transition: 'all 0.15s ease', textDecoration: 'none' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_COLORS[deal.status], flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }} className="truncate">{deal.name}</div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)', whiteSpace: 'nowrap' }}>{formatCompactCurrency(deal.value, currency)}</div>
                </Link>
              ))}
              {topDeals.length === 0 && <div className="empty-state" style={{ padding: 20 }}><div className="empty-state-icon" style={{ fontSize: 28 }}>📭</div><div className="empty-state-desc">{t(locale, 'general.noDeals')}</div></div>}
            </div>
          </div>

          {/* Upcoming Deadlines */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">{t(locale, 'dashboard.upcomingDeadlines')}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {upcoming.map(deal => {
                const days = daysUntilDeadline(deal.deadline)
                const cls = days < 0 ? 'over' : days <= 3 ? 'soon' : 'ok'
                return (
                  <Link key={deal.id} href={`/deals/${deal.id}`} style={{ display: 'flex', gap: 10, padding: '10px 12px', background: 'var(--bg-hover)', borderRadius: 'var(--radius-sm)', textDecoration: 'none' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }} className="truncate">{deal.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{formatDate(deal.deadline)}</div>
                    </div>
                    <div className={`kanban-card-deadline ${cls}`} style={{ fontSize: 12, fontWeight: 700, textAlign: 'right', flexShrink: 0 }}>
                      {days < 0 ? t(locale, 'dashboard.overdueDays').replace('{days}', Math.abs(days).toString()) : days === 0 ? t(locale, 'dashboard.today') : `${days}d`}
                    </div>
                  </Link>
                )
              })}
              {upcoming.length === 0 && <div className="empty-state" style={{ padding: 20 }}><div className="empty-state-icon" style={{ fontSize: 28 }}>📅</div><div className="empty-state-desc">{t(locale, 'dashboard.noUpcomingDeadlines')}</div></div>}
            </div>
          </div>

          {/* Today Tasks */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">{t(locale, 'dashboard.todayTasks')}</div>
              <Link href="/tasks" style={{ fontSize: 12, color: 'var(--accent)' }}>{t(locale, 'general.viewAll')}</Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {todayTasks.map(task => {
                const pColor = task.priority === 'urgent' ? 'var(--color-red)' : task.priority === 'high' ? 'var(--color-orange)' : task.priority === 'medium' ? 'var(--color-amber)' : 'var(--text-muted)'
                return (
                  <div key={task.id} style={{ display: 'flex', gap: 10, padding: '10px 12px', background: 'var(--bg-hover)', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: pColor, marginTop: 5, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }} className="truncate">{task.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{formatDate(task.dueDate)}</div>
                    </div>
                  </div>
                )
              })}
              {todayTasks.length === 0 && <div className="empty-state" style={{ padding: 20 }}><div className="empty-state-icon" style={{ fontSize: 28 }}>✅</div><div className="empty-state-desc">{t(locale, 'dashboard.noTasks')}</div></div>}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
