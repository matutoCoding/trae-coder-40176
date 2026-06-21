import React, { useState, useEffect } from 'react'
import { View, Text, Input, Button, Textarea, Picker } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import dayjs from 'dayjs'
import classnames from 'classnames'
import { useAppStore } from '@/store'
import BigButton from '@/components/BigButton'
import type { Medicine } from '@/types'
import styles from './index.module.scss'

const MedicineEditPage: React.FC = () => {
  const router = useRouter()
  const editId = router.params.id
  const isEdit = !!editId

  const { medicines, pharmacies, addMedicine, updateMedicine, removeMedicine } = useAppStore()

  const [name, setName] = useState('')
  const [frequencyPerDay, setFrequencyPerDay] = useState(1)
  const [dosagePerTime, setDosagePerTime] = useState(1)
  const [lastPurchaseQuantity, setLastPurchaseQuantity] = useState(30)
  const [lastPurchaseDate, setLastPurchaseDate] = useState(dayjs().format('YYYY-MM-DD'))
  const [pharmacyId, setPharmacyId] = useState(pharmacies[0]?.id || '')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (isEdit) {
      const medicine = medicines.find((m) => m.id === editId) as Medicine | undefined
      if (medicine) {
        setName(medicine.name)
        setFrequencyPerDay(medicine.frequencyPerDay)
        setDosagePerTime(medicine.dosagePerTime)
        setLastPurchaseQuantity(medicine.lastPurchaseQuantity)
        setLastPurchaseDate(medicine.lastPurchaseDate)
        setPharmacyId(medicine.pharmacyId)
        setNotes(medicine.notes || '')
      }
    }
  }, [isEdit, editId, medicines])

  const handleScan = () => {
    Taro.showModal({
      title: '请店员扫码录入',
      content: '请将手机交给药店店员，由店员扫描药品条码或处方单快速录入信息',
      confirmText: '好的',
      showCancel: false
    })
  }

  const handleSave = () => {
    if (!name.trim()) {
      Taro.showToast({ title: '请输入药品名称', icon: 'none' })
      return
    }
    if (!pharmacyId) {
      Taro.showToast({ title: '请选择购药药店', icon: 'none' })
      return
    }

    const data = {
      name: name.trim(),
      frequencyPerDay,
      dosagePerTime,
      dailyDosage: frequencyPerDay * dosagePerTime,
      lastPurchaseQuantity,
      lastPurchaseDate,
      pharmacyId,
      notes: notes.trim()
    }

    if (isEdit) {
      updateMedicine(editId, data)
      Taro.showToast({ title: '修改成功', icon: 'success' })
    } else {
      addMedicine(data)
      Taro.showToast({ title: '添加成功', icon: 'success' })
    }

    setTimeout(() => Taro.navigateBack(), 1000)
  }

  const handleDelete = () => {
    if (!isEdit) return
    Taro.showModal({
      title: '确认删除？',
      content: '删除后该药品的提醒将不再显示',
      confirmColor: '#D94F4F',
      success: (res) => {
        if (res.confirm) {
          removeMedicine(editId)
          Taro.showToast({ title: '已删除', icon: 'success' })
          setTimeout(() => Taro.navigateBack(), 1000)
        }
      }
    })
  }

  const frequencyOptions = [1, 2, 3, 4]

  return (
    <View className={styles.container}>
      {!isEdit && (
        <View className={styles.scanCard}>
          <Text className={styles.scanIcon}>📱</Text>
          <Text className={styles.scanTitle}>让店员扫码录入更方便</Text>
          <Text className={styles.scanDesc}>把手机交给药店店员，一扫即可录入</Text>
          <Button className={styles.scanBtn} onClick={handleScan}>
            找店员帮忙扫码
          </Button>
        </View>
      )}

      <View className={styles.tipCard}>
        <Text className={styles.tipIcon}>💡</Text>
        <Text className={styles.tipText}>
          填好信息后，系统会自动帮您算还剩几天的药，到时提醒您去买～
        </Text>
      </View>

      <View className={styles.formCard}>
        <View className={styles.formItem}>
          <Text className={styles.formLabel}>
            <Text className={styles.formRequired}>*</Text>药品名称
          </Text>
          <Input
            className={styles.formInput}
            placeholder="例如：苯磺酸氨氯地平片"
            value={name}
            onInput={(e) => setName(e.detail.value)}
            maxlength={50}
          />
        </View>

        <View className={styles.formItem}>
          <Text className={styles.formLabel}>
            <Text className={styles.formRequired}>*</Text>每天吃几次
          </Text>
          <View className={styles.frequencyRow}>
            {frequencyOptions.map((n) => (
              <Button
                key={n}
                className={classnames(
                  styles.frequencyBtn,
                  frequencyPerDay === n && styles.frequencyBtnActive
                )}
                onClick={() => setFrequencyPerDay(n)}
              >
                {n}次
              </Button>
            ))}
          </View>
        </View>

        <View className={styles.formItem}>
          <Text className={styles.formLabel}>
            <Text className={styles.formRequired}>*</Text>每次吃几片
          </Text>
          <View className={styles.dosageRow}>
            <View className={styles.dosageControl}>
              <Button
                className={styles.dosageBtn}
                onClick={() => setDosagePerTime(Math.max(1, dosagePerTime - 1))}
              >
                −
              </Button>
              <Text className={styles.dosageValue}>{dosagePerTime}</Text>
              <Button
                className={styles.dosageBtn}
                onClick={() => setDosagePerTime(Math.min(10, dosagePerTime + 1))}
              >
                +
              </Button>
            </View>
            <Text className={styles.dosageUnit}>片/粒</Text>
          </View>
        </View>

        <View className={styles.formItem}>
          <Text className={styles.formLabel}>
            <Text className={styles.formRequired}>*</Text>上次买了多少片
          </Text>
          <View className={styles.dosageRow}>
            <View className={styles.dosageControl}>
              <Button
                className={styles.dosageBtn}
                onClick={() => setLastPurchaseQuantity(Math.max(1, lastPurchaseQuantity - 5))}
              >
                −
              </Button>
              <Text className={styles.dosageValue}>{lastPurchaseQuantity}</Text>
              <Button
                className={styles.dosageBtn}
                onClick={() => setLastPurchaseQuantity(lastPurchaseQuantity + 5)}
              >
                +
              </Button>
            </View>
            <Text className={styles.dosageUnit}>片/粒</Text>
          </View>
        </View>

        <View className={styles.formItem}>
          <Text className={styles.formLabel}>
            <Text className={styles.formRequired}>*</Text>上次购买日期
          </Text>
          <Picker
            mode="date"
            value={lastPurchaseDate}
            end={dayjs().format('YYYY-MM-DD')}
            onChange={(e) => setLastPurchaseDate(e.detail.value)}
          >
            <View className={styles.pharmacySelect}>
              {dayjs(lastPurchaseDate).format('YYYY年MM月DD日')}
            </View>
          </Picker>
        </View>

        <View className={styles.formItem}>
          <Text className={styles.formLabel}>
            <Text className={styles.formRequired}>*</Text>在哪家药店买的
          </Text>
          <Picker
            mode="selector"
            range={pharmacies.map((p) => p.name)}
            value={pharmacies.findIndex((p) => p.id === pharmacyId)}
            onChange={(e) => setPharmacyId(pharmacies[Number(e.detail.value)].id)}
          >
            <View className={styles.pharmacySelect}>
              {pharmacies.find((p) => p.id === pharmacyId)?.name || '请选择药店'}
            </View>
          </Picker>
          <View className={styles.pharmacyOption}>
            下次买药时会自动推荐这家药店
          </View>
        </View>

        <View className={styles.formItem}>
          <Text className={styles.formLabel}>备注（选填）</Text>
          <Textarea
            className={styles.formTextarea}
            placeholder="例如：降压药，早餐后服用"
            value={notes}
            onInput={(e) => setNotes(e.detail.value)}
            maxlength={100}
          />
        </View>
      </View>

      {isEdit && (
        <View className={styles.deleteBtn}>
          <BigButton type="danger" onClick={handleDelete}>
            删除这个药品
          </BigButton>
        </View>
      )}

      <View className={styles.bottomBar}>
        <BigButton onClick={handleSave}>{isEdit ? '保存修改' : '保存药品'}</BigButton>
      </View>
    </View>
  )
}

export default MedicineEditPage
