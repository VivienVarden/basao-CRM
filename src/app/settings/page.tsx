'use client'
import { AppLayout } from '@/components/layout/AppLayout'
import { Header } from '@/components/layout/Header'
import { useApp } from '@/lib/context'
import { t } from '@/lib/i18n'
import { localeNames, localeFlags } from '@/lib/i18n'
import { currencyConfig } from '@/lib/currencies'
import { Locale, Currency } from '@/lib/types'
import { resetStore } from '@/lib/store'

const LOCALES: Locale[] = ['en', 'vi', 'zh', 'ko', 'ja']
const CURRENCIES: Currency[] = ['VND', 'USD', 'CNY', 'KRW', 'JPY']

export default function SettingsPage() {
  const { locale, setLocale, currency, setCurrency, store } = useApp()

  const handleResetData = () => {
    if (confirm(locale === 'vi' ? 'Reset toàn bộ data về seed data mẫu? Dữ liệu hiện tại sẽ bị xóa.' : 'Reset all data to seed data? Current data will be wiped.')) {
      resetStore()
      window.location.reload()
    }
  }

  const toggleRule = () => {
    // Only a simulator toggle inside component state for MVP
    alert(locale === 'vi' ? 'Đã lưu cấu hình rule siêu tính năng!' : 'Commission Rule simulated save!');
  }

  return (
    <AppLayout>
      <Header title={t(locale, 'settings.title')} subtitle={locale === 'vi' ? "Cấu hình hệ thống CRM" : "CRM System Configuration"} />
      <div className="page-body animate-fade" style={{ maxWidth: 720 }}>

        {/* Language */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-title" style={{ marginBottom: 16 }}>🌐 {t(locale, 'settings.defaultLanguage')}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
            {LOCALES.map(l => (
              <button key={l} onClick={() => setLocale(l)}
                style={{ padding: '12px 8px', borderRadius: 'var(--radius)', border: `2px solid ${l === locale ? 'var(--accent)' : 'var(--border)'}`, background: l === locale ? 'var(--accent-glow)' : 'var(--bg-hover)', cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s' }}>
                <div style={{ fontSize: 24, marginBottom: 4 }}>{localeFlags[l]}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: l === locale ? 'var(--accent)' : 'var(--text-secondary)' }}>{localeNames[l]}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Currency */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-title" style={{ marginBottom: 16 }}>💱 {t(locale, 'settings.defaultCurrency')}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
            {CURRENCIES.map(c => (
              <button key={c} onClick={() => setCurrency(c)}
                style={{ padding: '12px 8px', borderRadius: 'var(--radius)', border: `2px solid ${c === currency ? 'var(--color-green)' : 'var(--border)'}`, background: c === currency ? 'rgba(16,185,129,0.08)' : 'var(--bg-hover)', cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s' }}>
                <div style={{ fontSize: 24, marginBottom: 4 }}>{currencyConfig[c].flag}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: c === currency ? 'var(--color-green)' : 'var(--text-primary)' }}>{c}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{currencyConfig[c].symbol}</div>
              </button>
            ))}
          </div>
        </div>

        {/* System Info */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-title" style={{ marginBottom: 16 }}>📊 {locale === 'vi' ? 'Thống kê Database' : 'Database Stats'}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {[
              { label: 'Deals', value: store.deals.length, icon: '💼' },
              { label: 'Customers', value: store.customers.length, icon: '👥' },
              { label: 'Partners', value: store.partners.length, icon: '🤝' },
              { label: 'Tasks', value: store.tasks.length, icon: '✅' },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center', padding: 16, background: 'var(--bg-hover)', borderRadius: 'var(--radius)' }}>
                <div style={{ fontSize: 24, marginBottom: 6 }}>{s.icon}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--accent)' }}>{s.value}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Admin Feature 3: Dynamic Commission Rules */}
        <div className="card" style={{ marginBottom: 20, borderColor: 'rgba(139,92,246,0.2)' }}>
          <div className="card-title" style={{ marginBottom: 16 }}>⚡ {locale === 'vi' ? 'Động cơ Tính Hoa hồng Tự động (Rules Engine)' : 'Automated Commission Rules Engine'}</div>
          <div style={{ background: 'var(--bg-hover)', borderRadius: 12, padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Tier 1 Catalyst</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>If Deal Value &gt; $50k, Add +2.5% to sales commission.</div>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" defaultChecked onChange={toggleRule} />
                <span className="slider"></span>
              </label>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Fast-Close Bonus</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>If Time-to-close &lt; 30 days, Add +1% bonus.</div>
              </div>
              <label className="toggle-switch">
                <input type="checkbox" onChange={toggleRule} />
                <span className="slider"></span>
              </label>
            </div>
            <button className="btn btn-secondary btn-sm" style={{ marginTop: 12, width: '100%', border: '1px dashed var(--accent)' }}>
              + {locale === 'vi' ? 'Thêm Rule mới' : 'Add New Rule'}
            </button>
          </div>
        </div>
        
        <style>{`
          .toggle-switch { position: relative; display: inline-block; width: 40px; height: 22px; }
          .toggle-switch input { opacity: 0; width: 0; height: 0; }
          .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: var(--border); transition: .4s; border-radius: 22px; }
          .slider:before { position: absolute; content: ""; height: 16px; width: 16px; left: 3px; bottom: 3px; background-color: white; transition: .4s; border-radius: 50%; }
          input:checked + .slider { background-color: var(--color-green); }
          input:checked + .slider:before { transform: translateX(18px); }
        `}</style>

        {/* Google OAuth Setup */}
        <div className="card" style={{ marginBottom: 20, borderColor: 'rgba(59,130,246,0.2)' }}>
          <div className="card-title" style={{ marginBottom: 12 }}>🔐 {locale === 'vi' ? 'Cấu hình Google OAuth' : 'Google OAuth Setup'}</div>
          <div style={{ background: 'var(--bg-hover)', borderRadius: 'var(--radius-sm)', padding: 14, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
            <p><strong>{locale === 'vi' ? 'Bước 1:' : 'Step 1:'}</strong> {locale === 'vi' ? 'Truy cập' : 'Access'} <a href="https://console.cloud.google.com" target="_blank" style={{ color: 'var(--accent)' }}>Google Cloud Console</a></p>
            <p><strong>{locale === 'vi' ? 'Bước 2:' : 'Step 2:'}</strong> {locale === 'vi' ? 'Tạo dự án → APIs & Services → Credentials → OAuth 2.0 Client ID' : 'Create project → APIs & Services → Credentials → OAuth 2.0 Client ID'}</p>
            <p><strong>{locale === 'vi' ? 'Bước 3:' : 'Step 3:'}</strong> {locale === 'vi' ? 'Thêm Authorized redirect URI:' : 'Add Authorized redirect URI:'} <code style={{ background: 'var(--bg-card)', padding: '1px 6px', borderRadius: 4 }}>http://localhost:3000/api/auth/callback/google</code></p>
            <p><strong>{locale === 'vi' ? 'Bước 4:' : 'Step 4:'}</strong> {locale === 'vi' ? 'Copy file' : 'Copy file'} <code style={{ background: 'var(--bg-card)', padding: '1px 6px', borderRadius: 4 }}>.env.local.example</code> {locale === 'vi' ? 'thành' : 'to'} <code style={{ background: 'var(--bg-card)', padding: '1px 6px', borderRadius: 4 }}>.env.local</code> {locale === 'vi' ? 'và điền thông tin' : 'and fill in secrets'}</p>
            <p><strong>{locale === 'vi' ? 'Bước 5:' : 'Step 5:'}</strong> {locale === 'vi' ? 'Khởi động lại server' : 'Restart the server'}</p>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="card" style={{ borderColor: 'rgba(239,68,68,0.2)' }}>
          <div className="card-title" style={{ marginBottom: 12, color: 'var(--color-red)' }}>⚠️ Danger Zone</div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14 }}>{locale === 'vi' ? 'Reset toàn bộ dữ liệu về seed data ban đầu (10 deals, 8 customers, 8 partners...).' : 'Reset all data to initial seed data.'}</p>
          <button className="btn btn-danger" onClick={handleResetData}>🔄 {locale === 'vi' ? 'Reset về Seed Data' : 'Reset to Seed Data'}</button>
        </div>
      </div>
    </AppLayout>
  )
}
