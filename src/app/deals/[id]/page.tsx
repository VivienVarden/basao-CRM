'use client'
import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout/AppLayout'
import { Header } from '@/components/layout/Header'
import { useApp } from '@/lib/context'
import { t } from '@/lib/i18n'
import { formatCurrency, formatCompactCurrency } from '@/lib/currencies'
import { formatDate, formatRelativeDate, getDealStatusColor, daysUntilDeadline } from '@/lib/utils'
import { DealStatus, Commission } from '@/lib/types'
import { DealForm } from '@/components/deals/DealForm'
import { CommissionPanel } from '@/components/deals/CommissionPanel'
import { ProposalGenerator } from '@/components/deals/ProposalGenerator'
import { SUPPORTED_BANKS } from '@/lib/constants'

const STATUSES: DealStatus[] = ['new', 'processing', 'negotiating', 'closed_won', 'closed_lost']
const STATUS_EMOJIS: Record<DealStatus, string> = { new: '🆕', processing: '⚙️', negotiating: '🤝', closed_won: '🏆', closed_lost: '❌' }

export default function DealDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { store, locale, currency, updateDeal, deleteDeal, addDealTimelineEvent } = useApp()
  const [editOpen, setEditOpen] = useState(false)
  const [showProposal, setShowProposal] = useState(false)
  const [tab, setTab] = useState<'overview' | 'timeline' | 'commission'>('overview')
  const [noteText, setNoteText] = useState('')

  const deal = store.deals.find(d => d.id === params.id)
  if (!deal) return (
    <AppLayout>
      <Header title={locale === 'vi' ? "Deal không tồn tại" : "Deal not found"} />
      <div className="page-body"><div className="empty-state"><div className="empty-state-icon">🔍</div><div className="empty-state-title">{locale === 'vi' ? 'Deal không tồn tại' : 'Deal not found'}</div></div></div>
    </AppLayout>
  )

  const customers = deal.customerIds.map(id => store.customers.find(c => c.id === id)).filter(Boolean)
  const stakeholders = deal.stakeholderIds.map(id => store.partners.find(p => p.id === id)).filter(Boolean)
  const days = daysUntilDeadline(deal.deadline)
  const color = getDealStatusColor(deal.status)
  const totalCommission = deal.commissions.reduce((s, c) => s + c.percentage, 0)
  const paidCommission = deal.commissions.filter(c => c.status === 'paid').reduce((s, c) => s + c.amount, 0)

  // Top-tier Feature: AI Win Probability Scorer
  const calculateWinProbability = () => {
    if (deal.status === 'closed_won') return 100;
    if (deal.status === 'closed_lost') return 0;
    let base = deal.status === 'new' ? 15 : deal.status === 'processing' ? 40 : 70;
    base += Math.min(15, deal.timeline.length * 2);
    base += Math.min(10, deal.stakeholderIds.length * 4);
    base += days > 0 && days <= 5 ? 5 : 0; // urgency bump
    return Math.min(99, base);
  }
  const winProbability = calculateWinProbability();
  const probColor = winProbability < 40 ? 'var(--color-red)' : winProbability < 70 ? 'var(--color-amber)' : 'var(--color-green)';

  // Sales Feature 1: Smart Next-Action Suggestion
  const getNextAction = () => {
    if (deal.status === 'closed_won') return '🎉 Thành công! Hãy gửi email cảm ơn khách hàng nội trong tuần này.'
    if (deal.status === 'closed_lost') return '💡 Phân tích nguyên nhân thất bại và đặt lịch liên hệ lại sau 3 tháng.'
    if (deal.status === 'new') return '📞 Gọi điện thoại trực tiếp hoặc gửi email giới thiệu package ngay.'
    if (days < 3) return '⚠️ Sắp hết hạn! Cần push mạnh stakeholder hoặc xin gia hạn hợp đồng.'
    if (deal.timeline.length === 0) return '📝 Deal trống. Hãy lên một cuộc hẹn hoặc tạo email.'
    return '🤝 Đang đàm phán. Hãy chuẩn bị sẵn hợp đồng nháp.'
  }

  const handleStatusChange = (newStatus: DealStatus) => {
    updateDeal(deal.id, { status: newStatus })
    addDealTimelineEvent(deal.id, `${locale === 'vi' ? 'Trạng thái chuyển sang' : 'Status changed to'}: ${t(locale, `deals.status.${newStatus}` as any)}`, 'status_change')
  }

  const handleAddNote = () => {
    if (!noteText.trim()) return
    addDealTimelineEvent(deal.id, noteText.trim(), 'note')
    setNoteText('')
  }

  const handleDelete = () => {
    if (confirm(locale === 'vi' ? 'Xác nhận xóa deal này?' : 'Confirm delete this deal?')) {
      deleteDeal(deal.id)
      router.push('/deals')
    }
  }

  return (
    <AppLayout>
      <Header
        title={deal.name}
        subtitle={`${STATUS_EMOJIS[deal.status]} ${t(locale, `deals.status.${deal.status}` as any)}`}
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setShowProposal(true)}>📄 {locale === 'vi' ? 'Tạo Proposal' : 'Generate Proposal'}</button>
            <button className="btn btn-secondary btn-sm" onClick={() => setEditOpen(true)}>✏️ {t(locale, 'general.edit')}</button>
            <button className="btn btn-danger btn-sm" onClick={handleDelete}>🗑</button>
          </div>
        }
      />
      <div className="page-body animate-fade">
        {/* Top info bar */}
        <div className="card" style={{ marginBottom: 20, display: 'flex', gap: 32, alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{locale === 'vi' ? 'Giá trị' : 'Value'}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--color-green)' }}>{formatCurrency(deal.value, deal.currency)}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Deadline</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: days < 0 ? 'var(--color-red)' : days <= 3 ? 'var(--color-amber)' : 'var(--text-primary)' }}>
              {formatDate(deal.deadline)} {days < 0 ? `(${Math.abs(days)}d ${locale === 'vi' ? 'quá hạn' : 'overdue'})` : days === 0 ? `(${locale === 'vi' ? 'Hôm nay' : 'Today'})` : `(${locale === 'vi' ? 'còn ' : ''}${days}d)`}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{locale === 'vi' ? 'Hoa hồng' : 'Commission'}</div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{totalCommission}% allocated · {formatCompactCurrency(paidCommission, currency)} paid</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{locale === 'vi' ? 'Ngân hàng' : 'Bank'}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent)' }}>
              {SUPPORTED_BANKS.find(b => b.id === deal.bankId)?.shortName || deal.bankId}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>🧠 AI Win Probability</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 40, height: 40, position: 'relative' }}>
                <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                  <circle cx="18" cy="18" r="16" fill="none" stroke="var(--bg-hover)" strokeWidth="3" />
                  <circle cx="18" cy="18" r="16" fill="none" stroke={probColor} strokeWidth="3" strokeDasharray={`${winProbability}, 100`} strokeLinecap="round" style={{ transition: 'stroke-dasharray 1s ease-out' }} />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: probColor }}>
                  {winProbability}%
                </div>
              </div>
            </div>
          </div>
          {/* Status changer */}
          <div style={{ marginLeft: 'auto' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{locale === 'vi' ? 'Chuyển trạng thái' : 'Change status'}</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {STATUSES.map(s => (
                <button key={s} onClick={() => handleStatusChange(s)}
                  className="btn btn-sm"
                  style={{ background: s === deal.status ? color : 'var(--bg-hover)', color: s === deal.status ? 'white' : 'var(--text-secondary)', border: s === deal.status ? 'none' : '1px solid var(--border)', fontSize: 11 }}>
                  {STATUS_EMOJIS[s]} {t(locale, `deals.status.${s}` as any)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* AI Next Action Card */}
        <div style={{ background: 'var(--accent-glow)', border: '1px solid var(--accent)', padding: '16px 20px', borderRadius: 12, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontSize: 28 }}>🤖</div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>AI Next-Action Predictor</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{getNextAction()}</div>
          </div>
        </div>

        {/* Super CRM Feature: Document E-Signing Tracker */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-title" style={{ marginBottom: 16 }}>✍️ Contract & E-Signature Tracker</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 16, left: 24, right: 24, height: 2, background: 'var(--border)', zIndex: 0 }} />
            <div style={{ position: 'absolute', top: 16, left: 24, width: deal.status === 'closed_won' ? '100%' : deal.status === 'negotiating' ? '66%' : '33%', height: 2, background: 'var(--color-green)', zIndex: 1, transition: 'width 1s ease' }} />
            
            {[
              { step: 'Generated', icon: '📄', active: true },
              { step: 'Sent for Sig', icon: '✉️', active: ['negotiating', 'closed_won'].includes(deal.status) },
              { step: 'Client Viewed', icon: '👀', active: ['negotiating', 'closed_won'].includes(deal.status) },
              { step: 'Signed & Secured', icon: '✅', active: deal.status === 'closed_won' }
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
                <div style={{ 
                  width: 34, height: 34, borderRadius: '50%', background: s.active ? 'var(--color-green)' : 'var(--bg-surface)', 
                  border: `2px solid ${s.active ? 'var(--color-green)' : 'var(--border)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, marginBottom: 8,
                  boxShadow: s.active ? '0 0 12px rgba(16,185,129,0.4)' : 'none', color: s.active ? 'white' : 'inherit', transition: 'all 0.3s'
                }}>
                  {s.icon}
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: s.active ? 'var(--text-primary)' : 'var(--text-muted)' }}>{s.step}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button className={`tab-btn ${tab === 'overview' ? 'active' : ''}`} onClick={() => setTab('overview')}>📋 {locale === 'vi' ? 'Tổng quan' : 'Overview'}</button>
          <button className={`tab-btn ${tab === 'timeline' ? 'active' : ''}`} onClick={() => setTab('timeline')}>📅 Timeline ({deal.timeline.length})</button>
          <button className={`tab-btn ${tab === 'commission' ? 'active' : ''}`} onClick={() => setTab('commission')}>💰 {locale === 'vi' ? 'Hoa hồng' : 'Commission'} ({deal.commissions.length})</button>
        </div>

        {tab === 'overview' && (
          <div className="grid-2">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Description */}
              <div className="card">
                <div className="card-title" style={{ marginBottom: 10 }}>📝 {locale === 'vi' ? 'Mô tả' : 'Description'}</div>
                <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{deal.description || (locale === 'vi' ? 'Chưa có mô tả' : 'No description')}</p>
              </div>
              {/* Tags */}
              {deal.tags.length > 0 && (
                <div className="card">
                  <div className="card-title" style={{ marginBottom: 10 }}>🏷️ Tags</div>
                  <div className="tags-wrap">{deal.tags.map(tag => <span key={tag} className="tag">{tag}</span>)}</div>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Customers */}
              <div className="card">
                <div className="card-title" style={{ marginBottom: 12 }}>👥 {t(locale, 'deals.customers')}</div>
                {customers.length > 0 ? customers.map(c => c && (
                  <div key={c.id} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ width: 34, height: 34, background: 'var(--accent-glow)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>👤</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{c.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.company}</div>
                    </div>
                  </div>
                )) : <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>{locale === 'vi' ? 'Chưa có khách hàng' : 'No customers mapped'}</div>}
              </div>
              {/* Stakeholders */}
              <div className="card">
                <div className="card-title" style={{ marginBottom: 12 }}>🤝 {t(locale, 'deals.stakeholders')}</div>
                {stakeholders.length > 0 ? stakeholders.map(p => p && (
                  <div key={p.id} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ width: 34, height: 34, background: 'rgba(139,92,246,0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🤝</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.role} · {p.company}</div>
                    </div>
                  </div>
                )) : <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>{locale === 'vi' ? 'Chưa có stakeholder' : 'No stakeholder mapped'}</div>}
              </div>
            </div>
          </div>
        )}

        {tab === 'timeline' && (
          <div className="card" style={{ maxWidth: 640 }}>
            <div className="card-header">
              <div className="card-title">📅 {t(locale, 'deals.timeline')}</div>
            </div>
            {/* Add note */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
              <input value={noteText} onChange={e => setNoteText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleAddNote() }}
                placeholder={locale === 'vi' ? "Thêm ghi chú, note..." : "Add note..."} />
              <button className="btn btn-primary btn-sm" onClick={handleAddNote}>{t(locale, 'general.add')}</button>
            </div>
            <div className="timeline">
              {[...deal.timeline].reverse().map(event => (
                <div key={event.id} className="timeline-item">
                  <div className="timeline-dot">{event.type === 'status_change' ? '🔄' : event.type === 'meeting' ? '☕' : event.type === 'call' ? '📞' : '📝'}</div>
                  <div className="timeline-content">
                    <div className="timeline-text">{event.content}</div>
                    <div className="timeline-time">{formatRelativeDate(event.createdAt)} · {event.createdBy}</div>
                  </div>
                </div>
              ))}
              {deal.timeline.length === 0 && <div className="empty-state" style={{ padding: 20 }}><div className="empty-state-icon">📭</div><div className="empty-state-desc">{locale === 'vi' ? 'Chưa có lịch sử' : 'No timeline history'}</div></div>}
            </div>
          </div>
        )}

        {tab === 'commission' && <CommissionPanel deal={deal} />}
      </div>
      {editOpen && <DealForm deal={deal} onClose={() => setEditOpen(false)} />}
      {showProposal && <ProposalGenerator deal={deal} onClose={() => setShowProposal(false)} />}
    </AppLayout>
  )
}
