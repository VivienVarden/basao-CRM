'use client'
import { useState, useEffect, useRef } from 'react'
import { useApp } from '@/lib/context'
import { useRouter } from 'next/navigation'

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const { store } = useApp()
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(o => !o)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    const handleOpenSearch = () => setOpen(true)

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('open-search', handleOpenSearch)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('open-search', handleOpenSearch)
    }
  }, [])

  useEffect(() => {
    if (open) {
      setQuery('')
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  if (!open) return null

  const filteredDeals = store.deals.filter(d => d.name.toLowerCase().includes(query.toLowerCase())).slice(0, 4)
  const filteredCustomers = store.customers.filter(c => c.name.toLowerCase().includes(query.toLowerCase())).slice(0, 4)

  return (
    <div className="modal-overlay" style={{ alignItems: 'flex-start', paddingTop: '10vh', background: 'rgba(15,23,42,0.8)', backdropFilter: 'blur(8px)' }} onClick={e => e.target === e.currentTarget && setOpen(false)}>
      <div style={{ background: 'var(--bg-surface)', width: '100%', maxWidth: 640, borderRadius: 16, border: '1px solid var(--border)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', overflow: 'hidden', animation: 'fade-up 0.2s ease-out' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', padding: '0 16px', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontSize: 20, color: 'var(--text-muted)' }}>🔍</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Tìm kiếm Deal, Khách hàng, Lệnh... (Type to search)"
            style={{ width: '100%', border: 'none', background: 'transparent', color: 'white', padding: '20px 16px', fontSize: 16, outline: 'none' }}
          />
          <span style={{ fontSize: 11, background: 'var(--bg-card)', padding: '4px 8px', borderRadius: 6, color: 'var(--text-muted)' }}>ESC</span>
        </div>

        <div style={{ maxHeight: 400, overflowY: 'auto', padding: 8 }}>
          {query.trim() === '' && (
            <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              Type something to search our Global Database.
            </div>
          )}

          {query && filteredDeals.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '8px 12px' }}>Deals</div>
              {filteredDeals.map(d => (
                <div key={d.id} 
                  onClick={() => { router.push(`/deals/${d.id}`); setOpen(false) }}
                  style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: 12, borderRadius: 8, cursor: 'pointer', transition: 'background 0.1s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(59,130,246,0.1)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>💼</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{d.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{d.status.toUpperCase()}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {query && filteredCustomers.length > 0 && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '8px 12px' }}>Customers</div>
              {filteredCustomers.map(c => (
                <div key={c.id} 
                  style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: 12, borderRadius: 8, cursor: 'pointer', transition: 'background 0.1s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(139,92,246,0.1)', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>👤</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{c.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.company}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={{ padding: '12px 16px', background: 'var(--bg-base)', borderTop: '1px solid var(--border)', fontSize: 11, color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
          <span>Powered by Basao Global Search Engine</span>
          <span>Use <strong>↓ ↑</strong> to navigate</span>
        </div>
      </div>
    </div>
  )
}
