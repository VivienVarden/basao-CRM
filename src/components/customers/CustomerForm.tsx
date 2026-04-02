'use client'
import { useState } from 'react'
import { useApp } from '@/lib/context'
import { t } from '@/lib/i18n'
import { Customer, CustomerStatus, LeadSource } from '@/lib/types'

interface CustomerFormProps {
  customer?: Customer
  onClose: () => void
}

const STATUSES: CustomerStatus[] = ['lead', 'processing', 'closed', 'failed']
const SOURCES: LeadSource[] = ['cold_call', 'referral', 'website', 'event', 'social', 'partner', 'other']

export function CustomerForm({ customer, onClose }: CustomerFormProps) {
  const { locale, addCustomer, updateCustomer } = useApp()
  const [form, setForm] = useState({
    name: customer?.name || '',
    phone: customer?.phone || '',
    email: customer?.email || '',
    company: customer?.company || '',
    source: customer?.source || 'referral' as LeadSource,
    status: customer?.status || 'lead' as CustomerStatus,
    tags: customer?.tags || [] as string[],
    tagInput: '',
  })

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const data = { name: form.name, phone: form.phone, email: form.email, company: form.company, source: form.source, status: form.status, tags: form.tags }
    if (customer) updateCustomer(customer.id, data)
    else addCustomer(data)
    onClose()
  }

  const addTag = () => {
    const tag = form.tagInput.trim().toLowerCase()
    if (tag && !form.tags.includes(tag)) set('tags', [...form.tags, tag])
    set('tagInput', '')
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal animate-up">
        <div className="modal-header">
          <div className="modal-title">{customer ? '✏️ Chỉnh sửa khách hàng' : '+ Thêm khách hàng'}</div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">{t(locale, 'customers.name')} *</label>
              <input required value={form.name} onChange={e => set('name', e.target.value)} placeholder="Nguyễn Văn A..." />
            </div>
            <div className="form-row cols-2">
              <div className="form-group">
                <label className="form-label">{t(locale, 'customers.phone')}</label>
                <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="0901234567" />
              </div>
              <div className="form-group">
                <label className="form-label">{t(locale, 'customers.email')}</label>
                <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="email@company.vn" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">{t(locale, 'customers.company')}</label>
              <input value={form.company} onChange={e => set('company', e.target.value)} placeholder="Tên công ty..." />
            </div>
            <div className="form-row cols-2">
              <div className="form-group">
                <label className="form-label">{t(locale, 'customers.source')}</label>
                <select value={form.source} onChange={e => set('source', e.target.value as LeadSource)}>
                  {SOURCES.map(s => <option key={s} value={s}>{t(locale, `customers.source.${s}` as any)}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">{t(locale, 'customers.status')}</label>
                <select value={form.status} onChange={e => set('status', e.target.value as CustomerStatus)}>
                  {STATUSES.map(s => <option key={s} value={s}>{t(locale, `customers.status.${s}` as any)}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">{t(locale, 'general.tags')}</label>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <input value={form.tagInput} onChange={e => set('tagInput', e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
                  placeholder="vip, enterprise, bank..." />
                <button type="button" className="btn btn-secondary btn-sm" onClick={addTag}>+</button>
              </div>
              <div className="tags-wrap">
                {form.tags.map(tag => (
                  <span key={tag} className="tag">{tag}
                    <span className="tag-remove" onClick={() => set('tags', form.tags.filter(t => t !== tag))}>✕</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>{t(locale, 'general.cancel')}</button>
            <button type="submit" className="btn btn-primary">{t(locale, 'general.save')}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
