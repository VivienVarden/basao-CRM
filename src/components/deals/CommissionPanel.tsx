'use client'
import { useState } from 'react'
import { useApp } from '@/lib/context'
import { t } from '@/lib/i18n'
import { formatCurrency, formatCompactCurrency } from '@/lib/currencies'
import { Deal, Partner } from '@/lib/types'
import { generateId } from '@/lib/store'

interface CommissionPanelProps {
  deal: Deal
}

export function CommissionPanel({ deal }: CommissionPanelProps) {
  const { locale, store, currency, addCommission, updateCommission, removeCommission } = useApp()
  const [addingFor, setAddingFor] = useState<string | null>(null)
  const [pct, setPct] = useState('')

  const totalPct = deal.commissions.reduce((s, c) => s + c.percentage, 0)
  const remaining = 100 - totalPct
  const totalAmount = deal.commissions.reduce((s, c) => s + c.amount, 0)
  const paidAmount = deal.commissions.filter(c => c.status === 'paid').reduce((s, c) => s + c.amount, 0)

  const handleAdd = (partner: Partner) => {
    const p = parseFloat(pct)
    if (!p || p <= 0 || p > remaining) return
    addCommission(deal.id, {
      partnerId: partner.id,
      partnerName: partner.name,
      percentage: p,
      amount: Math.round(deal.value * p / 100),
      currency: deal.currency,
      status: 'pending',
    })
    setPct('')
    setAddingFor(null)
  }

  return (
    <div className="card" style={{ maxWidth: 680 }}>
      <div className="card-header">
        <div>
          <div className="card-title">💰 {t(locale, 'commission.title')}</div>
          <div className="card-subtitle">Tổng deal: {formatCurrency(deal.value, deal.currency)}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: totalPct > 100 ? 'var(--color-red)' : totalPct === 100 ? 'var(--color-green)' : 'var(--accent)' }}>
            {totalPct}%
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>allocated · còn {remaining}%</div>
        </div>
      </div>

      {/* Progress */}
      <div className="progress-bar" style={{ marginBottom: 20 }}>
        <div className="progress-fill" style={{ width: `${Math.min(totalPct, 100)}%`, background: totalPct > 100 ? 'var(--color-red)' : totalPct === 100 ? 'var(--color-green)' : 'var(--accent)' }} />
      </div>

      {/* Commission rows */}
      <div style={{ marginBottom: 20 }}>
        {deal.commissions.map(comm => {
          const partner = store.partners.find(p => p.id === comm.partnerId)
          return (
            <div key={comm.id} className="commission-row">
              <div style={{ width: 32, height: 32, background: 'var(--accent-glow)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>
                {comm.status === 'paid' ? '✅' : '⏳'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{comm.partnerName}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{partner?.role} · {partner?.company}</div>
              </div>
              <div className="commission-bar-wrap">
                <div className="commission-bar" style={{ width: `${comm.percentage}%` }} />
              </div>
              <div className="commission-pct">{comm.percentage}%</div>
              <div className="commission-amount" style={{ color: comm.status === 'paid' ? 'var(--color-green)' : 'var(--text-secondary)' }}>
                {formatCompactCurrency(comm.amount, currency)}
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {comm.status === 'pending' ? (
                  <button className="btn btn-success btn-sm"
                    onClick={() => updateCommission(deal.id, comm.id, { status: 'paid', paidAt: new Date().toISOString() })}>
                    ✓ Paid
                  </button>
                ) : (
                  <span className="badge badge-green">✓ Đã trả</span>
                )}
                <button className="btn btn-danger btn-sm btn-icon" onClick={() => removeCommission(deal.id, comm.id)}>✕</button>
              </div>
            </div>
          )
        })}
        {deal.commissions.length === 0 && (
          <div className="empty-state" style={{ padding: 24 }}>
            <div className="empty-state-icon">💸</div>
            <div className="empty-state-title">Chưa có phân chia hoa hồng</div>
            <div className="empty-state-desc">Thêm các bên tham gia và phân bổ % bên dưới</div>
          </div>
        )}
      </div>

      {/* Summary */}
      {deal.commissions.length > 0 && (
        <div style={{ display: 'flex', gap: 16, padding: '14px 0', borderTop: '1px solid var(--border)', marginBottom: 20 }}>
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Tổng phân bổ</div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>{formatCompactCurrency(totalAmount, currency)}</div>
          </div>
          <div style={{ width: 1, background: 'var(--border)' }} />
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Đã thanh toán</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-green)' }}>{formatCompactCurrency(paidAmount, currency)}</div>
          </div>
          <div style={{ width: 1, background: 'var(--border)' }} />
          <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Còn lại</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-amber)' }}>{formatCompactCurrency(totalAmount - paidAmount, currency)}</div>
          </div>
        </div>
      )}

      {/* Add commission */}
      {remaining > 0 && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
            + {t(locale, 'commission.addMember')} (còn {remaining}%)
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {store.partners
              .filter(p => !deal.commissions.some(c => c.partnerId === p.id))
              .map(partner => (
                <div key={partner.id}>
                  {addingFor === partner.id ? (
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <input type="number" value={pct} onChange={e => setPct(e.target.value)} placeholder={`% (max ${remaining})`}
                        style={{ width: 110 }} min="1" max={remaining} />
                      <button className="btn btn-primary btn-sm" onClick={() => handleAdd(partner)}>✓</button>
                      <button className="btn btn-secondary btn-sm" onClick={() => setAddingFor(null)}>✕</button>
                    </div>
                  ) : (
                    <button className="btn btn-secondary btn-sm" onClick={() => { setAddingFor(partner.id); setPct('') }}>
                      + {partner.name}
                    </button>
                  )}
                </div>
              ))
            }
          </div>
        </div>
      )}
    </div>
  )
}
