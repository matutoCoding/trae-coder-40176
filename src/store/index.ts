import { create } from 'zustand'
import Taro from '@tarojs/taro'
import dayjs from 'dayjs'
import type { Medicine, Pharmacy, ElderInfo, FamilyNotice, ReminderInfo } from '@/types'
import { mockPharmacies } from '@/data/mock'
import { buildReminderInfo, calculateRemainingDays, getReminderLevel } from '@/utils/medicine'

const STORAGE_KEYS = {
  medicines: 'app_medicines',
  elders: 'app_elders',
  noticeStatus: 'app_notice_status',
  userRole: 'app_user_role'
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

function buildFamilyNotices(
  elders: ElderInfo[],
  medicines: Medicine[],
  pharmacies: Pharmacy[],
  savedStatuses: Record<string, FamilyNotice['status']>
): FamilyNotice[] {
  const notices: FamilyNotice[] = []
  for (const elder of elders) {
    for (const med of medicines) {
      const remainingDays = calculateRemainingDays(med)
      if (remainingDays > 7) continue
      const level = getReminderLevel(remainingDays)
      const noticeId = `${elder.id}_${med.id}`
      const saved = savedStatuses[noticeId]
      notices.push({
        id: noticeId,
        elderId: elder.id,
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
  noticeStatuses: Record<string, FamilyNotice['status']>
  familyNotices: FamilyNotice[]
  setUserRole: (role: 'member' | 'family') => void
  addMedicine: (medicine: Omit<Medicine, 'id'>) => void
  updateMedicine: (id: string, medicine: Partial<Medicine>) => void
  removeMedicine: (id: string) => void
  getPharmacyById: (id: string) => Pharmacy | undefined
  getReminders: () => ReminderInfo[]
  getLastPharmacy: () => Pharmacy | null
  updateNoticeStatus: (id: string, status: FamilyNotice['status']) => void
  bindElder: (elder: Omit<ElderInfo, 'id'>) => void
  removeElder: (id: string) => void
  rebuildFamilyNotices: () => void
}

const initialMedicines = loadStorage<Medicine[]>(STORAGE_KEYS.medicines, [])
const initialElders = loadStorage<ElderInfo[]>(STORAGE_KEYS.elders, [])
const initialNoticeStatuses = loadStorage<Record<string, FamilyNotice['status']>>(
  STORAGE_KEYS.noticeStatus,
  {}
)
const initialUserRole = loadStorage<'member' | 'family'>(STORAGE_KEYS.userRole, 'member')

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
  noticeStatuses: initialNoticeStatuses,
  familyNotices: initialFamilyNotices,

  setUserRole: (role) => {
    saveStorage(STORAGE_KEYS.userRole, role)
    set({ userRole: role })
  },

  addMedicine: (medicine) => {
    const newMedicines = [...get().medicines, { ...medicine, id: `m${Date.now()}` }]
    saveStorage(STORAGE_KEYS.medicines, newMedicines)
    const familyNotices = buildFamilyNotices(
      get().elders,
      newMedicines,
      get().pharmacies,
      get().noticeStatuses
    )
    set({ medicines: newMedicines, familyNotices })
  },

  updateMedicine: (id, medicine) => {
    const newMedicines = get().medicines.map((m) => (m.id === id ? { ...m, ...medicine } : m))
    saveStorage(STORAGE_KEYS.medicines, newMedicines)
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
    const newStatuses = { ...get().noticeStatuses }
    const familyNotices = buildFamilyNotices(
      get().elders,
      newMedicines,
      get().pharmacies,
      newStatuses
    )
    set({ medicines: newMedicines, familyNotices })
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
    const { medicines, pharmacies } = get()
    if (medicines.length === 0) return null
    const sorted = [...medicines].sort(
      (a, b) => new Date(b.lastPurchaseDate).getTime() - new Date(a.lastPurchaseDate).getTime()
    )
    return pharmacies.find((p) => p.id === sorted[0].pharmacyId) || null
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
    const familyNotices = buildFamilyNotices(
      newElders,
      get().medicines,
      get().pharmacies,
      get().noticeStatuses
    )
    set({ elders: newElders, familyNotices })
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
