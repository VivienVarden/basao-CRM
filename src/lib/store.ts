import { v4 as uuidv4 } from 'uuid'
import {
  AppStore, Customer, Deal, Partner, Task, Commission,
  ActivityLog, TimelineEvent
} from './types'

const STORE_KEY = 'crm_data_v1'

// ─── Seed Data ─────────────────────────────────────────────────────────────────
function generateSeedData(): AppStore {
  const now = new Date().toISOString()
  const days = (n: number) => new Date(Date.now() + n * 86400000).toISOString()

  const partners: Partner[] = [
    { id: 'p1', name: 'Nguyễn Minh Tuấn', role: 'sales', phone: '0901234567', email: 'tuan@company.vn', company: 'ABC Valuation', dealIds: ['d1', 'd2'], createdAt: now, updatedAt: now },
    { id: 'p2', name: 'Trần Thị Lan', role: 'broker', phone: '0912345678', email: 'lan@broker.vn', company: 'XYZ Broker', dealIds: ['d1', 'd3'], createdAt: now, updatedAt: now },
    { id: 'p3', name: 'Lê Hoàng Nam', role: 'consultant', phone: '0923456789', email: 'nam@consult.vn', company: 'Nam Consulting', dealIds: ['d2'], createdAt: now, updatedAt: now },
    { id: 'p4', name: 'Phạm Thu Hà', role: 'internal', phone: '0934567890', email: 'ha@company.vn', company: 'ABC Valuation', dealIds: ['d3', 'd4'], createdAt: now, updatedAt: now },
    { id: 'p5', name: 'Vũ Đức Long', role: 'partner', phone: '0945678901', email: 'long@partner.vn', company: 'Long & Associates', dealIds: ['d4', 'd5'], createdAt: now, updatedAt: now },
    { id: 'p6', name: 'Đỗ Thị Mai', role: 'legal', phone: '0956789012', email: 'mai@legal.vn', company: 'Mai Legal', dealIds: ['d5'], createdAt: now, updatedAt: now },
    { id: 'p7', name: 'Hoàng Văn Bình', role: 'external', phone: '0967890123', email: 'binh@ext.vn', company: 'External Co', dealIds: ['d6'], createdAt: now, updatedAt: now },
    { id: 'p8', name: 'Ngô Thị Thanh', role: 'sales', phone: '0978901234', email: 'thanh@sales.vn', company: 'ABC Valuation', dealIds: ['d6', 'd7'], createdAt: now, updatedAt: now },
  ]

  const customers: Customer[] = [
    {
      id: 'c1', name: 'Công ty TNHH Sunshine Real Estate', phone: '0281234567', email: 'contact@sunshine.vn',
      company: 'Sunshine Real Estate', source: 'referral', status: 'processing', tags: ['real-estate', 'vip'],
      notes: [{ id: uuidv4(), type: 'note', content: 'Khách hàng tiềm năng, cần thẩm định 5 BĐS tại TP.HCM', createdAt: now, createdBy: 'Admin' }],
      dealIds: ['d1', 'd2'], createdAt: now, updatedAt: now,
    },
    {
      id: 'c2', name: 'Tập đoàn Đầu tư Phương Nam', phone: '0291234568', email: 'info@phuongnam.vn',
      company: 'Phương Nam Group', source: 'cold_call', status: 'lead', tags: ['enterprise', 'pending'],
      notes: [{ id: uuidv4(), type: 'call', content: 'Đã gọi điện giới thiệu dịch vụ, khách hẹn gặp tuần tới', createdAt: now, createdBy: 'Admin' }],
      dealIds: ['d3'], createdAt: now, updatedAt: now,
    },
    {
      id: 'c3', name: 'Ngân hàng TMCP Á Châu (ACB)', phone: '1800 6277', email: 'valuation@acb.com.vn',
      company: 'ACB Bank', source: 'partner', status: 'closed', tags: ['bank', 'recurring'],
      notes: [], dealIds: ['d4'], createdAt: now, updatedAt: now,
    },
    {
      id: 'c4', name: 'Vincom Retail', phone: '0241234569', email: 'assets@vincom.vn',
      company: 'Vincom Retail JSC', source: 'event', status: 'processing', tags: ['retail', 'large-scale'],
      notes: [{ id: uuidv4(), type: 'meeting', content: 'Meeting tại văn phòng Vincom, đã trình bày năng lực', createdAt: now, createdBy: 'Admin' }],
      dealIds: ['d5'], createdAt: now, updatedAt: now,
    },
    {
      id: 'c5', name: 'Kim Oanh Group', phone: '0271234570', email: 'kd@kimoanh.com',
      company: 'Kim Oanh Group', source: 'referral', status: 'lead', tags: ['developer'],
      notes: [], dealIds: [], createdAt: now, updatedAt: now,
    },
    {
      id: 'c6', name: 'Masteri Homes', phone: '0251234571', email: 'chairman@masteri.vn',
      company: 'Masteri Homes', source: 'website', status: 'failed', tags: ['luxury'],
      notes: [{ id: uuidv4(), type: 'note', content: 'Đã báo giá nhưng khách chọn đơn vị khác', createdAt: now, createdBy: 'Admin' }],
      dealIds: ['d6'], createdAt: now, updatedAt: now,
    },
    {
      id: 'c7', name: 'Techcombank', phone: '1800 588 822', email: 'collateral@techcombank.com.vn',
      company: 'Techcombank', source: 'partner', status: 'closed', tags: ['bank', 'vip'],
      notes: [], dealIds: ['d7', 'd8'], createdAt: now, updatedAt: now,
    },
    {
      id: 'c8', name: 'Đại học Quốc gia TP.HCM', phone: '0281234572', email: 'csvc@vnuhcm.edu.vn',
      company: 'VNU-HCM', source: 'social', status: 'processing', tags: ['education', 'government'],
      notes: [], dealIds: ['d9'], createdAt: now, updatedAt: now,
    },
    {
      id: 'c9', name: 'CBRE Vietnam', phone: '0241234573', email: 'valuation@cbre.com.vn',
      company: 'CBRE Vietnam', source: 'event', status: 'lead', tags: ['international'],
      notes: [], dealIds: [], createdAt: now, updatedAt: now,
    },
    {
      id: 'c10', name: 'Novaland Group', phone: '1900 6666 48', email: 'info@novaland.com.vn',
      company: 'Novaland', source: 'cold_call', status: 'processing', tags: ['developer', 'enterprise'],
      notes: [], dealIds: ['d10'], createdAt: now, updatedAt: now,
    },
  ]

  const makeCommissions = (dealId: string, dealValue: number): Commission[] => {
    const combos: { pid: string; pct: number }[][] = [
      [{ pid: 'p1', pct: 40 }, { pid: 'p2', pct: 35 }, { pid: 'p3', pct: 25 }],
      [{ pid: 'p1', pct: 50 }, { pid: 'p4', pct: 30 }, { pid: 'p5', pct: 20 }],
      [{ pid: 'p2', pct: 45 }, { pid: 'p3', pct: 30 }, { pid: 'p6', pct: 25 }],
    ]
    const idx = parseInt(dealId.replace('d', '')) % 3
    const pname: Record<string, string> = { p1: 'Nguyễn Minh Tuấn', p2: 'Trần Thị Lan', p3: 'Lê Hoàng Nam', p4: 'Phạm Thu Hà', p5: 'Vũ Đức Long', p6: 'Đỗ Thị Mai' }
    return combos[idx].map(({ pid, pct }) => ({
      id: uuidv4(), dealId, partnerId: pid, partnerName: pname[pid] || pid,
      percentage: pct, amount: Math.round(dealValue * pct / 100),
      currency: 'VND', status: Math.random() > 0.5 ? 'paid' : 'pending',
    }))
  }

  const deals: Deal[] = [
    { id: 'd1', name: 'Thẩm định dự án Sunshine City', value: 85000000, currency: 'VND', status: 'processing', deadline: days(15), description: 'Thẩm định giá dự án căn hộ cao cấp Sunshine City tại Q.12', customerIds: ['c1'], stakeholderIds: ['p1', 'p2'], commissions: makeCommissions('d1', 85000000), timeline: [{ id: uuidv4(), type: 'status_change', content: 'Deal được tạo và chuyển sang trạng thái xử lý', toStatus: 'processing', createdAt: now, createdBy: 'Admin' }], tags: ['real-estate', 'residential'], bankId: 'VCB', createdAt: now, updatedAt: now },
    { id: 'd2', name: 'Định giá tài sản thế chấp Q.7', value: 120000000, currency: 'VND', status: 'negotiating', deadline: days(7), description: 'Định giá 3 BĐS thế chấp tại Quận 7 cho Sunshine RE', customerIds: ['c1'], stakeholderIds: ['p1', 'p3'], commissions: makeCommissions('d2', 120000000), timeline: [], tags: ['mortgage', 'q7'], bankId: 'BIDV', createdAt: now, updatedAt: now },
    { id: 'd3', name: 'Thẩm định KCN Phương Nam', value: 450000000, currency: 'VND', status: 'new', deadline: days(30), description: 'Thẩm định khu công nghiệp 200ha tại Bình Dương', customerIds: ['c2'], stakeholderIds: ['p2', 'p4'], commissions: makeCommissions('d3', 450000000), timeline: [], tags: ['industrial', 'binh-duong'], bankId: 'MB', createdAt: now, updatedAt: now },
    { id: 'd4', name: 'Định giá TSBĐ ACB Batch Q1', value: 200000000, currency: 'VND', status: 'closed_won', deadline: days(-5), description: 'Định giá 12 tài sản bảo đảm theo yêu cầu của ACB Q1/2026', customerIds: ['c3'], stakeholderIds: ['p4', 'p5'], commissions: makeCommissions('d4', 200000000), timeline: [{ id: uuidv4(), type: 'status_change', content: 'Deal đã hoàn thành, chờ thanh toán', toStatus: 'closed_won', createdAt: now, createdBy: 'Phạm Thu Hà' }], tags: ['bank', 'batch'], bankId: 'ACB', createdAt: now, updatedAt: now },
    { id: 'd5', name: 'Thẩm định chuỗi Vincom', value: 750000000, currency: 'VND', status: 'processing', deadline: days(45), description: 'Thẩm định 5 trung tâm thương mại Vincom trên toàn quốc', customerIds: ['c4'], stakeholderIds: ['p5', 'p6'], commissions: makeCommissions('d5', 750000000), timeline: [], tags: ['retail', 'commercial', 'national'], bankId: 'CTG', createdAt: now, updatedAt: now },
    { id: 'd6', name: 'Định giá Masteri West Heights', value: 95000000, currency: 'VND', status: 'closed_lost', deadline: days(-10), description: 'Khách hàng đã chọn đơn vị khác sau khi báo giá', customerIds: ['c6'], stakeholderIds: ['p7', 'p8'], commissions: [], timeline: [{ id: uuidv4(), type: 'status_change', content: 'Deal thất bại - Khách chọn đơn vị khác', toStatus: 'closed_lost', createdAt: now, createdBy: 'Admin' }], tags: ['luxury', 'hoa-binh'], bankId: 'TCB', createdAt: now, updatedAt: now },
    { id: 'd7', name: 'Hợp đồng khung Techcombank 2026', value: 1200000000, currency: 'VND', status: 'closed_won', deadline: days(-30), description: 'Hợp đồng thẩm định định kỳ cho Techcombank cả năm 2026', customerIds: ['c7'], stakeholderIds: ['p8', 'p1'], commissions: makeCommissions('d7', 1200000000), timeline: [], tags: ['bank', 'annual', 'vip'], bankId: 'TCB', createdAt: now, updatedAt: now },
    { id: 'd8', name: 'TSBĐ Techcombank Batch Q4/25', value: 180000000, currency: 'VND', status: 'closed_won', deadline: days(-60), description: 'Thẩm định batch cuối năm 2025', customerIds: ['c7'], stakeholderIds: ['p1'], commissions: makeCommissions('d8', 180000000), timeline: [], tags: ['bank', 'batch'], bankId: 'TCB', createdAt: now, updatedAt: now },
    { id: 'd9', name: 'Định giá cơ sở vật chất VNU-HCM', value: 320000000, currency: 'VND', status: 'negotiating', deadline: days(20), description: 'Thẩm định toàn bộ cơ sở vật chất của ĐHQG TP.HCM', customerIds: ['c8'], stakeholderIds: ['p3', 'p6'], commissions: makeCommissions('d9', 320000000), timeline: [], tags: ['education', 'government', 'large'], bankId: 'BIDV', createdAt: now, updatedAt: now },
    { id: 'd10', name: 'Novaworld Hồ Tràm Complex', value: 2500000000, currency: 'VND', status: 'new', deadline: days(60), description: 'Dự án thẩm định lớn nhất năm: Novaworld Hồ Tràm 1000ha', customerIds: ['c10'], stakeholderIds: ['p1', 'p2', 'p3'], commissions: makeCommissions('d10', 2500000000), timeline: [], tags: ['mega-deal', 'resort', 'ba-ria'], bankId: 'MB', createdAt: now, updatedAt: now },
  ]

  const tasks: Task[] = [
    { id: 't1', title: 'Gửi báo cáo thẩm định Sunshine City', description: 'Hoàn thiện và gửi báo cáo chính thức cho khách hàng', dueDate: days(2), priority: 'high', status: 'in_progress', dealId: 'd1', createdAt: now, updatedAt: now },
    { id: 't2', title: 'Khảo sát thực địa Q.7', description: 'Đo đạc và chụp ảnh 3 BĐS tại Quận 7', dueDate: days(3), priority: 'urgent', status: 'todo', dealId: 'd2', createdAt: now, updatedAt: now },
    { id: 't3', title: 'Gọi điện chăm sóc Phương Nam Group', description: 'Follow up sau cuộc meeting tuần trước', dueDate: days(1), priority: 'medium', status: 'todo', customerId: 'c2', createdAt: now, updatedAt: now },
    { id: 't4', title: 'Thu thập hồ sơ pháp lý Vincom', description: 'Yêu cầu khách hàng cung cấp hồ sơ pháp lý đầy đủ', dueDate: days(5), priority: 'high', status: 'todo', dealId: 'd5', createdAt: now, updatedAt: now },
    { id: 't5', title: 'Ký hợp đồng Novaworld', description: 'Chuẩn bị và ký hợp đồng dịch vụ', dueDate: days(10), priority: 'urgent', status: 'todo', dealId: 'd10', createdAt: now, updatedAt: now },
    { id: 't6', title: 'Họp nhóm review tuần', description: 'Review tiến độ tất cả deals trong tuần', dueDate: days(0), priority: 'medium', status: 'done', createdAt: now, updatedAt: now },
    { id: 't7', title: 'Cập nhật báo cáo VNU-HCM', description: 'Chỉnh sửa theo góp ý của khách', dueDate: days(7), priority: 'high', status: 'in_progress', dealId: 'd9', createdAt: now, updatedAt: now },
    { id: 't8', title: 'Gửi hóa đơn ACB Batch Q1', description: 'Xuất hóa đơn cho deal đã hoàn thành', dueDate: days(-1), priority: 'urgent', status: 'todo', dealId: 'd4', createdAt: now, updatedAt: now },
  ]

  return {
    customers,
    deals,
    partners,
    tasks,
    users: [],
    settings: { defaultCurrency: 'VND', defaultLocale: 'vi' },
  }
}

// ─── Store API ─────────────────────────────────────────────────────────────────
export function loadStore(): AppStore {
  if (typeof window === 'undefined') return generateSeedData()
  try {
    const raw = localStorage.getItem(STORE_KEY)
    if (!raw) {
      const seed = generateSeedData()
      saveStore(seed)
      return seed
    }
    return JSON.parse(raw) as AppStore
  } catch {
    return generateSeedData()
  }
}

export function saveStore(store: AppStore): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORE_KEY, JSON.stringify(store))
}

export function resetStore(): AppStore {
  const seed = generateSeedData()
  saveStore(seed)
  return seed
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
export function generateId(): string {
  return uuidv4()
}

export function now(): string {
  return new Date().toISOString()
}
