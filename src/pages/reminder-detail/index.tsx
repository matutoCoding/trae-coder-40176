import React, { useMemo } from 'react'
import { View, Text } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import classnames from 'classnames'
import { useAppStore } from '@/store'
import { getLevelText, formatDate } from '@/utils/medicine'
import BigButton from '@/components/BigButton'
import type { Medicine, ReminderLevel } from '@/types'
import styles from './index.module.scss'

const ReminderDetailPage: React.FC = () => {
  const router = useRouter()
  const medicineId = router.params.medicineId
  const { medicines, getPharmacyById, getReminders } = useAppStore()

  const medicine = useMemo(
    () => medicines.find((m) => m.id === medicineId) as Medicine | undefined,
    [medicines, medicineId]
  )

  const reminder = useMemo(() => {
    const list = getReminders()
    return list.find((r) => r.medicineId === medicineId)
  }, [getReminders, medicineId])

  const pharmacy = medicine ? getPharmacyById(medicine.pharmacyId) : undefined

  const level: ReminderLevel = reminder?.level || 'green'
  const remainingDays = reminder?.remainingDays || 0

  const callPharmacy = () => {
    if (pharmacy?.phone) {
      Taro.makePhoneCall({
        phoneNumber: pharmacy.phone.replace(/-/g, ''),
        fail: () => {
          Taro.showToast({ title: '拨号失败', icon: 'none' })
        }
      })
    }
  }

  const markBought = () => {
    Taro.showModal({
      title: '确认已买药？',
      content: '确认后系统将重新计算剩余药量',
      confirmText: '已购买',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: '已记录，感谢使用', icon: 'success' })
          setTimeout(() => Taro.navigateBack(), 1000)
        }
      }
    })
  }

  if (!medicine || !pharmacy || !reminder) {
    return (
      <View className={styles.container}>
        <Text>加载中...</Text>
      </View>
    )
  }

  return (
    <View className={styles.container}>
      <View className={classnames(styles.topCard, styles[level])}>
        <Text className={styles.levelBadge}>{getLevelText(level)}</Text>
        <Text className={styles.medicineNameBig}>{medicine.name}</Text>
        <View className={styles.daysDisplay}>
          <Text className={styles.bigNumber}>{remainingDays}</Text>
          <View className={styles.daysUnit}>天后需要补药</View>
        </View>
        <Text className={styles.tipMessage}>
          {level === 'red'
            ? '药量即将用完，请尽快前往药店购买'
            : level === 'orange'
              ? '药量不多了，近几天记得去买哦'
              : '药量还充足，记得提前准备就好'}
        </Text>
      </View>

      <View className={styles.sectionCard}>
        <View className={styles.sectionHead}>
          <Text className={styles.sectionIcon}>🏪</Text>
          <Text className={styles.sectionTitle}>购药药店</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>药店名称</Text>
          <Text className={styles.infoValue}>{pharmacy.name}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>联系电话</Text>
          <Text className={styles.infoValue}>{pharmacy.phone}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>药店地址</Text>
          <Text className={styles.infoValue}>{pharmacy.address}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>营业时间</Text>
          <Text className={styles.infoValue}>{pharmacy.businessHours}</Text>
        </View>
      </View>

      <View className={styles.sectionCard}>
        <View className={styles.sectionHead}>
          <Text className={styles.sectionIcon}>📋</Text>
          <Text className={styles.sectionTitle}>购药须知</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>是否需处方</Text>
          <Text className={styles.infoValue}>
            {pharmacy.needPrescription ? '需要处方 ' : '不需要处方'}
            {pharmacy.needPrescription && <Text className={styles.tagYes}>请携带</Text>}
          </Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>家属代买</Text>
          <Text className={styles.infoValue}>
            {pharmacy.allowFamilyPurchase ? '支持家属代买 ' : '需本人购买'}
            {pharmacy.allowFamilyPurchase && <Text className={styles.tagYes}>可以代买</Text>}
          </Text>
        </View>
        {pharmacy.notes && <View className={styles.notesBox}>温馨提示：{pharmacy.notes}</View>}
      </View>

      <View className={styles.sectionCard}>
        <View className={styles.sectionHead}>
          <Text className={styles.sectionIcon}>💊</Text>
          <Text className={styles.sectionTitle}>用药信息</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>每日用法</Text>
          <Text className={styles.infoValue}>
            每日 {medicine.frequencyPerDay} 次，每次 {medicine.dosagePerTime} 片
          </Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>上次购买</Text>
          <Text className={styles.infoValue}>
            {formatDate(medicine.lastPurchaseDate)} · {medicine.lastPurchaseQuantity} 片
          </Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>剩余约</Text>
          <Text
            className={classnames(styles.infoValue, {
              [styles.bigNumber]: false
            })}
            style={{
              color:
                level === 'red'
                  ? '#D94F4F'
                  : level === 'orange'
                    ? '#E8A838'
                    : '#2F7A68',
              fontWeight: '700',
              fontSize: '36rpx'
            }}
          >
            {remainingDays} 天用量
          </Text>
        </View>
        {medicine.notes && <View className={styles.notesBox}>{medicine.notes}</View>}
      </View>

      <View className={styles.bottomBar}>
        <View className={styles.bottomBtn}>
          <BigButton type="secondary" onClick={callPharmacy}>
            致电药店
          </BigButton>
        </View>
        <View className={styles.bottomBtn}>
          <BigButton onClick={markBought}>我已买药</BigButton>
        </View>
      </View>
    </View>
  )
}

export default ReminderDetailPage
