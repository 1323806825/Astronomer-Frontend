import api from './request'
import type { User, LoginRequest, RegisterRequest, LoginResponse, Column } from '@/types'

// 用户认证
export const authAPI = {
  // 登录
  login: (data: LoginRequest) => {
    return api.post<any, LoginResponse>('/user/login', data)
  },

  // 注册
  register: (data: RegisterRequest) => {
    return api.post<any, LoginResponse>('/user/register', data)
  },

  // 登出
  logout: () => {
    return api.post<any, void>('/user/logout')
  },

  // 获取当前用户信息
  getCurrentUser: () => {
    return api.get<any, User>('/user/current')
  }
}

// 用户管理
export const userAPI = {
  // 获取用户信息
  getInfo: (id: string) => {
    return api.get<any, User>(`/user/${id}`)
  },

  // 获取用户详细资料（用于个人主页）
  getProfile: (id: string) => {
    return api.get<any, User>(`/user/${id}`)
  },

  // 更新用户信息
  update: (data: Partial<User>) => {
    return api.put<any, void>('/user/update', data)
  },

  // 修改密码
  changePassword: (data: { old_password: string; new_password: string }) => {
    return api.post<any, void>('/user/change-password', data)
  },

  // 获取用户的专栏列表
  getColumns: (userId: string) => {
    return api.get<any, Column[]>(`/user/${userId}/columns`)
  },

  // 关注用户
  follow: (userId: string) => {
    return api.post<any, void>(`/user/${userId}/follow`)
  },

  // 取消关注
  unfollow: (userId: string) => {
    return api.delete<any, void>(`/user/${userId}/follow`)
  },

  // 获取关注列表
  getFollowing: (userId: string) => {
    return api.get<any, User[]>(`/user/${userId}/following`)
  },

  // 获取粉丝列表
  getFollowers: (userId: string) => {
    return api.get<any, User[]>(`/user/${userId}/followers`)
  }
}

// 关注功能（保留兼容性）
export const followAPI = {
  // 关注用户
  follow: (userId: string) => {
    return api.post<any, void>(`/user/${userId}/follow`)
  },

  // 取消关注
  unfollow: (userId: string) => {
    return api.delete<any, void>(`/user/${userId}/follow`)
  },

  // 获取关注列表
  getFollowing: (userId: string, params: { page?: number; page_size?: number }) => {
    return api.get<any, { users: User[]; total: number }>(`/user/${userId}/following`, { params })
  },

  // 获取粉丝列表
  getFollowers: (userId: string, params: { page?: number; page_size?: number }) => {
    return api.get<any, { users: User[]; total: number }>(`/user/${userId}/followers`, { params })
  }
}
