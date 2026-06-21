export type ReminderLevel = 'green' | 'orange' | 'red'

export interface Pharmacy {
  id: string
  name: string
  phone: string
  address: string
  businessHours: string
  needPrescription: boolean
  allowFamilyPurchase: boolean
  notes: string
}

export interface Medicine {
  id: string
  name: string
  dailyDosage: number
  lastPurchaseQuantity: number
  lastPurchaseDate: string
  frequencyPerDay: number
  dosagePerTime: number
  pharmacyId: string
  notes?: string
}

export interface ElderInfo {
  id: string
  name: string
  nickname: string
  phone: string
  avatar?: string
}

export interface FamilyNotice {
  id: string
  elderId: string
  elderName: string
  elderNickname: string
  medicineName: string
  remainingDays: number
  level: ReminderLevel
  createdTime: string
  status: 'pending' | 'reminded' | 'willBuy' | 'needCallback'
}

export interface ReminderInfo {
  medicineId: string
  medicineName: string
  remainingDays: number
  remainingQuantity: number
  level: ReminderLevel
  pharmacy: Pharmacy
  shouldBuyToday: boolean
}
