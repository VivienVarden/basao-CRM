'use client'
import dynamic from 'next/dynamic'
import { AppLayout } from '@/components/layout/AppLayout'
import { Header } from '@/components/layout/Header'
import { useApp } from '@/lib/context'
import { t } from '@/lib/i18n'

const DynamicBrainGraph = dynamic(() => import('@/components/graph/BrainGraph'), {
  ssr: false,
  loading: () => <div style={{ height: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>Loading...</div>
})

export default function BrainPage() {
  const { store, locale } = useApp()

  const dealSources = store.deals.map(d => {
    return d.customerIds.map(cid => store.customers.find(c => c.id === cid)?.source).filter(Boolean)[0]
  }).filter(Boolean)

  const sourceCounts = dealSources.reduce((acc, src) => {
    acc[src as string] = (acc[src as string] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const topSource = Object.keys(sourceCounts).sort((a, b) => sourceCounts[b] - sourceCounts[a])[0]

  return (
    <AppLayout>
      <Header
        title={locale === 'vi' ? 'Sơ đồ Não Bộ (Obsidian Brain)' : 'Obsidian Brain'}
        subtitle={locale === 'vi' ? 'Tương quan liên kết giữa các Deal và Nguồn Lead' : 'Network graph mapping Deals to Lead Sources'}
      />
      <div className="page-body animate-fade">
        <div className="grid-3" style={{ marginBottom: 20 }}>
          <div className="card">
            <div className="card-title">{locale === 'vi' ? 'Top Nguồn Lead' : 'Top Lead Source'}</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--accent)', marginTop: 8 }}>
              {topSource ? t(locale, `customers.source.${topSource}` as any) : 'N/A'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
              {locale === 'vi' ? `Đang tạo ra ${sourceCounts[topSource] || 0} deals` : `Generating ${sourceCounts[topSource] || 0} deals`}
            </div>
          </div>
          <div className="card" style={{ gridColumn: 'span 2' }}>
            <div className="card-title" style={{ marginBottom: 8 }}>{locale === 'vi' ? 'Về sơ đồ não bộ (Knowledge Graph)' : 'About Knowledge Graph'}</div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {locale === 'vi' ? 'Sơ đồ dưới đây trực quan hóa dòng chảy của các deal.' : 'The graph below visualizes the flow of deals.'}<br/>
              <b>{locale === 'vi' ? 'Màu xanh dương:' : 'Blue:'}</b> {locale === 'vi' ? 'Các kênh nguồn (Lead Sources). Nguồn nào mang lại nhiều deal sẽ hiển thị to hơn.' : 'Lead Sources. The more deals generated, the bigger the node.'}<br/>
              <b>{locale === 'vi' ? 'Màu tím:' : 'Purple:'}</b> {locale === 'vi' ? 'Khách hàng.' : 'Customers.'}<br/>
              <b>{locale === 'vi' ? 'Màu xanh lá / vàng:' : 'Green / Yellow:'}</b> {locale === 'vi' ? 'Deals (Thành công / Đang xử lý).' : 'Deals (Won / Processing).'}
            </p>
          </div>
        </div>

        <DynamicBrainGraph />
      </div>
    </AppLayout>
  )
}
