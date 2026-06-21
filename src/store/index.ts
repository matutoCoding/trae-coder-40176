import { create } from 'zustand'
import Taro from '@tarojs/taro'
import dayjs from 'dayjs'
import type {
  Medicine,
  Pharmacy,
  ElderInfo,
  FamilyNotice,
  ReminderInfo,
  PurchaseRecord
} from '@/types'
import { mockPharmacies, mockMedicines, mockElders, mockPurchaseRecords } from '@/data/mock'
import { buildReminderInfo, calculateRemainingDays, getReminderLevel } from '@/utils/medicine'

export const OWNER_SELF = 'self'

const STORAGE_KEYS = {
  medicines: 'app_medicines',
  elders: 'app_elders',
  noticeStatus: 'app_notice_status',
  userRole: 'app_user_role',
  purchaseRecords: 'app_purchase_records'
}

function loadStorage<T>(key: string, fallback: T): T {
  try {
    const raw = Taro.getStorageSync(key)
    if (raw) return JSON.parse(raw as string) as T
  } catch (e) {
    console.error('[Store] loadStorage error', key, e)
  }
  return fallback
}

function saveStorage(key: string, value: unknown): void {
  try {
    Taro.setStorageSync(key, JSON.stringify(value))
  } catch (e) {
    console.error('[Store] saveStorage error', key, e)
  }
}

function migrateMedicines(meds: (Medicine | { ownerId?: string })[]): Medicine[] {
  return meds.map((m) => ({
    ...(m as Medicine),
    ownerId: m.ownerId || OWNER_SELF
  }))
}

function buildFamilyNotices(
  elders: ElderInfo[],
  medicines: Medicine[],
  pharmacies: Pharmacy[],
  savedStatuses: Record<string, FamilyNotice['status']>
): FamilyNotice[] {
  const notices: FamilyNotice[] = []
  for (const elder of elders) {
    for (const med of medicines) {
      if (med.ownerId !== elder.id) continue
      const remainingDays = calculateRemainingDays(med)
      if (remainingDays > 7) continue
      const level = getReminderLevel(remainingDays)
      const noticeId = `${elder.id}_${med.id}`
      const saved = savedStatuses[noticeId]
      notices.push({
        id: noticeId,
        elderId: elder.id,
        medicineId: med.id,
        elderName: elder.name,
        elderNickname: elder.nickname,
        medicineName: med.name,
        remainingDays,
        level,
        createdTime: dayjs().format('YYYY-MM-DD HH:mm'),
        status: saved || 'pending'
      })
    }
  }
  return notices.sort((a, b) => {
    const levelOrder = { red: 0, orange: 1, yellow: 2, green: 3 }
    if (levelOrder[a.level] !== levelOrder[b.level]) {
      return levelOrder[a.level] - levelOrder[b.level]
    }
    return a.remainingDays - b.remainingDays
  })
}

interface AppState {
  userRole: 'member' | 'family'
  medicines: Medicine[]
  pharmacies: Pharmacy[]
  elders: ElderInfo[]
  purchaseRecords: PurchaseRecord[]
  noticeStatuses: Record<string, FamilyNotice['status']>
  familyNotices: FamilyNotice[]
  setUserRole: (role: 'member' | 'family') => void
  addMedicine: (medicine: Omit<Medicine, 'id'>) => void
  updateMedicine: (id: string, medicine: Partial<Medicine>) => void
  removeMedicine: (id: string) => void
  recordPurchase: (
    medicineId: string,
    data: { quantity: number; purchaseDate: string; pharmacyId: string }
  ) => void
  getPurchaseRecordsByMedicine: (medicineId: string) => PurchaseRecord[]
  getPharmacyById: (id: string) => Pharmacy | undefined
  getReminders: () => ReminderInfo[]
  getLastPharmacy: () => Pharmacy | null
  getLastPurchaseRecord: () => PurchaseRecord | null
  updateNoticeStatus: (id: string, status: FamilyNotice['status']) => void
  bindElder: (elder: Omit<ElderInfo, 'id'>) => void
  removeElder: (id: string) => void
  rebuildFamilyNotices: () => void
}

const rawMedicines = loadStorage<(Medicine | { ownerId?: string })[]>(STORAGE_KEYS.medicines, [])
const initialMedicines = rawMedicines.length > 0 ? migrateMedicines(rawMedicines) : mockMedicines
const initialElders = loadStorage<ElderInfo[]>(STORAGE_KEYS.elders, []).length > 0
  ? loadStorage<ElderInfo[]>(STORAGE_KEYS.elders, [])
  : mockElders
