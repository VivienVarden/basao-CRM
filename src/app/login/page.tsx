'use client'
import { signIn } from 'next-auth/react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function LoginPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (session) router.replace('/')
  }, [session, router])

  if (status === 'loading') return null

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await signIn('credentials', {
      username,
      password,
      redirect: false,
    })

    setLoading(false)
    if (result?.ok) {
      router.replace('/')
    } else {
      setError('Sai ID hoặc mật khẩu. Vui lòng thử lại.')
    }
  }

  return (
    <div className="login-page">
      <div className="login-bg" />

      {/* Animated background blobs */}
      <div style={{
        position: 'absolute', width: 400, height: 400,
        background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)',
        top: '10%', left: '15%', borderRadius: '50%',
        animation: 'float 8s ease-in-out infinite',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', width: 300, height: 300,
        background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)',
        bottom: '15%', right: '20%', borderRadius: '50%',
        animation: 'float 10s ease-in-out infinite reverse',
        pointerEvents: 'none',
      }} />

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-30px) scale(1.05); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-8px); }
          40%, 80% { transform: translateX(8px); }
        }
        .error-shake { animation: shake 0.4s ease; }
      `}</style>

      <div className="login-card" style={{ maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 68, height: 68,
            background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
            borderRadius: 20,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32, margin: '0 auto 16px',
            boxShadow: '0 0 40px rgba(59,130,246,0.35), 0 0 80px rgba(59,130,246,0.1)',
          }}>
            💹
          </div>
          <h1 style={{
            fontSize: 28, fontWeight: 800,
            color: 'var(--text-primary)',
            marginBottom: 6,
          }}>
            Basao CRM
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Valuation · Financial Services · B2B
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin}>
          {/* Username */}
          <div className="form-group">
            <label className="form-label" style={{ fontSize: 11 }}>ID đăng nhập</label>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                fontSize: 15, color: 'var(--text-muted)', pointerEvents: 'none',
              }}>👤</span>
              <input
                id="input-username"
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Nhập ID..."
                required
                autoComplete="username"
                style={{ paddingLeft: 36, fontSize: 15, height: 46, background: 'rgba(255,255,255,0.04)' }}
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-group" style={{ marginBottom: 20 }}>
            <label className="form-label" style={{ fontSize: 11 }}>Mật khẩu</label>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                fontSize: 15, color: 'var(--text-muted)', pointerEvents: 'none',
              }}>🔒</span>
              <input
                id="input-password"
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu..."
                required
                autoComplete="current-password"
                style={{ paddingLeft: 36, paddingRight: 44, fontSize: 15, height: 46, background: 'rgba(255,255,255,0.04)' }}
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: 'var(--text-muted)',
                  cursor: 'pointer', fontSize: 15, padding: 4,
                }}
              >
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="error-shake" style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.25)',
              color: 'var(--color-red)',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 14px',
              fontSize: 13,
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Submit */}
          <button
            id="btn-login-submit"
            type="submit"
            className="btn btn-primary"
            disabled={loading || !username || !password}
            style={{
              width: '100%',
              height: 48,
              fontSize: 15,
              fontWeight: 700,
              justifyContent: 'center',
              transition: 'all 0.2s',
            }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="spin" style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%' }} />
                Đang đăng nhập...
              </span>
            ) : '🔓 Đăng nhập'}
          </button>
        </form>

        {/* Divider */}
        <div className="divider" style={{ margin: '24px 0' }} />

        {/* Language flags */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
          {['🇺🇸', '🇻🇳', '🇨🇳', '🇰🇷', '🇯🇵'].map((flag, i) => (
            <span key={i} style={{ fontSize: 20, opacity: 0.5, cursor: 'default' }}
              title={['English', 'Tiếng Việt', '中文', '한국어', '日本語'][i]}>
              {flag}
            </span>
          ))}
        </div>

        <p style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginTop: 16, lineHeight: 1.6 }}>
          🔒 Hệ thống nội bộ — Chỉ dành cho nhân viên có tài khoản
        </p>
      </div>
    </div>
  )
}
