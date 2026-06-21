import React, { useMemo } from 'react'
import { View, Text } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useAppStore } from '@/store'
import BigButton from '@/components/BigButton'
import styles from './index.module.scss'

const PharmacyDetailPage: React.FC = () => {
  const router = useRouter()
  const pharmacyId = router.params.pharmacyId

  const { getPharmacyById } = useAppStore()
  const pharmacy = useMemo(() => (pharmacyId ? getPharmacyById(pharmacyId) : undefined), [
    getPharmacyById,
    pharmacyId
  ])

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

  if (!pharmacy) {
    return (
      <View className={styles.container}>
        <Text>未找到药店信息</Text>
      </View>
    )
  }

  return (
    <View className={styles.container}>
      <View className={styles.headerCard}>
        <Text className={styles.pharmacyName}>{pharmacy.name}</Text>
        <Text className={styles.pharmacyAddress}>📍 {pharmacy.address}</Text>
        <View className={styles.tagsRow}>
          {pharmacy.needPrescription && (
            <Text className={`${styles.tag} ${styles.tagWarn}`}>需带处方</Text>
          )}
          {pharmacy.allowFamilyPurchase && (
            <Text className={`${styles.tag} ${styles.tagPrimary}`}>支持家属代买</Text>
          )}
        </View>
      </View>

      <View className={styles.sectionCard}>
        <View className={styles.sectionHead}>
          <Text className={styles.sectionIcon}>ℹ️</Text>
          <Text className={styles.sectionTitle}>药店信息</Text>
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
          <Text className={styles.infoLabel}>详细地址</Text>
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
          <Text className={styles.infoLabel}>是否带处方</Text>
          <Text className={styles.infoValue}>
            {pharmacy.needPrescription ? '需要处方 ' : '不需要处方'}
            {pharmacy.needPrescription ? (
              <Text className={styles.tagYes}>请携带</Text>
            ) : (
              <Text className={styles.tagNo}>无需</Text>
            )}
          </Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>家属代买</Text>
          <Text className={styles.infoValue}>
            {pharmacy.allowFamilyPurchase ? '支持家属代买 ' : '需本人购买'}
            {pharmacy.allowFamilyPurchase ? (
              <Text className={styles.tagYes}>可以代买</Text>
            ) : (
              <Text className={styles.tagNo}>本人到场</Text>
            )}
          </Text>
        </View>
        {pharmacy.notes && <View className={styles.notesBox}>温馨提示：{pharmacy.notes}</View>}
      </View>

      <View className={styles.bottomBar}>
        <View className={styles.bottomBtn}>
          <BigButton type="secondary" onClick={callPharmacy}>
            致电药店
          </BigButton>
        </View>
        <View className={styles.bottomBtn}>
          <BigButton onClick={() => Taro.showToast({ title: '导航功能开发中', icon: 'none' })}>
            导航到店
          </BigButton>
        </View>
      </View>
    </View>
  )
}

export default PharmacyDetailPage
