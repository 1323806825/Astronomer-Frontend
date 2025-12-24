<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useNotificationStore } from '@/stores/notification'
import { Search, User, Bell, Setting, SwitchButton, Edit } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()
const notificationStore = useNotificationStore()

const searchQuery = ref('')
const isLoggedIn = computed(() => userStore.isLoggedIn)
const currentUser = computed(() => userStore.user)
const unreadCount = computed(() => notificationStore.unreadCount)

// 当用户登录时，获取未读通知数量
watch(isLoggedIn, (newValue) => {
  if (newValue) {
    notificationStore.fetchUnreadCount()
  } else {
    notificationStore.clear()
  }
}, { immediate: true })

// 定时刷新未读通知数量（每30秒）
let refreshTimer: number | undefined
onMounted(() => {
  if (isLoggedIn.value) {
    notificationStore.fetchUnreadCount()
    refreshTimer = window.setInterval(() => {
      if (isLoggedIn.value) {
        notificationStore.fetchUnreadCount()
      }
    }, 30000)
  }
})

// 组件卸载时清除定时器
import { onUnmounted } from 'vue'
onUnmounted(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
  }
})

const handleCommand = (command: string) => {
  switch (command) {
    case 'profile':
      router.push(`/user/${currentUser.value?.id}`)
      break
    case 'drafts':
      router.push('/drafts')
      break
    case 'settings':
      router.push('/settings')
      break
    case 'logout':
      userStore.logout()
      router.push('/login')
      break
  }
}

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({ path: '/search', query: { q: searchQuery.value } })
  }
}

const handleNotificationClick = () => {
  router.push('/notifications')
}
</script>

<template>
  <div class="app-header">
    <!-- 顶部欢迎语 -->
    <div class="top-banner">
      <p>欢迎来到 Astronomer，分享你的知识和见解</p>
    </div>

    <!-- 主导航栏 -->
    <div class="header-content">
      <!-- Logo - 左上角 -->
      <router-link to="/" class="logo">
        <h1>Astronomer</h1>
      </router-link>

      <!-- Spacer -->
      <div class="spacer"></div>

      <!-- Search Bar -->
      <div class="search-bar">
        <el-input
          v-model="searchQuery"
          placeholder="搜索文章、用户、话题..."
          :prefix-icon="Search"
          clearable
          @keyup.enter="handleSearch"
        >
          <template #append>
            <el-button :icon="Search" @click="handleSearch" />
          </template>
        </el-input>
      </div>

      <!-- Right Actions -->
      <div class="header-actions">
        <!-- User Menu or Login -->
        <template v-if="isLoggedIn">
          <!-- Notifications -->
          <el-badge :value="unreadCount" :hidden="unreadCount === 0" class="notification-badge">
            <el-button :icon="Bell" circle @click="handleNotificationClick" />
          </el-badge>

          <!-- User Dropdown -->
          <el-dropdown trigger="click" @command="handleCommand">
            <div class="user-avatar">
              <el-avatar :src="currentUser?.avatar" :icon="User" />
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <el-icon><User /></el-icon>
                  个人主页
                </el-dropdown-item>
                <el-dropdown-item command="drafts">
                  <el-icon><Edit /></el-icon>
                  我的草稿
                </el-dropdown-item>
                <el-dropdown-item command="settings">
                  <el-icon><Setting /></el-icon>
                  设置
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>

        <template v-else>
          <el-button @click="router.push('/login')">登录</el-button>
          <el-button type="primary" @click="router.push('/register')">注册</el-button>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.app-header {
  background: white;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1001;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
}

.top-banner {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-align: center;
  padding: 8px 20px;
  font-size: 14px;
  width: 100%;
}

.top-banner p {
  margin: 0;
  font-weight: 500;
}

.header-content {
  width: 100%;
  padding: 0 48px 0 268px;
  display: flex;
  align-items: center;
  height: 60px;
  border-bottom: 1px solid #e4e7ed;
  gap: 24px;
}

.logo {
  text-decoration: none;
  position: absolute;
  left: 48px;
  top: 38px;
}

.logo h1 {
  font-size: 24px;
  font-weight: bold;
  color: #409eff;
  margin: 0;
}

.spacer {
  flex: 1;
}

.search-bar {
  width: 400px;
  max-width: 40%;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.notification-badge {
  display: flex;
  align-items: center;
}

.user-avatar {
  cursor: pointer;
  display: flex;
  align-items: center;
}

.user-avatar:hover {
  opacity: 0.8;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .header-content {
    padding: 0 24px 0 204px;
  }

  .logo {
    left: 24px;
  }

  .search-bar {
    width: 300px;
  }
}

@media (max-width: 768px) {
  .header-content {
    padding: 0 20px;
    gap: 12px;
  }

  .logo {
    position: static;
  }

  .search-bar {
    width: 200px;
    max-width: 50%;
  }

  .top-banner {
    font-size: 12px;
    padding: 6px 10px;
  }
}
</style>
