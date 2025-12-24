<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { topicAPI } from '@/api'
import { useUserStore } from '@/stores/user'
import type { Topic, Article } from '@/types'
import {
  Document,
  View,
  Star,
  StarFilled,
  Clock,
  User,
  Plus,
  Check,
  TrendCharts
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const topicId = computed(() => Number(route.params.id))
const topic = ref<Topic | null>(null)
const articles = ref<Article[]>([])
const loading = ref(false)
const articlesLoading = ref(false)
const isFollowing = ref(false)
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)

const isLoggedIn = computed(() => userStore.isLoggedIn)

onMounted(() => {
  loadTopic()
  loadArticles()
})

const loadTopic = async () => {
  loading.value = true
  try {
    const response = await topicAPI.getDetail(topicId.value)
    topic.value = response.topic
    isFollowing.value = response.is_following || false
  } catch (error) {
    ElMessage.error('话题加载失败')
    router.push('/topics')
  } finally {
    loading.value = false
  }
}

const loadArticles = async () => {
  articlesLoading.value = true
  try {
    const response = await topicAPI.getArticles(topicId.value, {
      page: currentPage.value,
      page_size: pageSize.value
    })
    articles.value = response.articles
    total.value = response.total
  } catch (error) {
    ElMessage.error('文章列表加载失败')
  } finally {
    articlesLoading.value = false
  }
}

const handleFollow = async () => {
  if (!isLoggedIn.value) {
    ElMessage.warning('请先登录')
    return
  }

  try {
    if (isFollowing.value) {
      await topicAPI.unfollow(topicId.value)
      topic.value!.follow_count--
      ElMessage.success('已取消关注')
    } else {
      await topicAPI.follow(topicId.value)
      topic.value!.follow_count++
      ElMessage.success('关注成功')
    }
    isFollowing.value = !isFollowing.value
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const goToArticle = (articleId: number) => {
  router.push({ name: 'article-detail', params: { id: articleId } })
}

const goToAuthor = (userId: number) => {
  router.push({ name: 'user-profile', params: { id: userId } })
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  loadArticles()
  // 滚动到顶部
  document.querySelector('.topic-detail-page')?.scrollIntoView({ behavior: 'smooth' })
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatNumber = (num: number) => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w'
  }
  return num.toString()
}
</script>

<template>
  <div class="topic-detail-page">
    <el-skeleton :loading="loading" :rows="8" animated>
      <template #default>
        <div v-if="topic" class="topic-container">
          <!-- 话题头部 -->
          <div class="topic-header">
            <div class="topic-info">
              <div class="topic-icon">
                <el-icon><TrendCharts /></el-icon>
              </div>
              <div class="topic-content">
                <h1 class="topic-name"># {{ topic.name }}</h1>
                <p class="topic-description">{{ topic.description || '暂无简介' }}</p>

                <div class="topic-meta">
                  <div class="meta-item">
                    <el-icon><Document /></el-icon>
                    <span>{{ formatNumber(topic.article_count) }} 篇文章</span>
                  </div>
                  <div class="meta-item">
                    <el-icon><User /></el-icon>
                    <span>{{ formatNumber(topic.follow_count) }} 人关注</span>
                  </div>
                  <div class="meta-item">
                    <el-icon><View /></el-icon>
                    <span>{{ formatNumber(topic.view_count) }} 浏览</span>
                  </div>
                </div>

                <div class="topic-actions">
                  <el-button
                    :type="isFollowing ? 'default' : 'primary'"
                    size="large"
                    @click="handleFollow"
                  >
                    <el-icon v-if="isFollowing"><Check /></el-icon>
                    <el-icon v-else><Plus /></el-icon>
                    {{ isFollowing ? '已关注' : '关注话题' }}
                  </el-button>
                </div>
              </div>
            </div>
          </div>

          <!-- 文章列表 -->
          <div class="articles-section">
            <div class="section-header">
              <h2>
                <el-icon><Document /></el-icon>
                相关文章
              </h2>
            </div>

            <el-skeleton :loading="articlesLoading" :rows="5" animated>
              <template #default>
                <div class="article-list">
                  <div
                    v-for="article in articles"
                    :key="article.id"
                    class="article-item"
                    @click="goToArticle(article.id)"
                  >
                    <div class="article-main">
                      <div class="article-header">
                        <div class="author-info" @click.stop="goToAuthor(article.author_id)">
                          <el-avatar :src="article.author_avatar" :size="32">
                            <el-icon><User /></el-icon>
                          </el-avatar>
                          <span class="author-name">{{ article.author_name }}</span>
                        </div>
                        <span class="article-date">
                          <el-icon><Clock /></el-icon>
                          {{ formatDate(article.create_time) }}
                        </span>
                      </div>

                      <h3 class="article-title">{{ article.title }}</h3>
                      <p class="article-summary">{{ article.summary }}</p>

                      <div class="article-meta">
                        <span>
                          <el-icon><View /></el-icon>
                          {{ article.view_count }}
                        </span>
                        <span>
                          <el-icon><Star /></el-icon>
                          {{ article.like_count }}
                        </span>
                        <span>
                          <el-icon><Document /></el-icon>
                          {{ article.comment_count }}
                        </span>
                      </div>
                    </div>

                    <img
                      v-if="article.cover_image"
                      :src="article.cover_image"
                      alt="封面"
                      class="article-cover"
                    />
                  </div>

                  <div v-if="articles.length === 0" class="empty">
                    <el-empty description="暂无相关文章" />
                  </div>
                </div>
              </template>
            </el-skeleton>

            <!-- 分页 -->
            <el-pagination
              v-if="total > pageSize"
              v-model:current-page="currentPage"
              :page-size="pageSize"
              :total="total"
              layout="prev, pager, next"
              @current-change="handlePageChange"
              class="pagination"
            />
          </div>
        </div>
      </template>
    </el-skeleton>
  </div>
</template>

<style scoped>
.topic-detail-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 24px;
}

