<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import {
  HomeFilled,
  Document,
  Edit,
  EditPen,
  User,
  More,
  InfoFilled,
  Document as DocumentIcon,
  SwitchButton
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const isLoggedIn = computed(() => userStore.isLoggedIn)

const menuItems = computed(() => {
  const baseItems = [
    { path: '/', icon: HomeFilled, label: '首页' },
    { path: '/articles', icon: Document, label: '文章' }
  ]

  if (isLoggedIn.value) {
    baseItems.push({ path: '/drafts', icon: Edit, label: '我的草稿' })
    baseItems.push({ path: '/article/create', icon: EditPen, label: '发布' })
    baseItems.push({ path: `/user/${userStore.user?.id}`, icon: User, label: '我' })
  }

  return baseItems
})

const isActive = (path: string) => {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(path)
}

const handleMoreCommand = (command: string) => {
  switch (command) {
    case 'about':
      router.push('/about')
      break
    case 'terms':
      router.push('/terms')
      break
    case 'privacy':
      router.push('/privacy')
      break
    case 'logout':
      if (isLoggedIn.value) {
        userStore.logout()
        router.push('/login')
      }
      break
  }
}
</script>

<template>
  <aside class="sidebar">
    <nav class="sidebar-nav">
      <router-link
        v-for="item in menuItems"
        :key="item.path"
        :to="item.path"
        class="nav-item"
        :class="{ active: isActive(item.path) }"
      >
        <el-icon class="nav-icon" :size="20">
          <component :is="item.icon" />
        </el-icon>
        <span class="nav-label">{{ item.label }}</span>
      </router-link>
    </nav>

    <!-- 更多菜单（固定在底部） -->
    <div class="sidebar-footer">
      <el-dropdown trigger="click" placement="top-start" @command="handleMoreCommand">
        <div class="more-button">
          <el-icon class="nav-icon" :size="20">
            <More />
          </el-icon>
          <span class="nav-label">更多</span>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="about">
              <el-icon><InfoFilled /></el-icon>
              关于Astronomer
            </el-dropdown-item>
            <el-dropdown-item command="terms">
              <el-icon><DocumentIcon /></el-icon>
              用户协议
            </el-dropdown-item>
            <el-dropdown-item command="privacy">
              <el-icon><DocumentIcon /></el-icon>
              隐私政策
            </el-dropdown-item>
            <el-dropdown-item v-if="isLoggedIn" divided command="logout">
              <el-icon><SwitchButton /></el-icon>
              退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 220px;
  background: white;
  border-right: 1px solid #e4e7ed;
  position: fixed;
  left: 0;
  top: 90px; /* 顶部banner + 导航栏高度 */
  bottom: 0;
  overflow-y: auto;
  z-index: 999;
  display: flex;
  flex-direction: column;
}

.sidebar-nav {
  padding: 20px 0;
  flex: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 12px 24px;
  color: #606266;
  text-decoration: none;
  transition: all 0.3s;
  position: relative;
}

.nav-item:hover {
  background: #f5f7fa;
  color: #409eff;
}

.nav-item.active {
  color: #409eff;
  background: #ecf5ff;
}

.nav-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: #409eff;
}

.nav-icon {
  margin-right: 12px;
  flex-shrink: 0;
}

.nav-label {
  font-size: 15px;
  font-weight: 500;
}

/* 更多按钮样式 */
.sidebar-footer {
  padding: 16px 0;
  border-top: 1px solid #e4e7ed;
  margin-top: auto;
}

.more-button {
  display: flex;
  align-items: center;
  padding: 12px 24px;
  color: #606266;
  cursor: pointer;
  transition: all 0.3s;
  user-select: none;
}

.more-button:hover {
  background: #f5f7fa;
  color: #409eff;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .sidebar {
    width: 180px;
  }

  .nav-item {
    padding: 10px 16px;
  }

  .nav-label {
    font-size: 14px;
  }

  .more-button {
    padding: 10px 16px;
  }
}

@media (max-width: 768px) {
  .sidebar {
    display: none;
  }
}
</style>
