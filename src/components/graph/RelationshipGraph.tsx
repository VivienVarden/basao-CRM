'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { Graph, GraphNode, GraphEdge } from '@/lib/graphEngine'

// ─── Force Simulation (pure TS, no dependencies) ──────────────────────────────
interface SimNode extends GraphNode {
  x: number
  y: number
  vx: number
  vy: number
}

function initLayout(nodes: GraphNode[], width: number, height: number): SimNode[] {
  const cx = width / 2
  const cy = height / 2
  const total = nodes.length
  return nodes.map((n, i) => {
    const angle = (i / total) * 2 * Math.PI
    const radius = Math.min(width, height) * 0.3
    return {
      ...n,
      x: cx + radius * Math.cos(angle) + (Math.random() - 0.5) * 60,
      y: cy + radius * Math.sin(angle) + (Math.random() - 0.5) * 60,
      vx: 0,
      vy: 0,
    }
  })
}

function runForceStep(
  simNodes: SimNode[],
  edges: GraphEdge[],
  width: number,
  height: number,
  alpha: number
): SimNode[] {
  const k = Math.sqrt((width * height) / simNodes.length)
  const nodes = simNodes.map(n => ({ ...n }))

  // Repulsion
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dx = nodes[i].x - nodes[j].x || 0.01
      const dy = nodes[i].y - nodes[j].y || 0.01
      const dist = Math.sqrt(dx * dx + dy * dy) || 0.01
      const force = (k * k * 2.5) / (dist * dist)
      const fx = (dx / dist) * force * alpha
      const fy = (dy / dist) * force * alpha
      nodes[i].vx += fx
      nodes[i].vy += fy
      nodes[j].vx -= fx
      nodes[j].vy -= fy
    }
  }

  // Attraction along edges
  for (const edge of edges) {
    const src = nodes.find(n => n.id === edge.source)
    const tgt = nodes.find(n => n.id === edge.target)
    if (!src || !tgt) continue
    const dx = tgt.x - src.x
    const dy = tgt.y - src.y
    const dist = Math.sqrt(dx * dx + dy * dy) || 0.01
    const idealDist = k * (12 - edge.strength) * 0.4
    const force = ((dist - idealDist) / dist) * 0.08 * alpha
    const fx = dx * force
    const fy = dy * force
    src.vx += fx; src.vy += fy
    tgt.vx -= fx; tgt.vy -= fy
  }

  // Gravity to center
  const cx = width / 2, cy = height / 2
  for (const n of nodes) {
    n.vx += (cx - n.x) * 0.005 * alpha
    n.vy += (cy - n.y) * 0.005 * alpha
  }

  // Apply + dampen
  for (const n of nodes) {
    n.vx *= 0.82
    n.vy *= 0.82
    n.x = Math.max(60, Math.min(width - 60, n.x + n.vx))
    n.y = Math.max(60, Math.min(height - 60, n.y + n.vy))
  }

  return nodes
}

// ─── Colours per type ─────────────────────────────────────────────────────────
const NODE_COLOR: Record<string, string> = {
  person:  '#4DA3FF',
  company: '#10b981',
  deal:    '#f59e0b',
}

const EDGE_COLOR: Record<string, string> = {
  KNOWS:       'rgba(77,163,255,0.4)',
  WORKS_AT:    'rgba(16,185,129,0.35)',
  INVOLVED_IN: 'rgba(245,158,11,0.4)',
  INTRODUCED:  'rgba(168,85,247,0.5)',
}

const ICON: Record<string, string> = {
  person:  '◉',
  company: '▣',
  deal:    '◆',
}

const RADIUS: Record<string, number> = { person: 26, company: 30, deal: 22 }

// ─── Component ────────────────────────────────────────────────────────────────
interface Props {
  graph: Graph
  focusNodeId?: string | null
  onNodeClick?: (node: GraphNode) => void
}

