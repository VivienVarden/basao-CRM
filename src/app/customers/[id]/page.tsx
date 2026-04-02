'use client'
import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout/AppLayout'
import { Header } from '@/components/layout/Header'
import { useApp } from '@/lib/context'
import { t } from '@/lib/i18n'
import { formatDate, formatRelativeDate, getCustomerStatusColor, generateAvatarColor, getInitials } from '@/lib/utils'
import { formatCompactCurrency } from '@/lib/currencies'
import { CustomerForm } from '@/components/customers/CustomerForm'
import Link from 'next/link'

export default function CustomerDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { store, locale, currency, deleteCustomer, addCustomerNote } = useApp()
  const [editOpen, setEditOpen] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [noteType, setNoteType] = useState<'note' | 'call' | 'meeting' | 'email'>('note')

  const customer = store.customers.find(c => c.id === params.id)
  if (!customer) return (
    <AppLayout><Header title="Not found" />
      <div className="page-body"><div className="empty-state"><div className="empty-state-icon">🔍</div><div className="empty-state-title">Khách hàng không tồn tại</div></div></div>
    </AppLayout>
  )

  const linkedDeals = store.deals.filter(d => d.customerIds.includes(customer.id))
  const statusColor = getCustomerStatusColor(customer.status)

  const handleAddNote = () => {
    if (!noteText.trim()) return
    addCustomerNote(customer.id, noteText.trim(), noteType)
    setNoteText('')
  }

  const handleDelete = () => {
    if (confirm('Xóa khách hàng này?')) { deleteCustomer(customer.id); router.push('/customers') }
  }

  const noteEmoji: Record<string, string> = { note: '📝', call: '📞', meeting: '☕', email: '📧', task: '✅' }

  return (
    <AppLayout>
      <Header
        title={customer.name}
        subtitle={customer.company}
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setEditOpen(true)}>✏️ Sửa</button>
            <button className="btn btn-danger btn-sm" onClick={handleDelete}>🗑</button>
          </div>
        }
      />
      <div className="page-body animate-fade">
        <div className="grid-2" style={{ alignItems: 'start' }}>
          {/* Left */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Profile card */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                <div className="avatar" style={{ width: 56, height: 56, fontSize: 22, background: generateAvatarColor(customer.name) }}>
                  {getInitials(customer.name)}
                </div>
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 800 }}>{customer.name}</h2>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{customer.company}</div>
                  <span style={{ background: `${statusColor}20`, color: statusColor, border: `1px solid ${statusColor}30`, fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 10, marginTop: 4, display: 'inline-block' }}>
                    {t(locale, `customers.status.${customer.status}` as any)}
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { icon: '📞', label: 'Phone', value: customer.phone },
                  { icon: '📧', label: 'Email', value: customer.email },
                  { icon: '🏢', label: 'Company', value: customer.company },
                  { icon: '🎯', label: 'Source', value: t(locale, `customers.source.${customer.source}` as any) },
                  { icon: '📅', label: 'Created', value: formatDate(customer.createdAt) },
                ].filter(r => r.value).map(row => (
                  <div key={row.label} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <span style={{ fontSize: 15, width: 22 }}>{row.icon}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', width: 64 }}>{row.label}</span>
                    <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{row.value}</span>
                  </div>
                ))}
              </div>
              {customer.tags.length > 0 && (
                <div className="tags-wrap" style={{ marginTop: 14 }}>
                  {customer.tags.map(tag => <span key={tag} className="tag">{tag}</span>)}
                </div>
              )}
            </div>

            {/* Linked Deals */}
            <div className="card">
              <div className="card-title" style={{ marginBottom: 12 }}>💼 {t(locale, 'customers.linkedDeals')} ({linkedDeals.length})</div>
              {linkedDeals.map(deal => (
                <Link key={deal.id} href={`/deals/${deal.id}`} style={{ display: 'flex', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--border)', textDecoration: 'none' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--accent)' }} className="truncate">{deal.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{formatDate(deal.deadline)}</div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-green)', whiteSpace: 'nowrap' }}>{formatCompactCurrency(deal.value, currency)}</div>
                </Link>
              ))}
              {linkedDeals.length === 0 && <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Chưa có deal nào</div>}
            </div>
          </div>

          {/* Right - Activity Log */}
          <div className="card">
            <div className="card-title" style={{ marginBottom: 14 }}>📋 {t(locale, 'customers.activityLog')}</div>
            {/* Add note */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                {(['note', 'call', 'meeting', 'email'] as const).map(type => (
                  <button key={type} onClick={() => setNoteType(type)}
                    className="btn btn-sm"
                    style={{ background: noteType === type ? 'var(--accent)' : 'var(--bg-hover)', color: noteType === type ? 'white' : 'var(--text-secondary)', border: noteType === type ? 'none' : '1px solid var(--border)', fontSize: 11 }}>
                    {noteEmoji[type]} {type}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input value={noteText} onChange={e => setNoteText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleAddNote() }}
                  placeholder={`Thêm ${noteType}...`} />
                <button className="btn btn-primary btn-sm" onClick={handleAddNote}>{t(locale, 'general.add')}</button>
              </div>
            </div>
            {/* Notes list */}
            <div className="timeline">
              {[...customer.notes].reverse().map(note => (
                <div key={note.id} className="timeline-item">
                  <div className="timeline-dot">{noteEmoji[note.type] || '📝'}</div>
                  <div className="timeline-content">
                    <div className="timeline-text">{note.content}</div>
                    <div className="timeline-time">{formatRelativeDate(note.createdAt)} · {note.createdBy}</div>
                  </div>
                </div>
              ))}
              {customer.notes.length === 0 && <div className="empty-state" style={{ padding: 20 }}><div className="empty-state-icon">📭</div><div className="empty-state-desc">Chưa có hoạt động nào</div></div>}
            </div>
          </div>
        </div>
      </div>
      {editOpen && <CustomerForm customer={customer} onClose={() => setEditOpen(false)} />}
    </AppLayout>
  )
}
