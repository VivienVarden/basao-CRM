export type BankId = 'VCB' | 'BIDV' | 'CTG' | 'AGRIBANK' | 'NCB' | 'SCB' | 'MB' | 'VAMC' | 'SHB' | 'ACB' | 'VIB' | 'TCB'

export const SUPPORTED_BANKS: { id: BankId; name: string; shortName: string }[] = [
  { id: 'VCB', shortName: 'Vietcombank', name: 'Ngân hàng TMCP Ngoại thương Việt Nam (VIETCOMBANK)' },
  { id: 'BIDV', shortName: 'BIDV', name: 'Ngân hàng TMCP Đầu tư và Phát triển Việt Nam (BIDV)' },
  { id: 'CTG', shortName: 'VietinBank', name: 'Ngân hàng TMCP Công thương Việt Nam (VIETINBANK)' },
  { id: 'AGRIBANK', shortName: 'Agribank', name: 'Ngân hàng Nông nghiệp và Phát triển nông thôn Việt Nam (AGRIBANK)' },
  { id: 'NCB', shortName: 'NCB', name: 'Ngân hàng Quốc dân Việt Nam (NCB)' },
  { id: 'SCB', shortName: 'Standard Chartered', name: 'Ngân hàng TNHH Một thành viên Standard Chartered Việt Nam (SCB)' },
  { id: 'MB', shortName: 'MBBank', name: 'Ngân hàng TMCP Quân đội (MB)' },
  { id: 'VAMC', shortName: 'VAMC', name: 'Công ty quản lý tài sản của các tổ chức tín dụng Việt Nam (VAMC)' },
  { id: 'SHB', shortName: 'SHB', name: 'Ngân hàng TMCP Sài Gòn – Hà Nội (SHB)' },
  { id: 'ACB', shortName: 'ACB', name: 'Ngân hàng TMCP Á Châu (ACB)' },
  { id: 'VIB', shortName: 'VIB', name: 'Ngân hàng TMCP Quốc Tế Việt Nam (VIB)' },
  { id: 'TCB', shortName: 'Techcombank', name: 'Ngân hàng TMCP Kỹ thương Việt Nam (TECHCOMBANK)' },
]
