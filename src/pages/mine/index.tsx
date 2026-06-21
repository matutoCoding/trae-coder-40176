import React from 'react'
import { View, Text, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import { useAppStore } from '@/store'
import styles from './index.module.scss'

const MinePage: React.FC = () => {
  const { userRole, setUserRole, medicines, elders, familyNotices } = useAppStore()

  const handleMenuClick = (item: string) => {
    Taro.showToast({ title: `${item}功能开发中`, icon: 'none' })
  }

  const pendingNotices = familyNotices.filter((n) => n.status === 'pending').length

  return (
    <View className={styles.container}>
      <View className={styles.userHeader}>
        <View className={styles.userInfo}>
          <View className={styles.userAvatar}>
            {userRole === 'member' ? '我' : '家'}
          </View>
          <View className={styles.userDetails}>
            <Text className={styles.userName}>
              {userRole === 'member' ? '李阿姨' : '李女士'}
            </Text>
            <Text className={styles.userPhone}>138****8888</Text>
          </View>
        </View>

        <View className={styles.roleSwitch}>
          <Button
            className={classnames(styles.roleBtn, userRole === 'member' && styles.roleBtnActive)}
            onClick={() => setUserRole('member')}
          >
            我是会员
          </Button>
          <Button
            className={classnames(styles.roleBtn, userRole === 'family' && styles.roleBtnActive)}
            onClick={() => setUserRole('family')}
          >
            我是家属
          </Button>
        </View>
      </View>

      <View className={styles.statsSection}>
        <View className={styles.statItem}>
          <Text className={styles.statValue}>{medicines.length}</Text>
          <Text className={styles.statLabel}>在用药品</Text>
        </View>
        <View className={styles.divider} />
        <View className={styles.statItem}>
          <Text className={styles.statValue}>{elders.length}</Text>
          <Text className={styles.statLabel}>关注家人</Text>
        </View>
        <View className={styles.divider} />
        <View className={styles.statItem}>
          <Text className={styles.statValue}>{pendingNotices}</Text>
          <Text className={styles.statLabel}>待处理提醒</Text>
        </View>
      </View>

      <Text className={styles.sectionTitle}>常用功能</Text>
      <View className={styles.menuSection}>
        <View className={styles.menuItem} onClick={() => handleMenuClick('会员信息')}>
          <Text className={styles.menuIcon}>🎫</Text>
          <Text className={styles.menuText}>会员信息</Text>
          <Text className={styles.menuArrow}>›</Text>
        </View>
        <View className={styles.menuItem} onClick={() => handleMenuClick('购买记录')}>
          <Text className={styles.menuIcon}>📋</Text>
          <Text className={styles.menuText}>购药记录</Text>
          <Text className={styles.menuArrow}>›</Text>
        </View>
        <View
          className={styles.menuItem}
          onClick={() => Taro.navigateTo({ url: '/pages/medicine-edit/index' })}
        >
          <Text className={styles.menuIcon}>💊</Text>
          <Text className={styles.menuText}>添加药品</Text>
          <Text className={styles.menuArrow}>›</Text>
        </View>
        <View
          className={styles.menuItem}
          onClick={() => Taro.navigateTo({ url: '/pages/bind-elder/index' })}
        >
          <Text className={styles.menuIcon}>👨‍👩‍👧</Text>
          <Text className={styles.menuText}>绑定家人</Text>
          <Text className={styles.menuArrow}>›</Text>
        </View>
      </View>

      <Text className={styles.sectionTitle}>其他</Text>
      <View className={styles.menuSection}>
        <View className={styles.menuItem} onClick={() => handleMenuClick('消息通知')}>
          <Text className={styles.menuIcon}>🔔</Text>
          <Text className={styles.menuText}>消息通知设置</Text>
          <Text className={styles.menuArrow}>›</Text>
        </View>
        <View className={styles.menuItem} onClick={() => handleMenuClick('字体大小')}>
          <Text className={styles.menuIcon}>🔤</Text>
          <Text className={styles.menuText}>字体大小调整</Text>
          <Text className={styles.menuArrow}>›</Text>
        </View>
        <View className={styles.menuItem} onClick={() => handleMenuClick('帮助')}>
          <Text className={styles.menuIcon}>❓</Text>
          <Text className={styles.menuText}>使用帮助</Text>
          <Text className={styles.menuArrow}>›</Text>
        </View>
        <View className={styles.menuItem} onClick={() => handleMenuClick('关于')}>
          <Text className={styles.menuIcon}>ℹ️</Text>
          <Text className={styles.menuText}>关于我们</Text>
          <Text className={styles.menuArrow}>›</Text>
        </View>
      </View>
    </View>
  )
}

export default MinePage