const initialNoticeStatuses = loadStorage<Record<string, FamilyNotice['status']>>(
  STORAGE_KEYS.noticeStatus,
  {}
)
const hasRecordsStorage = loadStorage<PurchaseRecord[]>(STORAGE_KEYS.purchaseRecords, []).length > 0
const initialPurchaseRecords = hasRecordsStorage
  ? loadStorage<PurchaseRecord[]>(STORAGE_KEYS.purchaseRecords, [])
  : mockPurchaseRecords
const initialUserRole = loadStorage<'member' | 'family'>(STORAGE_KEYS.userRole, 'member')

if (rawMedicines.length === 0) {
  saveStorage(STORAGE_KEYS.medicines, mockMedicines)
}
if (loadStorage<ElderInfo[]>(STORAGE_KEYS.elders, []).length === 0) {
  saveStorage(STORAGE_KEYS.elders, mockElders)
}
if (!hasRecordsStorage) {
  saveStorage(STORAGE_KEYS.purchaseRecords, mockPurchaseRecords)
}

const initialFamilyNotices = buildFamilyNotices(
  initialElders,
  initialMedicines,
  mockPharmacies,
  initialNoticeStatuses
)

export const useAppStore = create<AppState>((set, get) => ({
  userRole: initialUserRole,
  medicines: initialMedicines,
  pharmacies: mockPharmacies,
  elders: initialElders,
  purchaseRecords: initialPurchaseRecords,
  noticeStatuses: initialNoticeStatuses,
  familyNotices: initialFamilyNotices,

  setUserRole: (role) => {
    saveStorage(STORAGE_KEYS.userRole, role)
    set({ userRole: role })
  },

  addMedicine: (medicine) => {
    const newMed: Medicine = {
      ...medicine,
      id: `m${Date.now()}`
    }
    const newMedicines = [...get().medicines, newMed]
    saveStorage(STORAGE_KEYS.medicines, newMedicines)

    const pharmacy = get().pharmacies.find((p) => p.id === medicine.pharmacyId)
    const newRecord: PurchaseRecord = {
      id: `r${Date.now()}`,
      medicineId: newMed.id,
      ownerId: medicine.ownerId,
      pharmacyId: medicine.pharmacyId,
      pharmacyName: pharmacy?.name || '',
      quantity: medicine.lastPurchaseQuantity,
      purchaseDate: medicine.lastPurchaseDate
    }
    const newRecords = [...get().purchaseRecords, newRecord]
    saveStorage(STORAGE_KEYS.purchaseRecords, newRecords)

    const familyNotices = buildFamilyNotices(
      get().elders,
      newMedicines,
      get().pharmacies,
      get().noticeStatuses
    )
    set({ medicines: newMedicines, purchaseRecords: newRecords, familyNotices })
  },

  updateMedicine: (id, medicine) => {
    const oldMed = get().medicines.find((m) => m.id === id)
    if (!oldMed) return

    const newMedicines = get().medicines.map((m) => (m.id === id ? { ...m, ...medicine } : m))
    saveStorage(STORAGE_KEYS.medicines, newMedicines)

    const newMed = newMedicines.find((m) => m.id === id)!
    const purchaseChanged =
      (medicine.lastPurchaseDate !== undefined &&
        medicine.lastPurchaseDate !== oldMed.lastPurchaseDate) ||
      (medicine.lastPurchaseQuantity !== undefined &&
        medicine.lastPurchaseQuantity !== oldMed.lastPurchaseQuantity) ||
      (medicine.pharmacyId !== undefined && medicine.pharmacyId !== oldMed.pharmacyId)

    if (purchaseChanged) {
      const pharmacy = get().pharmacies.find((p) => p.id === newMed.pharmacyId)
      const newRecord: PurchaseRecord = {
        id: `r${Date.now()}`,
        medicineId: newMed.id,
        ownerId: newMed.ownerId,
        pharmacyId: newMed.pharmacyId,
        pharmacyName: pharmacy?.name || '',
        quantity: newMed.lastPurchaseQuantity,
        purchaseDate: newMed.lastPurchaseDate
      }
      const newRecords = [...get().purchaseRecords, newRecord]
      saveStorage(STORAGE_KEYS.purchaseRecords, newRecords)
      set({ purchaseRecords: newRecords })
    }

    const familyNotices = buildFamilyNotices(
      get().elders,
      newMedicines,
      get().pharmacies,
      get().noticeStatuses
    )
    set({ medicines: newMedicines, familyNotices })
  },

  removeMedicine: (id) => {
    const newMedicines = get().medicines.filter((m) => m.id !== id)
    saveStorage(STORAGE_KEYS.medicines, newMedicines)

    const newRecords = get().purchaseRecords.filter((r) => r.medicineId !== id)
    saveStorage(STORAGE_KEYS.purchaseRecords, newRecords)

    const newStatuses = { ...get().noticeStatuses }
    Object.keys(newStatuses).forEach((k) => {
      if (k.endsWith(`_${id}`)) delete newStatuses[k]
    })
    saveStorage(STORAGE_KEYS.noticeStatus, newStatuses)

    const familyNotices = buildFamilyNotices(
      get().elders,
      newMedicines,
      get().pharmacies,
      newStatuses
    )
    set({
      medicines: newMedicines,
      purchaseRecords: newRecords,
      noticeStatuses: newStatuses,
      familyNotices
    })
  },

  recordPurchase: (medicineId, data) => {
    const med = get().medicines.find((m) => m.id === medicineId)
    if (!med) return

    const newMedicines = get().medicines.map((m) =>
      m.id === medicineId
        ? {
            ...m,
            lastPurchaseQuantity: data.quantity,
            lastPurchaseDate: data.purchaseDate,
            pharmacyId: data.pharmacyId
          }
        : m
    )
    saveStorage(STORAGE_KEYS.medicines, newMedicines)

    const pharmacy = get().pharmacies.find((p) => p.id === data.pharmacyId)
    const newRecord: PurchaseRecord = {
      id: `r${Date.now()}`,
      medicineId,
      ownerId: med.ownerId,
      pharmacyId: data.pharmacyId,
      pharmacyName: pharmacy?.name || '',
      quantity: data.quantity,
      purchaseDate: data.purchaseDate
    }
    const newRecords = [...get().purchaseRecords, newRecord]
    saveStorage(STORAGE_KEYS.purchaseRecords, newRecords)

    const familyNotices = buildFamilyNotices(
      get().elders,
      newMedicines,
      get().pharmacies,
      get().noticeStatuses
    )
    set({ medicines: newMedicines, purchaseRecords: newRecords, familyNotices })
  },

  getPurchaseRecordsByMedicine: (medicineId) => {
    return get()
      .purchaseRecords.filter((r) => r.medicineId === medicineId)
      .sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime())
  },

  getPharmacyById: (id) => {
    return get().pharmacies.find((p) => p.id === id)
  },

  getReminders: () => {
    const { medicines, getPharmacyById } = get()
    return medicines
      .map((m) => {
        const pharmacy = getPharmacyById(m.pharmacyId)
        if (!pharmacy) return null
        return buildReminderInfo(m, pharmacy)
      })
      .filter(Boolean) as ReminderInfo[]
  },

  getLastPharmacy: () => {
    const { purchaseRecords, pharmacies } = get()
    if (purchaseRecords.length === 0) return null
    const sorted = [...purchaseRecords].sort(
      (a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime()
    )
    return pharmacies.find((p) => p.id === sorted[0].pharmacyId) || null
  },

  getLastPurchaseRecord: () => {
    const { purchaseRecords } = get()
    if (purchaseRecords.length === 0) return null
    const sorted = [...purchaseRecords].sort(
      (a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime()
    )
    return sorted[0]
  },

  updateNoticeStatus: (id, status) => {
    const newStatuses = { ...get().noticeStatuses, [id]: status }
    saveStorage(STORAGE_KEYS.noticeStatus, newStatuses)
    const familyNotices = buildFamilyNotices(
      get().elders,
      get().medicines,
      get().pharmacies,
      newStatuses
    )
    set({ noticeStatuses: newStatuses, familyNotices })
  },

  bindElder: (elder) => {
    const newElders = [...get().elders, { ...elder, id: `e${Date.now()}` }]
    saveStorage(STORAGE_KEYS.elders, newElders)
    const familyNotices = buildFamilyNotices(
      newElders,
      get().medicines,
      get().pharmacies,
      get().noticeStatuses
    )
    set({ elders: newElders, familyNotices })
  },

  removeElder: (id) => {
    const newElders = get().elders.filter((e) => e.id !== id)
    saveStorage(STORAGE_KEYS.elders, newElders)

    const newStatuses = { ...get().noticeStatuses }
    Object.keys(newStatuses).forEach((k) => {
      if (k.startsWith(`${id}_`)) delete newStatuses[k]
    })
    saveStorage(STORAGE_KEYS.noticeStatus, newStatuses)

    const familyNotices = buildFamilyNotices(
      newElders,
      get().medicines,
      get().pharmacies,
      newStatuses
    )
    set({ elders: newElders, noticeStatuses: newStatuses, familyNotices })
  },

  rebuildFamilyNotices: () => {
    const familyNotices = buildFamilyNotices(
      get().elders,
      get().medicines,
      get().pharmacies,
      get().noticeStatuses
    )
    set({ familyNotices })
  }
}))
