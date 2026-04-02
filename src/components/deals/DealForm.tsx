'use client'
import { useState } from 'react'
import { useApp } from '@/lib/context'
import { t } from '@/lib/i18n'
import { Deal, DealStatus, Currency } from '@/lib/types'
import { generateId } from '@/lib/store'
import { SUPPORTED_BANKS } from '@/lib/constants'

interface DealFormProps {
  deal?: Deal
  onClose: () => void
}

const STATUSES: DealStatus[] = ['new', 'processing', 'negotiating', 'closed_won', 'closed_lost']
const CURRENCIES: Currency[] = ['VND', 'USD', 'CNY', 'KRW', 'JPY']

export function DealForm({ deal, onClose }: DealFormProps) {
  const { locale, store, addDeal, updateDeal, currency } = useApp()
  const [form, setForm] = useState({
    name: deal?.name || '',
    value: deal?.value?.toString() || '',
    currency: deal?.currency || currency,
    status: deal?.status || 'new' as DealStatus,
    bankId: deal?.bankId || 'VCB',
    deadline: deal?.deadline?.slice(0, 10) || '',
    description: deal?.description || '',
    customerIds: deal?.customerIds || [] as string[],
    stakeholderIds: deal?.stakeholderIds || [] as string[],
    tags: deal?.tags || [] as string[],
    tagInput: '',
  })

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const data = {
      name: form.name,
      value: parseFloat(form.value) || 0,
      currency: form.currency as Currency,
      status: form.status,
      bankId: form.bankId,
      deadline: form.deadline ? new Date(form.deadline).toISOString() : new Date().toISOString(),
      description: form.description,
      customerIds: form.customerIds,
      stakeholderIds: form.stakeholderIds,
      tags: form.tags,
    }
    if (deal) updateDeal(deal.id, data)
    else addDeal(data)
    onClose()
  }

  const addTag = () => {
    const tag = form.tagInput.trim().toLowerCase()
    if (tag && !form.tags.includes(tag)) set('tags', [...form.tags, tag])
    set('tagInput', '')
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-lg animate-up">
        <div className="modal-header">
          <div className="modal-title">{deal ? (locale === 'vi' ? '✏️ Chỉnh sửa deal' : '✏️ Edit deal') : (locale === 'vi' ? '+ Tạo deal mới' : '+ Create new deal')}</div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">{t(locale, 'deals.dealName')} *</label>
              <input required value={form.name} onChange={e => set('name', e.target.value)} placeholder={locale === 'vi' ? "VD: Thẩm định dự án Sunshine City..." : "Ex: Sunshine City Appraisal..."} />
            </div>
            <div className="form-row cols-3">
              <div className="form-group">
                <label className="form-label">{t(locale, 'deals.value')} *</label>
                <input required type="number" value={form.value} onChange={e => set('value', e.target.value)} placeholder="0" min="0" />
              </div>
              <div className="form-group">
                <label className="form-label">{t(locale, 'general.currency')}</label>
                <select value={form.currency} onChange={e => set('currency', e.target.value)}>
                  {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select value={form.status} onChange={e => set('status', e.target.value as DealStatus)}>
                  {STATUSES.map(s => <option key={s} value={s}>{t(locale, `deals.status.${s}` as any)}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row cols-2">
              <div className="form-group">
                <label className="form-label">{t(locale, 'deals.deadline')}</label>
                <input type="date" value={form.deadline} onChange={e => set('deadline', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">{t(locale, 'deals.customers')}</label>
                <select multiple value={form.customerIds} onChange={e => set('customerIds', Array.from(e.target.selectedOptions, o => o.value))}
                  style={{ height: 80 }}>
                  {store.customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">{locale === 'vi' ? 'Ngân hàng hỗ trợ *' : 'Supported Bank *'}</label>
                <select required value={form.bankId} onChange={e => set('bankId', e.target.value)}>
                  {SUPPORTED_BANKS.map(b => <option key={b.id} value={b.id}>{b.shortName} - {b.name}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">{t(locale, 'deals.description')}</label>
              <textarea value={form.description} onChange={e => set('description', e.target.value)} placeholder={locale === 'vi' ? "Mô tả chi tiết về deal..." : "Detailed description about the deal..."} rows={3} />
            </div>
            <div className="form-group">
              <label className="form-label">{t(locale, 'general.tags')}</label>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <input value={form.tagInput} onChange={e => set('tagInput', e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
                  placeholder={locale === 'vi' ? "Thêm tag rồi Enter..." : "Add tag and press Enter..."} />
                <button type="button" className="btn btn-secondary btn-sm" onClick={addTag}>+</button>
              </div>
              <div className="tags-wrap">
                {form.tags.map(tag => (
                  <span key={tag} className="tag">
                    {tag}
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
