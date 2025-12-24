<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import {
  HomeFilled,
  Document,
  Edit,
  EditPen,
  User
} from '@element-plus/icons-vue'

const route = useRoute()
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
}

.sidebar-nav {
  padding: 20px 0;
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
}

@media (max-width: 768px) {
  .sidebar {
    display: none;
  }
}
</style>
