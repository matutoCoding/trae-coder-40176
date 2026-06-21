import React, { useMemo } from 'react'
import { View, Text, Button, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useAppStore } from '@/store'
import MedicineItem from '@/components/MedicineItem'
import BigButton from '@/components/BigButton'
import styles from './index.module.scss'

const MedicinesPage: React.FC = () => {
  const { medicines, pharmacies, getPharmacyById } = useAppStore()

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

  const goScan = () => {
    Taro.showModal({
      title: '请店员帮忙扫码录入',
      content: '请将手机交给药店店员，由店员扫描药品条码或处方单快速录入信息',
      confirmText: '我知道了',
      showCancel: false
    })
  }

  return (
    <ScrollView scrollY className={styles.container}>
      <View className={styles.header}>
        <View>
          <Text className={styles.title}>我的药品</Text>
          <Text className={styles.count}>  共 {medicines.length} 种</Text>
        </View>
        <Button className={styles.scanBtn} onClick={goScan}>
          找店员扫码录入
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
                店员扫码
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
              店员扫码录入
            </BigButton>
          </View>
          <View className={styles.bottomBtn}>
            <BigButton onClick={goAdd}>添加药品</BigButton>
          </View>
        </View>
      )}
    </ScrollView>
  )
}

export default MedicinesPage
