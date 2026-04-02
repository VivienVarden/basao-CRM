'use client'
import { useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Header } from '@/components/layout/Header'
import { useApp } from '@/lib/context'
import { t } from '@/lib/i18n'
import { formatCurrency, formatCompactCurrency } from '@/lib/currencies'
import { formatDate, daysUntilDeadline, getDealStatusColor } from '@/lib/utils'
import { Deal, DealStatus } from '@/lib/types'
import Link from 'next/link'
import { DealForm } from '@/components/deals/DealForm'

const COLUMNS: { status: DealStatus; emoji: string }[] = [
  { status: 'new', emoji: '🆕' },
  { status: 'processing', emoji: '⚙️' },
  { status: 'negotiating', emoji: '🤝' },
  { status: 'closed_won', emoji: '🏆' },
  { status: 'closed_lost', emoji: '❌' },
]

export default function DealsPage() {
  const { store, locale, currency, updateDeal } = useApp()
  const [showForm, setShowForm] = useState(false)
  const [view, setView] = useState<'kanban' | 'list'>('kanban')
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const deals = store.deals.filter(d => {
    const q = search.toLowerCase()
    const matchQ = !q || d.name.toLowerCase().includes(q) || d.description.toLowerCase().includes(q)
    const matchS = filterStatus === 'all' || d.status === filterStatus
    return matchQ && matchS
  })

  const getColumnDeals = (status: DealStatus) => deals.filter(d => d.status === status)

  const handleStatusChange = (dealId: string, newStatus: DealStatus) => {
    updateDeal(dealId, { status: newStatus })
  }

  return (
    <AppLayout>
      <Header
        title={t(locale, 'deals.title')}
        subtitle={`${store.deals.length} deals`}
        actions={
          <button className="btn btn-primary" onClick={() => setShowForm(true)} id="btn-create-deal">
            + {t(locale, 'deals.createDeal')}
          </button>
        }
      />
      <div className="page-body animate-fade">
        {/* Toolbar */}
        <div className="search-filter-bar">
          <div className="search-input-wrap">
            <span className="search-icon">🔍</span>
            <input type="text" placeholder={t(locale, 'general.search') + ' deals...'} value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="all">{t(locale, 'general.all')}</option>
            {COLUMNS.map(c => <option key={c.status} value={c.status}>{t(locale, `deals.status.${c.status}` as any)}</option>)}
          </select>
          <div className="tabs" style={{ margin: 0 }}>
            <button className={`tab-btn ${view === 'kanban' ? 'active' : ''}`} onClick={() => setView('kanban')}>🗂 Kanban</button>
            <button className={`tab-btn ${view === 'list' ? 'active' : ''}`} onClick={() => setView('list')}>📋 List</button>
          </div>
        </div>

        {/* Kanban View */}
        {view === 'kanban' && (
          <div className="kanban-board">
            {COLUMNS.map(col => {
              const colDeals = getColumnDeals(col.status)
              const colValue = colDeals.reduce((s, d) => s + d.value, 0)
              const color = getDealStatusColor(col.status)
              return (
                <div key={col.status} className="kanban-column">
                  <div className="kanban-col-header">
                    <div className="kanban-col-title">
                      <span style={{ color }}>{col.emoji}</span>
                      {t(locale, `deals.status.${col.status}` as any)}
                      <span className="kanban-col-count">{colDeals.length}</span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700 }}>
                      {formatCompactCurrency(colValue, currency)}
                    </div>
                  </div>
                  <div className="kanban-cards">
                    {colDeals.map(deal => (
                      <KanbanCard key={deal.id} deal={deal} locale={locale} currency={currency} />
                    ))}
                    {colDeals.length === 0 && (
                      <div style={{ textAlign: 'center', padding: '24px 12px', color: 'var(--text-muted)', fontSize: 12 }}>
                        Không có deal
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* List View */}
        {view === 'list' && (
          <div className="card" style={{ padding: 0 }}>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>{t(locale, 'deals.dealName')}</th>
                    <th>{t(locale, 'general.currency')}</th>
                    <th>Status</th>
                    <th>{t(locale, 'deals.deadline')}</th>
                    <th>Khách hàng</th>
                    <th>{t(locale, 'general.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {deals.map(deal => {
                    const days = daysUntilDeadline(deal.deadline)
                    const cls = days < 0 ? 'over' : days <= 3 ? 'soon' : 'ok'
                    const cust = deal.customerIds.map(id => store.customers.find(c => c.id === id)?.name).filter(Boolean).join(', ')
                    return (
                      <tr key={deal.id}>
                        <td><Link href={`/deals/${deal.id}`} style={{ color: 'var(--accent)', fontWeight: 600 }}>{deal.name}</Link></td>
                        <td style={{ fontWeight: 700, color: 'var(--color-green)' }}>{formatCurrency(deal.value, deal.currency)}</td>
                        <td>
                          <span className="badge" style={{ background: `${getDealStatusColor(deal.status)}20`, color: getDealStatusColor(deal.status), borderColor: `${getDealStatusColor(deal.status)}30` }}>
                            {t(locale, `deals.status.${deal.status}` as any)}
                          </span>
                        </td>
                        <td><span className={`kanban-card-deadline ${cls}`} style={{ fontSize: 12, fontWeight: 600 }}>{formatDate(deal.deadline)}</span></td>
                        <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{cust || '—'}</td>
                        <td>
                          <Link href={`/deals/${deal.id}`} className="btn btn-ghost btn-sm">Chi tiết →</Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {deals.length === 0 && <div className="empty-state"><div className="empty-state-icon">💼</div><div className="empty-state-title">{t(locale, 'general.noData')}</div></div>}
            </div>
          </div>
        )}
      </div>

      {showForm && <DealForm onClose={() => setShowForm(false)} />}
    </AppLayout>
  )
}

function KanbanCard({ deal, locale, currency }: { deal: Deal; locale: any; currency: any }) {
  const days = daysUntilDeadline(deal.deadline)
  const cls = days < 0 ? 'over' : days <= 3 ? 'soon' : 'ok'
  const color = getDealStatusColor(deal.status)
  return (
    <Link href={`/deals/${deal.id}`} className="kanban-card" style={{ textDecoration: 'none' }}>
      <div className="kanban-left-stripe" style={{ background: color }} />
      <div style={{ paddingLeft: 8 }}>
        <div className="kanban-card-title">{deal.name}</div>
        <div className="kanban-card-value">{formatCompactCurrency(deal.value, currency)}</div>
        {deal.tags.length > 0 && (
          <div className="tags-wrap" style={{ marginBottom: 8 }}>
            {deal.tags.slice(0, 2).map(tag => <span key={tag} className="tag">{tag}</span>)}
          </div>
        )}
        <div className="kanban-card-meta">
          <span className={`kanban-card-deadline ${cls}`} style={{ fontSize: 11 }}>
            📅 {days < 0 ? `${Math.abs(days)}d quá hạn` : days === 0 ? 'Hôm nay' : `${days} ngày`}
          </span>
          {deal.commissions.length > 0 && (
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>💰 {deal.commissions.length} bên</span>
          )}
        </div>
      </div>
    </Link>
  )
}
