'use client'
import { useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Header } from '@/components/layout/Header'
import { useApp } from '@/lib/context'
import { t } from '@/lib/i18n'
import { Customer, CustomerStatus, LeadSource } from '@/lib/types'
import { formatDate, getCustomerStatusColor, getInitials, generateAvatarColor } from '@/lib/utils'
import Link from 'next/link'
import { CustomerForm } from '@/components/customers/CustomerForm'

const STATUS_BADGE: Record<CustomerStatus, string> = {
  lead: 'badge-blue', processing: 'badge-amber', closed: 'badge-green', failed: 'badge-red'
}

export default function CustomersPage() {
  const { store, locale, updateCustomer, deleteCustomer } = useApp()
  const [showForm, setShowForm] = useState(false)
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterSource, setFilterSource] = useState<string>('all')

  const customers = store.customers.filter(c => {
    const q = search.toLowerCase()
    const matchQ = !q || c.name.toLowerCase().includes(q) || c.company.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.phone.includes(q)
    const matchS = filterStatus === 'all' || c.status === filterStatus
    const matchSrc = filterSource === 'all' || c.source === filterSource
    return matchQ && matchS && matchSrc
  })

  const statuses: CustomerStatus[] = ['lead', 'processing', 'closed', 'failed']
  const sources: LeadSource[] = ['cold_call', 'referral', 'website', 'event', 'social', 'partner', 'other']

  return (
    <AppLayout>
      <Header
        title={t(locale, 'customers.title')}
        subtitle={`${store.customers.length} khách hàng`}
        actions={
          <button className="btn btn-primary" onClick={() => { setEditCustomer(null); setShowForm(true) }} id="btn-create-customer">
            + {t(locale, 'customers.createCustomer')}
          </button>
        }
      />
      <div className="page-body animate-fade">
        {/* Filters */}
        <div className="search-filter-bar">
          <div className="search-input-wrap">
            <span className="search-icon">🔍</span>
            <input type="text" placeholder={`${t(locale, 'general.search')} khách hàng...`} value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="all">Tất cả trạng thái</option>
            {statuses.map(s => <option key={s} value={s}>{t(locale, `customers.status.${s}` as any)}</option>)}
          </select>
          <select className="filter-select" value={filterSource} onChange={e => setFilterSource(e.target.value)}>
            <option value="all">Tất cả nguồn</option>
            {sources.map(s => <option key={s} value={s}>{t(locale, `customers.source.${s}` as any)}</option>)}
          </select>
        </div>

        {/* Stats mini */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
          {statuses.map(s => {
            const count = store.customers.filter(c => c.status === s).length
            return (
              <div key={s} className="badge"
                onClick={() => setFilterStatus(filterStatus === s ? 'all' : s)}
                style={{ background: filterStatus === s ? `${getCustomerStatusColor(s)}25` : 'var(--bg-hover)', color: getCustomerStatusColor(s), border: `1px solid ${getCustomerStatusColor(s)}30`, fontSize: 12, padding: '5px 12px', cursor: 'pointer' }}>
                {t(locale, `customers.status.${s}` as any)} ({count})
              </div>
            )
          })}
        </div>

        {/* Table */}
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>{t(locale, 'customers.name')}</th>
                  <th>{t(locale, 'customers.company')}</th>
                  <th>{t(locale, 'customers.phone')}</th>
                  <th>{t(locale, 'customers.source')}</th>
                  <th>Status</th>
                  <th>Health Score</th>
                  <th>Deals</th>
                  <th>{t(locale, 'general.createdAt')}</th>
                  <th>{t(locale, 'general.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {customers.map(customer => (
                  <tr key={customer.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="avatar" style={{ background: generateAvatarColor(customer.name) }}>
                          {getInitials(customer.name)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600 }}>
                            <Link href={`/customers/${customer.id}`} style={{ color: 'var(--accent)' }}>{customer.name}</Link>
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{customer.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{customer.company}</td>
                    <td style={{ color: 'var(--text-secondary)', fontFamily: 'monospace', fontSize: 13 }}>{customer.phone}</td>
                    <td>
                      <span className="badge badge-gray">{t(locale, `customers.source.${customer.source}` as any)}</span>
                    </td>
                    <td>
                      <span className={`badge ${STATUS_BADGE[customer.status]}`}>
                        {t(locale, `customers.status.${customer.status}` as any)}
                      </span>
                    </td>
                    <td>
                      {(() => {
                        const score = Math.min(99, (customer.status === 'closed' ? 90 : customer.status === 'processing' ? 65 : customer.status === 'lead' ? 45 : 15) + customer.dealIds.length * 10);
                        const c = score > 75 ? 'var(--color-green)' : score > 40 ? 'var(--color-amber)' : 'var(--color-red)';
                        return (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div style={{ width: 40, height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                              <div style={{ width: `${score}%`, height: '100%', background: c }} />
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 700, color: c }}>{score}</span>
                          </div>
                        )
                      })()}
                    </td>
                    <td>
                      {customer.dealIds.length > 0 ? (
                        <span className="badge badge-blue">{customer.dealIds.length} deals</span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>
                      )}
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{formatDate(customer.createdAt)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <Link href={`/customers/${customer.id}`} className="btn btn-ghost btn-sm">👁</Link>
                        <button className="btn btn-ghost btn-sm" onClick={() => { setEditCustomer(customer); setShowForm(true) }}>✏️</button>
                        <button className="btn btn-danger btn-sm" onClick={() => { if (confirm('Xóa khách hàng?')) deleteCustomer(customer.id) }}>🗑</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {customers.length === 0 && (
              <div className="empty-state">
                <div className="empty-state-icon">👥</div>
                <div className="empty-state-title">{t(locale, 'general.noData')}</div>
                <div className="empty-state-desc">Thêm khách hàng mới để bắt đầu</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showForm && <CustomerForm customer={editCustomer || undefined} onClose={() => { setShowForm(false); setEditCustomer(null) }} />}
    </AppLayout>
  )
}
