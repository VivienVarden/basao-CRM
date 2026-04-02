'use client'
import { useEffect, useRef, useState, useMemo } from 'react'
import ForceGraph2D from 'react-force-graph-2d'
import { useApp } from '@/lib/context'
import { t } from '@/lib/i18n'

export default function BrainGraph() {
  const { store, locale } = useApp()
  const fgRef = useRef<any>()
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })

  useEffect(() => {
    const updateDim = () => {
      const container = document.getElementById('graph-container')
      if (container) {
        setDimensions({ width: container.clientWidth, height: window.innerHeight - 200 })
      }
    }
    updateDim()
    window.addEventListener('resize', updateDim)
    return () => window.removeEventListener('resize', updateDim)
  }, [])

  const graphData = useMemo(() => {
    const nodes: any[] = []
    const links: any[] = []
    const sourceCount: Record<string, number> = {}

    // Sources nodes
    const sources = ['cold_call', 'referral', 'website', 'event', 'social', 'partner', 'other']
    sources.forEach(src => {
      sourceCount[src] = 0
      nodes.push({ id: `src_${src}`, name: t(locale, `customers.source.${src}` as any), group: 'source', val: 0 })
    })

    // Customers nodes & links
    store.customers.forEach(c => {
      nodes.push({ id: `cust_${c.id}`, name: c.company || c.name, group: 'customer', val: 5 })
      links.push({ source: `src_${c.source}`, target: `cust_${c.id}`, value: 1 })
      if (c.dealIds.length > 0) {
        sourceCount[c.source] += c.dealIds.length
      }
    })

    // Deals nodes & links
    store.deals.forEach(d => {
      nodes.push({ id: `deal_${d.id}`, name: d.name, group: 'deal', val: 3, status: d.status })
      d.customerIds.forEach(cid => {
        links.push({ source: `cust_${cid}`, target: `deal_${d.id}`, value: 1 })
      })
    })

    // Update source values based on deals generated
    nodes.forEach(n => {
      if (n.group === 'source') {
        const srcKey = n.id.replace('src_', '')
        n.val = 10 + (sourceCount[srcKey] || 0) * 3 // Size scales with deals
      }
    })

    return { nodes, links }
  }, [store.customers, store.deals, locale])

  return (
    <div id="graph-container" style={{ width: '100%', background: 'var(--bg-card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', overflow: 'hidden' }}>
      <ForceGraph2D
        ref={fgRef}
        width={dimensions.width}
        height={dimensions.height}
        graphData={graphData}
        nodeColor={(node: any) => {
          if (node.group === 'source') return '#3b82f6'
          if (node.group === 'customer') return '#8b5cf6'
          if (node.group === 'deal') {
            return node.status === 'closed_won' ? '#10b981' : node.status === 'closed_lost' ? '#ef4444' : '#f59e0b'
          }
          return '#999'
        }}
        nodeRelSize={4}
        linkDirectionalParticles={2}
        linkDirectionalParticleSpeed={d => d.value * 0.005}
        linkColor={() => 'rgba(255,255,255,0.1)'}
        nodeCanvasObject={(node: any, ctx, globalScale) => {
          const label = node.name
          const fontSize = 12 / globalScale
          ctx.font = `${fontSize}px Sans-Serif`
          const textWidth = ctx.measureText(label).width
          const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2)

          ctx.fillStyle = 'rgba(15, 23, 42, 0.8)'
          ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, bckgDimensions[0], bckgDimensions[1])

          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillStyle = node.group === 'source' ? '#60a5fa' : node.group === 'customer' ? '#c084fc' : node.status === 'closed_won' ? '#34d399' : '#fbbf24'
          ctx.fillText(label, node.x, node.y)
        }}
        onNodeDragEnd={node => {
          // Pin node
          node.fx = node.x
          node.fy = node.y
        }}
      />
    </div>
  )
}
