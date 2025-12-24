// 评论相关类型定义

export interface Comment {
  id: number
  target_type: number
  target_id: number
  user_id: string  // UUID格式
  username?: string
  avatar?: string
  parent_id: number
  root_id: number
  reply_to_comment_id: number
  reply_to_user_id: string  // UUID格式
  reply_to_username?: string
  content: string
  content_type: number
  images: string[]
  level: number
  like_count: number
  dislike_count: number
  reply_count: number
  is_pinned: boolean
  is_featured: boolean
  is_author: boolean
  is_liked?: boolean
  is_disliked?: boolean
  status: number
  hot_score: number
  create_time: string
  update_time: string
  replies?: Comment[]
}

export interface CommentAuthorReply {
  id: number
  comment_id: number
  author_user_id: string  // UUID格式
  content: string
  create_time: string
}

export interface CommentReport {
  id: number
  comment_id: number
  reporter_user_id: string  // UUID格式
  reporter_username?: string
  reason_type: number
  reason_desc: string
  status: number
  handle_user_id?: string  // UUID格式
  handle_result?: string
  handle_time?: string
  create_time: string
}

export interface CreateCommentRequest {
  target_type: number
  target_id: number
  content: string
  content_type?: number
  images?: string[]
  at_user_ids?: string[]  // UUID数组
}

export interface CreateReplyRequest {
  parent_id: number
  reply_to_comment_id?: number
  reply_to_user_id?: string  // UUID格式
  content: string
  content_type?: number
  images?: string[]
  at_user_ids?: string[]  // UUID数组
}

export interface ReportCommentRequest {
  comment_id: number
  reason_type: number
  reason_desc?: string
}

export interface CommentListParams {
  target_type: number
  target_id: number
  sort_by?: 'hot' | 'time' | 'like'
  page?: number
  page_size?: number
}

export interface CommentListResponse {
  comments: Comment[]
  total: number
  page: number
  page_size: number
}

export interface CommentStats {
  total_count: number
  root_count: number
  reply_count: number
  today_count: number
  avg_level: number
}

export interface UserCommentStats {
  total_comments: number
  total_likes: number
  total_replies: number
  today_comments: number
  this_week_comments: number
  this_month_comments: number
}

export interface CommentSensitiveWord {
  id: number
  word: string
  level: number
  action: number
  is_enabled: boolean
  create_time: string
}

// 枚举定义
export enum CommentTargetType {
  ARTICLE = 1,
  VIDEO = 2,
  QA = 3,
  DYNAMIC = 4
}

export enum CommentStatus {
  NORMAL = 1,
  AUDITING = 2,
  AUDIT_FAILED = 3,
  DELETED = 4,
  FOLDED = 5
}

export enum ReportReasonType {
  SPAM = 1,
  PORN = 2,
  ILLEGAL = 3,
  ATTACK = 4,
  OTHER = 5
}

export enum ReportStatus {
  PENDING = 0,
  APPROVED = 1,
  REJECTED = 2
}
