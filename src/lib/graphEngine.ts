/**
 * BD-OS Brain Graph Engine
 * 3-Layer Architecture:
 *   Layer 1 — Graph (nodes + edges)
 *   Layer 2 — Signal (scoring from interactions)
 *   Layer 3 — Inference (intro paths, deal strength, next actions)
 */

import { IntelligenceStore, Person, Company, Deal } from './types'

// ─── Layer 1: Graph Data Model ────────────────────────────────────────────────

export type NodeType = 'person' | 'company' | 'deal'

export type EdgeType =
  | 'KNOWS'
  | 'WORKS_AT'
  | 'INVOLVED_IN'
  | 'INTRODUCED'

export interface GraphNode {
  id: string
  type: NodeType
  label: string
  sublabel: string
  data: Person | Company | Deal
  score: number        // relationship score 0-100
  tier?: number        // tier 1/2/3 for persons
  x?: number
  y?: number
}

export interface GraphEdge {
  id: string
  source: string      // GraphNode.id
  target: string      // GraphNode.id
  type: EdgeType
  strength: number    // 1-10
  last_interaction_date?: string
}

export interface Graph {
  nodes: GraphNode[]
  edges: GraphEdge[]
}

// ─── Layer 2: Signal / Scoring ────────────────────────────────────────────────

/**
 * Calculate relationship score for a person.
 * Score =
 *   +3 if interaction in last 7 days
 *   +2 if interaction in last 30 days
 *   +1 per interaction count (capped at 20)
 *   +5 if involved in same active deal
 */
export function calculateRelationshipScore(
  personId: string,
  store: IntelligenceStore
): number {
  const now = Date.now()
  const interactions = store.interactions.filter(i => i.personId === personId)

  let score = 0

  // Recency
  const hasRecentInteraction7d = interactions.some(
    i => now - new Date(i.timestamp).getTime() < 7 * 86400000
  )
  const hasRecentInteraction30d = interactions.some(
    i => now - new Date(i.timestamp).getTime() < 30 * 86400000
  )
  if (hasRecentInteraction7d) score += 30
  else if (hasRecentInteraction30d) score += 15

  // Frequency
  score += Math.min(interactions.length * 5, 30)

  // Deal involvement
  const inActiveDeal = store.deals.some(
    d => d.sourceId === personId && d.status === 'Active'
  )
  if (inActiveDeal) score += 25

  // Relationship in graph
  const rels = store.relationships.filter(
    r => r.personIdA === personId || r.personIdB === personId
  )
  score += Math.min(rels.length * 5, 15)

  return Math.min(score, 100)
}

/**
 * Compute edge strength (1–10) from relationship data + interactions
 */
function edgeStrength(
  personIdA: string,
  personIdB: string,
  store: IntelligenceStore
): number {
  const rel = store.relationships.find(
    r => (r.personIdA === personIdA && r.personIdB === personIdB) ||
         (r.personIdA === personIdB && r.personIdB === personIdA)
  )
  if (!rel) return 1
  // Normalize strengthScore (0–100) to (1–10)
  return Math.max(1, Math.min(10, Math.round(rel.strengthScore / 10)))
}

// ─── Layer 1 Builder ─────────────────────────────────────────────────────────

export function buildGraph(store: IntelligenceStore): Graph {
  const nodes: GraphNode[] = []
  const edges: GraphEdge[] = []

  // ── People nodes
  for (const person of store.people) {
    const score = calculateRelationshipScore(person.id, store)
    nodes.push({
      id: `p_${person.id}`,
      type: 'person',
      label: person.name,
      sublabel: person.role,
      data: person,
      score,
      tier: person.tier_score,
    })

    // Edge: WORKS_AT company
    if (person.company_id) {
      edges.push({
        id: `e_works_${person.id}`,
        source: `p_${person.id}`,
        target: `c_${person.company_id}`,
        type: 'WORKS_AT',
        strength: 8,
        last_interaction_date: undefined,
      })
    }
  }

  // ── Company nodes
  for (const company of store.companies) {
    nodes.push({
      id: `c_${company.id}`,
      type: 'company',
      label: company.name,
      sublabel: `${company.type} · ${company.stage}`,
      data: company,
      score: 0,
    })
  }

  // ── Deal nodes
  for (const deal of store.deals) {
    const dealScore = deal.probability
    nodes.push({
      id: `d_${deal.id}`,
      type: 'deal',
      label: deal.name,
      sublabel: `${deal.stage} · ${deal.status}`,
      data: deal,
      score: dealScore,
    })

    // Edge: person INVOLVED_IN deal (via sourceId)
    if (deal.sourceId) {
      const sourcePerson = store.people.find(p => p.id === deal.sourceId)
      if (sourcePerson) {
        edges.push({
          id: `e_involved_${deal.id}_${deal.sourceId}`,
          source: `p_${deal.sourceId}`,
          target: `d_${deal.id}`,
          type: 'INVOLVED_IN',
          strength: 7,
        })
      }
    }

    // Edge: company ↔ deal (implicit ownership)
    edges.push({
      id: `e_deal_co_${deal.id}`,
      source: `c_${deal.company_id}`,
      target: `d_${deal.id}`,
      type: 'INVOLVED_IN',
      strength: 5,
    })
  }

  // ── Person ↔ Person edges (KNOWS / INTRODUCED)
  for (const rel of store.relationships) {
    const edgeLabel: EdgeType =
      rel.type === 'introduced' ? 'INTRODUCED' : 'KNOWS'
    edges.push({
      id: `e_rel_${rel.id}`,
      source: `p_${rel.personIdA}`,
      target: `p_${rel.personIdB}`,
      type: edgeLabel,
      strength: edgeStrength(rel.personIdA, rel.personIdB, store),
      last_interaction_date: rel.createdAt,
    })
  }

  return { nodes, edges }
}

