import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, LoginRequest, RegisterRequest } from '@/types'
import { authAPI } from '@/api'
import { ElMessage } from 'element-plus'

export const useUserStore = defineStore('user', () => {
  // 状态
  const token = ref<string>(localStorage.getItem('token') || '')
  const user = ref<User | null>(JSON.parse(localStorage.getItem('user') || 'null'))
  const isLoggedIn = computed(() => !!token.value && !!user.value)

  // 登录
  const login = async (data: LoginRequest) => {
    try {
      const res = await authAPI.login(data)

      // 先保存到localStorage
      localStorage.setItem('token', res.token)
      localStorage.setItem('user', JSON.stringify(res.user))

      // 短暂延迟，确保token被正确写入
      await new Promise(resolve => setTimeout(resolve, 300))

      // 再更新store状态（触发watch）
      token.value = res.token
      user.value = res.user

      ElMessage.success('登录成功')
      return res
    } catch (error) {
      ElMessage.error('登录失败')
      throw error
    }
  }

  // 注册
  const register = async (data: RegisterRequest) => {
    try {
      const res = await authAPI.register(data)

      // 先保存到localStorage
      localStorage.setItem('token', res.token)
      localStorage.setItem('user', JSON.stringify(res.user))

      // 等待1秒，确保token被正确写入和读取
      await new Promise(resolve => setTimeout(resolve, 1000))

      // 再更新store状态（触发watch）
      token.value = res.token
      user.value = res.user

      ElMessage.success('注册成功')
      return res
    } catch (error) {
      ElMessage.error('注册失败')
      throw error
    }
  }

  // 登出
  const logout = async () => {
    try {
      await authAPI.logout()
    } catch (error) {
      console.error('登出请求失败', error)
    } finally {
      // 清除状态和localStorage
      token.value = ''
      user.value = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      ElMessage.success('已退出登录')
    }
  }

  // 更新用户信息
  const updateUser = (newUser: User) => {
    user.value = newUser
    localStorage.setItem('user', JSON.stringify(newUser))
  }

  // 获取最新用户信息
  const fetchUserInfo = async () => {
    try {
      const userInfo = await authAPI.getCurrentUser()
      user.value = userInfo
      localStorage.setItem('user', JSON.stringify(userInfo))
      return userInfo
    } catch (error) {
      console.error('获取用户信息失败', error)
      throw error
    }
  }

  // 检查是否登录
  const checkAuth = () => {
    if (!isLoggedIn.value) {
      ElMessage.warning('请先登录')
      return false
    }
    return true
  }

  return {
    token,
    user,
    isLoggedIn,
    login,
    register,
    logout,
    updateUser,
    fetchUserInfo,
    checkAuth
  }
})
