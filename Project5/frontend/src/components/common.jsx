import React, { useState, useEffect, useCallback } from 'react'

export function Navbar({ title, onBack, showBack = true }) {
  return (
    <div className="navbar">
      {showBack && (
        <button className="navbar-back" onClick={onBack}>
          ‹
        </button>
      )}
      <span className="navbar-title">{title}</span>
    </div>
  )
}

export function Toast({ message, visible }) {
  if (!visible) return null
  return <div className="toast">{message}</div>
}

export function useToast() {
  const [visible, setVisible] = useState(false)
  const [message, setMessage] = useState('')

  const show = useCallback((msg, duration = 2000) => {
    setMessage(msg)
    setVisible(true)
    setTimeout(() => setVisible(false), duration)
  }, [])

  const ToastComponent = () => <Toast message={message} visible={visible} />

  return { show, Toast: ToastComponent }
}

export function Dialog({ title, message, onConfirm, onCancel, visible, confirmText = '确定', cancelText = '取消' }) {
  if (!visible) return null
  return (
    <div className="overlay">
      <div className="dialog">
        {title && <div className="dialog-title">{title}</div>}
        {message && <div className="dialog-message" style={{ whiteSpace: 'pre-line' }}>{message}</div>}
        <div className="dialog-actions">
          <button className="btn btn-default btn-block" onClick={onCancel}>
            {cancelText}
          </button>
          <button className="btn btn-primary btn-block" onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export function Loading() {
  return (
    <div className="loading">
      <span>⏳ 加载中...</span>
    </div>
  )
}

export function Empty({ description = '暂无数据' }) {
  return (
    <div className="empty">
      <div className="empty-icon">📭</div>
      <div>{description}</div>
    </div>
  )
}

export function Button({ children, onClick, type = 'primary', disabled, block, style }) {
  const className = `btn btn-${type}${block ? ' btn-block' : ''}`
  return (
    <button className={className} onClick={onClick} disabled={disabled} style={style}>
      {children}
    </button>
  )
}
