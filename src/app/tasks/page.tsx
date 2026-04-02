'use client'
import { useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Header } from '@/components/layout/Header'
import { useApp } from '@/lib/context'
import { t } from '@/lib/i18n'
import { Task, TaskPriority, TaskStatus } from '@/lib/types'
import { formatDate, daysUntilDeadline, getPriorityColor } from '@/lib/utils'

const PRIORITIES: TaskPriority[] = ['urgent', 'high', 'medium', 'low']
const STATUSES: TaskStatus[] = ['todo', 'in_progress', 'done']

const PRIORITY_BADGE: Record<TaskPriority, string> = { urgent: 'badge-red', high: 'badge-orange', medium: 'badge-amber', low: 'badge-gray' }
const PRIORITY_EMOJI: Record<TaskPriority, string> = { urgent: '🔴', high: '🟠', medium: '🟡', low: '⚪' }

export default function TasksPage() {
  const { store, locale, addTask, updateTask, deleteTask } = useApp()
  const [showForm, setShowForm] = useState(false)
  const [editTask, setEditTask] = useState<Task | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterPriority, setFilterPriority] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({ title: '', description: '', dueDate: '', priority: 'medium' as TaskPriority, status: 'todo' as TaskStatus, dealId: '', customerId: '' })

  const tasks = store.tasks.filter(task => {
    const q = search.toLowerCase()
    const matchQ = !q || task.title.toLowerCase().includes(q) || task.description.toLowerCase().includes(q)
    const matchS = filterStatus === 'all' || task.status === filterStatus
    const matchP = filterPriority === 'all' || task.priority === filterPriority
    return matchQ && matchS && matchP
  }).sort((a, b) => {
    const pOrder: Record<TaskPriority, number> = { urgent: 0, high: 1, medium: 2, low: 3 }
    return pOrder[a.priority] - pOrder[b.priority] || new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  })

  const setF = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))

  const openNew = () => {
    setEditTask(null)
    setForm({ title: '', description: '', dueDate: '', priority: 'medium', status: 'todo', dealId: '', customerId: '' })
    setShowForm(true)
  }

  const openEdit = (task: Task) => {
    setEditTask(task)
    setForm({ title: task.title, description: task.description, dueDate: task.dueDate.slice(0, 10), priority: task.priority, status: task.status, dealId: task.dealId || '', customerId: task.customerId || '' })
    setShowForm(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const data = { ...form, dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : new Date().toISOString(), dealId: form.dealId || undefined, customerId: form.customerId || undefined }
    if (editTask) updateTask(editTask.id, data)
    else addTask(data)
    setShowForm(false)
  }

  const toggleStatus = (task: Task) => {
    const next: TaskStatus = task.status === 'done' ? 'todo' : task.status === 'todo' ? 'in_progress' : 'done'
    updateTask(task.id, { status: next })
  }

  const overdue = tasks.filter(t => t.status !== 'done' && daysUntilDeadline(t.dueDate) < 0)
  const today = tasks.filter(t => t.status !== 'done' && daysUntilDeadline(t.dueDate) === 0)
  const upcoming = tasks.filter(t => t.status !== 'done' && daysUntilDeadline(t.dueDate) > 0)
  const done = tasks.filter(t => t.status === 'done')

  return (
    <AppLayout>
      <Header
        title={t(locale, 'tasks.title')}
        subtitle={`${store.tasks.filter(t => t.status !== 'done').length} chưa xong`}
        actions={<button className="btn btn-primary" onClick={openNew} id="btn-create-task">+ {t(locale, 'tasks.createTask')}</button>}
      />
      <div className="page-body animate-fade">
        <div className="search-filter-bar">
          <div className="search-input-wrap">
            <span className="search-icon">🔍</span>
            <input placeholder="Tìm kiếm task..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="all">Tất cả status</option>
            {STATUSES.map(s => <option key={s} value={s}>{t(locale, `tasks.status.${s}` as any)}</option>)}
          </select>
          <select className="filter-select" value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
            <option value="all">Tất cả priority</option>
            {PRIORITIES.map(p => <option key={p} value={p}>{t(locale, `tasks.priority.${p}` as any)}</option>)}
          </select>
        </div>

        {/* Stats mini */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          {[
            { label: '🔴 Quá hạn', count: overdue.length, color: 'var(--color-red)' },
            { label: '📅 Hôm nay', count: today.length, color: 'var(--color-amber)' },
            { label: '🔜 Sắp tới', count: upcoming.length, color: 'var(--accent)' },
            { label: '✅ Xong', count: done.length, color: 'var(--color-green)' },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '8px 14px', display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontWeight: 800, fontSize: 18, color: s.color }}>{s.count}</span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* Task groups */}
        {[
          { label: '🔴 Quá hạn', tasks: filterStatus !== 'all' ? [] : overdue, color: 'var(--color-red)' },
          { label: '📅 Hôm nay', tasks: filterStatus !== 'all' ? [] : today, color: 'var(--color-amber)' },
          { label: '🔜 Sắp tới & Tất cả', tasks: filterStatus !== 'all' ? tasks : upcoming, color: 'var(--accent)' },
          { label: '✅ Đã hoàn thành', tasks: filterStatus !== 'all' ? [] : done, color: 'var(--color-green)' },
        ].map(group => group.tasks.length === 0 ? null : (
          <div key={group.label} style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: group.color, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
              {group.label}
              <span style={{ background: 'var(--bg-hover)', color: 'var(--text-muted)', fontSize: 11, padding: '1px 7px', borderRadius: 10, fontWeight: 600 }}>{group.tasks.length}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {group.tasks.map(task => {
                const days = daysUntilDeadline(task.dueDate)
                const linkedDeal = task.dealId ? store.deals.find(d => d.id === task.dealId) : null
                const linkedCustomer = task.customerId ? store.customers.find(c => c.id === task.customerId) : null
                return (
                  <div key={task.id} className="card" style={{ padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'flex-start', opacity: task.status === 'done' ? 0.6 : 1 }}>
                    <button onClick={() => toggleStatus(task)}
                      style={{ width: 22, height: 22, borderRadius: '50%', border: `2px solid ${task.status === 'done' ? 'var(--color-green)' : task.status === 'in_progress' ? 'var(--accent)' : 'var(--border)'}`, background: task.status === 'done' ? 'var(--color-green)' : task.status === 'in_progress' ? 'var(--accent-glow)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0, cursor: 'pointer', marginTop: 2 }}>
                      {task.status === 'done' ? '✓' : task.status === 'in_progress' ? '◉' : ''}
                    </button>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 600, fontSize: 14, textDecoration: task.status === 'done' ? 'line-through' : 'none' }}>{task.title}</span>
                        <span className={`badge ${PRIORITY_BADGE[task.priority]}`}>{PRIORITY_EMOJI[task.priority]} {t(locale, `tasks.priority.${task.priority}` as any)}</span>
                      </div>
                      {task.description && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{task.description}</div>}
                      <div style={{ display: 'flex', gap: 12, marginTop: 6, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 11, color: days < 0 && task.status !== 'done' ? 'var(--color-red)' : 'var(--text-muted)' }}>📅 {formatDate(task.dueDate)}</span>
                        {linkedDeal && <span style={{ fontSize: 11, color: 'var(--accent)' }}>💼 {linkedDeal.name}</span>}
                        {linkedCustomer && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>👤 {linkedCustomer.name}</span>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(task)}>✏️</button>
                      <button className="btn btn-danger btn-icon btn-sm" onClick={() => { if (confirm('Xóa task?')) deleteTask(task.id) }}>🗑</button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
        {tasks.length === 0 && <div className="empty-state"><div className="empty-state-icon">✅</div><div className="empty-state-title">Không có task nào!</div></div>}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal animate-up">
            <div className="modal-header">
              <div className="modal-title">{editTask ? '✏️ Sửa task' : '+ Tạo task mới'}</div>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">{t(locale, 'tasks.taskTitle')} *</label>
                  <input required value={form.title} onChange={e => setF('title', e.target.value)} placeholder="Tiêu đề task..." />
                </div>
                <div className="form-group">
                  <label className="form-label">Mô tả</label>
                  <textarea value={form.description} onChange={e => setF('description', e.target.value)} placeholder="Chi tiết công việc..." rows={2} />
                </div>
                <div className="form-row cols-3">
                  <div className="form-group">
                    <label className="form-label">{t(locale, 'tasks.dueDate')}</label>
                    <input type="date" value={form.dueDate} onChange={e => setF('dueDate', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t(locale, 'tasks.priority')}</label>
                    <select value={form.priority} onChange={e => setF('priority', e.target.value)}>
                      {PRIORITIES.map(p => <option key={p} value={p}>{t(locale, `tasks.priority.${p}` as any)}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select value={form.status} onChange={e => setF('status', e.target.value)}>
                      {STATUSES.map(s => <option key={s} value={s}>{t(locale, `tasks.status.${s}` as any)}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-row cols-2">
                  <div className="form-group">
                    <label className="form-label">{t(locale, 'tasks.linkedDeal')}</label>
                    <select value={form.dealId} onChange={e => setF('dealId', e.target.value)}>
                      <option value="">— Không gắn —</option>
                      {store.deals.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t(locale, 'tasks.linkedCustomer')}</label>
                    <select value={form.customerId} onChange={e => setF('customerId', e.target.value)}>
                      <option value="">— Không gắn —</option>
                      {store.customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>{t(locale, 'general.cancel')}</button>
                <button type="submit" className="btn btn-primary">{t(locale, 'general.save')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
