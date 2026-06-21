import type { Medicine, Pharmacy, ElderInfo, FamilyNotice, PurchaseRecord } from '@/types'
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
    notes: '降压药，每日早餐后服用',
    ownerId: 'e1'
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
    notes: '降糖药，早晚餐中服用',
    ownerId: 'e1'
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
    notes: '降脂药，每晚睡前服用',
    ownerId: 'self'
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

export const mockPurchaseRecords: PurchaseRecord[] = [
  {
    id: 'r1',
    medicineId: 'm1',
    ownerId: 'e1',
    pharmacyId: 'p1',
    pharmacyName: '康宁大药房（文化路店）',
    medicineName: '苯磺酸氨氯地平片',
    quantity: 30,
    purchaseDate: dayjs().subtract(28, 'day').format('YYYY-MM-DD')
  },
  {
    id: 'r2',
    medicineId: 'm2',
    ownerId: 'e1',
    pharmacyId: 'p1',
    pharmacyName: '康宁大药房（文化路店）',
    medicineName: '盐酸二甲双胍缓释片',
    quantity: 60,
    purchaseDate: dayjs().subtract(25, 'day').format('YYYY-MM-DD')
  },
  {
    id: 'r3',
    medicineId: 'm3',
    ownerId: 'self',
    pharmacyId: 'p2',
    pharmacyName: '仁德堂药店（中心店）',
    medicineName: '阿托伐他汀钙片',
    quantity: 28,
    purchaseDate: dayjs().subtract(5, 'day').format('YYYY-MM-DD')
  }
]

export const mockFamilyNotices: FamilyNotice[] = [
  {
    id: 'e1_m1',
    elderId: 'e1',
    medicineId: 'm1',
    elderName: '张建国',
    elderNickname: '爸爸',
    medicineName: '苯磺酸氨氯地平片',
    remainingDays: 2,
    level: 'orange',
    createdTime: dayjs().subtract(2, 'hour').format('YYYY-MM-DD HH:mm'),
    status: 'pending'
  },
  {
    id: 'e1_m2',
    elderId: 'e1',
    medicineId: 'm2',
    elderName: '张建国',
    elderNickname: '爸爸',
    medicineName: '盐酸二甲双胍缓释片',
    remainingDays: 5,
    level: 'yellow',
    createdTime: dayjs().subtract(1, 'day').format('YYYY-MM-DD HH:mm'),
    status: 'reminded'
  }
]
