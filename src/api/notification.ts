import api from './request'
import type {
  Notification,
  NotificationListParams,
  NotificationListResponse,
  UnreadCountResponse
} from '@/types'

// 通知API
export const notificationAPI = {
  // 获取通知列表
  getList: (params?: NotificationListParams) => {
    return api.get<any, NotificationListResponse>('/notifications', { params })
  },

  // 获取未读通知数量
  getUnreadCount: () => {
    return api.get<any, UnreadCountResponse>('/notifications/unread')
  },

  // 标记单个通知为已读
  markAsRead: (id: number) => {
    return api.put<any, void>(`/notifications/${id}/read`)
  },

  // 标记所有通知为已读
  markAllAsRead: () => {
    return api.put<any, void>('/notifications/read-all')
  },

  // 删除通知
  delete: (id: number) => {
    return api.delete<any, void>(`/notifications/${id}`)
  }
}
