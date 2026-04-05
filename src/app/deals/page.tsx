'use client'
import { AppLayout } from '@/components/layout/AppLayout'
import { useApp } from '@/lib/context'
import { DealStage } from '@/lib/types'

const STAGES: DealStage[] = ['Sourcing', 'Intro', 'Meeting', 'IC', 'Term Sheet', 'Close']

function formatCurrency(amount: number) {
  if (amount >= 1e6) return `$${(amount / 1e6).toFixed(1)}M`
  if (amount >= 1e3) return `$${(amount / 1e3).toFixed(0)}k`
  return `$${amount}`
}

export default function DealsPage() {
  const { store } = useApp()

  const getSourcePersonName = (sourceId?: string) => {
    if (!sourceId) return 'Direct / Unknown'
    const p = store.people.find(p => p.id === sourceId)
    return p ? p.name : 'Unknown'
  }

  const getCompanyName = (companyId: string) => {
    const o = store.companies.find(o => o.id === companyId)
    return o ? o.name : 'Unknown'
  }

  return (
    <AppLayout>
      <div className="page-body animate-fade" style={{ display: 'flex', flexDirection: 'column', height: '100vh', padding: '32px 32px 0 32px' }}>
        <header style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: 32, marginBottom: 8 }}>Deal Flow Engine</h1>
            <p className="text-muted">Track deals through the pipeline and monitor relationship leverage.</p>
          </div>
          <button className="btn btn-primary">New Deal</button>
        </header>

        <div className="pipeline-board">
          {STAGES.map(stage => {
            const stageDeals = store.deals.filter(d => d.stage === stage)
            
            return (
              <div key={stage} className="pipeline-col">
                <div className="pipeline-header">
                  <div className="pipeline-title">{stage}</div>
                  <div className="pipeline-count">{stageDeals.length}</div>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {stageDeals.map(deal => (
                    <div key={deal.id} className="deal-card animate-slide-up">
                      <div className="deal-title">{deal.name}</div>
                      <div className="deal-org">{getCompanyName(deal.company_id)}</div>
                      <div className="deal-value">{formatCurrency(deal.value)}</div>
                      
                      <div className="deal-meta-row">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ color: 'var(--accent)' }}>✦</span>
                          Source: {getSourcePersonName(deal.sourceId)}
                        </div>
                        <div style={{ fontWeight: 600 }}>{deal.probability}%</div>
                      </div>
                    </div>
                  ))}
                  
                  {stageDeals.length === 0 && (
                    <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', border: '1px dashed var(--border)', borderRadius: 12 }}>
                      No deals
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </AppLayout>
  )
}
