'use client'
import Link from 'next/link'
import { useState } from 'react'

export default function LandingPage() {
  return (
    <div className="user-landing-container" style={{ background: 'var(--bg-base)', minHeight: '100vh', color: '#fff' }}>
      <header className="ul-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 32, height: 32, background: 'conic-gradient(from 90deg, #0A0F1C, #4DA3FF, #0A0F1C)', borderRadius: '50%' }}></div>
          <div className="ul-logo" style={{ background: 'linear-gradient(135deg, #fff, #A0AEC0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            FocusLab AI
          </div>
        </div>
        <nav className="ul-nav">
          <a href="#">Product</a>
          <a href="#">How it works</a>
          <a href="#">Use cases</a>
          <a href="#">Pricing</a>
        </nav>
        <Link href="/dashboard" className="ul-btn-primary" style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)' }}>
          Access App
        </Link>
      </header>

      <main className="ul-main" style={{ paddingTop: 120 }}>
        <div className="ul-hero animate-slide-up">
          <div className="ul-badge" style={{ background: 'rgba(77, 163, 255, 0.1)', borderColor: 'rgba(77, 163, 255, 0.2)', color: '#4DA3FF' }}>
            <span style={{ marginRight: 8 }}>✦</span> 2026 Global AI Insight Platform
          </div>
          <h1 className="ul-title" style={{ fontSize: 72, lineHeight: 1.1, marginBottom: 32 }}>
            See the reason.<br />
            <span style={{ color: 'var(--accent)' }}>Take action.</span>
          </h1>
          <p className="ul-subtitle" style={{ maxWidth: 600, margin: '0 auto 48px', fontSize: 20, color: 'var(--text-secondary)' }}>
            AI that turns your network and market data into clear reasons, impact, and deal paths — automatically.
          </p>
          <div className="ul-actions">
            <Link href="/dashboard" className="btn btn-primary" style={{ padding: '16px 40px', fontSize: 16 }}>
              Get insights ↗
            </Link>
            <button className="btn btn-secondary" style={{ padding: '16px 40px', fontSize: 16 }}>
              See how it works
            </button>
          </div>
        </div>
        
        <div className="animate-slide-up" style={{ animationDelay: '0.2s', marginTop: 100 }}>
          <div className="glass-panel" style={{ padding: 40, textAlign: 'left', maxWidth: 900, margin: '0 auto' }}>
            <h3 style={{ fontSize: 32, marginBottom: 40 }}>How <span style={{ color: 'var(--accent)' }}>FocusLab AI</span> works</h3>
            
            <div className="grid-2">
              <div style={{ display: 'flex', gap: 24, paddingBottom: 32, borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontSize: 48, fontWeight: 800, color: 'rgba(255,255,255,0.1)', lineHeight: 0.8 }}>1</div>
                <div>
                  <h4 style={{ fontSize: 20, marginBottom: 8 }}>Connect your network</h4>
                  <p style={{ color: 'var(--text-secondary)' }}>We securely ingest data from your CRMs, emails, and LinkedIn to build a master relationship graph.</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 24, paddingBottom: 32, borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontSize: 48, fontWeight: 800, color: 'rgba(255,255,255,0.1)', lineHeight: 0.8 }}>2</div>
                <div>
                  <h4 style={{ fontSize: 20, marginBottom: 8 }}>Detect paths</h4>
                  <p style={{ color: 'var(--text-secondary)' }}>Our AI identifies hidden relationships, warm introductions, and leverage you might have missed.</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 24, paddingTop: 16 }}>
                <div style={{ fontSize: 48, fontWeight: 800, color: 'rgba(255,255,255,0.1)', lineHeight: 0.8 }}>3</div>
                <div>
                  <h4 style={{ fontSize: 20, marginBottom: 8 }}>Understand leverage</h4>
                  <p style={{ color: 'var(--text-secondary)' }}>Know exactly who to talk to, when to interact, and the context of the relationship.</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 24, paddingTop: 16 }}>
                <div style={{ fontSize: 48, fontWeight: 800, color: 'rgba(255,255,255,0.1)', lineHeight: 0.8 }}>4</div>
                <div>
                  <h4 style={{ fontSize: 20, marginBottom: 8 }}>Close deals</h4>
                  <p style={{ color: 'var(--text-secondary)' }}>Generate term sheets and push deals through the pipeline faster using network insights.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
