import React from 'react'
import { View, Text, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import type { FamilyNotice as FamilyNoticeType } from '@/types'
import styles from './index.module.scss'

interface FamilyNoticeProps {
  notice: FamilyNoticeType
  onUpdateStatus: (id: string, status: FamilyNoticeType['status']) => void
}

const statusTextMap = {
  pending: '待处理',
  reminded: '已提醒老人',
  willBuy: '准备去买',
  needCallback: '需药店回电'
}

const FamilyNotice: React.FC<FamilyNoticeProps> = ({ notice, onUpdateStatus }) => {
  const handleRemind = () => {
    onUpdateStatus(notice.id, 'reminded')
    Taro.showToast({ title: '已标记提醒老人', icon: 'success' })
  }

  const handleBuy = () => {
    onUpdateStatus(notice.id, 'willBuy')
    Taro.navigateTo({
      url: `/pages/reminder-detail/index?medicineId=${notice.medicineId}&noticeId=${notice.id}`
    })
  }

  const handleCallback = () => {
    onUpdateStatus(notice.id, 'needCallback')
    Taro.showToast({ title: '已通知药店回电', icon: 'success' })
  }

  return (
    <View className={classnames(styles.noticeCard, styles[notice.level])}>
      <View className={styles.header}>
        <View className={styles.elderInfo}>
          <View className={styles.avatar}>{notice.elderNickname.charAt(0)}</View>
          <View className={styles.elderText}>
            <Text className={styles.elderName}>
              {notice.elderNickname}（{notice.elderName}）
            </Text>
            <Text className={styles.noticeTime}>{notice.createdTime}</Text>
          </View>
        </View>
        <Text className={classnames(styles.statusTag, styles[notice.status])}>
          {statusTextMap[notice.status]}
        </Text>
      </View>

      <View className={styles.content}>
        <Text className={styles.noticeText}>
          {notice.elderNickname}的
          <Text
            className={classnames(
              styles.highlight,
              notice.level === 'green' && styles.greenText,
              notice.level === 'yellow' && styles.yellowText,
              notice.level === 'orange' && styles.orangeText,
              notice.level === 'red' && styles.redText
            )}
          >
            {notice.medicineName}
          </Text>
          还剩
          <Text
            className={classnames(
              styles.highlight,
              notice.level === 'green' && styles.greenText,
              notice.level === 'yellow' && styles.yellowText,
              notice.level === 'orange' && styles.orangeText,
              notice.level === 'red' && styles.redText
            )}
          >
            {notice.remainingDays}天
          </Text>
          用量，记得帮忙提醒补药哦～
        </Text>
      </View>

      <View className={styles.actions}>
        <Button className={classnames(styles.actionBtn, styles.remindBtn)} onClick={handleRemind}>
          已提醒老人
        </Button>
        <Button className={classnames(styles.actionBtn, styles.buyBtn)} onClick={handleBuy}>
          周末去买
        </Button>
        <Button className={classnames(styles.actionBtn, styles.callBtn)} onClick={handleCallback}>
          需要药店回电
        </Button>
      </View>
    </View>
  )
}

export default FamilyNotice
