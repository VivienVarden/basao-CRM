'use client'
import { useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Header } from '@/components/layout/Header'
import { useApp } from '@/lib/context'
import { t } from '@/lib/i18n'
import { Partner, PartnerRole } from '@/lib/types'
import { formatDate, getInitials, generateAvatarColor } from '@/lib/utils'
import { formatCompactCurrency } from '@/lib/currencies'

const ROLE_COLORS: Record<PartnerRole, string> = {
  sales: 'badge-blue', partner: 'badge-purple', broker: 'badge-amber',
  internal: 'badge-green', external: 'badge-gray', consultant: 'badge-orange', legal: 'badge-red',
}
const ROLES: PartnerRole[] = ['sales', 'partner', 'broker', 'internal', 'external', 'consultant', 'legal']

export default function PartnersPage() {
  const { store, locale, currency, addPartner, updatePartner, deletePartner } = useApp()
  const [showForm, setShowForm] = useState(false)
  const [editPartner, setEditPartner] = useState<Partner | null>(null)
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState<string>('all')
  const [form, setForm] = useState({ name: '', role: 'sales' as PartnerRole, phone: '', email: '', company: '' })

  const partners = store.partners.filter(p => {
    const q = search.toLowerCase()
    const matchQ = !q || p.name.toLowerCase().includes(q) || p.company.toLowerCase().includes(q) || p.email.toLowerCase().includes(q)
    const matchR = filterRole === 'all' || p.role === filterRole
    return matchQ && matchR
  })

  const setF = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))

  const openEdit = (p: Partner) => {
    setEditPartner(p)
    setForm({ name: p.name, role: p.role, phone: p.phone, email: p.email, company: p.company })
    setShowForm(true)
  }

  const openNew = () => {
    setEditPartner(null)
    setForm({ name: '', role: 'sales', phone: '', email: '', company: '' })
    setShowForm(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editPartner) updatePartner(editPartner.id, form)
    else addPartner(form)
    setShowForm(false)
  }

  return (
    <AppLayout>
      <Header
        title={t(locale, 'partners.title')}
        subtitle={`${store.partners.length} đối tác`}
        actions={<button className="btn btn-primary" onClick={openNew} id="btn-create-partner">+ {t(locale, 'partners.createPartner')}</button>}
      />
      <div className="page-body animate-fade">
        <div className="search-filter-bar">
          <div className="search-input-wrap">
            <span className="search-icon">🔍</span>
            <input placeholder={`${t(locale, 'general.search')} đối tác...`} value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="filter-select" value={filterRole} onChange={e => setFilterRole(e.target.value)}>
            <option value="all">Tất cả vai trò</option>
            {ROLES.map(r => <option key={r} value={r}>{t(locale, `partners.role.${r}` as any)}</option>)}
          </select>
        </div>

        {/* Partner cards grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {partners.map(partner => {
            const partnerDeals = store.deals.filter(d => d.stakeholderIds.includes(partner.id))
            const totalCommission = store.deals.flatMap(d => d.commissions).filter(c => c.partnerId === partner.id)
            const earned = totalCommission.reduce((s, c) => s + c.amount, 0)
            const paid = totalCommission.filter(c => c.status === 'paid').reduce((s, c) => s + c.amount, 0)

            return (
              <div key={partner.id} className="card" style={{ position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `var(--color-blue)` }} />
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
                  <div className="avatar" style={{ width: 44, height: 44, fontSize: 16, background: generateAvatarColor(partner.name) }}>
                    {getInitials(partner.name)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{partner.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{partner.company}</div>
                    <span className={`badge ${ROLE_COLORS[partner.role]}`} style={{ marginTop: 4 }}>
                      {t(locale, `partners.role.${partner.role}` as any)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(partner)}>✏️</button>
                    <button className="btn btn-danger btn-icon btn-sm" onClick={() => { if (confirm('Xóa đối tác?')) deletePartner(partner.id) }}>🗑</button>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
                  {partner.phone && <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>📞 {partner.phone}</div>}
                  {partner.email && <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>📧 {partner.email}</div>}
                </div>

                <div style={{ display: 'flex', gap: 0, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                  <div style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--accent)' }}>{partnerDeals.length}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Deals</div>
                  </div>
                  <div style={{ width: 1, background: 'var(--border)' }} />
                  <div style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-green)' }}>{formatCompactCurrency(earned, currency)}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Tổng HH</div>
                  </div>
                  <div style={{ width: 1, background: 'var(--border)' }} />
                  <div style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-amber)' }}>{formatCompactCurrency(earned - paid, currency)}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Chưa trả</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        {partners.length === 0 && <div className="empty-state"><div className="empty-state-icon">🤝</div><div className="empty-state-title">Chưa có đối tác</div></div>}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal animate-up">
            <div className="modal-header">
              <div className="modal-title">{editPartner ? '✏️ Chỉnh sửa đối tác' : '+ Thêm đối tác'}</div>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">{t(locale, 'general.name')} *</label>
                  <input required value={form.name} onChange={e => setF('name', e.target.value)} placeholder="Tên đối tác..." />
                </div>
                <div className="form-row cols-2">
                  <div className="form-group">
                    <label className="form-label">{t(locale, 'partners.role')}</label>
                    <select value={form.role} onChange={e => setF('role', e.target.value)}>
                      {ROLES.map(r => <option key={r} value={r}>{t(locale, `partners.role.${r}` as any)}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t(locale, 'customers.company')}</label>
                    <input value={form.company} onChange={e => setF('company', e.target.value)} placeholder="Công ty..." />
                  </div>
                </div>
                <div className="form-row cols-2">
                  <div className="form-group">
                    <label className="form-label">{t(locale, 'customers.phone')}</label>
                    <input value={form.phone} onChange={e => setF('phone', e.target.value)} placeholder="0901234567" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t(locale, 'customers.email')}</label>
                    <input type="email" value={form.email} onChange={e => setF('email', e.target.value)} placeholder="email@..." />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>{t(locale, 'general.cancel')}</button>
                <button type="submit" className="btn btn-primary">{t(locale, 'general.save')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
