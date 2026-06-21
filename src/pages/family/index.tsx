import React, { useMemo } from 'react'
import { View, Text, Button, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useAppStore } from '@/store'
import FamilyNoticeCard from '@/components/FamilyNotice'
import BigButton from '@/components/BigButton'
import styles from './index.module.scss'

const FamilyPage: React.FC = () => {
  const { elders, familyNotices, updateNoticeStatus } = useAppStore()

  const pendingCount = useMemo(
    () => familyNotices.filter((n) => n.status === 'pending').length,
    [familyNotices]
  )

  const sortedNotices = useMemo(() => {
    const statusOrder = { pending: 0, needCallback: 1, reminded: 2, willBuy: 3 }
    return [...familyNotices].sort((a, b) => {
      if (statusOrder[a.status] !== statusOrder[b.status]) {
        return statusOrder[a.status] - statusOrder[b.status]
      }
      return new Date(b.createdTime).getTime() - new Date(a.createdTime).getTime()
    })
  }, [familyNotices])

  const goBind = () => {
    Taro.navigateTo({ url: '/pages/bind-elder/index' })
  }

  return (
    <ScrollView scrollY className={styles.container}>
      <View className={styles.header}>
        <Text className={styles.title}>家人关怀</Text>
        <Text className={styles.subtitle}>及时提醒家人补药，守护健康</Text>
      </View>

      <View className={styles.elderList}>
        <Text className={styles.sectionTitle}>我关注的家人</Text>

        {elders.length > 0 ? (
          <>
            {elders.map((elder) => {
              const elderNotices = familyNotices.filter((n) => n.elderId === elder.id)
              return (
                <View key={elder.id} className={styles.elderCard}>
                  <View className={styles.elderAvatar}>{elder.nickname.charAt(0)}</View>
                  <View className={styles.elderDetails}>
                    <Text className={styles.elderNameBig}>
                      {elder.nickname}（{elder.name}）
                    </Text>
                    <Text className={styles.elderPhone}>{elder.phone}</Text>
                    {elderNotices.filter((n) => n.status === 'pending').length > 0 && (
                      <Text className={styles.noticeCount}>
                        {elderNotices.filter((n) => n.status === 'pending').length} 条待处理
                      </Text>
                    )}
                  </View>
                </View>
              )
            })}
            <Button className={styles.bindBtn} onClick={goBind}>
              + 再绑定一位家人
            </Button>
          </>
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>👨‍👩‍👧</Text>
            <Text className={styles.emptyTitle}>还没有绑定家人</Text>
            <Text className={styles.emptyDesc}>
              绑定老人手机号后，他们的药快用完时{'\n'}
              您会收到温和提醒，就像日常照护一样
            </Text>
            <View className={styles.btnWrap}>
              <BigButton onClick={goBind}>绑定家人手机号</BigButton>
            </View>
          </View>
        )}
      </View>

      {elders.length > 0 && (
        <View className={styles.noticeSection}>
          <Text className={styles.sectionTitle}>
            用药提醒 {pendingCount > 0 && `（${pendingCount} 条待处理）`}
          </Text>
          {sortedNotices.map((notice) => (
            <FamilyNoticeCard key={notice.id} notice={notice} onUpdateStatus={updateNoticeStatus} />
          ))}
        </View>
      )}
    </ScrollView>
  )
}

export default FamilyPage
