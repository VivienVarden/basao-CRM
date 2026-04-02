'use client'
import { useState } from 'react'
import { Deal } from '@/lib/types'
import { formatCurrency } from '@/lib/currencies'
import { formatDate } from '@/lib/utils'
import { SUPPORTED_BANKS } from '@/lib/constants'

export function ProposalGenerator({ deal, onClose }: { deal: Deal, onClose: () => void }) {
  const handlePrint = () => {
    window.print()
  }

  const bankName = SUPPORTED_BANKS.find(b => b.id === deal.bankId)?.name || deal.bankId

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-lg animate-up" style={{ maxWidth: 840, padding: 0, overflow: 'hidden' }}>
        
        {/* Toolbar (Hidden on print via css) */}
        <div className="no-print" style={{ background: 'var(--bg-surface)', padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: 700 }}>📄 Automated Proposal Generator</div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn btn-secondary" onClick={onClose}>Close</button>
            <button className="btn btn-primary" onClick={handlePrint}>🖨️ Print / Export PDF</button>
          </div>
        </div>

        {/* Paper Document UI */}
        <div style={{ padding: '40px 60px', background: 'white', color: 'black', maxHeight: '75vh', overflowY: 'auto' }}>
          <div id="proposal-doc" style={{ fontFamily: '"Times New Roman", Times, serif', lineHeight: 1.6 }}>
            
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 40, borderBottom: '2px solid #1e293b', paddingBottom: 20 }}>
              <div>
                <h1 style={{ fontSize: 32, margin: '0 0 8px 0', color: '#0ea5e9' }}>BASAO CRM</h1>
                <div style={{ fontSize: 13, color: '#475569' }}>Financial Services & Valuation</div>
              </div>
              <div style={{ textAlign: 'right', fontSize: 13, color: '#475569' }}>
                <div>Date: {formatDate(new Date().toISOString())}</div>
                <div>Quotation No: #Q-{deal.id.substring(0,6).toUpperCase()}</div>
                <div>Valid Until: {formatDate(deal.deadline)}</div>
              </div>
            </div>

            {/* Title */}
            <h2 style={{ textAlign: 'center', fontSize: 24, marginBottom: 30, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Service Proposal & Quotation
            </h2>

            {/* Context */}
            <div style={{ marginBottom: 30 }}>
              <div style={{ fontWeight: 700, marginBottom: 12 }}>Prepared For:</div>
              <div style={{ padding: 16, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <p style={{ margin: '0 0 8px 0' }}><strong>Deal Reference:</strong> {deal.name}</p>
                <p style={{ margin: '0 0 8px 0' }}><strong>Description:</strong> {deal.description || "Comprehensive service valuation package"}</p>
                <p style={{ margin: 0 }}><strong>Partner Bank:</strong> {bankName}</p>
              </div>
            </div>

            {/* Table Cost */}
            <div style={{ marginBottom: 40 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 20 }}>
                <thead>
                  <tr style={{ background: '#0f172a', color: 'white' }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left' }}>Item Description</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center' }}>Qty</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>Total Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '16px' }}>Service Fee (Full Package) 
                      <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>Includes valuation, appraisal, and consultation.</div>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>1</td>
                    <td style={{ padding: '16px', textAlign: 'right', fontWeight: 700 }}>{formatCurrency(deal.value, deal.currency)}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={2} style={{ padding: '16px', textAlign: 'right', fontWeight: 700 }}>Grand Total:</td>
                    <td style={{ padding: '16px', textAlign: 'right', fontSize: 20, fontWeight: 800, color: '#0ea5e9' }}>
                      {formatCurrency(deal.value, deal.currency)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Terms and conditions */}
            <div style={{ fontSize: 12, color: '#475569', marginTop: 60, borderTop: '1px solid #e2e8f0', paddingTop: 20 }}>
              <strong>Terms and Conditions:</strong>
              <ol style={{ paddingLeft: 16, marginTop: 8 }}>
                <li>This quotation is valid until the deadline specified above.</li>
                <li>Payment is required according to the milestone agreements.</li>
                <li>Confidentiality and Service Level Agreements apply.</li>
              </ol>
            </div>
            
            {/* Signatures */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 80 }}>
              <div style={{ width: 250, textAlign: 'center' }}>
                <div style={{ borderBottom: '1px solid #000', height: 40 }}></div>
                <div style={{ marginTop: 8, fontWeight: 700 }}>Client Signature</div>
              </div>
              <div style={{ width: 250, textAlign: 'center' }}>
                <div style={{ borderBottom: '1px solid #000', height: 40 }}></div>
                <div style={{ marginTop: 8, fontWeight: 700 }}>Basao Authorized Signature</div>
              </div>
            </div>

          </div>
        </div>
      </div>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #proposal-doc, #proposal-doc * { visibility: visible; }
          #proposal-doc { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
          .modal-overlay { background: none; }
        }
      `}</style>
    </div>
  )
}
