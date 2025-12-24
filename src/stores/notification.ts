import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Notification } from '@/types'
import { notificationAPI } from '@/api'

export const useNotificationStore = defineStore('notification', () => {
  // 状态
  const unreadCount = ref<number>(0)
  const notifications = ref<Notification[]>([])
  const loading = ref(false)

  // 获取未读通知数量
  const fetchUnreadCount = async () => {
    try {
      const res = await notificationAPI.getUnreadCount()
      unreadCount.value = res.count
    } catch (error) {
      console.error('获取未读通知数量失败', error)
    }
  }

  // 获取通知列表
  const fetchNotifications = async (params?: any) => {
    loading.value = true
    try {
      const res = await notificationAPI.getList(params)
      notifications.value = res.items
      return res
    } catch (error) {
      console.error('获取通知列表失败', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // 标记单个通知为已读
  const markAsRead = async (id: number) => {
    try {
      await notificationAPI.markAsRead(id)
      // 更新本地状态
      const notification = notifications.value.find(n => n.id === id)
      if (notification && !notification.is_read) {
        notification.is_read = true
        unreadCount.value = Math.max(0, unreadCount.value - 1)
      }
    } catch (error) {
      console.error('标记通知已读失败', error)
      throw error
    }
  }

  // 标记所有通知为已读
  const markAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead()
      // 更新本地状态
      notifications.value.forEach(n => n.is_read = true)
      unreadCount.value = 0
    } catch (error) {
      console.error('标记所有通知已读失败', error)
      throw error
    }
  }

  // 删除通知
  const deleteNotification = async (id: number) => {
    try {
      await notificationAPI.delete(id)
      // 更新本地状态
      const index = notifications.value.findIndex(n => n.id === id)
      if (index !== -1) {
        const notification = notifications.value[index]
        if (!notification.is_read) {
          unreadCount.value = Math.max(0, unreadCount.value - 1)
        }
        notifications.value.splice(index, 1)
      }
    } catch (error) {
      console.error('删除通知失败', error)
      throw error
    }
  }

  // 清空本地数据
  const clear = () => {
    unreadCount.value = 0
    notifications.value = []
  }

  return {
    unreadCount,
    notifications,
    loading,
    fetchUnreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clear
  }
})
