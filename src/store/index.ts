import { create } from 'zustand'
import type { Medicine, Pharmacy, ElderInfo, FamilyNotice, ReminderInfo } from '@/types'
import { mockMedicines, mockPharmacies, mockElders, mockFamilyNotices } from '@/data/mock'
import { buildReminderInfo } from '@/utils/medicine'

interface AppState {
  userRole: 'member' | 'family'
  medicines: Medicine[]
  pharmacies: Pharmacy[]
  elders: ElderInfo[]
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
}

export const useAppStore = create<AppState>((set, get) => ({
  userRole: 'member',
  medicines: mockMedicines,
  pharmacies: mockPharmacies,
  elders: mockElders,
  familyNotices: mockFamilyNotices,

  setUserRole: (role) => set({ userRole: role }),

  addMedicine: (medicine) =>
    set((state) => ({
      medicines: [...state.medicines, { ...medicine, id: `m${Date.now()}` }]
    })),

  updateMedicine: (id, medicine) =>
    set((state) => ({
      medicines: state.medicines.map((m) => (m.id === id ? { ...m, ...medicine } : m))
    })),

  removeMedicine: (id) =>
    set((state) => ({
      medicines: state.medicines.filter((m) => m.id !== id)
    })),

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

  updateNoticeStatus: (id, status) =>
    set((state) => ({
      familyNotices: state.familyNotices.map((n) => (n.id === id ? { ...n, status } : n))
    })),

  bindElder: (elder) =>
    set((state) => ({
      elders: [...state.elders, { ...elder, id: `e${Date.now()}` }]
    }))
}))
