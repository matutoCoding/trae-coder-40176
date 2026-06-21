import React from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import type { ReminderInfo } from '@/types'
import { getLevelText, getLevelTipText } from '@/utils/medicine'
import styles from './index.module.scss'

interface ReminderCardProps {
  reminder: ReminderInfo
  onClick?: () => void
}

const ReminderCard: React.FC<ReminderCardProps> = ({ reminder, onClick }) => {
  const handleClick = () => {
    if (onClick) {
      onClick()
    } else {
      Taro.navigateTo({
        url: `/pages/reminder-detail/index?medicineId=${reminder.medicineId}`
      })
    }
  }

  return (
    <View
      className={classnames(styles.reminderCard, styles[reminder.level])}
      onClick={handleClick}
    >
      <View className={styles.header}>
        <Text className={styles.levelTag}>{getLevelText(reminder.level)}</Text>
        <Text className={styles.medicineName}>{reminder.medicineName}</Text>
      </View>

      <View className={styles.content}>
        <Text className={styles.daysNumber}>{reminder.remainingDays}</Text>
        <View className={styles.daysLabel}>天后需要补药</View>
        <Text className={styles.tipText}>{getLevelTipText(reminder.level)}</Text>
      </View>

      <View className={styles.footer}>
        <View className={styles.pharmacyInfo}>
          <Text className={styles.pharmacyName}>{reminder.pharmacy.name}</Text>
          <Text className={styles.pharmacyHint}>上次在这里购买</Text>
        </View>
        <Text className={styles.arrowText}>查看详情 ›</Text>
      </View>
    </View>
  )
}

export default ReminderCard
