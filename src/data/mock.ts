import type { Medicine, Pharmacy, ElderInfo, FamilyNotice } from '@/types'
import dayjs from 'dayjs'

export const mockPharmacies: Pharmacy[] = [
  {
    id: 'p1',
    name: '康宁大药房（文化路店）',
    phone: '010-88886666',
    address: '文化路128号',
    businessHours: '08:00 - 21:00',
    needPrescription: true,
    allowFamilyPurchase: true,
    notes: '请携带处方原件或电子处方，家属代买需携带本人身份证'
  },
  {
    id: 'p2',
    name: '仁德堂药店（中心店）',
    phone: '010-66668888',
    address: '中心街56号',
    businessHours: '07:30 - 22:00',
    needPrescription: true,
    allowFamilyPurchase: true,
    notes: '支持电子处方，24小时售药窗口'
  }
]

export const mockMedicines: Medicine[] = [
  {
    id: 'm1',
    name: '苯磺酸氨氯地平片',
    dailyDosage: 1,
    lastPurchaseQuantity: 30,
    lastPurchaseDate: dayjs().subtract(28, 'day').format('YYYY-MM-DD'),
    frequencyPerDay: 1,
    dosagePerTime: 1,
    pharmacyId: 'p1',
    notes: '降压药，每日早餐后服用'
  },
  {
    id: 'm2',
    name: '盐酸二甲双胍缓释片',
    dailyDosage: 2,
    lastPurchaseQuantity: 60,
    lastPurchaseDate: dayjs().subtract(25, 'day').format('YYYY-MM-DD'),
    frequencyPerDay: 2,
    dosagePerTime: 1,
    pharmacyId: 'p1',
    notes: '降糖药，早晚餐中服用'
  },
  {
    id: 'm3',
    name: '阿托伐他汀钙片',
    dailyDosage: 1,
    lastPurchaseQuantity: 28,
    lastPurchaseDate: dayjs().subtract(5, 'day').format('YYYY-MM-DD'),
    frequencyPerDay: 1,
    dosagePerTime: 1,
    pharmacyId: 'p2',
    notes: '降脂药，每晚睡前服用'
  }
]

export const mockElders: ElderInfo[] = [
  {
    id: 'e1',
    name: '张建国',
    nickname: '爸爸',
    phone: '138****6688'
  }
]

export const mockFamilyNotices: FamilyNotice[] = [
  {
    id: 'n1',
    elderId: 'e1',
    elderName: '张建国',
    elderNickname: '爸爸',
    medicineName: '苯磺酸氨氯地平片（降压药）',
    remainingDays: 2,
    level: 'orange',
    createdTime: dayjs().subtract(2, 'hour').format('YYYY-MM-DD HH:mm'),
    status: 'pending'
  },
  {
    id: 'n2',
    elderId: 'e1',
    elderName: '张建国',
    elderNickname: '爸爸',
    medicineName: '盐酸二甲双胍缓释片（降糖药）',
    remainingDays: 5,
    level: 'green',
    createdTime: dayjs().subtract(1, 'day').format('YYYY-MM-DD HH:mm'),
    status: 'reminded'
  }
]
