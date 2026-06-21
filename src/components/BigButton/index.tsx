import React from 'react'
import { Button } from '@tarojs/components'
import classnames from 'classnames'
import styles from './index.module.scss'

interface BigButtonProps {
  type?: 'primary' | 'secondary' | 'warning' | 'danger' | 'ghost'
  size?: 'normal' | 'small'
  disabled?: boolean
  onClick?: () => void
  children: React.ReactNode
}

const BigButton: React.FC<BigButtonProps> = ({
  type = 'primary',
  size = 'normal',
  disabled = false,
  onClick,
  children
}) => {
  return (
    <Button
      className={classnames(
        styles.bigButton,
        styles[type],
        size === 'small' && styles.small,
        disabled && styles.disabled
      )}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </Button>
  )
}

export default BigButton
