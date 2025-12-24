<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { topicAPI } from '@/api'
import type { Topic } from '@/types'
import { ChatLineSquare } from '@element-plus/icons-vue'

const router = useRouter()
const hotTopics = ref<Topic[]>([])
const loading = ref(false)

onMounted(() => {
  loadHotTopics()
})

const loadHotTopics = async () => {
  loading.value = true
  try {
    hotTopics.value = await topicAPI.getHot({ limit: 50 })
  } catch (error) {
    ElMessage.error('加载话题失败')
  } finally {
    loading.value = false
  }
}

const goToTopic = (id: number) => {
  router.push({ path: '/articles', query: { topic_id: id } })
}

const formatCount = (count: number) => {
  if (count >= 10000) {
    return (count / 10000).toFixed(1) + 'w'
  }
  return count.toString()
}
</script>

<template>
  <div class="topics-page">
    <div class="page-header">
      <h1>热门话题</h1>
      <p>发现感兴趣的话题，参与讨论</p>
    </div>

    <el-skeleton :loading="loading" :count="10" animated>
      <template #default>
        <div class="topics-grid">
          <div
            v-for="(topic, index) in hotTopics"
            :key="topic.id"
            class="topic-card"
            @click="goToTopic(topic.id)"
          >
            <div class="topic-rank" :class="{ 'top-three': index < 3 }">
              {{ index + 1 }}
            </div>
            <div class="topic-icon">
              <el-icon :size="32">
                <ChatLineSquare />
              </el-icon>
            </div>
            <div class="topic-info">
              <h3 class="topic-name"># {{ topic.name }}</h3>
              <p class="topic-desc">{{ topic.description }}</p>
              <div class="topic-stats">
                <span class="stat-item">
                  <el-icon><Document /></el-icon>
                  {{ formatCount(topic.article_count) }} 篇
                </span>
                <span class="stat-item">
                  <el-icon><User /></el-icon>
                  {{ formatCount(topic.follow_count) }} 关注
                </span>
                <span v-if="topic.hot_score" class="hot-badge">
                  🔥 {{ topic.hot_score }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </template>
    </el-skeleton>

    <div v-if="!loading && hotTopics.length === 0" class="empty">
      <el-empty description="暂无话题" />
    </div>
  </div>
</template>

<style scoped>
.topics-page {
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

.topics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 20px;
}

.topic-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: flex-start;
  gap: 16px;
  position: relative;
}

.topic-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.topic-rank {
  width: 32px;
  height: 32px;
  background: #f5f7fa;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 16px;
  color: #999;
  flex-shrink: 0;
}

.topic-rank.top-three {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.topic-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.topic-info {
  flex: 1;
  min-width: 0;
}

.topic-name {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.topic-desc {
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.5;
}

.topic-stats {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 13px;
  color: #999;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.hot-badge {
  margin-left: auto;
  padding: 2px 8px;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.empty {
  background: white;
  padding: 80px 0;
  border-radius: 8px;
  text-align: center;
}

/* 响应式设计 */
@media (min-width: 1600px) {
  .topics-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 1200px) {
  .topics-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .topics-grid {
    grid-template-columns: repeat(1, 1fr);
  }
}
</style>