export function RelationshipGraph({ graph, focusNodeId, onNodeClick }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dims, setDims] = useState({ width: 900, height: 600 })
  const [simNodes, setSimNodes] = useState<SimNode[]>([])
  const frameRef = useRef<number>(0)
  const alphaRef = useRef(1)
  const simRef = useRef<SimNode[]>([])
  const dragging = useRef<{ id: string; ox: number; oy: number } | null>(null)
  const [hovered, setHovered] = useState<string | null>(null)

  // Measure container
  useEffect(() => {
    const obs = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect
      setDims({ width, height: Math.max(height, 500) })
    })
    if (containerRef.current) obs.observe(containerRef.current)
    return () => obs.disconnect()
  }, [])

  // Init + re-init on data change
  useEffect(() => {
    const nodes = initLayout(graph.nodes, dims.width, dims.height)
    simRef.current = nodes
    setSimNodes([...nodes])
    alphaRef.current = 1
  }, [graph.nodes.length, dims.width])

  // Animation loop
  useEffect(() => {
    const tick = () => {
      if (alphaRef.current < 0.01) return
      alphaRef.current *= 0.99
      simRef.current = runForceStep(simRef.current, graph.edges, dims.width, dims.height, alphaRef.current)
      setSimNodes([...simRef.current])
      frameRef.current = requestAnimationFrame(tick)
    }
    frameRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameRef.current)
  }, [graph.edges, dims])

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation()
    const node = simRef.current.find(n => n.id === nodeId)
    if (!node) return
    dragging.current = { id: nodeId, ox: e.clientX - node.x, oy: e.clientY - node.y }
  }

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragging.current || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const newX = e.clientX - rect.left
    const newY = e.clientY - rect.top
    simRef.current = simRef.current.map(n =>
      n.id === dragging.current!.id ? { ...n, x: newX, y: newY, vx: 0, vy: 0 } : n
    )
    alphaRef.current = 0.3
    setSimNodes([...simRef.current])
  }, [])

  const handleMouseUp = useCallback(() => { dragging.current = null }, [])

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [handleMouseMove, handleMouseUp])

  // Visibility helpers for focus mode
  const visibleNodeIds = focusNodeId
    ? new Set([
        focusNodeId,
        ...graph.edges
          .filter(e => e.source === focusNodeId || e.target === focusNodeId)
          .flatMap(e => [e.source, e.target]),
      ])
    : null

  const nodeMap = new Map(simNodes.map(n => [n.id, n]))

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
      <svg
        width={dims.width}
        height={dims.height}
        style={{ display: 'block', cursor: 'grab' }}
      >
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="10" refY="5"
            markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(255,255,255,0.3)" />
          </marker>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Edges */}
        {graph.edges.map(edge => {
          const src = nodeMap.get(edge.source)
          const tgt = nodeMap.get(edge.target)
          if (!src || !tgt) return null

          const dimmed = visibleNodeIds && (!visibleNodeIds.has(edge.source) || !visibleNodeIds.has(edge.target))
          const strokeW = Math.max(1, edge.strength / 2.5)
          const color = EDGE_COLOR[edge.type] || 'rgba(255,255,255,0.15)'

          // Mid point for label
          const mx = (src.x + tgt.x) / 2
          const my = (src.y + tgt.y) / 2

          return (
            <g key={edge.id} style={{ opacity: dimmed ? 0.08 : 1, transition: 'opacity 0.3s' }}>
              <line
                x1={src.x} y1={src.y} x2={tgt.x} y2={tgt.y}
                stroke={color}
                strokeWidth={strokeW}
                strokeDasharray={edge.type === 'WORKS_AT' ? '4 3' : undefined}
                markerEnd="url(#arrow)"
              />
              {(hovered === edge.source || hovered === edge.target) && (
                <text x={mx} y={my} textAnchor="middle" fontSize={9}
                  fill="rgba(255,255,255,0.5)" dy={-4}>
                  {edge.type} · str:{edge.strength}
                </text>
              )}
            </g>
          )
        })}

        {/* Nodes */}
        {simNodes.map(node => {
          const dimmed = visibleNodeIds && !visibleNodeIds.has(node.id)
          const isHovered = hovered === node.id
          const isFocused = focusNodeId === node.id
          const color = NODE_COLOR[node.type]
          const r = RADIUS[node.type]

          return (
            <g
              key={node.id}
              transform={`translate(${node.x},${node.y})`}
              style={{ cursor: 'pointer', opacity: dimmed ? 0.12 : 1, transition: 'opacity 0.3s' }}
              onMouseDown={e => handleMouseDown(e, node.id)}
              onMouseEnter={() => setHovered(node.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => { alphaRef.current = 0.1; onNodeClick?.(node) }}
            >
              {/* Glow ring for focused / hovered */}
              {(isFocused || isHovered) && (
                <circle r={r + 12} fill="none" stroke={color} strokeWidth={1.5}
                  strokeDasharray="4 3" strokeOpacity={0.6}
                  style={{ animation: 'spin 6s linear infinite' }} />
              )}

              {/* Main circle */}
              <circle
                r={r}
                fill={isFocused ? color : `${color}22`}
                stroke={color}
                strokeWidth={isFocused || isHovered ? 2.5 : 1.5}
                filter={isFocused ? 'url(#glow)' : undefined}
              />

              {/* Score arc (thin outer ring) */}
              {node.score > 0 && (
                <circle r={r + 5} fill="none"
                  stroke={color}
                  strokeOpacity={0.35}
                  strokeWidth={3}
                  strokeDasharray={`${(node.score / 100) * (2 * Math.PI * (r + 5))} 9999`}
                  style={{ transform: 'rotate(-90deg)', transformOrigin: '0 0' }}
                />
              )}

              {/* Icon */}
              <text textAnchor="middle" dy={5} fontSize={14} fill={color} fontWeight="700">
                {ICON[node.type]}
              </text>

              {/* Label */}
              <text textAnchor="middle" dy={r + 14} fontSize={11} fill="#fff" fontWeight={600}
                style={{ pointerEvents: 'none' }}>
                {node.label.length > 14 ? node.label.slice(0, 13) + '…' : node.label}
              </text>
              <text textAnchor="middle" dy={r + 26} fontSize={9} fill="rgba(255,255,255,0.4)"
                style={{ pointerEvents: 'none' }}>
                {node.sublabel}
              </text>
            </g>
          )
        })}
      </svg>

      {/* Legend */}
      <div style={{ position: 'absolute', bottom: 16, left: 16, display: 'flex', gap: 16 }}>
        {Object.entries(NODE_COLOR).map(([type, color]) => (
          <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>
            <div style={{ width: 10, height: 10, borderRadius: type === 'deal' ? 2 : type === 'company' ? 3 : 99, background: color }} />
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
          · edge thickness = strength
        </div>
      </div>
    </div>
  )
}
