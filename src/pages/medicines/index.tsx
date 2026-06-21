import React, { useMemo } from 'react'
import { View, Text, Button, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useAppStore } from '@/store'
import MedicineItem from '@/components/MedicineItem'
import BigButton from '@/components/BigButton'
import styles from './index.module.scss'

const MedicinesPage: React.FC = () => {
  const { medicines, getPharmacyById } = useAppStore()

  const sortedMedicines = useMemo(() => {
    return [...medicines].sort((a, b) => {
      const daysA = calculateRemaining(a)
      const daysB = calculateRemaining(b)
      return daysA - daysB
    })
  }, [medicines])

  function calculateRemaining(med: {
    frequencyPerDay: number
    dosagePerTime: number
    lastPurchaseDate: string
    lastPurchaseQuantity: number
  }) {
    const dailyTotal = med.frequencyPerDay * med.dosagePerTime
    if (dailyTotal <= 0) return 0
    const daysPassed = Math.floor(
      (Date.now() - new Date(med.lastPurchaseDate).getTime()) / (1000 * 60 * 60 * 24)
    )
    const used = daysPassed * dailyTotal
    const remaining = med.lastPurchaseQuantity - used
    if (remaining <= 0) return 0
    return Math.floor(remaining / dailyTotal)
  }

  const goAdd = () => {
    Taro.navigateTo({ url: '/pages/medicine-edit/index' })
  }

  const goScan = async () => {
    try {
      const res = await Taro.scanCode({
        scanType: ['barCode', 'qrCode'],
        onlyFromCamera: false
      })
      const rawResult = res.result || ''
      let scanName = ''
      let scanQty = 0
      let scanDosage = 1
      try {
        const parsed = JSON.parse(rawResult)
        scanName = parsed.name || parsed.medicineName || ''
        scanQty = Number(parsed.quantity || parsed.lastPurchaseQuantity || 0)
        scanDosage = Number(parsed.dosagePerTime || parsed.dailyDosage || 1)
      } catch {
        if (rawResult && rawResult.length > 0) {
          scanName = rawResult
          scanQty = 30
          scanDosage = 1
        }
      }
      const params = []
      if (scanName) params.push(`scanName=${encodeURIComponent(scanName)}`)
      if (scanQty > 0) params.push(`scanQty=${scanQty}`)
      if (scanDosage > 0) params.push(`scanDosage=${scanDosage}`)
      Taro.navigateTo({
        url: `/pages/medicine-edit/index${params.length > 0 ? '?' + params.join('&') : ''}`
      })
    } catch (e) {
      console.error('[Medicines] scanCode error', e)
      Taro.showToast({ title: '扫码取消或失败', icon: 'none' })
    }
  }

  return (
    <ScrollView scrollY className={styles.container}>
      <View className={styles.header}>
        <View>
          <Text className={styles.title}>我的药品</Text>
          <Text className={styles.count}>  共 {medicines.length} 种</Text>
        </View>
        <Button className={styles.scanBtn} onClick={goScan}>
          扫码录入
        </Button>
      </View>

      {medicines.length === 0 ? (
        <View className={styles.emptyState}>
          <Text className={styles.emptyIcon}>💊</Text>
          <Text className={styles.emptyTitle}>还没有添加药品</Text>
          <Text className={styles.emptyDesc}>
            添加药品后，系统会自动提醒您{'\n'}
            什么时候该补药，再也不用担心忘买啦
          </Text>
          <View className={styles.btnRow}>
            <View className={styles.btnItem}>
              <BigButton type="secondary" onClick={goScan}>
                扫码录入
              </BigButton>
            </View>
            <View className={styles.btnItem}>
              <BigButton onClick={goAdd}>手动添加</BigButton>
            </View>
          </View>
        </View>
      ) : (
        sortedMedicines.map((medicine) => (
          <MedicineItem
            key={medicine.id}
            medicine={medicine}
            pharmacy={getPharmacyById(medicine.pharmacyId)}
          />
        ))
      )}

      {medicines.length > 0 && (
        <View className={styles.bottomBar}>
          <View className={styles.bottomBtn}>
            <BigButton type="secondary" onClick={goScan}>
              扫码录入
            </BigButton>
          </View>
          <View className={styles.bottomBtn}>
            <BigButton onClick={goAdd}>手动添加</BigButton>
          </View>
        </View>
      )}
    </ScrollView>
  )
}

export default MedicinesPage