// ─── Layer 3: Inference Engine ────────────────────────────────────────────────

export interface IntroPath {
  from: GraphNode    // You
  bridge: GraphNode  // B who knows both
  to: GraphNode      // Target
  combinedStrength: number
  edgeAB: GraphEdge
  edgeBC: GraphEdge
}

/**
 * Intro Engine: find A→B→C paths where A doesn't directly KNOW C
 * Ranked by combined strength of A-B and B-C edges
 */
export function findIntroPaths(
  sourceNodeId: string,  // 'you' / main user node
  graph: Graph
): IntroPath[] {
  const paths: IntroPath[] = []

  const personNodes = graph.nodes.filter(n => n.type === 'person')
  const personEdges = graph.edges.filter(
    e => e.type === 'KNOWS' || e.type === 'INTRODUCED'
  )

  // Direct neighbors of source
  const directNeighborIds = new Set<string>()
  for (const edge of personEdges) {
    if (edge.source === sourceNodeId) directNeighborIds.add(edge.target)
    if (edge.target === sourceNodeId) directNeighborIds.add(edge.source)
  }

  // For each direct neighbor B, find their neighbors C
  for (const bridgeId of Array.from(directNeighborIds)) {
    const bridgeNode = graph.nodes.find(n => n.id === bridgeId)
    if (!bridgeNode) continue

    const edgeAB = personEdges.find(
      e => (e.source === sourceNodeId && e.target === bridgeId) ||
           (e.target === sourceNodeId && e.source === bridgeId)
    )
    if (!edgeAB) continue

    for (const edge of personEdges) {
      let targetId: string | null = null
      if (edge.source === bridgeId && edge.target !== sourceNodeId) targetId = edge.target
      if (edge.target === bridgeId && edge.source !== sourceNodeId) targetId = edge.source
      if (!targetId) continue

      // Skip if we already directly know C
      if (directNeighborIds.has(targetId) || targetId === sourceNodeId) continue

      const targetNode = graph.nodes.find(n => n.id === targetId)
      if (!targetNode || targetNode.type !== 'person') continue

      const sourceNode = graph.nodes.find(n => n.id === sourceNodeId)
      if (!sourceNode) continue

      paths.push({
        from: sourceNode,
        bridge: bridgeNode,
        to: targetNode,
        combinedStrength: (edgeAB.strength + edge.strength) / 2,
        edgeAB,
        edgeBC: edge,
      })
    }
  }

  return paths.sort((a, b) => b.combinedStrength - a.combinedStrength)
}

export interface DealIntelligence {
  deal: GraphNode
  connectedPeople: GraphNode[]
  dealStrength: number
  missingTiers: number[]
  nextBestAction: string
}

/**
 * Deal Intelligence: compute deal strength + next actions
 */
export function analyzeDealIntelligence(
  graph: Graph,
  store: IntelligenceStore
): DealIntelligence[] {
  const dealNodes = graph.nodes.filter(n => n.type === 'deal')
  const results: DealIntelligence[] = []

  for (const dealNode of dealNodes) {
    const deal = dealNode.data as Deal

    // Find connected people (via INVOLVED_IN edges)
    const connectedPersonIds = graph.edges
      .filter(e =>
        (e.target === dealNode.id || e.source === dealNode.id) &&
        e.type === 'INVOLVED_IN'
      )
      .map(e => (e.source === dealNode.id ? e.target : e.source))

    const connectedPeople = graph.nodes.filter(n =>
      n.type === 'person' && connectedPersonIds.includes(n.id)
    )

    // Deal strength: average relationship score of connected people + probability
    const avgScore =
      connectedPeople.length > 0
        ? connectedPeople.reduce((acc, n) => acc + n.score, 0) / connectedPeople.length
        : 0
    const dealStrength = Math.round((avgScore * 0.6) + (deal.probability * 0.4))

    // Identify missing tiers
    const connectedTiers = connectedPeople.map(n => (n.data as Person).tier_score)
    const missingTiers = [1, 2, 3].filter(t => !connectedTiers.includes(t))

    // Next best action
    let nextBestAction = '✅ Well connected — push to close'
    if (deal.stage === 'Sourcing') nextBestAction = '🔍 Find intro path to decision maker'
    else if (deal.stage === 'Intro') nextBestAction = '📅 Book first meeting ASAP'
    else if (deal.stage === 'Meeting') nextBestAction = '📋 Prepare IC memo + data room'
    else if (deal.stage === 'IC') nextBestAction = '⚡ Accelerate — send term sheet signal'
    else if (deal.stage === 'Term Sheet') nextBestAction = '⚖️ Legal + DD in parallel'
    else if (missingTiers.includes(1)) nextBestAction = '⚠️ Missing Tier-1 contact — find bridge'

    results.push({
      deal: dealNode,
      connectedPeople,
      dealStrength,
      missingTiers,
      nextBestAction,
    })
  }

  return results.sort((a, b) => b.dealStrength - a.dealStrength)
}
