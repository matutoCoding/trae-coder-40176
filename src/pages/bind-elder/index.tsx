import React, { useState } from 'react'
import { View, Text, Input, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import { useAppStore } from '@/store'
import BigButton from '@/components/BigButton'
import styles from './index.module.scss'

const nicknameOptions = ['爸爸', '妈妈', '爷爷', '奶奶', '外公', '外婆']

const BindElderPage: React.FC = () => {
  const { bindElder } = useAppStore()

  const [name, setName] = useState('')
  const [nickname, setNickname] = useState('爸爸')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [countdown, setCountdown] = useState(0)

  const handleSendCode = () => {
    if (!/^1\d{10}$/.test(phone)) {
      Taro.showToast({ title: '请输入正确的手机号', icon: 'none' })
      return
    }
    Taro.showToast({ title: '验证码已发送', icon: 'success' })
    setCountdown(60)
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const handleBind = () => {
    if (!name.trim()) {
      Taro.showToast({ title: '请输入老人姓名', icon: 'none' })
      return
    }
    if (!nickname) {
      Taro.showToast({ title: '请选择称呼', icon: 'none' })
      return
    }
    if (!/^1\d{10}$/.test(phone)) {
      Taro.showToast({ title: '请输入正确的手机号', icon: 'none' })
      return
    }
    if (!code || code.length < 4) {
      Taro.showToast({ title: '请输入验证码', icon: 'none' })
      return
    }

    bindElder({
      name: name.trim(),
      nickname,
      phone: phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
    })

    Taro.showToast({ title: '绑定成功', icon: 'success' })
    setTimeout(() => Taro.navigateBack(), 1000)
  }

  return (
    <View className={styles.container}>
      <View className={styles.headerCard}>
        <Text className={styles.headerTitle}>绑定家人手机号</Text>
        <Text className={styles.headerDesc}>
          绑定后，家人的药快用完时，您会收到
          <em>温和的提醒</em>
          ，就像日常照护一样，不会像促销短信那样打扰。
        </Text>
      </View>

      <View className={styles.formCard}>
        <View className={styles.formItem}>
          <Text className={styles.formLabel}>
            <Text className={styles.formRequired}>*</Text>老人姓名
          </Text>
          <Input
            className={styles.formInput}
            placeholder="请输入真实姓名"
            value={name}
            onInput={(e) => setName(e.detail.value)}
            maxlength={20}
          />
        </View>

        <View className={styles.formItem}>
          <Text className={styles.formLabel}>
            <Text className={styles.formRequired}>*</Text>您怎么称呼他/她
          </Text>
          <View className={styles.nicknameRow}>
            {nicknameOptions.map((n) => (
              <Button
                key={n}
                className={classnames(
                  styles.nicknameTag,
                  nickname === n && styles.nicknameTagActive
                )}
                onClick={() => setNickname(n)}
              >
                {n}
              </Button>
            ))}
          </View>
          <Text className={styles.formHint}>
            提醒消息会使用这个称呼，例如「爸爸的降压药快用完了」
          </Text>
        </View>

        <View className={styles.formItem}>
          <Text className={styles.formLabel}>
            <Text className={styles.formRequired}>*</Text>老人手机号
          </Text>
          <Input
            className={styles.formInput}
            type="number"
            placeholder="请输入11位手机号"
            value={phone}
            onInput={(e) => setPhone(e.detail.value)}
            maxlength={11}
          />
          <Text className={styles.formHint}>
            用于匹配老人的用药信息，不会用于其他用途
          </Text>
        </View>

        <View className={styles.formItem}>
          <Text className={styles.formLabel}>
            <Text className={styles.formRequired}>*</Text>短信验证码
          </Text>
          <View className={styles.codeRow}>
            <Input
              className={styles.codeInput}
              type="number"
              placeholder="请输入验证码"
              value={code}
              onInput={(e) => setCode(e.detail.value)}
              maxlength={6}
            />
            <Button
              className={classnames(
                styles.codeBtn,
                countdown > 0 && styles.codeBtnDisabled
              )}
              disabled={countdown > 0}
              onClick={handleSendCode}
            >
              {countdown > 0 ? `${countdown}秒后重发` : '获取验证码'}
            </Button>
          </View>
        </View>
      </View>

      <View className={styles.privacyCard}>
        <Text className={styles.privacyText}>
          <strong>🔒 隐私保护承诺</strong>
          {'\n'}
          您的家人信息仅用于用药提醒服务，不会泄露给任何第三方。您随时可以在「我的」页面解除绑定。
        </Text>
      </View>

      <View className={styles.bottomBar}>
        <BigButton onClick={handleBind}>确认绑定</BigButton>
      </View>
    </View>
  )
}

export default BindElderPage
