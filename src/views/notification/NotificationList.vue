<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationStore } from '@/stores/notification'
import { ElMessage } from 'element-plus'
import { Bell, Delete, Check } from '@element-plus/icons-vue'
import type { Notification, NotificationType, SourceType } from '@/types'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'

dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

const router = useRouter()
const notificationStore = useNotificationStore()

const loading = ref(false)
const notifications = ref<Notification[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)
const activeTab = ref<'all' | 'unread'>('all')

onMounted(() => {
  loadNotifications()
})

const loadNotifications = async () => {
  loading.value = true
  try {
    const params: any = {
      page: page.value,
      page_size: pageSize.value
    }
    if (activeTab.value === 'unread') {
      params.is_read = false
    }
    const res = await notificationStore.fetchNotifications(params)
    notifications.value = res.items || []
    total.value = res.total || 0
  } catch (error) {
    ElMessage.error('加载通知失败')
    notifications.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

const handleTabChange = () => {
  page.value = 1
  loadNotifications()
}

const handlePageChange = (newPage: number) => {
  page.value = newPage
  loadNotifications()
}

const handleMarkAsRead = async (notification: Notification) => {
  if (notification.is_read) return

  try {
    await notificationStore.markAsRead(notification.id)
    ElMessage.success('已标记为已读')
    loadNotifications()
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const handleMarkAllAsRead = async () => {
  try {
    await notificationStore.markAllAsRead()
    ElMessage.success('已全部标记为已读')
    loadNotifications()
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const handleDelete = async (notification: Notification) => {
  try {
    await notificationStore.deleteNotification(notification.id)
    ElMessage.success('已删除')
    loadNotifications()
  } catch (error) {
    ElMessage.error('删除失败')
  }
}

const handleNotificationClick = (notification: Notification) => {
  // 标记为已读
  if (!notification.is_read) {
    handleMarkAsRead(notification)
  }

  // 跳转到相关内容
  switch (notification.source_type) {
    case 1: // 文章
      router.push(`/article/${notification.source_id}`)
      break
    case 2: // 评论
      // 跳转到文章并定位到评论
      router.push(`/article/${notification.source_id}`)
      break
    case 3: // 用户
      router.push(`/user/${notification.source_id}`)
      break
  }
}

const getNotificationIcon = (type: number) => {
  switch (type) {
    case 1: return '👍' // 点赞
    case 2: return '💬' // 评论
    case 3: return '👤' // 关注
    case 4: return '🔔' // 系统通知
    default: return '📢'
  }
}

const formatTime = (time: string) => {
  return dayjs(time).fromNow()
}

const unreadCount = computed(() => {
  if (!notifications.value) return 0
  return notifications.value.filter(n => !n.is_read).length
})
</script>

<template>
  <div class="notifications-page">
    <div class="page-header">
      <h1>通知中心</h1>
      <el-button
        v-if="unreadCount > 0"
        type="primary"
        :icon="Check"
        @click="handleMarkAllAsRead"
      >
        全部标记为已读
      </el-button>
    </div>

    <el-tabs v-model="activeTab" @tab-change="handleTabChange">
      <el-tab-pane label="全部通知" name="all"></el-tab-pane>
      <el-tab-pane label="未读" name="unread">
        <template #label>
          未读
          <el-badge v-if="notificationStore.unreadCount > 0" :value="notificationStore.unreadCount" class="tab-badge" />
        </template>
      </el-tab-pane>
    </el-tabs>

    <el-skeleton :loading="loading" :rows="5" animated>
      <template #default>
        <div class="notifications-list">
          <div
            v-for="notification in notifications"
            :key="notification.id"
            :class="['notification-item', { 'is-unread': !notification.is_read }]"
            @click="handleNotificationClick(notification)"
          >
            <div class="notification-icon">
              {{ getNotificationIcon(notification.type) }}
            </div>
            <div class="notification-content">
              <div class="notification-title">{{ notification.title }}</div>
              <div class="notification-body">{{ notification.content }}</div>
              <div class="notification-time">{{ formatTime(notification.create_time) }}</div>
            </div>
            <div class="notification-actions">
              <el-button
                v-if="!notification.is_read"
                size="small"
                :icon="Check"
                @click.stop="handleMarkAsRead(notification)"
              >
                标记已读
              </el-button>
              <el-button
                size="small"
                :icon="Delete"
                @click.stop="handleDelete(notification)"
              >
                删除
              </el-button>
            </div>
          </div>

          <div v-if="notifications.length === 0 && !loading" class="empty-state">
            <el-empty description="暂无通知">
              <template #image>
                <el-icon :size="100" color="#909399"><Bell /></el-icon>
              </template>
            </el-empty>
          </div>
        </div>

        <el-pagination
          v-if="total > pageSize"
          v-model:current-page="page"
          :page-size="pageSize"
          :total="total"
          layout="prev, pager, next"
          @current-change="handlePageChange"
          class="pagination"
        />
      </template>
    </el-skeleton>
  </div>
</template>

<style scoped>
.notifications-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 28px;
  font-weight: 600;
  color: #1f2329;
  margin: 0;
}

.tab-badge {
  margin-left: 8px;
}

.notifications-list {
  background: white;
  border-radius: 12px;
  overflow: hidden;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: all 0.3s;
}

.notification-item:last-child {
  border-bottom: none;
}

.notification-item:hover {
  background: #fafafa;
}

.notification-item.is-unread {
  background: #f0f7ff;
}

.notification-item.is-unread::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: #409eff;
}

.notification-icon {
  font-size: 32px;
  line-height: 1;
  flex-shrink: 0;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2329;
  margin-bottom: 8px;
}

.notification-body {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.notification-time {
  font-size: 12px;
  color: #999;
}

.notification-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.empty-state {
  padding: 60px 20px;
  text-align: center;
}

.pagination {
  margin-top: 24px;
  display: flex;
  justify-content: center;
}

@media (max-width: 768px) {
  .notifications-page {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .page-header h1 {
    font-size: 24px;
  }

  .notification-item {
    padding: 16px;
  }

  .notification-actions {
    flex-direction: column;
  }

  .notification-actions .el-button {
    width: 100%;
  }
}
</style>
