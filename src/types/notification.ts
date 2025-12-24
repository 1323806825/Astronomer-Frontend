// 通知相关类型定义

export interface Notification {
  id: number
  user_id: string
  type: number  // 1-点赞 2-评论 3-关注 4-系统通知
  title: string
  content: string
  source_type: number  // 1-文章 2-评论 3-用户
  source_id: string
  is_read: boolean
  create_time: string
}

export interface NotificationListParams {
  page?: number
  page_size?: number
  type?: number
  is_read?: boolean
}

export interface NotificationListResponse {
  items: Notification[]
  total: number
  page: number
  page_size: number
}

export interface UnreadCountResponse {
  count: number
}

// 通知类型枚举
export enum NotificationType {
  LIKE = 1,        // 点赞
  COMMENT = 2,     // 评论
  FOLLOW = 3,      // 关注
  SYSTEM = 4       // 系统通知
}

// 来源类型枚举
export enum SourceType {
  ARTICLE = 1,     // 文章
  COMMENT = 2,     // 评论
  USER = 3         // 用户
}
