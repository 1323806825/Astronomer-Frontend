// 用户相关类型定义

export interface User {
  id: string  // UUID格式
  phone: string
  username: string
  avatar: string  // 头像URL
  sex: number
  note: string
  intro: string
  role: string
  following_count: number
  followed_count: number
  create_time: string
  // 个人主页额外字段
  bio?: string
  article_count?: number
  like_count?: number
  favorite_count?: number
  follower_count?: number
  is_followed?: boolean
}

export interface LoginRequest {
  phone: string
  password: string
}

export interface RegisterRequest {
  phone: string
  username: string
  password: string
  captchaId: string
  captchaVal: string
}

export interface LoginResponse {
  token: string
  user: User
}

// 通用响应类型
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

// 分页响应类型
export interface PageResponse<T> {
  items: T[]
  total: number
  page: number
  page_size: number
}
