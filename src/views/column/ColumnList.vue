<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { columnAPI } from '@/api'
import type { Column } from '@/types'
import { Document, User } from '@element-plus/icons-vue'

const router = useRouter()
const columns = ref<Column[]>([])
const loading = ref(false)

onMounted(() => {
  loadColumns()
})

const loadColumns = async () => {
  loading.value = true
  try {
    columns.value = await columnAPI.getList({ page: 1, page_size: 20 })
  } catch (error) {
    ElMessage.error('加载专栏失败')
  } finally {
    loading.value = false
  }
}

const goToColumn = (id: number) => {
  // TODO: 添加专栏详情页后启用
  // router.push({ name: 'column-detail', params: { id } })
  ElMessage.info('专栏详情页开发中')
}

const goToUser = (userId: number) => {
  router.push({ name: 'user-profile', params: { id: userId } })
}

const formatCount = (count: number) => {
  if (count >= 10000) {
    return (count / 10000).toFixed(1) + 'w'
  }
  return count.toString()
}
</script>

<template>
  <div class="columns-page">
    <div class="page-header">
      <h1>精选专栏</h1>
      <p>深度内容，系统学习</p>
    </div>

    <el-skeleton :loading="loading" :count="6" animated>
      <template #default>
        <div class="columns-grid">
          <div
            v-for="column in columns"
            :key="column.id"
            class="column-card"
            @click="goToColumn(column.id)"
          >
            <div class="column-cover">
              <img
                v-if="column.cover_image"
                :src="column.cover_image"
                :alt="column.title"
              />
              <div v-else class="default-cover">
                <el-icon :size="48">
                  <Document />
                </el-icon>
              </div>
            </div>
            <div class="column-info">
              <h3 class="column-title">{{ column.title }}</h3>
              <p class="column-desc">{{ column.description }}</p>
              <div
                class="column-author"
                @click.stop="goToUser(column.author_id)"
              >
                <img
                  v-if="column.author_avatar"
                  :src="column.author_avatar"
                  :alt="column.author_name"
                  class="author-avatar"
                />
                <div v-else class="default-avatar">
                  <el-icon><User /></el-icon>
                </div>
                <span class="author-name">{{ column.author_name }}</span>
              </div>
              <div class="column-stats">
                <span class="stat-item">
                  <el-icon><Document /></el-icon>
                  {{ column.article_count }} 篇
                </span>
                <span class="stat-item">
                  <el-icon><User /></el-icon>
                  {{ formatCount(column.subscribe_count) }} 订阅
                </span>
              </div>
            </div>
          </div>
        </div>
      </template>
    </el-skeleton>

    <div v-if="!loading && columns.length === 0" class="empty">
      <el-empty description="暂无专栏" />
    </div>
  </div>
</template>

<style scoped>
.columns-page {
  width: 100%;
}

.page-header {
  margin-bottom: 32px;
}

.page-header h1 {
  font-size: 32px;
  color: #333;
  margin-bottom: 8px;
}

.page-header p {
  font-size: 16px;
  color: #666;
}

.columns-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 24px;
}

.column-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
}

.column-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  transform: translateY(-4px);
}

.column-cover {
  width: 100%;
  height: 200px;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.column-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.default-cover {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.column-info {
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.column-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.4;
}

.column-desc {
  font-size: 14px;
  color: #666;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.5;
  flex: 1;
}

.column-author {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  border-top: 1px solid #f0f0f0;
  cursor: pointer;
}

.author-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.default-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
}

.author-name {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.column-author:hover .author-name {
  color: #409eff;
}

.column-stats {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 13px;
  color: #999;
  padding-top: 8px;
  border-top: 1px solid #f0f0f0;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.empty {
  background: white;
  padding: 80px 0;
  border-radius: 8px;
  text-align: center;
}

/* 响应式设计 */
@media (min-width: 1600px) {
  .columns-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (max-width: 1200px) {
  .columns-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 900px) {
  .columns-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .columns-grid {
    grid-template-columns: repeat(1, 1fr);
  }
}
</style>
