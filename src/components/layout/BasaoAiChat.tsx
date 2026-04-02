'use client'
import { useState, useRef, useEffect } from 'react'
import { useApp } from '@/lib/context'
import { formatCurrency } from '@/lib/currencies'

export function BasaoAiChat() {
  const [open, setOpen] = useState(false)
  const { store, currency } = useApp()
  const [messages, setMessages] = useState<{role: 'ai'|'user', text: string}[]>([
    { role: 'ai', text: 'Xin chào! Tôi là AI Assistant của Basao CRM. Bạn cần tổng hợp báo cáo gì hôm nay?' }
  ])
  const [input, setInput] = useState('')
  const msgsEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => { msgsEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, open])

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    const userMsg = input.trim().toLowerCase()
    setMessages(prev => [...prev, { role: 'user', text: input }])
    setInput('')

    setTimeout(() => {
      let reply = 'Xin lỗi, tôi chưa hiểu rõ dữ liệu bạn cần.'
      if (userMsg.includes('deal') && (userMsg.includes('số') || userMsg.includes('bao nhiêu') || userMsg.includes('tổng'))) {
        reply = `Hệ thống hiện tại ghi nhận ${store.deals.length} deals đang tồn tại.`
      } else if (userMsg.includes('doanh thu') || userMsg.includes('giá trị') || userMsg.includes('tiền')) {
        const total = store.deals.reduce((acc, d) => acc + d.value, 0)
        reply = `Tổng giá trị pipeline là: ${formatCurrency(total, currency)}.`
      } else if (userMsg.includes('lớn nhất') || userMsg.includes('top') || userMsg.includes('ngon')) {
        const topDeal = store.deals.sort((a,b) => b.value - a.value)[0]
        reply = topDeal ? `Deal hấp dẫn nhất là "${topDeal.name}" trị giá ${formatCurrency(topDeal.value, topDeal.currency)}.` : 'Chưa có deal nào dắt túi cả.'
      } else if (userMsg.includes('khách') || userMsg.includes('người')) {
         reply = `Chúng ta đang có tệp ${store.customers.length} khách hàng trong CRM.`
      } else if (userMsg.includes('chào') || userMsg.includes('hi ')) {
         reply = 'Chào sếp! Sếp cứ gõ yêu cầu phân tích vào đây nhé.'
      } else {
         reply = 'Bạn có thể hỏi tôi các câu như: "Tổng số deal", "Doanh thu dự kiến", "Khách hàng", hoặc "Deal lớn nhất". Tôi sẽ đọc store và trả lời ngay.'
      }

      setMessages(prev => [...prev, { role: 'ai', text: reply }])
    }, 600)
  }

  return (
    <>
      {/* Glow Button */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
          width: 56, height: 56, borderRadius: '50%',
          background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
          border: 'none', color: 'white', fontSize: 24,
          boxShadow: '0 8px 32px rgba(14,165,233,0.4)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'transform 0.2s', transform: open ? 'scale(0.9)' : 'scale(1)'
        }}
      >
        {open ? '✕' : '✨'}
      </button>

      {/* Chat Window */}
      {open && (
        <div style={{
          position: 'fixed', bottom: 90, right: 24, zIndex: 9998,
          width: 340, height: 480, background: 'var(--bg-surface)',
          borderRadius: 16, border: '1px solid var(--border)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          animation: 'fade-up 0.3s ease-out'
        }}>
          {/* Header */}
          <div style={{
            padding: 16, background: 'linear-gradient(135deg, #0f172a, #1e293b)',
            borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10
          }}>
            <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg, #0ea5e9, #3b82f6)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>✨</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'white' }}>Basao AI</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Online · Read-only access</div>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '85%', padding: '10px 14px', borderRadius: 12, fontSize: 13.5, lineHeight: 1.5,
                  background: m.role === 'user' ? 'var(--accent)' : 'var(--bg-hover)',
                  color: m.role === 'user' ? 'white' : 'var(--text-primary)',
                  borderBottomRightRadius: m.role === 'user' ? 2 : 12,
                  borderBottomLeftRadius: m.role === 'ai' ? 2 : 12,
                }}>
                  {m.text}
                </div>
              </div>
            ))}
            <div ref={msgsEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} style={{ padding: 12, borderTop: '1px solid var(--border)', display: 'flex', gap: 8, background: 'var(--bg-surface)' }}>
            <input type="text" value={input} onChange={e => setInput(e.target.value)}
              placeholder="Hỏi AI về deals, doanh thu..."
              style={{ flex: 1, background: 'var(--bg-base)', border: '1px solid var(--border)', borderRadius: 8, padding: '0 12px', color: 'white', fontSize: 13, height: 36 }}
            />
            <button type="submit" style={{ background: 'var(--accent)', border: 'none', borderRadius: 8, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer' }}>
              ↑
            </button>
          </form>
        </div>
      )}
      <style>{`
        @keyframes fade-up { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </>
  )
}
