'use client'
import { useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Header } from '@/components/layout/Header'
import { useApp } from '@/lib/context'
import { DealStatus } from '@/lib/types'
import { formatCurrency } from '@/lib/currencies'
import Link from 'next/link'
import { t } from '@/lib/i18n'

const COLUMNS: { id: DealStatus, label: string, color: string }[] = [
  { id: 'new', label: 'New', color: 'var(--color-blue)' },
  { id: 'processing', label: 'Processing', color: 'var(--color-amber)' },
  { id: 'negotiating', label: 'Negotiating', color: 'var(--color-purple)' },
  { id: 'closed_won', label: 'Won', color: 'var(--color-green)' },
  { id: 'closed_lost', label: 'Lost', color: 'var(--color-red)' },
]

export default function PipelinePage() {
  const { store, locale, currency, updateDeal } = useApp()
  const [draggedDealId, setDraggedDealId] = useState<string | null>(null)
  const [dragOverCol, setDragOverCol] = useState<DealStatus | null>(null)

  const handleDragStart = (e: React.DragEvent, dealId: string) => {
    setDraggedDealId(dealId)
    e.dataTransfer.effectAllowed = 'move'
    // Hack for drag image
    const el = e.target as HTMLElement
    el.style.opacity = '0.5'
  }

  const handleDragEnd = (e: React.DragEvent) => {
    const el = e.target as HTMLElement
    el.style.opacity = '1'
    setDraggedDealId(null)
    setDragOverCol(null)
  }

  const handleDragOver = (e: React.DragEvent, colId: DealStatus) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (dragOverCol !== colId) setDragOverCol(colId)
  }

  const handleDrop = (e: React.DragEvent, colId: DealStatus) => {
    e.preventDefault()
    setDragOverCol(null)
    if (draggedDealId) {
      updateDeal(draggedDealId, { status: colId })
      
      // Confetti effect if dropped into 'won'
      if (colId === 'closed_won') {
        const createConfetti = () => {
          for(let i=0; i<30; i++) {
            const conf = document.createElement('div');
            conf.className = 'confetti';
            conf.style.left = Math.random() * 100 + 'vw';
            conf.style.animationDuration = (Math.random() * 3 + 2) + 's';
            conf.style.backgroundColor = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6'][Math.floor(Math.random()*4)];
            document.body.appendChild(conf);
            setTimeout(() => conf.remove(), 5000);
          }
        }
        createConfetti()
      }
    }
  }

  return (
    <AppLayout>
      <Header title="Interactive Pipeline" subtitle="Drag & Drop deals to update status" />
      <div className="page-body" style={{ paddingBottom: 0, height: 'calc(100vh - 150px)' }}>
        
        <div style={{ display: 'flex', gap: 16, height: '100%', overflowX: 'auto', paddingBottom: 20 }}>
          {COLUMNS.map(col => {
            const colDeals = store.deals.filter(d => d.status === col.id)
            const colValue = colDeals.reduce((sum, d) => sum + d.value, 0)
            const isOver = dragOverCol === col.id

            return (
              <div 
                key={col.id}
                onDragOver={e => handleDragOver(e, col.id)}
                onDragLeave={() => setDragOverCol(null)}
                onDrop={e => handleDrop(e, col.id)}
                style={{ 
                  flex: '0 0 320px', 
                  background: isOver ? 'var(--bg-hover)' : 'var(--bg-card)',
                  border: isOver ? `2px dashed ${col.color}` : '2px solid transparent',
                  borderRadius: 16, 
                  display: 'flex', flexDirection: 'column',
                  transition: 'all 0.2s ease',
                  overflow: 'hidden'
                }}
              >
                {/* Column Header */}
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 12, height: 12, borderRadius: '50%', background: col.color }} />
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{t(locale, `deals.status.${col.id}` as any) || col.label}</div>
                    </div>
                    <div style={{ background: 'var(--bg-hover)', padding: '2px 8px', borderRadius: 12, fontSize: 12, fontWeight: 700 }}>
                      {colDeals.length}
                    </div>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>
                    {formatCurrency(colValue, currency)}
                  </div>
                </div>

                {/* Column Body */}
                <div style={{ flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {colDeals.map(deal => (
                    <div 
                      key={deal.id}
                      draggable
                      onDragStart={e => handleDragStart(e, deal.id)}
                      onDragEnd={handleDragEnd}
                      style={{
                        background: 'var(--bg-surface)', padding: 16, borderRadius: 12,
                        border: '1px solid var(--border)', cursor: 'grab',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        transform: draggedDealId === deal.id ? 'scale(0.95)' : 'scale(1)',
                      }}
                      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)'}
                      onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'}
                    >
                      <Link href={`/deals/${deal.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, lineHeight: 1.4 }}>{deal.name}</div>
                        <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--color-green)', marginBottom: 12 }}>
                          {formatCurrency(deal.value, deal.currency)}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{deal.bankId}</div>
                          {deal.customerIds.length > 0 && <div style={{ fontSize: 16 }}>👤</div>}
                        </div>
                      </Link>
                    </div>
                  ))}
                  {colDeals.length === 0 && (
                    <div style={{ textAlign: 'center', padding: 32, fontSize: 13, color: 'var(--text-muted)', border: '1px dashed var(--border)', borderRadius: 12 }}>
                      Kéo thả deal vào đây
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <style>{`
        .confetti {
          position: fixed;
          top: -10px;
          width: 10px;
          height: 10px;
          animation: drop linear forwards;
          z-index: 9999;
          border-radius: 2px;
        }
        @keyframes drop {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </AppLayout>
  )
}