.topic-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.topic-header {
  background: white;
  border-radius: 12px;
  padding: 32px;
}

.topic-info {
  display: flex;
  gap: 24px;
}

.topic-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  color: white;
  font-size: 32px;
  flex-shrink: 0;
}

.topic-content {
  flex: 1;
}

.topic-name {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 12px 0;
  color: #1f2329;
}

.topic-description {
  font-size: 16px;
  line-height: 1.6;
  color: #606266;
  margin: 0 0 20px 0;
}

.topic-meta {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
  margin-bottom: 20px;
  font-size: 14px;
  color: #909399;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.topic-actions {
  display: flex;
  gap: 12px;
}

.articles-section {
  background: white;
  border-radius: 12px;
  padding: 32px;
}

.section-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.section-header h2 {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}

.article-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.article-item {
  display: flex;
  gap: 16px;
  padding: 20px;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.article-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 12px rgba(64, 158, 255, 0.1);
}

.article-main {
  flex: 1;
  min-width: 0;
}

.article-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.author-info:hover .author-name {
  color: #409eff;
}

.author-name {
  font-size: 14px;
  font-weight: 500;
  color: #606266;
  transition: color 0.3s;
}

.article-date {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #909399;
}

.article-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #1f2329;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.article-summary {
  font-size: 14px;
  line-height: 1.6;
  color: #8a8f8d;
  margin: 0 0 12px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.article-meta {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: #909399;
}

.article-meta span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.article-cover {
  width: 140px;
  height: 100px;
  object-fit: cover;
  border-radius: 6px;
  flex-shrink: 0;
}

.empty {
  padding: 60px 0;
  text-align: center;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 32px;
}

@media (max-width: 768px) {
  .topic-detail-page {
    padding: 16px;
  }

  .topic-header {
    padding: 24px 16px;
  }

  .topic-info {
    flex-direction: column;
    gap: 16px;
  }

  .topic-icon {
    width: 56px;
    height: 56px;
    font-size: 28px;
  }

  .topic-name {
    font-size: 24px;
  }

  .topic-meta {
    gap: 12px;
  }

  .topic-actions .el-button {
    width: 100%;
  }

  .articles-section {
    padding: 24px 16px;
  }

  .article-item {
    flex-direction: column;
  }

  .article-cover {
    width: 100%;
    height: 160px;
  }
}
</style>
