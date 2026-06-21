import type { Medicine, ReminderLevel, ReminderInfo, Pharmacy } from '@/types'
import dayjs from 'dayjs'

export const calculateRemainingDays = (medicine: Medicine): number => {
  const dailyTotal = medicine.frequencyPerDay * medicine.dosagePerTime
  if (dailyTotal <= 0) return 0

  const daysPassed = dayjs().diff(dayjs(medicine.lastPurchaseDate), 'day')
  const usedQuantity = daysPassed * dailyTotal
  const remaining = medicine.lastPurchaseQuantity - usedQuantity

  if (remaining <= 0) return 0
  return Math.floor(remaining / dailyTotal)
}

export const calculateRemainingQuantity = (medicine: Medicine): number => {
  const dailyTotal = medicine.frequencyPerDay * medicine.dosagePerTime
  if (dailyTotal <= 0) return 0

  const daysPassed = dayjs().diff(dayjs(medicine.lastPurchaseDate), 'day')
  const usedQuantity = daysPassed * dailyTotal
  const remaining = medicine.lastPurchaseQuantity - usedQuantity

  return Math.max(0, remaining)
}

export const getReminderLevel = (remainingDays: number): ReminderLevel => {
  if (remainingDays <= 1) return 'red'
  if (remainingDays <= 3) return 'orange'
  if (remainingDays <= 7) return 'yellow'
  return 'green'
}

export const shouldBuyToday = (remainingDays: number): boolean => {
  return remainingDays <= 7
}

export const getLevelText = (level: ReminderLevel): string => {
  const map = {
    green: '药量充足',
    yellow: '提前准备',
    orange: '记得补药',
    red: '尽快补药'
  }
  return map[level]
}

export const getLevelTipText = (level: ReminderLevel): string => {
  const map = {
    green: '药量还充足，安心服用',
    yellow: '药量开始不多了，提前准备补药',
    orange: '今天就该准备去买药啦',
    red: '药快用完了，今天就去买吧'
  }
  return map[level]
}

export const buildReminderInfo = (medicine: Medicine, pharmacy: Pharmacy): ReminderInfo => {
  const remainingDays = calculateRemainingDays(medicine)
  const remainingQuantity = calculateRemainingQuantity(medicine)
  const level = getReminderLevel(remainingDays)

  return {
    medicineId: medicine.id,
    medicineName: medicine.name,
    remainingDays,
    remainingQuantity,
    level,
    pharmacy,
    shouldBuyToday: shouldBuyToday(remainingDays)
  }
}

export const formatDate = (dateStr: string): string => {
  return dayjs(dateStr).format('YYYY年MM月DD日')
}
