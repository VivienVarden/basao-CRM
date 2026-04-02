import { DealStatus, TaskPriority, CustomerStatus } from './types'

export function getDealStatusColor(status: DealStatus): string {
  const map: Record<DealStatus, string> = {
    new: 'var(--color-blue)',
    processing: 'var(--color-amber)',
    negotiating: 'var(--color-purple)',
    closed_won: 'var(--color-green)',
    closed_lost: 'var(--color-red)',
  }
  return map[status] || 'var(--color-muted)'
}

export function getPriorityColor(priority: TaskPriority): string {
  const map: Record<TaskPriority, string> = {
    low: 'var(--color-muted)',
    medium: 'var(--color-amber)',
    high: 'var(--color-orange)',
    urgent: 'var(--color-red)',
  }
  return map[priority] || 'var(--color-muted)'
}

export function getCustomerStatusColor(status: CustomerStatus): string {
  const map: Record<CustomerStatus, string> = {
    lead: 'var(--color-blue)',
    processing: 'var(--color-amber)',
    closed: 'var(--color-green)',
    failed: 'var(--color-red)',
  }
  return map[status] || 'var(--color-muted)'
}

export function formatDate(iso: string, locale = 'vi-VN'): string {
  try {
    return new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(iso))
  } catch {
    return iso.slice(0, 10)
  }
}

export function formatRelativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Hôm nay'
  if (days === 1) return 'Hôm qua'
  if (days < 7) return `${days} ngày trước`
  if (days < 30) return `${Math.floor(days / 7)} tuần trước`
  return `${Math.floor(days / 30)} tháng trước`
}

export function isDealOverdue(deadline: string): boolean {
  return new Date(deadline) < new Date()
}

export function daysUntilDeadline(deadline: string): number {
  return Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000)
}

export function getInitials(name: string): string {
  return name.split(' ').slice(-2).map(w => w[0]).join('').toUpperCase()
}

export function generateAvatarColor(name: string): string {
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16']
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}
