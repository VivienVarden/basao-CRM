'use client'

import { useState, useMemo } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { useApp } from '@/lib/context'
import { RelationshipGraph } from '@/components/graph/RelationshipGraph'
import {
  buildGraph,
  findIntroPaths,
  analyzeDealIntelligence,
  GraphNode,
} from '@/lib/graphEngine'
import { Person, Deal } from '@/lib/types'

type Tab = 'graph' | 'intros' | 'deals'

export default function NetworkPage() {
  const { store } = useApp()
  const [tab, setTab] = useState<Tab>('graph')
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)
  const [focusNodeId, setFocusNodeId] = useState<string | null>(null)

  // Build the graph once
  const graph = useMemo(() => buildGraph(store), [store])

  // The "you" node — first person node as proxy for the current user
  const youNodeId = graph.nodes.find(n => n.type === 'person')?.id ?? null

  // Layer 3 — Inference
  const introPaths = useMemo(
    () => (youNodeId ? findIntroPaths(youNodeId, graph) : []),
    [youNodeId, graph]
  )

  const dealIntel = useMemo(() => analyzeDealIntelligence(graph, store), [graph, store])

  const handleNodeClick = (node: GraphNode) => {
    setSelectedNode(prev => (prev?.id === node.id ? null : node))
    setFocusNodeId(prev => (prev === node.id ? null : node.id))
  }

  return (
    <AppLayout>
      <div style={{ display: 'flex', height: 'calc(100vh - 0px)', overflow: 'hidden' }}>

        {/* ── GRAPH CANVAS ───────────────────────────────────────────── */}
        <div style={{ flex: 1, position: 'relative', background: 'var(--bg-base)' }}>

          {/* Header bar */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
            padding: '20px 28px', display: 'flex', alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(to bottom, rgba(10,15,28,0.97), transparent)',
          }}>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 2 }}>Relationship Graph</h1>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {graph.nodes.length} nodes &nbsp;·&nbsp; {graph.edges.length} edges
                &nbsp;·&nbsp; Click a node to expand
              </p>
            </div>

            {/* Tab switcher */}
            <div style={{
              display: 'flex', gap: 4, background: 'var(--bg-card)',
              border: '1px solid var(--border)', borderRadius: 99, padding: 4,
            }}>
              {(['graph', 'intros', 'deals'] as Tab[]).map(t => (
                <button key={t} onClick={() => setTab(t)} style={{
                  padding: '8px 18px', borderRadius: 99, fontSize: 13, fontWeight: 600,
                  background: tab === t ? 'var(--accent)' : 'transparent',
                  color: tab === t ? '#000' : 'var(--text-secondary)',
                  transition: 'all 0.2s',
                }}>
                  {t === 'graph' ? '🕸 Graph' : t === 'intros' ? '⚡ Intro Paths' : '📊 Deal Intel'}
                </button>
              ))}
            </div>

            {focusNodeId && (
              <button onClick={() => { setFocusNodeId(null); setSelectedNode(null) }}
                className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: 12 }}>
                ✕ Reset focus
              </button>
            )}
          </div>

          {/* GRAPH VIEW */}
          {tab === 'graph' && (
            <RelationshipGraph
              graph={graph}
              focusNodeId={focusNodeId}
              onNodeClick={handleNodeClick}
            />
          )}

          {/* INTRO PATHS VIEW */}
          {tab === 'intros' && (
            <div style={{ padding: '100px 40px 40px', overflowY: 'auto', height: '100%' }}>
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 20, marginBottom: 8 }}>⚡ Introduction Engine</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                  Paths where a mutual connection can bridge you to a target — ranked by combined edge strength.
                </p>
              </div>

              {introPaths.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', textAlign: 'center', paddingTop: 60 }}>
                  No intro paths found. Add more relationships to the graph.
                </div>
              ) : introPaths.map((path, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 0,
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderRadius: 12, padding: '16px 24px', marginBottom: 12,
                }}>
                  {/* You */}
                  <PathNode label="You" sub="BD Lead" color="#fff" />

                  <PathArrow label={`str:${path.edgeAB.strength}`} color="var(--accent)" />

                  {/* Bridge */}
                  <PathNode
                    label={(path.bridge.data as Person).name}
                    sub={(path.bridge.data as Person).role}
                    color="#4DA3FF"
                  />

                  <PathArrow label={`str:${path.edgeBC.strength}`} color="#10b981" />

                  {/* Target */}
                  <PathNode
                    label={(path.to.data as Person).name}
                    sub={(path.to.data as Person).role}
                    color="#10b981"
                  />

                  <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
                      Combined strength
                    </div>
                    <StrengthBar value={path.combinedStrength} max={10} />
                    <button className="btn btn-primary" style={{ marginTop: 10, padding: '6px 16px', fontSize: 12 }}>
                      Request Intro via {(path.bridge.data as Person).name.split(' ')[0]}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* DEAL INTELLIGENCE VIEW */}
          {tab === 'deals' && (
            <div style={{ padding: '100px 40px 40px', overflowY: 'auto', height: '100%' }}>
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 20, marginBottom: 8 }}>📊 Deal Intelligence</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                  Strength analysis per deal — based on connected people, relationship scores, and stage.
                </p>
              </div>

              {dealIntel.map((intel, i) => {
                const deal = intel.deal.data as Deal
                return (
                  <div key={i} style={{
                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                    borderRadius: 12, padding: '20px 24px', marginBottom: 14,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 16 }}>{deal.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                          {deal.type} · {deal.stage} · ${(deal.value / 1e6).toFixed(1)}M
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Deal Strength</div>
                        <div style={{ fontSize: 28, fontWeight: 800, color: strengthColor(intel.dealStrength) }}>
                          {intel.dealStrength}
                        </div>
                      </div>
                    </div>

                    {/* Connected people */}
                    <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
                      {intel.connectedPeople.map(p => (
                        <div key={p.id} style={{
                          display: 'flex', alignItems: 'center', gap: 6,
                          padding: '4px 10px', background: 'var(--bg-hover)',
                          borderRadius: 99, border: '1px solid var(--border)', fontSize: 12,
                        }}>
                          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4DA3FF' }} />
                          {(p.data as Person).name}
                          <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>T{(p.data as Person).tier_score}</span>
                        </div>
                      ))}
                      {intel.connectedPeople.length === 0 && (
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>No connected people yet</span>
                      )}
                    </div>

                    {/* Missing tiers */}
                    {intel.missingTiers.length > 0 && (
                      <div style={{ fontSize: 12, color: '#f59e0b', marginBottom: 10 }}>
                        ⚠ Missing Tier {intel.missingTiers.join(', ')} contacts
                      </div>
                    )}

                    {/* Next action */}
                    <div style={{
                      padding: '10px 14px',
                      background: 'rgba(77,163,255,0.08)',
                      borderLeft: '3px solid var(--accent)',
                      borderRadius: '0 8px 8px 0',
                      fontSize: 13, fontWeight: 600,
                    }}>
                      {intel.nextBestAction}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* ── SIDE PANEL: selected node detail ───────────────────────── */}
        {selectedNode && (
          <div style={{
            width: 300, background: 'rgba(10,15,28,0.95)',
            borderLeft: '1px solid var(--border)',
            backdropFilter: 'blur(20px)',
            display: 'flex', flexDirection: 'column', overflowY: 'auto',
          }}>
            <div style={{ padding: '28px 24px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <span className="tag tag-accent">{selectedNode.type}</span>
                <button onClick={() => { setSelectedNode(null); setFocusNodeId(null) }}
                  style={{ color: 'var(--text-muted)', fontSize: 18 }}>✕</button>
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>{selectedNode.label}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{selectedNode.sublabel}</div>

              {selectedNode.score > 0 && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>
                    Relationship Score
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ flex: 1, height: 6, background: 'var(--bg-card)', borderRadius: 99 }}>
                      <div style={{
                        width: `${selectedNode.score}%`, height: '100%',
                        background: 'var(--accent)', borderRadius: 99,
                        transition: 'width 0.5s',
                      }} />
                    </div>
                    <span style={{ fontWeight: 700, fontSize: 16 }}>{selectedNode.score}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Connected edges detail */}
            <div style={{ padding: '20px 24px' }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Connections
              </div>
              {graph.edges
                .filter(e => e.source === selectedNode.id || e.target === selectedNode.id)
                .slice(0, 8)
                .map((edge, i) => {
                  const otherId = edge.source === selectedNode.id ? edge.target : edge.source
                  const other = graph.nodes.find(n => n.id === otherId)
                  if (!other) return null
                  return (
                    <div key={i} onClick={() => handleNodeClick(other)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                        background: 'var(--bg-card)', borderRadius: 8, marginBottom: 8,
                        cursor: 'pointer', border: '1px solid var(--border)',
                      }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: NODE_COLOR_MAP[other.type] }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{other.label}</div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{edge.type} · str:{edge.strength}</div>
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}

// ─── Small helpers ────────────────────────────────────────────────────────────

const NODE_COLOR_MAP: Record<string, string> = {
  person: '#4DA3FF', company: '#10b981', deal: '#f59e0b',
}

function PathNode({ label, sub, color }: { label: string; sub: string; color: string }) {
  return (
    <div style={{ textAlign: 'center', minWidth: 90 }}>
      <div style={{ width: 40, height: 40, borderRadius: '50%', background: `${color}20`, border: `2px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px', fontWeight: 700, color }}>
        {label.charAt(0)}
      </div>
      <div style={{ fontSize: 13, fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{sub}</div>
    </div>
  )
}

function PathArrow({ label, color }: { label: string; color: string }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, minWidth: 60 }}>
      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{label}</div>
      <div style={{ height: 2, width: '80%', background: color, borderRadius: 99, position: 'relative' }}>
        <div style={{ position: 'absolute', right: -6, top: -4, color, fontSize: 10 }}>▶</div>
      </div>
    </div>
  )
}

function StrengthBar({ value, max }: { value: number; max: number }) {
  const pct = Math.round((value / max) * 100)
  return (
    <div style={{ width: 120, height: 4, background: 'var(--bg-hover)', borderRadius: 99 }}>
      <div style={{ width: `${pct}%`, height: '100%', background: strengthColor(pct), borderRadius: 99 }} />
    </div>
  )
}

function strengthColor(score: number): string {
  if (score >= 70) return '#10b981'
  if (score >= 40) return '#f59e0b'
  return '#ef4444'
}
