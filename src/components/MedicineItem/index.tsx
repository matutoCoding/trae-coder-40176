import React from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import type { Medicine, Pharmacy } from '@/types'
import { calculateRemainingDays, getReminderLevel, getLevelText, formatDate } from '@/utils/medicine'
import styles from './index.module.scss'

interface MedicineItemProps {
  medicine: Medicine
  pharmacy: Pharmacy | undefined
  onClick?: () => void
}

const MedicineItem: React.FC<MedicineItemProps> = ({ medicine, pharmacy, onClick }) => {
  const remainingDays = calculateRemainingDays(medicine)
  const level = getReminderLevel(remainingDays)

  const handleClick = () => {
    if (onClick) {
      onClick()
    } else {
      Taro.navigateTo({
        url: `/pages/medicine-edit/index?id=${medicine.id}`
      })
    }
  }

  return (
    <View className={styles.medicineItem} onClick={handleClick}>
      <View className={styles.header}>
        <Text className={styles.name}>{medicine.name}</Text>
        <Text className={classnames(styles.statusBadge, styles[level])}>
          {getLevelText(level)}
        </Text>
      </View>

      <View className={styles.infoRow}>
        <Text className={styles.label}>剩余药量</Text>
        <Text
          className={classnames(
            styles.value,
            styles.daysValue,
            level === 'green' && styles.greenValue,
            level === 'yellow' && styles.yellowValue,
            level === 'orange' && styles.orangeValue,
            level === 'red' && styles.redValue
          )}
        >
          {remainingDays} 天
        </Text>
      </View>

      <View className={styles.infoRow}>
        <Text className={styles.label}>每日用量</Text>
        <Text className={styles.value}>
          每日 {medicine.frequencyPerDay} 次，每次 {medicine.dosagePerTime} 片
        </Text>
      </View>

      <View className={styles.infoRow}>
        <Text className={styles.label}>上次购买</Text>
        <Text className={styles.value}>
          {formatDate(medicine.lastPurchaseDate)} · {medicine.lastPurchaseQuantity} 片
        </Text>
      </View>

      <View className={styles.infoRow}>
        <Text className={styles.label}>购药药店</Text>
        <Text className={styles.value}>{pharmacy?.name || '暂无记录'}</Text>
      </View>

      {medicine.notes && <View className={styles.notes}>{medicine.notes}</View>}
    </View>
  )
}

export default MedicineItem
