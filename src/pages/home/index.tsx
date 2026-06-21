import React, { useMemo } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import dayjs from 'dayjs'
import classnames from 'classnames'
import { useAppStore } from '@/store'
import ReminderCard from '@/components/ReminderCard'
import BigButton from '@/components/BigButton'
import styles from './index.module.scss'

const HomePage: React.FC = () => {
  const { getReminders, getLastPharmacy, medicines } = useAppStore()

  const reminders = useMemo(() => getReminders(), [getReminders])
  const lastPharmacy = useMemo(() => getLastPharmacy(), [getLastPharmacy])

  const sortedReminders = useMemo(() => {
    const levelOrder = { red: 0, orange: 1, green: 2 }
    return [...reminders].sort((a, b) => {
      if (levelOrder[a.level] !== levelOrder[b.level]) {
        return levelOrder[a.level] - levelOrder[b.level]
      }
      return a.remainingDays - b.remainingDays
    })
  }, [reminders])

  const mostUrgent = sortedReminders[0]

  const shouldBuyTodayValue = useMemo(() => {
    if (!mostUrgent) return { text: '暂不需要', color: 'green' }
    if (mostUrgent.shouldBuyToday) {
      if (mostUrgent.level === 'red') return { text: '该补药了', color: 'red' }
      return { text: '准备补药', color: 'orange' }
    }
    return { text: '还不用', color: 'green' }
  }, [mostUrgent])

  const minDays = useMemo(() => {
    if (sortedReminders.length === 0) return { value: '—', color: 'green' }
    const days = mostUrgent.remainingDays
    if (days <= 1) return { value: `${days}天`, color: 'red' }
    if (days <= 3) return { value: `${days}天`, color: 'orange' }
    return { value: `${days}天`, color: 'green' }
  }, [sortedReminders, mostUrgent])

  const today = dayjs().format('MM月DD日 dddd')

  const goAddMedicine = () => {
    Taro.navigateTo({ url: '/pages/medicine-edit/index' })
  }

  return (
    <ScrollView scrollY className={styles.container}>
      <View className={styles.header}>
        <Text className={styles.greeting}>您好，今天是</Text>
        <Text className={styles.dateText}>{today}</Text>
      </View>

      <View className={styles.threeThings}>
        <Text className={styles.sectionTitle}>今天看这三件事</Text>
        <View className={styles.threeCards}>
          <View className={styles.thingCard}>
            <Text
              className={classnames(
                styles.thingValue,
                shouldBuyTodayValue.color === 'green' && styles.greenValue,
                shouldBuyTodayValue.color === 'orange' && styles.orangeValue,
                shouldBuyTodayValue.color === 'red' && styles.redValue
              )}
            >
              {shouldBuyTodayValue.text}
            </Text>
            <Text className={styles.thingLabel}>今天该\n不该补药</Text>
          </View>

          <View className={styles.thingCard}>
            <Text
              className={classnames(
                styles.thingValue,
                minDays.color === 'green' && styles.greenValue,
                minDays.color === 'orange' && styles.orangeValue,
                minDays.color === 'red' && styles.redValue
              )}
            >
              {minDays.value}
            </Text>
            <Text className={styles.thingLabel}>最近的药\n还剩几天</Text>
          </View>

          <View className={styles.thingCard}>
            <Text
              className={classnames(
                styles.thingValue,
                {
                  [styles.greenValue]: true
                }
              )}
              style={{ fontSize: '30rpx' }}
            >
              {lastPharmacy ? lastPharmacy.name.slice(0, 6) + '...' : '暂无'}
            </Text>
            <Text className={styles.thingLabel}>最近在哪\n家药店买</Text>
          </View>
        </View>
      </View>

      <View className={styles.remindersSection}>
        <Text className={styles.sectionTitle}>用药提醒</Text>

        {sortedReminders.length > 0 ? (
          sortedReminders.map((reminder) => (
            <ReminderCard key={reminder.medicineId} reminder={reminder} />
          ))
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>💊</Text>
            <Text className={styles.emptyText}>还没有添加药品信息</Text>
            <View className={styles.addBtnWrap}>
              <BigButton onClick={goAddMedicine}>添加药品</BigButton>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  )
}

export default HomePage
